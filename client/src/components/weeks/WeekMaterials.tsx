import { useMaterialList } from '../../api';

interface Props {
  weekStart: string;
}

export default function WeekMaterials({ weekStart }: Props): React.ReactElement {
  const { data } = useMaterialList(weekStart);
  if (!data) {
    return <div>Loading materials...</div>;
  }
  return (
    <ul className="list-disc pl-5 space-y-1">
      {data.items.map((m, _index) => (
        <li key={m}>{m}</li>
      ))}
    </ul>
  );
}
