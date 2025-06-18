import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../api';

interface CreateMutationOptions<TData, TVariables> {
  endpoint: string;
  queryKey: string | string[];
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: any) => void;
}

export function createMutation<TData = unknown, TVariables = unknown>({
  endpoint,
  queryKey,
  successMessage,
  errorMessage = 'Operation failed',
  onSuccess,
  onError,
}: CreateMutationOptions<TData, TVariables>) {
  return () => {
    const queryClient = useQueryClient();

    return useMutation<TData, Error, TVariables>({
      mutationFn: (data) => api.post(endpoint, data),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
        if (successMessage) {
          toast.success(successMessage);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(errorMessage);
        onError?.(error);
      },
    });
  };
}

interface UpdateMutationOptions<TData, TVariables> extends CreateMutationOptions<TData, TVariables> {
  method?: 'PUT' | 'PATCH';
}

export function createUpdateMutation<TData = unknown, TVariables extends { id: number | string } = { id: number }>({
  endpoint,
  queryKey,
  successMessage,
  errorMessage = 'Update failed',
  onSuccess,
  onError,
  method = 'PUT',
}: UpdateMutationOptions<TData, TVariables>) {
  return () => {
    const queryClient = useQueryClient();

    return useMutation<TData, Error, TVariables>({
      mutationFn: ({ id, ...data }) => {
        const url = `${endpoint}/${id}`;
        return method === 'PUT' ? api.put(url, data) : api.patch(url, data);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
        if (successMessage) {
          toast.success(successMessage);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(errorMessage);
        onError?.(error);
      },
    });
  };
}

export function createDeleteMutation<TData = unknown>({
  endpoint,
  queryKey,
  successMessage,
  errorMessage = 'Delete failed',
  onSuccess,
  onError,
}: CreateMutationOptions<TData, number | string>) {
  return () => {
    const queryClient = useQueryClient();

    return useMutation<TData, Error, number | string>({
      mutationFn: (id) => api.delete(`${endpoint}/${id}`),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
        if (successMessage) {
          toast.success(successMessage);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(errorMessage);
        onError?.(error);
      },
    });
  };
}