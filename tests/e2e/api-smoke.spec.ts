import { test, expect } from '@playwright/test';

test.describe('API Smoke Tests', () => {
  test('health check endpoint works', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('login endpoint works', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        email: 'teacher@example.com',
        password: 'password123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.token).toBeTruthy();
    expect(data.user).toBeTruthy();
  });

  test('authenticated request works', async ({ request }) => {
    // First login
    const loginResponse = await request.post('/api/login', {
      data: {
        email: 'teacher@example.com',
        password: 'password123',
      },
    });

    const { token } = await loginResponse.json();

    // Then make authenticated request
    const response = await request.get('/api/subjects', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const subjects = await response.json();
    expect(Array.isArray(subjects)).toBeTruthy();
  });
});
