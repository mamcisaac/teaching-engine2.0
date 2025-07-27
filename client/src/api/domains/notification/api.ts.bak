import type { Notification } from '../../../types';
import { apiClient } from '../../core/client';

// API endpoints
export const notificationApi = {
  // Get all notifications
  getAll: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>('/api/notifications');
    return data;
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ count: number }>('/api/notifications/unread/count');
    return data.count;
  },

  // Get notification by ID
  getById: async (id: number): Promise<Notification> => {
    const { data } = await apiClient.get<Notification>(`/api/notifications/${id}`);
    return data;
  },

  // Mark notification as read
  markAsRead: async (id: number): Promise<Notification> => {
    const { data } = await apiClient.put<Notification>(`/api/notifications/${id}/read`);
    return data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ count: number }> => {
    const { data } = await apiClient.put<{ count: number }>('/api/notifications/read-all');
    return data;
  },

  // Delete notification
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/notifications/${id}`);
  },

  // Create notification (for system use)
  create: async (input: {
    message: string;
    type?: string;
    dueDate?: string;
  }): Promise<Notification> => {
    const { data } = await apiClient.post<Notification>('/api/notifications', input);
    return data;
  },
};