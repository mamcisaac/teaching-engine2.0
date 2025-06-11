import { test, expect } from '@playwright/test';

test('generate weekly plan from activity', async ({ page }) => {
  const ts = Date.now();
  await page.goto('/subjects');

  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `Plan${ts}`);
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().match(/\/api\/subjects\/?(\d+)?$/) && res.request().method() === 'GET',
    ),
    page.click('button:has-text("Save")'),
  ]);
  await page.waitForLoadState('networkidle');
  await page.reload();
  await expect(page.locator(`text=Plan${ts}`)).toBeVisible({ timeout: 15000 });
  await page.click(`text=Plan${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'Mplan');
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().match(/\/api\/subjects\//) && res.request().method() === 'GET',
    ),
    page.click('button:has-text("Save")'),
  ]);
  await page.waitForLoadState('networkidle');
  await page.reload();
  await expect(page.locator('text=Mplan')).toBeVisible({ timeout: 15000 });
  await page.click('text=Mplan');

  await page.click('text=Add Activity');
  await page.fill('input[placeholder="New activity"]', 'Aplan');
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().match(/\/api\/milestones\//) && res.request().method() === 'GET',
    ),
    page.click('button:has-text("Save")'),
  ]);
  await page.waitForLoadState('networkidle');
  await page.reload();

  await page.goto('/planner');
  await page.click('text=Auto Fill');
  await expect(page.locator('text=Aplan').first()).toBeVisible();
});
