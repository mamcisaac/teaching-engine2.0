import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Curriculum expectations & coverage', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('Grade 1 FI expectations show with coverage badges', async ({ page }) => {
    await page.goto('/curriculum');
    await page.waitForSelector(S.curriculum.page);

    // Select Grade 1
    const gradeSelect = page.locator(S.curriculum.filterGrade);
    if (await gradeSelect.isVisible()) {
      await gradeSelect.selectOption({ value: '1' });
    }

    // Select French subject
    const subjectSelect = page.locator(S.curriculum.filterSubject);
    if (await subjectSelect.isVisible()) {
      await subjectSelect.selectOption({ value: 'Français (Immersion)' });
    }

    // Wait for expectations to load
    await page.waitForSelector(S.curriculum.listRows, { timeout: 10000 });
    const count = await page.locator(S.curriculum.listRows).count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(68); // Total Grade 1 expectations

    // Toggle coverage display
    const coverageToggle = page.locator(S.curriculum.coveredToggle);
    if (await coverageToggle.isVisible()) {
      await coverageToggle.click();
      
      // Wait a moment for badges to appear
      await page.waitForTimeout(500);
      
      // Check for coverage badges
      const badges = await page.locator(S.curriculum.coverageBadge).count();
      expect(badges).toBeGreaterThan(0);
    }
  });
});