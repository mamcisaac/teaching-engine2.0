import { test, expect } from '@playwright/test';
import { login, TestDataFactory } from './improved-helpers';

test.describe('Quick Smoke Tests', () => {
  test('auth flow works', async ({ page }) => {
    const token = await login(page);
    expect(token).toBeTruthy();

    // Verify we can access authenticated page
    await page.goto('/dashboard');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
  });

  test('can create subject and milestone', async ({ page }) => {
    const token = await login(page);
    const testData = new TestDataFactory(page, token);

    const timestamp = Date.now();
    const subject = await testData.createSubject(`Quick Test Subject ${timestamp}`);
    expect(subject.id).toBeTruthy();

    const milestone = await testData.createMilestone(subject.id, {
      title: `Quick Test Milestone ${timestamp}`,
    });
    expect(milestone.id).toBeTruthy();
  });

  test('planner page loads', async ({ page }) => {
    await login(page);

    await page.goto('/planner');
    await expect(page.locator('h1:has-text("Weekly Planner")')).toBeVisible({ timeout: 15000 });

    // Verify basic planner elements exist
    await expect(page.locator('.planner-grid')).toBeVisible({ timeout: 10000 });
  });
});
