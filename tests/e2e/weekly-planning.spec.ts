import { test, expect } from '@playwright/test';

test('generate weekly plan from activity', async ({ page }) => {
  const ts = Date.now();
  await page.goto('/subjects');

  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `Plan${ts}`);
  await page.click('button:has-text("Save")');
  await page.waitForLoadState('networkidle');
  await expect(page.locator(`text=Plan${ts}`)).toBeVisible();
  await page.click(`text=Plan${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'Mplan');
  await page.click('button:has-text("Save")');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=Mplan')).toBeVisible();
  await page.click('text=Mplan');

  await page.click('text=Add Activity');
  await page.fill('input[placeholder="New activity"]', 'Aplan');
  await page.click('button:has-text("Save")');
  await page.waitForLoadState('networkidle');

  await page.goto('/planner');
  await page.click('text=Auto Fill');
  await expect(page.locator('text=Aplan').first()).toBeVisible();
});
