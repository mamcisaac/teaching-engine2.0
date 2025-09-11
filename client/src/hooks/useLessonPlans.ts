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
        // For dashboard, we'll fetch all lessons using pagination
        // But for now, let's just get 100 to show the correct total count
        const response = await apiClient.get<{ items: { lessonPlans: ETFOLessonPlanWithRelations[]; pagination: { total: number } } }>(
          '/api/etfo-lesson-plans?limit=100'
        );
        // Return lessons but we should expose the total count too
        return response.data.items.lessonPlans;
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