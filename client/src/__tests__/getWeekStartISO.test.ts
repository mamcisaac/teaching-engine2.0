import { getWeekStartISO } from '../api';

test('normalizes week start to YYYY-MM-DD', () => {
  const date = new Date('2025-06-09T12:05:40Z');
  expect(getWeekStartISO(date)).toBe('2025-06-09');
});
