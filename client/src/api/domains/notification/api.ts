import { apiClient } from '../../core/client';
import type { Notification } from '../../../types';

// API endpoints
export const notificationApi = {
  // Get all notifications
  getAll: async () => {
    const { data } = await apiClient.get<Notification[]>('/api/notifications');
    return data;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const { data } = await apiClient.get<{ count: number }>('/api/notifications/unread/count');
    return data.count;
  },

  // Get notification by ID
  getById: async (id: number) => {
    const { data } = await apiClient.get<Notification>(`/api/notifications/${id}`);
    return data;
  },

  // Mark notification as read
  markAsRead: async (id: number) => {
    const { data } = await apiClient.put<Notification>(`/api/notifications/${id}/read`);
    return data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const { data } = await apiClient.put<{ count: number }>('/api/notifications/read-all');
    return data;
  },

  // Delete notification
  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/api/notifications/${id}`);
    return data;
  },

  // Create notification (for system use)
  create: async (input: {
    message: string;
    type?: string;
    dueDate?: string;
  }) => {
    const { data } = await apiClient.post<Notification>('/api/notifications', input);
    return data;
  },
};