import { test, expect } from '@playwright/test';
import { loginAsTestUser, DEFAULT_TEST_USER, initApiContext } from './helpers/auth-updated';

// Initialize API context before all tests
test.beforeAll(async ({ playwright }) => {
  await initApiContext(playwright);
});

test.describe('Smoke Tests', () => {
  test('should login and navigate to main pages', async ({ page }) => {
    // Login
    await loginAsTestUser(page, DEFAULT_TEST_USER);

    // Verify dashboard loads
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Test navigation to planner
    await page.goto('/planner');
    await expect(page.locator('h1:has-text("Weekly Planner")')).toBeVisible({ timeout: 10000 });

    // Test navigation to outcomes
    await page.goto('/outcomes');
    await expect(page.locator('text=Curriculum Outcomes')).toBeVisible({ timeout: 10000 });

    // Test navigation to parent messages
    await page.goto('/parent-messages');
    await expect(page.locator('text=Parent Communications')).toBeVisible({ timeout: 10000 });
  });

  test('should verify merged functionality exists', async ({ page }) => {
    await loginAsTestUser(page, DEFAULT_TEST_USER);

    // Check for activity templates (from archer-main)
    await page.goto('/');
    const activityLibraryLink = page.locator('a[href="/activity-library"]');
    if (await activityLibraryLink.isVisible({ timeout: 5000 })) {
      await activityLibraryLink.click();
      await expect(page.locator('text=Activity Library')).toBeVisible();
    }

    // Check for students (from main)
    await page.goto('/students');
    await expect(
      page.locator('h1:has-text("Students"), .text-xl:has-text("Students")').first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
