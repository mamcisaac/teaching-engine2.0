import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

/**
 * Test that verifies the planner correctly blocks times based on calendar events.
 * Previously skipped due to incomplete calendar blocking feature.
 * Now enabled as the feature is fully implemented and stable.
 */
test('planner blocks times from calendar events', async ({ page }) => {
  const token = await login(page);
  // Use a Monday (weekday) for the event since planner only shows Mon-Fri
  const currentWeek = new Date();
  const monday = new Date(currentWeek.getTime() - (currentWeek.getDay() - 1) * 86400000);
  const mondayISO = monday.toISOString().split('T')[0];
  await page.request.post(`${API_BASE}/api/calendar-events`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Assembly',
      start: `${mondayISO}T00:00:00.000Z`,
      end: `${mondayISO}T23:59:59.000Z`,
      allDay: true,
      eventType: 'ASSEMBLY',
    },
  });
  await page.goto('/planner', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load');

  // Wait for the planner to load
  await page.waitForSelector('.planner-grid, [data-testid="planner"]', { timeout: 15000 });

  // Wait for planner APIs to load
  await page
    .waitForResponse((r) => r.url().includes('/api/calendar-events') && r.status() === 200, {
      timeout: 15000,
    })
    .catch(() => {
      console.log('Calendar events API timeout, proceeding...');
    });

  // Wait for planner suggestions API if needed
  await page
    .waitForResponse((r) => r.url().includes('/api/planner/suggestions') && r.status() === 200, {
      timeout: 10000,
    })
    .catch(() => {
      console.log('Planner suggestions API timeout, proceeding...');
    });

  // Give the UI time to render after API calls
  await page.waitForTimeout(2000);
  const blocked = page.locator('text=Assembly').first();
  await expect(blocked).toBeVisible();
});
