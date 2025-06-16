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
    // Wait for the server to be ready with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 30; // Wait up to 30 seconds

    while (retryCount < maxRetries) {
      try {
        response = await page.request.post('http://localhost:3000/api/login', {
          data: {
            email: 'teacher@example.com',
            password: 'password123',
          },
        });
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw new Error(`Server not available after ${maxRetries} attempts: ${error}`);
        }
        console.log(`Login attempt ${retryCount} failed, retrying in 1 second...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (response.ok()) {
      const loginData = await response.json();
      console.log('Login successful, setting up auth state');

      // Navigate to the app and set the token in localStorage
      await page.goto('http://localhost:5173/');
      await page.evaluate((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('onboarded', 'true');
      }, loginData);

      // Save the authentication state including localStorage
      await context.storageState({ path: 'tests/storage/auth.json' });
    } else {
      let errorBody = 'Unable to read response body';
      try {
        errorBody = await response.text();
      } catch (bodyError) {
        console.warn('Could not read response body:', bodyError);
        errorBody = `Protocol error: ${bodyError}`;
      }
      throw new Error(`Login failed with status: ${response.status()}: ${errorBody}`);
    }
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
