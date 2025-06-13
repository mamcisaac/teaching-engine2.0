import { Page } from '@playwright/test';

/**
 * Log in via the UI and return the auth token for API requests.
 * Also marks onboarding complete.
 */
export async function login(page: Page): Promise<string> {
  await page.addInitScript(() => localStorage.setItem('onboarded', 'true'));
  await page.goto('/login');
  await page.fill('input[name="email"]', 'teacher@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Sign in")');
  await page.waitForLoadState('networkidle');
  return (await page.evaluate(() => localStorage.getItem('token'))) ?? '';
}
