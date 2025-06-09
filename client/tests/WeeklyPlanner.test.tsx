import { fireEvent, screen } from '@testing-library/react';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';
import { renderWithRouter } from '../src/test-utils';
import { vi } from 'vitest';

const mutateMock = vi.fn();
const refetchMock = vi.fn();

vi.mock('../src/api', async () => {
  const actual = await vi.importActual('../src/api');
  return {
    ...actual,
    useLessonPlan: () => ({
      data: { id: 1, weekStart: '2025-01-01T00:00:00.000Z', schedule: [] },
      refetch: refetchMock,
    }),
    useSubjects: () => ({ data: [] }),
    useGeneratePlan: () => ({ mutate: mutateMock }),
  };
});

test('renders weekly planner layout', () => {
  renderWithRouter(<WeeklyPlannerPage />);
  expect(screen.getByText('Auto Fill')).toBeInTheDocument();
  expect(screen.getByTestId('day-0')).toBeInTheDocument();
});

test('auto fill generates plan and refetches', () => {
  renderWithRouter(<WeeklyPlannerPage />);
  fireEvent.click(screen.getByText('Auto Fill'));
  expect(mutateMock).toHaveBeenCalled();
  // simulate success callback
  const options = mutateMock.mock.calls[0][1];
  if (options?.onSuccess) options.onSuccess();
  expect(refetchMock).toHaveBeenCalled();
});
