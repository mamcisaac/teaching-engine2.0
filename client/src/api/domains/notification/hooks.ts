import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { notificationApi } from './api';
// import type { Notification } from '../../../types';

// Query hooks
export const useNotifications = () =>
  useQuery({
    queryKey: queryKeys.notification.all,
    queryFn: notificationApi.getAll,
  });

export const useUnreadNotificationsCount = () =>
  useQuery({
    queryKey: queryKeys.notification.unreadCount,
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 60000, // Refresh every minute
  });

export const useNotification = (id: number) =>
  useQuery({
    queryKey: queryKeys.notification.detail(id),
    queryFn: () => notificationApi.getById(id),
    enabled: !!id,
  });

// Mutation hooks
export const useMarkNotificationAsRead = () => {
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

export const useMarkAllNotificationsAsRead = () => {
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

export const useDeleteNotification = () => {
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

export const useCreateNotification = () => {
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