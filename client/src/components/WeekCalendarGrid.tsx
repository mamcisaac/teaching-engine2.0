import type { WeeklyScheduleItem, Activity } from '../api';

interface Props {
  schedule: WeeklyScheduleItem[];
  onDrop: (day: number, activityId: number) => void;
  activities: Record<number, Activity>;
}

export default function WeekCalendarGrid({ schedule, onDrop, activities }: Props) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="grid grid-cols-5 gap-2">
      {days.map((d, idx) => {
        const item = schedule.find((s) => s.day === idx);
        const title = item ? activities[item.activityId]?.title : '';
        return (
          <div
            key={idx}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = Number(e.dataTransfer.getData('text/plain'));
              onDrop(idx, id);
            }}
            className="h-24 border flex items-center justify-center bg-gray-50"
          >
            <span>{d}</span>
            {title && <div className="mt-2 text-sm">{title}</div>}
          </div>
        );
      })}
    </div>
  );
}
