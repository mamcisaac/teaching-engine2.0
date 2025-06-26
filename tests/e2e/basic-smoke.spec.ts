import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
  test('can access the main page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check that we got a response
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('API health endpoint works', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/health');
    
    // Health endpoint should respond
    expect([200, 503]).toContain(response.status());
    
    const data = await response.json();
    expect(['ok', 'degraded']).toContain(data.status);
    expect(data).toHaveProperty('healthy');
  });
});