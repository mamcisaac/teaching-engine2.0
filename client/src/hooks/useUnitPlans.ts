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
        const response = await apiClient.get<{ items: { unitPlans: UnitPlanWithRelations[]; pagination: any } | UnitPlanWithRelations[] }>(
          '/api/unit-plans?limit=100'
        );
        // Handle nested structure
        if (response.data.items && typeof response.data.items === 'object' && 'unitPlans' in response.data.items) {
          return response.data.items.unitPlans;
        }
        // Handle direct array
        if (Array.isArray(response.data.items)) {
          return response.data.items;
        }
        return [];
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