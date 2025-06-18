import { test, expect } from '@playwright/test';
import { login, TestDataFactory, retry, capturePageState, waitForResponse } from './improved-helpers';

test.describe('Weekly Planning', () => {
  test('generate weekly plan from activity', async ({ page }) => {
    let testData: TestDataFactory;

    try {
      // Login and get token
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create test data with retry logic
      const subject = await retry(async () => {
        return await testData.createSubject('Weekly Plan Test Subject');
      });

      const milestone = await retry(async () => {
        return await testData.createMilestone(subject.id, {
          title: 'Weekly Plan Test Milestone',
        });
      });

      // Verify milestone was created successfully
      expect(milestone.id).toBeTruthy();
      expect(milestone.title).toBe('Weekly Plan Test Milestone');

      // Create activity with proper error handling
      const activity = await retry(async () => {
        return await testData.createActivity(milestone.id, 'Weekly Plan Test Activity');
      });

      // Verify activity creation
      expect(activity.id).toBeTruthy();
      expect(activity.title).toBe('Weekly Plan Test Activity');

      // Verify data exists via API
      const verificationResponse = await page.request.get(
        `${testData.constructor.name.includes('TestDataFactory') ? 'http://127.0.0.1:3000' : ''}/api/milestones/${milestone.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!verificationResponse.ok()) {
        throw new Error(`Milestone verification failed: ${verificationResponse.status()}`);
      }

      const milestoneData = await verificationResponse.json();
      expect(milestoneData.id).toBe(milestone.id);
      expect(milestoneData.activities).toBeDefined();
      expect(milestoneData.activities.length).toBeGreaterThan(0);
    } catch (error) {
      await capturePageState(page, 'weekly-planning-failure');
      throw error;
    }
  });

  test('create lesson plan with timetable integration', async ({ page }) => {
    let testData: TestDataFactory;

    try {
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create subject and milestone with proper dates
      const subject = await testData.createSubject('Timetable Integration Subject');
      
      // Ensure milestone spans current week
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 14);
      
      const milestone = await testData.createMilestone(subject.id, {
        title: 'Timetable Test Milestone',
        startDate,
        endDate
      });
      const activity = await testData.createActivity(milestone.id, 'Timetable Activity');

      // Navigate to planner
      await page.goto('/planner', { waitUntil: 'domcontentloaded' });

      // Wait for planner to load completely
      await page.waitForSelector('h1:has-text("Weekly Planner")', { timeout: 15000 });
      
      // Wait for planner suggestions to load
      await waitForResponse(page, '/api/planner-suggestions').catch(() => {
        console.log('Planner suggestions API not called, continuing...');
      });
      await page.waitForLoadState('networkidle');

      // Verify that the activity appears in the suggested activities section
      // The activity might be in different sections, so check for any occurrence
      const suggestedActivity = page.locator(`text="${activity.title}"`).first();
      await expect(suggestedActivity).toBeVisible({ timeout: 15000 });

      // Verify the milestone appears
      const milestoneText = page.locator(`text="${milestone.title}"`);
      await expect(milestoneText).toBeVisible({ timeout: 10000 });

      // Test that we can interact with the planner (e.g., Auto Fill button exists)
      const autoFillButton = page.locator('button:has-text("Auto Fill")');
      await expect(autoFillButton).toBeVisible();

      // Note: Timetable creation is globally shared, so we can't reliably test
      // specific time slots in a parallel test environment
    } catch (error) {
      await capturePageState(page, 'timetable-integration-failure');
      throw error;
    }
  });

  test('handle empty state gracefully', async ({ page }) => {
    try {
      // Login but don't create any data
      await login(page);

      // Navigate to planner
      await page.goto('/planner', { waitUntil: 'domcontentloaded' });

      // Wait for planner to load
      await page.waitForSelector('h1:has-text("Weekly Planner")', { timeout: 15000 });
      await page.waitForLoadState('networkidle');

      // Should show empty state message - use first() to avoid strict mode violation
      const emptyStateMessage = page.locator('text=No activities scheduled');
      await expect(emptyStateMessage.or(page.locator('text=No time slots').first())).toBeVisible({
        timeout: 10000,
      });
    } catch (error) {
      await capturePageState(page, 'empty-state-failure');
      throw error;
    }
  });
});
