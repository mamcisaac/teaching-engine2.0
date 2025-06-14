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

  await page.goto('/planner');
  await page.waitForSelector('.planner-grid', { timeout: 10000 });

  // Wait for calendar-events API with timeout handling
  await page
    .waitForResponse((r) => r.url().includes('/api/calendar-events') && r.status() === 200, {
      timeout: 5000,
    })
    .catch(() => console.log('Calendar events API timeout, proceeding...'));

  // Wait for timetable and suggestions to load
  await page.waitForTimeout(2000);

  // First try dragging ShortAct (30 mins) to verify the slot works - this should succeed
  const shortCard = page.locator('text=ShortAct').first();
  const target = page.locator('[data-testid="day-0"]');
  await shortCard.dragTo(target);

  // Wait a moment for any success message to appear
  await page.waitForTimeout(1000);

  // Now try dragging LongAct (60 mins) - this should fail with duration error
  const longCard = page.locator('text=LongAct').first();
  await longCard.dragTo(target);
  await expect(page.locator('text=Too long for this slot')).toBeVisible();
});
