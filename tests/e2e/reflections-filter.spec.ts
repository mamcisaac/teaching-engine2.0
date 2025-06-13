import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

test('filters notes by subject and type', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `Math${ts}` },
  });
  await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `Sci${ts}` },
  });

  const subjectsRes = await page.request.get(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subjects = (await subjectsRes.json()) as Array<{ id: number; name: string }>;
  const mathId = subjects.find((s) => s.name === `Math${ts}`)!.id;
  const sciId = subjects.find((s) => s.name === `Sci${ts}`)!.id;

  await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: `M1${ts}`, subjectId: mathId },
  });
  await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: `M2${ts}`, subjectId: sciId },
  });
  const milestones = (await (
    await page.request.get(`${API_BASE}/api/milestones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json()) as Array<{
    id: number;
    title: string;
  }>;
  const mathMilestoneId = milestones.find((m) => m.title === `M1${ts}`)!.id;
  const sciMilestoneId = milestones.find((m) => m.title === `M2${ts}`)!.id;

  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: `A1${ts}`, milestoneId: mathMilestoneId },
  });
  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: `A2${ts}`, milestoneId: sciMilestoneId },
  });
  const activities = (await (
    await page.request.get(`${API_BASE}/api/activities`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json()) as Array<{
    id: number;
    title: string;
  }>;
  const mathActId = activities.find((a) => a.title === `A1${ts}`)!.id;
  const sciActId = activities.find((a) => a.title === `A2${ts}`)!.id;

  await page.request.post(`${API_BASE}/api/notes`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { content: 'Math Public', type: 'public', activityId: mathActId },
  });
  await page.request.post(`${API_BASE}/api/notes`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { content: 'Math Private', type: 'private', activityId: mathActId },
  });
  await page.request.post(`${API_BASE}/api/notes`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { content: 'Sci Public', type: 'public', activityId: sciActId },
  });

  await page.goto('/reflections');
  await page.selectOption('select', `${mathId}`);
  await page.check('label:has-text("Public") input');

  await expect(page.locator('text=Math Public')).toBeVisible();
  await expect(page.locator('text=Math Private')).toHaveCount(0);
  await expect(page.locator('text=Sci Public')).toHaveCount(0);
});
