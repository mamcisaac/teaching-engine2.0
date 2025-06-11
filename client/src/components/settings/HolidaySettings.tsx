import { useState } from 'react';
import { useHolidays, useAddHoliday, useDeleteHoliday } from '../../api';

export default function HolidaySettings() {
  const { data: holidays } = useHolidays();
  const add = useAddHoliday();
  const remove = useDeleteHoliday();
  const [date, setDate] = useState('');
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!date || !name.trim()) return;
    add.mutate({ date: `${date}T00:00:00.000Z`, name });
    setDate('');
    setName('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-1"
        />
        <input
          type="text"
          placeholder="Holiday name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-1"
        />
        <button
          className="px-2 py-1 bg-blue-600 text-white"
          onClick={handleAdd}
          title="Add holiday"
        >
          Add
        </button>
      </div>
      <ul className="space-y-1">
        {holidays?.map((h) => (
          <li key={h.id} className="flex gap-2 items-center">
            <span>
              {h.date.split('T')[0]} - {h.name}
            </span>
            <button
              className="px-1 text-sm bg-red-600 text-white"
              onClick={() => remove.mutate(h.id)}
              title="Remove holiday"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
