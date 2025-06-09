import type { WeeklyScheduleItem, Activity } from '../api';
import { useDroppable } from '@dnd-kit/core';

interface Props {
  schedule: WeeklyScheduleItem[];
  activities: Record<number, Activity>;
}

export default function WeekCalendarGrid({ schedule, activities }: Props) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="grid grid-cols-5 gap-2">
      {days.map((d, idx) => {
        const item = schedule.find((s) => s.day === idx);
        const title = item ? activities[item.activityId]?.title : '';
        const { isOver, setNodeRef } = useDroppable({ id: idx, data: { day: idx } });
        return (
          <div
            key={idx}
            ref={setNodeRef}
            data-testid={`day-${idx}`}
            className={`h-24 border flex items-center justify-center bg-gray-50 ${isOver ? 'bg-blue-100' : ''}`}
          >
            <span>{d}</span>
            {title && <div className="mt-2 text-sm">{title}</div>}
          </div>
        );
      })}
    </div>
  );
}
