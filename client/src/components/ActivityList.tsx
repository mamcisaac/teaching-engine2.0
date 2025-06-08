import { useState } from 'react';
import type { Activity } from '../api';
import { useCreateActivity, useUpdateActivity, useDeleteActivity } from '../api';
import Dialog from './Dialog';

interface Props {
  activities: Activity[];
  milestoneId: number;
  subjectId?: number;
}

export default function ActivityList({ activities, milestoneId, subjectId }: Props) {
  const create = useCreateActivity();
  const update = useUpdateActivity();
  const remove = useDeleteActivity();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title, milestoneId });
    setTitle('');
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
          <button type="submit" className="self-end px-2 py-1 bg-blue-600 text-white">
            Save
          </button>
        </form>
      </Dialog>
      <ul className="space-y-2">
        {activities.map((a) => {
          const progress = a.completedAt ? 100 : 0;
          const checkboxId = `activity-${a.id}-checkbox`;
          return (
            <li key={a.id} className="border p-2 rounded space-y-1">
              <div className="flex items-center gap-2">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={!!a.completedAt}
                  onChange={(e) =>
                    update.mutate({
                      id: a.id,
                      milestoneId,
                      subjectId,
                      completedAt: e.target.checked ? new Date().toISOString() : null,
                    })
                  }
                />
                <label htmlFor={checkboxId} className="sr-only">
                  Mark {a.title} completed
                </label>
                <span className="flex-1">{a.title}</span>
                <div className="flex gap-1">
                  <button
                    className="px-1 text-sm bg-gray-200"
                    onClick={() => {
                      setEditId(a.id);
                      setEditTitle(a.title);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-1 text-sm bg-red-600 text-white"
                    onClick={() => remove.mutate({ id: a.id, milestoneId, subjectId })}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
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
          <button type="submit" className="self-end px-2 py-1 bg-blue-600 text-white">
            Save
          </button>
        </form>
      </Dialog>
    </div>
  );
}
