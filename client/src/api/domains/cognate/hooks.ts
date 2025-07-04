import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cognateApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core';
import type { CognatePair, CognateInput, CognateFilters } from './api';

// Query hooks
export const useCognates = (userId?: number, filters?: CognateFilters) =>
  useQuery({
    queryKey: queryKeys.cognate.all(userId),
    queryFn: () => cognateApi.getCognates(userId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useCognate = (id: number) =>
  useQuery({
    queryKey: queryKeys.cognate.detail(id),
    queryFn: () => cognateApi.getCognate(id),
    enabled: !!id,
  });

export const useCognateSearch = (query: string, filters?: CognateFilters) =>
  useQuery({
    queryKey: ['cognate-search', query, filters],
    queryFn: () => cognateApi.searchCognates(query, filters),
    enabled: !!query && query.length > 1,
    staleTime: 30 * 1000, // 30 seconds
  });

export const useCognateSuggestions = (word: string, language: 'english' | 'french') =>
  useQuery({
    queryKey: ['cognate-suggestions', word, language],
    queryFn: () => cognateApi.getSuggestions(word, language),
    enabled: !!word && word.length > 2,
    staleTime: 60 * 1000, // 1 minute
  });

export const useRandomCognates = (count: number = 10, filters?: CognateFilters) =>
  useQuery({
    queryKey: ['random-cognates', count, filters],
    queryFn: () => cognateApi.getRandomCognates(count, filters),
    staleTime: 0, // Always fresh for random results
  });

export const useCognateStats = (userId?: number) =>
  useQuery({
    queryKey: ['cognate-stats', userId],
    queryFn: () => cognateApi.getStats(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useCognateCategories = () =>
  useQuery({
    queryKey: ['cognate-categories'],
    queryFn: cognateApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

export const useCognateExists = (englishWord: string, frenchWord: string) =>
  useQuery({
    queryKey: ['cognate-exists', englishWord, frenchWord],
    queryFn: () => cognateApi.checkExists(englishWord, frenchWord),
    enabled: !!englishWord && !!frenchWord,
    staleTime: 60 * 1000, // 1 minute
  });

// Practice session hooks
export const usePracticeStats = (sessionId: string) =>
  useQuery({
    queryKey: ['practice-stats', sessionId],
    queryFn: () => cognateApi.getPracticeStats(sessionId),
    enabled: !!sessionId,
    refetchInterval: 1000, // Update every second during practice
  });

// Mutation hooks
export const useCreateCognate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cognate: CognateInput) => cognateApi.createCognate(cognate),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.cognate.all() });
      queryClient.invalidateQueries({ queryKey: ['cognate-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cognate-categories'] });
      
      showSuccessToast('Cognate pair created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create cognate pair'),
  });
};

export const useUpdateCognate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<CognateInput> }) =>
      cognateApi.updateCognate(id, updates),
    onSuccess: (data) => {
      // Update specific cognate query
      queryClient.setQueryData(queryKeys.cognate.detail(data.id), data);
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.cognate.all() });
      queryClient.invalidateQueries({ queryKey: ['cognate-stats'] });
      
      showSuccessToast('Cognate pair updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update cognate pair'),
  });
};

export const useDeleteCognate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cognateApi.deleteCognate(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.cognate.detail(id) });
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.cognate.all() });
      queryClient.invalidateQueries({ queryKey: ['cognate-stats'] });
      
      showSuccessToast('Cognate pair deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete cognate pair'),
  });
};

export const useBulkCreateCognates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cognates: CognateInput[]) => cognateApi.bulkCreateCognates(cognates),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.cognate.all() });
      queryClient.invalidateQueries({ queryKey: ['cognate-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cognate-categories'] });
      
      showSuccessToast(
        `${data.created.length} cognate pairs created successfully` +
        (data.failed.length > 0 ? `, ${data.failed.length} failed` : '')
      );
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create cognate pairs'),
  });
};

export const useVerifyCognate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, verified }: { id: number; verified: boolean }) =>
      cognateApi.verifyCognate(id, verified),
    onSuccess: (data) => {
      // Update specific cognate query
      queryClient.setQueryData(queryKeys.cognate.detail(data.id), data);
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.cognate.all() });
      queryClient.invalidateQueries({ queryKey: ['cognate-stats'] });
      
      showSuccessToast(`Cognate pair ${data.verified ? 'verified' : 'unverified'}`);
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to verify cognate pair'),
  });
};

export const useImportCognates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'csv' | 'json' }) =>
      cognateApi.importCognates(file, format),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.cognate.all() });
      queryClient.invalidateQueries({ queryKey: ['cognate-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cognate-categories'] });
      
      showSuccessToast(
        `${data.imported} cognate pairs imported successfully` +
        (data.failed > 0 ? `, ${data.failed} failed` : '')
      );
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to import cognate pairs'),
  });
};

export const useExportCognates = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'csv' | 'json'; filters?: CognateFilters }) =>
      cognateApi.exportCognates(format, filters),
    onSuccess: (data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cognates.${variables.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Cognates exported successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to export cognates'),
  });
};

// Practice session mutations
export const useStartPracticeSession = () => {
  return useMutation({
    mutationFn: (filters?: CognateFilters) => cognateApi.startPracticeSession(filters),
    onSuccess: () => {
      showSuccessToast('Practice session started');
    },
    onError: (error) => handleApiError(error, 'Failed to start practice session'),
  });
};

export const useSubmitPracticeAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, cognateId, correct }: {
      sessionId: string;
      cognateId: number;
      correct: boolean;
    }) => cognateApi.submitPracticeAnswer(sessionId, cognateId, correct),
    onSuccess: (data, variables) => {
      // Update practice stats
      queryClient.invalidateQueries({ 
        queryKey: ['practice-stats', variables.sessionId] 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to submit answer'),
  });
};