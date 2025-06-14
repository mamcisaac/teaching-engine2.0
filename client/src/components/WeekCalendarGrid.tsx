import type { WeeklyScheduleItem, Activity, TimetableSlot, CalendarEvent } from '../api';
import { useDroppable } from '@dnd-kit/core';
import OutcomeTag from './OutcomeTag';

interface Props {
  schedule: WeeklyScheduleItem[];
  activities: Record<number, Activity>;
  timetable?: TimetableSlot[];
  events?: CalendarEvent[];
  holidays?: CalendarEvent[];
  invalidDay?: number;
}

export default function WeekCalendarGrid({
  schedule,
  activities,
  timetable,
  events,
  holidays,
  invalidDay,
}: Props) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="grid grid-cols-5 gap-2">
      {days.map((d, idx) => {
        const items = schedule
          .filter((s) => s.day === idx)
          .sort((a, b) => (a.slot?.startMin ?? 0) - (b.slot?.startMin ?? 0));
        const daySlot = Array.isArray(timetable)
          ? timetable.find((t) => t?.day === idx)
          : undefined;
        const blocked = daySlot && !daySlot.subjectId;
        const label = daySlot?.subject?.name ?? (blocked ? 'Prep' : '');
        const dayEvents = events?.filter((e) => new Date(e.start).getUTCDay() === (idx + 1) % 7);
        const dayHolidays = holidays?.filter(
          (h) => (new Date(h.start).getUTCDay() + 6) % 7 === idx,
        );
        const isHoliday = dayHolidays && dayHolidays.length > 0;
        const { isOver, setNodeRef } = useDroppable({
          id: `day-${idx}`,
          data: { day: idx },
        });
        const invalid = invalidDay === idx;
        return (
          <div
            key={idx}
            ref={setNodeRef}
            data-testid={`day-${idx}`}
            className={`min-h-24 border flex flex-col items-center justify-start bg-gray-50 p-1${
              blocked || isHoliday ? ' opacity-50 pointer-events-none' : ''
            }${isOver ? ' bg-blue-100' : ''}${invalid ? ' border-red-500' : ''}`}
          >
            <span>{d}</span>
            {label && <div className="text-xs">{label}</div>}
            {dayHolidays?.map((h) => (
              <div key={h.id} className="text-xs text-red-600">
                {h.title}
              </div>
            ))}
            {invalid && (
              <div className="text-xs text-red-600" data-testid="slot-warning">
                Too long for this slot
              </div>
            )}
            {dayEvents?.map((ev) => (
              <div key={ev.id} className="text-xs bg-yellow-200 w-full mt-1" title={ev.title}>
                {ev.title}
              </div>
            ))}
            {items.map((it) => {
              const activity = activities[it.activityId];
              if (!activity) return null;

              // Determine if activity has outcomes attached
              const hasOutcomes = activity.outcomes && activity.outcomes.length > 0;

              return (
                <div
                  key={it.id}
                  className={`mt-1 text-sm p-1 border rounded ${hasOutcomes ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div>{activity.title}</div>

                  {/* Display outcome tags */}
                  {hasOutcomes && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activity.outcomes?.map(({ outcome }) => (
                        <OutcomeTag key={outcome.id} outcome={outcome} size="small" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
