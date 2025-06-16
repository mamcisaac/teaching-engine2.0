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

  // Create milestones with dates that span the current week for planner visibility
  const today = new Date();
  const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
  const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

  const mathMilestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: `M1${ts}`,
      subjectId: mathId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });

  if (!mathMilestoneRes.ok()) {
    throw new Error(`Failed to create math milestone: ${await mathMilestoneRes.text()}`);
  }

  const sciMilestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: `M2${ts}`,
      subjectId: sciId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });

  if (!sciMilestoneRes.ok()) {
    throw new Error(`Failed to create science milestone: ${await sciMilestoneRes.text()}`);
  }
  const milestones = (await (
    await page.request.get(`${API_BASE}/api/milestones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json()) as Array<{
    id: number;
    title: string;
  }>;
  const mathMilestone = milestones.find((m) => m.title === `M1${ts}`);
  const sciMilestone = milestones.find((m) => m.title === `M2${ts}`);

  if (!mathMilestone || !sciMilestone) {
    throw new Error(
      `Could not find test milestones. Available: ${milestones.map((m) => m.title).join(', ')}`,
    );
  }

  const mathMilestoneId = mathMilestone.id;
  const sciMilestoneId = sciMilestone.id;

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

  // Wait for the page to load and data to be fetched
  await page.waitForSelector('select', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  // Wait for the select to have options (subjects loaded)
  await page.waitForFunction(
    () => {
      const select = document.querySelector('select');
      return select && select.options.length > 1; // More than just "All Subjects"
    },
    { timeout: 10000 },
  );

  await page.selectOption('select', `${mathId}`);
  await page.check('label:has-text("Public") input');

  await expect(page.locator('text=Math Public').first()).toBeVisible();
  await expect(page.locator('text=Math Private')).toHaveCount(0);
  await expect(page.locator('text=Sci Public')).toHaveCount(0);
});
