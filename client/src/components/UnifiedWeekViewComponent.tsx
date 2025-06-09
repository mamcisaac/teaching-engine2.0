import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  useLessonPlan,
  useSubjects,
  Activity,
  getWeekStartISO,
  useTimetable,
  useGenerateNewsletter,
} from '../api';
import ActivitySuggestionList from './ActivitySuggestionList';
import WeekCalendarGrid from './WeekCalendarGrid';
import AutoFillButton from './AutoFillButton';
import WeeklyMaterialsChecklist from './WeeklyMaterialsChecklist';
import DownloadPrintablesButton from './DownloadPrintablesButton';
import PlannerNotificationBanner from './PlannerNotificationBanner';
import { toast } from 'sonner';

export default function UnifiedWeekViewComponent() {
  const [weekStart, setWeekStart] = useState(() => getWeekStartISO(new Date()));
  const { data: plan, refetch } = useLessonPlan(weekStart);
  const subjects = useSubjects().data ?? [];
  const { data: timetable } = useTimetable();
  const genNewsletter = useGenerateNewsletter();
  const [showPrompts, setShowPrompts] = useState(false);

  const activities = useMemo(() => {
    const all: Record<number, Activity> = {};
    subjects.forEach((s) =>
      s.milestones.forEach((m) => m.activities.forEach((a) => (all[a.id] = a))),
    );
    return all;
  }, [subjects]);

  const handleDrop = (day: number, activityId: number) => {
    if (!plan) return;
    const slots = timetable?.filter((t) => t.day === day && t.subjectId) ?? [];
    const used = new Set(plan.schedule.filter((s) => s.day === day).map((s) => s.slotId));
    const slot = slots.find((s) => !used.has(s.id));
    if (!slot) {
      toast.error('No available slot');
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

  const handleGenerated = () => {
    refetch();
    setShowPrompts(true);
  };

  const createNewsletter = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    genNewsletter.mutate(
      { startDate: weekStart, endDate: getWeekStartISO(end) },
      { onSuccess: () => toast.success('Newsletter draft created') },
    );
  };

  const schedule = plan?.schedule ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(getWeekStartISO(new Date(e.target.value)))}
          className="border p-1"
        />
        <AutoFillButton weekStart={weekStart} onGenerated={handleGenerated} />
      </div>
      {showPrompts && (
        <div className="bg-blue-50 p-2 flex gap-2 items-center text-sm">
          <span>Next steps:</span>
          <button className="px-2 py-1 bg-blue-600 text-white" onClick={createNewsletter}>
            Generate Newsletter
          </button>
          <DownloadPrintablesButton weekStart={weekStart} />
        </div>
      )}
      <PlannerNotificationBanner />
      <DndContext onDragEnd={handleDragEnd}>
        <WeekCalendarGrid schedule={schedule} activities={activities} timetable={timetable} />
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
        <h2>Suggestions</h2>
        <ActivitySuggestionList activities={Object.values(activities)} />
      </DndContext>
    </div>
  );
}
