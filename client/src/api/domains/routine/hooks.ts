/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routineApi } from './api';
import { queryKeys as _queryKeys, showSuccessToast, handleApiError } from '../../core/utils';
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
export const useClassRoutines = () =>
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

export const useRoutineCategories = () =>
  useQuery({
    queryKey: ['routine-categories'],
    queryFn: routineApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

export const useRoutineTags = () =>
  useQuery({
    queryKey: ['routine-tags'],
    queryFn: routineApi.getTags,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Template mutation hooks
export const useCreateRoutineTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: RoutineTemplateInput) => routineApi.templates.create(template),
    onSuccess: (__data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      queryClient.invalidateQueries({ queryKey: ['routine-categories'] });
      queryClient.invalidateQueries({ queryKey: ['routine-tags'] });
      
      showSuccessToast('Routine template created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create routine template'),
  });
};

export const useUpdateRoutineTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<RoutineTemplateInput> }) =>
      routineApi.templates.update(id, updates),
    onSuccess: (__data) => {
      queryClient.setQueryData(['routine-template', data.id], data);
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      queryClient.invalidateQueries({ queryKey: ['routine-tags'] });
      
      showSuccessToast('Routine template updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update routine template'),
  });
};

export const useDeleteRoutineTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineApi.templates.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['routine-template', id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Routine template deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete routine template'),
  });
};

export const useDuplicateRoutineTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineApi.templates.duplicate(id),
    onSuccess: (__data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Routine template duplicated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to duplicate routine template'),
  });
};

export const useImportPublicTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: number) => routineApi.templates.importFromPublic(templateId),
    onSuccess: (__data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Template imported successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to import template'),
  });
};

// Daily routine mutation hooks
export const useCreateDailyRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routine: DailyRoutineInput) => routineApi.daily.create(routine),
    onSuccess: (__data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      queryClient.invalidateQueries({ queryKey: ['daily-routines-by-date', data.date] });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.stats() });
      
      showSuccessToast('Daily routine created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create daily routine'),
  });
};

export const useUpdateDailyRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<DailyRoutineInput> }) =>
      routineApi.daily.update(id, updates),
    onSuccess: (__data) => {
      queryClient.setQueryData(['daily-routine', data.id], data);
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      queryClient.invalidateQueries({ queryKey: ['daily-routines-by-date', data.date] });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.stats() });
      
      showSuccessToast('Daily routine updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update daily routine'),
  });
};

export const useDeleteDailyRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineApi.daily.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['daily-routine', id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.stats() });
      
      showSuccessToast('Daily routine deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete daily routine'),
  });
};

export const useMarkRoutineCompleted = () => {
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
    onSuccess: (__data) => {
      queryClient.setQueryData(['daily-routine', data.id], data);
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      queryClient.invalidateQueries({ queryKey: ['daily-routines-by-date', data.date] });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.stats() });
      
      showSuccessToast('Routine marked as completed');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to mark routine as completed'),
  });
};

export const useCreateWeeklyRoutines = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ startDate, templateIds }: { startDate: string; templateIds: number[] }) =>
      routineApi.daily.createWeekly(startDate, templateIds),
    onSuccess: (__data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.daily() });
      
      // Invalidate specific dates
      data.forEach(routine => {
        queryClient.invalidateQueries({ queryKey: ['daily-routines-by-date', routine.date] });
      });
      
      showSuccessToast(`${data.length} routines created for the week`);
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create weekly routines'),
  });
};

// Class routine mutation hooks
export const useCreateClassRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routine: Omit<ClassRoutine, 'id' | 'createdAt' | 'updatedAt'>) =>
      routineApi.class.create(routine),
    onSuccess: (__data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.class });
      
      showSuccessToast('Class routine created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create class routine'),
  });
};

export const useUpdateClassRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<ClassRoutine> }) =>
      routineApi.class.update(id, updates),
    onSuccess: (__data) => {
      queryClient.setQueryData(['class-routine', data.id], data);
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.class });
      
      showSuccessToast('Class routine updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update class routine'),
  });
};

export const useDeleteClassRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => routineApi.class.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['class-routine', id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.class });
      
      showSuccessToast('Class routine deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete class routine'),
  });
};

// Media mutation hooks
export const useUploadRoutineAudio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, audioFile }: { templateId: number; audioFile: File }) =>
      routineApi.media.uploadAudio(templateId, audioFile),
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ['routine-template', variables.templateId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Audio uploaded successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to upload audio'),
  });
};

export const useUploadVisualAids = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, files }: { templateId: number; files: File[] }) =>
      routineApi.media.uploadVisualAids(templateId, files),
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({ queryKey: ['routine-template', variables.templateId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      
      showSuccessToast('Visual aids uploaded successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to upload visual aids'),
  });
};

// Import/Export hooks
export const useImportRoutines = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'csv' | 'json' }) =>
      routineApi.import(file, format),
    onSuccess: (__data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routine.templates() });
      queryClient.invalidateQueries({ queryKey: ['routine-categories'] });
      queryClient.invalidateQueries({ queryKey: ['routine-tags'] });
      
      showSuccessToast(
        `${data.imported} routines imported successfully` +
        (data.failed > 0 ? `, ${data.failed} failed` : '')
      );
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to import routines'),
  });
};

export const useExportRoutines = () => {
  return useMutation({
    mutationFn: ({ filters, format }: { 
      filters?: RoutineFilters; 
      format?: 'csv' | 'pdf' | 'json';
    }) => routineApi.export(filters, format),
    onSuccess: (_data, _variables) => {
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
};