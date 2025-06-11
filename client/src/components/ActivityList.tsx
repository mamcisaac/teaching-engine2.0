import { useEffect, useState } from 'react';
import MaterialsInput from './activity/MaterialsInput';
import type { Activity } from '../api';
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
  onToggle,
}: {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (checked: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: activity.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const progress = activity.completedAt ? 100 : 0;
  const checkboxId = `activity-${activity.id}`;
  return (
    <li ref={setNodeRef} style={style} className="border p-2 rounded space-y-1">
      <div className="flex items-center gap-2" {...attributes} {...listeners}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={!!activity.completedAt}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <label htmlFor={checkboxId} className="sr-only">
          Mark {activity.title} complete
        </label>
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
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
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
    create.mutate({ title, milestoneId, materialsText: materials });
    setTitle('');
    setMaterials('');
    setOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null || !editTitle.trim()) return;
    update.mutate({ id: editId, milestoneId, subjectId, title: editTitle });
    setEditId(null);
    setEditTitle('');
  };

  return (
    <div>
      <button className="mb-2 px-2 py-1 bg-blue-600 text-white" onClick={() => setOpen(true)}>
        Add Activity
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="activity-title" className="flex flex-col">
            <span className="sr-only">Activity title</span>
            <input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New activity"
              className="border p-2"
            />
          </label>
          <label htmlFor="activity-materials" className="flex flex-col">
            <span className="sr-only">Materials</span>
            <textarea
              id="activity-materials"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="glue, scissors"
              className="border p-2"
            />
          </label>
          <button type="submit" className="self-end px-2 py-1 bg-blue-600 text-white">
            Save
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
                  }}
                  onDelete={() => remove.mutate({ id: a.id, milestoneId, subjectId })}
                  onToggle={(checked) =>
                    update.mutate({
                      id: a.id,
                      milestoneId,
                      subjectId,
                      completedAt: checked ? new Date().toISOString() : null,
                    })
                  }
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      <Dialog open={editId !== null} onOpenChange={() => setEditId(null)}>
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
          <label htmlFor="edit-activity-title" className="flex flex-col">
            <span className="sr-only">Edit activity title</span>
            <input
              id="edit-activity-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="border p-2"
            />
          </label>
          {editId !== null && (
            <MaterialsInput
              activityId={editId}
              initial={activities.find((a) => a.id === editId)?.materialsText ?? ''}
            />
          )}
          <button type="submit" className="self-end px-2 py-1 bg-blue-600 text-white">
            Save
          </button>
        </form>
      </Dialog>
    </div>
  );
}
