import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OptimizedCalendarView } from '../OptimizedCalendarView';
import { vi } from 'vitest';
import { format } from 'date-fns';
import type { CalendarEvent } from '../../../types';

// Mock the API hook
vi.mock('../../../api/domains/calendar', () => ({
  useCalendarEvents: vi.fn(() => ({ data: [], isLoading: false, error: null }))
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('OptimizedCalendarView', () => {
  const mockMonth = new Date(2024, 0, 1); // January 2024
  const mockEvents: CalendarEvent[] = [
    {
      id: 1,
      title: 'Test Event 1',
      start: '2024-01-15T10:00:00',
      end: '2024-01-15T11:00:00',
      allDay: false,
      eventType: 'CUSTOM',
      source: 'MANUAL'
    },
    {
      id: 2,
      title: 'Test Event 2',
      start: '2024-01-15T14:00:00',
      end: '2024-01-15T15:00:00',
      allDay: false,
      eventType: 'CUSTOM',
      source: 'MANUAL'
    },
    {
      id: 3,
      title: 'Test Event 3',
      start: '2024-01-20T09:00:00',
      end: '2024-01-20T10:00:00',
      allDay: false,
      eventType: 'CUSTOM',
      source: 'MANUAL'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders calendar view with events', () => {
    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={mockEvents}
        />
      </TestWrapper>
    );

    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  it('handles events without start date gracefully', () => {
    const eventsWithoutStart: CalendarEvent[] = [
      {
        id: 1,
        title: 'No Start Date Event',
        start: null as any, // Testing edge case
        end: '2024-01-15T11:00:00',
        allDay: false,
        eventType: 'CUSTOM',
        source: 'MANUAL'
      }
    ];

    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={eventsWithoutStart}
        />
      </TestWrapper>
    );

    // Should render without crashing
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  it('handles empty grouped events correctly', () => {
    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={[]}
        />
      </TestWrapper>
    );

    // All calendar cells should be rendered (35 days minimum for a month view)
    const dayCells = screen.getAllByText(/^\d+$/);
    expect(dayCells.length).toBeGreaterThanOrEqual(28);
  });

  it('switches between calendar and list view', async () => {
    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={mockEvents}
        />
      </TestWrapper>
    );

    // Start in calendar view
    expect(screen.getByText('Sun')).toBeInTheDocument();

    // Switch to list view
    fireEvent.click(screen.getByRole('button', { name: /List \(3\)/ }));

    // Should show list view
    await waitFor(() => {
      expect(screen.queryByText('Sun')).not.toBeInTheDocument();
    });

    // All events should be listed
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    expect(screen.getByText('Test Event 3')).toBeInTheDocument();
  });

  it('handles click events on calendar dates', () => {
    const onDateClick = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={mockEvents}
          onDateClick={onDateClick}
        />
      </TestWrapper>
    );

    // Click on a date (day 15)
    fireEvent.click(screen.getByText('15'));
    
    expect(onDateClick).toHaveBeenCalledWith(expect.any(Date));
  });

  it('handles click events on event items', () => {
    const onEventClick = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={mockEvents}
          onEventClick={onEventClick}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Test Event 1'));
    
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('groups events by date correctly', () => {
    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={mockEvents}
          maxEventsPerDay={2}
        />
      </TestWrapper>
    );

    // Should show "+1 more" for January 15 since there are 2 events and maxEventsPerDay is 2
    const dayCell = screen.getByText('15').closest('div');
    expect(dayCell).toHaveTextContent('Test Event 1');
    expect(dayCell).toHaveTextContent('Test Event 2');
  });

  it('handles undefined event arrays', () => {
    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={undefined}
        />
      </TestWrapper>
    );

    // Should render without crashing
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  it('correctly initializes grouped events object', () => {
    const eventsOnDifferentDays: CalendarEvent[] = [
      {
        id: 1,
        title: 'Event on 5th',
        start: '2024-01-05T10:00:00',
        end: '2024-01-05T11:00:00',
        allDay: false,
        eventType: 'CUSTOM',
        source: 'MANUAL'
      },
      {
        id: 2,
        title: 'Event on 10th',
        start: '2024-01-10T10:00:00',
        end: '2024-01-10T11:00:00',
        allDay: false,
        eventType: 'CUSTOM',
        source: 'MANUAL'
      }
    ];

    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={eventsOnDifferentDays}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Event on 5th')).toBeInTheDocument();
    expect(screen.getByText('Event on 10th')).toBeInTheDocument();
  });

  it('handles malformed event dates gracefully', () => {
    const eventsWithBadDates: CalendarEvent[] = [
      {
        id: 1,
        title: 'Bad Date Event',
        start: 'not-a-date',
        end: 'not-a-date',
        allDay: false,
        eventType: 'CUSTOM',
        source: 'MANUAL'
      },
      {
        id: 2,
        title: 'Good Date Event',
        start: '2024-01-15T10:00:00',
        end: '2024-01-15T11:00:00',
        allDay: false,
        eventType: 'CUSTOM',
        source: 'MANUAL'
      }
    ];

    render(
      <TestWrapper>
        <OptimizedCalendarView
          month={mockMonth}
          events={eventsWithBadDates}
        />
      </TestWrapper>
    );

    // Should only render the event with valid date
    expect(screen.getByText('Good Date Event')).toBeInTheDocument();
    expect(screen.queryByText('Bad Date Event')).not.toBeInTheDocument();
  });
});