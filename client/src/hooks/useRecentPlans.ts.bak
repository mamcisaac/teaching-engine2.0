import type { UseMutationResult } from '@tanstack/react-query';
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
      if (options?.limit !== undefined && options.limit !== 0) {
        params.append('limit', options.limit.toString());
      }
      const response = await apiClient.get<RecentPlan[]>(`/api/recent-plans?${params.toString()}`);
      return response.data;
    },
    enabled: isAuthenticated, // Only run when authenticated
    staleTime: 30000, // 30 seconds
  });
}

interface TrackPlanAccessParams {
  planType: string;
  planId: string;
}

interface TrackPlanAccessResponse {
  success: boolean;
  timestamp: string;
}

export function useTrackPlanAccess(): UseMutationResult<TrackPlanAccessResponse, Error, TrackPlanAccessParams> {
  const queryClient = useQueryClient();
  
  return useMutation<TrackPlanAccessResponse, Error, TrackPlanAccessParams>({
    mutationFn: async ({ planType, planId }: TrackPlanAccessParams): Promise<TrackPlanAccessResponse> => {
      const response = await apiClient.post<TrackPlanAccessResponse>('/api/recent-plans/track', {
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

interface ClearRecentPlansResponse {
  success: boolean;
  message?: string;
}

export function useClearRecentPlans(): UseMutationResult<ClearRecentPlansResponse, Error, void> {
  const queryClient = useQueryClient();
  
  return useMutation<ClearRecentPlansResponse>({
    mutationFn: async (): Promise<ClearRecentPlansResponse> => {
      const response = await apiClient.delete<ClearRecentPlansResponse>('/api/recent-plans/clear');
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recent-plans'] });
    },
  });
}

interface DuplicatePlanParams {
  planType: 'long-range' | 'unit' | 'lesson';
  sourceId: string;
  title: string;
  notes?: string;
  includeSubItems?: boolean;
}

interface DuplicatePlanResponse {
  id: string;
  title: string;
  planType: string;
  createdAt: string;
}

// Hook to duplicate plans
export function useDuplicatePlan(): UseMutationResult<DuplicatePlanResponse, Error, DuplicatePlanParams> {
  const queryClient = useQueryClient();
  
  return useMutation<DuplicatePlanResponse, Error, DuplicatePlanParams>({
    mutationFn: async ({ 
      planType, 
      sourceId, 
      title, 
      notes, 
      includeSubItems 
    }: DuplicatePlanParams): Promise<DuplicatePlanResponse> => {
      const endpoint = {
        'long-range': '/api/long-range-plans/duplicate',
        'unit': '/api/unit-plans/duplicate',
        'lesson': '/api/etfo-lesson-plans/duplicate',
      }[planType];
      
      const response = await apiClient.post<DuplicatePlanResponse>(endpoint, {
        sourceId,
        title,
        notes,
        includeSubItems,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
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