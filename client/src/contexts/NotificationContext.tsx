import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import {
  useNotifications as useNotificationsApi,
  useMarkNotificationAsRead,
} from '../api/domains/notification';
import type { Notification } from '../types';

import { useAuth } from './AuthContext';

interface NotificationContextValue {
  notifications: Notification[];
  markRead: (id: number) => void;
  markAllRead: () => void;
  deleteNotification: (id: number) => void;
  isLoading: boolean;
  error: Error | null;
  unreadCount: number;
  hasUnread: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  // Only fetch notifications if user is authenticated and auth is initialized
  const { data: notifications = [], isLoading, error } = useNotificationsApi();

  const markMutation = useMarkNotificationAsRead();

  const markRead = (id: number) => {
    if (isAuthenticated) {
      markMutation.mutate(id);
    }
  };

  const markAllRead = () => {
    if (isAuthenticated && notifications.length > 0) {
      const unreadIds = notifications
        .filter((notification) => !notification.read)
        .map((notification) => notification.id);

      unreadIds.forEach((id) => {
 markMutation.mutate(id); 
});
    }
  };

  const deleteNotification = (_id: number) => {
    // TODO: Implement delete notification mutation
  };

  // Computed values
  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const contextValue: NotificationContextValue = {
    notifications,
    markRead,
    markAllRead,
    deleteNotification,
    isLoading,
    error,
    unreadCount,
    hasUnread,
  };

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
}

export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const useNotification = useNotificationContext;

// Additional selector hooks for performance
export const useNotificationsList = (): Notification[] => {
  const { notifications } = useNotificationContext();
  return notifications;
};

export const useUnreadCount = (): number => {
  const { unreadCount } = useNotificationContext();
  return unreadCount;
};

export const useHasUnreadNotifications = (): boolean => {
  const { hasUnread } = useNotificationContext();
  return hasUnread;
};
