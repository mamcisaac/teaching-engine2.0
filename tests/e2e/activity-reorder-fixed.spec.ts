import { test, expect } from '@playwright/test';
import { 
  login, 
  ActivityPageObject, 
  TestDataFactory, 
  retry,
  capturePageState 
} from './improved-helpers';

test.describe('Activity Reorder', () => {
  test('should allow reordering activities via drag and drop', async ({ page }) => {
    let activityPage: ActivityPageObject;
    let testData: TestDataFactory;
    
    try {
      // Login and setup
      const token = await login(page);
      activityPage = new ActivityPageObject(page);
      testData = new TestDataFactory(page, token);

      // Create test data
      const subject = await testData.createSubject('Reorder Test Subject');
      const milestone = await testData.createMilestone(subject.id, {
        title: 'Reorder Test Milestone'
      });

      // Create multiple activities for reordering
      const activities = await Promise.all([
        testData.createActivity(milestone.id, 'Activity Alpha'),
        testData.createActivity(milestone.id, 'Activity Beta'), 
        testData.createActivity(milestone.id, 'Activity Gamma')
      ]);

      console.log('Created activities:', activities.map(a => ({ id: a.id, title: a.title })));

      // Navigate to milestone page
      await activityPage.navigateToMilestone(milestone.id);

      // Verify all activities are present
      await activityPage.expectActivityCount(3);

      // Get initial order
      const initialOrder = await retry(async () => {
        return await activityPage.getActivityOrder();
      });

      console.log('Initial order:', initialOrder);
      expect(initialOrder).toHaveLength(3);

      // Perform drag and drop: move first activity to second position
      await retry(async () => {
        await activityPage.dragActivityToPosition(0, 1);
      }, { maxRetries: 2, delay: 1000 });

      // Get new order after drag and drop
      const newOrder = await retry(async () => {
        const order = await activityPage.getActivityOrder();
        // Ensure the order actually changed
        if (JSON.stringify(order) === JSON.stringify(initialOrder)) {
          throw new Error('Order did not change after drag and drop');
        }
        return order;
      }, { maxRetries: 3, delay: 2000 });

      console.log('New order:', newOrder);

      // Verify the order changed correctly
      // First item should now be the second item, second should be first
      expect(newOrder[0]).toBe(initialOrder[1]);
      expect(newOrder[1]).toBe(initialOrder[0]);
      expect(newOrder[2]).toBe(initialOrder[2]); // Third should remain unchanged

    } catch (error) {
      await capturePageState(page, 'activity-reorder-failure');
      throw error;
    }
  });

  test('should handle reordering with many activities', async ({ page }) => {
    let activityPage: ActivityPageObject;
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      activityPage = new ActivityPageObject(page);
      testData = new TestDataFactory(page, token);

      // Create test data
      const subject = await testData.createSubject('Many Activities Subject');
      const milestone = await testData.createMilestone(subject.id);

      // Create 5 activities for more complex reordering
      const activityTitles = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
      await Promise.all(
        activityTitles.map(title => testData.createActivity(milestone.id, `Activity ${title}`))
      );

      console.log('Created 5 activities for reordering test');

      // Navigate to milestone page
      await activityPage.navigateToMilestone(milestone.id);
      await activityPage.expectActivityCount(5);

      // Get initial order
      const initialOrder = await activityPage.getActivityOrder();
      console.log('Initial order (5 activities):', initialOrder);

      // Move last activity to first position
      await retry(async () => {
        await activityPage.dragActivityToPosition(4, 0);
      });

      // Verify the reorder
      const newOrder = await retry(async () => {
        const order = await activityPage.getActivityOrder();
        if (JSON.stringify(order) === JSON.stringify(initialOrder)) {
          throw new Error('Order did not change');
        }
        return order;
      }, { maxRetries: 3, delay: 2000 });

      console.log('New order (after moving last to first):', newOrder);

      // Last item should now be first
      expect(newOrder[0]).toBe(initialOrder[4]);
      // Other items should shift down
      expect(newOrder[1]).toBe(initialOrder[0]);
      expect(newOrder[2]).toBe(initialOrder[1]);

    } catch (error) {
      await capturePageState(page, 'many-activities-reorder-failure');
      throw error;
    }
  });

  test('should handle reordering edge cases gracefully', async ({ page }) => {
    let activityPage: ActivityPageObject;
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      activityPage = new ActivityPageObject(page);
      testData = new TestDataFactory(page, token);

      // Create minimal test data
      const subject = await testData.createSubject('Edge Case Subject');
      const milestone = await testData.createMilestone(subject.id);

      // Test with only 2 activities (minimum for reordering)
      await Promise.all([
        testData.createActivity(milestone.id, 'Activity One'),
        testData.createActivity(milestone.id, 'Activity Two')
      ]);

      await activityPage.navigateToMilestone(milestone.id);
      await activityPage.expectActivityCount(2);

      const initialOrder = await activityPage.getActivityOrder();
      console.log('Initial order (2 activities):', initialOrder);

      // Swap the two activities
      await retry(async () => {
        await activityPage.dragActivityToPosition(0, 1);
      });

      const newOrder = await retry(async () => {
        const order = await activityPage.getActivityOrder();
        if (JSON.stringify(order) === JSON.stringify(initialOrder)) {
          throw new Error('Order did not change');
        }
        return order;
      });

      console.log('New order (swapped):', newOrder);

      // Order should be swapped
      expect(newOrder[0]).toBe(initialOrder[1]);
      expect(newOrder[1]).toBe(initialOrder[0]);

    } catch (error) {
      await capturePageState(page, 'edge-case-reorder-failure');
      throw error;
    }
  });

  test('should maintain order after page reload', async ({ page }) => {
    let activityPage: ActivityPageObject;
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      activityPage = new ActivityPageObject(page);
      testData = new TestDataFactory(page, token);

      // Create test data
      const subject = await testData.createSubject('Persistence Test Subject');
      const milestone = await testData.createMilestone(subject.id);

      await Promise.all([
        testData.createActivity(milestone.id, 'Persistent Activity A'),
        testData.createActivity(milestone.id, 'Persistent Activity B'),
        testData.createActivity(milestone.id, 'Persistent Activity C')
      ]);

      // Navigate and get initial order
      await activityPage.navigateToMilestone(milestone.id);
      const initialOrder = await activityPage.getActivityOrder();

      // Reorder activities
      await activityPage.dragActivityToPosition(0, 2);
      
      const reorderedOrder = await retry(async () => {
        const order = await activityPage.getActivityOrder();
        if (JSON.stringify(order) === JSON.stringify(initialOrder)) {
          throw new Error('Order did not change');
        }
        return order;
      });

      console.log('Order after reordering:', reorderedOrder);

      // Reload the page
      await page.reload({ waitUntil: 'domcontentloaded' });
      await activityPage.waitForPageLoad();

      // Get order after reload
      const orderAfterReload = await activityPage.getActivityOrder();
      console.log('Order after page reload:', orderAfterReload);

      // Order should persist after reload
      expect(orderAfterReload).toEqual(reorderedOrder);

    } catch (error) {
      await capturePageState(page, 'persistence-test-failure');
      throw error;
    }
  });
});