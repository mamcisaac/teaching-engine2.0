import React, { useState } from 'react';
// TODO: Holiday hooks not yet implemented
// import { useHolidays, useAddHoliday, useDeleteHoliday } from '../../api';

export default function HolidaySettings(): React.ReactElement {
  // TODO: Holiday hooks not yet implemented
  // const { data: holidays } = useHolidays();
  // const add = useAddHoliday();
  // const remove = useDeleteHoliday();
  const holidays: { id: number; date: string; name: string }[] = []; // Placeholder
  const add = { mutate: (_data: { date: string; name: string }): void => {} }; // Placeholder
  const remove = { mutate: (_id: number): void => {} }; // Placeholder
  const [date, setDate] = useState('');
  const [name, setName] = useState('');

  const handleAdd = (): void => {
    if (!date || !name.trim()) {
return;
}
    add.mutate({ date: `${date}T00:00:00.000Z`, name });
    setDate('');
    setName('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          className="border p-1"
          type="date"
          value={date}
          onChange={(e): void => {
 setDate(e.target.value); 
}}
        />
        <input
          className="border p-1"
          placeholder="Holiday name"
          type="text"
          value={name}
          onChange={(e): void => {
 setName(e.target.value); 
}}
        />
        <button
          className="px-2 py-1 bg-blue-600 text-white"
          title="Add holiday"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
      <ul className="space-y-1">
        {holidays.map((h, _index) => (
          <li key={h.id} className="flex gap-2 items-center">
            <span>
              {h.date.split('T')[0]} - {h.name}
            </span>
            <button
              className="px-1 text-sm bg-red-600 text-white"
              title="Remove holiday"
              onClick={(): void => {
 remove.mutate(h.id); 
}}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
