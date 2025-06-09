import { renderWithRouter } from '../test-utils';
import WeekCalendarGrid from '../components/WeekCalendarGrid';

test('renders droppable zones for five days', () => {
  const { getByTestId } = renderWithRouter(
    <WeekCalendarGrid schedule={[]} activities={{}} timetable={[]} />,
  );
  expect(getByTestId('day-0')).toBeInTheDocument();
  expect(getByTestId('day-4')).toBeInTheDocument();
});
