import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

test('generate weekly plan from activity', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  const subjectRes = await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `Plan${ts}` },
  });
  const subjectId = (await subjectRes.json()).id as number;

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'Mplan', subjectId },
  });
  const milestoneId = (await milestoneRes.json()).id as number;

  const activityRes = await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'Aplan', milestoneId },
  });
  expect(activityRes.ok()).toBe(true);
  const act = await activityRes.json();
  expect(act.title).toBe('Aplan');
});
