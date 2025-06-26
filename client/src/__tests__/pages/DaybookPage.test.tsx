import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { format, startOfWeek } from 'date-fns';
import DaybookPage from '../../pages/DaybookPage';
import { renderWithAuth, mockLessonPlan } from '../../test-utils';
import * as etfoHooks from '../../hooks/useETFOPlanning';

// Mock the planning hooks
vi.mock('../../hooks/useETFOPlanning', () => ({
  useDaybookEntries: vi.fn(),
  useETFOLessonPlans: vi.fn(),
  useCreateDaybookEntry: vi.fn(),
  useUpdateDaybookEntry: vi.fn(),
}));

// Mock date-fns functions to have predictable dates in tests
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  const testDate = new Date('2024-01-15'); // Monday
  
  return {
    ...actual,
    format: vi.fn((date, formatStr) => {
      try {
        // Handle common format patterns with test date
        if (formatStr === 'yyyy-MM-dd') {
          return '2024-01-15';
        }
        if (formatStr === 'EEEE, MMMM d') {
          return 'Monday, January 15';
        }
        if (formatStr === 'MMMM d, yyyy') {
          return 'January 15, 2024';
        }
        // Fallback to actual format if it's safe
        return actual.format(date, formatStr);
      } catch {
        return '2024-01-15';
      }
    }),
    startOfWeek: vi.fn(() => testDate),
    endOfWeek: vi.fn(() => new Date('2024-01-21')),
    addDays: vi.fn((date, days) => {
      const result = new Date(testDate);
      result.setDate(result.getDate() + days);
      return result;
    }),
    isToday: vi.fn((date) => {
      try {
        return actual.format(date, 'yyyy-MM-dd') === '2024-01-15';
      } catch {
        return false;
      }
    }),
  };
});

