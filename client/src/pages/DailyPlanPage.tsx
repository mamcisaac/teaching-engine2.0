import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useDailyPlan,
  useGenerateDailyPlan,
  useUpdateDailyPlan,
  useTimetable,
  useUpdateActivity,
  DailyPlanItem,
  type TimetableSlot,
} from '../api';
import DailyNotesEditor from '../components/DailyNotesEditor';
import Dialog from '../components/Dialog';
import OutcomeSelect from '../components/OutcomeSelect';
import OutcomeTag from '../components/OutcomeTag';
import DailyOralRoutineWidget from '../components/DailyOralRoutineWidget';
import { toast } from 'sonner';

interface ActivityCardProps {
  item: DailyPlanItem;
  slot?: TimetableSlot;
  onEdit: () => void;
  onDelete: () => void;
}

function ActivityCard({ item, slot, onEdit, onDelete }: ActivityCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const activity = item.activity;
  const hasOutcomes = activity?.outcomes && activity.outcomes.length > 0;

  // Format time from minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const timeDisplay = `${formatTime(item.startMin)} - ${formatTime(item.endMin)}`;
  const duration = item.endMin - item.startMin;
  const subjectName =
    activity?.milestone?.subject?.name || slot?.subject?.name || 'Unknown Subject';

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer bg-white ${
          hasOutcomes ? 'border-blue-200' : 'border-gray-200'
        }`}
      >
        {/* Header with time and subject */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-gray-900">{timeDisplay}</div>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {duration} min
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              ×
            </button>
          </div>
        </div>

        {/* Subject badge */}
        <div className="mb-3">
          <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded">
            {subjectName}
          </span>
        </div>

        {/* Activity title */}
        <div className="font-medium text-gray-900 mb-3 leading-tight">
          {activity?.title || 'No activity assigned'}
        </div>

        {/* Outcome tags */}
        {hasOutcomes && (
          <div className="flex flex-wrap gap-1 mb-2">
            {activity.outcomes
              ?.slice(0, 3)
              .map(({ outcome }) => <OutcomeTag key={outcome.id} outcome={outcome} size="small" />)}
            {activity.outcomes && activity.outcomes.length > 3 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                +{activity.outcomes.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* No outcomes indicator */}
        {!hasOutcomes && <div className="text-xs text-gray-400 italic">No outcomes linked</div>}

        {/* Notes preview */}
        {item.notes && (
          <div className="text-xs text-gray-600 mt-2 p-2 bg-yellow-50 rounded border-l-2 border-yellow-300">
            📝 {item.notes.substring(0, 100)}
            {item.notes.length > 100 ? '...' : ''}
          </div>
        )}
      </div>

      {/* Tooltip showing outcomes */}
      {showTooltip && hasOutcomes && (
        <div className="absolute z-50 left-0 top-full mt-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-sm">
          <div className="font-medium mb-2">Linked Outcomes:</div>
          <div className="space-y-1">
            {activity?.outcomes?.map((outcome) => (
              <div key={outcome.outcome.id} className="flex gap-2">
                <span className="font-mono text-yellow-300 shrink-0">{outcome.outcome.code}</span>
                <span className="text-gray-200">{outcome.outcome.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DailyPlanPage() {
  const { date: paramDate } = useParams<{ date: string }>();
  const [date, setDate] = useState(() => {
    if (paramDate) {
      // Ensure the date from params is in the correct format
      const paramDateObj = new Date(paramDate + 'T00:00:00');
      return paramDateObj.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [editingItem, setEditingItem] = useState<DailyPlanItem | null>(null);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityMaterials, setActivityMaterials] = useState('');
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [itemNotes, setItemNotes] = useState('');

  const { data: plan, refetch } = useDailyPlan(date);
  const { data: timetable } = useTimetable();
  const generate = useGenerateDailyPlan();
  const update = useUpdateDailyPlan();
  const updateActivity = useUpdateActivity();

  // Format date for display
  const selectedDate = new Date(date + 'T00:00:00');
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dateDisplay = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleGenerate = () => {
    generate.mutate(date, {
      onSuccess: () => {
        toast.success('Daily plan generated successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to generate daily plan');
      },
    });
  };

  const handleEditItem = (item: DailyPlanItem) => {
    setEditingItem(item);
    setActivityTitle(item.activity?.title || '');
    setActivityMaterials(item.activity?.materialsText || '');
    setSelectedOutcomes(item.activity?.outcomes?.map((o) => o.outcome.code) || []);
    setItemNotes(item.notes || '');
  };

  const handleSaveActivity = async () => {
    if (!editingItem?.activity || !plan) return;

    try {
      // Update activity first
      await updateActivity.mutateAsync({
        id: editingItem.activity.id,
        milestoneId: editingItem.activity.milestoneId,
        subjectId: editingItem.activity.milestone?.subjectId,
        title: activityTitle,
        materialsText: activityMaterials,
        outcomes: selectedOutcomes,
      });

      // If notes changed, update them atomically
      if (itemNotes !== editingItem.notes) {
        const updatedItems = plan.items.map((item) =>
          item.id === editingItem.id ? { ...item, notes: itemNotes } : item,
        );

        await update.mutateAsync({
          id: plan.id,
          items: updatedItems.map((i) => ({
            startMin: i.startMin,
            endMin: i.endMin,
            slotId: i.slotId ?? undefined,
            activityId: i.activityId ?? undefined,
            notes: i.notes ?? undefined,
          })),
        });
      }

      toast.success('Activity updated successfully');
      setEditingItem(null);
      refetch();
    } catch (error) {
      toast.error('Failed to update activity');
    }
  };

  const handleDeleteActivity = (item: DailyPlanItem) => {
    if (!plan) return;

    if (confirm('Are you sure you want to remove this activity from the schedule?')) {
      const updatedItems = plan.items.map((i) =>
        i.id === item.id ? { ...i, activityId: null, activity: null } : i,
      );

      update.mutate(
        {
          id: plan.id,
          items: updatedItems.map((i) => ({
            startMin: i.startMin,
            endMin: i.endMin,
            slotId: i.slotId ?? undefined,
            activityId: i.activityId ?? undefined,
            notes: i.notes ?? undefined,
          })),
        },
        {
          onSuccess: () => {
            toast.success('Activity removed from schedule');
            refetch();
          },
          onError: () => {
            toast.error('Failed to remove activity');
          },
        },
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {dayName}, {dateDisplay}
            </h1>
            <p className="text-gray-600 mt-1">Daily Schedule</p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              data-testid="date-input"
            />
            <button
              onClick={handleGenerate}
              disabled={generate.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {generate.isPending ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Oral Language Routines */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <DailyOralRoutineWidget date={date} />
      </div>

      {/* Daily Timeline */}
      {plan ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Daily Timeline</h2>
            <p className="text-sm text-gray-600 mt-1">
              {plan.items.length} scheduled items • Click any item to edit
            </p>
          </div>

          <div className="p-6">
            {plan.items.length > 0 ? (
              <div className="space-y-4">
                {plan.items
                  .sort((a, b) => a.startMin - b.startMin)
                  .map((item) => {
                    const slot = timetable?.find((s) => s.id === item.slotId);
                    return (
                      <ActivityCard
                        key={item.id}
                        item={item}
                        slot={slot}
                        onEdit={() => handleEditItem(item)}
                        onDelete={() => handleDeleteActivity(item)}
                      />
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities scheduled</h3>
                <p className="text-gray-600 mb-4">Generate a daily plan to get started</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No plan available for this day</h3>
          <p className="text-gray-600 mb-4">Generate a daily plan to start scheduling activities</p>
          <button
            onClick={handleGenerate}
            disabled={generate.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {generate.isPending ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
      )}

      {/* Daily Notes */}
      {plan && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Notes</h3>
          <DailyNotesEditor dailyPlanId={plan.id} />
        </div>
      )}

      {/* Edit Activity Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <div className="p-6 max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">Edit Scheduled Activity</h3>

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

            <div>
              <label
                htmlFor="edit-item-notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Schedule Notes
              </label>
              <textarea
                id="edit-item-notes"
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add notes specific to this scheduled time slot"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateActivity.isPending || update.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {updateActivity.isPending || update.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
