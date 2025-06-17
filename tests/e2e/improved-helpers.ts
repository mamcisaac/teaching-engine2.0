import { Page, expect } from '@playwright/test';

export const API_BASE =
  process.env.TEST_SERVER_URL || process.env.API_BASE || 'http://127.0.0.1:3000';
export const FRONTEND_BASE = 'http://localhost:5173';

/**
 * Enhanced authentication helper with better error handling and timing
 */
export async function login(page: Page): Promise<string> {
  console.log('Starting authentication process...');

  // Wait for services with retry logic
  await waitForServices(page);

  // Perform login
  const response = await page.request.post(`${API_BASE}/api/login`, {
    data: { email: 'teacher@example.com', password: 'password123' },
  });

  if (!response.ok()) {
    const errorBody = await response.text().catch(() => 'Unable to read response body');
    throw new Error(`Login failed with status ${response.status()}: ${errorBody}`);
  }

  const { token, user } = (await response.json()) as { token: string; user: unknown };

  // Set auth data before navigation
  await page.addInitScript(
    ({ t, u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('auth-token', t);
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('onboarded', 'true');
    },
    { t: token, u: user },
  );

  // Navigate and wait for authentication
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for the page to be ready, but don't wait for complete network idle
  // since some apps continuously poll or have long-running requests
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch (e) {
    // If networkidle times out, just wait for load state and continue
    await page.waitForLoadState('load', { timeout: 5000 });
  }

  // Verify authentication state
  await expect(page.evaluate(() => localStorage.getItem('token'))).resolves.toBeTruthy();

  console.log('Authentication completed successfully');
  return token;
}

/**
 * Wait for both API and frontend services to be available
 */
async function waitForServices(page: Page, maxRetries = 60): Promise<void> {
  console.log(`Waiting for services. API_BASE: ${API_BASE}, FRONTEND_BASE: ${FRONTEND_BASE}`);

  let apiReady = false;
  let frontendReady = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check API health endpoint
      if (!apiReady) {
        const apiResponse = await page.request.get(`${API_BASE}/health`, { timeout: 5000 });
        if (apiResponse.ok()) {
          apiReady = true;
          console.log('✅ API service is ready');
        }
      }

      // Check frontend - just needs to respond, doesn't need to be "ok"
      if (!frontendReady) {
        try {
          await page.request.get(FRONTEND_BASE, { timeout: 5000 });
          // If we get here without error, frontend is responding
          frontendReady = true;
          console.log('✅ Frontend service is ready');
        } catch (frontendError) {
          // Frontend not ready yet
        }
      }

      if (apiReady && frontendReady) {
        console.log('✅ Both services are ready');
        return;
      }

      if (i % 10 === 0) {
        // Log every 10th attempt
        console.log(
          `Services status: API ${apiReady ? 'OK' : 'Failed'}, Frontend ${frontendReady ? 'OK' : 'Failed'}`,
        );
      }
    } catch (error) {
      if (i % 10 === 0) {
        // Log every 10th attempt to reduce noise
        console.log(
          `Service check attempt ${i + 1} failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    await page.waitForTimeout(1000);
  }

  throw new Error(
    `Services did not become available within timeout. API: ${apiReady}, Frontend: ${frontendReady}`,
  );
}

/**
 * Retry helper for flaky operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    retryCondition?: (error: Error) => boolean;
  } = {},
): Promise<T> {
  const { maxRetries = 3, delay = 1000, retryCondition = () => true } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries || !retryCondition(lastError)) {
        throw lastError;
      }

      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Wait for a specific response with retry logic
 */
export async function waitForResponse(
  page: Page,
  urlPattern: string | RegExp,
  options: {
    status?: number;
    timeout?: number;
    method?: string;
  } = {},
): Promise<void> {
  const { status = 200, timeout = 10000, method } = options;

  await page.waitForResponse(
    (response) => {
      const urlMatches =
        typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());

      const statusMatches = response.status() === status;
      const methodMatches = !method || response.request().method() === method;

      return urlMatches && statusMatches && methodMatches;
    },
    { timeout },
  );
}

/**
 * Page Object for Planner page
 */
export class PlannerPageObject {
  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/planner', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    // Wait for page elements to be present
    await this.page.waitForSelector('h1:has-text("Weekly Planner")', { timeout: 15000 });

    // Wait for initial API calls to complete
    await Promise.all([
      waitForResponse(this.page, '/api/calendar-events').catch(() => {
        console.log('Calendar events API not called, continuing...');
      }),
      waitForResponse(this.page, '/api/timetable').catch(() => {
        console.log('Timetable API not called, continuing...');
      }),
    ]);

    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');
  }

  async setWeekStart(date: string): Promise<void> {
    const dateInput = this.page.locator('input[type="date"]').first();
    await dateInput.waitFor({ state: 'visible' });
    await dateInput.fill(date);

    // Wait for the week to update
    await this.page.waitForLoadState('networkidle');
  }

  async clickAutoFill(): Promise<void> {
    const autoFillButton = this.page.locator('button:has-text("Auto Fill")').first();
    await autoFillButton.waitFor({ state: 'visible' });
    await autoFillButton.click();

    // Wait for auto-fill operation to complete
    await this.page.waitForLoadState('networkidle');
  }

  async expectWeekDisplayed(weekText: string): Promise<void> {
    await expect(this.page.locator(`text=${weekText}`)).toBeVisible({ timeout: 10000 });
  }

  async expectActivityInDay(
    dayTestId: string,
    activityName: string,
    shouldExist = true,
  ): Promise<void> {
    const dayColumn = this.page.locator(`[data-testid="${dayTestId}"]`);
    const activityElement = dayColumn.locator(`text=${activityName}`);

    if (shouldExist) {
      await expect(activityElement).toBeVisible({ timeout: 10000 });
    } else {
      await expect(activityElement).toHaveCount(0);
    }
  }

  async expectCalendarEvent(eventName: string): Promise<void> {
    const eventElement = this.page.locator('.bg-yellow-100').filter({ hasText: eventName }).first();
    await expect(eventElement).toBeVisible({ timeout: 15000 });
  }
}

/**
 * Page Object for Activity/Milestone management
 */
export class ActivityPageObject {
  constructor(private page: Page) {}

  async navigateToMilestone(milestoneId: number): Promise<void> {
    await this.page.goto(`/milestones/${milestoneId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    // Wait for the milestone page to load
    await Promise.race([
      this.page.waitForSelector('[data-testid="activity-item"]', { timeout: 30000 }),
      this.page.waitForSelector('text="Add Activity"', { timeout: 30000 }),
    ]);

    // Wait for any loading indicators to disappear
    await this.page
      .waitForSelector('text="Loading..."', { state: 'hidden', timeout: 5000 })
      .catch(() => {
        // Loading indicator might not exist, that's fine
      });

    await this.page.waitForLoadState('networkidle');
  }

  async getActivityOrder(): Promise<string[]> {
    const activities = this.page.locator('[data-testid="activity-item"]');
    await activities.first().waitFor({ state: 'visible', timeout: 15000 });

    return await activities.evaluateAll((elements) =>
      elements.map((el) => el.textContent?.trim() || ''),
    );
  }

  async dragActivityToPosition(fromIndex: number, toIndex: number): Promise<void> {
    const activities = this.page.locator('[data-testid="activity-item"]');

    const sourceActivity = activities.nth(fromIndex);
    const targetActivity = activities.nth(toIndex);

    // Wait for elements to be ready
    await sourceActivity.waitFor({ state: 'visible' });
    await targetActivity.waitFor({ state: 'visible' });

    // Get positions for drag and drop
    const sourceBox = await sourceActivity.boundingBox();
    const targetBox = await targetActivity.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding boxes for drag and drop');
    }

    // Perform drag and drop with proper timing
    await this.page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2,
    );

    // Wait for hover state
    await this.page.waitForTimeout(300);

    await this.page.mouse.down();
    await this.page.waitForTimeout(200);

    // Move to target position
    await this.page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2 + 10,
      { steps: 10 },
    );

    await this.page.waitForTimeout(200);
    await this.page.mouse.up();

    // Wait for reorder API call to complete
    await retry(
      async () => {
        await waitForResponse(this.page, '/api/activities/reorder', { timeout: 5000 });
      },
      { maxRetries: 2, delay: 1000 },
    );

    // Wait for UI to update
    await this.page.waitForLoadState('networkidle');
  }

  async expectActivityCount(count: number): Promise<void> {
    const activities = this.page.locator('[data-testid="activity-item"]');
    await expect(activities).toHaveCount(count, { timeout: 15000 });
  }
}

