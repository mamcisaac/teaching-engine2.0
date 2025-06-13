import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';
import { api } from '../src/api';

// Mock API functions

// Type assertion for the mocked API

// Mock the API module
vi.mock('../src/api', () => {
  // Helper function to get ISO week start date
  const getWeekStartISO = (date: Date): string => {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setUTCDate(diff));
    return monday.toISOString().split('T')[0];
  };

  return {
    // Mock axios instance
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    // Mock API functions
    getWeekStartISO,
    useLessonPlan: vi.fn().mockReturnValue({
      data: {
        id: 1,
        weekStart: '2025-01-01',
        dailyPlans: [],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
    useSubjects: vi.fn().mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Math',
          milestones: [
            {
              id: 1,
              title: 'Milestone 1',
              subjectId: 1,
              standardCodes: [],
              activities: [
                {
                  id: 1,
                  title: 'Activity 1',
                  durationMins: 30,
                  milestoneId: 1,
                  completedAt: null,
                  standardCodes: [],
                },
                {
                  id: 2,
                  title: 'Activity 2',
                  durationMins: 45,
                  milestoneId: 1,
                  completedAt: null,
                  standardCodes: [],
                },
              ],
            },
          ],
        },
      ],
      isLoading: false,
      error: null,
    }),
    useTimetable: vi.fn().mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    }),
    useCalendarEvents: vi.fn().mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    }),
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as unknown),
    useParams: () => ({
      id: '1',
    }),
  };
});

// Mock DnD Kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
  useDraggable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
  }),
}));

// Mock sonner
declare global {
  // eslint-disable-next-line no-var
  var toast: {
    success: () => void;
    error: () => void;
  };
}

globalThis.toast = {
  success: vi.fn(),
  error: vi.fn(),
};

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WeeklyPlannerPage - Integration', () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    // Suppress React 18 console errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WeeklyPlannerPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    // Mock loading state
    const loadingState = {
      data: undefined,
      error: null,
      isError: false,
      isLoading: true,
      isSuccess: false,
      status: 'loading',
      refetch: vi.fn(),
    };

    // Update the mock implementation
    vi.mocked(api).useLessonPlan.mockReturnValue(loadingState as unknown);

    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error message when data loading fails', async () => {
    // Mock error state
    const error = new Error('Failed to load');
    const errorState = {
      data: undefined,
      error,
      isError: true,
      isLoading: false,
      isSuccess: false,
      status: 'error',
      refetch: vi.fn(),
    };

    // Update the mock implementation
    vi.mocked(api).useLessonPlan.mockReturnValue(errorState as unknown);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('renders with data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Math')).toBeInTheDocument();
    });
  });
});
