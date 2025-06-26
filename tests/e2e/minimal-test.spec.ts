import { test, expect } from '@playwright/test';

test.describe('Minimal API Tests', () => {
  test('check health endpoint - should get JSON', async ({ request }) => {
    const response = await request.get('/health');
    console.log(`Health response status: ${response.status()}`);
    console.log(`Health response headers: ${JSON.stringify(response.headers())}`);
    
    const responseText = await response.text();
    console.log(`Health response body: ${responseText}`);
  });

  test('check API health endpoint - should get JSON', async ({ request }) => {
    try {
      const response = await request.get('/api/health');
      console.log(`API Health response status: ${response.status()}`);
      console.log(`API Health response headers: ${JSON.stringify(response.headers())}`);
      
      const responseText = await response.text();
      console.log(`API Health response body: ${responseText}`);
      
      if (response.ok()) {
        const data = JSON.parse(responseText);
        expect(data.status).toBe('ok');
      }
    } catch (error) {
      console.log(`API Health error: ${error}`);
    }
  });

  test('test direct API call to login', async ({ request }) => {
    const loginData = {
      email: 'teacher@example.com',
      password: 'Password123!'
    };

    console.log(`Attempting login with: ${JSON.stringify(loginData)}`);
    
    try {
      const response = await request.post('/api/login', {
        data: loginData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`Login response status: ${response.status()}`);
      console.log(`Login response headers: ${JSON.stringify(response.headers())}`);
      
      const responseText = await response.text();
      console.log(`Login response body: ${responseText}`);

      if (response.ok()) {
        const userData = JSON.parse(responseText);
        console.log(`Login successful! Token: ${userData.token ? 'present' : 'missing'}, User: ${userData.user ? 'present' : 'missing'}`);
        expect(userData.token).toBeTruthy();
        expect(userData.user).toBeTruthy();
      } else {
        console.log(`Login failed with status ${response.status()}: ${responseText}`);
      }
    } catch (error) {
      console.log(`Login error: ${error}`);
    }
  });
});