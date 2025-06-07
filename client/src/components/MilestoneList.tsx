import { Link } from 'react-router-dom';
import type { Milestone } from '../api';

interface Props {
  milestones: Milestone[];
}

export default function MilestoneList({ milestones }: Props) {
  return (
    <ul>
      {milestones.map((m) => (
        <li key={m.id}>
          <Link to={`/milestones/${m.id}`}>{m.title}</Link>
        </li>
      ))}
    </ul>
  );
}
