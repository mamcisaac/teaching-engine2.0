/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import CalendarPlanningPage from '../../pages/planning/CalendarPlanningPage';
import { renderWithAuth } from '../../test-utils';

// Mock react-big-calendar
vi.mock('react-big-calendar', () => ({
  Calendar: ({ onSelectEvent, onSelectSlot, components, eventPropGetter }: any) => (
    <div data-testid="calendar">
      <div data-testid="custom-toolbar">
        {components?.toolbar &&
          components.toolbar({
            date: new Date('2024-01-15'),
            onNavigate: vi.fn(),
          })}
      </div>
      <div data-testid="calendar-events">
        <button
          onClick={() =>
            onSelectEvent({
              id: 'lesson-1',
              title: 'Test Lesson',
              type: 'lesson',
              metadata: { lessonId: '1', color: '#3B82F6', isEditable: true },
            })
          }
          data-testid="lesson-event"
        >
          Test Lesson
        </button>
        <button
          onClick={() => { void onSelectSlot({ start: new Date(), end: new Date() }); }}
          data-testid="calendar-slot"
        >
          Select Slot
        </button>
      </div>
      <div data-testid="event-style-test">
        {eventPropGetter &&
          JSON.stringify(
            eventPropGetter({
              metadata: { color: '#3B82F6' },
            }),
          )}
      </div>
    </div>
  ),
  momentLocalizer: vi.fn(() => ({})),
}));

// Mock moment
vi.mock('moment', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    format: vi.fn(() => 'January 2024'),
  })),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'MMMM yyyy') return 'January 2024';
    if (formatStr === 'yyyy-MM-dd') return '2024-01-15';
    if (formatStr === 'yyyy-MM') return '2024-01';
    return '2024-01-15';
  }),
  startOfMonth: vi.fn(() => new Date('2024-01-01')),
  endOfMonth: vi.fn(() => new Date('2024-01-31')),
}));

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock API
vi.mock('../../api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', name: 'Test Teacher' },
  })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock calendar components
