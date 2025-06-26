import { test, expect } from '@playwright/test';

test.describe('CI-Ready E2E Tests', () => {
  test.beforeAll(async () => {
    // Wait for backend to be ready
    let retries = 30;
    while (retries > 0) {
      try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
          console.log('✅ Backend is ready');
          break;
        }
      } catch (error) {
        // Backend not ready yet
      }
      
      retries--;
      if (retries === 0) {
        throw new Error('Backend did not start within 30 seconds');
      }
      
      console.log(`⏳ Waiting for backend... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  test('health check', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('user registration and login flow', async ({ request }) => {
    // Create a unique test user
    const testUser = {
      email: `ci-test-${Date.now()}@example.com`,
      password: 'CITest123!',
      name: 'CI Test User'
    };

    // Register user
    const registerResponse = await request.post('http://localhost:3000/api/register', {
      data: testUser
    });

    expect(registerResponse.ok()).toBeTruthy();
    const registerData = await registerResponse.json();
    expect(registerData.user.email).toBe(testUser.email);
    expect(registerData.token).toBeTruthy();

    // Login with same user
    const loginResponse = await request.post('http://localhost:3000/api/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.user.email).toBe(testUser.email);
    expect(loginData.token).toBeTruthy();
  });

  test('protected endpoints require authentication', async ({ request }) => {
    // Try to access protected endpoint without token
    const unauthorizedResponse = await request.get('http://localhost:3000/api/auth/me');
    expect(unauthorizedResponse.status()).toBe(401);

    // Login to get token
    const loginResponse = await request.post('http://localhost:3000/api/login', {
      data: {
        email: 'teacher@example.com',
        password: 'Password123!'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const { token } = await loginResponse.json();

    // Access protected endpoint with token
    const authorizedResponse = await request.get('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(authorizedResponse.ok()).toBeTruthy();
    const userData = await authorizedResponse.json();
    expect(userData.email).toBe('teacher@example.com');
  });

  test('frontend loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for frontend to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check page title
    const title = await page.title();
    expect(title).toBe('Curriculum Planner');
    
    // Check that main content is visible (may require login)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent.length).toBeGreaterThan(0);
  });

  test('API proxy through frontend works', async ({ page }) => {
    // This tests the Vite proxy configuration
    await page.goto('/');
    
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/health/services');
        return {
          ok: res.ok,
          status: res.status,
          data: await res.json()
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message
        };
      }
    });

    // The proxy should forward to the backend
    expect(response.ok).toBeTruthy();
  });
});