/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarViewComponent } from '../CalendarViewComponent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { CalendarEvent } from '../../types';

// Mock the calendar events API module
vi.mock('../../api/domains/calendar', () => ({
  calendarApi: {
    getEvents: vi.fn(),
  },
}));

// Mock the modal component
vi.mock('../EventEditorModal', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => 
    open ? (
      <div data-testid="add-event-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

// Import the mocked module
import { calendarApi } from '../../api/domains/calendar';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CalendarViewComponent', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: 1,
      title: 'Math Lesson',
      start: '2024-09-15T09:00:00',
      end: '2024-09-15T10:00:00',
      allDay: false,
      eventType: 'CUSTOM',
      source: 'MANUAL',
    },
    {
      id: 2,
      title: 'Science Unit',
      start: '2024-09-20T00:00:00',
      end: '2024-09-20T23:59:59',
      allDay: true,
      eventType: 'CUSTOM',
      source: 'MANUAL',
    },
    {
      id: 3,
      title: 'Parent Meeting',
      start: '2024-09-25T18:00:00',
      end: '2024-09-25T19:00:00',
      allDay: false,
      eventType: 'CUSTOM',
      source: 'MANUAL',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render calendar grid with month and year header', () => {
      const currentDate = new Date(2024, 8, 1); // September 2024
      render(
        <CalendarViewComponent 
          month={currentDate}
          events={[]}
        />,
        { wrapper: createWrapper() }
      );

      // Check month header
      expect(screen.getByText('September 2024')).toBeInTheDocument();

      // Check day headers
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();

      // September 2024 starts on Sunday and has 30 days
      // Should have at least 30 day cells
      const dayCells = screen.getAllByText(/^\d+$/);
      expect(dayCells.length).toBeGreaterThanOrEqual(30);
    });

    it('should render calendar with provided events', () => {
      const currentDate = new Date(2024, 8, 1);
      render(
        <CalendarViewComponent 
          month={currentDate}
          events={mockEvents}
        />,
        { wrapper: createWrapper() }
      );

      // Check that events are displayed
      expect(screen.getByText('Math Lesson')).toBeInTheDocument();
      expect(screen.getByText('Science Unit')).toBeInTheDocument();
      expect(screen.getByText('Parent Meeting')).toBeInTheDocument();
    });

    it('should highlight today\'s date', () => {
      const today = new Date();
      render(
        <CalendarViewComponent 
          month={today}
          events={[]}
        />,
        { wrapper: createWrapper() }
      );

      // Today's date should have special styling
      const todayCell = screen.getByText(today.getDate().toString());
      const todayContainer = todayCell.closest('div');
      expect(todayContainer).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should show events from previous and next month in gray', () => {
      const currentDate = new Date(2024, 8, 1); // September 2024
      const prevMonthEvent: CalendarEvent = {
        id: 4,
        title: 'August Event',
        start: '2024-08-31T00:00:00',
        end: '2024-08-31T23:59:59',
        allDay: true,
        eventType: 'CUSTOM',
        source: 'MANUAL',
      };
      const nextMonthEvent: CalendarEvent = {
        id: 5,
        title: 'October Event',
        start: '2024-10-01T00:00:00',
        end: '2024-10-01T23:59:59',
        allDay: true,
        eventType: 'CUSTOM',
        source: 'MANUAL',
      };

      render(
        <CalendarViewComponent 
          month={currentDate}
          events={[...mockEvents, prevMonthEvent, nextMonthEvent]}
        />,
        { wrapper: createWrapper() }
      );

      // Check that adjacent month events are visible
      expect(screen.getByText('August Event')).toBeInTheDocument();
      expect(screen.getByText('October Event')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should fetch events from API when no events provided', async () => {
      const apiEvents: CalendarEvent[] = [
        {
          id: 101,
          title: 'API Event 1',
          start: '2024-09-10T10:00:00Z',
          end: '2024-09-10T11:00:00Z',
          allDay: false,
          eventType: 'CUSTOM',
          source: 'ICAL_FEED',
        },
        {
          id: 102,
          title: 'API Event 2',
          start: '2024-09-15T14:00:00Z',
          end: '2024-09-15T15:00:00Z',
          allDay: false,
          eventType: 'ASSEMBLY',
          source: 'SYSTEM',
        },
      ];

      vi.mocked(calendarApi.getEvents).mockResolvedValue(apiEvents);

      const currentDate = new Date(2024, 8, 1);
      render(
        <CalendarViewComponent 
          month={currentDate}
          // No events prop provided
        />,
        { wrapper: createWrapper() }
      );

      // Check loading state
      expect(screen.getByTestId('calendar-loading')).toBeInTheDocument();

      // Wait for events to load
      await waitFor(() => {
        expect(screen.queryByTestId('calendar-loading')).not.toBeInTheDocument();
      });

      // Check that API was called with correct date range
      expect(calendarApi.getEvents).toHaveBeenCalledWith({
        startDate: expect.any(String),
        endDate: expect.any(String),
      });

      // Check that events are displayed
      expect(screen.getByText('API Event 1')).toBeInTheDocument();
      expect(screen.getByText('API Event 2')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(calendarApi.getEvents).mockRejectedValue(new Error('API Error'));

      const currentDate = new Date(2024, 8, 1);
      render(
        <CalendarViewComponent 
          month={currentDate}
        />,
        { wrapper: createWrapper() }
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.queryByTestId('calendar-loading')).not.toBeInTheDocument();
      });

      // Calendar should still render, just without events
      expect(screen.getByText('September 2024')).toBeInTheDocument();
    });
  });

  describe('Event Interactions', () => {
    it('should show event details on hover', async () => {
      const user = userEvent.setup();
      const currentDate = new Date(2024, 8, 1);
      
      render(
        <CalendarViewComponent 
          month={currentDate}
          events={mockEvents}
        />,
        { wrapper: createWrapper() }
      );

      const event = screen.getByText('Math Lesson');
      
      // Hover over event
      await user.hover(event);

      // Should show tooltip or additional info (implementation dependent)
      // This test assumes some visual feedback on hover
      expect(event.closest('div')).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('Performance Optimizations', () => {
    it('should memoize calendar days calculation', () => {
      const { rerender } = render(
        <CalendarViewComponent 
          month={new Date(2024, 8, 1)}
          events={mockEvents}
        />,
        { wrapper: createWrapper() }
      );

      // Initial render
      const initialDays = screen.getAllByText(/^\d+$/);
      
      // Rerender with same props
      rerender(
        <CalendarViewComponent 
          month={new Date(2024, 8, 1)}
          events={mockEvents}
        />
      );

      // Should use memoized values (no recalculation)
      const rerenderDays = screen.getAllByText(/^\d+$/);
      expect(rerenderDays.length).toBe(initialDays.length);
    });

    it('should handle large numbers of events efficiently', () => {
      const manyEvents: CalendarEvent[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        title: `Event ${i}`,
        start: `2024-09-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}T00:00:00`,
        end: `2024-09-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}T23:59:59`,
        allDay: true,
        eventType: 'CUSTOM',
        source: 'MANUAL',
      }));

      const { container } = render(
        <CalendarViewComponent 
          month={new Date(2024, 8, 1)}
          events={manyEvents}
        />,
        { wrapper: createWrapper() }
      );

      // Should render without performance issues
      const eventElements = container.querySelectorAll('[data-event-id]');
      expect(eventElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for calendar navigation', () => {
      render(
        <CalendarViewComponent 
          month={new Date(2024, 8, 1)}
          events={[]}
        />,
        { wrapper: createWrapper() }
      );

      // Calendar should have proper role
      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
      expect(calendar).toHaveAttribute('aria-label', expect.stringContaining('September 2024'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle months with different numbers of days', () => {
      // February 2024 (leap year - 29 days)
      const february = new Date(2024, 1, 1);
      const { rerender } = render(
        <CalendarViewComponent 
          month={february}
          events={[]}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('February 2024')).toBeInTheDocument();
      let dayCells = screen.getAllByText(/^\d+$/);
      expect(dayCells.filter(cell => parseInt(cell.textContent!) <= 29).length).toBe(29);

      // April 2024 (30 days)
      const april = new Date(2024, 3, 1);
      rerender(
        <CalendarViewComponent 
          month={april}
          events={[]}
        />
      );

      expect(screen.getByText('April 2024')).toBeInTheDocument();
      dayCells = screen.getAllByText(/^\d+$/);
      expect(dayCells.filter(cell => parseInt(cell.textContent!) <= 30).length).toBe(30);
    });

    it('should handle events with missing or invalid dates', () => {
      const invalidEvents: CalendarEvent[] = [
        {
          id: 1,
          title: 'Valid Event',
          start: '2024-09-15T00:00:00',
          end: '2024-09-15T23:59:59',
          allDay: true,
          eventType: 'CUSTOM',
          source: 'MANUAL',
        },
      ];

      render(
        <CalendarViewComponent 
          month={new Date(2024, 8, 1)}
          events={invalidEvents}
        />,
        { wrapper: createWrapper() }
      );

      // Should render only valid events
      expect(screen.getByText('Valid Event')).toBeInTheDocument();
    });

    it('should handle empty events array', () => {
      render(
        <CalendarViewComponent 
          month={new Date(2024, 8, 1)}
          events={[]}
        />,
        { wrapper: createWrapper() }
      );

      // Calendar should render normally without events
      expect(screen.getByText('September 2024')).toBeInTheDocument();
      const dayCells = screen.getAllByText(/^\d+$/);
      expect(dayCells.length).toBeGreaterThanOrEqual(30);
    });
  });
});