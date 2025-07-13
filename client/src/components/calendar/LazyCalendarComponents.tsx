import { lazy } from 'react';
import type { DateLocalizer } from 'react-big-calendar';

// Lazy load heavy calendar components
export const CalendarEventModal = lazy(() => import('./CalendarEventModal').then(module => ({ default: module.CalendarEventModal })));
export const CalendarEventDetails = lazy(() => import('./CalendarEventDetails').then(module => ({ default: module.CalendarEventDetails })));
export const CalendarFilters = lazy(() => import('./CalendarFilters').then(module => ({ default: module.CalendarFilters })));

// Lazy load the react-big-calendar component separately
export const BigCalendar = lazy(() => 
  import('react-big-calendar').then(module => ({
    default: module.Calendar
  }))
);

// Export the localizer factory separately to avoid importing moment in the main bundle
export const createMomentLocalizer = (): Promise<DateLocalizer> => import('react-big-calendar').then(async (bigCalendarModule) => {
    const moment = await import('moment');
    return bigCalendarModule.momentLocalizer(moment.default);
  });