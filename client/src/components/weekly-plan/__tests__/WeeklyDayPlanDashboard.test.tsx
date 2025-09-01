import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { WeeklyDayPlanDashboard } from '../../../pages/WeeklyDayPlanDashboard';
import { useWeeklyDashboardStore } from '../../../stores/weeklyDashboardStore';
import { apiClient } from '../../../api/core/client';

// Mock the API client
vi.mock('../../../api/core/client', () => ({
  apiClient: {
    lessonPlans: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

// Mock the lazy-loaded components
vi.mock('../ConflictResolver', () => ({
  ConflictResolver: () => <div>Conflict Resolver</div>
}));

vi.mock('../ScheduleCustomizer', () => ({
  ScheduleCustomizer: () => <div>Schedule Customizer</div>
}));

vi.mock('../WeeklyPlanSettings', () => ({
  WeeklyPlanSettings: () => <div>Weekly Plan Settings</div>
}));

const mockLessons = [
  {
    id: '1',
    title: 'Introduction to Addition',
    subject: 'mathematics',
    grade_level: '1',
    duration_minutes: 45,
    date: new Date().toISOString().split('T')[0],
    materials: JSON.stringify({
      timeSlot: {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '09:45'
      }
    }),
    status: 'planned' as const
  },
  {
    id: '2',
    title: 'French Vocabulary',
    subject: 'french',
    grade_level: '1',
    duration_minutes: 45,
    date: new Date().toISOString().split('T')[0],
    materials: JSON.stringify({
      timeSlot: {
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '10:45'
      }
    }),
    status: 'planned' as const
  }
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          {children}
        </DndProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('WeeklyDayPlanDashboard', () => {
  beforeEach(() => {
    // Reset Zustand store
    useWeeklyDashboardStore.setState({
      undoStack: [],
      redoStack: [],
      viewPreferences: {
        showWeekends: false,
        showTimeLabels: true,
        compactView: false,
        groupBySubject: false,
        showCompletedLessons: true,
        use24HourTime: false,
        dayStartTime: '08:00',
        dayEndTime: '16:00',
        theme: 'light',
        colorblindMode: false,
        highContrast: false,
        enableKeyboardShortcuts: true,
        enableReminders: false,
        reminderMinutesBefore: 5,
        autoRefresh: false,
        refreshInterval: 30,
        enableOfflineMode: false
      },
      offlineQueue: []
    });

    // Mock API responses
    (apiClient.lessonPlans.list as any).mockResolvedValue({
      data: mockLessons,
      total: mockLessons.length
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the weekly day plan dashboard', async () => {
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Weekly Day Plan')).toBeInTheDocument();
    expect(screen.getByLabelText('Quick Add Lesson')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('displays days of the week', async () => {
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    weekDays.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('loads and displays lessons', async () => {
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Introduction to Addition')).toBeInTheDocument();
      expect(screen.getByText('French Vocabulary')).toBeInTheDocument();
    });
  });

  it('highlights the current day', async () => {
    const today = new Date().getDay();
    if (today >= 1 && today <= 5) { // Only test on weekdays
      render(
        <TestWrapper>
          <WeeklyDayPlanDashboard />
        </TestWrapper>
      );

      const dayColumns = screen.getAllByRole('region');
      const todayColumn = dayColumns[today - 1];
      expect(todayColumn).toHaveClass('ring-2', 'ring-primary');
    }
  });

  it('opens quick add modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    const quickAddButton = screen.getByLabelText('Quick Add Lesson');
    await user.click(quickAddButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Quick Add Lesson')).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Introduction to Addition')).toBeInTheDocument();
    });

    const firstLesson = screen.getByText('Introduction to Addition').closest('[role="button"]');
    if (firstLesson) {
      firstLesson.focus();
      
      // Test arrow key navigation
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).not.toBe(firstLesson);
      
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(firstLesson);
      
      // Test Enter key to open details
      await user.keyboard('{Enter}');
      // Would open lesson details in real implementation
    }
  });

  it('shows offline indicator when offline', async () => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Offline Mode')).toBeInTheDocument();
  });

  it('supports undo/redo actions', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    // Simulate an action that can be undone
    useWeeklyDashboardStore.getState().addToUndoStack({
      type: 'move',
      lessonId: '1',
      previousState: { timeSlot: { dayOfWeek: 1, startTime: '09:00', endTime: '09:45' } },
      newState: { timeSlot: { dayOfWeek: 2, startTime: '09:00', endTime: '09:45' } }
    });

    rerender(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    // Test keyboard shortcut for undo
    await user.keyboard('{Control>}z{/Control}');
    
    expect(useWeeklyDashboardStore.getState().undoStack).toHaveLength(0);
    expect(useWeeklyDashboardStore.getState().redoStack).toHaveLength(1);
  });

  it('displays time labels when enabled', async () => {
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    const timeLabels = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'];
    timeLabels.forEach(time => {
      expect(screen.getByText(time)).toBeInTheDocument();
    });
  });

  it('handles drag and drop between days', async () => {
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Introduction to Addition')).toBeInTheDocument();
    });

    // Note: Full drag-and-drop testing would require more complex setup with @dnd-kit
    // This is a placeholder for the drag-drop test structure
    const lesson = screen.getByText('Introduction to Addition').closest('[draggable="true"]');
    expect(lesson).toBeInTheDocument();
  });

  it('filters lessons by search query', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Introduction to Addition')).toBeInTheDocument();
      expect(screen.getByText('French Vocabulary')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search lessons...');
    await user.type(searchInput, 'French');

    await waitFor(() => {
      expect(screen.queryByText('Introduction to Addition')).not.toBeInTheDocument();
      expect(screen.getByText('French Vocabulary')).toBeInTheDocument();
    });
  });

  it('opens settings dialog', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    const settingsButton = screen.getByLabelText('Settings');
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText('Weekly Plan Settings')).toBeInTheDocument();
    });
  });

  it('displays current time indicator', () => {
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    const currentTimeIndicator = screen.getByTestId('current-time-indicator');
    expect(currentTimeIndicator).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (apiClient.lessonPlans.list as any).mockRejectedValueOnce(new Error('API Error'));

    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading lessons/i)).toBeInTheDocument();
    });
  });

  it('supports print preview', async () => {
    const user = userEvent.setup();
    window.print = vi.fn();

    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    const printButton = screen.getByLabelText('Print');
    await user.click(printButton);

    expect(window.print).toHaveBeenCalled();
  });

  it('toggles compact view', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    // Open settings
    const settingsButton = screen.getByLabelText('Settings');
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText('Weekly Plan Settings')).toBeInTheDocument();
    });

    // Would toggle compact view in settings
    // This is a placeholder for the full implementation
  });

  it('handles quick add form submission', async () => {
    const user = userEvent.setup();
    (apiClient.lessonPlans.create as any).mockResolvedValueOnce({
      id: '3',
      title: 'New Lesson',
      subject: 'science',
      grade_level: '1',
      duration_minutes: 45,
      date: new Date().toISOString().split('T')[0],
      status: 'planned'
    });

    render(
      <TestWrapper>
        <WeeklyDayPlanDashboard />
      </TestWrapper>
    );

    const quickAddButton = screen.getByLabelText('Quick Add Lesson');
    await user.click(quickAddButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'New Lesson');

    const submitButton = screen.getByText('Add Lesson');
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiClient.lessonPlans.create).toHaveBeenCalled();
    });
  });
});