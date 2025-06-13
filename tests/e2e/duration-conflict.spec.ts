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
  await page.request.put(`${API_BASE}/api/timetable`, {
    headers: { Authorization: `Bearer ${token}` },
    data: [{ day: 0, startMin: 540, endMin: 585, subjectId: 1 }],
  });

  const weekStart = new Date().toISOString().split('T')[0];
  await page.route('**/api/lesson-plans/*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, weekStart, schedule: [] }),
      });
    } else {
      await route.fallback();
    }
  });
  await page.route('**/api/timetable', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          day: 0,
          startMin: 540,
          endMin: 585,
          subjectId: 1,
          subject: { id: 1, name: 'Math', milestones: [] },
        },
      ]),
    });
  });

  await page.goto('/planner');
  const card = page.locator('text=LongAct').first();
  const target = page.locator('[data-testid="day-0"]');
  await card.dragTo(target);
  await expect(page.locator('text=Too long for this slot')).toBeVisible();
});
