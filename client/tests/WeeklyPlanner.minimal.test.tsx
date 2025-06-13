import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';

// Simple test to verify the test setup works
describe('WeeklyPlannerPage', () => {
  it('renders without crashing', () => {
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

    // Check for the week start input field
    expect(screen.getByTestId('week-start-input')).toBeInTheDocument();
  });
});
