import { test, expect } from '@playwright/test';

test('planner blocks times from calendar events', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('onboarded', 'true'));
  await page.goto('/calendar');
  await page.click('text=Add Event');
  await page.fill('input[placeholder="Title"]', 'Assembly');
  const today = new Date().toISOString().split('T')[0];
  await page.fill('input[type="date"]', today);
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Assembly').first()).toBeVisible();

  await page.goto('/planner');
  const blocked = page.locator('text=Assembly').first();
  await expect(blocked).toBeVisible();
});
