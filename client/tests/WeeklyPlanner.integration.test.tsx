import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';

// Mock API functions

// Type assertion for the mocked API

// Mock the API module
vi.mock('../src/api', async (importOriginal) => {
  const actual = await importOriginal();
  // Helper function to get ISO week start date - mocked to return consistent date
  const getWeekStartISO = vi.fn().mockReturnValue('2025-06-09');

  return {
    ...(actual as object),
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
        schedule: [],
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
    useUpdateActivity: vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
    }),
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
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
vi.mock('sonner', () => ({
  toast: vi.fn().mockImplementation((message) => {
    console.log('Mock toast called with:', message);
    return 'mock-toast-id';
  }),
  __esModule: true,
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
    expect(screen.getByTestId('week-start-input')).toBeInTheDocument();
  });

  it('displays week days', async () => {
    renderComponent();

    // Check that the week days are rendered
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
  });

  it.skip('displays activity filters', async () => {
    renderComponent();

    // TODO: Update this test when activity filters are implemented
    // Check that the activity type filters are rendered
    // expect(screen.getByLabelText('HandsOn')).toBeInTheDocument();
    // expect(screen.getByLabelText('Worksheet')).toBeInTheDocument();
    // expect(screen.getByLabelText('Video')).toBeInTheDocument();
  });

  it('allows selecting a date', async () => {
    renderComponent();

    const dateInput = screen.getByTestId('week-start-input');
    expect(dateInput).toHaveValue('2025-06-09');
  });
});
