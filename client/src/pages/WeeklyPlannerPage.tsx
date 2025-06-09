import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useLessonPlan, useSubjects, Activity } from '../api';
import ActivitySuggestionList from '../components/ActivitySuggestionList';
import WeekCalendarGrid from '../components/WeekCalendarGrid';
import AutoFillButton from '../components/AutoFillButton';

export default function WeeklyPlannerPage() {
  const [weekStart, setWeekStart] = useState(() => new Date().toISOString());
  const { data: plan, refetch } = useLessonPlan(weekStart);
  const subjects = useSubjects().data ?? [];
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={weekStart.split('T')[0]}
          onChange={(e) => setWeekStart(new Date(e.target.value).toISOString())}
          className="border p-1"
        />
        <AutoFillButton weekStart={weekStart} onGenerated={() => refetch()} />
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        {plan && <WeekCalendarGrid schedule={plan.schedule} activities={activities} />}
        <h2>Suggestions</h2>
        <ActivitySuggestionList activities={Object.values(activities)} />
      </DndContext>
    </div>
  );
}
