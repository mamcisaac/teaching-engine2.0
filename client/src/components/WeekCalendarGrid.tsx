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
        const item = schedule.find((s) => s.day === idx);
        const title = item ? activities[item.activityId]?.title : '';
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
            className={`h-24 border flex flex-col items-center justify-center bg-gray-50${blocked ? ' opacity-50 pointer-events-none' : ''}${isOver ? ' bg-blue-100' : ''}`}
          >
            <span>{d}</span>
            {label && <div className="text-xs">{label}</div>}
            {title && <div className="mt-2 text-sm">{title}</div>}
          </div>
        );
      })}
    </div>
  );
}
