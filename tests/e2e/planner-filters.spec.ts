import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('planner tag filters', async ({ page }) => {
  const ts = Date.now();
  await login(page);
  await page.goto('/subjects');
  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `F${ts}`);
  await page.click('button:has-text("Save")');
  await page.click(`text=F${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', `M${ts}`);
  await page.click('button:has-text("Save")');
  await page.click(`text=M${ts}`);

  const mRes = await page.request.get('/api/milestones');
  const milestoneList = (await mRes.json()) as Array<{ id: number; title: string }>;
  const m = milestoneList.find((milestone) => milestone.title === `M${ts}`);
  const milestoneId = m?.id ?? 1;

  // create activities via API with tags
  await page.request.post('/api/activities', {
    data: { title: 'WorksheetAct', milestoneId, tags: ['Worksheet'] },
  });
  await page.request.post('/api/activities', {
    data: { title: 'VideoAct', milestoneId, tags: ['Video'] },
  });

  await page.goto('/planner');
  await page.uncheck('label:has-text("HandsOn") input');
  await page.uncheck('label:has-text("Video") input');
  await page.check('label:has-text("Worksheet") input');
  await expect(page.locator('text=WorksheetAct').first()).toBeVisible();
  await expect(page.locator('text=VideoAct')).toHaveCount(0);
});
