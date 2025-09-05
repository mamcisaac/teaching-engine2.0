/**
 * Hook for managing lesson reflections with quick status and notes
 * Issue #308: Per-Lesson Quick Reflections
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

import { apiClient } from '../api/core/client';

export type ReflectionStatus = '👍' | '👌' | '👎';

export interface LessonReflection {
  id: string;
  lessonId: string;
  userId: number;
  status: ReflectionStatus;
  statusEmoji?: string;
  note: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ReflectionSummary {
  date: string;
  total: number;
  successful: number;
  mixed: number;
  needsReteaching: number;
  withNotes: number;
  percentSuccess: number;
  percentMixed: number;
  percentReteach: number;
}

interface UseLessonReflectionOptions {
  lessonId?: string;
  date?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function useLessonReflection({
  lessonId,
  date,
  autoSave = true,
  autoSaveDelay = 2000
}: UseLessonReflectionOptions = {}) {
  const queryClient = useQueryClient();
  const [localNote, setLocalNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch reflection for a specific lesson
  const { data: reflection, isLoading } = useQuery({
    queryKey: ['reflection', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const response = await apiClient.get(`/lessons/${lessonId}/reflection`);
      return response.data as LessonReflection | null;
    },
    enabled: !!lessonId
  });

  // Fetch all reflections for a specific date
  const { data: dailyReflections } = useQuery({
    queryKey: ['reflections', 'daily', date],
    queryFn: async () => {
      if (!date) return [];
      const response = await apiClient.get(`/reflections/daily/${date}`);
      return response.data as LessonReflection[];
    },
    enabled: !!date
  });

  // Fetch summary for a specific date
  const { data: dailySummary } = useQuery({
    queryKey: ['reflections', 'summary', date],
    queryFn: async () => {
      if (!date) return null;
      const response = await apiClient.get(`/reflections/summary/${date}`);
      return response.data as ReflectionSummary;
    },
    enabled: !!date
  });

  // Initialize local note from fetched reflection
  useEffect(() => {
    if (reflection?.note) {
      setLocalNote(reflection.note);
    }
  }, [reflection]);

  // Save/update reflection mutation
  const saveMutation = useMutation({
    mutationFn: async ({ 
      lessonId, 
      status, 
      note, 
      date 
    }: { 
      lessonId: string; 
      status?: ReflectionStatus; 
      note?: string;
      date?: string;
    }) => {
      const response = await apiClient.post(`/lessons/${lessonId}/reflection`, {
        status: status || reflection?.status || '👌',
        note: note !== undefined ? note : reflection?.note,
        date: date || new Date().toISOString()
      });
      return response.data as LessonReflection;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reflection', variables.lessonId] });
      
      // Snapshot previous value
      const previousReflection = queryClient.getQueryData<LessonReflection>(['reflection', variables.lessonId]);
      
      // Optimistically update
      if (variables.lessonId) {
        queryClient.setQueryData(['reflection', variables.lessonId], (old: LessonReflection | null) => ({
          ...old,
          id: old?.id || 'temp',
          lessonId: variables.lessonId,
          userId: 0, // Will be set by server
          status: variables.status || old?.status || '👌',
          note: variables.note !== undefined ? variables.note : old?.note || null,
          date: variables.date || old?.date || new Date().toISOString(),
          createdAt: old?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
      }
      
      return { previousReflection };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousReflection !== undefined) {
        queryClient.setQueryData(['reflection', variables.lessonId], context.previousReflection);
      }
      toast.error('Failed to save reflection');
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(['reflection', data.lessonId], data);
      // Invalidate daily queries if date matches
      if (date && data.date.startsWith(date)) {
        queryClient.invalidateQueries({ queryKey: ['reflections', 'daily', date] });
        queryClient.invalidateQueries({ queryKey: ['reflections', 'summary', date] });
      }
      setIsSaving(false);
    }
  });

  // Delete reflection mutation
  const deleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      await apiClient.delete(`/lessons/${lessonId}/reflection`);
    },
    onSuccess: (_, lessonId) => {
      queryClient.setQueryData(['reflection', lessonId], null);
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      toast.success('Reflection removed');
    }
  });

  // Debounced save for note autosave
  const debouncedSaveNote = useCallback(
    debounce((lessonId: string, note: string) => {
      if (lessonId && autoSave) {
        setIsSaving(true);
        saveMutation.mutate({ lessonId, note });
      }
    }, autoSaveDelay),
    [autoSave, autoSaveDelay, saveMutation]
  );

  // Set reflection status
  const setStatus = useCallback((status: ReflectionStatus) => {
    if (!lessonId) return;
    saveMutation.mutate({ lessonId, status });
  }, [lessonId, saveMutation]);

  // Set reflection note with autosave
  const setNote = useCallback((note: string) => {
    setLocalNote(note);
    if (lessonId && autoSave) {
      clearTimeout(saveTimeoutRef.current);
      setIsSaving(true);
      debouncedSaveNote(lessonId, note);
    }
  }, [lessonId, autoSave, debouncedSaveNote]);

  // Manual save
  const save = useCallback(() => {
    if (!lessonId) return;
    setIsSaving(true);
    saveMutation.mutate({ 
      lessonId, 
      status: reflection?.status,
      note: localNote 
    });
  }, [lessonId, localNote, reflection?.status, saveMutation]);

  // Clear reflection
  const clear = useCallback(() => {
    if (!lessonId) return;
    deleteMutation.mutate(lessonId);
    setLocalNote('');
  }, [lessonId, deleteMutation]);

  return {
    // Data
    reflection,
    dailyReflections,
    dailySummary,
    localNote,
    
    // Status
    isLoading,
    isSaving: isSaving || saveMutation.isPending,
    isError: saveMutation.isError,
    
    // Actions
    setStatus,
    setNote,
    save,
    clear,
    
    // Utilities
    getStatusEmoji: (status: ReflectionStatus) => status,
    getStatusLabel: (status: ReflectionStatus) => {
      switch (status) {
        case '👍': return 'Students understood well';
        case '👌': return 'Mixed results';
        case '👎': return 'Needs reteaching';
        default: return '';
      }
    }
  };
}