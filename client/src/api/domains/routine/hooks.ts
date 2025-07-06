/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { routineApi } from './api';
import type {
  DailyOralRoutine,
  ClassRoutine,
  RoutineFilters,
  RoutineTemplateInput,
  DailyRoutineInput,
} from './api';

// Template query hooks
export const useRoutineTemplates = (filters?: RoutineFilters) =>
  useQuery({
    queryKey: queryKeys.routine.templates(filters),
    queryFn: () => routineApi.templates.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useRoutineTemplate = (id: number) =>
  useQuery({
    queryKey: ['routine-template', id],
    queryFn: () => routineApi.templates.getById(id),
    enabled: !!id,
  });

export const usePublicRoutineTemplates = (filters?: RoutineFilters) =>
  useQuery({
    queryKey: ['public-routine-templates', filters],
    queryFn: () => routineApi.templates.getPublic(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Daily routine query hooks
export const useDailyRoutines = (filters?: RoutineFilters) =>
  useQuery({
    queryKey: queryKeys.routine.daily(filters),
    queryFn: () => routineApi.daily.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

export const useDailyRoutine = (id: number) =>
  useQuery({
    queryKey: ['daily-routine', id],
    queryFn: () => routineApi.daily.getById(id),
    enabled: !!id,
  });

export const useDailyRoutinesByDate = (date: string) =>
  useQuery({
    queryKey: ['daily-routines-by-date', date],
    queryFn: () => routineApi.daily.getByDate(date),
    enabled: !!date,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

export const useRoutineSuggestions = (date: string) =>
  useQuery({
    queryKey: ['routine-suggestions', date],
    queryFn: () => routineApi.daily.getSuggestions(date),
    enabled: !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Class routine query hooks
export const useClassRoutines = (): UseQueryResult<unknown> =>
  useQuery({
    queryKey: queryKeys.routine.class,
    queryFn: routineApi.class.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

export const useClassRoutine = (id: number) =>
  useQuery({
    queryKey: ['class-routine', id],
    queryFn: () => routineApi.class.getById(id),
    enabled: !!id,
  });

// Statistics query hooks
export const useRoutineStats = (filters?: { startDate?: string; endDate?: string }) =>
  useQuery({
    queryKey: queryKeys.routine.stats(filters),
    queryFn: () => routineApi.stats.getStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useEngagementTrends = (startDate: string, endDate: string) =>
  useQuery({
    queryKey: ['engagement-trends', startDate, endDate],
    queryFn: () => routineApi.stats.getEngagementTrends(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useCompletionRates = (period: 'week' | 'month' | 'quarter') =>
  useQuery({
    queryKey: ['completion-rates', period],
    queryFn: () => routineApi.stats.getCompletionRates(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Search hooks
export const useRoutineSearch = (query: string, type: 'templates' | 'daily' | 'class' = 'templates') =>
  useQuery({
    queryKey: ['routine-search', query, type],
    queryFn: () => routineApi.search(query, type),
    enabled: !!query && query.length > 1,
    staleTime: 30 * 1000, // 30 seconds
  });

export const useRoutineCategories = (): UseQueryResult<unknown> =>
  useQuery({
    queryKey: ['routine-categories'],
    queryFn: routineApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

export const useRoutineTags = (): UseQueryResult<unknown> =>
  useQuery({
    queryKey: ['routine-tags'],
    queryFn: routineApi.getTags,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Template mutation hooks
export const useCreateRoutineTemplate = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: RoutineTemplateInput) => routineApi.templates.create(template),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      void queryClient.invalidateQueries({ queryKey: ['routine-categories'] });
      void queryClient.invalidateQueries({ queryKey: ['routine-tags'] });
      
      showSuccessToast('Routine template created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create routine template'),
  });
};

export const useUpdateRoutineTemplate = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<RoutineTemplateInput> }) =>
      routineApi.templates.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['routine-template', data.id], data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      void queryClient.invalidateQueries({ queryKey: ['routine-tags'] });
      
      showSuccessToast('Routine template updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update routine template'),
  });
};

export const useDeleteRoutineTemplate = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineApi.templates.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['routine-template', id] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Routine template deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete routine template'),
  });
};

export const useDuplicateRoutineTemplate = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineApi.templates.duplicate(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Routine template duplicated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to duplicate routine template'),
  });
};

export const useImportPublicTemplate = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: number) => routineApi.templates.importFromPublic(templateId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Template imported successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to import template'),
  });
};

// Daily routine mutation hooks
export const useCreateDailyRoutine = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routine: DailyRoutineInput) => routineApi.daily.create(routine),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      void queryClient.invalidateQueries({ queryKey: ['daily-routines-by-date', data.date] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.stats() });
      
      showSuccessToast('Daily routine created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create daily routine'),
  });
};

export const useUpdateDailyRoutine = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<DailyRoutineInput> }) =>
      routineApi.daily.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['daily-routine', data.id], data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      void queryClient.invalidateQueries({ queryKey: ['daily-routines-by-date', data.date] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.stats() });
      
      showSuccessToast('Daily routine updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update daily routine'),
  });
};

