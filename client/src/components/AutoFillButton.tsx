import { useGeneratePlan } from '../api';

interface Props {
  weekStart: string;
}

export default function AutoFillButton({ weekStart }: Props) {
  const generate = useGeneratePlan();
  return (
    <button className="px-2 py-1 bg-blue-600 text-white" onClick={() => generate.mutate(weekStart)}>
      Auto Fill
    </button>
  );
}
