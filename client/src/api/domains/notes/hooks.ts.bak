import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { ReflectionUpdate, ReflectionJournalEntry, ReflectionInput } from '../../../types';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { notesApi } from './api';

// Types for quick notes
interface QuickNote {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface TagInfo {
  name: string;
  count: number;
}

interface NotesByTag {
  journal: ReflectionJournalEntry[];
  quick: {
    id: number;
    content: string;
    createdAt: string;
    tags: string[];
  }[];
}

// Journal Query hooks
export const useJournalEntries = (params?: {
  themeId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): UseQueryResult<ReflectionJournalEntry[]> =>
  useQuery({
    queryKey: queryKeys.notes.journal.list(params),
    queryFn: () => notesApi.journal.getAll(params),
  });

export const useJournalEntry = (id: number): UseQueryResult<ReflectionJournalEntry> =>
  useQuery({
    queryKey: queryKeys.notes.journal.detail(id),
    queryFn: () => notesApi.journal.getById(id),
    enabled: !!id,
  });

export const useSearchJournalEntries = (query: string): UseQueryResult<ReflectionJournalEntry[]> =>
  useQuery({
    queryKey: queryKeys.notes.journal.search(query),
    queryFn: () => notesApi.journal.search(query),
    enabled: !!query && query.length > 2,
  });

// Journal Mutation hooks
export const useCreateJournalEntry = (): UseMutationResult<
  ReflectionJournalEntry,
  Error,
  ReflectionInput
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.journal.create,
    onSuccess: () => {
      showSuccessToast('Journal entry created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.journal.all });
    },
    onError: (error) => handleApiError(error, 'Failed to create journal entry'),
  });
};

export const useUpdateJournalEntry = (): UseMutationResult<
  ReflectionJournalEntry,
  Error,
  { id: number; input: ReflectionUpdate }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ReflectionUpdate }) =>
      notesApi.journal.update(id, input),
    onSuccess: (_, { id }) => {
      showSuccessToast('Journal entry updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.journal.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.journal.detail(id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update journal entry'),
  });
};

export const useDeleteJournalEntry = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.journal.delete,
    onSuccess: () => {
      showSuccessToast('Journal entry deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.journal.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete journal entry'),
  });
};

// Quick Notes Query hooks
export const useQuickNotes = (): UseQueryResult<QuickNote[]> =>
  useQuery({
    queryKey: queryKeys.notes.quick.all,
    queryFn: notesApi.quick.getAll,
  });

// Quick Notes Mutation hooks
export const useCreateQuickNote = (): UseMutationResult<
  QuickNote,
  Error,
  { content: string; tags?: string[] }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.quick.create,
    onSuccess: () => {
      showSuccessToast('Quick note created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.quick.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.tags.all });
    },
    onError: (error) => handleApiError(error, 'Failed to create quick note'),
  });
};

export const useUpdateQuickNote = (): UseMutationResult<
  QuickNote,
  Error,
  { id: number; input: { content?: string; tags?: string[] } }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: { content?: string; tags?: string[] } }) =>
      notesApi.quick.update(id, input),
    onSuccess: () => {
      showSuccessToast('Quick note updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.quick.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.tags.all });
    },
    onError: (error) => handleApiError(error, 'Failed to update quick note'),
  });
};

export const useDeleteQuickNote = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.quick.delete,
    onSuccess: () => {
      showSuccessToast('Quick note deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.quick.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.tags.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete quick note'),
  });
};

// Tags Query hooks
export const useNoteTags = (): UseQueryResult<TagInfo[]> =>
  useQuery({
    queryKey: queryKeys.notes.tags.all,
    queryFn: notesApi.tags.getAll,
  });

export const useNotesByTag = (tag: string): UseQueryResult<NotesByTag> =>
  useQuery({
    queryKey: queryKeys.notes.tags.byTag(tag),
    queryFn: () => notesApi.tags.getByTag(tag),
    enabled: !!tag,
  });

// Export hooks
export const useExportNotesPDF = (): UseMutationResult<
  Blob,
  Error,
  {
    type: 'journal' | 'quick' | 'all';
    startDate?: string;
    endDate?: string;
    themeId?: number;
  }
> => useMutation({
    mutationFn: notesApi.export.pdf,
    onSuccess: (data, variables) => {
      // Create a download link for the PDF blob
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notes-${variables.type}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Notes exported successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to export notes as PDF'),
  });

export const useExportNotesMarkdown = (): UseMutationResult<
  { content: string },
  Error,
  {
    type: 'journal' | 'quick' | 'all';
    startDate?: string;
    endDate?: string;
    themeId?: number;
  }
> => useMutation({
    mutationFn: notesApi.export.markdown,
    onSuccess: (data, variables) => {
      // Create a download link for the markdown content
      const blob = new Blob([data.content], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notes-${variables.type}-${new Date().toISOString().split('T')[0]}.md`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Notes exported successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to export notes as Markdown'),
  });