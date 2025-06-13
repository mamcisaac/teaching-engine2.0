import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import {
  api,
  useLessonPlan,
  useSubjects,
  Activity,
  getWeekStartISO,
  useTimetable,
  useGenerateNewsletter,
} from '../api';
import { AxiosError } from 'axios';
import ActivitySuggestionList from './ActivitySuggestionList';
import WeekCalendarGrid from './WeekCalendarGrid';
import AutoFillButton from './AutoFillButton';
import WeeklyMaterialsChecklist from './WeeklyMaterialsChecklist';
import DownloadPrintablesButton from './DownloadPrintablesButton';
import PlannerNotificationBanner from './PlannerNotificationBanner';
import { toast } from 'sonner';

export default function UnifiedWeekViewComponent() {
  const [weekStart, setWeekStart] = useState(() => getWeekStartISO(new Date()));
  const [preserveBuffer, setPreserveBuffer] = useState(true);
  const [skipLow, setSkipLow] = useState(true);
  const { data: plan, refetch } = useLessonPlan(weekStart);
  const { data: subjectsData, error: subjectsError } = useSubjects();
  const subjects = Array.isArray(subjectsData) ? subjectsData : [];

  // Log any errors for debugging
  if (subjectsError) {
    console.error('Error loading subjects:', subjectsError);
  }
  const { data: timetableData, error: timetableError } = useTimetable();
  const timetable = Array.isArray(timetableData) ? timetableData : [];

  // Log any errors for debugging
  if (timetableError) {
    console.error('Error loading timetable:', timetableError);
  }
  const genNewsletter = useGenerateNewsletter();
  const [showPrompts, setShowPrompts] = useState(false);
  const [invalidDay, setInvalidDay] = useState<number | undefined>();

  const activities = useMemo(() => {
    const all: Record<number, Activity> = {};

    // Safely handle the case where subjects or their nested properties are not arrays
    if (Array.isArray(subjects)) {
      subjects.forEach((s) => {
        if (s?.milestones && Array.isArray(s.milestones)) {
          s.milestones.forEach((m) => {
            if (m?.activities && Array.isArray(m.activities)) {
              m.activities.forEach((a) => a?.id && (all[a.id] = a));
            }
          });
        }
      });
    }

    return all;
  }, [subjects]);

  const handleDrop = (day: number, activityId: number) => {
    if (!plan) {
      toast.error('Lesson plan not loaded.');
      return;
    }
    if (!timetable) {
      toast.error('Timetable not loaded.');
      return;
    }
    if (!plan.schedule) {
      toast.error('Lesson plan schedule not loaded.');
      return;
    }

    // DEBUG LOGGING
    console.log('handleDrop called:', { day, activityId });
    console.log('timetable:', timetable);
    const slots = timetable.filter((t) => t.day === day) ?? [];
    console.log('slots for day', day, ':', slots);
    const used = new Set(plan.schedule.filter((s) => s.day === day).map((s) => s.slotId));
    console.log('used slotIds:', Array.from(used));
    let slot = slots.find((s) => !used.has(s.id));
    // If all slots are used, allow swapping: pick the first slot of the day
    if (!slot && slots.length > 0) {
      slot = slots[0];
    }
    console.log('chosen slot:', slot);
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
    // Remove any existing activity from this slot (if swapping)
    const schedule = plan.schedule
      .filter((item) => !(item.day === day && item.slotId === slot.id))
      .map((item) => ({
        day: item.day,
        slotId: item.slotId,
        activityId: item.activityId,
      }));
    schedule.push({ day, slotId: slot.id, activityId });
    console.log('new schedule to send:', schedule);
    api
      .put(`/api/lesson-plans/${plan.id}`, { schedule })
      .then(() => {
        toast.success('Schedule updated!');
        refetch();
      })
      .catch((err: AxiosError<{ message: string }>) => {
        console.error('Failed to update lesson plan', err);
        toast.error(err.response?.data?.message || 'Failed to update schedule.');
      });
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
      {
        weekStart: weekStart,
        weekEnd: getWeekStartISO(end),
        subject: `Weekly Update - ${weekStart}`,
        highlights: [],
      },
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
        <AutoFillButton
          weekStart={weekStart}
          preserveBuffer={preserveBuffer}
          pacingStrategy={skipLow ? 'relaxed' : 'strict'}
          onGenerated={handleGenerated}
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
        <WeekCalendarGrid
          schedule={schedule}
          activities={activities}
          timetable={timetable}
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
        <h2>Suggestions</h2>
        <ActivitySuggestionList activities={Object.values(activities)} />
      </DndContext>
    </div>
  );
}
