import { createContext, useContext } from 'react';
import { useNotifications, useMarkNotificationRead, Notification } from '../api';
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
  } = useNotifications({
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (authentication issues)
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

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
