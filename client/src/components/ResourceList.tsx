import { Resource, useDeleteResource } from '../api';

interface Props {
  resources: Resource[];
}

export default function ResourceList({ resources }: Props) {
  const remove = useDeleteResource();
  return (
    <ul className="space-y-2">
      {resources.map((r) => (
        <li key={r.id} className="flex items-center gap-2 border p-2">
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex-1">
            {r.filename}
          </a>
          <button className="px-1 text-sm bg-red-600 text-white" onClick={() => remove.mutate(r.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
