import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Week view lesson navigation', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('Navigate from week view to lesson detail and back', async ({ page }) => {
    await page.goto('/planner/week');
    await page.waitForSelector(S.week.grid);

    // Find first lesson card (Emily has many)
    const firstCard = page.locator(S.week.anyLessonCard).first();
    await expect(firstCard).toBeVisible();
    
    // Click the lesson link button
    const lessonLink = firstCard.locator('[data-testid="lesson-link"]');
    await lessonLink.click();

    // Should be on lesson detail page
    await page.waitForSelector(S.detail.page);
    expect(page.url()).toContain('/planner/lessons/');

    // Check lesson title is visible
    const title = page.locator(S.detail.title);
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText).toBeTruthy();

    // Navigate back
    await page.goBack();
    await page.waitForSelector(S.week.grid);
    expect(page.url()).toContain('/planner/week');
  });
});