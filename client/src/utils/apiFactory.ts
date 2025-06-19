import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useToast } from '../hooks/useToast';

interface ApiFactoryOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateQueries?: string[];
  successMessage?: string | ((data: TData) => string);
  errorMessage?: string | ((error: AxiosError) => string);
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: AxiosError, variables: TVariables) => void;
}

export function createApiMutation<TData = unknown, TVariables = void>(
  options: ApiFactoryOptions<TData, TVariables>,
) {
  return (overrides?: Partial<UseMutationOptions<TData, AxiosError, TVariables>>) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<TData, AxiosError, TVariables>({
      mutationFn: options.mutationFn,
      onSuccess: (data, variables) => {
        // Invalidate queries
        if (options.invalidateQueries) {
          options.invalidateQueries.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }

        // Show success message
        if (options.successMessage) {
          const message =
            typeof options.successMessage === 'function'
              ? options.successMessage(data)
              : options.successMessage;
          toast({ type: 'success', message });
        }

        // Call custom success handler
        options.onSuccess?.(data, variables);
        overrides?.onSuccess?.(data, variables, undefined);
      },
      onError: (error, variables) => {
        // Show error message
        if (options.errorMessage) {
          const message =
            typeof options.errorMessage === 'function'
              ? options.errorMessage(error)
              : options.errorMessage;
          toast({ type: 'error', message });
        } else {
          // Default error message
          const axiosError = error as AxiosError<{ message?: string }>;
          const message =
            axiosError.response?.data?.message || axiosError.message || 'An error occurred';
          toast({ type: 'error', message });
        }

        // Call custom error handler
        options.onError?.(error, variables);
        overrides?.onError?.(error, variables, undefined);
      },
      ...overrides,
    });
  };
}

// Example usage for CRUD operations
export const createCrudMutations = <TEntity extends { id: number }>(
  entityName: string,
  api: {
    create: (data: Omit<TEntity, 'id'>) => Promise<TEntity>;
    update: (id: number, data: Partial<TEntity>) => Promise<TEntity>;
    delete: (id: number) => Promise<void>;
  },
) => {
  const queryKey = entityName.toLowerCase() + 's';

  return {
    useCreate: createApiMutation({
      mutationFn: api.create,
      invalidateQueries: [queryKey],
      successMessage: `${entityName} created successfully`,
    }),

    useUpdate: createApiMutation<TEntity, { id: number; data: Partial<TEntity> }>({
      mutationFn: ({ id, data }) => api.update(id, data),
      invalidateQueries: [queryKey],
      successMessage: `${entityName} updated successfully`,
    }),

    useDelete: createApiMutation({
      mutationFn: api.delete,
      invalidateQueries: [queryKey],
      successMessage: `${entityName} deleted successfully`,
    }),
  };
};
