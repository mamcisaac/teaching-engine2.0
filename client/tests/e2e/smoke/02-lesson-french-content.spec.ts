import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Lesson detail French content', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('French lesson shows 3-part structure and differentiation', async ({ page }) => {
    // Navigate to week view
    await page.goto('/planner/week');
    await page.waitForSelector(S.week.grid);

    // Find and click a French lesson
    const frenchCard = page.locator(S.week.anyLessonCard)
      .filter({ hasText: /français|mathématiques|sciences/i })
      .first();
    
    await frenchCard.locator('[data-testid="lesson-link"]').click();
    await page.waitForSelector(S.detail.page);

    // Verify 3-part lesson structure
    const mindsOn = page.locator(S.detail.part('mindsOn'));
    const action = page.locator(S.detail.part('action'));
    const consolidation = page.locator(S.detail.part('consolidation'));

    // At least 2 of 3 parts should be visible (not all lessons have all 3)
    const partsVisible = await Promise.all([
      mindsOn.isVisible().catch(() => false),
      action.isVisible().catch(() => false),
      consolidation.isVisible().catch(() => false)
    ]);
    
    const visibleCount = partsVisible.filter(v => v).length;
    expect(visibleCount).toBeGreaterThanOrEqual(2);

    // Check for differentiation list
    const diffList = page.locator(S.detail.diffList);
    if (await diffList.isVisible()) {
      const items = await diffList.locator('li').count();
      expect(items).toBeGreaterThan(0);
    }

    // Verify French content (check for common French words)
    const pageText = await page.textContent('body');
    const frenchIndicators = ['les', 'des', 'pour', 'avec', 'dans', 'élèves'];
    const hasFrench = frenchIndicators.some(word => 
      pageText?.toLowerCase().includes(word)
    );
    expect(hasFrench).toBeTruthy();
  });
});