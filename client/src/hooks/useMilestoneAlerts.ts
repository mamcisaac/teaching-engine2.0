import { useQuery } from '@tanstack/react-query';
import { MilestoneAlert } from '../components/MilestoneAlertCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch milestone alerts from the API
 */
const fetchMilestoneAlerts = async (classId?: string): Promise<MilestoneAlert[]> => {
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

/**
 * Hook to get milestone alerts
 */
export const useMilestoneAlerts = (classId?: string) => {
  return useQuery({
    queryKey: ['milestoneAlerts', classId],
    queryFn: () => fetchMilestoneAlerts(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export default useMilestoneAlerts;
