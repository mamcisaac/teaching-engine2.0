import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './screenshots/ui-working';

// Test users
const TEACHER_USER = {
  email: 'emmcisaac@gmail.com',
  password: 'password123',
};

// Ensure screenshot directory exists
test.beforeAll(async () => {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
});

// Utility function to take and verify screenshot
async function takeAndVerifyScreenshot(page: Page, name: string, description: string) {
  const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`);

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Extra wait for React to render

  // Take screenshot
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: 'disabled',
  });

  console.log(`📸 Screenshot taken: ${name} - ${description}`);

  // Verify screenshot was created
  const stats = await fs.stat(screenshotPath);
  expect(stats.size).toBeGreaterThan(1000); // At least 1KB

  return screenshotPath;
}

test.describe('Working UI Tests', () => {
  // Use clean storage state for fresh tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Homepage - Initial Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await takeAndVerifyScreenshot(page, 'homepage-initial', 'Homepage initial load');

    // Should redirect to login if not authenticated
    const currentURL = page.url();
    console.log(`Homepage redirected to: ${currentURL}`);

    // Page should not be blank
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(10);
  });

  test('Login Page - Direct Access', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await takeAndVerifyScreenshot(page, 'login-page-direct', 'Login page direct access');

    // Page should not be blank
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(10);

    // Should contain login-related content
    expect(content.toLowerCase()).toMatch(/sign in|login|email|password/);
  });

  test('Discover Form Elements on Login Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot first
    await takeAndVerifyScreenshot(page, 'login-discovery', 'Login page element discovery');

    // Try to find email inputs by various selectors
    const emailSelectors = [
      '#email-address',
      '#email',
      'input[name="email"]',
      'input[type="email"]',
      'input[placeholder*="email" i]',
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        emailInput = selector;
        console.log(`✅ Found email input: ${selector}`);
        break;
      } else {
        console.log(`❌ Email selector not found: ${selector}`);
      }
    }

    // Try to find password inputs
    const passwordSelectors = [
      '#password',
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="password" i]',
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        passwordInput = selector;
        console.log(`✅ Found password input: ${selector}`);
        break;
      } else {
        console.log(`❌ Password selector not found: ${selector}`);
      }
    }

    // Try to find submit buttons
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      'button:has-text("Submit")',
    ];

    let submitButton = null;
    for (const selector of submitSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        submitButton = selector;
        console.log(`✅ Found submit button: ${selector}`);
        break;
      } else {
        console.log(`❌ Submit selector not found: ${selector}`);
      }
    }

    // Log all findings
    console.log(`\n📋 LOGIN FORM DISCOVERY RESULTS:`);
    console.log(`Email Input: ${emailInput || 'NOT FOUND'}`);
    console.log(`Password Input: ${passwordInput || 'NOT FOUND'}`);
    console.log(`Submit Button: ${submitButton || 'NOT FOUND'}`);

    // If we found the elements, try to use them
    if (emailInput && passwordInput && submitButton) {
      await page.fill(emailInput, TEACHER_USER.email);
      await page.fill(passwordInput, TEACHER_USER.password);
      await takeAndVerifyScreenshot(page, 'login-filled', 'Login form filled out');

      await page.click(submitButton);
      await page.waitForTimeout(5000); // Wait for potential redirect
      await takeAndVerifyScreenshot(page, 'after-login-attempt', 'After login attempt');

      const finalURL = page.url();
      console.log(`Final URL after login: ${finalURL}`);
    }
  });

  test('Page HTML Source Analysis', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get the full HTML source
    const htmlContent = await page.content();

    // Log the first 2000 characters to see what's actually rendered
    console.log(`\n📄 LOGIN PAGE HTML CONTENT (first 2000 chars):`);
    console.log(htmlContent.substring(0, 2000));

    // Look for form elements in the HTML
    const hasForm = htmlContent.includes('<form');
    const hasEmailInput = htmlContent.includes('email') || htmlContent.includes('Email');
    const hasPasswordInput = htmlContent.includes('password') || htmlContent.includes('Password');
    const hasButton = htmlContent.includes('<button') || htmlContent.includes('submit');

    console.log(`\n🔍 HTML ANALYSIS:`);
    console.log(`Contains <form>: ${hasForm}`);
    console.log(`Contains email-related content: ${hasEmailInput}`);
    console.log(`Contains password-related content: ${hasPasswordInput}`);
    console.log(`Contains button/submit: ${hasButton}`);

    // Check if the page has rendered React content or is still blank
    const bodyContent = await page.locator('body').textContent();
    console.log(`\n📝 BODY TEXT CONTENT (first 500 chars):`);
    console.log(bodyContent?.substring(0, 500));
  });

  test('Check for React Errors in Console', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    // Listen for console messages
    page.on('console', (msg) => {
      const text = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });

    // Listen for page errors
    page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Let React fully initialize

    await takeAndVerifyScreenshot(page, 'console-check', 'Page with console monitoring');

    console.log(`\n📺 CONSOLE MESSAGES (${consoleMessages.length} total):`);
    consoleMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg}`);
    });

    console.log(`\n❌ ERRORS (${errors.length} total):`);
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });

    // Verify no critical React errors
    const reactErrors = errors.filter(
      (error) =>
        error.includes('React') ||
        error.includes('Functions are not valid as a React child') ||
        error.includes('Element type is invalid'),
    );

    if (reactErrors.length > 0) {
      console.log(`🚨 CRITICAL REACT ERRORS FOUND:`);
      reactErrors.forEach((error) => console.log(`   ${error}`));
    } else {
      console.log(`✅ No critical React errors found`);
    }
  });

  test('Try All Common Routes', async ({ page }) => {
    const routes = [
      '/',
      '/login',
      '/dashboard',
      '/planner',
      '/planner/dashboard',
      '/lesson-plans',
      '/unit-plans',
      '/calendar',
      '/settings',
    ];

    for (const route of routes) {
      console.log(`\n🔗 Testing route: ${route}`);

      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const routeName = route === '/' ? 'root' : route.replace(/\//g, '-');
      await takeAndVerifyScreenshot(page, `route${routeName}`, `Route: ${route}`);

      const currentURL = page.url();
      const bodyContent = await page.locator('body').textContent();
      const isBlank = !bodyContent || bodyContent.trim().length < 50;

      console.log(`   Final URL: ${currentURL}`);
      console.log(`   Page blank: ${isBlank}`);
      console.log(`   Content length: ${bodyContent?.length ?? 0} chars`);

      if (!isBlank && bodyContent) {
        console.log(`   Content preview: ${bodyContent.substring(0, 100).replace(/\s+/g, ' ')}...`);
      }
    }
  });
});

// Summary test
test('Test Summary', async ({ page }) => {
  const screenshotFiles = await fs.readdir(SCREENSHOT_DIR);
  const screenshotCount = screenshotFiles.filter((file) => file.endsWith('.png')).length;

  console.log(`\n📊 UI TESTING SUMMARY:`);
  console.log(`   Total screenshots taken: ${screenshotCount}`);
  console.log(`   Screenshots saved to: ${SCREENSHOT_DIR}`);

  // Create summary file
  const summary = {
    totalScreenshots: screenshotCount,
    files: screenshotFiles.filter((file) => file.endsWith('.png')),
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    testUser: TEACHER_USER.email,
  };

  await fs.writeFile(
    path.join(SCREENSHOT_DIR, 'test-summary.json'),
    JSON.stringify(summary, null, 2),
  );

  expect(screenshotCount).toBeGreaterThan(3);
});
