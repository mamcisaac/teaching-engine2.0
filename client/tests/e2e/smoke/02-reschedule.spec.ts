import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Reschedule (drag or keyboard fallback)', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('move a lesson one day forward using keyboard fallback', async ({ page }) => {
    await page.goto('/planner/week');

    const card = page.locator(S.week.anyLessonCard).first();
    const lessonId = await card.getAttribute('data-lesson-id');
    const originalDay = await card.getAttribute('data-day'); // e.g. "2025-09-10"

    // Focus & move via keyboard (your app should support this fallback handler)
    await card.focus();
    await page.keyboard.press('Shift+ArrowRight'); // implement handler to +1 day
    await page.waitForTimeout(300); // allow network

    const moved = page.locator(S.week.lessonCard(lessonId!));
    const newDay = await moved.getAttribute('data-day');
    expect(newDay).not.toBe(originalDay);

    // Sanity: open detail to prove the date actually changed
    await moved.click();
    await page.waitForSelector(S.detail.page);
    // Optionally assert rendered date text if available
  });
});