import { chromium } from '@playwright/test';

export default async function globalSetup() {

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
            email: 'teacher@test.com',
            password: 'password123', // Match seed data
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

      // Set up localStorage before navigation using addInitScript
      await page.addInitScript((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('onboarded', 'true');
      }, loginData);

      // In CI, we don't need to navigate to the app since servers aren't started yet
      // Just save the auth state with the token
      if (!process.env.CI) {
        // Navigate to the app - localStorage will be set automatically
        await page.goto('http://localhost:5173/');
        await page.waitForTimeout(1000); // Give time for any redirects to settle
      }

      // Save the authentication state including localStorage
      await context.storageState({ path: 'tests/storage/auth.json' });

      // Store the test user globally for use in tests
      (global as unknown as { __E2E_TEST_USER__: unknown }).__E2E_TEST_USER__ = {
        email: 'teacher@example.com',
        password: 'Password123!', // Meets security requirements
        token: loginData.token,
        user: loginData.user,
      };
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
