import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';

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
    useHolidays: vi.fn().mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    }),
    usePlannerSuggestions: vi.fn().mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    }),
    useGeneratePlan: vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
    }),
    useMaterialDetails: vi.fn().mockReturnValue({
      data: {
        materials: [],
        checklist: {},
      },
      isLoading: false,
      error: null,
    }),
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
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
declare module 'sonner' {
  interface ToastOptions {
    // Add any toast options you need to mock
    duration?: number;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }

  export const toast: {
    (message: string, options?: ToastOptions): string | number;
    success(message: string, options?: ToastOptions): string | number;
    error(message: string, options?: ToastOptions): string | number;
    // Add other toast methods as needed
  };
}

vi.mock('sonner', () => ({
  toast: vi.fn().mockImplementation((message) => {
    console.log('Mock toast called with:', message);
    return 'mock-toast-id';
  }),
  __esModule: true,
}));

describe('WeeklyPlannerPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Suppress React 18 console errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
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
    // Check for the date input which should always be present
    expect(screen.getByTestId('week-start-input')).toBeInTheDocument();
  });
});
