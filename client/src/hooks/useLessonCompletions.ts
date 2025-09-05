/**
 * Hook for managing lesson completion state
 * Used ONLY in parent components (TodayView, WeekView) not in individual checkboxes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../api/core/client';
import { handleApiError } from '../utils/errorHandler';

// Types
export interface LessonCompletion {
  id: string;
  userId: number;
  lessonId: string;
  completedAt: string;
  notes?: string;
  actualDuration?: number;
  wentWell: boolean;
  needsFollowUp: boolean;
  lesson?: {
    id: string;
    title: string;
    date: string;
    subject?: string;
    unitPlanId: string;
  };
}

export interface CompletionProgress {
  completed: number;
  total: number;
  percentage: number;
}

/**
 * Single instance hook for managing lesson completions
 * CRITICAL: Only use ONE instance per page to avoid state conflicts
 */
export function useLessonCompletions(lessonIds?: string[]) {
  const queryClient = useQueryClient();

  // Build query key based on lessonIds for proper caching
  const queryKey = lessonIds && lessonIds.length > 0 
    ? ['lessonCompletions', { lessonIds }]
    : ['lessonCompletions'];

  // Fetch completions for the current user (filtered by lessonIds if provided)
  const { data: completions = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      // Build URL with query parameters if lessonIds provided
      let url = '/api/lesson-completions';
      if (lessonIds && lessonIds.length > 0) {
        const params = new URLSearchParams();
        lessonIds.forEach(id => params.append('lessonIds[]', id));
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get<{ completions: LessonCompletion[] }>(url);
      return response.completions;
    },
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 300000, // Keep cache for 5 minutes (formerly cacheTime)
  });

  // Create a Map for O(1) lookup of completion status
  const completionMap = new Map(
    completions.map(c => [c.lessonId, c])
  );

  // Toggle completion mutation
  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ lessonId, isCompleted }: { lessonId: string; isCompleted: boolean }) => {
      if (isCompleted) {
        // Mark as incomplete (delete)
        await apiClient.delete(`/api/lesson-completions/${lessonId}`);
        return { action: 'deleted', lessonId };
      } else {
        // Mark as complete (create)
        const response = await apiClient.post<LessonCompletion>(
          '/api/lesson-completions',
          { lessonId }
        );
        return { action: 'created', completion: response };
      }
    },
    onMutate: async ({ lessonId, isCompleted }) => {
      // Cancel any outgoing refetches for all completion queries
      await queryClient.cancelQueries({ queryKey: ['lessonCompletions'] });

      // Snapshot the previous value from the current query
      const previousCompletions = queryClient.getQueryData<LessonCompletion[]>(queryKey);

      // Optimistically update the current query cache
      queryClient.setQueryData<LessonCompletion[]>(queryKey, old => {
        if (!old) return old;
        
        if (isCompleted) {
          // Remove completion
          return old.filter(c => c.lessonId !== lessonId);
        } else {
          // Add completion
          const newCompletion: LessonCompletion = {
            id: `temp-${lessonId}`,
            userId: 0, // Will be replaced by server
            lessonId,
            completedAt: new Date().toISOString(),
            wentWell: true,
            needsFollowUp: false
          };
          return [...old, newCompletion];
        }
      });

      return { previousCompletions };
    },
    onError: (err, _variables, context) => {
      // If mutation fails, use the context to roll back
      if (context?.previousCompletions) {
        queryClient.setQueryData(queryKey, context.previousCompletions);
      }
      
      const errorMessage = handleApiError(err);
      toast.error(`Failed to update completion: ${errorMessage}`);
    },
    onSuccess: (result) => {
      if (result.action === 'created') {
        toast.success('Lesson marked as complete');
      } else {
        toast.success('Lesson marked as incomplete');
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['lessonCompletions'] });
    }
  });

  // Update completion with notes
  const updateCompletionMutation = useMutation({
    mutationFn: async (data: {
      lessonId: string;
      notes?: string;
      actualDuration?: number;
      wentWell?: boolean;
      needsFollowUp?: boolean;
    }) => {
      const response = await apiClient.put<LessonCompletion>(
        `/api/lesson-completions/${data.lessonId}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      toast.success('Completion details updated');
      queryClient.invalidateQueries({ queryKey: ['lessonCompletions'] });
    },
    onError: (err) => {
      const errorMessage = handleApiError(err);
      toast.error(`Failed to update details: ${errorMessage}`);
    }
  });

  // Fetch progress for specific date range
  const fetchProgress = async (startDate?: string, endDate?: string): Promise<CompletionProgress> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<CompletionProgress>(
      `/api/lesson-completions/progress${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response;
  };

  // Helper functions
  const isCompleted = (lessonId: string): boolean => {
    return completionMap.has(lessonId);
  };

  const getCompletion = (lessonId: string): LessonCompletion | undefined => {
    return completionMap.get(lessonId);
  };

  const toggleCompletion = (lessonId: string, _currentState?: boolean) => {
    const isCurrentlyCompleted = isCompleted(lessonId);
    toggleCompletionMutation.mutate({ lessonId, isCompleted: isCurrentlyCompleted });
  };

  // Calculate progress for provided lesson IDs
  const calculateProgress = (): CompletionProgress => {
    if (!lessonIds || lessonIds.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = lessonIds.filter(id => isCompleted(id)).length;
    const total = lessonIds.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  return {
    // Data
    completions,
    completionMap,
    
    // Loading states
    isLoading,
    isToggling: toggleCompletionMutation.isPending,
    isUpdating: updateCompletionMutation.isPending,
    
    // Error states
    error,
    
    // Functions
    isCompleted,
    getCompletion,
    toggleCompletion,
    updateCompletion: updateCompletionMutation.mutate,
    calculateProgress,
    fetchProgress,
    
    // Progress for provided lesson IDs
    progress: calculateProgress()
  };
}