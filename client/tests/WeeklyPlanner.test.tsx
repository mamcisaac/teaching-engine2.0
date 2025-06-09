import { fireEvent, screen } from '@testing-library/react';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';
import { renderWithRouter } from '../src/test-utils';
import type { LessonPlan } from '../src/api';
import { vi } from 'vitest';
import type { LessonPlan } from '../src/api';

const mutateMock = vi.fn();
const refetchMock = vi.fn();
let lessonPlanReturn: { data?: LessonPlan; error?: Error; refetch: () => void };
let lessonPlanData: LessonPlan | undefined = {
  id: 1,
  weekStart: '2025-01-01T00:00:00.000Z',
  schedule: [],
};

beforeEach(() => {
  lessonPlanData = {
    id: 1,
    weekStart: '2025-01-01T00:00:00.000Z',
    schedule: [],
  };
  mutateMock.mockClear();
  refetchMock.mockClear();
});

vi.mock('../src/api', async () => {
  const actual = await vi.importActual('../src/api');
  return {
    ...actual,
    useLessonPlan: () => ({
      data: lessonPlanData,
      refetch: refetchMock,
    }),
    useSubjects: () => ({ data: [] }),
    useGeneratePlan: () => ({ mutate: mutateMock }),
  };
});

beforeEach(() => {
  lessonPlanReturn = {
    data: { id: 1, weekStart: '2025-01-01T00:00:00.000Z', schedule: [] },
    refetch: refetchMock,
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

test('shows empty grid and message when lesson plan missing', () => {
  lessonPlanReturn = { data: undefined, error: new Error('Not found'), refetch: refetchMock };
  renderWithRouter(<WeeklyPlannerPage />);
  expect(screen.getByTestId('day-0')).toBeInTheDocument();
  expect(screen.getByTestId('no-plan-message')).toBeInTheDocument();
  
test('handles missing plan gracefully', () => {
  lessonPlanData = undefined;
  renderWithRouter(<WeeklyPlannerPage />);
  expect(screen.getByText('Auto Fill')).toBeInTheDocument();
  expect(screen.queryByTestId('day-0')).not.toBeInTheDocument();
});
