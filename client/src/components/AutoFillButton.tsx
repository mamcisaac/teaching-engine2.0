import { useGeneratePlan, LessonPlan } from '../api';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
  weekStart: string;
  onGenerated?: (plan: LessonPlan) => void;
}

export default function AutoFillButton({ weekStart, onGenerated }: Props) {
  const generate = useGeneratePlan();
  const handleClick = () =>
    generate.mutate(weekStart, {
      onSuccess: (plan) => {
        toast.success('Plan generated! Review the materials list.');
        onGenerated?.(plan);
      },
      onError: (err) => {
        if (
          axios.isAxiosError(err) &&
          err.response?.status === 400 &&
          typeof err.response.data?.error === 'string'
        ) {
          toast.error(err.response.data.error);
        } else {
          toast.error('Failed to generate plan');
        }
      },
    });

  return (
    <button
      className="px-2 py-1 bg-blue-600 text-white disabled:opacity-50 flex items-center gap-2"
      onClick={handleClick}
      disabled={generate.isPending}
    >
      {generate.isPending && (
        <svg aria-label="loading" className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      <span>{generate.isPending ? 'Filling...' : 'Auto Fill'}</span>
    </button>
  );
}
