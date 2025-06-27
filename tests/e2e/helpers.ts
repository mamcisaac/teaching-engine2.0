import { Page } from '@playwright/test';

export const API_BASE = 'http://127.0.0.1:3000';

/**
 * Authenticate using the API and initialize local storage for the UI.
 * Returns the auth token for subsequent API requests.
 */
export async function login(page: Page): Promise<string> {
  // Wait for both API and frontend to be reachable
  console.log('Waiting for API and frontend to be ready...');
  for (let i = 0; i < 30; i++) {
    try {
      const [apiResp, frontendResp] = await Promise.all([
        page.request.get(`${API_BASE}/api/health`),
        page.request.get('http://localhost:5173'),
      ]);
      if (apiResp.ok() && frontendResp.ok()) {
        console.log('Both API and frontend are ready');
        break;
      }
    } catch (error) {
      console.log(`Health check attempt ${i + 1} failed:`, error);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const res = await page.request.post(`${API_BASE}/api/login`, {
    data: { email: 'teacher@example.com', password: 'Password123!' },
  });

  if (!res.ok()) {
    let errorBody = 'Unable to read response body';
    try {
      errorBody = await res.text();
    } catch (bodyError) {
      console.warn('Could not read response body:', bodyError);
      errorBody = `Protocol error: ${bodyError}`;
    }
    throw new Error(`Login failed with status ${res.status()}: ${errorBody}`);
  }

  const { token, user } = (await res.json()) as { token: string; user: unknown };

  // Set initial script to run before page loads
  await page.addInitScript(
    ({ t, u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('auth-token', t);
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('onboarded', 'true');
    },
    { t: token, u: user },
  );

  // Navigate to home page with more reliable wait strategy
  await page.goto('/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  // Wait for the page to be fully loaded and check for auth state
  await page.waitForLoadState('load');

  // Give React time to hydrate and initialize
  await page.waitForLoadState('networkidle', { timeout: 5000 });

  // Verify token is set in localStorage
  const storedToken = await page.evaluate(() => localStorage.getItem('token'));
  if (!storedToken) {
    throw new Error('Token not found in localStorage after login');
  }

  // Wait for any potential redirects or authentication checks
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

  return token;
}
