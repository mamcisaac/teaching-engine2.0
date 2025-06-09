import { screen } from '@testing-library/react';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';
import { renderWithRouter } from '../src/test-utils';
import { vi } from 'vitest';

vi.mock('../src/api', async () => {
  const actual = await vi.importActual('../src/api');
  return {
    ...actual,
    useLessonPlan: () => ({
      data: { id: 1, weekStart: '2025-01-01T00:00:00.000Z', schedule: [] },
      refetch: vi.fn(),
    }),
    useSubjects: () => ({ data: [] }),
    useGeneratePlan: () => ({ mutate: vi.fn() }),
  };
});

test('renders weekly planner layout', () => {
  renderWithRouter(<WeeklyPlannerPage />);
  expect(screen.getByText('Auto Fill')).toBeInTheDocument();
  expect(screen.getByTestId('day-0')).toBeInTheDocument();
});
