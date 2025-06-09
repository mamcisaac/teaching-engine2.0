import type { WeeklyScheduleItem, Activity, TimetableSlot } from '../api';
import { useDroppable } from '@dnd-kit/core';

interface Props {
  schedule: WeeklyScheduleItem[];
  activities: Record<number, Activity>;
  timetable?: TimetableSlot[];
}

export default function WeekCalendarGrid({ schedule, activities, timetable }: Props) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="grid grid-cols-5 gap-2">
      {days.map((d, idx) => {
        const items = schedule
          .filter((s) => s.day === idx)
          .sort((a, b) => (a.slot?.startMin ?? 0) - (b.slot?.startMin ?? 0));
        const daySlot = timetable?.find((t) => t.day === idx);
        const blocked = daySlot && !daySlot.subjectId;
        const label = daySlot?.subject?.name ?? (blocked ? 'Prep' : '');
        const { isOver, setNodeRef } = useDroppable({
          id: `day-${idx}`,
          data: { day: idx },
        });
        return (
          <div
            key={idx}
            ref={setNodeRef}
            data-testid={`day-${idx}`}
            className={`min-h-24 border flex flex-col items-center justify-start bg-gray-50 p-1${blocked ? ' opacity-50 pointer-events-none' : ''}${isOver ? ' bg-blue-100' : ''}`}
          >
            <span>{d}</span>
            {label && <div className="text-xs">{label}</div>}
            {items.map((it) => (
              <div key={it.id} className="mt-1 text-sm">
                {activities[it.activityId]?.title}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
