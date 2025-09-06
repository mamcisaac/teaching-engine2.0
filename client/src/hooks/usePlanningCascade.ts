/**
 * React Query hooks for Planning Cascade features
 * Emergency-focused hooks for panic mode planning
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { planningCascadeAPI } from '../services/planningCascadeAPI';

// Query keys
export const PLANNING_CASCADE_KEYS = {
  all: ['planning-cascade'] as const,
  cascade: () => [...PLANNING_CASCADE_KEYS.all, 'cascade'] as const,
  search: (query: string) => [...PLANNING_CASCADE_KEYS.all, 'search', query] as const,
  coverageGaps: (date: Date) => [...PLANNING_CASCADE_KEYS.all, 'coverage-gaps', date.toISOString()] as const,
  supplyPlan: (date?: Date) => [...PLANNING_CASCADE_KEYS.all, 'supply-plan', date?.toISOString() || 'today'] as const,
};

/**
 * Main hook for fetching the planning cascade tree
 */
export const usePlanningCascade = () => {
  return useQuery({
    queryKey: PLANNING_CASCADE_KEYS.cascade(),
    queryFn: () => planningCascadeAPI.getCascade(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for searching lessons in panic mode
 */
export const useSearchLessons = (
  query: string,
  options?: {
    subject?: string;
    grade?: number;
    limit?: number;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: PLANNING_CASCADE_KEYS.search(query),
    queryFn: () => planningCascadeAPI.searchLessons(query, options),
    enabled: options?.enabled !== false && query.length > 0,
    staleTime: 30 * 1000, // 30 seconds - search results change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for updating lesson status
 */
export const useUpdateLessonStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      lessonId,
      status,
      options
    }: {
      lessonId: string;
      status: 'PLANNED' | 'TAUGHT' | 'SKIPPED' | 'RESCHEDULED';
      options?: {
        taughtDate?: string;
        skippedReason?: string;
      };
    }) => planningCascadeAPI.updateLessonStatus(lessonId, status, options),
    onSuccess: () => {
      // Invalidate search queries to reflect status changes
      void queryClient.invalidateQueries({ 
        queryKey: PLANNING_CASCADE_KEYS.all 
      });
    },
  });
};

/**
 * Hook for getting coverage gaps
 */
export const useCoverageGaps = (reportCardDate: Date, includeOptional?: boolean) => {
  return useQuery({
    queryKey: PLANNING_CASCADE_KEYS.coverageGaps(reportCardDate),
    queryFn: () => planningCascadeAPI.getCoverageGaps(reportCardDate, includeOptional),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for generating supply teacher plans
 */
export const useGenerateSupplyPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (date?: Date) => planningCascadeAPI.generateSupplyPlan(date),
    onSuccess: (data, variables) => {
      // Cache the generated plan
      queryClient.setQueryData(
        PLANNING_CASCADE_KEYS.supplyPlan(variables),
        data
      );
    },
  });
};

// Export all hooks for convenience
export const planningCascadeHooks = {
  useSearchLessons,
  useUpdateLessonStatus,
  useCoverageGaps,
  useGenerateSupplyPlan,
};