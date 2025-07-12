import { useMaterialList } from '../api/domains/planning';

interface Props {
  weekStart: string;
}

export default function MaterialChecklist({ weekStart }: Props): React.ReactElement | null {
  const { data } = useMaterialList(weekStart);
  if (data === null || data === undefined) {
return null;
}
  return (
    <ul className="list-disc pl-5 space-y-1">
      {data.items.map((item, _index) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
