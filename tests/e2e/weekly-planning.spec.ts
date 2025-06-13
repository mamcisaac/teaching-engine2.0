import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('generate weekly plan from activity', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  await page.goto('/subjects');

  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `Plan${ts}`);
  await page.click('button:has-text("Save")');
  await page.click(`text=Plan${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'Mplan');
  await page.click('button:has-text("Save")');
  const mRes = await page.request.get('/api/milestones', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const mId = (await mRes.json()).find((m: { title: string }) => m.title === 'Mplan').id;
  await page.goto(`/milestones/${mId}`);

  await page.click('text=Add Activity');
  await page.fill('input[placeholder="New activity"]', 'Aplan');
  await page.click('button:has-text("Save")');

  await page.goto('/planner');
  await page.click('text=Auto Fill');
  await expect(page.locator('text=Aplan').first()).toBeVisible();
});
