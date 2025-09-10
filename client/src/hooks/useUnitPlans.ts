import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/core/client';
import { handleApiError } from '../utils/errorHandler';
import type { UnitPlan } from './useETFOPlanning';

export interface UnitPlanWithRelations extends UnitPlan {
  longRangePlan?: any;
  lessonPlans?: any[];
  expectations?: any[];
  resources?: any[];
  _count?: {
    lessonPlans: number;
    expectations: number;
    resources: number;
  };
}

export function useUnitPlans() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unitPlans'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ items: UnitPlanWithRelations[] }>(
          '/api/unit-plans'
        );
        return response.data.items;
      } catch (error) {
        handleApiError(error, 'Failed to fetch unit plans');
        throw error;
      }
    }
  });

  return {
    unitPlans: data,
    loading: isLoading,
    error,
    refetch
  };
}