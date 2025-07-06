import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { Notification } from '../../../types';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { notificationApi } from './api';

// Query hooks
export const useNotifications = (): UseQueryResult<Notification[]> =>
  useQuery({
    queryKey: queryKeys.notification.all,
    queryFn: notificationApi.getAll,
  });

export const useUnreadNotificationsCount = (): UseQueryResult<number> =>
  useQuery({
    queryKey: queryKeys.notification.unreadCount,
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 60000, // Refresh every minute
  });

export const useNotification = (id: number): UseQueryResult<Notification> =>
  useQuery({
    queryKey: queryKeys.notification.detail(id),
    queryFn: () => notificationApi.getById(id),
    enabled: !!id,
  });

// Mutation hooks
export const useMarkNotificationAsRead = (): UseMutationResult<Notification, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.unreadCount });
    },
    onError: (error) => handleApiError(error, 'Failed to mark notification as read'),
  });
};

export const useMarkAllNotificationsAsRead = (): UseMutationResult<{ count: number }, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      showSuccessToast('All notifications marked as read');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.unreadCount });
    },
    onError: (error) => handleApiError(error, 'Failed to mark all notifications as read'),
  });
};

export const useDeleteNotification = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.delete,
    onSuccess: () => {
      showSuccessToast('Notification deleted');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.unreadCount });
    },
    onError: (error) => handleApiError(error, 'Failed to delete notification'),
  });
};

export const useCreateNotification = (): UseMutationResult<Notification, Error, {
  message: string;
  type?: string;
  dueDate?: string;
}> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.create,
    onSuccess: () => {
      showSuccessToast('Notification created');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notification.unreadCount });
    },
    onError: (error) => handleApiError(error, 'Failed to create notification'),
  });
};