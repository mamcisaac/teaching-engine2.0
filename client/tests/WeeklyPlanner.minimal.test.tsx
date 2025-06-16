import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';
import { vi } from 'vitest';

// Mock the API module
vi.mock('../src/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useLessonPlan: () => ({
      data: null,
      refetch: vi.fn(),
      isLoading: false,
      error: null,
    }),
    useSubjects: () => ({
      data: [],
      isLoading: false,
      error: null,
    }),
    useTimetable: () => ({
      data: [],
    }),
    useCalendarEvents: () => ({
      data: [],
    }),
    useHolidays: () => ({
      data: [],
    }),
    usePlannerSuggestions: () => ({
      data: [],
    }),
    useGeneratePlan: () => ({
      mutate: vi.fn(),
      isLoading: false,
    }),
    useUpdateActivity: () => ({
      mutate: vi.fn(),
      isLoading: false,
    }),
  };
});

// Simple test to verify the test setup works
describe('WeeklyPlannerPage', () => {
  it('renders without crashing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WeeklyPlannerPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for the component to render and check for the week start input field
    await waitFor(() => {
      expect(screen.getByTestId('week-start-input')).toBeInTheDocument();
    });
  });
});
