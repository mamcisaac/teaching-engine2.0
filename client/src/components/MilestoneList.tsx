import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Milestone } from '../api';
import { useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from '../api';
import Dialog from './Dialog';
import OutcomeSelect from './OutcomeSelect';

interface Props {
  milestones: Milestone[];
  subjectId: number;
}

export default function MilestoneList({ milestones, subjectId }: Props) {
  const create = useCreateMilestone();
  const update = useUpdateMilestone();
  const remove = useDeleteMilestone();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [outcomeCodes, setOutcomeCodes] = useState<string[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editOutcomeCodes, setEditOutcomeCodes] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({
      title,
      subjectId,
      description,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      outcomes: outcomeCodes,
    });
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setOutcomeCodes([]);
    setOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null || !editTitle.trim()) return;
    update.mutate({
      id: editId,
      title: editTitle,
      subjectId,
      description: editDescription,
      startDate: editStartDate || undefined,
      endDate: editEndDate || undefined,
      outcomes: editOutcomeCodes,
    });
    setEditId(null);
    setEditTitle('');
    setEditDescription('');
    setEditStartDate('');
    setEditEndDate('');
    setEditOutcomeCodes([]);
  };

  return (
    <div>
      <button className="mb-2 px-2 py-1 bg-blue-600 text-white" onClick={() => setOpen(true)}>
        Add Milestone
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="milestone-title" className="flex flex-col">
            <span className="sr-only">Milestone title</span>
            <input
              id="milestone-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New milestone"
              className="border p-2"
            />
          </label>
          <label className="flex flex-col">
            <span className="sr-only">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="border p-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col">
              <span className="text-sm font-medium">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2"
                min={startDate}
              />
            </label>
          </div>
          <OutcomeSelect
            value={outcomeCodes}
            onChange={setOutcomeCodes}
            placeholder="Search for outcomes"
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
            <li key={m.id} className="border p-2 rounded space-y-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <Link to={`/milestones/${m.id}`} className="font-medium">
                      {m.title}
                    </Link>
                    {(m.startDate || m.endDate) && (
                      <div className="text-sm text-gray-600">
                        {m.startDate ? new Date(m.startDate).toLocaleDateString() : 'No start date'}
                        - {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'No end date'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="px-1 text-sm bg-gray-200"
                      onClick={() => {
                        setEditId(m.id);
                        setEditTitle(m.title);
                        setEditDescription(m.description ?? '');
                        setEditStartDate(m.startDate ?? '');
                        setEditEndDate(m.endDate ?? '');
                        setEditOutcomeCodes(m.outcomes?.map((o) => o.outcome.code) ?? []);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-1 text-sm bg-red-600 text-white"
                      onClick={() => remove.mutate({ id: m.id, subjectId: m.subjectId })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              {m.description && <p className="italic text-sm">{m.description}</p>}
              {m.outcomes && m.outcomes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.outcomes.map((o) => (
                    <span
                      key={o.outcome.id}
                      className="bg-gray-200 px-1 text-xs"
                      title={o.outcome.description}
                    >
                      {o.outcome.code}
                    </span>
                  ))}
                </div>
              )}
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <Dialog open={editId !== null} onOpenChange={() => setEditId(null)}>
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
          <label htmlFor="edit-milestone-title" className="flex flex-col">
            <span className="sr-only">Edit milestone title</span>
            <input
              id="edit-milestone-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="border p-2"
            />
          </label>
          <label className="flex flex-col">
            <span className="sr-only">Edit description</span>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="border p-2"
              placeholder="Description"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col">
              <span className="text-sm font-medium">Start Date</span>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="border p-2"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm font-medium">End Date</span>
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="border p-2"
                min={editStartDate}
              />
            </label>
          </div>
          <OutcomeSelect
            value={editOutcomeCodes}
            onChange={setEditOutcomeCodes}
            placeholder="Search for outcomes"
          />
          <button type="submit" className="self-end px-2 py-1 bg-blue-600 text-white">
            Save
          </button>
        </form>
      </Dialog>
    </div>
  );
}
