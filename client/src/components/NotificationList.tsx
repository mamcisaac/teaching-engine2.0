import { useNotifications, useMarkNotificationRead } from '../api';

export default function NotificationList() {
  const { data = [] } = useNotifications();
  const markRead = useMarkNotificationRead();

  if (!data.length) return <div>No notifications</div>;

  return (
    <ul className="space-y-2">
      {data.map((n) => (
        <li key={n.id} className="border p-2 rounded flex justify-between">
          <span>{n.message}</span>
          {!n.read && (
            <button
              className="px-1 text-sm bg-blue-600 text-white"
              onClick={() => markRead.mutate(n.id)}
            >
              Mark Read
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
