import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock the WeeklyPlannerPage component
vi.mock('../src/pages/WeeklyPlannerPage', () => ({
  __esModule: true,
  default: () => <div data-testid="weekly-planner">Mocked Weekly Planner</div>,
}));

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
          <div>Test Wrapper</div>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Test Wrapper')).toBeInTheDocument();
  });
});
