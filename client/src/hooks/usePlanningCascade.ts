/**
 * React Query Hooks for Planning Cascade
 * Data fetching and state management for hierarchical planning
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../api/core/client';
import type {
  YearPlan,
  CascadeStatistics,
  LessonPlan,
  ValidationResult,
  CascadeFilter
} from '../types/planningCascade';

// Query Keys
export const CASCADE_QUERY_KEYS = {
  all: ['planning-cascade'] as const,
  yearPlan: (year: string, grade: number) => 
    [...CASCADE_QUERY_KEYS.all, 'year-plan', year, grade] as const,
  statistics: (year: string, grade: number) =>
    [...CASCADE_QUERY_KEYS.all, 'statistics', year, grade] as const,
  validation: () =>
    [...CASCADE_QUERY_KEYS.all, 'validation'] as const,
  upcoming: (days: number) =>
    [...CASCADE_QUERY_KEYS.all, 'upcoming', days] as const,
};

/**
 * Hook to fetch year plan with cascade data
 */
export function useYearPlan(year: string, grade: number) {
  return useQuery({
    queryKey: CASCADE_QUERY_KEYS.yearPlan(year, grade),
    queryFn: async (): Promise<YearPlan> => {
      const response = await apiClient.get(`/api/planning-cascade/year-plan/${year}/${grade}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch cascade statistics
 */
export function useCascadeStatistics(year: string, grade: number) {
  return useQuery({
    queryKey: CASCADE_QUERY_KEYS.statistics(year, grade),
    queryFn: async (): Promise<CascadeStatistics> => {
      const response = await apiClient.get(`/api/planning-cascade/statistics/${year}/${grade}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic)
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
  });
}

/**
 * Hook to validate curriculum coverage
 */
export function useValidateCurriculum() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ grade, year }: { grade: number; year: string }): Promise<ValidationResult> => {
      const response = await apiClient.post('/api/planning-cascade/validate', {
        grade,
        year
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries after validation
      void queryClient.invalidateQueries({ 
        queryKey: CASCADE_QUERY_KEYS.yearPlan(variables.year, variables.grade)
      });
      void queryClient.invalidateQueries({ 
        queryKey: CASCADE_QUERY_KEYS.statistics(variables.year, variables.grade)
      });
    },
  });
}

/**
 * Hook to fetch upcoming lessons
 */
export function useUpcomingLessons(daysAhead: number = 7) {
  return useQuery({
    queryKey: CASCADE_QUERY_KEYS.upcoming(daysAhead),
    queryFn: async (): Promise<LessonPlan[]> => {
      const response = await apiClient.get(`/api/planning-cascade/upcoming/${daysAhead}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update lesson status
 */
export function useUpdateLessonStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      lessonId, 
      status 
    }: { 
      lessonId: string; 
      status: 'planned' | 'taught' | 'skipped' | 'rescheduled';
    }) => {
      const response = await apiClient.patch(`/api/etfo-lesson-plans/${lessonId}/status`, {
        status
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all cascade queries to refresh data
      void queryClient.invalidateQueries({ queryKey: CASCADE_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to reschedule a lesson
 */
export function useRescheduleLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      lessonId, 
      newDate 
    }: { 
      lessonId: string; 
      newDate: Date;
    }) => {
      const response = await apiClient.patch(`/api/etfo-lesson-plans/${lessonId}/reschedule`, {
        date: newDate.toISOString()
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cascade and upcoming queries
      void queryClient.invalidateQueries({ queryKey: CASCADE_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to batch update multiple lessons
 */
export function useBatchUpdateLessons() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Array<{
      lessonId: string;
      status?: 'planned' | 'taught' | 'skipped' | 'rescheduled';
      date?: string;
    }>) => {
      const response = await apiClient.post('/api/etfo-lesson-plans/batch-update', {
        updates
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CASCADE_QUERY_KEYS.all });
    },
  });
}

/**
 * Combined hook for full cascade functionality
 */
export function usePlanningCascade(year: string, grade: number, filter?: CascadeFilter) {
  const yearPlan = useYearPlan(year, grade);
  const statistics = useCascadeStatistics(year, grade);
  const upcomingLessons = useUpcomingLessons(7);
  const validateCurriculum = useValidateCurriculum();
  const updateLessonStatus = useUpdateLessonStatus();
  const rescheduleLesson = useRescheduleLesson();
  const batchUpdateLessons = useBatchUpdateLessons();

  // Apply client-side filtering if needed
  const filteredYearPlan = yearPlan.data && filter ? 
    filterYearPlan(yearPlan.data, filter) : 
    yearPlan.data;

  return {
    // Data
    yearPlan: filteredYearPlan,
    statistics: statistics.data,
    upcomingLessons: upcomingLessons.data,
    
    // Loading states
    isLoading: yearPlan.isLoading || statistics.isLoading,
    isLoadingUpcoming: upcomingLessons.isLoading,
    
    // Error states
    error: yearPlan.error || statistics.error || upcomingLessons.error,
    
    // Mutations
    validateCurriculum,
    updateLessonStatus,
    rescheduleLesson,
    batchUpdateLessons,
    
    // Refetch functions
    refetchYearPlan: yearPlan.refetch,
    refetchStatistics: statistics.refetch,
    refetchUpcoming: upcomingLessons.refetch,
  };
}

// Helper function to filter year plan on client side
function filterYearPlan(yearPlan: YearPlan, filter: CascadeFilter): YearPlan {
  if (!filter.subjects || filter.subjects.length === 0) {
    return yearPlan;
  }

  return {
    ...yearPlan,
    subjects: yearPlan.subjects.filter(subject => 
      filter.subjects!.includes(subject.subject)
    )
  };
}

// Export all hooks for convenience
export const planningCascadeHooks = {
  useYearPlan,
  useCascadeStatistics,
  useValidateCurriculum,
  useUpcomingLessons,
  useUpdateLessonStatus,
  useRescheduleLesson,
  useBatchUpdateLessons,
  usePlanningCascade,
};