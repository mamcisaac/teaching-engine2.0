import { useState, memo, useMemo } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CalendarEvent, useCalendarEvents } from '../api/legacy/api';
import EventEditorModal from './EventEditorModal';

interface Props {
  month: Date;
  events?: CalendarEvent[];
}

const CalendarViewComponent = memo(function CalendarViewComponent({ month, events }: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  
  // Memoize expensive date calculations
  const dateRange = useMemo(() => {
    const from = startOfMonth(month).toISOString();
    const to = endOfMonth(month).toISOString();
    return { from, to };
  }, [month]);

  const fetch = useCalendarEvents(dateRange.from, dateRange.to);
  
  // Memoize event array processing
  const evts = useMemo(() => {
    return Array.isArray(events) ? events : Array.isArray(fetch.data) ? fetch.data : [];
  }, [events, fetch.data]);

  // Log any errors for debugging
  if (fetch.error) {
    console.error('Error loading calendar events:', fetch.error);
  }

  // Memoize expensive day calculations and event grouping
  const { days, grouped } = useMemo(() => {
    const days = eachDayOfInterval({ 
      start: new Date(dateRange.from), 
      end: new Date(dateRange.to) 
    });
    
    const grouped: Record<string, CalendarEvent[]> = {};
    // Safely process events
    if (Array.isArray(evts)) {
      evts.forEach((e) => {
        if (e?.start) {
          const d = e.start.split('T')[0];
          if (d) {
            if (!grouped[d]) grouped[d] = [];
            grouped[d].push(e);
          }
        }
      });
    }
    
    return { days, grouped };
  }, [dateRange.from, dateRange.to, evts]);

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
});

export default CalendarViewComponent;
