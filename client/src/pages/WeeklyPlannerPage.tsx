import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useLessonPlan, useSubjects, Activity, getWeekStartISO, useTimetable } from '../api';
import ActivitySuggestionList from '../components/ActivitySuggestionList';
import WeekCalendarGrid from '../components/WeekCalendarGrid';
import AutoFillButton from '../components/AutoFillButton';
import WeeklyMaterialsChecklist from '../components/WeeklyMaterialsChecklist';
import DownloadPrintablesButton from '../components/DownloadPrintablesButton';

export default function WeeklyPlannerPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStartISO(new Date()));
  const { data: plan, refetch } = useLessonPlan(weekStart);
  const subjects = useSubjects().data ?? [];
  const { data: timetable } = useTimetable();
  const activities = useMemo(() => {
    const all: Record<number, Activity> = {};
    subjects.forEach((s) =>
      s.milestones.forEach((m) => m.activities.forEach((a) => (all[a.id] = a))),
    );
    return all;
  }, [subjects]);

  const handleDrop = (day: number, activityId: number) => {
    if (!plan) return;
    const schedule = plan.schedule.filter((s) => s.day !== day);
    schedule.push({ id: 0, day, activityId, activity: activities[activityId] });
    // naive update
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(getWeekStartISO(new Date(e.target.value)))}
          className="border p-1"
        />
        <AutoFillButton weekStart={weekStart} onGenerated={() => refetch()} />
      </div>
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
