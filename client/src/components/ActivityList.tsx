import { useState } from 'react';
import type { Activity } from '../api';
import { useCreateActivity } from '../api';
import Dialog from './Dialog';

interface Props {
  activities: Activity[];
  milestoneId: number;
}

export default function ActivityList({ activities, milestoneId }: Props) {
  const create = useCreateActivity();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title, milestoneId });
    setTitle('');
    setOpen(false);
  };

  return (
    <div>
      <button className="mb-2 px-2 py-1 bg-blue-600 text-white" onClick={() => setOpen(true)}>
        Add Activity
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New activity"
            className="border p-2"
          />
          <button type="submit" className="self-end px-2 py-1 bg-blue-600 text-white">
            Save
          </button>
        </form>
      </Dialog>
      <ul className="space-y-2">
        {activities.map((a) => {
          const progress = a.completedAt ? 100 : 0;
          return (
            <li key={a.id} className="border p-2 rounded">
              {a.title}
              <div className="h-2 mt-1 bg-gray-200 rounded">
                <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
