import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/core/client';
import { handleApiError } from '../utils/errorHandler';
import type { LongRangePlan } from './useETFOPlanning';

export interface LongRangePlanWithRelations extends LongRangePlan {
  unitPlans?: any[];
  expectations?: any[];
  _count?: {
    unitPlans: number;
    expectations: number;
  };
}

export function useLongRangePlans() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['longRangePlans'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ items: LongRangePlanWithRelations[] }>(
          '/api/long-range-plans'
        );
        return response.data.items;
      } catch (error) {
        handleApiError(error, 'Failed to fetch long range plans');
        throw error;
      }
    }
  });

  return {
    longRangePlans: data,
    loading: isLoading,
    error,
    refetch
  };
}