import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Subject } from '../api';
import { useCreateSubject, useUpdateSubject, useDeleteSubject } from '../api';
import Dialog from './Dialog';

interface Props {
  subjects: Subject[];
}

export default function SubjectList({ subjects }: Props) {
  const create = useCreateSubject();
  const update = useUpdateSubject();
  const remove = useDeleteSubject();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate({ name, milestones: [] });
    setName('');
    setOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null || !editName.trim()) return;
    update.mutate({ id: editId, data: { name: editName } });
    setEditId(null);
    setEditName('');
  };

  return (
    <div>
      <button className="mb-2 px-2 py-1 bg-blue-600 text-white" onClick={() => setOpen(true)}>
        Add Subject
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="subject-name" className="flex flex-col">
            <span className="sr-only">Subject name</span>
            <input
              id="subject-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New subject"
              className="border p-2"
            />
          </label>
          <button type="submit" className="self-end px-2 py-1 bg-blue-600 text-white">
            Save
          </button>
        </form>
      </Dialog>
      <ul className="space-y-2">
        {subjects.map((s) => {
          const completed = s.milestones.filter(
            (m) => m.activities.length > 0 && m.activities.every((a) => a.completedAt),
          ).length;
          const progress = s.milestones.length ? (completed / s.milestones.length) * 100 : 0;
          return (
            <li key={s.id} className="border p-2 rounded space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Link to={`/subjects/${s.id}`}>{s.name}</Link>
                <div className="flex gap-1">
                  <button
                    className="px-1 text-sm bg-gray-200"
                    onClick={() => {
                      setEditId(s.id);
                      setEditName(s.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-1 text-sm bg-red-600 text-white"
                    onClick={() => remove.mutate(s.id)}
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
          <label htmlFor="edit-subject-name" className="flex flex-col">
            <span className="sr-only">Edit subject name</span>
            <input
              id="edit-subject-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
