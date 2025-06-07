import { test, expect } from '@playwright/test';

test('create subject, milestone and activity', async ({ page }) => {
  await page.goto('/subjects');
  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', 'Playwright');
  await page.click('button:has-text("Save")');
  await page.click('text=Playwright');
  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'M1');
  await page.click('button:has-text("Save")');
  await page.click('text=M1');
  await page.click('text=Add Activity');
  await page.fill('input[placeholder="New activity"]', 'A1');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=A1')).toBeVisible();
});
