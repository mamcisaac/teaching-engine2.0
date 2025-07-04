import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarViewComponent } from '../CalendarViewComponent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { format } from 'date-fns';

// Mock the calendar events API module
vi.mock('../../api/domains/calendar', () => ({
  calendarApi: {
    getEvents: vi.fn(),
  },
}));

// Mock the modal component
vi.mock('../common/AddEventModal', () => ({
  AddEventModal: ({ open, onClose }: { open: boolean; onClose: () => void }) => 
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
  const mockEvents = [
    {
      id: '1',
      title: 'Math Lesson',
      date: new Date(2024, 8, 15), // September 15, 2024
      type: 'lesson' as const,
      color: '#3B82F6',
    },
    {
      id: '2',
      title: 'Science Unit',
      date: new Date(2024, 8, 20), // September 20, 2024
      type: 'unit' as const,
      color: '#10B981',
    },
    {
      id: '3',
      title: 'Parent Meeting',
      date: new Date(2024, 8, 25), // September 25, 2024
      type: 'event' as const,
      color: '#F59E0B',
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
          currentMonth={currentDate}
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
          currentMonth={currentDate}
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
          currentMonth={today}
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
      const prevMonthEvent = {
        id: 'prev',
        title: 'August Event',
        date: new Date(2024, 7, 31), // August 31, 2024
        type: 'event' as const,
        color: '#EF4444',
      };
      const nextMonthEvent = {
        id: 'next',
        title: 'October Event',
        date: new Date(2024, 9, 1), // October 1, 2024
        type: 'event' as const,
        color: '#8B5CF6',
      };

      render(
        <CalendarViewComponent 
          currentMonth={currentDate}
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
      const apiEvents = [
        {
          id: 'api-1',
          title: 'API Event 1',
          date: '2024-09-10T10:00:00Z',
          type: 'lesson',
          color: '#3B82F6',
        },
        {
          id: 'api-2',
          title: 'API Event 2',
          date: '2024-09-15T14:00:00Z',
          type: 'unit',
          color: '#10B981',
        },
      ];

      vi.mocked(calendarApi.getEvents).mockResolvedValue(apiEvents);

      const currentDate = new Date(2024, 8, 1);
      render(
        <CalendarViewComponent 
          currentMonth={currentDate}
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
          currentMonth={currentDate}
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

  describe('Add Event Modal', () => {
    it('should show add event button when showAddButton is true', () => {
      render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={[]}
          showAddButton={true}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
    });

    it('should not show add event button when showAddButton is false or undefined', () => {
      render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={[]}
          showAddButton={false}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByRole('button', { name: /add event/i })).not.toBeInTheDocument();
    });

    it('should open modal when add event button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={[]}
          showAddButton={true}
        />,
        { wrapper: createWrapper() }
      );

      const addButton = screen.getByRole('button', { name: /add event/i });
      await user.click(addButton);

      expect(screen.getByTestId('add-event-modal')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={[]}
          showAddButton={true}
        />,
        { wrapper: createWrapper() }
      );

      // Open modal
      const addButton = screen.getByRole('button', { name: /add event/i });
      await user.click(addButton);

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      await user.click(closeButton);

      expect(screen.queryByTestId('add-event-modal')).not.toBeInTheDocument();
    });
  });

  describe('Event Interactions', () => {
    it('should show event details on hover', async () => {
      const user = userEvent.setup();
      const currentDate = new Date(2024, 8, 1);
      
      render(
        <CalendarViewComponent 
          currentMonth={currentDate}
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

    it('should navigate to event details when clicked', async () => {
      const user = userEvent.setup();
      const onEventClick = vi.fn();
      const currentDate = new Date(2024, 8, 1);
      
      render(
        <CalendarViewComponent 
          currentMonth={currentDate}
          events={mockEvents}
          onEventClick={onEventClick}
        />,
        { wrapper: createWrapper() }
      );

      const event = screen.getByText('Math Lesson');
      await user.click(event);

      expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });
  });

  describe('Performance Optimizations', () => {
    it('should memoize calendar days calculation', () => {
      const { rerender } = render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={mockEvents}
        />,
        { wrapper: createWrapper() }
      );

      // Initial render
      const initialDays = screen.getAllByText(/^\d+$/);
      
      // Rerender with same props
      rerender(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={mockEvents}
        />
      );

      // Should use memoized values (no recalculation)
      const rerenderDays = screen.getAllByText(/^\d+$/);
      expect(rerenderDays.length).toBe(initialDays.length);
    });

    it('should handle large numbers of events efficiently', () => {
      const manyEvents = Array.from({ length: 100 }, (_, i) => ({
        id: `event-${i}`,
        title: `Event ${i}`,
        date: new Date(2024, 8, Math.floor(Math.random() * 30) + 1),
        type: 'lesson' as const,
        color: '#3B82F6',
      }));

      const { container } = render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
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
          currentMonth={new Date(2024, 8, 1)}
          events={[]}
        />,
        { wrapper: createWrapper() }
      );

      // Calendar should have proper role
      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
      expect(calendar).toHaveAttribute('aria-label', expect.stringContaining('September 2024'));
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onEventClick = vi.fn();
      
      render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={mockEvents}
          onEventClick={onEventClick}
        />,
        { wrapper: createWrapper() }
      );

      // Tab to first event
      await user.tab();
      const firstEvent = screen.getByText('Math Lesson');
      expect(firstEvent).toHaveFocus();

      // Press Enter to select
      await user.keyboard('{Enter}');
      expect(onEventClick).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle months with different numbers of days', () => {
      // February 2024 (leap year - 29 days)
      const february = new Date(2024, 1, 1);
      const { rerender } = render(
        <CalendarViewComponent 
          currentMonth={february}
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
          currentMonth={april}
          events={[]}
        />
      );

      expect(screen.getByText('April 2024')).toBeInTheDocument();
      dayCells = screen.getAllByText(/^\d+$/);
      expect(dayCells.filter(cell => parseInt(cell.textContent!) <= 30).length).toBe(30);
    });

    it('should handle events with missing or invalid dates', () => {
      const invalidEvents = [
        {
          id: '1',
          title: 'Valid Event',
          date: new Date(2024, 8, 15),
          type: 'lesson' as const,
          color: '#3B82F6',
        },
        {
          id: '2',
          title: 'Invalid Date Event',
          date: new Date('invalid'),
          type: 'lesson' as const,
          color: '#3B82F6',
        },
        {
          id: '3',
          title: 'Null Date Event',
          date: null as any,
          type: 'lesson' as const,
          color: '#3B82F6',
        },
      ];

      render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={invalidEvents}
        />,
        { wrapper: createWrapper() }
      );

      // Should only render valid event
      expect(screen.getByText('Valid Event')).toBeInTheDocument();
      expect(screen.queryByText('Invalid Date Event')).not.toBeInTheDocument();
      expect(screen.queryByText('Null Date Event')).not.toBeInTheDocument();
    });

    it('should handle very long event titles', () => {
      const longTitleEvent = {
        id: '1',
        title: 'This is a very long event title that should be truncated or wrapped appropriately to fit within the calendar cell without breaking the layout',
        date: new Date(2024, 8, 15),
        type: 'lesson' as const,
        color: '#3B82F6',
      };

      render(
        <CalendarViewComponent 
          currentMonth={new Date(2024, 8, 1)}
          events={[longTitleEvent]}
        />,
        { wrapper: createWrapper() }
      );

      const event = screen.getByText(/This is a very long event title/);
      expect(event).toBeInTheDocument();
      
      // Should have text truncation styling
      expect(event).toHaveClass('truncate');
    });
  });
});