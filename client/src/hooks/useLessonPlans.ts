import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/core/client';
import { handleApiError } from '../utils/errorHandler';
import type { ETFOLessonPlan } from './useETFOPlanning';

export interface ETFOLessonPlanWithRelations extends Omit<ETFOLessonPlan, 'unitPlan' | 'expectations'> {
  unitPlan?: any;
  expectations?: any[];
  resources?: any[];
}

export function useLessonPlans() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lessonPlans'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ items: ETFOLessonPlanWithRelations[] }>(
          '/api/etfo-lesson-plans'
        );
        return response.data.items;
      } catch (error) {
        handleApiError(error, 'Failed to fetch lesson plans');
        throw error;
      }
    }
  });

  return {
    lessonPlans: data,
    loading: isLoading,
    error,
    refetch
  };
}