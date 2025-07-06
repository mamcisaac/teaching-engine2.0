import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { ReflectionUpdate } from '../../../types';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { notesApi } from './api';

// Journal Query hooks
export const useJournalEntries = (params?: {
  themeId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) =>
  useQuery({
    queryKey: queryKeys.notes.journal.list(params),
    queryFn: () => notesApi.journal.getAll(params),
  });

export const useJournalEntry = (id: number) =>
  useQuery({
    queryKey: queryKeys.notes.journal.detail(id),
    queryFn: () => notesApi.journal.getById(id),
    enabled: !!id,
  });

export const useSearchJournalEntries = (query: string) =>
  useQuery({
    queryKey: queryKeys.notes.journal.search(query),
    queryFn: () => notesApi.journal.search(query),
    enabled: !!query && query.length > 2,
  });

// Journal Mutation hooks
export const useCreateJournalEntry = () => {
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

export const useUpdateJournalEntry = () => {
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

export const useDeleteJournalEntry = () => {
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
export const useQuickNotes = () =>
  useQuery({
    queryKey: queryKeys.notes.quick.all,
    queryFn: notesApi.quick.getAll,
  });

// Quick Notes Mutation hooks
export const useCreateQuickNote = () => {
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

export const useUpdateQuickNote = () => {
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

export const useDeleteQuickNote = () => {
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
export const useNoteTags = () =>
  useQuery({
    queryKey: queryKeys.notes.tags.all,
    queryFn: notesApi.tags.getAll,
  });

export const useNotesByTag = (tag: string) =>
  useQuery({
    queryKey: queryKeys.notes.tags.byTag(tag),
    queryFn: () => notesApi.tags.getByTag(tag),
    enabled: !!tag,
  });

// Export hooks
export const useExportNotesPDF = () => useMutation({
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

export const useExportNotesMarkdown = () => useMutation({
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