import { test, expect } from '@playwright/test';
import {
  login,
  PlannerPageObject,
  TestDataFactory,
  retry,
  capturePageState,
} from './improved-helpers';

test.describe('Holiday Planner', () => {
  test('planner skips holiday dates', async ({ page }) => {
    let planner: PlannerPageObject;
    let testData: TestDataFactory;

    try {
      // Login and setup
      const token = await login(page);
      planner = new PlannerPageObject(page);
      testData = new TestDataFactory(page, token);

      // Create test data with unique names
      const timestamp = Date.now();
      const subject = await testData.createSubject(`Holiday Test Subject ${timestamp}`);

      const milestone = await testData.createMilestone(subject.id, {
        title: `Holiday Test Milestone ${timestamp}`,
      });

      const activityTitle = `Holiday Test Activity ${timestamp}`;
      await testData.createActivity(milestone.id, activityTitle);

      // Create timetable slot for Wednesday (day 3)
      await testData.createTimetableSlot(subject.id, 3, 540, 600); // 9:00 AM - 10:00 AM

      // Create Christmas holiday
      const christmasDate = new Date('2025-12-25');
      await testData.createCalendarEvent(`Christmas ${timestamp}`, christmasDate, christmasDate, {
        allDay: true,
        eventType: 'HOLIDAY',
      });

      // Navigate to planner and wait for load
      await planner.navigate();

      // Set the week to Christmas week and trigger auto-fill
      await planner.setWeekStart('2025-12-22');

      // Wait for the week to be displayed
      await retry(async () => {
        await planner.expectWeekDisplayed('Dec 21 - Dec 25, 2025');
      });

      // Click auto-fill and wait for completion
      await planner.clickAutoFill();

      // Verify that activities are NOT scheduled on Wednesday due to holiday
      await planner.expectActivityInDay('day-3', activityTitle, false);

      // Verify that "No time slots" message appears (indicating holiday blocking worked)
      await expect(page.locator('text=No time slots').first()).toBeVisible({ timeout: 10000 });
    } catch (error) {
      await capturePageState(page, 'holiday-planner-failure');
      throw error;
    }
  });

  test('planner displays calendar events correctly', async ({ page }) => {
    let planner: PlannerPageObject;
    let testData: TestDataFactory;

    try {
      // Login and setup
      const token = await login(page);
      planner = new PlannerPageObject(page);
      testData = new TestDataFactory(page, token);

      // Create a calendar event for current week
      const today = new Date();
      const mondayOfThisWeek = new Date(today);
      mondayOfThisWeek.setDate(today.getDate() - today.getDay() + 1);
      mondayOfThisWeek.setHours(10, 0, 0, 0);

      const eventEnd = new Date(mondayOfThisWeek);
      eventEnd.setHours(11, 0, 0, 0);

      const timestamp = Date.now();
      const eventTitle = `Test Assembly ${timestamp}`;

      await testData.createCalendarEvent(eventTitle, mondayOfThisWeek, eventEnd, {
        eventType: 'ASSEMBLY',
      });

      // Navigate to planner
      await planner.navigate();

      // Set to the week containing our event
      const weekStart = new Date(mondayOfThisWeek);
      weekStart.setDate(mondayOfThisWeek.getDate() - mondayOfThisWeek.getDay() + 1);
      await planner.setWeekStart(weekStart.toISOString().split('T')[0]);

      // Verify the calendar event is displayed
      await planner.expectCalendarEvent(eventTitle);
    } catch (error) {
      await capturePageState(page, 'calendar-events-failure');
      throw error;
    }
  });
});
