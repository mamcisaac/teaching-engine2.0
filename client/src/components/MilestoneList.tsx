import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Milestone } from '../api';
import { useCreateMilestone } from '../api';
import Dialog from './Dialog';

interface Props {
  milestones: Milestone[];
  subjectId: number;
}

export default function MilestoneList({ milestones, subjectId }: Props) {
  const create = useCreateMilestone();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title, subjectId });
    setTitle('');
    setOpen(false);
  };

  return (
    <div>
      <button className="mb-2 px-2 py-1 bg-blue-600 text-white" onClick={() => setOpen(true)}>
        Add Milestone
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New milestone"
            className="border p-2"
          />
          <button type="submit" className="self-end px-2 py-1 bg-blue-600 text-white">
            Save
          </button>
        </form>
      </Dialog>
      <ul className="space-y-2">
        {milestones.map((m) => {
          const completed = m.activities.filter((a) => a.completedAt).length;
          const progress = m.activities.length ? (completed / m.activities.length) * 100 : 0;
          return (
            <li key={m.id} className="border p-2 rounded">
              <Link to={`/milestones/${m.id}`}>{m.title}</Link>
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
