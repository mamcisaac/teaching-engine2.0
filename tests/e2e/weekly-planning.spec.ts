import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('generate weekly plan from activity', async ({ page }) => {
  const ts = Date.now();
  await login(page);
  await page.goto('/subjects');

  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `Plan${ts}`);
  await page.click('button:has-text("Save")');
  await page.click(`text=Plan${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'Mplan');
  await page.click('button:has-text("Save")');
  await page.waitForSelector('text=Mplan', { timeout: 30000 });
  await page.click('text=Mplan');

  await page.click('text=Add Activity');
  await page.fill('input[placeholder="New activity"]', 'Aplan');
  await page.click('button:has-text("Save")');

  await page.goto('/planner');
  await page.click('text=Auto Fill');
  await expect(page.locator('text=Aplan').first()).toBeVisible();
});
