import { fireEvent, screen, waitFor } from '@testing-library/react';
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
let subjectsData = [
  {
    id: 1,
    name: 'Subj',
    milestones: [
      {
        id: 1,
        title: 'M1',
        subjectId: 1,
        activities: [{ id: 1, title: 'Act1', milestoneId: 1, completedAt: null }],
      },
    ],
  },
];

vi.mock('../src/api', async () => {
  const actual = await vi.importActual('../src/api');
  return {
    ...actual,
    useLessonPlan: () => ({
      data: lessonPlanData,
      refetch: refetchMock,
    }),
    useSubjects: () => ({ data: subjectsData }),
    useGeneratePlan: () => generateState,
  };
});

beforeEach(() => {
  lessonPlanData = {
    id: 1,
    weekStart: '2025-01-01T00:00:00.000Z',
    schedule: [],
  };
  generateState.isPending = false;
  subjectsData = [
    {
      id: 1,
      name: 'Subj',
      milestones: [
        {
          id: 1,
          title: 'M1',
          subjectId: 1,
          activities: [{ id: 1, title: 'Act1', milestoneId: 1, completedAt: null }],
        },
      ],
    },
  ];
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

test('dragging activity onto day triggers save', async () => {
  // @ts-expect-error - global defined in vitest
  global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as unknown as typeof fetch;
  const { rerender } = renderWithRouter(<WeeklyPlannerPage />);
  const activity = screen.getByText('Act1');
  const dayZone = screen.getByTestId('day-0');

  fireEvent.pointerDown(activity);
  fireEvent.pointerMove(dayZone);
  fireEvent.pointerUp(dayZone);

  await screen.findByTestId('day-0');
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(refetchMock).toHaveBeenCalled();

  // simulate updated data returned from refetch
  lessonPlanData!.schedule.push({
    id: 0,
    day: 0,
    activityId: 1,
    activity: subjectsData[0].milestones[0].activities[0],
  });
  rerender(<WeeklyPlannerPage />);
  expect(screen.getByText('Act1')).toBeInTheDocument();
});
