import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Assessment recording', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test.skip('Record assessment for lesson (write test)', async ({ page }) => {
    // Skip if not in write mode
    if (!process.env.WRITE_TESTS || !process.env.E2E_DB_IS_COPY) {
      test.skip();
      return;
    }

    // Navigate to a lesson
    await page.goto('/planner/week');
    await page.waitForSelector(S.week.grid);
    
    const firstCard = page.locator(S.week.anyLessonCard).first();
    await firstCard.locator('[data-testid="lesson-link"]').click();
    await page.waitForSelector(S.detail.page);

    // Click assess button
    const assessBtn = page.locator(S.detail.assessBtn);
    await assessBtn.click();

    // Should navigate to assessment page
    await page.waitForSelector(S.assess.page);
    expect(page.url()).toContain('/assess');

    // Check assessment header
    const header = page.locator(S.assess.header);
    await expect(header).toBeVisible();

    // Find assessment grid
    const grid = page.locator(S.assess.grid);
    await expect(grid).toBeVisible();

    // Mark first student
    const firstCell = page.locator(S.assess.firstStudentCell);
    if (await firstCell.isVisible()) {
      await firstCell.click();
      await firstCell.selectOption('4'); // Meeting expectations
    }

    // Save assessment
    const saveBtn = page.locator(S.assess.saveBtn);
    await saveBtn.click();

    // Check for success toast
    const toast = page.locator(S.assess.toast);
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});