import React from 'react';
import { fireEvent, screen, waitFor, act, within } from '@testing-library/react';
import WeeklyPlannerPage from '../src/pages/WeeklyPlannerPage';
import { renderWithRouter } from '../src/test-utils';
import type { LessonPlan, Subject } from '../src/api';
import { vi } from 'vitest';

import type { DragEndEvent } from '@dnd-kit/core';
const mutateMock = vi.fn();
const refetchMock = vi.fn();
const originalFetch = global.fetch;
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
let triggerDrop: (e: DragEndEvent) => void = () => {};
vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: (props: {
      children: React.ReactNode;
      onDragEnd: (event: DragEndEvent) => void;
    }) => {
      triggerDrop = props.onDragEnd;
      return <div>{props.children}</div>;
    },
  };
});
let lessonPlanData: LessonPlan | undefined = {
  id: 1,
  weekStart: '2025-01-01T00:00:00.000Z',
  schedule: [],
};
let subjects: Subject[] = [];

vi.mock('../src/api', async () => {
  const actual = await vi.importActual('../src/api');
  return {
    ...actual,
    useLessonPlan: () => ({
      data: lessonPlanData,
      refetch: refetchMock,
    }),
    useSubjects: () => ({ data: subjects }),
    useGeneratePlan: () => generateState,
  };
});

beforeEach(() => {
  subjects = [];
  lessonPlanData = {
    id: 1,
    weekStart: '2025-01-01T00:00:00.000Z',
    schedule: [],
  };
  mutateMock.mockClear();
  refetchMock.mockClear();
  toastErrorMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
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

test('shows server message on 400 failure', () => {
  renderWithRouter(<WeeklyPlannerPage />);
  fireEvent.click(screen.getByText('Auto Fill'));
  const options = mutateMock.mock.calls[0][1];
  if (options?.onError)
    options.onError({
      response: { status: 400, data: { error: 'No activities available' } },
      isAxiosError: true,
    });
  expect(toastErrorMock).toHaveBeenCalledWith('No activities available');
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

test('saves schedule when dragging activity to a day', async () => {
  subjects = [
    {
      id: 1,
      name: 'Math',
      milestones: [
        {
          id: 1,
          title: 'M1',
          subjectId: 1,
          activities: [{ id: 1, title: 'Act 1', milestoneId: 1, completedAt: null }],
        },
      ],
    },
  ];
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  // @ts-expect-error mock fetch
  global.fetch = fetchMock;

  renderWithRouter(<WeeklyPlannerPage />);
  const draggable = screen.getByText('Act 1');
  const dropZone = screen.getByTestId('day-0');
  expect(draggable).toBeInTheDocument();
  expect(dropZone).toBeInTheDocument();
  act(() => {
    triggerDrop({
      active: { id: 1 },
      over: { id: 'day-0', data: { current: { day: 0 } } },
    } as DragEndEvent);
  });

  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
  expect(fetchMock.mock.calls[0][0]).toBe('/api/lesson-plans/1');
  expect(body.schedule).toEqual([
    {
      id: 0,
      day: 0,
      activityId: 1,
      activity: { id: 1, title: 'Act 1', milestoneId: 1, completedAt: null },
    },
  ]);
});

test('dragging updates UI after refetch', async () => {
  subjects = [
    {
      id: 1,
      name: 'Math',
      milestones: [
        {
          id: 1,
          title: 'M1',
          subjectId: 1,
          activities: [{ id: 1, title: 'Act 1', milestoneId: 1, completedAt: null }],
        },
      ],
    },
  ];
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  // @ts-expect-error mock fetch
  global.fetch = fetchMock;

  const { rerender } = renderWithRouter(<WeeklyPlannerPage />);
  act(() => {
    triggerDrop({
      active: { id: 1 },
      over: { id: 'day-0', data: { current: { day: 0 } } },
    } as DragEndEvent);
  });

  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  lessonPlanData!.schedule = [
    {
      id: 0,
      day: 0,
      activityId: 1,
      activity: { id: 1, title: 'Act 1', milestoneId: 1, completedAt: null },
    },
  ];
  rerender(<WeeklyPlannerPage />);
  expect(within(screen.getByTestId('day-0')).getByText('Act 1')).toBeInTheDocument();
});
