import { useState } from 'react';
import { useFilteredNotes, useSubjects } from '../api';

export default function ReflectionsPage() {
  const [subjectId, setSubjectId] = useState<string>('');
  const [type, setType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: subjects } = useSubjects();
  const { data: notes } = useFilteredNotes({
    type: type === 'all' ? undefined : (type as 'public' | 'private'),
    subjectId: subjectId ? String(Number(subjectId)) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Reflections</h1>
      <div className="flex gap-2 items-end">
        <select
          className="border p-1"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border p-1"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="border p-1"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <div className="flex gap-2">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={type === 'public'}
              onChange={(e) => {
                if (e.target.checked) {
                  setType('public');
                } else {
                  setType('all');
                }
              }}
            />
            Public
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={type === 'private'}
              onChange={(e) => {
                if (e.target.checked) {
                  setType('private');
                } else {
                  setType('all');
                }
              }}
            />
            Private
          </label>
        </div>
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr>
            <th className="border">Date</th>
            <th className="border">Subject</th>
            <th className="border">Activity</th>
            <th className="border">Type</th>
            <th className="border">Excerpt</th>
          </tr>
        </thead>
        <tbody>
          {notes?.map((n) => (
            <tr key={n.id} className="border-t">
              <td className="border px-2">{new Date(n.createdAt).toLocaleDateString()}</td>
              <td className="border px-2">{n.activity?.milestone.subject.name || ''}</td>
              <td className="border px-2">{n.activity?.title || ''}</td>
              <td className="border px-2">{n.public ? 'Public' : 'Private'}</td>
              <td className="border px-2">
                {n.content.length > 50 ? `${n.content.slice(0, 47)}...` : n.content}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
