import { chromium } from '@playwright/test';
import baseSetup from '../playwright.global-setup';
export default async function globalSetup() {
  await baseSetup();

  // For now, let's manually create the auth state by making a login API call
  // This bypasses the problematic UI login that's having issues with 401 errors
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Make direct API call to login endpoint
    const response = await page.request.post('http://localhost:3001/api/login', {
      data: {
        email: 'teacher@example.com',
        password: 'password123',
      },
    });

    if (response.ok()) {
      const loginData = await response.json();
      console.log('Login successful, setting up auth state');

      // Navigate to the app and set the token in localStorage
      await page.goto('http://localhost:5173/');
      await page.evaluate((token) => {
        localStorage.setItem('auth-token', token);
      }, loginData.token);

      // Save the authentication state including localStorage
      await context.storageState({ path: 'tests/storage/auth.json' });
    } else {
      throw new Error(`Login failed with status: ${response.status()}`);
    }
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
