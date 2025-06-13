import { useNotificationContext } from '../contexts/NotificationContext';

interface Props {
  onRecovery?: () => void;
}

export default function PlannerNotificationBanner({ onRecovery }: Props) {
  const { notifications } = useNotificationContext();

  // Ensure notifications is an array before calling find
  const note = Array.isArray(notifications)
    ? notifications.find((n) => n && !n.read && n.message && n.message.includes('Milestone'))
    : null;

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
