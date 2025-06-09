import { createContext, useContext } from 'react';
import { useNotifications, useMarkNotificationRead, Notification } from '../api';

interface NotificationContextValue {
  notifications: Notification[];
  markRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  markRead: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data = [] } = useNotifications();
  const markMutation = useMarkNotificationRead();
  const markRead = (id: number) => markMutation.mutate(id);
  return (
    <NotificationContext.Provider value={{ notifications: data, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => useContext(NotificationContext);
