import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Lesson detail (Week → Detail)', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('clicking a week card opens a fully-populated French detail view', async ({ page }) => {
    await page.goto('/planner/week');

    // Ensure we have cards
    await page.waitForSelector(S.week.anyLessonCard);

    // Click the first visible lesson card
    const first = page.locator(S.week.anyLessonCard).first();
    const lessonId = await first.getAttribute('data-lesson-id');
    await first.click();

    // Detail page must render
    await page.waitForSelector(S.detail.page);
    await expect(page.locator(S.detail.title)).toBeVisible();

    // Core French fields present (minds on / action / consolidation)
    await expect(page.locator(S.detail.part('mindsOn'))).toBeVisible();
    await expect(page.locator(S.detail.part('action'))).toBeVisible();
    await expect(page.locator(S.detail.part('consolidation'))).toBeVisible();

    // Differentiation list from JSON
    await expect(page.locator(S.detail.diffList)).toBeVisible();

    // Assessment button present and wired to this lesson
    const href = await page.locator(S.detail.assessBtn).getAttribute('href');
    expect(href).toContain(`lessonId=${lessonId}`);
  });
});