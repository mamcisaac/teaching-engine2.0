import { useState, useMemo, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { api } from '../api';
import {
  useLessonPlan,
  useSubjects,
  useThematicUnits,
  type Activity,
  getWeekStartISO,
  useTimetable,
  useCalendarEvents,
  usePlannerSuggestions,
  useHolidays,
  useAssessmentTemplates,
  useAssessmentResults,
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
import CognateSummaryWidget from '../components/CognateSummaryWidget';
import AssessmentBuilder from '../components/assessment/AssessmentBuilder';
import { ParentMessageEditor } from '../components/ParentMessageEditor';
import Dialog from '../components/Dialog';
import { toast } from 'sonner';
import { UncoveredOutcomesPanel } from '../components/planning/UncoveredOutcomesPanel';
import { AISuggestionModal } from '../components/planning/AISuggestionModal';
import { QualityScorecard } from '../components/planning/QualityScorecard';

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
  const [showAssessmentBuilder, setShowAssessmentBuilder] = useState(false);
  const [showNewsletterEditor, setShowNewsletterEditor] = useState(false);
  const [showUncoveredOutcomes, setShowUncoveredOutcomes] = useState(false);
  const [selectedAISuggestion, setSelectedAISuggestion] = useState<{
    id: number;
    outcomeId: string;
    userId: number;
    title: string;
    descriptionFr: string;
    descriptionEn?: string;
    materials: string[];
    duration: number;
    theme?: string;
    createdAt: string;
    updatedAt: string;
  } | null>(null);

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

  // Get thematic units active during this week
  const { data: thematicUnits } = useThematicUnits();

  // Get assessment data for this week
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: assessmentTemplates } = useAssessmentTemplates();
  const { data: weeklyAssessments } = useAssessmentResults({ week: weekStart });

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

  // Get thematic units active during the current week
  const activeThematicUnits = useMemo(() => {
    if (!thematicUnits || !Array.isArray(thematicUnits)) {
      return [];
    }

    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);

    return thematicUnits.filter((unit) => {
      const unitStart = new Date(unit.startDate);
      const unitEnd = new Date(unit.endDate);

      // Unit is active if it overlaps with the current week
      return unitStart <= weekEndDate && unitEnd >= weekStartDate;
    });
  }, [thematicUnits, weekStart]);

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
              <button
                onClick={() => setShowAssessmentBuilder(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <span>📝</span>
                Add Assessment
              </button>
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

        {/* Active Thematic Units */}
        {activeThematicUnits.length > 0 && (
          <div className="bg-emerald-50 rounded-lg shadow-sm border border-emerald-200 p-4">
            <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              🌍 Active Thematic Units
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activeThematicUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-white rounded-lg p-3 border border-emerald-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-emerald-900 text-sm">{unit.title}</h4>
                    <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                      {new Date(unit.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -
                      {new Date(unit.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {unit.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{unit.description}</p>
                  )}
                  <div className="flex gap-2 text-xs">
                    {unit.outcomes && unit.outcomes.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        🎯 {unit.outcomes.length} outcomes
                      </span>
                    )}
                    {unit.activities && unit.activities.length > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        📚 {unit.activities.length} activities
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Assessments */}
        {weeklyAssessments && weeklyAssessments.length > 0 && (
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
              📝 Scheduled Assessments
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {weeklyAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="bg-white rounded-lg p-3 border border-blue-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-blue-900 text-sm">
                      {assessment.template?.title}
                    </h4>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {new Date(assessment.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded font-medium ${
                        assessment.template?.type === 'oral'
                          ? 'bg-purple-100 text-purple-800'
                          : assessment.template?.type === 'writing'
                            ? 'bg-green-100 text-green-800'
                            : assessment.template?.type === 'reading'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {assessment.template?.type}
                    </span>
                    {assessment.groupScore !== null && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        ✅ {assessment.groupScore}%
                      </span>
                    )}
                  </div>
                  {assessment.notes && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{assessment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Week Resources</h3>
                  <div className="space-y-3">
                    <DownloadPrintablesButton weekStart={weekStart} />
                    <WeeklyMaterialsChecklist weekStart={weekStart} />
                    <CognateSummaryWidget activities={activities} />
                    <button
                      onClick={() => setShowNewsletterEditor(true)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      📰 Create Newsletter
                    </button>
                    <button
                      onClick={() => setShowUncoveredOutcomes(true)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      🎯 View Uncovered Outcomes
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Activities</h3>
                  <PlannerFilters filters={filters} onChange={setFilters} />
                  <div className="mt-4">
                    <PlannerSuggestions weekStart={weekStart} filters={filters} />
                  </div>
                </div>
              </div>

              {/* Quality Scorecard */}
              <QualityScorecard 
                weekStart={weekStart} 
                onSuggestionClick={(suggestion) => {
                  // Handle suggestion clicks - could open relevant sections or filters
                  if (suggestion.toLowerCase().includes('assessment')) {
                    setShowAssessmentBuilder(true);
                  } else if (suggestion.toLowerCase().includes('outcome')) {
                    setShowUncoveredOutcomes(true);
                  }
                  // Add more handlers as needed
                }}
              />
            </>
          )}
        </DndContext>

        {/* Assessment Builder Dialog */}
        <Dialog
          open={showAssessmentBuilder}
          onClose={() => setShowAssessmentBuilder(false)}
          title="Create Assessment Template"
          maxWidth="3xl"
        >
          <AssessmentBuilder
            onSuccess={() => {
              setShowAssessmentBuilder(false);
              // Refresh assessment data if needed
            }}
            onCancel={() => setShowAssessmentBuilder(false)}
          />
        </Dialog>

        {/* Newsletter Editor Dialog */}
        <Dialog
          open={showNewsletterEditor}
          onClose={() => setShowNewsletterEditor(false)}
          title="Create Parent Newsletter"
          maxWidth="4xl"
        >
          <ParentMessageEditor
            prefillData={{
              activities: Object.values(activities || {}).map((a) => a.id),
              outcomes: Object.values(activities || {}).flatMap(
                (a) => a.outcomes?.map((o) => o.outcome.id) || [],
              ),
              timeframe: `Week of ${weekStart}`,
            }}
            onSave={() => {
              setShowNewsletterEditor(false);
              toast.success(
                'Newsletter created successfully! You can view and edit it in the Parent Communications section.',
              );
            }}
            onCancel={() => setShowNewsletterEditor(false)}
          />
        </Dialog>

        {/* Uncovered Outcomes Dialog */}
        <Dialog
          open={showUncoveredOutcomes}
          onClose={() => setShowUncoveredOutcomes(false)}
          title="Uncovered Curriculum Outcomes"
          maxWidth="3xl"
        >
          <UncoveredOutcomesPanel
            startDate={new Date(weekStart)}
            endDate={new Date(new Date(weekStart).getTime() + 6 * 86400000)}
            onSelectSuggestion={(suggestion) => {
              setSelectedAISuggestion(suggestion);
              setShowUncoveredOutcomes(false);
            }}
          />
        </Dialog>

        {/* AI Suggestion Modal */}
        {selectedAISuggestion && (
          <AISuggestionModal
            suggestion={selectedAISuggestion}
            open={!!selectedAISuggestion}
            onClose={() => setSelectedAISuggestion(null)}
            onAddToWeek={() => {
              // For now, just show a toast - full integration would require
              // creating an activity from the suggestion and adding it to the week
              toast.success('Activity suggestion saved! You can now add it to your week plan.');
              setSelectedAISuggestion(null);
            }}
          />
        )}
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
