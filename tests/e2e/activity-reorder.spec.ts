import { test, expect, Page } from '@playwright/test';
import { login } from './helpers';

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3000';

// The server check is handled in the login helper

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

    // Navigate explicitly to subjects page instead of waiting for redirect
    await page.goto('/subjects', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the page to load and verify we're on the subjects page
    await page.waitForLoadState('load');
    await expect(page.getByRole('heading', { name: 'Subjects' })).toBeVisible({ timeout: 15000 });

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

      const subjectResponse = await page.request.post(`${API_BASE}/api/subjects`, {
        data: subjectData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!subjectResponse.ok()) {
        throw new Error(`Failed to create subject: ${await subjectResponse.text()}`);
      }

      const subjectRes = await subjectResponse.json();

      if (!subjectRes || !subjectRes.id) {
        throw new Error('Failed to create test subject');
      }

      const subject = subjectRes;

      // Create a test milestone
      const today = new Date();
      const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
      const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

      const milestoneData = {
        subjectId: subject.id,
        title: `Test Milestone ${timestamp}`,
        description: 'Test milestone for activity reorder test',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const milestoneResponse = await page.request.post(`${API_BASE}/api/milestones`, {
        data: milestoneData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!milestoneResponse.ok()) {
        throw new Error(`Failed to create milestone: ${await milestoneResponse.text()}`);
      }

      const milestoneRes = await milestoneResponse.json();

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
        const activityResponse = await page.request.post(`${API_BASE}/api/activities`, {
          data: {
            ...activity,
            milestoneId: milestone.id,
            subjectId: subject.id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!activityResponse.ok()) {
          throw new Error(`Failed to create activity: ${await activityResponse.text()}`);
        }

        const activityRes = await activityResponse.json();

        if (!activityRes || !activityRes.id) {
          throw new Error(`Failed to create test activity: ${activity.title}`);
        }

        createdActivities.push(activityRes);
      }

      console.log('Created milestone ID:', milestone.id);
      console.log(
        'Created activities:',
        createdActivities.map((a) => ({ id: a.id, title: a.title })),
      );

      // Verify the milestone exists via API
      const verifyResponse = await page.request.get(`${API_BASE}/api/milestones/${milestone.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (verifyResponse.ok()) {
        const verifyData = await verifyResponse.json();
        console.log('Milestone verified via API:', {
          id: verifyData.id,
          title: verifyData.title,
          activitiesCount: verifyData.activities?.length || 0,
        });
      } else {
        console.log(
          'Failed to verify milestone:',
          verifyResponse.status(),
          await verifyResponse.text(),
        );
      }

      // Track API requests
      const apiRequests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiRequests.push(`${request.method()} ${request.url()}`);
        }
      });

      // Navigate to the milestone page
      const url = `/milestones/${milestone.id}`;
      console.log('Navigating to:', url);

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Check if we're on the right page
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);

      // Give time for React to render
      await page.waitForTimeout(3000);

      // Check for loading state
      const loadingExists = await page.locator('text="Loading..."').isVisible();
      console.log('Page shows loading:', loadingExists);

      // Check for error messages
      const hasError = await page.locator('text=/error|failed|not found/i').count();
      console.log('Error messages found:', hasError);

      // Log API requests made
      console.log('API requests made:', apiRequests);

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.log('Console error:', msg.text());
        }
      });

      // Check network failures
      page.on('requestfailed', (request) => {
        console.log('Request failed:', request.url(), request.failure()?.errorText);
      });

      // Check if the ActivityList component is rendered
      const activityListExists = await page.locator('text="Add Activity"').isVisible();
      console.log('ActivityList component rendered:', activityListExists);

      // Wait for activities to load - check if any activities exist first
      const activityCount = await page.locator('[data-testid="activity-item"]').count();
      console.log('Number of activity items found:', activityCount);

      if (activityCount === 0) {
        // Take a screenshot for debugging
        await page.screenshot({ path: 'test-results/activity-reorder-debug.png', fullPage: true });

        // Check the page structure
        const pageText = await page.textContent('body');
        console.log('Page text content:', pageText?.substring(0, 500));
      }

      // Wait for activities to load with longer timeout
      await page.waitForSelector('[data-testid="activity-item"]', { timeout: 30000 });

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

      // Perform drag and drop using mouse events with better timing
      await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
      await page.waitForTimeout(500); // Give time for hover states
      await page.mouse.down();
      await page.waitForTimeout(200); // Give time for drag to start

      // Move to the position of the second item plus some offset
      await page.mouse.move(
        secondBox.x + secondBox.width / 2,
        secondBox.y + secondBox.height / 2 + 10,
        { steps: 10 },
      );
      await page.waitForTimeout(200); // Give time for drop zone highlighting

      await page.mouse.up();

      // Wait for the reorder to complete and API call to finish
      await page
        .waitForResponse((r) => r.url().includes('/api/activities/reorder') && r.status() === 200, {
          timeout: 10000,
        })
        .catch(() => {
          console.log('Reorder API timeout, checking if order changed anyway...');
        });

      await page.waitForTimeout(2000);

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