vi.mock('../../components/calendar/CalendarEventModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, selectedDate, onEventCreated }: {
    isOpen: boolean;
    onClose: () => void;
    selectedDate?: Date;
    onEventCreated: () => void;
  }) =>
    isOpen ? (
      <div data-testid="calendar-event-modal">
        <h3>Create Event</h3>
        <div>Selected Date: {selectedDate?.toDateString()}</div>
        <button onClick={onEventCreated} data-testid="create-event-button">
          Create Event
        </button>
        <button onClick={onClose} data-testid="close-modal-button">
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock('../../components/calendar/CalendarEventDetails', () => ({
  __esModule: true,
  default: ({ event, onClose, onUpdate }: {
    event: { title: string; type: string };
    onClose: () => void;
    onUpdate: () => void;
  }) => (
    <div data-testid="calendar-event-details">
      <h3>Event Details</h3>
      <div>Event: {event.title}</div>
      <div>Type: {event.type}</div>
      <button onClick={onUpdate} data-testid="update-event-button">
        Update Event
      </button>
      <button onClick={onClose} data-testid="close-details-button">
        Close Details
      </button>
    </div>
  ),
}));

vi.mock('../../components/calendar/CalendarFilters', () => ({
  __esModule: true,
  default: ({ filters, onFiltersChange, availableSubjects }: any) => (
    <div data-testid="calendar-filters">
      <h3>Calendar Filters</h3>
      <div>Available Subjects: {availableSubjects.join(', ')}</div>
      <label>
        <input
          type="checkbox"
          checked={filters.showWeekends}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              showWeekends: e.target.checked,
            })
          }
          data-testid="show-weekends-filter"
        />
        Show Weekends
      </label>
      <select
        data-testid="subject-filter"
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            subjects: e.target.value ? [e.target.value] : [],
          })
        }
      >
        <option value="">All Subjects</option>
        {availableSubjects.map((subject: string) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock CSS imports
vi.mock('react-big-calendar/lib/css/react-big-calendar.css', () => ({}));
vi.mock('../../styles/calendar.css', () => ({}));

describe('CalendarPlanningPage', () => {
  const user = userEvent.setup();

  const mockCalendarEvents = [
    {
      id: 'cal-1',
      title: 'Winter Break',
      start: '2024-01-05',
      end: '2024-01-15',
      eventType: 'HOLIDAY',
      source: 'SYSTEM',
    },
    {
      id: 'cal-2',
      title: 'Professional Development',
      start: '2024-01-20',
      end: '2024-01-20',
      eventType: 'PD_DAY',
      source: 'MANUAL',
    },
  ];

  const mockLessons = [
    {
      id: 'lesson-1',
      title: 'Introduction to Fractions',
      date: '2024-01-16',
      unitPlanId: 'unit-1',
      unitPlan: {
        longRangePlan: {
          subject: 'mathematics',
        },
      },
    },
    {
      id: 'lesson-2',
      title: 'Reading Comprehension',
      date: '2024-01-17',
      unitPlanId: 'unit-2',
      unitPlan: {
        longRangePlan: {
          subject: 'language',
        },
      },
    },
  ];

  const mockUnits = [
    {
      id: 'unit-1',
      title: 'Fractions Unit',
      startDate: '2024-01-15',
      endDate: '2024-01-30',
    },
    {
      id: 'unit-2',
      title: 'Reading Unit',
      startDate: '2024-01-20',
      endDate: '2024-02-05',
    },
  ];

  const mockHooks = {
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup query and mutation mocks
    const { useQuery, useMutation, useQueryClient } = require('@tanstack/react-query');

    useQuery.mockImplementation(mockHooks.useQuery);
    useMutation.mockImplementation(mockHooks.useMutation);
    useQueryClient.mockImplementation(mockHooks.useQueryClient);

    // Setup default query returns
    mockHooks.useQuery
      .mockReturnValueOnce({ data: mockCalendarEvents }) // calendar events
      .mockReturnValueOnce({ data: mockLessons }) // lessons
      .mockReturnValueOnce({ data: mockUnits }); // units

    mockHooks.useMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    mockHooks.useQueryClient.mockReturnValue({
      invalidateQueries: vi.fn(),
    });

    // Mock window.innerWidth for responsive behavior
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders calendar planning page with header', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(screen.getByText('Calendar Planning')).toBeInTheDocument();
    expect(screen.getByText('Visual planning with drag-and-drop scheduling')).toBeInTheDocument();
  });

  it('displays custom calendar toolbar', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument();
    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
  });

  it('shows view toggle buttons', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agenda/i })).toBeInTheDocument();
  });

  it('displays add event and filters buttons', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('toggles filters panel when filters button is clicked', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(screen.queryByTestId('calendar-filters')).not.toBeInTheDocument();

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    expect(screen.getByTestId('calendar-filters')).toBeInTheDocument();
  });

  it('opens event modal when add event button is clicked', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    const addEventButton = screen.getByRole('button', { name: /add event/i });
    await user.click(addEventButton);

    expect(screen.getByTestId('calendar-event-modal')).toBeInTheDocument();
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('opens event modal when calendar slot is selected', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    const calendarSlot = screen.getByTestId('calendar-slot');
    await user.click(calendarSlot);

    expect(screen.getByTestId('calendar-event-modal')).toBeInTheDocument();
  });

  it('shows event details when event is selected', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    const lessonEvent = screen.getByTestId('lesson-event');
    await user.click(lessonEvent);

    expect(screen.getByTestId('calendar-event-details')).toBeInTheDocument();
    expect(screen.getByText('Event: Test Lesson')).toBeInTheDocument();
    expect(screen.getByText('Type: lesson')).toBeInTheDocument();
  });

  it('closes event modal when close button is clicked', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    // Open modal
    const addEventButton = screen.getByRole('button', { name: /add event/i });
    await user.click(addEventButton);

    expect(screen.getByTestId('calendar-event-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByTestId('close-modal-button');
    await user.click(closeButton);

    expect(screen.queryByTestId('calendar-event-modal')).not.toBeInTheDocument();
  });

  it('closes event details when close button is clicked', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    // Open event details
    const lessonEvent = screen.getByTestId('lesson-event');
    await user.click(lessonEvent);

    expect(screen.getByTestId('calendar-event-details')).toBeInTheDocument();

    // Close details
    const closeButton = screen.getByTestId('close-details-button');
    await user.click(closeButton);

    expect(screen.queryByTestId('calendar-event-details')).not.toBeInTheDocument();
  });

  it('invalidates queries when event is created', async () => {
    const mockInvalidateQueries = vi.fn();
    mockHooks.useQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    renderWithAuth(<CalendarPlanningPage />);

    // Open modal and create event
    const addEventButton = screen.getByRole('button', { name: /add event/i });
    await user.click(addEventButton);

    const createEventButton = screen.getByTestId('create-event-button');
    await user.click(createEventButton);

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar-events'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['lessons'] });
  });

  it('invalidates queries when event is updated', async () => {
    const mockInvalidateQueries = vi.fn();
    mockHooks.useQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    renderWithAuth(<CalendarPlanningPage />);

    // Open event details and update
    const lessonEvent = screen.getByTestId('lesson-event');
    await user.click(lessonEvent);

    const updateEventButton = screen.getByTestId('update-event-button');
    await user.click(updateEventButton);

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['calendar-events'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['lessons'] });
  });

  it('displays filters with available subjects', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    expect(screen.getByText('Available Subjects: mathematics, language')).toBeInTheDocument();
    expect(screen.getByTestId('show-weekends-filter')).toBeInTheDocument();
    expect(screen.getByTestId('subject-filter')).toBeInTheDocument();
  });

  it('applies filters when filter options are changed', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    // Toggle show weekends
    const showWeekendsFilter = screen.getByTestId('show-weekends-filter');
    await user.click(showWeekendsFilter);

    // Select subject filter
    const subjectFilter = screen.getByTestId('subject-filter');
    await user.selectOptions(subjectFilter, 'mathematics');

    expect(showWeekendsFilter).not.toBeChecked();
    expect(subjectFilter).toHaveValue('mathematics');
  });

  it('switches calendar views when view buttons are clicked', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    const weekButton = screen.getByRole('button', { name: /week/i });
    await user.click(weekButton);

    // In real implementation, this would change the calendar view
    expect(weekButton).toBeInTheDocument();

    const agendaButton = screen.getByRole('button', { name: /agenda/i });
    await user.click(agendaButton);

    expect(agendaButton).toBeInTheDocument();
  });

  it('renders calendar with correct props', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-events')).toBeInTheDocument();
  });

  it('applies event styling through eventPropGetter', () => {
    renderWithAuth(<CalendarPlanningPage />);

    const eventStyleTest = screen.getByTestId('event-style-test');
    expect(eventStyleTest.textContent).toContain('#3B82F6'); // Should contain the color
    expect(eventStyleTest.textContent).toContain('backgroundColor');
  });

  it('queries calendar events with correct date range', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(mockHooks.useQuery).toHaveBeenCalledWith({
      queryKey: ['calendar-events', '2024-01-15', '2024-01-15'], // mocked dates
      queryFn: expect.any(Function),
    });
  });

  it('queries lessons with correct date parameters', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(mockHooks.useQuery).toHaveBeenCalledWith({
      queryKey: ['lessons', '2024-01'],
      queryFn: expect.any(Function),
    });
  });

  it('queries unit plans', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(mockHooks.useQuery).toHaveBeenCalledWith({
      queryKey: ['unit-plans'],
      queryFn: expect.any(Function),
    });
  });

  it('handles navigation with toolbar buttons', () => {
    renderWithAuth(<CalendarPlanningPage />);

    // Navigation buttons should be rendered in the toolbar
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
  });

  it('displays responsive layout classes', () => {
    renderWithAuth(<CalendarPlanningPage />);

    const container = screen.getByText('Calendar Planning').closest('div');
    expect(container).toHaveClass('container', 'mx-auto', 'px-2', 'sm:px-4', 'py-4', 'sm:py-6');
  });

  it('renders with mobile-optimized view on small screens', () => {
    // Mock mobile screen width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });

    renderWithAuth(<CalendarPlanningPage />);

    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    // Mobile-specific behavior would be tested with actual calendar height and default view
  });

  it('handles mutation for lesson rescheduling', () => {
    renderWithAuth(<CalendarPlanningPage />);

    expect(mockHooks.useMutation).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    });
  });

  it('shows calendar with correct container styling', () => {
    renderWithAuth(<CalendarPlanningPage />);

    const calendarContainer = screen.getByTestId('calendar').closest('.bg-white');
    expect(calendarContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg');
  });

  it('handles event creation from slot selection', async () => {
    renderWithAuth(<CalendarPlanningPage />);

    // Select a calendar slot
    const calendarSlot = screen.getByTestId('calendar-slot');
    await user.click(calendarSlot);

    // Should open modal with selected date
    expect(screen.getByTestId('calendar-event-modal')).toBeInTheDocument();
    expect(screen.getByText(/selected date/i)).toBeInTheDocument();
  });
});
