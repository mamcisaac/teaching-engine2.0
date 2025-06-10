import { addMonths, endOfMonth, startOfMonth, startOfYear } from 'date-fns';
import CalendarViewComponent from './CalendarViewComponent';
import { useYearPlan, YearPlanEntry, CalendarEvent } from '../api';

interface Props {
  teacherId: number;
  year: number;
}

export default function YearAtAGlanceComponent({ teacherId, year }: Props) {
  const { data } = useYearPlan(teacherId, year);
  const months = Array.from({ length: 12 }, (_, i) =>
    addMonths(startOfYear(new Date(year, 0, 1)), i),
  );

  const getMonthEvents = (month: Date): YearPlanEntry[] => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return (
      data?.filter((e) => {
        const s = new Date(e.start);
        const en = new Date(e.end);
        return s <= end && en >= start;
      }) || []
    );
  };

  const asCalendarEvents = (entries: YearPlanEntry[]): CalendarEvent[] =>
    entries.map((e) => ({
      id: e.id,
      title: e.title,
      start: e.start,
      end: e.end,
      allDay: true,
      eventType: 'CUSTOM',
      source: 'SYSTEM',
    }));

  return (
    <div className="space-y-4">
      {months.map((m) => (
        <div key={m.toISOString()}>
          <h3 className="font-bold my-2">
            {m.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <CalendarViewComponent month={m} events={asCalendarEvents(getMonthEvents(m))} />
        </div>
      ))}
    </div>
  );
}
