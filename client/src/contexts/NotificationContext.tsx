import { createContext, useContext } from 'react';
import { useNotifications, useMarkNotificationRead } from '../api/legacy/api';
import type { Notification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextValue {
  notifications: Notification[];
  markRead: (id: number) => void;
  isLoading: boolean;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  markRead: () => {},
  isLoading: false,
  error: null,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  // Only fetch notifications if user is authenticated
  const {
    data = [],
    isLoading,
    error,
  } = useNotifications();

  const markMutation = useMarkNotificationRead();

  const markRead = (id: number) => {
    if (isAuthenticated) {
      markMutation.mutate(id);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: data,
        markRead,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => useContext(NotificationContext);
export const useNotification = useNotificationContext;
