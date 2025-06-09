import { useResourcesByActivity, useDeleteResource } from '../api';

interface Props {
  activityId: number;
}

export default function ResourceList({ activityId }: Props) {
  const { data = [] } = useResourcesByActivity(activityId);
  const del = useDeleteResource();
  return (
    <ul className="space-y-1">
      {data.map((r) => (
        <li key={r.id} className="flex justify-between border p-1">
          <a href={r.url} target="_blank" rel="noreferrer" className="underline">
            {r.filename}
          </a>
          <button className="text-sm text-red-600" onClick={() => del.mutate(r.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
