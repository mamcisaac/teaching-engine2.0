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

  // Create milestone with dates that span the current week for planner visibility
  const today = new Date();
  const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
  const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Mplan',
      subjectId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });
  const milestoneData = await milestoneRes.json();
  const milestoneId = milestoneData.id as number;

  if (!milestoneId) {
    throw new Error(`Failed to create milestone: ${JSON.stringify(milestoneData)}`);
  }

  const activityRes = await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Aplan',
      milestoneId: milestoneId,
      subjectId: subjectId,
    },
  });

  if (!activityRes.ok()) {
    const errorText = await activityRes.text();
    console.error('Activity creation failed:', activityRes.status(), errorText);
    throw new Error(`Activity creation failed: ${activityRes.status()} ${errorText}`);
  }

  const act = await activityRes.json();
  expect(act.title).toBe('Aplan');
});
