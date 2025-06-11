import { test, expect } from '@playwright/test';

// dragging long activity into short slot should be rejected

test('rejects drop when activity longer than slot', async ({ page }) => {
  const ts = Date.now();
  await page.goto('/subjects');
  await page.click('text=Add Subject');
  await page.fill('input[placeholder="New subject"]', `Dur${ts}`);
  await page.click('button:has-text("Save")');
  await page.click(`text=Dur${ts}`);

  await page.click('text=Add Milestone');
  await page.fill('input[placeholder="New milestone"]', 'Mdur');
  await page.click('button:has-text("Save")');
  await page.click('text=Mdur');

  const mRes = await page.request.get('/api/milestones');
  const milestoneList = (await mRes.json()) as Array<{ id: number; title: string }>;
  const milestoneId = milestoneList.find((m) => m.title === 'Mdur')!.id;
  await page.request.post('/api/activities', {
    data: { title: 'LongAct', milestoneId, durationMins: 60 },
  });
  await page.request.put('/api/timetable', {
    data: [{ day: 0, startMin: 540, endMin: 585, subjectId: 1 }],
  });

  await page.goto('/planner');
  const card = page.locator('text=LongAct').first();
  const target = page.locator('[data-testid="day-0"]');
  await card.dragTo(target);
  await expect(page.locator('text=Too long for this slot')).toBeVisible();
});
