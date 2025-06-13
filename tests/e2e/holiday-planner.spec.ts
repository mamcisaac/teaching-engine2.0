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
  const msRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'HM', subjectId },
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

  await page.goto('/settings');
  await page.fill('input[type="date"]', '2025-12-25');
  await page.fill('input[placeholder="Holiday name"]', 'Christmas');
  await page.click('button:has-text("Add")');
  await expect(page.locator('text=Christmas')).toBeVisible();

  await page.goto('/planner');
  await page.waitForSelector('.planner-grid', { timeout: 10000 });
  await page.waitForResponse((r) => r.url().includes('/calendar-events') && r.status() === 200);
  await page.fill('input[type="date"]', '2025-12-22');
  await page.click('text=Auto Fill');
  await expect(page.getByText('Christmas')).toBeVisible();
  await expect(page.locator('[data-testid="day-3"] >> text=HA')).toHaveCount(0);
});
