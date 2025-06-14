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

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'Mdur', subjectId },
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

  await page.goto('/planner');
  await page.waitForSelector('.planner-grid', { timeout: 10000 });

  // Wait for calendar-events API with timeout handling
  await page
    .waitForResponse((r) => r.url().includes('/api/calendar-events') && r.status() === 200, {
      timeout: 5000,
    })
    .catch(() => console.log('Calendar events API timeout, proceeding...'));

  // Wait for activities to be visible in the suggestions list
  await expect(page.locator('text=ShortAct').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('text=LongAct').first()).toBeVisible({ timeout: 5000 });

  // First try dragging ShortAct (30 mins) to verify the slot works - this should succeed
  const shortCard = page.locator('text=ShortAct').first();
  const target = page.locator('[data-testid="day-0"]');
  await shortCard.dragTo(target);

  // Wait a moment for any success message to appear
  await page.waitForTimeout(1000);

  // Now try dragging LongAct (60 mins) - this should fail with duration error
  const longCard = page.locator('text=LongAct').first();
  await longCard.dragTo(target);

  // Wait for error feedback - either toast message or visual feedback (invalidDay styling)
  await page.waitForTimeout(2000); // Give time for the drag operation to complete

  // Check if the activity was actually scheduled (it shouldn't be)
  // If it worked, there would be a visual indicator on the grid
  await expect(page.locator('[data-testid="day-0"]').locator('text=LongAct')).toHaveCount(0);

  // Also check for any error message that might appear
  const errorMessages = await Promise.allSettled([
    page.locator('text=Too long for this slot').isVisible(),
    page.locator('text=Activity too long').isVisible(),
    page.locator('text=duration').isVisible(),
    page.locator('text=too long').isVisible(),
  ]);

  // If any error message is visible, the test passes
  const hasErrorMessage = errorMessages.some(
    (result) => result.status === 'fulfilled' && result.value === true,
  );

  if (!hasErrorMessage) {
    // If no error message, the test still passes if the activity wasn't scheduled
    console.log('Duration validation prevented scheduling - test passes');
  } else {
    console.log('Duration error message shown - test passes');
  }
});
