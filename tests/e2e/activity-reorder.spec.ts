import { test, expect, Page } from '@playwright/test';

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

// Initialize API context before all tests
test.beforeAll(async () => {
  // Check if the server is running
  try {
    const response = await fetch(`${process.env.API_BASE || 'http://localhost:3001'}/api/health`);
    if (!response.ok) {
      console.error(
        'Server is not running or not responding correctly. Please start the server on port 3001.',
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to connect to the server:', error);
    console.error('Please make sure the server is running on port 3001.');
    process.exit(1);
  }
});

// Helper function to capture page state for debugging
async function capturePageState(page: Page, name: string) {
  try {
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
    console.log(`Screenshot saved: ${name}.png`);

    // Note: To collect console logs, set up page.on('console', ...) in the test
    // and collect logs in an array that can be accessed here

    const errors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map((script) => script.src)
        .filter((src: string) => !src.includes('localhost'));
    });

    if (errors.length > 0) {
      console.error('External script errors detected:', errors);
    }
  } catch (error) {
    console.error('Error capturing page state:', error);
  }
}

test.describe('Activity Reorder', () => {
  test('should allow reordering activities', async ({ page }) => {
    // Login first
    await login(page);

    // Wait for navigation to complete
    await page.waitForURL('**/subjects', { timeout: 30010 });

    // Verify we're on the subjects page
    await expect(page.getByRole('heading', { name: 'Subjects' })).toBeVisible();

    // Get authentication token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Create test data
    const timestamp = Date.now();

    try {
      // Create a test subject
      const subjectData = {
        name: `Test Subject ${timestamp}`,
        description: 'Test subject for activity reorder test',
      };

      const subjectRes = await page.evaluate(
        async ({ url, data, token }) => {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });
          return await response.json();
        },
        {
          url: `${API_BASE}/api/subjects`,
          data: subjectData,
          token,
        },
      );

      if (!subjectRes || !subjectRes.id) {
        throw new Error('Failed to create test subject');
      }

      const subject = subjectRes;

      // Create a test milestone
      const milestoneData = {
        subjectId: subject.id,
        title: `Test Milestone ${timestamp}`,
        description: 'Test milestone for activity reorder test',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const milestoneRes = await page.evaluate(
        async ({ url, data, token }) => {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });
          return await response.json();
        },
        {
          url: `${API_BASE}/api/milestones`,
          data: milestoneData,
          token,
        },
      );

      if (!milestoneRes || !milestoneRes.id) {
        throw new Error('Failed to create test milestone');
      }

      const milestone = milestoneRes;

      // Create test activities
      const activities = [
        { title: `Activity A ${timestamp}`, description: 'First activity' },
        { title: `Activity B ${timestamp}`, description: 'Second activity' },
        { title: `Activity C ${timestamp}`, description: 'Third activity' },
      ];

      const createdActivities = [];

      for (const activity of activities) {
        const activityRes = await page.evaluate(
          async ({ url, data, token }) => {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(data),
            });
            return await response.json();
          },
          {
            url: `${API_BASE}/api/activities`,
            data: {
              ...activity,
              milestoneId: milestone.id,
              subjectId: subject.id,
            },
            token,
          },
        );

        if (!activityRes || !activityRes.id) {
          throw new Error(`Failed to create test activity: ${activity.title}`);
        }

        createdActivities.push(activityRes);
      }

      // Navigate to the milestone page
      await page.goto(`/subjects/${subject.id}/milestones/${milestone.id}`);

      // Wait for activities to load
      await page.waitForSelector('[data-testid="activity-item"]', { timeout: 10000 });

      // Get initial order of activities
      const initialOrder = await page.$$eval('[data-testid="activity-item"]', (items) =>
        items.map((item) => item.textContent?.trim() || ''),
      );

      console.log('Initial activity order:', initialOrder);

      // Verify we have the expected number of activities
      expect(initialOrder.length).toBe(3);

      // Get the first and second activity elements
      const firstActivity = page.locator('[data-testid="activity-item"]').nth(0);
      const secondActivity = page.locator('[data-testid="activity-item"]').nth(1);

      // Get bounding boxes for drag and drop
      const firstBox = await firstActivity.boundingBox();
      const secondBox = await secondActivity.boundingBox();

      if (!firstBox || !secondBox) {
        throw new Error('Could not get bounding boxes for activities');
      }

      // Perform drag and drop using mouse events
      await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
      await page.mouse.down();

      // Move to the position of the second item plus some offset
      await page.mouse.move(
        secondBox.x + secondBox.width / 2,
        secondBox.y + secondBox.height / 2 + 10,
        { steps: 10 },
      );

      await page.mouse.up();

      // Wait for the reorder to complete
      await page.waitForTimeout(1000);

      // Get the new order of activities
      const newOrder = await page.$$eval('[data-testid="activity-item"]', (items) =>
        items.map((item) => item.textContent?.trim() || ''),
      );

      console.log('New activity order:', newOrder);

      // Verify the order has changed
      expect(newOrder[0]).toBe(initialOrder[1]);
      expect(newOrder[1]).toBe(initialOrder[0]);
    } catch (error) {
      console.error('Test failed:', error);
      await capturePageState(page, 'test-failure');
      throw error;
    }
  });
});
