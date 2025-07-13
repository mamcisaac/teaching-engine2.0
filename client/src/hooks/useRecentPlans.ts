import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../api/core/client';
import type { RecentPlan } from '../components/planning/RecentPlans';
import { useAuth } from '../contexts/AuthContext';

interface UseRecentPlansOptions {
  limit?: number;
}

export function useRecentPlans(options?: UseRecentPlansOptions): ReturnType<typeof useQuery<RecentPlan[]>> {
  const { isAuthenticated } = useAuth();
  
  return useQuery<RecentPlan[]>({
    queryKey: ['recent-plans', options?.limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }
      const response = await apiClient.get(`/api/recent-plans?${params.toString()}`);
      return response.data;
    },
    enabled: isAuthenticated, // Only run when authenticated
    staleTime: 30000, // 30 seconds
  });
}

export function useTrackPlanAccess(): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ planType, planId }: { planType: string; planId: string }) => {
      const response = await apiClient.post('/api/recent-plans/track', {
        planType,
        planId,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate recent plans cache to update the list
      void queryClient.invalidateQueries({ queryKey: ['recent-plans'] });
    },
  });
}

export function useClearRecentPlans(): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/api/recent-plans/clear');
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recent-plans'] });
    },
  });
}

// Hook to duplicate plans
export function useDuplicatePlan(): ReturnType<typeof useMutation> {
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
      
      const response = await apiClient.post(endpoint, {
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
      
      void queryClient.invalidateQueries({ queryKey: [queryKey] });
      void queryClient.invalidateQueries({ queryKey: ['recent-plans'] });
    },
  });
}