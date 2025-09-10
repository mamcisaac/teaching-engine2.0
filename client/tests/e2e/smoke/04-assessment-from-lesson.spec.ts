import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Assessment from lesson detail', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('open Assess from lesson, enter a mark, save, and persist after reload', async ({ page }) => {
    test.skip(process.env.WRITE_TESTS !== 'true', 'WRITE_TESTS=false');
    test.skip(process.env.E2E_DB_IS_COPY !== 'true', 'E2E_DB_IS_COPY=false');

    await page.goto('/planner/week');
    await page.waitForSelector(S.week.anyLessonCard);
    await page.locator(S.week.anyLessonCard).first().click();           // → detail
    await page.waitForSelector(S.detail.page);

    await page.click(S.detail.assessBtn);                               // → assess
    await page.waitForSelector(S.assess.page);
    await expect(page.locator(S.assess.header)).toContainText(/leçon|lesson/i);

    // enter a mark for first student
    const cell = page.locator(S.assess.firstStudentCell);
    await cell.click();
    await page.keyboard.type('B'); // whatever your rubric/grade schema expects

    await page.click(S.assess.saveBtn);
    await expect(page.locator(S.assess.toast)).toBeVisible();

    // reload and verify persistence
    await page.reload();
    await page.waitForSelector(S.assess.page);
    await expect(page.locator(S.assess.firstStudentCell)).toContainText(/B/);
  });
});