import { test, expect } from '@playwright/test';

test('create subject, milestone and activity', async ({ page }) => {
  await page.goto('/subjects');

  // open subject dialog
  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', 'Playwright');
  await page.click('button:has-text("Save")');

  // navigate to the newly created subject
  await page.click('text=Playwright');

  // open milestone dialog
  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'M1');
  await page.click('button:has-text("Save")');

  // navigate to the milestone detail page
  await page.click('text=M1');

  // open activity dialog
  await page.click('text=Add Activity');
  await page.fill('input[placeholder="New activity"]', 'A1');
  await page.click('button:has-text("Save")');

  // check new activity appears exactly once
  await expect(page.locator('text="A1"')).toBeVisible();
});
