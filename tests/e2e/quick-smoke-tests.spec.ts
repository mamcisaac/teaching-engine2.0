import { test, expect } from '@playwright/test';
import { login, TestDataFactory } from './improved-helpers';

test.describe('Quick Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set a consistent viewport for all tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('auth flow works', async ({ page }) => {
    const token = await login(page);
    expect(token).toBeTruthy();

    // Verify we can access authenticated page with retry
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // More specific selector and longer timeout for CI
    const dashboardHeading = page.locator('h1, h2, h3').first();
    await expect(dashboardHeading).toBeVisible({
      timeout: process.env.CI ? 20000 : 10000,
    });

    // Verify we're not on login page
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('can create subject and milestone', async ({ page }) => {
    const token = await login(page);
    const testData = new TestDataFactory(page, token);

    const timestamp = Date.now();
    const subjectName = `Quick Test Subject ${timestamp}`;

    // Create with retry logic
    let subject;
    for (let i = 0; i < 3; i++) {
      try {
        subject = await testData.createSubject(subjectName);
        break;
      } catch (error) {
        if (i === 2) throw error;
        console.log(`Retry ${i + 1}: Creating subject failed, retrying...`);
        await page.waitForTimeout(1000);
      }
    }

    expect(subject).toBeDefined();
    expect(subject.id).toBeTruthy();

    const milestone = await testData.createMilestone(subject.id, {
      title: `Quick Test Milestone ${timestamp}`,
    });
    expect(milestone.id).toBeTruthy();
  });

  test('planner page loads', async ({ page }) => {
    await login(page);

    // Navigate with explicit wait
    await page.goto('/planner', { waitUntil: 'domcontentloaded' });

    // Wait for any redirects to complete
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // Ignore timeout - some apps have continuous polling
    });

    // Look for planner heading with more specific selector
    const plannerHeading = page.locator('h1:has-text("Weekly Planner")').first();
    await expect(plannerHeading).toBeVisible({
      timeout: process.env.CI ? 30000 : 15000,
    });

    // Verify basic planner elements exist with retry
    const plannerGrid = page
      .locator('.planner-grid, [data-testid="planner-grid"], #planner-grid, .calendar-grid')
      .first();
    await expect(plannerGrid).toBeVisible({
      timeout: process.env.CI ? 20000 : 10000,
    });
  });
});
