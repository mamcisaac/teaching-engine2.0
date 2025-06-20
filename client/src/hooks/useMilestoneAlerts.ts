import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { MilestoneAlert } from '../components/MilestoneAlertCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface AlertsResponse {
  alerts: MilestoneAlert[];
  unreadCount: number;
  totalCount: number;
}

interface AlertFilters {
  type?: 'deadline' | 'progress' | 'coverage';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isRead?: boolean;
  subjectId?: number;
}

/**
 * Fetch milestone alerts from the legacy API (for backward compatibility)
 */
const fetchLegacyMilestoneAlerts = async (classId?: string): Promise<MilestoneAlert[]> => {
  const url = new URL(`${API_BASE_URL}/alerts/milestones`);
  if (classId) {
    url.searchParams.append('classId', classId);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch milestone alerts');
  }

  return response.json();
};

// Get all milestone alerts for the authenticated user (new API)
export const useMilestoneAlerts = (filters: AlertFilters | string = {}) => {
  // Handle legacy string parameter (classId)
  if (typeof filters === 'string') {
    return useQuery({
      queryKey: ['milestoneAlerts', filters],
      queryFn: () => fetchLegacyMilestoneAlerts(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    });
  }

  // New API implementation
  return useQuery<AlertsResponse>({
    queryKey: ['milestone-alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/api/alerts?${params.toString()}`);
      return response.data;
    },
  });
};

// Get unread alert count
export const useUnreadAlertCount = () => {
  return useQuery<number>({
    queryKey: ['alert-count'],
    queryFn: async () => {
      const response = await api.get('/api/alerts/count');
      return response.data.unreadCount;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Mark an alert as read
export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (alertId) => {
      await api.patch(`/api/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        'Failed to mark alert as read: ' +
          (error.response?.data?.error || error.message || 'Unknown error'),
      );
    },
  });
};

// Mark all alerts as read
export const useMarkAllAlertsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.patch('/api/alerts/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
      toast.success('All alerts marked as read');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        'Failed to mark alerts as read: ' +
          (error.response?.data?.error || error.message || 'Unknown error'),
      );
    },
  });
};

// Dismiss an alert
export const useDismissAlert = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (alertId) => {
      await api.delete(`/api/alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
      toast.success('Alert dismissed');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        'Failed to dismiss alert: ' +
          (error.response?.data?.error || error.message || 'Unknown error'),
      );
    },
  });
};

// Create a manual alert
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MilestoneAlert,
    Error,
    {
      type: 'deadline' | 'progress' | 'coverage';
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      milestoneId: number;
    }
  >({
    mutationFn: async (alertData) => {
      const response = await api.post('/api/alerts', alertData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
      toast.success('Alert created successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        'Failed to create alert: ' +
          (error.response?.data?.error || error.message || 'Unknown error'),
      );
    },
  });
};

// Get alert statistics
export const useAlertStats = () => {
  return useQuery({
    queryKey: ['alert-stats'],
    queryFn: async () => {
      const response = await api.get('/api/alerts/stats');
      return response.data;
    },
  });
};

// Trigger manual alert check for all milestones
export const useTriggerAlertCheck = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.post('/api/alerts/check');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestone-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
      toast.success('Alert check completed');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        'Failed to check alerts: ' +
          (error.response?.data?.error || error.message || 'Unknown error'),
      );
    },
  });
};

export default useMilestoneAlerts;