export const useDeleteDailyRoutine = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineApi.daily.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['daily-routine', id] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.stats() });
      
      showSuccessToast('Daily routine deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete daily routine'),
  });
};

export const useMarkRoutineCompleted = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: {
        actualDuration?: number;
        studentEngagement?: 'low' | 'medium' | 'high';
        notes?: string;
        adaptations?: string;
      };
    }) => routineApi.daily.markCompleted(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['daily-routine', data.id], data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      void queryClient.invalidateQueries({ queryKey: ['daily-routines-by-date', data.date] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.stats() });
      
      showSuccessToast('Routine marked as completed');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to mark routine as completed'),
  });
};

export const useCreateWeeklyRoutines = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startDate, templateIds }: { startDate: string; templateIds: number[] }) =>
      routineApi.daily.createWeekly(startDate, templateIds),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      
      // Invalidate specific dates
      data.forEach(routine => {
        void queryClient.invalidateQueries({ queryKey: ['daily-routines-by-date', routine.date] });
      });
      
      showSuccessToast(`${data.length} routines created for the week`);
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create weekly routines'),
  });
};

// Class routine mutation hooks
export const useCreateClassRoutine = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routine: Omit<ClassRoutine, 'id' | 'createdAt' | 'updatedAt'>) =>
      routineApi.class.create(routine),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.class });
      
      showSuccessToast('Class routine created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create class routine'),
  });
};

export const useUpdateClassRoutine = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<ClassRoutine> }) =>
      routineApi.class.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['class-routine', data.id], data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.class });
      
      showSuccessToast('Class routine updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update class routine'),
  });
};

export const useDeleteClassRoutine = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineApi.class.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['class-routine', id] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.class });
      
      showSuccessToast('Class routine deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete class routine'),
  });
};

// Media mutation hooks
export const useUploadRoutineAudio = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, audioFile }: { templateId: number; audioFile: File }) =>
      routineApi.media.uploadAudio(templateId, audioFile),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['routine-template', variables.templateId] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Audio uploaded successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to upload audio'),
  });
};

export const useUploadVisualAids = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, files }: { templateId: number; files: File[] }) =>
      routineApi.media.uploadVisualAids(templateId, files),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['routine-template', variables.templateId] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Visual aids uploaded successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to upload visual aids'),
  });
};

// Import/Export hooks
export const useImportRoutines = (): UseQueryResult<unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'csv' | 'json' }) =>
      routineApi.import(file, format),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      void queryClient.invalidateQueries({ queryKey: ['routine-categories'] });
      void queryClient.invalidateQueries({ queryKey: ['routine-tags'] });
      
      showSuccessToast(
        `${data.imported} routines imported successfully${ 
        data.failed > 0 ? `, ${data.failed} failed` : ''}`
      );
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to import routines'),
  });
};

export const useExportRoutines = (): UseQueryResult<unknown> => useMutation({
    mutationFn: ({ filters, format }: { 
      filters?: RoutineFilters; 
      format?: 'csv' | 'pdf' | 'json';
    }) => routineApi.export(filters, format),
    onSuccess: (_data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(_data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `routines.${variables.format || 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Routines exported successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to export routines'),
  });