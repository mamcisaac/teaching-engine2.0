import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

// drag first activity to last and ensure order persists

test('reorders activities within milestone', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  const subjectRes = await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `Sub${ts}` },
  });
  const subjectId = (await subjectRes.json()).id as number;

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'M', subjectId },
  });
  const mId = (await milestoneRes.json()).id as number;

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
