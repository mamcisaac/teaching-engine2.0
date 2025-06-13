import { useState } from 'react';
import Dialog from './Dialog';
import { useAddCalendarEvent } from '../api';

interface Props {
  onClose: () => void;
}

export default function EventEditorModal({ onClose }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const mutation = useAddCalendarEvent();

  const submit = () => {
    if (!date || !title) return;
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
    <Dialog open={true} onOpenChange={onClose}>
      <div className="space-y-2 w-64">
        <h2 className="text-lg">Add Event</h2>
        <input
          className="border p-1 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="border p-1 w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="flex gap-2 mt-2">
          <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={submit}>
            Save
          </button>
          <button
            className="px-2 py-1 bg-gray-200 text-gray-800 rounded border"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  );
}
