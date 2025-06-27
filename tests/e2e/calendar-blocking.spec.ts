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
  // Get the start of the current week (Monday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so we need to go back 6 days
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0); // Set to start of day
  // const mondayISO = monday.toISOString();
  // Create event that ends within the same day to ensure it's within the query range
  const eventStart = new Date(monday);
  eventStart.setHours(9, 0, 0, 0);
  const eventEnd = new Date(monday);
  eventEnd.setHours(10, 0, 0, 0);

  await page.request.post(`${API_BASE}/api/calendar-events`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Assembly',
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      allDay: false,
      eventType: 'ASSEMBLY',
    },
  });

  await page.goto('/planner', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load');

  // Wait for the planner to load - look for specific planner elements
  await page.waitForSelector('h1:has-text("Weekly Planner")', { timeout: 15000 });

  // Set the week to the Monday we created the event for
  const weekStartFormatted = monday.toISOString().split('T')[0];
  await page.fill('input[type="date"][data-testid="week-start-input"]', weekStartFormatted);
  await page.waitForLoadState('networkidle', { timeout: 5000 }); // Give time for content to load

  // Wait for the page to stabilize
  await page.waitForLoadState('networkidle');

  // Wait specifically for calendar events to be displayed
  // Calendar events are shown in yellow boxes on the calendar
  await page.waitForSelector('.bg-yellow-100', { timeout: 15000 });

  // Give extra time for rendering
  await page.waitForLoadState('domcontentloaded', { timeout: 3000 });

  // The calendar event should be visible
  const assemblyEvent = page.locator('.bg-yellow-100:has-text("Assembly")').first();
  await expect(assemblyEvent).toBeVisible();
});
