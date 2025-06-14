import { chromium } from '@playwright/test';
import baseSetup from '../playwright.global-setup';
export default async function globalSetup() {
  await baseSetup();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for console errors to debug issues
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });

    // Wait for the page to load and check if we're on the login page
    await page.waitForLoadState('domcontentloaded');

    // Try different selectors that might work
    const emailSelector = await Promise.race([
      page.waitForSelector('input[name="email"]', { timeout: 10000 }).catch(() => null),
      page.waitForSelector('input[type="email"]', { timeout: 10000 }).catch(() => null),
      page.waitForSelector('#email-address', { timeout: 10000 }).catch(() => null),
    ]);

    if (!emailSelector) {
      // Take a screenshot for debugging
      await page.screenshot({ path: 'login-debug.png' });
      const content = await page.content();
      console.log('Page content:', content.substring(0, 1000));
      throw new Error('Could not find email input field');
    }

    const passwordSelector = await Promise.race([
      page.waitForSelector('input[name="password"]', { timeout: 5000 }).catch(() => null),
      page.waitForSelector('input[type="password"]', { timeout: 5000 }).catch(() => null),
      page.waitForSelector('#password', { timeout: 5000 }).catch(() => null),
    ]);

    if (!passwordSelector) {
      throw new Error('Could not find password input field');
    }

    await page.fill('input[name="email"]', 'teacher@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.context().storageState({ path: 'tests/storage/auth.json' });
  } finally {
    await browser.close();
  }
}
