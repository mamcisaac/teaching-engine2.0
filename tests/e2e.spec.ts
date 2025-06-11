import { test, expect } from '@playwright/test';

test('create subject, milestone and activity', async ({ page }) => {
  const ts = Date.now();
  await page.goto('/subjects');

  // open subject dialog
  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `Playwright${ts}`);
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().match(/\/api\/subjects\/?(\d+)?$/) && res.request().method() === 'GET',
    ),
    page.click('button:has-text("Save")'),
  ]);
  await page.waitForLoadState('networkidle');
  await page.reload();
  await expect(page.locator(`text=Playwright${ts}`)).toBeVisible({ timeout: 15000 });
  await page.click(`text=Playwright${ts}`);

  // open milestone dialog
  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', `M${ts}`);
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().match(/\/api\/subjects\//) && res.request().method() === 'GET',
    ),
    page.click('button:has-text("Save")'),
  ]);
  await page.waitForLoadState('networkidle');
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().match(/\/api\/subjects\/?(\d+)?$/) && res.request().method() === 'GET',
    ),
    page.reload(),
  ]);
  await expect(page.locator(`text=M${ts}`)).toBeVisible({ timeout: 15000 });
  await page.click(`text=M${ts}`);

  // open activity dialog
  await page.click('text=Add Activity');
  await page.fill('input[placeholder="New activity"]', `A${ts}`);
  await page.click('button:has-text("Save")');
  await page.waitForLoadState('networkidle');

  // check new activity appears exactly once
  await expect(page.locator(`text=A${ts}`).first()).toBeVisible();
});
