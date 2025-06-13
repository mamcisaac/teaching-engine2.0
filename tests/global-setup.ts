import { chromium } from '@playwright/test';
import baseSetup from '../playwright.global-setup';
export default async function globalSetup() {
  await baseSetup();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', 'teacher@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
  await page.context().storageState({ path: 'tests/storage/auth.json' });
  await browser.close();
}
