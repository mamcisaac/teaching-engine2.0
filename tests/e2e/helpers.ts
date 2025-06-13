import { Page } from '@playwright/test';

export const API_BASE = 'http://localhost:3001';

/**
 * Authenticate using the API and initialize local storage for the UI.
 * Returns the auth token for subsequent API requests.
 */
export async function login(page: Page): Promise<string> {
  // Wait for the API to be reachable
  for (let i = 0; i < 20; i++) {
    const resp = await page.request.get(`${API_BASE}/api/health`);
    if (resp.ok()) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  const res = await page.request.post(`${API_BASE}/api/login`, {
    data: { email: 'teacher@example.com', password: 'password123' },
  });
  const { token, user } = (await res.json()) as { token: string; user: unknown };

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
