import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

// dragging long activity into short slot should be rejected

test('rejects drop when activity longer than slot', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  const subjectRes = await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `Dur${ts}` },
  });
  const subjectId = (await subjectRes.json()).id as number;

  // Create milestone with dates that span the current week for planner visibility
  const today = new Date();
  const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
  const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Mdur',
      subjectId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    },
  });
  const milestoneId = (await milestoneRes.json()).id as number;

  await page.goto(`/milestones/${milestoneId}`);

  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'LongAct', milestoneId, durationMins: 60 },
  });
  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'ShortAct', milestoneId, durationMins: 30 },
  });
  // Create a 45-minute time slot for testing duration conflict
  await page.request.put(`${API_BASE}/api/timetable`, {
    headers: { Authorization: `Bearer ${token}` },
    data: [{ day: 0, startMin: 540, endMin: 585, subjectId }], // 45-minute slot
  });

  // Create a lesson plan for this week to enable the planner
  const now = new Date();
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() - now.getDay() + 1); // Set to Monday of current week
  const weekStart = mondayDate.toISOString().split('T')[0];

  await page.request.post(`${API_BASE}/api/lesson-plans`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { weekStart },
  });

  await page.goto('/planner', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load');

  // Wait for the planner to load
  await page.waitForSelector('.planner-grid, [data-testid="planner"]', { timeout: 15000 });

  // Wait for planner suggestions API to load
  await page
    .waitForResponse((r) => r.url().includes('/api/planner/suggestions') && r.status() === 200, {
      timeout: 15000,
    })
    .catch(() => {
      console.log('Planner suggestions API timeout, proceeding...');
    });

  // Give the UI time to render suggestions after API calls
  await page.waitForTimeout(3000);

  // Wait for activities to be visible in the suggestions list
  await expect(page.locator('h4:has-text("ShortAct")')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('h4:has-text("LongAct")')).toBeVisible({ timeout: 5000 });

  // First try dragging ShortAct (30 mins) to verify the slot works - this should succeed
  const shortCard = page.locator('h4:has-text("ShortAct")').locator('..').locator('..');
  const target = page.locator('[data-testid="day-0"]');
  await shortCard.dragTo(target);

  // Wait a moment for any success message to appear
  await page.waitForTimeout(1000);

  // Now try dragging LongAct (60 mins) - this should fail with duration error
  const longCard = page.locator('h4:has-text("LongAct")').locator('..').locator('..');
  await longCard.dragTo(target);

  // Wait for error feedback - either toast message or visual feedback (invalidDay styling)
  await page.waitForTimeout(2000); // Give time for the drag operation to complete

  // Check for duration validation feedback - either visual warning or prevention
  const dayColumn = page.locator('[data-testid="day-0"]');

  // Check if the day shows as invalid (red styling with warning)
  const hasWarning = await dayColumn.locator('[data-testid="slot-warning"]').isVisible();
  const isInvalid = await dayColumn.locator('text=Cannot schedule here').isVisible();

  // Check if the activity was actually scheduled (it shouldn't be)
  const activityScheduled = await dayColumn.locator('text=LongAct').count();

  // The test passes if either:
  // 1. A warning is shown about the invalid scheduling attempt
  // 2. The activity is not scheduled in the day column
  if (hasWarning || isInvalid || activityScheduled === 0) {
    console.log('Duration validation working correctly - test passes');
    // Verify the constraint worked as expected
    expect(activityScheduled).toBe(0);
  } else {
    throw new Error('Duration validation failed - long activity was scheduled in short slot');
  }
});
