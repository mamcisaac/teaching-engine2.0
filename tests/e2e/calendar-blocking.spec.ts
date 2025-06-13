import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

/**
 * Test that verifies the planner correctly blocks times based on calendar events.
 * Previously skipped due to incomplete calendar blocking feature.
 * Now enabled as the feature is fully implemented and stable.
 */
test('planner blocks times from calendar events', async ({ page }) => {
  const token = await login(page);
  const today = new Date().toISOString().split('T')[0];
  await page.request.post(`${API_BASE}/api/calendar-events`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Assembly',
      start: `${today}T00:00:00.000Z`,
      end: `${today}T23:59:59.000Z`,
      allDay: true,
      eventType: 'ASSEMBLY',
    },
  });
  await page.goto('/planner');
  await page.waitForSelector('.planner-grid', { timeout: 10000 });
  await page.waitForResponse((r) => r.url().includes('/calendar-events') && r.status() === 200);
  const blocked = page.locator('text=Assembly').first();
  await expect(blocked).toBeVisible();
});
