import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

// drag first activity to last and ensure order persists

test('reorders activities within milestone', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  await page.goto('/subjects');

  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `Sub${ts}`);
  await page.click('button:has-text("Save")');
  await page.click(`text=Sub${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'M');
  await page.click('button:has-text("Save")');
  const mRes = await page.request.get(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const ms = (await mRes.json()) as Array<{ id: number; title: string }>;
  const mId = ms.find((m) => m.title === 'M')!.id;
  await page.goto(`/milestones/${mId}`);
  await page.waitForSelector('button:has-text("Add Activity")');

  for (const a of ['A1', 'A2', 'A3']) {
    await page.click('button:has-text("Add Activity")');
    await page.fill('input[placeholder="New activity"]', a);
    await page.click('button:has-text("Save")');
    await page.waitForSelector('button:has-text("Add Activity")');
  }

  const items = page.locator('li');
  await items.nth(0).dragTo(items.nth(2));
  await page.reload();
  await page.waitForSelector('button:has-text("Add Activity")');
  const texts = await page.locator('li span.flex-1').allTextContents();
  expect(texts.slice(0, 3)).toEqual(['A2', 'A3', 'A1']);
});
