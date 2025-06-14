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

  const milestoneRes = await page.request.post(`${API_BASE}/api/milestones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: `M${ts}`, subjectId },
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

  await page.goto('/planner');
  await page.waitForSelector('.planner-grid', { timeout: 10000 });
  await page
    .waitForResponse((r) => r.url().includes('/api/calendar-events') && r.status() === 200, {
      timeout: 5000,
    })
    .catch(() => console.log('Calendar events API timeout, proceeding...'));
  await page.uncheck('label:has-text("HandsOn") input');
  await page.uncheck('label:has-text("Video") input');
  await page.uncheck('label:has-text("Worksheet") input');
  await page.check('label:has-text("Worksheet") input');

  // Wait for the suggestions API to be called with the new filters
  await page.waitForResponse(
    (response) =>
      response.url().includes('/api/planner/suggestions') &&
      response.url().includes('filters=') &&
      response.status() === 200,
    { timeout: 5000 },
  );

  // Check that filters are in the correct state
  await expect(page.locator('label:has-text("Worksheet") input')).toBeChecked();
  await expect(page.locator('label:has-text("Video") input')).not.toBeChecked();

  // Check that WorksheetAct is visible in Activity Suggestions
  await expect(page.locator('text=WorksheetAct').first()).toBeVisible();

  // Check that VideoAct is not visible in Activity Suggestions section
  const activitySuggestionsSection = page
    .locator('h3:has-text("Activity Suggestions")')
    .locator('..');
  await expect(activitySuggestionsSection.locator('text="VideoAct"')).toHaveCount(0);
});
