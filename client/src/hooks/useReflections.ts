import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { ReflectionJournalEntry, ReflectionInput, ReflectionUpdate } from '../types';

const REFLECTIONS_KEY = ['reflections'];

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