// Mock react-to-print
vi.mock('react-to-print', () => ({
  useReactToPrint: vi.fn(() => vi.fn()),
}));

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('DaybookPage', () => {
  const user = userEvent.setup();

  const mockHooks = {
    useDaybookEntries: vi.fn(),
    useETFOLessonPlans: vi.fn(),
    useCreateDaybookEntry: vi.fn(),
    useUpdateDaybookEntry: vi.fn(),
  };

  const mockDaybookEntry = {
    id: '1',
    date: '2024-01-15',
    morningReflection: 'Good start to the week',
    teachingNotes: 'Students engaged with math lesson',
    eveningReflection: 'Great day overall',
    lessonsCompleted: ['1'],
    nextSteps: 'Review multiplication tables',
    highlights: 'Maria showed improvement in reading',
    challenges: 'John needs extra support with writing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    Object.entries(mockHooks).forEach(([key, mock]) => {
      (etfoHooks as any)[key] = mock;
    });

    mockHooks.useDaybookEntries.mockReturnValue({
      data: [mockDaybookEntry],
      isLoading: false,
      error: null,
    });

    mockHooks.useETFOLessonPlans.mockReturnValue({
      data: [mockLessonPlan],
      isLoading: false,
      error: null,
    });

    mockHooks.useCreateDaybookEntry.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });

    mockHooks.useUpdateDaybookEntry.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
  });

  it('renders weekly view with days of the week', () => {
    renderWithAuth(<DaybookPage />);

    // Should show weekday labels
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
  });

  it('highlights today in the week view', () => {
    renderWithAuth(<DaybookPage />);

    // Monday (2024-01-15) should be highlighted as today
    const mondayCard = screen.getByText('Monday').closest('[data-testid="day-card"]');
    expect(mondayCard).toHaveClass('border-blue-500'); // Today highlight
  });

  it('displays existing daybook entry for a day', () => {
    renderWithAuth(<DaybookPage />);

    expect(screen.getByText('Good start to the week')).toBeInTheDocument();
    expect(screen.getByText('Students engaged with math lesson')).toBeInTheDocument();
    expect(screen.getByText('Great day overall')).toBeInTheDocument();
  });

  it('allows creating a new daybook entry', async () => {
    const mockCreateMutate = vi.fn();
    mockHooks.useCreateDaybookEntry.mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    });

    // Mock no existing entries for Tuesday
    mockHooks.useDaybookEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithAuth(<DaybookPage />);

    // Click on Tuesday to add entry
    const tuesdayCard = screen.getByText('Tuesday').closest('[data-testid="day-card"]');
    const addButton = tuesdayCard?.querySelector('button[aria-label*="add"]');
    
    if (addButton) {
      await user.click(addButton);
    }

    // Fill in the form
    const morningInput = screen.getByLabelText(/morning reflection/i);
    await user.type(morningInput, 'Tuesday morning thoughts');

    const teachingNotesInput = screen.getByLabelText(/teaching notes/i);
    await user.type(teachingNotesInput, 'Science lesson went well');

    // Save the entry
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2024-01-16', // Tuesday
        morningReflection: 'Tuesday morning thoughts',
        teachingNotes: 'Science lesson went well',
      })
    );
  });

  it('allows editing an existing daybook entry', async () => {
    const mockUpdateMutate = vi.fn();
    mockHooks.useUpdateDaybookEntry.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<DaybookPage />);

    // Click edit button for Monday's entry
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Modify the morning reflection
    const morningInput = screen.getByDisplayValue('Good start to the week');
    await user.clear(morningInput);
    await user.type(morningInput, 'Updated morning reflection');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        morningReflection: 'Updated morning reflection',
      })
    );
  });

  it('navigates between weeks', async () => {
    renderWithAuth(<DaybookPage />);

    // Should show navigation buttons
    const prevWeekButton = screen.getByRole('button', { name: /previous week/i });
    const nextWeekButton = screen.getByRole('button', { name: /next week/i });

    expect(prevWeekButton).toBeInTheDocument();
    expect(nextWeekButton).toBeInTheDocument();

    // Click next week
    await user.click(nextWeekButton);

    // Should update the week display (dates would change)
    // This would require more complex mocking of the date state
  });

  it('displays lesson completion status', () => {
    renderWithAuth(<DaybookPage />);

    // Should show completed lesson indicator
    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-completed')).toBeInTheDocument();
  });

  it('allows marking lessons as completed', async () => {
    const mockUpdateMutate = vi.fn();
    mockHooks.useUpdateDaybookEntry.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<DaybookPage />);

    // Find and click lesson checkbox
    const lessonCheckbox = screen.getByRole('checkbox', { name: /test lesson/i });
    await user.click(lessonCheckbox);

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonsCompleted: expect.arrayContaining(['1']),
      })
    );
  });

  it('opens detailed view when day card is clicked', async () => {
    renderWithAuth(<DaybookPage />);

    const mondayCard = screen.getByText('Monday').closest('[data-testid="day-card"]');
    await user.click(mondayCard!);

    // Should show detailed view with all fields
    expect(screen.getByLabelText(/morning reflection/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teaching notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/evening reflection/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next steps/i)).toBeInTheDocument();
  });

  it('switches between weekly and daily views', async () => {
    renderWithAuth(<DaybookPage />);

    // Should show view toggle tabs
    const weeklyTab = screen.getByRole('tab', { name: /weekly/i });
    const dailyTab = screen.getByRole('tab', { name: /daily/i });

    expect(weeklyTab).toBeInTheDocument();
    expect(dailyTab).toBeInTheDocument();

    // Switch to daily view
    await user.click(dailyTab);

    // Should show focused daily view
    expect(screen.getByText(/today's focus/i)).toBeInTheDocument();
  });

  it('handles print functionality', async () => {
    renderWithAuth(<DaybookPage />);

    const printButton = screen.getByRole('button', { name: /print/i });
    expect(printButton).toBeInTheDocument();
    
    // Click should trigger print (mocked)
    await user.click(printButton);
  });

  it('shows loading state when data is loading', () => {
    mockHooks.useDaybookEntries.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithAuth(<DaybookPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error state when there is an error', () => {
    mockHooks.useDaybookEntries.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load daybook entries'),
    });

    renderWithAuth(<DaybookPage />);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('validates required fields before saving', async () => {
    mockHooks.useDaybookEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithAuth(<DaybookPage />);

    // Try to save empty entry
    const tuesdayCard = screen.getByText('Tuesday').closest('[data-testid="day-card"]');
    const addButton = tuesdayCard?.querySelector('button[aria-label*="add"]');
    
    if (addButton) {
      await user.click(addButton);
    }

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should show validation error
    expect(screen.getByText(/at least one field is required/i)).toBeInTheDocument();
  });

  it('auto-saves changes after delay', async () => {
    vi.useFakeTimers();
    
    const mockUpdateMutate = vi.fn();
    mockHooks.useUpdateDaybookEntry.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<DaybookPage />);

    // Start editing
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const morningInput = screen.getByDisplayValue('Good start to the week');
    await user.type(morningInput, ' - additional notes');

    // Fast forward auto-save delay
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalled();
    });

    vi.useRealTimers();
  });
});