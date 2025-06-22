/**
 * Basic Health Check E2E Test
 * Minimal test to verify E2E setup is working
 */
import { test, expect } from '@playwright/test';

test.setTimeout(10000); // 10 seconds timeout

test.describe('Basic Health Check', () => {
  test('API health check', async ({ request }) => {
    console.log('Testing API health endpoint...');
    const response = await request.get('http://127.0.0.1:3000/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
    console.log('API health check passed');
  });

  test('Client loads', async ({ page }) => {
    console.log('Testing client loads...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    // Just check that the page has some content
    const title = await page.title();
    console.log('Page title:', title);
    expect(title).toBeTruthy();
    console.log('Client load test passed');
  });
});
