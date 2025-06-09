import { useState } from 'react';
import { useSaveTimetable, useTimetable, useSubjects, TimetableSlot } from '../api';

export default function TimetableEditor() {
  const { data: subjects } = useSubjects();
  const { data: slots } = useTimetable();
  const save = useSaveTimetable();

  type Entry = Omit<TimetableSlot, 'id' | 'subject'>;
  const [entries, setEntries] = useState<Entry[]>(
    () =>
      slots?.map((s) => ({
        day: s.day,
        startMin: s.startMin,
        endMin: s.endMin,
        subjectId: s.subjectId ?? undefined,
      })) ?? [],
  );

  const handleAdd = () => {
    setEntries([...entries, { day: 0, startMin: 540, endMin: 600, subjectId: undefined }]);
  };

  const handleChange = (i: number, field: keyof Entry, value: number | undefined) => {
    setEntries((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const handleSave = () => {
    save.mutate(entries);
  };

  return (
    <div>
      <button className="mb-2 px-2 py-1 bg-blue-600 text-white" onClick={handleAdd}>
        Add Slot
      </button>
      <table className="w-full text-sm border">
        <thead>
          <tr>
            <th>Day</th>
            <th>Start</th>
            <th>End</th>
            <th>Subject</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr key={idx} className="border-t">
              <td>
                <select
                  value={e.day}
                  onChange={(ev) => handleChange(idx, 'day', Number(ev.target.value))}
                >
                  <option value={0}>Mon</option>
                  <option value={1}>Tue</option>
                  <option value={2}>Wed</option>
                  <option value={3}>Thu</option>
                  <option value={4}>Fri</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={e.startMin}
                  onChange={(ev) => handleChange(idx, 'startMin', Number(ev.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={e.endMin}
                  onChange={(ev) => handleChange(idx, 'endMin', Number(ev.target.value))}
                />
              </td>
              <td>
                <select
                  value={e.subjectId ?? ''}
                  onChange={(ev) =>
                    handleChange(
                      idx,
                      'subjectId',
                      ev.target.value ? Number(ev.target.value) : undefined,
                    )
                  }
                >
                  <option value="">Prep</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="mt-2 px-2 py-1 bg-blue-600 text-white"
        onClick={handleSave}
        disabled={save.isPending}
      >
        Save Timetable
      </button>
    </div>
  );
}
