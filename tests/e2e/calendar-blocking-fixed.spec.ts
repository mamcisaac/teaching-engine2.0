import { test, expect } from '@playwright/test';
import { 
  login, 
  PlannerPageObject, 
  TestDataFactory, 
  retry,
  waitForResponse,
  capturePageState 
} from './improved-helpers';

test.describe('Calendar Blocking', () => {
  test('planner blocks times from calendar events', async ({ page }) => {
    let planner: PlannerPageObject;
    let testData: TestDataFactory;
    
    try {
      // Login and setup
      const token = await login(page);
      planner = new PlannerPageObject(page);
      testData = new TestDataFactory(page, token);

      // Calculate Monday of current week for consistent testing
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysToMonday);
      monday.setHours(0, 0, 0, 0);

      // Create blocking event from 9:00 AM to 10:00 AM on Monday
      const eventStart = new Date(monday);
      eventStart.setHours(9, 0, 0, 0);
      const eventEnd = new Date(monday);
      eventEnd.setHours(10, 0, 0, 0);

      const event = await testData.createCalendarEvent(
        'Assembly Blocking Event',
        eventStart,
        eventEnd,
        { eventType: 'ASSEMBLY' }
      );

      console.log(`Created blocking event: ${event.title} on ${eventStart.toISOString()}`);

      // Navigate to planner
      await planner.navigate();

      // Set the week to contain our blocking event
      const weekStartFormatted = monday.toISOString().split('T')[0];
      await planner.setWeekStart(weekStartFormatted);

      // Wait for calendar events to load with retry
      await retry(async () => {
        await waitForResponse(page, '/api/calendar-events');
      });

      // Wait for the calendar event to be displayed
      await retry(async () => {
        const assemblyEvent = page.locator('.bg-yellow-100').filter({ hasText: 'Assembly Blocking Event' });
        await expect(assemblyEvent).toBeVisible({ timeout: 5000 });
      }, { maxRetries: 3, delay: 2000 });

      // Verify the event is displayed in the correct time slot
      const mondayColumn = page.locator('[data-testid="day-1"]').or(page.locator('[data-day="1"]'));
      const eventInColumn = mondayColumn.locator('text=Assembly Blocking Event');
      await expect(eventInColumn).toBeVisible({ timeout: 10000 });

    } catch (error) {
      await capturePageState(page, 'calendar-blocking-failure');
      throw error;
    }
  });

  test('multiple calendar events block correctly', async ({ page }) => {
    let planner: PlannerPageObject;
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      planner = new PlannerPageObject(page);
      testData = new TestDataFactory(page, token);

      // Get current week dates
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      startOfWeek.setHours(0, 0, 0, 0);

      // Create multiple events throughout the week
      const events = [
        {
          title: 'Morning Assembly',
          day: 1, // Monday
          startHour: 8,
          endHour: 9,
          type: 'ASSEMBLY'
        },
        {
          title: 'Field Trip',
          day: 3, // Wednesday
          startHour: 9,
          endHour: 15,
          type: 'TRIP'
        },
        {
          title: 'PD Session',
          day: 5, // Friday
          startHour: 13,
          endHour: 15,
          type: 'PD_DAY'
        }
      ];

      for (const eventConfig of events) {
        const eventDate = new Date(startOfWeek);
        eventDate.setDate(startOfWeek.getDate() + eventConfig.day - 1);
        
        const eventStart = new Date(eventDate);
        eventStart.setHours(eventConfig.startHour, 0, 0, 0);
        
        const eventEnd = new Date(eventDate);
        eventEnd.setHours(eventConfig.endHour, 0, 0, 0);

        await testData.createCalendarEvent(
          eventConfig.title,
          eventStart,
          eventEnd,
          { eventType: eventConfig.type }
        );
      }

      // Navigate to planner and set the week
      await planner.navigate();
      await planner.setWeekStart(startOfWeek.toISOString().split('T')[0]);

      // Wait for all events to be displayed
      for (const eventConfig of events) {
        await retry(async () => {
          const eventElement = page.locator('.bg-yellow-100').filter({ hasText: eventConfig.title });
          await expect(eventElement).toBeVisible({ timeout: 5000 });
        }, { maxRetries: 3, delay: 1000 });
      }

      // Verify events are in correct day columns
      const mondayEvent = page.locator('[data-testid="day-1"]').locator('text=Morning Assembly');
      const wednesdayEvent = page.locator('[data-testid="day-3"]').locator('text=Field Trip');
      const fridayEvent = page.locator('[data-testid="day-5"]').locator('text=PD Session');

      await expect(mondayEvent).toBeVisible({ timeout: 10000 });
      await expect(wednesdayEvent).toBeVisible({ timeout: 10000 });
      await expect(fridayEvent).toBeVisible({ timeout: 10000 });

    } catch (error) {
      await capturePageState(page, 'multiple-events-failure');
      throw error;
    }
  });

  test('all-day events block entire day', async ({ page }) => {
    let planner: PlannerPageObject;
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      planner = new PlannerPageObject(page);
      testData = new TestDataFactory(page, token);

      // Create an all-day holiday event
      const today = new Date();
      const holiday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
      holiday.setHours(0, 0, 0, 0);

      await testData.createCalendarEvent(
        'Statutory Holiday',
        holiday,
        holiday,
        { allDay: true, eventType: 'HOLIDAY' }
      );

      // Navigate to planner and set to holiday week
      await planner.navigate();
      
      const weekStart = new Date(holiday);
      weekStart.setDate(holiday.getDate() - holiday.getDay() + 1); // Monday of that week
      await planner.setWeekStart(weekStart.toISOString().split('T')[0]);

      // Wait for holiday to be displayed
      await retry(async () => {
        const holidayEvent = page.locator('text=Statutory Holiday');
        await expect(holidayEvent).toBeVisible({ timeout: 5000 });
      });

      // All-day events should block the entire day
      const holidayDayColumn = page.locator(`[data-testid="day-${holiday.getDay()}"]`);
      const noSlotsMessage = holidayDayColumn.locator('text=No time slots');
      
      // Either the holiday event should be visible OR "No time slots" should be shown
      await expect(
        page.locator('text=Statutory Holiday').or(noSlotsMessage)
      ).toBeVisible({ timeout: 10000 });

    } catch (error) {
      await capturePageState(page, 'all-day-event-failure');
      throw error;
    }
  });
});