/**
 * Test data factory for E2E tests
 */
export class TestDataFactory {
  constructor(
    private page: Page,
    private token: string,
  ) {}

  async createSubject(name?: string): Promise<{ id: number; name: string }> {
    const timestamp = Date.now();
    const subjectName = name || `Test Subject ${timestamp}`;

    // Retry logic for server restarts
    return await retry(
      async () => {
        const response = await this.page.request.post(`${API_BASE}/api/subjects`, {
          headers: { Authorization: `Bearer ${this.token}` },
          data: { name: subjectName },
        });

        if (!response.ok()) {
          throw new Error(`Failed to create subject: ${await response.text()}`);
        }

        return await response.json();
      },
      {
        maxRetries: 3,
        delay: 2000,
        retryCondition: (error) => {
          // Retry on connection errors
          return error.message.includes('ECONNREFUSED') || error.message.includes('connect');
        },
      },
    );
  }

  async createMilestone(
    subjectId: number,
    options: {
      title?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<{ id: number; title: string }> {
    const timestamp = Date.now();
    const today = new Date();

    const milestoneData = {
      title: options.title || `Test Milestone ${timestamp}`,
      subjectId,
      startDate: (
        options.startDate || new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).toISOString(),
      endDate: (
        options.endDate || new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
      ).toISOString(),
    };

    return await retry(
      async () => {
        const response = await this.page.request.post(`${API_BASE}/api/milestones`, {
          headers: { Authorization: `Bearer ${this.token}` },
          data: milestoneData,
        });

        if (!response.ok()) {
          throw new Error(`Failed to create milestone: ${await response.text()}`);
        }

        return await response.json();
      },
      {
        maxRetries: 3,
        delay: 2000,
        retryCondition: (error) =>
          error.message.includes('ECONNREFUSED') || error.message.includes('connect'),
      },
    );
  }

  async createActivity(
    milestoneId: number,
    title?: string,
  ): Promise<{ id: number; title: string }> {
    const timestamp = Date.now();
    const activityTitle = title || `Test Activity ${timestamp}`;

    return await retry(
      async () => {
        const response = await this.page.request.post(`${API_BASE}/api/activities`, {
          headers: { Authorization: `Bearer ${this.token}` },
          data: { title: activityTitle, milestoneId },
        });

        if (!response.ok()) {
          throw new Error(`Failed to create activity: ${await response.text()}`);
        }

        return await response.json();
      },
      {
        maxRetries: 3,
        delay: 2000,
        retryCondition: (error) =>
          error.message.includes('ECONNREFUSED') || error.message.includes('connect'),
      },
    );
  }

  async createTimetableSlot(
    subjectId: number,
    day: number,
    startMin: number,
    endMin: number,
  ): Promise<void> {
    await retry(
      async () => {
        const response = await this.page.request.put(`${API_BASE}/api/timetable`, {
          headers: { Authorization: `Bearer ${this.token}` },
          data: [{ day, startMin, endMin, subjectId }],
        });

        if (!response.ok()) {
          throw new Error(`Failed to create timetable slot: ${await response.text()}`);
        }
      },
      {
        maxRetries: 3,
        delay: 2000,
        retryCondition: (error) =>
          error.message.includes('ECONNREFUSED') || error.message.includes('connect'),
      },
    );
  }

  async createCalendarEvent(
    title: string,
    start: Date,
    end: Date,
    options: {
      allDay?: boolean;
      eventType?: string;
    } = {},
  ): Promise<{ id: number; title: string }> {
    const eventData = {
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: options.allDay || false,
      eventType: options.eventType || 'CUSTOM',
      source: 'MANUAL',
    };

    return await retry(
      async () => {
        const response = await this.page.request.post(`${API_BASE}/api/calendar-events`, {
          headers: { Authorization: `Bearer ${this.token}` },
          data: eventData,
        });

        if (!response.ok()) {
          throw new Error(`Failed to create calendar event: ${await response.text()}`);
        }

        return await response.json();
      },
      {
        maxRetries: 3,
        delay: 2000,
        retryCondition: (error) =>
          error.message.includes('ECONNREFUSED') || error.message.includes('connect'),
      },
    );
  }
}

/**
 * Debug utilities for test troubleshooting
 */
export async function capturePageState(page: Page, testName: string): Promise<void> {
  try {
    // Take screenshot
    await page.screenshot({
      path: `test-results/${testName}-${Date.now()}.png`,
      fullPage: true,
    });

    // Log console errors
    const logs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*'))
        .filter((el) => el.textContent?.includes('Error') || el.textContent?.includes('error'))
        .map((el) => el.textContent)
        .slice(0, 5); // Limit to first 5 errors
    });

    if (logs.length > 0) {
      console.log('Page errors found:', logs);
    }

    // Log network failures
    const url = page.url();
    console.log(`Page state captured for ${testName} at ${url}`);
  } catch (error) {
    console.error('Error capturing page state:', error);
  }
}
