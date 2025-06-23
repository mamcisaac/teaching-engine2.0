/**
 * Basic Health Check E2E Test
 * Minimal test to verify E2E setup is working
 */
import { test, expect } from '@playwright/test';

test.setTimeout(5000); // 5 seconds timeout per test

test.describe('Basic Health Check', () => {
  test('API health check', async ({ request }) => {
    console.log('Testing API health endpoint...');
    const response = await request.get('http://127.0.0.1:3000/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
    console.log('API health check passed');
  });

  test('Client responds', async ({ request }) => {
    console.log('Testing client responds...');
    // Just check if the client server responds with something
    const response = await request.get('http://localhost:5173');
    expect(response.ok()).toBeTruthy();
    console.log('Client responds check passed');
  });

  test('API auth endpoint exists', async ({ request }) => {
    console.log('Testing API auth endpoint...');
    // Just check if the login endpoint exists (don't actually login)
    const response = await request.post('http://127.0.0.1:3000/api/login', {
      data: { email: 'test@test.com', password: 'test' },
    });
    // We expect either 401 (unauthorized) or 200 (if test user exists)
    expect([200, 401, 400].includes(response.status())).toBeTruthy();
    console.log('API auth endpoint exists');
  });
});
