import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

test('planner tag filters', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  await page.goto('/subjects');
  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `F${ts}`);
  await page.click('button:has-text("Save")');
  await page.click(`text=F${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', `M${ts}`);
  await page.click('button:has-text("Save")');
  const mRes = await page.request.get(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const ms = (await mRes.json()) as Array<{ id: number; title: string }>;
  const mId = ms.find((milestone) => milestone.title === `M${ts}`)!.id;
  await page.goto(`/milestones/${mId}`);

  const milestoneId = mId;

  // create activities via API with tags
  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'WorksheetAct', milestoneId, tags: ['Worksheet'] },
  });
  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'VideoAct', milestoneId, tags: ['Video'] },
  });

  await page.goto('/planner');
  await page.uncheck('label:has-text("HandsOn") input');
  await page.uncheck('label:has-text("Video") input');
  await page.check('label:has-text("Worksheet") input');
  await expect(page.locator('text=WorksheetAct').first()).toBeVisible();
  await expect(page.locator('text=VideoAct')).toHaveCount(0);
});
