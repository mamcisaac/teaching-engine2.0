import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface Reflection {
  id: number;
  content: string;
  outcomeId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateReflectionData {
  content: string;
  outcomeId: string;
}

interface UpdateReflectionData {
  content: string;
}

// Get all reflections for a specific outcome
export const useReflections = (outcomeId: string) => {
  return useQuery<Reflection[]>({
    queryKey: ['reflections', outcomeId],
    queryFn: async () => {
      const response = await api.get(`/api/reflections/outcome/${outcomeId}`);
      return response.data;
    },
    enabled: !!outcomeId,
  });
};

// Get all reflections for the authenticated user
export const useAllReflections = () => {
  return useQuery<Reflection[]>({
    queryKey: ['reflections'],
    queryFn: async () => {
      const response = await api.get('/api/reflections');
      return response.data;
    },
  });
};

// Create a new reflection
export const useCreateReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<Reflection, Error, CreateReflectionData>({
    mutationFn: async (data) => {
      const response = await api.post('/api/reflections', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch reflections for this outcome
      queryClient.invalidateQueries({ queryKey: ['reflections', data.outcomeId] });
      // Also invalidate all reflections
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      toast.success('Reflection saved successfully!');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        'Failed to save reflection: ' +
          (error.response?.data?.error || error.message || 'Unknown error'),
      );
    },
  });
};

// Update an existing reflection
export const useUpdateReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<Reflection, Error, { id: number; data: UpdateReflectionData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/api/reflections/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reflections', data.outcomeId] });
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      toast.success('Reflection updated successfully!');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        'Failed to update reflection: ' +
          (error.response?.data?.error || error.message || 'Unknown error'),
      );
    },
  });
};

// Delete a reflection
export const useDeleteReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/reflections/${id}`);
    },
    onSuccess: () => {
      // Invalidate all reflection queries since we don't know which outcome this belonged to
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      toast.success('Reflection deleted successfully!');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        'Failed to delete reflection: ' +
          (error.response?.data?.error || error.message || 'Unknown error'),
      );
    },
  });
};

// Get reflection statistics
export const useReflectionStats = () => {
  return useQuery({
    queryKey: ['reflection-stats'],
    queryFn: async () => {
      const response = await api.get('/api/reflections/stats');
      return response.data;
    },
  });
};
