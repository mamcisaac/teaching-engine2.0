import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { CalendarEvent } from '../../../types';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { calendarApi } from './api';

// Query hooks
export const useCalendarEvents = (start: string, end: string): UseQueryResult<CalendarEvent[]> =>
  useQuery({
    queryKey: queryKeys.calendar.events(start, end),
    queryFn: () => calendarApi.getEvents(start, end),
    enabled: !!start && !!end,
  });

export const useCalendarEvent = (id: number): UseQueryResult<CalendarEvent> =>
  useQuery({
    queryKey: ['calendar-event', id],
    queryFn: () => calendarApi.getEvent(id),
    enabled: !!id,
  });

export const useRecurringEvents = (start: string, end: string): UseQueryResult<CalendarEvent[]> =>
  useQuery({
    queryKey: ['calendar-events', 'recurring', start, end],
    queryFn: () => calendarApi.getRecurringEvents(start, end),
    enabled: !!start && !!end,
  });

export const useEventTypes = (): UseQueryResult<string[]> =>
  useQuery({
    queryKey: ['calendar-event-types'],
    queryFn: calendarApi.getEventTypes,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

export const useSearchEvents = (query: string, filters?: { type?: string; tag?: string }): UseQueryResult<CalendarEvent[]> =>
  useQuery({
    queryKey: ['calendar-events', 'search', query, filters],
    queryFn: () => calendarApi.searchEvents(query, filters),
    enabled: !!query && query.length > 2,
  });

// Mutation hooks
export const useCreateCalendarEvent = (): UseMutationResult<CalendarEvent, Error, Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.createEvent,
    onSuccess: (_data) => {
      showSuccessToast('Event created successfully');
      // Invalidate calendar queries for the event's date range
      void queryClient.invalidateQueries({ 
        queryKey: ['calendar-events'],
        predicate: () => 
          // Invalidate queries that might include this event
           true
      });
    },
    onError: (error) => handleApiError(error, 'Failed to create event'),
  });
};

export const useUpdateCalendarEvent = (): UseMutationResult<CalendarEvent, Error, CalendarEvent> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.updateEvent,
    onSuccess: (data) => {
      showSuccessToast('Event updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar-event', data.id] });
    },
    onError: (error) => handleApiError(error, 'Failed to update event'),
  });
};

export const useDeleteCalendarEvent = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.deleteEvent,
    onSuccess: () => {
      showSuccessToast('Event deleted successfully');
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete event'),
  });
};

export const useBulkCreateEvents = (): UseMutationResult<CalendarEvent[], Error, Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[]> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.bulkCreateEvents,
    onSuccess: (data) => {
      showSuccessToast(`${data.length} events created successfully`);
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (error) => handleApiError(error, 'Failed to create events'),
  });
};

export const useExportCalendar = (): UseMutationResult<Blob, Error, { format: 'ics' | 'pdf'; start: string; end: string }> => useMutation({
    mutationFn: ({ format, start, end }: { format: 'ics' | 'pdf'; start: string; end: string }) =>
      calendarApi.exportCalendar(format, start, end),
    onSuccess: (data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `calendar-${variables.start}-${variables.end}.${variables.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Calendar exported successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to export calendar'),
  });

export const useImportCalendar = (): UseMutationResult<{ imported: number; failed: number }, Error, File> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.importCalendar,
    onSuccess: (data) => {
      showSuccessToast(`Imported ${data.imported} events successfully`);
      if (data.failed > 0) {
        showSuccessToast(`${data.failed} events failed to import`);
      }
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (error) => handleApiError(error, 'Failed to import calendar'),
  });
};

// Convenience hook for adding events
export const useAddCalendarEvent = (): UseMutationResult<CalendarEvent, Error, Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>> => useCreateCalendarEvent();