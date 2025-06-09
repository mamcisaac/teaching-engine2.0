import { fireEvent, screen } from '@testing-library/react';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';
import { renderWithRouter } from '../src/test-utils';
import type { LessonPlan } from '../src/api';
import { vi } from 'vitest';

const mutateMock = vi.fn();
const refetchMock = vi.fn();
// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
var toastErrorMock: any;

vi.mock('sonner', () => {
  toastErrorMock = vi.fn();
  return {
    toast: { error: toastErrorMock, success: vi.fn() },
    Toaster: () => null,
  };
});

const generateState = { mutate: mutateMock, isPending: false };
let lessonPlanData: LessonPlan | undefined = {
  id: 1,
  weekStart: '2025-01-01T00:00:00.000Z',
  schedule: [],
};

vi.mock('../src/api', async () => {
  const actual = await vi.importActual('../src/api');
  return {
    ...actual,
    useLessonPlan: () => ({
      data: lessonPlanData,
      refetch: refetchMock,
    }),
    useSubjects: () => ({ data: [] }),
    useGeneratePlan: () => generateState,
  };
});

beforeEach(() => {
  lessonPlanData = {
    id: 1,
    weekStart: '2025-01-01T00:00:00.000Z',
    schedule: [],
  };
  mutateMock.mockClear();
  refetchMock.mockClear();
  toastErrorMock.mockClear();
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

test('shows loading state while generating', () => {
  generateState.isPending = true;
  renderWithRouter(<WeeklyPlannerPage />);
  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(button.textContent).toMatch(/filling/i);
  generateState.isPending = false;
});

test('displays toast on failure', () => {
  renderWithRouter(<WeeklyPlannerPage />);
  fireEvent.click(screen.getByText('Auto Fill'));
  const options = mutateMock.mock.calls[0][1];
  if (options?.onError) options.onError();
  expect(toastErrorMock).toHaveBeenCalled();
});

test('handles missing plan gracefully', () => {
  lessonPlanData = undefined;
  renderWithRouter(<WeeklyPlannerPage />);
  expect(screen.getByText('Auto Fill')).toBeInTheDocument();
  expect(screen.getByTestId('no-plan-message')).toBeInTheDocument();
  // The component still renders the day grid even without plan data
  expect(screen.getByTestId('day-0')).toBeInTheDocument();
  // Check if it shows Monday label
  expect(screen.getByText('Mon')).toBeInTheDocument();
});
