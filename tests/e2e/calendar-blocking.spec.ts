import { test, expect } from '@playwright/test';

test.skip('planner blocks times from calendar events', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('onboarded', 'true'));
  const today = new Date().toISOString().split('T')[0];
  await page.request.post('/api/calendar-events', {
    data: {
      title: 'Assembly',
      start: `${today}T00:00:00.000Z`,
      end: `${today}T23:59:59.000Z`,
      allDay: true,
      eventType: 'ASSEMBLY',
    },
  });

  await page.goto('/planner');
  const blocked = page.locator('text=Assembly').first();
  await expect(blocked).toBeVisible();
});
