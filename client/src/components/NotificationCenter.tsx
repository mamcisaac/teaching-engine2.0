import { useNotificationContext } from '../contexts/NotificationContext';

export function NotificationCenter(): React.ReactElement {
  const { notifications, markRead } = useNotificationContext();
  if (notifications.length === 0) {
return <div>No notifications</div>;
}
  return (
    <ul className="space-y-2">
      {notifications.map((n, _index) => (
        <li className="border p-2 flex justify-between" key={n.id}>
          <span className={n.read ? 'opacity-50' : ''}>{n.message}</span>
          {!n.read && (
            <button className="text-sm underline" onClick={() => {
 markRead(n.id); 
}}>
              Mark read
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
