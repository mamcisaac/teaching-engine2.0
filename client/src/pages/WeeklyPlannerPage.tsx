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
  WeeklyScheduleItem,
  TimetableSlot as TimetableSlotType,
} from '../types';

// No need for separate Holiday type, using CalendarEvent from types
import { PlannerSuggestions } from '../components/planner/PlannerSuggestions';
import WeekCalendarGrid from '../components/WeekCalendarGrid';
import AutoFillButton from '../components/AutoFillButton';
import WeeklyMaterialsChecklist from '../components/WeeklyMaterialsChecklist';
import DownloadPrintablesButton from '../components/DownloadPrintablesButton';
import PlannerNotificationBanner from '../components/PlannerNotificationBanner';
import PlannerFilters, { loadPlannerFilters } from '../components/planner/PlannerFilters';
import { toast } from 'sonner';

export default function WeeklyPlannerPage() {
  const [weekStart, setWeekStart] = useState(() => {
    try {
      return getWeekStartISO(new Date());
    } catch (error) {
      console.error('Error getting week start:', error);
      return new Date().toISOString().split('T')[0];
    }
  });
  const [preserveBuffer, setPreserveBuffer] = useState(true);
  const [skipLow, setSkipLow] = useState(true);
  const [filters, setFilters] = useState<Record<string, boolean>>(() => {
    try {
      return loadPlannerFilters();
    } catch (error) {
      console.error('Error loading planner filters:', error);
      return {};
    }
  });

  const {
    data: plan,
    refetch,
    isLoading: planLoading,
    error: planError,
  } = useLessonPlan(weekStart);

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useSubjects();
  const { data: timetable } = useTimetable() as { data?: TimetableSlotType[] };
  const { data: events } = useCalendarEvents(
    weekStart,
    new Date(new Date(weekStart).getTime() + 6 * 86400000).toISOString(),
  ) as { data?: CalendarEvent[] };
  // Cast holidays to CalendarEvent[] since that's what WeekCalendarGrid expects
  const { data: holidays, error: holidaysError } = useHolidays() as {
    data?: CalendarEvent[];
    error?: unknown;
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _suggestions, error: suggestionsError } = usePlannerSuggestions(weekStart, filters);

  // Handle errors gracefully
  if (planError) {
    console.error('Error loading lesson plan:', planError);
    // Don't throw error for lesson plan - it's normal to not have one initially
  }

  if (holidaysError) {
    console.error('Error loading holidays:', holidaysError);
    // Don't throw error for holidays - gracefully handle missing endpoint
  }

  // Log errors for debugging but don't crash
  if (subjectsError) {
    console.error('Error loading subjects:', subjectsError);
  }

  if (suggestionsError) {
    console.error('Error loading suggestions:', suggestionsError);
  }

  if (holidaysError) {
    console.error('Error loading holidays:', holidaysError);
  }

  // Define activities first since it's used in handleDrop
  const activities = useMemo(() => {
    const all: Record<number, Activity> = {};

    try {
      if (!subjects || !Array.isArray(subjects)) {
        return all;
      }

      subjects.forEach((subject) => {
        if (!subject?.milestones || !Array.isArray(subject.milestones)) {
          return;
        }

        subject.milestones.forEach((milestone) => {
          if (!milestone?.activities || !Array.isArray(milestone.activities)) {
            return;
          }

          milestone.activities.forEach((activity) => {
            if (activity?.id) {
              all[activity.id] = activity;
            }
          });
        });
      });

      return all;
    } catch (error) {
      console.error('Error processing activities:', error);
      return all;
    }
  }, [subjects]);

  const weekHolidays = useMemo(() => {
    try {
      // Provide a safe default if holidays are undefined or not an array
      const safeHolidays = holidays && Array.isArray(holidays) ? holidays : [];

      const start = new Date(weekStart);
      const end = new Date(start.getTime() + 6 * 86400000);

      return safeHolidays.filter((h) => {
        if (!h?.start) return false;

        try {
          const d = new Date(h.start);
          return d >= start && d <= end;
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error('Error processing holidays:', error);
      return [];
    }
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
      toast.error('Too long for this slot');
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
    try {
      if (!plan?.schedule || !Array.isArray(plan.schedule)) {
        return [];
      }

      return plan.schedule
        .map((item) => {
          if (!item) return null;
          return {
            ...item,
            activity: item.activity || null,
          };
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Error processing schedule:', error);
      return [];
    }
  }, [plan?.schedule]) as WeeklyScheduleItem[];

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

  // Show loading state while essential data is loading
  if (subjectsLoading || planLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Weekly Planner</h1>
              <p className="text-gray-600 mt-1">
                {formatDate(weekStartDate)} - {formatDate(weekEndDate)},{' '}
                {weekStartDate.getFullYear()}
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
          {/* Main Calendar - Always render grid */}
          <WeekCalendarGrid
            schedule={schedule}
            activities={activities}
            timetable={timetable}
            events={events}
            holidays={weekHolidays}
            invalidDay={invalidDay}
          />

          {/* No Plan Message - Show below grid when no plan */}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Activities</h3>
                <PlannerFilters filters={filters} onChange={setFilters} />
                <div className="mt-4">
                  <PlannerSuggestions weekStart={weekStart} />
                </div>
              </div>
            </div>
          )}
        </DndContext>
      </div>
    );
  } catch (error) {
    console.error('Error in WeeklyPlannerPage render:', error);

    // Return a fallback UI instead of throwing to prevent app crash
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Planner Error</h3>
        <p className="text-red-600 text-sm mt-1">
          Unable to render the weekly planner. Check console for details.
        </p>
        <pre className="text-xs text-red-500 mt-2 bg-red-100 p-2 rounded max-h-32 overflow-auto">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}
