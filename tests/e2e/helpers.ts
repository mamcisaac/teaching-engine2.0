import { Page } from '@playwright/test';

// Base URL for all API requests used in the e2e tests.
export const API_BASE = 'http://localhost:3001';

/**
 * Authenticate using the API and initialize local storage for the UI.
 * Returns the auth token for subsequent API requests.
 */
/**
 * Logs in via the backend API and seeds the browser's local storage so the
 * frontend treats the user as authenticated.
 *
 * The function waits for the API server to become available before sending the
 * login request. It throws a descriptive error if the login fails.
 */
export async function login(page: Page): Promise<string> {
  // Poll the health endpoint until the API responds
  for (let i = 0; i < 40; i++) {
    try {
      const resp = await page.request.get(`${API_BASE}/api/health`);
      if (resp.ok()) break;
    } catch {
      // ignore connection errors while the server starts
    }
    await page.waitForTimeout(500);
  }

  const res = await page.request.post(`${API_BASE}/api/login`, {
    data: { email: 'teacher@example.com', password: 'password123' },
  });

  if (!res.ok()) {
    throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
  }

  const { token, user } = (await res.json()) as {
    token: string;
    user: unknown;
  };

  await page.addInitScript(
    ({ t, u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('onboarded', 'true');
    },
    { t: token, u: user },
  );

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  return token;
}
