import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import axios from '../lib/axios';
import { toast } from 'sonner';
import { ReflectionJournalEntry, ReflectionInput, ReflectionUpdate } from '../types';

// Types for the simpler TeacherReflection system
interface TeacherReflection {
  id: number;
  content: string;
  outcomeId: string;
  createdAt: string;
  updatedAt: string;
  outcome?: {
    id: string;
    code: string;
    description: string;
  };
}

interface CreateTeacherReflectionData {
  content: string;
  outcomeId: string;
}

interface UpdateTeacherReflectionData {
  content: string;
}

// Constants
const REFLECTIONS_KEY = ['reflections'];
const TEACHER_REFLECTIONS_KEY = ['teacher-reflections'];

// ===== Journal Entry Reflections (Complex) =====

export const useReflections = (params?: {
  outcomeId?: string;
  themeId?: number;
  term?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery<ReflectionJournalEntry[]>({
    queryKey: [...REFLECTIONS_KEY, params],
    queryFn: async () => {
      const { data } = await axios.get('/api/reflections', { params });
      return data;
    },
  });
};

export const useReflectionsByOutcome = (outcomeId: string) => {
  return useQuery<ReflectionJournalEntry[]>({
    queryKey: [...REFLECTIONS_KEY, 'outcome', outcomeId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/reflections/by-outcome/${outcomeId}`);
      return data;
    },
  });
};

export const useCreateReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<ReflectionJournalEntry, Error, ReflectionInput>({
    mutationFn: async (input) => {
      const { data } = await axios.post('/api/reflections', input);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all reflection queries
      queryClient.invalidateQueries({ queryKey: REFLECTIONS_KEY });

      // Specifically invalidate queries for linked outcomes
      if (data.outcomes) {
        data.outcomes.forEach(({ outcome }) => {
          queryClient.invalidateQueries({
            queryKey: [...REFLECTIONS_KEY, 'outcome', outcome.id],
          });
        });
      }
    },
  });
};

export const useUpdateReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<ReflectionJournalEntry, Error, { id: number; data: ReflectionUpdate }>({
    mutationFn: async ({ id, data }) => {
      const response = await axios.patch(`/api/reflections/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate all reflection queries
      queryClient.invalidateQueries({ queryKey: REFLECTIONS_KEY });

      // Specifically invalidate queries for linked outcomes
      if (data.outcomes) {
        data.outcomes.forEach(({ outcome }) => {
          queryClient.invalidateQueries({
            queryKey: [...REFLECTIONS_KEY, 'outcome', outcome.id],
          });
        });
      }
    },
  });
};

export const useDeleteReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await axios.delete(`/api/reflections/${id}`);
    },
    onSuccess: () => {
      // Invalidate all reflection queries
      queryClient.invalidateQueries({ queryKey: REFLECTIONS_KEY });
    },
  });
};

// Helper hook to get reflection counts by outcome
export const useReflectionCounts = (outcomeIds: string[]) => {
  return useQuery<Record<string, number>>({
    queryKey: [...REFLECTIONS_KEY, 'counts', outcomeIds],
    queryFn: async () => {
      const counts: Record<string, number> = {};

      // Fetch reflections for all outcomes in parallel
      const promises = outcomeIds.map(async (outcomeId) => {
        const { data } = await axios.get(`/api/reflections/by-outcome/${outcomeId}`);
        counts[outcomeId] = data.length;
      });

      await Promise.all(promises);
      return counts;
    },
    enabled: outcomeIds.length > 0,
  });
};

// ===== Teacher Reflections (Simple) =====

// Get all reflections for a specific outcome
export const useTeacherReflections = (outcomeId: string) => {
  return useQuery<TeacherReflection[]>({
    queryKey: [...TEACHER_REFLECTIONS_KEY, outcomeId],
    queryFn: async () => {
      const response = await api.get(`/api/reflections/outcome/${outcomeId}`);
      return response.data;
    },
    enabled: !!outcomeId,
  });
};

// Get all reflections for the authenticated user
export const useAllTeacherReflections = () => {
  return useQuery<TeacherReflection[]>({
    queryKey: TEACHER_REFLECTIONS_KEY,
    queryFn: async () => {
      const response = await api.get('/api/reflections');
      return response.data;
    },
  });
};

// Create a new reflection
export const useCreateTeacherReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<TeacherReflection, Error, CreateTeacherReflectionData>({
    mutationFn: async (data) => {
      const response = await api.post('/api/reflections', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch reflections for this outcome
      queryClient.invalidateQueries({ queryKey: [...TEACHER_REFLECTIONS_KEY, data.outcomeId] });
      // Also invalidate all reflections
      queryClient.invalidateQueries({ queryKey: TEACHER_REFLECTIONS_KEY });
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
export const useUpdateTeacherReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<TeacherReflection, Error, { id: number; data: UpdateTeacherReflectionData }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/api/reflections/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...TEACHER_REFLECTIONS_KEY, data.outcomeId] });
      queryClient.invalidateQueries({ queryKey: TEACHER_REFLECTIONS_KEY });
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
export const useDeleteTeacherReflection = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/reflections/${id}`);
    },
    onSuccess: () => {
      // Invalidate all reflection queries since we don't know which outcome this belonged to
      queryClient.invalidateQueries({ queryKey: TEACHER_REFLECTIONS_KEY });
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