import { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'teacher@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Sign in")');
  // wait for navigation to complete
  await page.waitForLoadState('networkidle');
}
