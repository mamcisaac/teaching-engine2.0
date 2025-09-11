import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/core/client';
import { handleApiError } from '../utils/errorHandler';
import type { CurriculumExpectation } from './useETFOPlanning';

export function useCurriculumExpectations() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['curriculumExpectations'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ data?: CurriculumExpectation[], items?: CurriculumExpectation[] }>(
          '/api/curriculum-expectations'
        );
        // Handle both possible response formats
        return response.data.data || response.data.items || [];
      } catch (error) {
        handleApiError(error, 'Failed to fetch curriculum expectations');
        throw error;
      }
    }
  });

  return {
    expectations: data,
    loading: isLoading,
    error,
    refetch
  };
}