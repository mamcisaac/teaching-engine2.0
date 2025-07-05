import { getWeekStartISO } from '../api/domains/planning';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
test('normalizes week start to YYYY-MM-DD', () => {
  const date = new Date('2025-06-09T12:05:40Z');
  expect(getWeekStartISO(date)).toBe('2025-06-09');
});
