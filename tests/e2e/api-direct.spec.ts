import { test, expect } from '@playwright/test';

test.describe('Direct API Tests', () => {
  test('can access backend health endpoint directly', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('can login to backend API directly', async ({ request }) => {
    const loginData = {
      email: 'teacher@example.com',
      password: 'Password123!'
    };

    const response = await request.post('http://localhost:3000/api/login', {
      data: loginData
    });

    expect(response.ok()).toBeTruthy();
    
    const userData = await response.json();
    expect(userData.token).toBeTruthy();
    expect(userData.user).toBeTruthy();
    expect(userData.user.email).toBe(loginData.email);
  });

  test('can create user via backend API directly', async ({ request }) => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPass123!',
      name: 'API Test User'
    };

    const response = await request.post('http://localhost:3000/api/register', {
      data: testUser
    });

    expect(response.ok()).toBeTruthy();
    
    const userData = await response.json();
    expect(userData.user).toBeTruthy();
    expect(userData.user.email).toBe(testUser.email);
    expect(userData.token).toBeTruthy();
  });

  test('can access protected endpoint with token', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post('http://localhost:3000/api/login', {
      data: {
        email: 'teacher@example.com',
        password: 'Password123!'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();

    // Then access protected endpoint
    const meResponse = await request.get('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(meResponse.ok()).toBeTruthy();
    const userData = await meResponse.json();
    expect(userData.email).toBe('teacher@example.com');
  });
});