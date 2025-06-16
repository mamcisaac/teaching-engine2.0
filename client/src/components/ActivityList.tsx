import { useEffect, useState } from 'react';
import MaterialsInput from './activity/MaterialsInput';
import type { Activity } from '../api';
import CompleteActivityButton from './CompleteActivityButton';
import { OutcomeSelector } from './OutcomeSelector';
import OutcomeTag from './OutcomeTag';
import SuggestedResourcesPanel from './SuggestedResourcesPanel';
import {
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useReorderActivities,
} from '../api';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Dialog from './Dialog';

interface Props {
  activities: Activity[];
  milestoneId: number;
  subjectId?: number;
}

function SortableActivity({
  activity,
  onEdit,
  onDelete,
  milestoneId,
}: {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
  milestoneId: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: activity.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const progress = activity.completedAt ? 100 : 0;
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="border p-2 rounded space-y-1"
      data-testid="activity-item"
    >
      <div className="flex items-center gap-2" {...attributes} {...listeners}>
        <CompleteActivityButton activity={activity} milestoneId={milestoneId} />
        <span className="flex-1">{activity.title}</span>
        <div className="flex gap-1">
          <button className="px-1 text-sm bg-gray-200" onClick={onEdit}>
            Edit
          </button>
          <button className="px-1 text-sm bg-red-600 text-white" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
      {activity.outcomes && activity.outcomes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {activity.outcomes.map(({ outcome }) => (
            <OutcomeTag key={outcome.id} outcome={outcome} size="small" />
          ))}
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
      </div>
    </li>
  );
}

export default function ActivityList({ activities, milestoneId, subjectId }: Props) {
  const create = useCreateActivity();
  const update = useUpdateActivity();
  const remove = useDeleteActivity();
  const reorder = useReorderActivities();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [materials, setMaterials] = useState('');
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOutcomes, setEditOutcomes] = useState<string[]>([]);
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    setIds(activities.map((a) => a.id));
  }, [activities]);

  const handleDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as number);
    const newIndex = ids.indexOf(over.id as number);
    const newIds = arrayMove(ids, oldIndex, newIndex);
    setIds(newIds);
    reorder.mutate({ milestoneId, activityIds: newIds });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({
      title,
      milestoneId,
      materialsText: materials,
      outcomes: selectedOutcomes,
    });
    setTitle('');
    setMaterials('');
    setSelectedOutcomes([]);
    setOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null || !editTitle.trim()) return;
    update.mutate({
      id: editId,
      milestoneId,
      subjectId,
      title: editTitle,
      outcomes: editOutcomes,
    });
    setEditId(null);
    setEditTitle('');
    setEditOutcomes([]);
  };

  return (
    <div>
      <button className="mb-2 px-2 py-1 bg-blue-600 text-white" onClick={() => setOpen(true)}>
        Add Activity
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <label htmlFor="activity-title" className="flex flex-col">
            <span className="block text-sm font-medium text-gray-700 mb-1">Activity title</span>
            <input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New activity"
              className="border p-2 rounded-md"
            />
          </label>

          <label htmlFor="activity-materials" className="flex flex-col">
            <span className="block text-sm font-medium text-gray-700 mb-1">Materials</span>
            <textarea
              id="activity-materials"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="glue, scissors"
              className="border p-2 rounded-md"
            />
          </label>

          <OutcomeSelector selectedOutcomes={selectedOutcomes} onChange={setSelectedOutcomes} />

          <button type="submit" className="self-end px-4 py-2 bg-blue-600 text-white rounded-md">
            Save Activity
          </button>
        </form>
      </Dialog>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {ids.map((id) => {
              const a = activities.find((x) => x.id === id)!;
              return (
                <SortableActivity
                  key={a.id}
                  activity={a}
                  onEdit={() => {
                    setEditId(a.id);
                    setEditTitle(a.title);
                    // Extract outcome codes from the activity's outcomes
                    const outcomeCodes = a.outcomes?.map((o) => o.outcome.code) || [];
                    setEditOutcomes(outcomeCodes);
                  }}
                  onDelete={() => remove.mutate({ id: a.id, milestoneId, subjectId })}
                  milestoneId={milestoneId}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      <Dialog open={editId !== null} onOpenChange={() => setEditId(null)}>
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 p-4">
          <label htmlFor="edit-activity-title" className="flex flex-col">
            <span className="block text-sm font-medium text-gray-700 mb-1">Activity title</span>
            <input
              id="edit-activity-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="border p-2 rounded-md"
            />
          </label>

          {editId !== null && (
            <MaterialsInput
              activityId={editId}
              initial={activities.find((a) => a.id === editId)?.materialsText ?? ''}
            />
          )}

          <OutcomeSelector selectedOutcomes={editOutcomes} onChange={setEditOutcomes} />

          <SuggestedResourcesPanel activityId={editId} />

          <button type="submit" className="self-end px-4 py-2 bg-blue-600 text-white rounded-md">
            Update Activity
          </button>
        </form>
      </Dialog>
    </div>
  );
}
