import { test, expect } from '@playwright/test';

test('planner tag filters', async ({ page }) => {
  const ts = Date.now();
  await page.goto('/subjects');
  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `F${ts}`);
  await page.click('button:has-text("Save")');
  await page.click(`text=F${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'M');
  await page.click('button:has-text("Save")');
  await page.click('text=M');

  // create activities via API with tags
  await page.request.post('/api/activities', {
    data: { title: 'WorksheetAct', milestoneId: 1, tags: ['Worksheet'] },
  });
  await page.request.post('/api/activities', {
    data: { title: 'VideoAct', milestoneId: 1, tags: ['Video'] },
  });

  await page.goto('/planner');
  await page.uncheck('label:has-text("HandsOn") input');
  await page.check('label:has-text("Worksheet") input');
  await expect(page.locator('text=WorksheetAct')).toBeVisible();
  await expect(page.locator('text=VideoAct')).toHaveCount(0);
});
