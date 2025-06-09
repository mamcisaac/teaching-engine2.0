import type { Activity } from '../api';
import DraggableActivity from './DraggableActivity';

interface Props {
  activities: Activity[];
}

export default function ActivitySuggestionList({ activities }: Props) {
  return (
    <ul className="space-y-2">
      {activities.map((a) => (
        <DraggableActivity key={a.id} activity={a} />
      ))}
    </ul>
  );
}
