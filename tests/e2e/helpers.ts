import { Page } from '@playwright/test';

/**
 * Authenticate using the API and initialize local storage for the UI.
 * Returns the auth token for subsequent API requests.
 */
export async function login(page: Page): Promise<string> {
  const res = await page.request.post('http://localhost:3001/api/login', {
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
