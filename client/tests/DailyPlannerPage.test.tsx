import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DailyPlanPage from '../src/pages/DailyPlanPage';

// Mock the API module
vi.mock('../src/api', () => {
  return {
    // Mock axios instance
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    // Mock API functions
    useDailyPlan: vi.fn().mockReturnValue({
      data: {
        id: 1,
        date: '2025-01-01',
        lessonPlanId: 1,
        items: [
          {
            id: 1,
            startMin: 540, // 9:00 AM
            endMin: 580, // 9:40 AM
            slotId: 1,
            activityId: 1,
            activity: {
              id: 1,
              title: 'Math Activity',
              milestoneId: 1,
              outcomes: [
                {
                  outcome: {
                    id: 'M6.1',
                    code: 'M6.1',
                    description: 'Number operations',
                    subject: 'Math',
                    grade: 6,
                  },
                },
              ],
              milestone: {
                id: 1,
                subjectId: 1,
                subject: {
                  id: 1,
                  name: 'Math',
                },
              },
            },
            notes: 'Test notes',
          },
        ],
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
              title: 'Number Operations',
              subjectId: 1,
              activities: [
                {
                  id: 1,
                  title: 'Math Activity',
                  milestoneId: 1,
                  outcomes: [
                    {
                      outcome: {
                        id: 'M6.1',
                        code: 'M6.1',
                        description: 'Number operations',
                        subject: 'Math',
                        grade: 6,
                      },
                    },
                  ],
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
      data: [
        {
          id: 1,
          day: 0, // Monday
          startMin: 540,
          endMin: 580,
          subjectId: 1,
          subject: {
            id: 1,
            name: 'Math',
          },
        },
      ],
      isLoading: false,
      error: null,
    }),
    useGenerateDailyPlan: vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    }),
    useUpdateDailyPlan: vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    }),
    useUpdateActivity: vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    }),
    useAddNote: vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
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
      date: '2025-01-01',
    }),
  };
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DailyPlanPage', () => {
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
          <DailyPlanPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    // Check for the date input which should always be present
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
  });

  it('displays the daily timeline with activities', () => {
    renderComponent();

    // Check for timeline section
    expect(screen.getByText('Daily Timeline')).toBeInTheDocument();

    // Check for activity content
    expect(screen.getByText('Math Activity')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 09:40')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('shows generate plan button', () => {
    renderComponent();
    expect(screen.getByText('Generate Plan')).toBeInTheDocument();
  });
});
