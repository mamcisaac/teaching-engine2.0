import { useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CalendarEvent, useCalendarEvents } from '../api';
import EventEditorModal from './EventEditorModal';

interface Props {
  month: Date;
  events?: CalendarEvent[];
}

export default function CalendarViewComponent({ month, events }: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const from = startOfMonth(month).toISOString();
  const to = endOfMonth(month).toISOString();
  const fetch = useCalendarEvents(from, to);
  const evts = events ?? fetch.data;

  const days = eachDayOfInterval({ start: new Date(from), end: new Date(to) });
  const grouped: Record<string, CalendarEvent[]> = {};
  evts?.forEach((e) => {
    const d = e.start.split('T')[0];
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  return (
    <div className="border rounded p-2">
      {!events && (
        <button
          className="mb-2 px-2 py-1 bg-blue-500 text-white rounded"
          onClick={() => setEditorOpen(true)}
        >
          + Add Event
        </button>
      )}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((d) => (
          <div key={d.toISOString()} className="border p-1 min-h-16">
            <div className="font-bold text-xs">{d.getDate()}</div>
            {(grouped[d.toISOString().split('T')[0]] || []).map((ev) => (
              <div key={ev.id} className="text-xs bg-gray-200 rounded mt-1 px-1" title={ev.title}>
                {ev.title}
              </div>
            ))}
          </div>
        ))}
      </div>
      {!events && editorOpen && <EventEditorModal onClose={() => setEditorOpen(false)} />}
    </div>
  );
}
