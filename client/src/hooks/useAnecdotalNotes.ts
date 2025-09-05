/**
 * Hook for managing anecdotal notes using existing StudentAssessment infrastructure
 * Issue #318: Quick observations stored in Assessment.notes field
 * 
 * Uses existing API endpoints, no new database tables needed
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '../api/core/client';
import type { AnecdotalNote, NoteContext } from '../utils/anecdotalNotes';
import { validateNoteText } from '../utils/anecdotalNotes';

export interface StudentAssessment {
  id: string;
  studentId: string;
  lessonId?: string;
  subject: string;
  title: string;
  level: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface UseAnecdotalNotesOptions {
  studentId?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function useAnecdotalNotes({
  studentId,
  autoSave = true,
  autoSaveDelay = 2000
}: UseAnecdotalNotesOptions = {}) {
  const queryClient = useQueryClient();
  const [localNote, setLocalNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch anecdotal notes (assessments where notes exist) for a student
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['anecdotal-notes', studentId],
    queryFn: async (): Promise<AnecdotalNote[]> => {
      if (!studentId) return [];
      
      const response = await apiClient.get('/student-assessments', {
        params: {
          studentId,
          limit: 100 // Get recent notes
        }
      });

      const assessments = response.data.data as StudentAssessment[];
      
      // Convert only anecdotal note assessments to AnecdotalNote format
      return assessments
        .filter(assessment => 
          assessment.notes && 
          assessment.notes.trim().length > 0 && 
          assessment.subject.startsWith('ANECDOTAL_NOTE_') // Only get anecdotal notes
        )
        .map(assessment => ({
          id: assessment.id,
          studentId: assessment.studentId,
          text: assessment.notes!,
          timestamp: new Date(assessment.date),
          lessonId: assessment.lessonId,
          subject: assessment.subject.replace('ANECDOTAL_NOTE_', ''), // Remove prefix for display
          lessonContext: assessment.title.replace('Quick Note - ', '') // Clean up title for display
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    enabled: !!studentId,
    staleTime: 30000, // 30 seconds
  });

  // Create/save anecdotal note mutation
  const saveMutation = useMutation({
    mutationFn: async ({ 
      studentId, 
      text, 
      context 
    }: { 
      studentId: string; 
      text: string;
      context?: NoteContext;
    }) => {
      // Create a special assessment record for anecdotal notes
      // Use special subject pattern to distinguish from real assessments
      const noteTimestamp = context?.date || new Date();
      const response = await apiClient.post('/student-assessments', {
        studentId,
        lessonId: context?.lessonId,
        subject: `ANECDOTAL_NOTE_${context?.subject || 'General'}`, // Special prefix to distinguish
        title: `Quick Note - ${noteTimestamp.toLocaleString()}`, // Clear indication this is a note
        level: 'MEETING', // Use neutral level that won't affect analytics
        notes: text,
        date: noteTimestamp.toISOString()
      });
      
      return response.data as StudentAssessment;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['anecdotal-notes', variables.studentId] });
      
      // Snapshot previous value
      const previousNotes = queryClient.getQueryData<AnecdotalNote[]>(['anecdotal-notes', variables.studentId]);
      
      // Optimistically update
      const optimisticNote: AnecdotalNote = {
        id: 'temp-' + Date.now(),
        studentId: variables.studentId,
        text: variables.text,
        timestamp: variables.context?.date || new Date(),
        lessonId: variables.context?.lessonId,
        subject: variables.context?.subject || 'General', // Display without prefix
        lessonContext: (variables.context?.lessonTitle || new Date().toLocaleString()) // Clean display
      };
      
      queryClient.setQueryData(
        ['anecdotal-notes', variables.studentId], 
        (old: AnecdotalNote[] = []) => [optimisticNote, ...old]
      );
      
      return { previousNotes };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotes !== undefined) {
        queryClient.setQueryData(['anecdotal-notes', variables.studentId], context.previousNotes);
      }
      toast.error('Failed to save anecdotal note');
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      queryClient.invalidateQueries({ queryKey: ['anecdotal-notes', variables.studentId] });
      setIsSaving(false);
      toast.success('Note saved');
    }
  });

  // Debounced auto-save with proper cleanup
  const debouncedSaveRef = useRef<ReturnType<typeof debounce>>();
  
  useEffect(() => {
    debouncedSaveRef.current = debounce((studentId: string, text: string, context?: NoteContext) => {
      if (studentId && text.trim().length > 0 && autoSave) {
        // Validate before saving
        const validation = validateNoteText(text.trim());
        if (!validation.valid) {
          toast.error(validation.error || 'Invalid note content');
          setIsSaving(false);
          return;
        }
        
        setIsSaving(true);
        saveMutation.mutate({ studentId, text: text.trim(), context });
      }
    }, autoSaveDelay);
    
    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, [autoSaveDelay, autoSave, saveMutation]);

  // Set note with auto-save (fixed race conditions)
  const setNote = useCallback((text: string, context?: NoteContext) => {
    setLocalNote(text);
    if (studentId && autoSave && debouncedSaveRef.current) {
      // Cancel any pending save first
      debouncedSaveRef.current.cancel();
      // Only set saving state when save actually starts (inside debounced function)
      debouncedSaveRef.current(studentId, text, context);
    }
  }, [studentId, autoSave]);

  // Manual save with validation
  const saveNote = useCallback((text: string, targetStudentId?: string, context?: NoteContext) => {
    const saveStudentId = targetStudentId || studentId;
    if (!saveStudentId || !text.trim()) return;
    
    // Validate before saving
    const validation = validateNoteText(text.trim());
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid note content');
      return;
    }
    
    setIsSaving(true);
    saveMutation.mutate({ 
      studentId: saveStudentId, 
      text: text.trim(), 
      context 
    });
  }, [studentId, saveMutation]);

  // Quick save with context
  const quickSave = useCallback((
    targetStudentId: string, 
    text: string, 
    lessonId?: string,
    lessonTitle?: string,
    subject?: string
  ) => {
    const context: NoteContext = {
      lessonId,
      lessonTitle,
      subject,
      date: new Date()
    };
    
    saveNote(text, targetStudentId, context);
  }, [saveNote]);

  // Search notes
  const searchNotes = useCallback((keyword: string): AnecdotalNote[] => {
    const lowerKeyword = keyword.toLowerCase();
    return notes.filter(note => 
      note.text.toLowerCase().includes(lowerKeyword)
    );
  }, [notes]);

  // Get notes in date range
  const getNotesInRange = useCallback((startDate: Date, endDate: Date): AnecdotalNote[] => {
    return notes.filter(note => 
      note.timestamp >= startDate && note.timestamp <= endDate
    );
  }, [notes]);

  return {
    // Data
    notes,
    localNote,
    
    // Status
    isLoading,
    isSaving: isSaving || saveMutation.isPending,
    isError: saveMutation.isError,
    
    // Actions
    setNote,
    saveNote,
    quickSave,
    searchNotes,
    getNotesInRange,
    
    // Utilities
    hasUnsavedChanges: localNote.trim().length > 0,
    canSave: (text?: string) => {
      const textToCheck = text || localNote;
      if (!textToCheck.trim() || textToCheck.length > 1000) return false;
      const validation = validateNoteText(textToCheck.trim());
      return validation.valid;
    }
  };
}