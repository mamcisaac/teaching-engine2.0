import { useNotificationContext } from '../contexts/NotificationContext';

interface Props {
  onRecovery?: () => void;
}

export default function PlannerNotificationBanner({ onRecovery }: Props) {
  const { notifications } = useNotificationContext();
  const note = notifications.find((n) => !n.read && n.message.includes('Milestone'));
  if (!note) return null;
  return (
    <div
      className="bg-yellow-100 border-l-4 border-yellow-500 p-2 flex justify-between items-center"
      data-testid="planner-alert"
    >
      <span>{note.message}</span>
      {onRecovery && (
        <button onClick={onRecovery} className="text-sm underline">
          Insert Recovery Activity
        </button>
      )}
    </div>
  );
}
