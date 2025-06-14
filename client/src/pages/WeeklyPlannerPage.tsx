import { useState, useMemo, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { api } from '../api';
import {
  useLessonPlan,
  useSubjects,
  type Activity,
  getWeekStartISO,
  useTimetable,
  useCalendarEvents,
  usePlannerSuggestions,
  useHolidays,
} from '../api';
import type {
  CalendarEvent,
  LessonPlan as LessonPlanType,
  WeeklyScheduleItem,
  TimetableSlot as TimetableSlotType,
} from '../types';

// No need for separate Holiday type, using CalendarEvent from types
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
  const { data: plan, refetch } = useLessonPlan(weekStart) as {
    data?: LessonPlanType;
    refetch: () => void;
  };
  const subjects = useSubjects().data ?? [];
  console.log('Subjects from useSubjects:', subjects);
  const { data: timetable } = useTimetable() as { data?: TimetableSlotType[] };
  const { data: events } = useCalendarEvents(
    weekStart,
    new Date(new Date(weekStart).getTime() + 6 * 86400000).toISOString(),
  ) as { data?: CalendarEvent[] };
  // Cast holidays to CalendarEvent[] since that's what WeekCalendarGrid expects
  const { data: holidays } = useHolidays() as { data?: CalendarEvent[] };
  const { data: suggestions } = usePlannerSuggestions(weekStart, filters);

  // Define activities first since it's used in handleDrop
  const activities = useMemo(() => {
    const all: Record<number, Activity> = {};
    subjects.forEach((subject: { milestones: Array<{ activities: Activity[] }> }) =>
      subject.milestones.forEach((milestone: { activities: Activity[] }) =>
        milestone.activities.forEach((activity: Activity) => (all[activity.id] = activity)),
      ),
    );
    return all;
  }, [subjects]);

  const weekHolidays = useMemo(() => {
    if (!holidays) return [];
    const start = new Date(weekStart);
    const end = new Date(start.getTime() + 6 * 86400000);
    return holidays.filter((h) => {
      const d = new Date(h.start);
      return d >= start && d <= end;
    });
  }, [holidays, weekStart]);

  const [invalidDay, setInvalidDay] = useState<number | undefined>();

  const handleDrop = (day: number, activityId: number) => {
    if (!plan?.schedule) return;

    // Type assertion for schedule item
    type ScheduleItem = WeeklyScheduleItem & { activityId?: number };
    // eslint-disable-next-line no-console
    console.log('handleDrop called with:', { day, activityId });

    if (!plan) return;

    const activity = activities[activityId];
    if (!activity) {
      console.error('Activity not found:', activityId, 'Available activities:', activities);
      toast.error('Activity not found');
      return;
    }

    console.log('Found activity:', activity);

    // Find matching time slots for the activity's subject
    const subjectId = activity.milestone?.subjectId;
    if (!subjectId) {
      console.error('No subject ID found for activity:', activity);
      toast.error('Activity is not associated with a subject');
      return;
    }
    console.log('Subject ID:', subjectId);

    const matchingSlots =
      timetable?.filter((t) => t.day === day && t.subjectId === subjectId) ?? [];
    console.log('Matching slots:', matchingSlots);

    if (matchingSlots.length === 0) {
      console.error(
        'No matching time slots found for subject:',
        subjectId,
        'All time slots:',
        timetable,
      );
      setInvalidDay(day);
      setTimeout(() => setInvalidDay(undefined), 1500);
      toast.error('No time slots available for this subject');
      return;
    }

    // Find the first available slot that's not already used
    const usedSlotIds = new Set(
      plan.schedule
        .filter((scheduleItem: { day: number }) => scheduleItem.day === day)
        .map((scheduleItem: { slotId: number }) => scheduleItem.slotId),
    );
    console.log('Used slot IDs for day', day, ':', usedSlotIds);

    const availableSlot = matchingSlots.find((s) => !usedSlotIds.has(s.id));
    console.log('Available slot:', availableSlot);

    if (!availableSlot) {
      console.error('No available slots for day:', day, 'Used slots:', usedSlotIds);
      setInvalidDay(day);
      setTimeout(() => setInvalidDay(undefined), 1500);
      toast.error('No available time slots for this day');
      return;
    }

    // Check activity duration fits in the slot
    const slotDuration = availableSlot.endMin - availableSlot.startMin;
    console.log('Slot duration:', slotDuration, 'Activity duration:', activity.durationMins);

    if (activity.durationMins && activity.durationMins > slotDuration) {
      console.error('Activity too long for slot');
      setInvalidDay(day);
      setTimeout(() => setInvalidDay(undefined), 1500);
      toast.error('Activity is too long for this time slot');
      return;
    }

    // Create the updated schedule with only the required fields
    const updatedSchedule = [
      ...plan.schedule.map((item: ScheduleItem) => ({
        id: item.id,
        day: item.day,
        slotId: item.slotId,
        activityId: item.activityId,
      })),
      {
        day,
        slotId: availableSlot.id,
        activityId: activity.id,
      },
    ];

    console.log('Updating schedule with:', {
      planId: plan.id,
      schedule: updatedSchedule,
      request: {
        url: `/api/lesson-plans/${plan.id}`,
        method: 'PUT',
        data: { schedule: updatedSchedule },
      },
    });

    // Send the update to the server using the api client
    api
      .put(`/api/lesson-plans/${plan.id}`, { schedule: updatedSchedule })
      .then((response) => {
        console.log('Update successful:', response.data);
        toast.success('Schedule updated successfully');
        return refetch();
      })
      .then(() => {
        console.log('Data refetched successfully');
      })
      .catch((error: unknown) => {
        // Log error in development
        if (import.meta.env.DEV) {
          console.error('Error updating schedule:', error);
        }

        // Show user-friendly error message
        toast.error('Failed to update schedule. Please try again.');
      });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const day = event.over?.data?.current?.day as number | undefined;
    if (typeof day === 'number' && event.active?.id) {
      handleDrop(day, Number(event.active.id));
    }
  };

  // Transform schedule items to include activity data for WeekCalendarGrid
  const schedule = useMemo(() => {
    if (!plan?.schedule) return [];
    return plan.schedule.map((item) => ({
      ...item,
      activity: item.activityId ? activities[item.activityId] : null,
    }));
  }, [plan?.schedule, activities]) as WeeklyScheduleItem[];

  useEffect(() => {
    if (new Date().getDay() === 5) {
      toast("It's Friday! Generate a newsletter from this week?");
    }
  }, []);

  // Format week display
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekStartDate.getTime() + 4 * 86400000); // Add 4 days (Mon-Fri)
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Planner</h1>
            <p className="text-gray-600 mt-1">
              {formatDate(weekStartDate)} - {formatDate(weekEndDate)}, {weekStartDate.getFullYear()}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(getWeekStartISO(new Date(e.target.value)))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              data-testid="week-start-input"
            />
            <AutoFillButton
              weekStart={weekStart}
              preserveBuffer={preserveBuffer}
              pacingStrategy={skipLow ? 'relaxed' : 'strict'}
              onGenerated={() => refetch()}
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-6 items-center text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={preserveBuffer}
              onChange={(e) => setPreserveBuffer(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700">Preserve daily buffer block</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={skipLow}
              onChange={(e) => setSkipLow(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700">Skip lowest priority activity on short weeks</span>
          </label>
        </div>
      </div>

      <PlannerNotificationBanner />

      <DndContext onDragEnd={handleDragEnd}>
        {/* Main Calendar */}
        <WeekCalendarGrid
          schedule={schedule}
          activities={activities}
          timetable={timetable}
          events={events}
          holidays={weekHolidays}
          invalidDay={invalidDay}
        />

        {/* No Plan Message */}
        {!plan && (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No plan available for this week
            </h3>
            <p className="text-gray-600 mb-4">
              Generate a lesson plan to start scheduling activities
            </p>
            <AutoFillButton
              weekStart={weekStart}
              preserveBuffer={preserveBuffer}
              pacingStrategy={skipLow ? 'relaxed' : 'strict'}
              onGenerated={() => refetch()}
            />
          </div>
        )}

        {/* Week Resources */}
        {plan && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Week Resources</h3>
              <div className="space-y-3">
                <DownloadPrintablesButton weekStart={weekStart} />
                <WeeklyMaterialsChecklist weekStart={weekStart} />
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Suggestions</h3>
              <PlannerFilters filters={filters} onChange={setFilters} />
              <div className="mt-4">
                <ActivitySuggestionList activities={suggestions ?? []} />
              </div>
            </div>
          </div>
        )}
      </DndContext>
    </div>
  );
}
