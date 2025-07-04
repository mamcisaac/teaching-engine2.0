import { apiClient } from '../../core';
import type { CalendarEvent } from '../../../types';

// API endpoints
export const calendarApi = {
  // Get events for a date range
  getEvents: async (start: string, end: string) => {
    const { data } = await apiClient.get<CalendarEvent[]>('/api/calendar-events', {
      params: { start, end },
    });
    return data;
  },

  // Get single event
  getEvent: async (id: number) => {
    const { data } = await apiClient.get<CalendarEvent>(`/api/calendar-events/${id}`);
    return data;
  },

  // Create event
  createEvent: async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<CalendarEvent>('/api/calendar-events', event);
    return data;
  },

  // Update event
  updateEvent: async ({ id, ...event }: CalendarEvent) => {
    const { data } = await apiClient.put<CalendarEvent>(`/api/calendar-events/${id}`, event);
    return data;
  },

  // Delete event
  deleteEvent: async (id: number) => {
    await apiClient.delete(`/api/calendar-events/${id}`);
  },

  // Bulk create events
  bulkCreateEvents: async (events: Array<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const { data } = await apiClient.post<CalendarEvent[]>('/api/calendar-events/bulk', { events });
    return data;
  },

  // Get recurring events
  getRecurringEvents: async (start: string, end: string) => {
    const { data } = await apiClient.get<CalendarEvent[]>('/api/calendar-events/recurring', {
      params: { start, end },
    });
    return data;
  },

  // Export calendar
  exportCalendar: async (format: 'ics' | 'pdf', start: string, end: string) => {
    const { data } = await apiClient.get(`/api/calendar-events/export`, {
      params: { format, start, end },
      responseType: 'blob',
    });
    return data;
  },

  // Import calendar
  importCalendar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await apiClient.post<{ imported: number; failed: number }>(
      '/api/calendar-events/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  // Get event types
  getEventTypes: async () => {
    const { data } = await apiClient.get<string[]>('/api/calendar-events/types');
    return data;
  },

  // Search events
  searchEvents: async (query: string, filters?: { type?: string; tag?: string }) => {
    const { data } = await apiClient.get<CalendarEvent[]>('/api/calendar-events/search', {
      params: { q: query, ...filters },
    });
    return data;
  },
};