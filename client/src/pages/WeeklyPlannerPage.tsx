import { useState, useMemo, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  useLessonPlan,
  useSubjects,
  Activity,
  getWeekStartISO,
  useTimetable,
  useCalendarEvents,
  usePlannerSuggestions,
  useHolidays,
} from '../api';
import ActivitySuggestionList from '../components/ActivitySuggestionList';
import WeekCalendarGrid from '../components/WeekCalendarGrid';
import AutoFillButton from '../components/AutoFillButton';
import WeeklyMaterialsChecklist from '../components/WeeklyMaterialsChecklist';
import DownloadPrintablesButton from '../components/DownloadPrintablesButton';
import PlannerNotificationBanner from '../components/PlannerNotificationBanner';
import PlannerFilters, { loadPlannerFilters } from '../components/planner/PlannerFilters';
import { toast } from 'sonner';

export default function WeeklyPlannerPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStartISO(new Date()));
  const [preserveBuffer, setPreserveBuffer] = useState(true);
  const [skipLow, setSkipLow] = useState(true);
  const [filters, setFilters] = useState<Record<string, boolean>>(loadPlannerFilters);
  const { data: plan, refetch } = useLessonPlan(weekStart);
  const subjects = useSubjects().data ?? [];
  const { data: timetable } = useTimetable();
  const { data: events } = useCalendarEvents(
    weekStart,
    new Date(new Date(weekStart).getTime() + 6 * 86400000).toISOString(),
  );
  const { data: holidays } = useHolidays();
  const { data: suggestions } = usePlannerSuggestions(weekStart, filters);
  const weekHolidays = useMemo(() => {
    if (!holidays) return [];
    const start = new Date(weekStart);
    const end = new Date(start.getTime() + 6 * 86400000);
    return holidays.filter((h) => {
      const d = new Date(h.date);
      return d >= start && d <= end;
    });
  }, [holidays, weekStart]);
  const activities = useMemo(() => {
    const all: Record<number, Activity> = {};
    subjects.forEach((s) =>
      s.milestones.forEach((m) => m.activities.forEach((a) => (all[a.id] = a))),
    );
    return all;
  }, [subjects]);
  const [invalidDay, setInvalidDay] = useState<number | undefined>();

  const handleDrop = (day: number, activityId: number) => {
    if (!plan) return;
    const slots = timetable?.filter((t) => t.day === day && t.subjectId) ?? [];
    const used = new Set(plan.schedule.filter((s) => s.day === day).map((s) => s.slotId));
    const slot = slots.find((s) => !used.has(s.id));
    if (!slot) {
      toast.error('No available slot');
      return;
    }
    const act = activities[activityId];
    if (act?.durationMins && act.durationMins > slot.endMin - slot.startMin) {
      setInvalidDay(day);
      setTimeout(() => setInvalidDay(undefined), 1500);
      return;
    }
    const schedule = [
      ...plan.schedule,
      { id: 0, day, slotId: slot.id, activityId, activity: activities[activityId] },
    ];
    fetch(`/api/lesson-plans/${plan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule }),
    }).then(() => refetch());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const day = event.over?.data?.current?.day;
    if (typeof day === 'number') {
      handleDrop(day, Number(event.active.id));
    }
  };

  const schedule = plan?.schedule ?? [];

  useEffect(() => {
    if (new Date().getDay() === 5) {
      toast.message("It's Friday! Generate a newsletter from this week?");
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(getWeekStartISO(new Date(e.target.value)))}
          className="border p-1"
        />
        <AutoFillButton
          weekStart={weekStart}
          preserveBuffer={preserveBuffer}
          pacingStrategy={skipLow ? 'relaxed' : 'strict'}
          onGenerated={() => refetch()}
        />
      </div>
      <div className="flex gap-4 items-center">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={preserveBuffer}
            onChange={(e) => setPreserveBuffer(e.target.checked)}
          />
          Preserve daily buffer block
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={skipLow} onChange={(e) => setSkipLow(e.target.checked)} />
          Skip lowest priority activity on short weeks
        </label>
      </div>
      <PlannerNotificationBanner />
      <DndContext onDragEnd={handleDragEnd}>
        <WeekCalendarGrid
          schedule={schedule}
          activities={activities}
          timetable={timetable}
          events={events}
          holidays={weekHolidays}
          invalidDay={invalidDay}
        />
        {!plan && (
          <p data-testid="no-plan-message" className="text-sm text-gray-600">
            No plan for this week. Click Auto Fill to generate one.
          </p>
        )}
        {plan && (
          <div className="space-y-2 my-4">
            <DownloadPrintablesButton weekStart={weekStart} />
            <WeeklyMaterialsChecklist weekStart={weekStart} />
          </div>
        )}
        <PlannerFilters filters={filters} onChange={setFilters} />
        <h2>Suggestions</h2>
        <ActivitySuggestionList activities={suggestions ?? []} />
      </DndContext>
    </div>
  );
}
