import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Start New Unit → auto-distribute lessons', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('create unit and distribute lessons', async ({ page }) => {
    test.skip(process.env.WRITE_TESTS !== 'true', 'WRITE_TESTS=false');
    test.skip(process.env.E2E_DB_IS_COPY !== 'true', 'E2E_DB_IS_COPY=false');

    await page.goto('/planning-overview');
    await page.click(S.unit.newBtn);
    await page.fill(S.unit.titleInput, 'Unité auto-distribuée (E2E)');
    await page.fill(S.unit.hoursInput, '5'); // assume 5 lessons/hours
    await page.click(S.unit.distributeBtn);
    await expect(page.locator(S.unit.toast)).toBeVisible();

    // Navigate to week & ensure 5 new lessons appear in the grid (light assertion)
    await page.click(S.nav.week);
    await page.waitForSelector(S.week.anyLessonCard);

    // Optionally filter by the new unit title in grid if supported
  });
});