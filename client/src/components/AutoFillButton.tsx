import { useGeneratePlan } from '../api';
import type { LessonPlan } from '../types';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from './ui/Button';

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
    <Button
      variant="primary"
      size="sm"
      onClick={handleClick}
      loading={generate.isPending}
    >
      {generate.isPending ? 'Filling...' : 'Auto Fill'}
    </Button>
  );
}
