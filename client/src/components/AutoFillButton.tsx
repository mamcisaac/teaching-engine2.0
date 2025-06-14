import { useGeneratePlan, LessonPlan } from '../api';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
  weekStart: string;
  preserveBuffer: boolean;
  pacingStrategy: 'strict' | 'relaxed';
  onGenerated?: (plan: LessonPlan) => void;
}

export default function AutoFillButton({
  weekStart,
  preserveBuffer,
  pacingStrategy,
  onGenerated,
}: Props) {
  const generate = useGeneratePlan();
  const handleClick = () =>
    generate.mutate(
      { weekStart, preserveBuffer, pacingStrategy },
      {
        onSuccess: (plan) => {
          const filtered = plan.schedule.filter((s) => {
            const slotLen =
              s.slot?.endMin && s.slot?.startMin ? s.slot.endMin - s.slot.startMin : 0;
            const dur = s.activity?.durationMins ?? 0;
            if (dur > slotLen) {
              fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: `${s.activity.title} too long for slot`,
                  type: 'warning',
                }),
              });
              return false;
            }
            return true;
          });
          const finalPlan = { ...plan, schedule: filtered };
          toast.success('Plan generated! Review the materials list.');
          onGenerated?.(finalPlan);
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
      },
    );

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
