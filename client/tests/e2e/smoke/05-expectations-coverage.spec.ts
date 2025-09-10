import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Curriculum expectations & coverage', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('Grade 1 FI expectations show with coverage badges', async ({ page }) => {
    await page.goto('/curriculum');
    await page.waitForSelector(S.curriculum.page);

    await page.selectOption(S.curriculum.filterGrade, { label: /1|Grade 1/i });
    await page.selectOption(S.curriculum.filterSubject, { label: /French|Français|Immersion/i });

    await page.waitForSelector(S.curriculum.listRows);
    const count = await page.locator(S.curriculum.listRows).count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(68);

    // Show coverage
    await page.click(S.curriculum.coveredToggle);
    // Expect at least some coverage badges
    const badges = await page.locator(S.curriculum.coverageBadge).count();
    expect(badges).toBeGreaterThan(0);
  });
});