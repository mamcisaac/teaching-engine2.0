import { Link } from 'react-router-dom';
import type { Subject } from '../api';

interface Props {
  subjects: Subject[];
}

export default function SubjectList({ subjects }: Props) {
  return (
    <ul>
      {subjects.map((s) => (
        <li key={s.id}>
          <Link to={`/subjects/${s.id}`}>{s.name}</Link>
        </li>
      ))}
    </ul>
  );
}
