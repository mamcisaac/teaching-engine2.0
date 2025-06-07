import type { Activity } from '../api';

interface Props {
  activities: Activity[];
}

export default function ActivityList({ activities }: Props) {
  return (
    <ul>
      {activities.map((a) => (
        <li key={a.id}>{a.title}</li>
      ))}
    </ul>
  );
}
