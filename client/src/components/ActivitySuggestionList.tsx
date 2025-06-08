import type { Activity } from '../api';

interface Props {
  activities: Activity[];
}

export default function ActivitySuggestionList({ activities }: Props) {
  return (
    <ul className="space-y-2">
      {activities.map((a) => (
        <li
          key={a.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', String(a.id))}
          className="border p-2 bg-white cursor-grab"
        >
          {a.title}
        </li>
      ))}
    </ul>
  );
}
