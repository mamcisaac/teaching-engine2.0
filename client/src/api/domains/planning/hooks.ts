import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { 
  YearPlanEntry, 
  DailyPlan, 
  MaterialList,
  LessonPlan,
  PlannerSuggestion
} from '../../../types';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { planningApi } from './api';

// Query Hooks
export const useYearPlan = (teacherId: number, year: number): UseQueryResult<YearPlanEntry[]> =>
  useQuery({
    queryKey: queryKeys.planning.yearPlan(teacherId, year),
    queryFn: () => planningApi.getYearPlan(teacherId, year),
    enabled: !!teacherId && !!year,
  });

export const useDailyPlan = (date: string): UseQueryResult<DailyPlan> =>
  useQuery({
    queryKey: queryKeys.planning.dailyPlan(date),
    queryFn: () => planningApi.getDailyPlan(date),
    enabled: !!date,
  });

export const useLessonPlan = (weekStart: string): UseQueryResult<LessonPlan> => useQuery({
    queryKey: queryKeys.planning.lessonPlan(weekStart),
    queryFn: () => planningApi.getLessonPlan(weekStart),
    enabled: !!weekStart,
  });

export const useMaterialList = (weekStart: string): UseQueryResult<MaterialList> =>
  useQuery({
    queryKey: queryKeys.planning.materials(weekStart),
    queryFn: () => planningApi.getMaterialList(weekStart),
    enabled: !!weekStart,
  });

export const useMaterialDetails = (weekStart: string): UseQueryResult<{ items: { category: string; items: string[] }[] }> =>
  useQuery({
    queryKey: queryKeys.planning.materials(weekStart),
    queryFn: () => planningApi.getMaterialDetails(weekStart),
    enabled: !!weekStart,
  });

export const usePlannerSuggestions = (weekStart: string, filters?: Record<string, boolean>): UseQueryResult<PlannerSuggestion[]> =>
  useQuery({
    queryKey: queryKeys.planning.suggestions(weekStart),
    queryFn: () => planningApi.getPlannerSuggestions(weekStart, filters),
    enabled: !!weekStart,
  });

// Mutation Hooks
export const useShareYearPlan = (): UseMutationResult<
  { success: boolean; message?: string },
  Error,
  { recipientEmail: string; yearPlan: YearPlanEntry[] }
> => useMutation({
    mutationFn: planningApi.shareYearPlan,
    onSuccess: () => {
      showSuccessToast('Year plan shared successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to share year plan'),
  });

export const useUpdateDailyPlan = (): UseMutationResult<DailyPlan, Error, DailyPlan> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningApi.updateDailyPlan,
    onSuccess: (data) => {
      showSuccessToast('Daily plan updated successfully');
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.planning.dailyPlan(data.date) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to update daily plan'),
  });
};

export const useGenerateDailyPlan = (): UseMutationResult<
  DailyPlan,
  Error,
  { date: string; subjects: string[]; duration: number }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningApi.generateDailyPlan,
    onSuccess: (data) => {
      showSuccessToast('Daily plan generated successfully');
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.planning.dailyPlan(data.date) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to generate daily plan'),
  });
};

export const useGeneratePlan = (): UseMutationResult<
  LessonPlan,
  Error,
  { weekStart: string; subjects: string[]; theme?: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningApi.generateLessonPlan,
    onSuccess: (data) => {
      showSuccessToast('Lesson plan generated successfully');
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.planning.lessonPlan(data.weekStart) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to generate lesson plan'),
  });
};

export const useDeleteResource = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningApi.deleteResource,
    onSuccess: () => {
      showSuccessToast('Resource deleted successfully');
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete resource'),
  });
};