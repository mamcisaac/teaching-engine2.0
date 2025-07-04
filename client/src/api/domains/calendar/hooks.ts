import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core';
import type { CalendarEvent } from '../../../types';

// Query hooks
export const useCalendarEvents = (start: string, end: string) =>
  useQuery({
    queryKey: queryKeys.calendar.events(start, end),
    queryFn: () => calendarApi.getEvents(start, end),
    enabled: !!start && !!end,
  });

export const useCalendarEvent = (id: number) =>
  useQuery({
    queryKey: ['calendar-event', id],
    queryFn: () => calendarApi.getEvent(id),
    enabled: !!id,
  });

export const useRecurringEvents = (start: string, end: string) =>
  useQuery({
    queryKey: ['calendar-events', 'recurring', start, end],
    queryFn: () => calendarApi.getRecurringEvents(start, end),
    enabled: !!start && !!end,
  });

export const useEventTypes = () =>
  useQuery({
    queryKey: ['calendar-event-types'],
    queryFn: calendarApi.getEventTypes,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

export const useSearchEvents = (query: string, filters?: { type?: string; tag?: string }) =>
  useQuery({
    queryKey: ['calendar-events', 'search', query, filters],
    queryFn: () => calendarApi.searchEvents(query, filters),
    enabled: !!query && query.length > 2,
  });

// Mutation hooks
export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.createEvent,
    onSuccess: (data) => {
      showSuccessToast('Event created successfully');
      // Invalidate calendar queries for the event's date range
      queryClient.invalidateQueries({ 
        queryKey: ['calendar-events'],
        predicate: (query) => {
          // Invalidate queries that might include this event
          return true;
        },
      });
    },
    onError: (error) => handleApiError(error, 'Failed to create event'),
  });
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.updateEvent,
    onSuccess: (data) => {
      showSuccessToast('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-event', data.id] });
    },
    onError: (error) => handleApiError(error, 'Failed to update event'),
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.deleteEvent,
    onSuccess: () => {
      showSuccessToast('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete event'),
  });
};

export const useBulkCreateEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.bulkCreateEvents,
    onSuccess: (data) => {
      showSuccessToast(`${data.length} events created successfully`);
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (error) => handleApiError(error, 'Failed to create events'),
  });
};

export const useExportCalendar = () => {
  return useMutation({
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
};

export const useImportCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.importCalendar,
    onSuccess: (data) => {
      showSuccessToast(`Imported ${data.imported} events successfully`);
      if (data.failed > 0) {
        showSuccessToast(`${data.failed} events failed to import`);
      }
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (error) => handleApiError(error, 'Failed to import calendar'),
  });
};

// Convenience hook for adding events
export const useAddCalendarEvent = () => {
  return useCreateCalendarEvent();
};