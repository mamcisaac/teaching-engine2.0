import React, { useState } from 'react';

import { useAddCalendarEvent } from '../api/domains/calendar';

import { Dialog } from './Dialog';

interface Props {
  onClose: () => void;
}

export default function EventEditorModal({ onClose }: Props): React.ReactElement {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const mutation = useAddCalendarEvent();

  const submit = (): void => {
    if (date === null || date === undefined || date === '' || title === null || title === undefined || title === '') {
return;
}
    mutation.mutate({
      title,
      start: `${date}T00:00:00.000Z`,
      end: `${date}T23:59:59.000Z`,
      allDay: true,
      eventType: 'CUSTOM',
      source: 'MANUAL',
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="space-y-2 w-64">
        <h2 className="text-lg">Add Event</h2>
        <input
          className="border p-1 w-full"
          placeholder="Title"
          value={title}
          onChange={(e): void => {
 setTitle(e.target.value); 
}}
        />
        <input
          className="border p-1 w-full"
          type="date"
          value={date}
          onChange={(e): void => {
 setDate(e.target.value); 
}}
        />
        <div className="flex gap-2 mt-2">
          <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={submit}>
            Save
          </button>
          <button
            className="px-2 py-1 bg-gray-200 text-gray-800 rounded border"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
}
