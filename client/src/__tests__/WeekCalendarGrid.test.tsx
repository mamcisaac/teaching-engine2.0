import { fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import WeekCalendarGrid from '../components/WeekCalendarGrid';
import { renderWithRouter } from '../test-utils';

it('calls onDrop when activity dropped', () => {
  const handle = vi.fn();
  const activities = { 1: { id: 1, title: 'A1', milestoneId: 1, completedAt: null } };
  const { getAllByText } = renderWithRouter(
    <WeekCalendarGrid schedule={[]} onDrop={handle} activities={activities} />,
  );
  const zone = getAllByText(/Mon/)[0].parentElement as HTMLElement;
  fireEvent.dragOver(zone);
  fireEvent.drop(zone, { dataTransfer: { getData: () => '1' } });
  expect(handle).toHaveBeenCalledWith(0, 1);
});
