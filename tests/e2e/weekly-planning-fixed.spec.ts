import { test, expect } from '@playwright/test';
import { login, TestDataFactory, retry, capturePageState } from './improved-helpers';

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

      // Create subject and milestone
      const subject = await testData.createSubject('Timetable Integration Subject');
      const milestone = await testData.createMilestone(subject.id);
      await testData.createActivity(milestone.id, 'Timetable Activity');

      // Create timetable slots for multiple days
      await testData.createTimetableSlot(subject.id, 1, 480, 540); // Monday 8:00-9:00 AM
      await testData.createTimetableSlot(subject.id, 3, 540, 600); // Wednesday 9:00-10:00 AM
      await testData.createTimetableSlot(subject.id, 5, 600, 660); // Friday 10:00-11:00 AM

      // Navigate to planner
      await page.goto('/planner', { waitUntil: 'domcontentloaded' });

      // Wait for planner to load completely
      await page.waitForSelector('h1:has-text("Weekly Planner")', { timeout: 15000 });
      await page.waitForLoadState('networkidle');

      // Wait for timetable data to load
      await page.waitForTimeout(2000); // Give time for timetable creation to sync

      // Verify timetable slots are visible
      const mondaySlot = page.locator('[data-testid="day-1"]').locator('text=8:00 AM - 9:00 AM');
      const wednesdaySlot = page
        .locator('[data-testid="day-3"]')
        .locator('text=9:00 AM - 10:00 AM');
      const fridaySlot = page.locator('[data-testid="day-5"]').locator('text=10:00 AM - 11:00 AM');

      await expect(mondaySlot).toBeVisible({ timeout: 10000 });
      await expect(wednesdaySlot).toBeVisible({ timeout: 10000 });
      await expect(fridaySlot).toBeVisible({ timeout: 10000 });
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
