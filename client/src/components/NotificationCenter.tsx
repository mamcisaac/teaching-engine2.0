import { useNotificationContext } from '../contexts/NotificationContext';

export default function NotificationCenter() {
  const { notifications, markRead } = useNotificationContext();
  if (notifications.length === 0) return <div>No notifications</div>;
  return (
    <ul className="space-y-2">
      {notifications.map((n) => (
        <li key={n.id} className="border p-2 flex justify-between">
          <span className={n.read ? 'opacity-50' : ''}>{n.message}</span>
          {!n.read && (
            <button className="text-sm underline" onClick={() => markRead(n.id)}>
              Mark read
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
