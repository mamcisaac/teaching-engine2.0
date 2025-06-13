import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

test('planner tag filters', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  const subjectRes = await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `F${ts}` },
  });
  const subjectId = (await subjectRes.json()).id as number;

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: `M${ts}`, subjectId },
  });
  const milestoneId = (await milestoneRes.json()).id as number;

  await page.goto(`/milestones/${milestoneId}`);

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
  await page.waitForSelector('.planner-grid', { timeout: 10000 });
  await page.waitForResponse((r) => r.url().includes('/calendar-events') && r.status() === 200);
  await page.uncheck('label:has-text("HandsOn") input');
  await page.uncheck('label:has-text("Video") input');
  await page.check('label:has-text("Worksheet") input');
  await expect(page.locator('text=WorksheetAct').first()).toBeVisible();
  await expect(page.locator('text=VideoAct')).toHaveCount(0);
});
