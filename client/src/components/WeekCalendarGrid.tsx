import type { WeeklyScheduleItem, Activity, TimetableSlot, CalendarEvent } from '../api';
import { useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import OutcomeTag from './OutcomeTag';
import Dialog from './Dialog';
import OutcomeSelect from './OutcomeSelect';
import { useUpdateActivity } from '../api';

interface Props {
  schedule: WeeklyScheduleItem[];
  activities: Record<number, Activity>;
  timetable?: TimetableSlot[];
  events?: CalendarEvent[];
  holidays?: CalendarEvent[];
  invalidDay?: number;
}

interface ActivityCardProps {
  activity: Activity;
  slot?: TimetableSlot;
  onEdit: () => void;
}

function ActivityCard({ activity, slot, onEdit }: ActivityCardProps) {
  const hasOutcomes = activity.outcomes && activity.outcomes.length > 0;
  const hasCognates = activity.cognatePairs && activity.cognatePairs.length > 0;

  // Format time from slot
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const timeDisplay = slot ? `${formatTime(slot.startMin)} - ${formatTime(slot.endMin)}` : '';
  const subjectName = activity.milestone?.subject?.name || 'Unknown Subject';

  return (
    <div
      className={`mt-2 p-3 border rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md ${
        hasOutcomes ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
      onClick={onEdit}
    >
      {/* Header with time and subject */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-600 font-medium">{timeDisplay}</div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{subjectName}</div>
      </div>

      {/* Activity title */}
      <div className="font-medium text-sm text-gray-900 mb-2 leading-tight">{activity.title}</div>

      {/* Cognate display */}
      {hasCognates && (
        <div className="mb-2">
          <div className="text-xs text-indigo-600 font-medium mb-1">🧠 Language Transfer:</div>
          <div className="flex flex-wrap gap-1">
            {activity.cognatePairs?.slice(0, 2).map(({ cognatePair }) => (
              <span
                key={cognatePair.id}
                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded"
                title={cognatePair.notes || undefined}
              >
                {cognatePair.wordFr} – {cognatePair.wordEn}
              </span>
            ))}
            {activity.cognatePairs && activity.cognatePairs.length > 2 && (
              <span className="text-xs text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded">
                +{activity.cognatePairs.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Outcome tags */}
      {hasOutcomes && (
        <div className="flex flex-wrap gap-1">
          {activity.outcomes
            ?.slice(0, 3)
            .map(({ outcome }) => <OutcomeTag key={outcome.id} outcome={outcome} size="small" />)}
          {activity.outcomes && activity.outcomes.length > 3 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
              +{activity.outcomes.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* No outcomes indicator */}
      {!hasOutcomes && <div className="text-xs text-gray-400 italic">No outcomes linked</div>}
    </div>
  );
}

export default function WeekCalendarGrid({
  schedule,
  activities,
  timetable,
  events,
  holidays,
  invalidDay,
}: Props) {
  try {
    const updateActivity = useUpdateActivity();
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
    const [activityTitle, setActivityTitle] = useState('');
    const [activityMaterials, setActivityMaterials] = useState('');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    const handleEditActivity = (activity: Activity) => {
      setEditingActivity(activity);
      setActivityTitle(activity.title);
      setActivityMaterials(activity.materialsText || '');
      setSelectedOutcomes(activity.outcomes?.map((o) => o.outcome.code) || []);
    };

    const handleSaveActivity = () => {
      if (!editingActivity) return;

      updateActivity.mutate({
        id: editingActivity.id,
        milestoneId: editingActivity.milestoneId,
        subjectId: editingActivity.milestone?.subjectId,
        title: activityTitle,
        materialsText: activityMaterials,
        outcomes: selectedOutcomes,
      });

      setEditingActivity(null);
    };

    return (
      <>
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 bg-gray-50 border-b">
            {days.map((day, idx) => (
              <div key={idx} className="p-4 text-center">
                <div className="font-semibold text-gray-900">{dayAbbr[idx]}</div>
                <div className="text-sm text-gray-600">{day}</div>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="planner-grid grid grid-cols-5 min-h-[500px]">
            {days.map((_, idx) => {
              const items = schedule
                .filter((s) => s.day === idx)
                .sort((a, b) => (a.slot?.startMin ?? 0) - (b.slot?.startMin ?? 0));

              const daySlots = Array.isArray(timetable)
                ? timetable.filter((t) => t?.day === idx)
                : [];

              const blocked = daySlots.length === 0;
              const dayEvents = events?.filter(
                (e) => new Date(e.start).getUTCDay() === (idx + 1) % 7,
              );
              const dayHolidays = holidays?.filter(
                (h) => (new Date(h.start).getUTCDay() + 6) % 7 === idx,
              );
              const isHoliday = dayHolidays && dayHolidays.length > 0;

              const { isOver, setNodeRef } = useDroppable({
                id: `day-${idx}`,
                data: { day: idx },
              });
              const invalid = invalidDay === idx;

              return (
                <div
                  key={idx}
                  ref={setNodeRef}
                  data-testid={`day-${idx}`}
                  className={`border-r border-gray-200 p-4 ${
                    blocked || isHoliday ? 'bg-gray-100 opacity-50' : 'bg-white'
                  } ${isOver ? 'bg-blue-50' : ''} ${invalid ? 'border-red-300 bg-red-50' : ''} 
                ${idx === 4 ? 'border-r-0' : ''}`}
                >
                  {/* Holiday indicators */}
                  {dayHolidays?.map((h) => (
                    <div key={h.id} className="mb-2 text-sm text-red-600 font-medium">
                      🎉 {h.title}
                    </div>
                  ))}

                  {/* Invalid day warning */}
                  {invalid && (
                    <div
                      className="mb-2 text-sm text-red-600 font-medium"
                      data-testid="slot-warning"
                    >
                      ⚠️ Cannot schedule here
                    </div>
                  )}

                  {/* Events */}
                  {dayEvents?.map((ev) => (
                    <div
                      key={ev.id}
                      className="mb-2 text-xs bg-yellow-100 border border-yellow-300 rounded px-2 py-1"
                      title={ev.title}
                    >
                      📅 {ev.title}
                    </div>
                  ))}

                  {/* Activities */}
                  {items.map((item) => {
                    const activity = activities[item.activityId];
                    if (!activity) return null;

                    const slot = daySlots.find((s) => s.id === item.slotId);

                    return (
                      <ActivityCard
                        key={item.id}
                        activity={activity}
                        slot={slot}
                        onEdit={() => handleEditActivity(activity)}
                      />
                    );
                  })}

                  {/* Empty state */}
                  {items.length === 0 && !blocked && !isHoliday && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-3xl mb-2">📋</div>
                      <p className="text-sm">Drag activities here</p>
                    </div>
                  )}

                  {/* Blocked day indicator */}
                  {blocked && !isHoliday && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-3xl mb-2">🚫</div>
                      <p className="text-sm">No time slots</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Activity Modal */}
        <Dialog open={!!editingActivity} onOpenChange={() => setEditingActivity(null)}>
          <div className="p-6 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Edit Activity</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveActivity();
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="edit-activity-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Activity Title *
                </label>
                <input
                  id="edit-activity-title"
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-activity-materials"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Materials & Resources
                </label>
                <textarea
                  id="edit-activity-materials"
                  value={activityMaterials}
                  onChange={(e) => setActivityMaterials(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="List materials, resources, or preparation needed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked Outcomes
                </label>
                <OutcomeSelect
                  value={selectedOutcomes}
                  onChange={setSelectedOutcomes}
                  placeholder="Search and attach curriculum outcomes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      </>
    );
  } catch (error) {
    console.error('Error in WeekCalendarGrid rendering:', error);

    // Return a fallback UI instead of crashing
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Calendar Grid Error</h3>
        <p className="text-red-600 text-sm mt-1">
          Unable to render the calendar grid. Check console for details.
        </p>
        <pre className="text-xs text-red-500 mt-2 bg-red-100 p-2 rounded">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}
