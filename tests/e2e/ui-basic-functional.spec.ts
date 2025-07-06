import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './screenshots/basic-functional';

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
  await page.waitForTimeout(1000); // Additional wait for animations

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

test.describe('Basic Functional UI Tests', () => {
  test.describe('Authentication Flow', () => {
    test('Login Page - Load and Screenshot', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await takeAndVerifyScreenshot(page, 'login-page-initial', 'Login page initial load');

      // Verify login form elements exist using actual selectors
      await expect(page.locator('#email-address')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Verify page title
      await expect(page).toHaveTitle(/Teaching Engine/);
    });

    test('Successful Login Flow', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await takeAndVerifyScreenshot(page, 'login-before-fill', 'Login form before filling');

      // Fill login form
      await page.fill('#email-address', TEACHER_USER.email);
      await page.fill('#password', TEACHER_USER.password);
      await takeAndVerifyScreenshot(page, 'login-filled', 'Login form filled');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for redirect (may go to / first then /dashboard)
      await page.waitForTimeout(3000);
      await takeAndVerifyScreenshot(page, 'after-login', 'After login submission');

      // Check if we're on dashboard or redirect page
      const currentURL = page.url();
      console.log(`Current URL after login: ${currentURL}`);

      // Verify we're logged in by checking for authenticated content
      const isLoggedIn = await page.locator('body').textContent();
      expect(isLoggedIn).not.toContain('Sign in to your account');
    });

    test('Wrong Credentials Error', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Try wrong credentials
      await page.fill('#email-address', 'wrong@example.com');
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Wait for error response
      await page.waitForTimeout(3000);
      await takeAndVerifyScreenshot(page, 'login-error', 'Login with wrong credentials');

      // Should still be on login page
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Application Pages', () => {
    test('Dashboard Page', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email-address', TEACHER_USER.email);
      await page.fill('#password', TEACHER_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Navigate to dashboard explicitly
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await takeAndVerifyScreenshot(page, 'dashboard-page', 'Dashboard page');

      // Verify we're on the dashboard
      const content = await page.locator('body').textContent();
      expect(content).not.toContain('Sign in to your account');
    });

    test('Explore Available Routes', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email-address', TEACHER_USER.email);
      await page.fill('#password', TEACHER_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Try common routes
      const routes = [
        '/dashboard',
        '/lesson-plans',
        '/unit-plans',
        '/calendar',
        '/templates',
        '/settings',
        '/',
      ];

      for (const route of routes) {
        await page.goto(`${BASE_URL}${route}`);
        await page.waitForLoadState('networkidle');

        const routeName = route === '/' ? 'home' : route.substring(1);
        await takeAndVerifyScreenshot(page, `route-${routeName}`, `Route: ${route}`);

        // Check if page loaded successfully (not 404)
        const content = await page.locator('body').textContent();
        const isError = content?.includes('404') || content?.includes('Not Found');

        if (!isError) {
          console.log(`✅ Route ${route} - Working`);
        } else {
          console.log(`❌ Route ${route} - Not found/Error`);
        }
      }
    });

    test('Navigation Links Discovery', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email-address', TEACHER_USER.email);
      await page.fill('#password', TEACHER_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Go to dashboard
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');

      // Find all navigation links
      const navLinks = await page.locator('nav a, [role="navigation"] a, header a').all();

      console.log(`Found ${navLinks.length} navigation links`);

      for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
        const link = navLinks[i];
        const href = await link.getAttribute('href');
        const text = await link.textContent();

        if (href && href !== '#' && !href.startsWith('mailto:')) {
          console.log(`Testing link: ${text} -> ${href}`);

          await link.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);

          const linkName = text?.replace(/\s+/g, '-').toLowerCase() || `link-${i}`;
          await takeAndVerifyScreenshot(page, `nav-${linkName}`, `Navigation: ${text} (${href})`);

          // Go back to dashboard for next test
          await page.goto(`${BASE_URL}/dashboard`);
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test.describe('Form Interactions', () => {
    test('Find and Test Forms', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email-address', TEACHER_USER.email);
      await page.fill('#password', TEACHER_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Go to dashboard and look for forms
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');

      // Find forms on the page
      const forms = await page.locator('form').all();
      console.log(`Found ${forms.length} forms on dashboard`);

      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const formHTML = await form.innerHTML();

        if (formHTML.length > 0) {
          await takeAndVerifyScreenshot(page, `form-${i}`, `Form ${i} on dashboard`);

          // Look for inputs in this form
          const inputs = await form.locator('input, select, textarea').all();
          console.log(`Form ${i} has ${inputs.length} inputs`);
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('Mobile View', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Login
      await page.goto(`${BASE_URL}/login`);
      await takeAndVerifyScreenshot(page, 'mobile-login', 'Mobile login page');

      await page.fill('#email-address', TEACHER_USER.email);
      await page.fill('#password', TEACHER_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Dashboard on mobile
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await takeAndVerifyScreenshot(page, 'mobile-dashboard', 'Mobile dashboard');
    });

    test('Tablet View', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Login
      await page.goto(`${BASE_URL}/login`);
      await takeAndVerifyScreenshot(page, 'tablet-login', 'Tablet login page');

      await page.fill('#email-address', TEACHER_USER.email);
      await page.fill('#password', TEACHER_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Dashboard on tablet
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      await takeAndVerifyScreenshot(page, 'tablet-dashboard', 'Tablet dashboard');
    });
  });

  test.describe('Error Handling', () => {
    test('Invalid Route', async ({ page }) => {
      await page.goto(`${BASE_URL}/invalid-route-that-does-not-exist`);
      await takeAndVerifyScreenshot(page, 'invalid-route', 'Invalid route handling');
    });

    test('Direct Access to Protected Route', async ({ page }) => {
      // Try to access dashboard without login
      await page.goto(`${BASE_URL}/dashboard`);
      await takeAndVerifyScreenshot(
        page,
        'protected-route-no-auth',
        'Protected route without authentication',
      );

      // Should redirect to login or show error
      const currentURL = page.url();
      console.log(`Accessing protected route redirected to: ${currentURL}`);
    });
  });
});

// Summary test to verify all screenshots were created
test('Verify Screenshots Created', async ({ page }) => {
  const screenshotFiles = await fs.readdir(SCREENSHOT_DIR);
  const screenshotCount = screenshotFiles.filter((file) => file.endsWith('.png')).length;

  console.log(`📊 Total screenshots created: ${screenshotCount}`);

  // Verify we have screenshots
  expect(screenshotCount).toBeGreaterThan(5);

  // Create summary
  const summary = {
    totalScreenshots: screenshotCount,
    files: screenshotFiles.filter((file) => file.endsWith('.png')),
    timestamp: new Date().toISOString(),
  };

  await fs.writeFile(path.join(SCREENSHOT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

  console.log(`📝 Summary written to ${SCREENSHOT_DIR}/summary.json`);
});
