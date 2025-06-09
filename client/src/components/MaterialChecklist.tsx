import { useMaterialList } from '../api';

interface Props {
  weekStart: string;
}

export default function MaterialChecklist({ weekStart }: Props) {
  const { data } = useMaterialList(weekStart);
  if (!data) return null;
  return (
    <ul className="list-disc pl-5 space-y-1">
      {data.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
