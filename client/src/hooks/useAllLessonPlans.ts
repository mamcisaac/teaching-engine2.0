import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/core/client';
import { handleApiError } from '../utils/errorHandler';
import type { ETFOLessonPlanWithRelations } from './useLessonPlans';

/**
 * Fetches ALL lesson plans for hierarchy view
 * This loads all 970 lessons using multiple requests - use sparingly!
 */
export function useAllLessonPlans() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['allLessonPlans'],
    queryFn: async () => {
      try {
        const allLessons: ETFOLessonPlanWithRelations[] = [];
        const limit = 100; // Max allowed by server
        let offset = 0;
        let hasMore = true;
        
        // Fetch lessons in batches of 100
        while (hasMore) {
          const response = await apiClient.get<{ items: { lessonPlans: ETFOLessonPlanWithRelations[]; pagination: { total: number, hasMore: boolean } } }>(
            `/api/etfo-lesson-plans?limit=${limit}&offset=${offset}`
          );
          
          const batch = response.data.items.lessonPlans;
          allLessons.push(...batch);
          
          // Check if there are more lessons to fetch
          hasMore = response.data.items.pagination.hasMore;
          offset += limit;
          
          // Safety check to prevent infinite loops
          if (offset > 2000) break;
        }
        
        return allLessons;
      } catch (error) {
        handleApiError(error, 'Failed to fetch all lesson plans');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes since this is a heavy query
  });

  return {
    lessonPlans: data,
    loading: isLoading,
    error,
    refetch
  };
}