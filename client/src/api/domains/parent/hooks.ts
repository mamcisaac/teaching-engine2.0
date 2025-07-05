import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';
import type { 
  ParentMessage, 
  ParentMessageInput, 
  ParentSummary, 
  GenerateParentSummaryRequest, 
  SaveParentSummaryRequest, 
  ParentSummaryGeneration 
} from '../../../types';

// Parent Messages Query hooks
export const useParentMessages = () =>
  useQuery({
    queryKey: queryKeys.parent.messages.all,
    queryFn: parentApi.messages.getAll,
  });

export const useParentMessage = (id: number) =>
  useQuery({
    queryKey: queryKeys.parent.messages.detail(id),
    queryFn: () => parentApi.messages.getById(id),
    enabled: !!id,
  });

// Parent Messages Mutation hooks
export const useCreateParentMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parentApi.messages.create,
    onSuccess: () => {
      showSuccessToast('Parent message created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.parent.messages.all });
    },
    onError: (error) => handleApiError(error, 'Failed to create parent message'),
  });
};

export const useUpdateParentMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ParentMessageInput> }) =>
      parentApi.messages.update(id, input),
    onSuccess: (_, { id }) => {
      showSuccessToast('Parent message updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.parent.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.parent.messages.detail(id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update parent message'),
  });
};

export const useDeleteParentMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parentApi.messages.delete,
    onSuccess: () => {
      showSuccessToast('Parent message deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.parent.messages.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete parent message'),
  });
};

// Parent Summaries Query hooks
export const useParentSummaries = (studentId: number) =>
  useQuery({
    queryKey: queryKeys.parent.summaries.byStudent(studentId),
    queryFn: () => parentApi.summaries.getByStudent(studentId),
    enabled: !!studentId,
  });

export const useParentSummary = (studentId: number, summaryId: number) =>
  useQuery({
    queryKey: queryKeys.parent.summaries.detail(studentId, summaryId),
    queryFn: () => parentApi.summaries.getById(studentId, summaryId),
    enabled: !!studentId && !!summaryId,
  });

// Parent Summaries Mutation hooks
export const useGenerateParentSummary = () => {
  return useMutation({
    mutationFn: parentApi.summaries.generate,
    onSuccess: () => {
      showSuccessToast('Parent summary generated successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to generate parent summary'),
  });
};

export const useSaveParentSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: parentApi.summaries.save,
    onSuccess: (_, request) => {
      showSuccessToast(request.isDraft ? 'Draft saved successfully' : 'Parent summary saved successfully');
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.parent.summaries.byStudent(request.studentId) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to save parent summary'),
  });
};

export const useUpdateParentSummary = () => {
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
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.parent.summaries.byStudent(studentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.parent.summaries.detail(studentId, summaryId) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to update parent summary'),
  });
};

export const useDeleteParentSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, summaryId }: { studentId: number; summaryId: number }) =>
      parentApi.summaries.delete(studentId, summaryId),
    onSuccess: (_, { studentId }) => {
      showSuccessToast('Parent summary deleted successfully');
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.parent.summaries.byStudent(studentId) 
      });
    },
    onError: (error) => handleApiError(error, 'Failed to delete parent summary'),
  });
};

export const useSendParentSummary = () => {
  return useMutation({
    mutationFn: ({ studentId, summaryId }: { studentId: number; summaryId: number }) =>
      parentApi.summaries.send(studentId, summaryId),
    onSuccess: () => {
      showSuccessToast('Parent summary sent successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to send parent summary'),
  });
};