import type { Activity } from '../api';
import DraggableActivity from './DraggableActivity';

interface Props {
  activities: Activity[];
}

export default function ActivitySuggestionList({ activities }: Props) {
  // Defensive check to ensure activities is an array
  if (!activities || !Array.isArray(activities)) {
    console.warn('ActivitySuggestionList: activities is not an array:', activities);
    return <div className="text-gray-500 text-sm">No activities available</div>;
  }

  if (activities.length === 0) {
    return <div className="text-gray-500 text-sm">No activities found</div>;
  }

  return (
    <ul className="space-y-2">
      {activities.map((a) => (
        <DraggableActivity key={a.id} activity={a} />
      ))}
    </ul>
  );
}
