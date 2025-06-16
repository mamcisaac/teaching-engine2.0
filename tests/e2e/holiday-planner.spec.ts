import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

// Ensure planner skips holidays when auto-filling

test('planner skips holiday dates', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  const subRes = await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `H${ts}` },
  });
  const subjectId = (await subRes.json()).id as number;
  // Create milestone with dates that span the current week for planner visibility
  const today = new Date();
  const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
  const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

  const msRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'HM',
      subjectId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });
  const milestoneId = (await msRes.json()).id as number;
  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'HA', milestoneId },
  });
  await page.request.put(`${API_BASE}/api/timetable`, {
    headers: { Authorization: `Bearer ${token}` },
    data: [{ day: 3, startMin: 540, endMin: 600, subjectId }],
  });

  // Create holiday via API instead of UI for reliability
  const holidayDate = new Date('2025-12-25');
  await page.request.post(`${API_BASE}/api/calendar-events`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Christmas',
      start: holidayDate.toISOString(),
      end: holidayDate.toISOString(),
      allDay: true,
      eventType: 'HOLIDAY',
      source: 'MANUAL',
    },
  });

  await page.goto('/planner', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load');

  // Wait for the planner to load
  await page.waitForSelector('h1:has-text("Weekly Planner")', { timeout: 15000 });
  await page.waitForTimeout(2000); // Give time for content to load

  // Log all network requests to debug
  page.on('response', (response) => {
    if (response.url().includes('calendar-events') || response.url().includes('holidays')) {
      console.log(`API Response: ${response.status()} ${response.url()}`);
    }
  });

  // Wait for planner APIs to load
  await page
    .waitForResponse((r) => r.url().includes('/api/calendar-events') && r.status() === 200, {
      timeout: 10000,
    })
    .catch(() => {
      console.log('Calendar events API timeout, proceeding...');
    });

  // Give the UI time to render after API calls
  await page.waitForTimeout(2000);
  await page.fill('input[type="date"]', '2025-12-22');
  await page.click('text=Auto Fill');

  // Check that the planner shows the Christmas week (Dec 21 - Dec 25, 2025)
  await expect(page.locator('text=Dec 21 - Dec 25, 2025')).toBeVisible();

  // Verify that activities are not scheduled due to holiday blocking
  // The main goal is to ensure no activities were auto-filled during Christmas week
  const dayColumn = page.locator('[data-testid="day-3"]');
  await expect(dayColumn.locator('text=HA')).toHaveCount(0);

  // Check that the calendar shows "No time slots" for most days (indicating holiday blocking worked)
  await expect(page.locator('text=No time slots').first()).toBeVisible();
});
