import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { 
  ParentMessage,
  ParentMessageInput, 
  ParentSummary,
  ParentSummaryGeneration,
  GenerateParentSummaryRequest,
  SaveParentSummaryRequest
} from '../../../types';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { parentApi } from './api';

// Parent Messages Query hooks
export const useParentMessages = (): UseQueryResult<ParentMessage[]> =>
  useQuery({
    queryKey: queryKeys.parent.messages.all,
    queryFn: parentApi.messages.getAll,
  });

export const useParentMessage = (id: number): UseQueryResult<ParentMessage> =>
  useQuery({
    queryKey: queryKeys.parent.messages.detail(id),
    queryFn: () => parentApi.messages.getById(id),
    enabled: !!id,
  });

// Parent Messages Mutation hooks
export const useCreateParentMessage = (): UseMutationResult<
  ParentMessage,
  Error,
  ParentMessageInput
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parentApi.messages.create,
    onSuccess: () => {
      showSuccessToast('Parent message created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.parent.messages.all });
    },
    onError: (error) => handleApiError(error, 'Failed to create parent message'),
  });
};

export const useUpdateParentMessage = (): UseMutationResult<
  ParentMessage,
  Error,
  { id: number; input: Partial<ParentMessageInput> }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ParentMessageInput> }) =>
      parentApi.messages.update(id, input),
    onSuccess: (_, { id }) => {
      showSuccessToast('Parent message updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.parent.messages.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.parent.messages.detail(id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update parent message'),
  });
};

export const useDeleteParentMessage = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parentApi.messages.delete,
    onSuccess: () => {
      showSuccessToast('Parent message deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.parent.messages.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete parent message'),
  });
};

// Parent Summaries Query hooks
export const useParentSummaries = (studentId: number): UseQueryResult<ParentSummary[]> =>
  useQuery({
    queryKey: queryKeys.parent.summaries.byStudent(studentId),
    queryFn: () => parentApi.summaries.getByStudent(studentId),
    enabled: !!studentId,
  });

export const useParentSummary = (studentId: number, summaryId: number): UseQueryResult<ParentSummary> =>
  useQuery({
    queryKey: queryKeys.parent.summaries.detail(studentId, summaryId),
    queryFn: () => parentApi.summaries.getById(studentId, summaryId),
    enabled: !!studentId && !!summaryId,
  });

// Parent Summaries Mutation hooks
export const useGenerateParentSummary = (): UseMutationResult<
  ParentSummaryGeneration,
  Error,
  GenerateParentSummaryRequest
> => useMutation({
    mutationFn: parentApi.summaries.generate,
    onSuccess: () => {
      showSuccessToast('Parent summary generated successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to generate parent summary'),
  });

export const useSaveParentSummary = (): UseMutationResult<
  ParentSummary,
  Error,
  SaveParentSummaryRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parentApi.summaries.save,
    onSuccess: (_, request) => {
      showSuccessToast(request.isDraft === true ? 'Draft saved successfully' : 'Parent summary saved successfully');
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.parent.summaries.byStudent(request.studentId) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to save parent summary'),
  });
};

export const useUpdateParentSummary = (): UseMutationResult<
  ParentSummary,
  Error,
  { studentId: number; summaryId: number; input: Partial<SaveParentSummaryRequest> }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      studentId, 
      summaryId, 
      input 
    }: { 
      studentId: number; 
      summaryId: number; 
      input: Partial<SaveParentSummaryRequest> 
    }) => parentApi.summaries.update(studentId, summaryId, input),
    onSuccess: (_, { studentId, summaryId }) => {
      showSuccessToast('Parent summary updated successfully');
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.parent.summaries.byStudent(studentId) 
      });
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.parent.summaries.detail(studentId, summaryId) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to update parent summary'),
  });
};

export const useDeleteParentSummary = (): UseMutationResult<
  void,
  Error,
  { studentId: number; summaryId: number }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, summaryId }: { studentId: number; summaryId: number }) =>
      parentApi.summaries.delete(studentId, summaryId),
    onSuccess: (_, { studentId }) => {
      showSuccessToast('Parent summary deleted successfully');
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.parent.summaries.byStudent(studentId) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to delete parent summary'),
  });
};

export const useSendParentSummary = (): UseMutationResult<
  { success: boolean; message?: string },
  Error,
  { studentId: number; summaryId: number }
> => useMutation({
    mutationFn: ({ studentId, summaryId }: { studentId: number; summaryId: number }) =>
      parentApi.summaries.send(studentId, summaryId),
    onSuccess: () => {
      showSuccessToast('Parent summary sent successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to send parent summary'),
  });