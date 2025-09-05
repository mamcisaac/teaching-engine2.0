import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { 
  startNextUnit, 
  scheduleUnit, 
  scheduleAllLessons, 
  getSchedulingStats, 
  getCalendarSummary
} from './api';
import type {
  StartNextUnitResponse,
  ScheduleAllLessonsResponse,
  SchedulingStats,
  CalendarSummaryData
} from './api';

/**
 * Hook to start scheduling the next unit for a subject
 */
export function useStartNextUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subject: string) => startNextUnit(subject),
    onSuccess: (data) => {
      toast.success(data.message || `Successfully scheduled ${data.data.unitTitle}`);
      
      // Invalidate relevant queries to refresh the UI
      void queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['scheduling-stats'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        && error.response && typeof error.response === 'object' && 'data' in error.response
        && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        && typeof error.response.data.message === 'string'
        ? error.response.data.message 
        : 'Failed to start next unit';
      toast.error(errorMessage);
      console.error('Start next unit error:', error);
    }
  });
}

/**
 * Hook to schedule a specific unit
 */
export function useScheduleUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => scheduleUnit(unitId),
    onSuccess: (data) => {
      toast.success(data.message || `Successfully scheduled unit`);
      
      // Invalidate relevant queries
      void queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['scheduling-stats'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        && error.response && typeof error.response === 'object' && 'data' in error.response
        && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        && typeof error.response.data.message === 'string'
        ? error.response.data.message 
        : 'Failed to schedule unit';
      toast.error(errorMessage);
      console.error('Schedule unit error:', error);
    }
  });
}

/**
 * Hook to schedule all unscheduled lessons
 */
export function useScheduleAllLessons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scheduleAllLessons(),
    onSuccess: (data) => {
      toast.success(data.message || 'Successfully scheduled all lessons');
      
      // Invalidate all planning-related queries
      void queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['scheduling-stats'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        && error.response && typeof error.response === 'object' && 'data' in error.response
        && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        && typeof error.response.data.message === 'string'
        ? error.response.data.message 
        : 'Failed to schedule all lessons';
      toast.error(errorMessage);
      console.error('Schedule all lessons error:', error);
    }
  });
}

/**
 * Hook to get scheduling statistics
 */
export function useSchedulingStats() {
  return useQuery({
    queryKey: ['scheduling-stats'],
    queryFn: getSchedulingStats,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get calendar summary
 */
export function useCalendarSummary() {
  return useQuery({
    queryKey: ['calendar-summary'],
    queryFn: getCalendarSummary,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}