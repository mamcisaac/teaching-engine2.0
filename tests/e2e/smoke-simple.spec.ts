import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

test.describe('Simple Smoke Tests', () => {
  test('can access the main page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load - look for any visible text
    await page.waitForLoadState('domcontentloaded');

    // Check that we got a response (not an error page)
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`Page title: ${title}`);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/smoke-main-page.png' });
  });

  test('API health endpoint works', async ({ page }) => {
    // Debug API_BASE
    console.log(`Testing API health at: ${API_BASE}/api/health`);

    // Use page.request for explicit API calls
    const response = await page.request.get(`${API_BASE}/api/health`);

    if (!response.ok()) {
      const text = await response.text();
      console.log(`Health check returned non-200: ${response.status()} - ${text}`);
    }

    // Health endpoint should respond (even if degraded during startup)
    expect([200, 503]).toContain(response.status());

    const data = await response.json();
    // During startup, the server might be degraded due to initial errors
    // but it should still have a valid status
    expect(['ok', 'degraded']).toContain(data.status);

    // Verify it's a proper health response
    expect(data).toHaveProperty('healthy');
  });

  test('can create a test user via API', async ({ request }) => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Test User',
    };

    const response = await request.post(`${API_BASE}/api/register`, {
      data: testUser,
    });

    if (!response.ok()) {
      const errorText = await response.text();
      console.log(`Registration failed: ${response.status()} - ${errorText}`);
    }

    expect(response.ok()).toBeTruthy();

    const userData = await response.json();
    expect(userData.user).toBeTruthy();
    expect(userData.user.email).toBe(testUser.email);
  });

  test('can login with test user', async ({ request }) => {
    // Use the default test user from seed
    const loginData = {
      email: 'teacher@example.com',
      password: 'Password123!',
    };

    const response = await request.post(`${API_BASE}/api/login`, {
      data: loginData,
    });

    if (!response.ok()) {
      const errorText = await response.text();
      console.log(`Login failed: ${response.status()} - ${errorText}`);
    }

    expect(response.ok()).toBeTruthy();

    const userData = await response.json();
    expect(userData.token).toBeTruthy();
    expect(userData.user).toBeTruthy();
    expect(userData.user.email).toBe(loginData.email);
  });
});
