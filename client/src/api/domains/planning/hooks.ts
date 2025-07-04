import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core';

// Query Hooks
export const useYearPlan = (teacherId: number, year: number) =>
  useQuery({
    queryKey: queryKeys.planning.yearPlan(teacherId, year),
    queryFn: () => planningApi.getYearPlan(teacherId, year),
    enabled: !!teacherId && !!year,
  });

export const useDailyPlan = (date: string) =>
  useQuery({
    queryKey: queryKeys.planning.dailyPlan(date),
    queryFn: () => planningApi.getDailyPlan(date),
    enabled: !!date,
  });

export const useLessonPlan = (weekStart: string) => {
  return useQuery({
    queryKey: queryKeys.planning.lessonPlan(weekStart),
    queryFn: () => planningApi.getLessonPlan(weekStart),
    enabled: !!weekStart,
  });
};

export const useMaterialList = (weekStart: string) =>
  useQuery({
    queryKey: queryKeys.planning.materials(weekStart),
    queryFn: () => planningApi.getMaterialList(weekStart),
    enabled: !!weekStart,
  });

export const useMaterialDetails = (weekStart: string) =>
  useQuery({
    queryKey: queryKeys.planning.materials(weekStart),
    queryFn: () => planningApi.getMaterialDetails(weekStart),
    enabled: !!weekStart,
  });

export const usePlannerSuggestions = (weekStart: string, filters?: Record<string, boolean>) =>
  useQuery({
    queryKey: queryKeys.planning.suggestions(weekStart),
    queryFn: () => planningApi.getPlannerSuggestions(weekStart, filters),
    enabled: !!weekStart,
  });

// Mutation Hooks
export const useShareYearPlan = () => {
  return useMutation({
    mutationFn: planningApi.shareYearPlan,
    onSuccess: () => {
      showSuccessToast('Year plan shared successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to share year plan'),
  });
};

export const useUpdateDailyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningApi.updateDailyPlan,
    onSuccess: (data) => {
      showSuccessToast('Daily plan updated successfully');
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.planning.dailyPlan(data.date) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to update daily plan'),
  });
};

export const useGenerateDailyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningApi.generateDailyPlan,
    onSuccess: (data) => {
      showSuccessToast('Daily plan generated successfully');
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.planning.dailyPlan(data.date) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to generate daily plan'),
  });
};

export const useGeneratePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningApi.generateLessonPlan,
    onSuccess: (data) => {
      showSuccessToast('Lesson plan generated successfully');
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.planning.lessonPlan(data.weekStart) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to generate lesson plan'),
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningApi.deleteResource,
    onSuccess: () => {
      showSuccessToast('Resource deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete resource'),
  });
};