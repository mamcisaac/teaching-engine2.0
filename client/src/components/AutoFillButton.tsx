import { useGeneratePlan, LessonPlan } from '../api';

interface Props {
  weekStart: string;
  onGenerated?: (plan: LessonPlan) => void;
}

export default function AutoFillButton({ weekStart, onGenerated }: Props) {
  const generate = useGeneratePlan();
  return (
    <button
      className="px-2 py-1 bg-blue-600 text-white"
      onClick={() =>
        generate.mutate(weekStart, {
          onSuccess: (plan) => onGenerated?.(plan),
        })
      }
    >
      Auto Fill
    </button>
  );
}
