import { chromium } from '@playwright/test';

// Type declarations for global variables
declare global {
  // eslint-disable-next-line no-var
  var __TEST_SERVER_URL__: string;
  // eslint-disable-next-line no-var
  var __E2E_TEST_USER__: {
    email: string;
    password: string;
    token: string;
  };
}

/**
 * Wait for server to be ready with exponential backoff
 */
async function waitForServer(url: string, maxRetries = 30): Promise<void> {
  console.log(`Waiting for server at ${url} to be ready...`);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' || data.status === 'healthy') {
          console.log('✅ Server is ready!');
          return;
        }
      }
    } catch (error) {
      // Server not ready yet
    }

    const delay = Math.min(1000 * Math.pow(1.5, i), 5000); // Exponential backoff, max 5s
    console.log(`Server not ready, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error(`Server failed to start after ${maxRetries} attempts`);
}

/**
 * Create E2E test users via API
 */
async function createE2ETestUsers(serverUrl: string): Promise<void> {
  console.log('Creating E2E test users...');

  // Default test user for E2E tests
  const testUser = {
    email: 'e2e-teacher@example.com',
    password: 'e2e-password-123',
    name: 'E2E Test Teacher',
    role: 'teacher',
  };

  try {
    // First, try to create the user via test endpoint
    const createResponse = await fetch(`${serverUrl}/api/test/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (!createResponse.ok) {
      // If user already exists, that's fine
      const error = await createResponse.text();
      if (!error.includes('already exists')) {
        throw new Error(`Failed to create test user: ${error}`);
      }
      console.log('Test user already exists, continuing...');
    } else {
      console.log('✅ Test user created successfully');
    }

    // Now login to get a token
    const loginResponse = await fetch(`${serverUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Failed to login test user: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();

    // Store test user info globally
    global.__E2E_TEST_USER__ = {
      email: testUser.email,
      password: testUser.password,
      token: loginData.token,
    };

    console.log('✅ Test user logged in successfully');
  } catch (error) {
    console.error('Failed to create E2E test users:', error);
    throw error;
  }
}

/**
 * Global setup for E2E tests
 */
export default async function globalSetup() {
  console.log('\n🚀 Starting E2E global setup...\n');

  // Use the server URL from environment or default
  const serverUrl = process.env.VITE_API_URL || 'http://localhost:3000';

  try {
    // Store server URL globally
    global.__TEST_SERVER_URL__ = serverUrl;

    console.log(`✅ Using server at: ${serverUrl}`);

    // Wait for server to be fully ready (started by webServer config)
    await waitForServer(serverUrl);

    // Create test users
    await createE2ETestUsers(serverUrl);

    // Set up authentication state for Playwright
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to the app
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      await page.goto(clientUrl);

      // Set authentication data in localStorage
      await page.evaluate((userData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('auth-token', userData.token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            email: userData.email,
            name: 'E2E Test Teacher',
            role: 'teacher',
          }),
        );
        localStorage.setItem('onboarded', 'true');
      }, global.__E2E_TEST_USER__);

      // Save the authentication state
      await context.storageState({ path: 'tests/storage/auth.json' });
      console.log('✅ Authentication state saved');
    } finally {
      await browser.close();
    }

    console.log('\n✅ E2E global setup complete\n');
  } catch (error) {
    console.error('❌ E2E global setup failed:', error);
    throw error;
  }
}
