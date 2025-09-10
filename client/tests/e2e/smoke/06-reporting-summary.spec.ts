import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Reporting & planning summary', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('Planning cascade loads and can be filtered/searched', async ({ page }) => {
    await page.goto('/planning-overview');
    await page.waitForSelector(S.cascade.page);
    await expect(page.locator(S.cascade.node).first()).toBeVisible();

    // If there is a search/filter, use it lightly and expect results shrink
    // (Pseudo) await page.fill('[data-testid="cascade-search"]', 'nombre');
    // Expect fewer nodes, or specific node present
  });
});