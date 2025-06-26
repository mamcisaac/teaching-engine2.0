import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { RecentPlan } from '../components/planning/RecentPlans';

interface UseRecentPlansOptions {
  limit?: number;
}

export function useRecentPlans(options?: UseRecentPlansOptions) {
  return useQuery<RecentPlan[]>({
    queryKey: ['recent-plans', options?.limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }
      const response = await api.get(`/api/recent-plans?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useTrackPlanAccess() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ planType, planId }: { planType: string; planId: string }) => {
      const response = await api.post('/api/recent-plans/track', {
        planType,
        planId,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate recent plans cache to update the list
      queryClient.invalidateQueries({ queryKey: ['recent-plans'] });
    },
  });
}

export function useClearRecentPlans() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/api/recent-plans/clear');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-plans'] });
    },
  });
}

// Hook to duplicate plans
export function useDuplicatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      planType, 
      sourceId, 
      title, 
      notes, 
      includeSubItems 
    }: { 
      planType: 'long-range' | 'unit' | 'lesson';
      sourceId: string;
      title: string;
      notes?: string;
      includeSubItems?: boolean;
    }) => {
      const endpoint = {
        'long-range': '/api/long-range-plans/duplicate',
        'unit': '/api/unit-plans/duplicate',
        'lesson': '/api/etfo-lesson-plans/duplicate',
      }[planType];
      
      const response = await api.post(endpoint, {
        sourceId,
        title,
        notes,
        includeSubItems,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the relevant query based on plan type
      const queryKey = {
        'long-range': 'long-range-plans',
        'unit': 'unit-plans',
        'lesson': 'etfo-lesson-plans',
      }[variables.planType];
      
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['recent-plans'] });
    },
  });
}