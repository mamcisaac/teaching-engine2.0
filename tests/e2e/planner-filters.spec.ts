import { test, expect } from '@playwright/test';
import { login, API_BASE } from './helpers';

test('planner tag filters', async ({ page }) => {
  const ts = Date.now();
  const token = await login(page);
  const subjectRes = await page.request.post(`${API_BASE}/api/subjects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `F${ts}` },
  });
  const subjectId = (await subjectRes.json()).id as number;

  // Create milestone with dates that span the current week
  const today = new Date();
  const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
  const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: `M${ts}`,
      subjectId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    },
  });
  const milestoneId = (await milestoneRes.json()).id as number;

  await page.goto(`/milestones/${milestoneId}`);

  // create activities via API with tags
  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'WorksheetAct', milestoneId, tags: ['Worksheet'] },
  });
  await page.request.post(`${API_BASE}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'VideoAct', milestoneId, tags: ['Video'] },
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

  // Give the UI time to render suggestions and filters after API calls
  await page.waitForTimeout(3000);

  // Try to find and interact with filter checkboxes with more flexible selectors
  try {
    await page.uncheck('label:has-text("HandsOn") input', { timeout: 2000 });
  } catch {
    console.log('HandsOn filter not found, skipping...');
  }

  try {
    await page.uncheck('label:has-text("Video") input', { timeout: 2000 });
  } catch {
    console.log('Video filter not found, skipping...');
  }

  try {
    await page.uncheck('label:has-text("Worksheet") input', { timeout: 2000 });
  } catch {
    console.log('Worksheet filter not found, skipping...');
  }

  try {
    await page.check('label:has-text("Worksheet") input', { timeout: 2000 });
  } catch {
    console.log('Worksheet filter not found for checking, skipping...');
  }

  // Wait for the suggestions API to be called with the new filters
  await page
    .waitForResponse(
      (response) =>
        response.url().includes('/api/planner/suggestions') && response.status() === 200,
      { timeout: 15000 },
    )
    .catch(() => {
      console.log('Planner suggestions API timeout, test may still pass if filters work...');
    });

  // Give time for UI to update after filter changes
  await page.waitForTimeout(2000);

  // Check that filters are in the correct state
  await expect(page.locator('label:has-text("Worksheet") input')).toBeChecked();
  await expect(page.locator('label:has-text("Video") input')).not.toBeChecked();

  // Wait for activities to be visible in the suggestions list using updated selectors
  await expect(page.locator('h4:has-text("WorksheetAct")').first()).toBeVisible({ timeout: 15000 });

  // Check that VideoAct is not visible in Activity Suggestions using updated selector
  await expect(page.locator('h4:has-text("VideoAct")')).toHaveCount(0);
});
