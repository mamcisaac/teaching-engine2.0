import { test, expect } from '@playwright/test';
import { login, API_BASE } from './e2e/helpers';

test('create subject, milestone and activity', async ({ page }) => {
  const token = await login(page);
  const subjectRes = await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: 'Playwright' },
  });
  const subjectId = (await subjectRes.json()).id as number;

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'M1', subjectId },
  });
  const milestoneId = (await milestoneRes.json()).id as number;

  const activityRes = await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'A1', milestoneId },
  });
  expect(activityRes.ok()).toBe(true);
  const activity = await activityRes.json();
  expect(activity.title).toBe('A1');
});
