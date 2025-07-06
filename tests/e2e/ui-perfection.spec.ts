import { test, expect, Page, Browser } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = './screenshots/ui-perfection';

// Test users
const TEACHER_USER = {
  email: 'emmcisaac@gmail.com',
  password: 'password123',
};

const TEST_USER = {
  email: 'teacher@example.com',
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

// Utility function to login via UI
async function loginViaUI(page: Page, user: typeof TEACHER_USER) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Fill login form using actual IDs
  await page.fill('#email-address', user.email);
  await page.fill('#password', user.password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for successful login - app redirects to root then dashboard
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
}

test.describe('UI Perfection Test Suite', () => {
  test.describe('Authentication Flow', () => {
    test('Login Page - Initial Load', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await takeAndVerifyScreenshot(page, 'login-page-initial', 'Login page initial load');

      // Verify login form elements exist using actual selectors
      await expect(page.locator('#email-address')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Verify page title and content
      await expect(page).toHaveTitle(/Teaching Engine/);
      await expect(page.locator('h2')).toContainText(/Sign in/i);
    });

    test('Login Flow - Complete Journey', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Screenshot: Empty form
      await takeAndVerifyScreenshot(page, 'login-empty-form', 'Login form before filling');

      // Fill form gradually and take screenshots
      await page.fill('#email-address', TEACHER_USER.email);
      await takeAndVerifyScreenshot(page, 'login-email-filled', 'Login form with email filled');

      await page.fill('#password', TEACHER_USER.password);
      await takeAndVerifyScreenshot(page, 'login-form-complete', 'Login form completely filled');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for redirect and screenshot
      await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
      await takeAndVerifyScreenshot(
        page,
        'login-success-redirect',
        'Successful login redirect to dashboard',
      );
    });

    test('Login Validation - Error States', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Test empty form submission
      await page.click('button[type="submit"]');
      await takeAndVerifyScreenshot(
        page,
        'login-validation-empty',
        'Login validation for empty form',
      );

      // Test invalid email
      await page.fill('#email-address', 'invalid-email');
      await page.click('button[type="submit"]');
      await takeAndVerifyScreenshot(
        page,
        'login-validation-invalid-email',
        'Login validation for invalid email',
      );

      // Test wrong credentials
      await page.fill('#email-address', 'wrong@example.com');
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      await takeAndVerifyScreenshot(
        page,
        'login-validation-wrong-credentials',
        'Login validation for wrong credentials',
      );
    });
  });

  test.describe('Dashboard and Navigation', () => {
    test('Dashboard - Initial Load', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);
      await takeAndVerifyScreenshot(
        page,
        'dashboard-initial',
        'Dashboard initial load after login',
      );

      // Verify dashboard elements exist using general selectors
      await expect(page.locator('h1')).toBeVisible(); // Main heading
      await expect(page.locator('main')).toBeVisible(); // Main content area
      await expect(page.locator('nav')).toBeVisible(); // Navigation
    });

    test('Navigation Menu - Available Links', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      // Test available navigation links by looking for actual hrefs
      const navLinks = await page.locator('nav a').all();

      for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
        const link = navLinks[i];
        const href = await link.getAttribute('href');
        if (href && href !== '#') {
          await link.click();
          await page.waitForLoadState('networkidle');
          await takeAndVerifyScreenshot(page, `nav-link-${i}`, `Navigation to ${href}`);

          // Go back to dashboard for next test
          await page.goto(`${BASE_URL}/dashboard`);
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test.describe('Lesson Planning Workflow', () => {
    test('Create New Lesson Plan - Complete Flow', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      // Navigate to lesson plans
      await page.click('[data-testid="nav-lesson-plans"]');
      await takeAndVerifyScreenshot(page, 'lesson-plans-list', 'Lesson plans list page');

      // Click create new lesson
      await page.click('[data-testid="create-lesson-button"]');
      await takeAndVerifyScreenshot(
        page,
        'lesson-create-form-empty',
        'Empty lesson plan creation form',
      );

      // Fill lesson plan form
      await page.fill('[data-testid="lesson-title"]', 'Test Mathematics Lesson');
      await page.selectOption('[data-testid="lesson-subject"]', 'Mathematics');
      await page.selectOption('[data-testid="lesson-grade"]', 'Grade 1');
      await takeAndVerifyScreenshot(
        page,
        'lesson-create-form-basic',
        'Lesson form with basic info filled',
      );

      // Add learning objectives
      await page.fill(
        '[data-testid="learning-objectives"]',
        'Students will be able to count to 10',
      );
      await takeAndVerifyScreenshot(
        page,
        'lesson-create-form-objectives',
        'Lesson form with objectives',
      );

      // Add activities
      await page.fill('[data-testid="lesson-activities"]', 'Counting games with manipulatives');
      await takeAndVerifyScreenshot(
        page,
        'lesson-create-form-activities',
        'Lesson form with activities',
      );

      // Add assessment
      await page.fill('[data-testid="lesson-assessment"]', 'Observe student counting accuracy');
      await takeAndVerifyScreenshot(
        page,
        'lesson-create-form-complete',
        'Complete lesson plan form',
      );

      // Save lesson
      await page.click('[data-testid="save-lesson-button"]');
      await page.waitForLoadState('networkidle');
      await takeAndVerifyScreenshot(
        page,
        'lesson-created-success',
        'Lesson plan created successfully',
      );
    });

    test('ETFO Lesson Planning - 5-Level Hierarchy', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      // Test Long Range Plans
      await page.click('[data-testid="nav-long-range-plans"]');
      await takeAndVerifyScreenshot(page, 'etfo-long-range-plans', 'ETFO Long Range Plans page');

      // Test Unit Plans
      await page.click('[data-testid="nav-unit-plans"]');
      await takeAndVerifyScreenshot(page, 'etfo-unit-plans', 'ETFO Unit Plans page');

      // Test Lesson Plans
      await page.click('[data-testid="nav-lesson-plans"]');
      await takeAndVerifyScreenshot(page, 'etfo-lesson-plans', 'ETFO Lesson Plans page');

      // Test Daybook Entries
      await page.click('[data-testid="nav-daybook"]');
      await takeAndVerifyScreenshot(page, 'etfo-daybook', 'ETFO Daybook Entries page');
    });
  });

  test.describe('Calendar and Planning', () => {
    test('Calendar View - All Views', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      await page.click('[data-testid="nav-calendar"]');
      await takeAndVerifyScreenshot(page, 'calendar-default-view', 'Calendar default view');

      // Test different calendar views
      const views = ['month', 'week', 'day'];
      for (const view of views) {
        await page.click(`[data-testid="calendar-view-${view}"]`);
        await takeAndVerifyScreenshot(page, `calendar-${view}-view`, `Calendar ${view} view`);
      }
    });

    test('Calendar Planning - Add Events', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      await page.click('[data-testid="nav-calendar"]');

      // Click on a calendar date to add event
      await page.click('[data-testid="calendar-date-cell"]');
      await takeAndVerifyScreenshot(page, 'calendar-add-event-modal', 'Add event modal opened');

      // Fill event details
      await page.fill('[data-testid="event-title"]', 'Math Test');
      await page.selectOption('[data-testid="event-type"]', 'assessment');
      await takeAndVerifyScreenshot(page, 'calendar-add-event-filled', 'Add event modal filled');

      // Save event
      await page.click('[data-testid="save-event-button"]');
      await takeAndVerifyScreenshot(page, 'calendar-event-added', 'Calendar with new event added');
    });
  });

  test.describe('Templates System', () => {
    test('Templates Library', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      await page.click('[data-testid="nav-templates"]');
      await takeAndVerifyScreenshot(page, 'templates-library', 'Templates library page');

      // Test template categories
      const categories = ['lesson-plans', 'unit-plans', 'assessments'];
      for (const category of categories) {
        await page.click(`[data-testid="template-category-${category}"]`);
        await takeAndVerifyScreenshot(
          page,
          `templates-${category}`,
          `Templates ${category} category`,
        );
      }
    });

    test('Create Custom Template', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      await page.click('[data-testid="nav-templates"]');
      await page.click('[data-testid="create-template-button"]');
      await takeAndVerifyScreenshot(page, 'template-create-form', 'Create template form');

      // Fill template details
      await page.fill('[data-testid="template-name"]', 'Custom Math Template');
      await page.selectOption('[data-testid="template-type"]', 'lesson-plan');
      await page.fill('[data-testid="template-description"]', 'Template for mathematics lessons');
      await takeAndVerifyScreenshot(page, 'template-create-filled', 'Create template form filled');

      // Save template
      await page.click('[data-testid="save-template-button"]');
      await takeAndVerifyScreenshot(
        page,
        'template-created-success',
        'Template created successfully',
      );
    });
  });

  test.describe('AI Features', () => {
    test('AI Activity Generator', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      // Navigate to AI features
      await page.click('[data-testid="nav-ai-tools"]');
      await takeAndVerifyScreenshot(page, 'ai-tools-page', 'AI tools page');

      // Test activity generator
      await page.click('[data-testid="ai-activity-generator"]');
      await takeAndVerifyScreenshot(page, 'ai-activity-generator', 'AI activity generator');

      // Fill generator inputs
      await page.selectOption('[data-testid="ai-subject"]', 'Mathematics');
      await page.selectOption('[data-testid="ai-grade"]', 'Grade 1');
      await page.fill('[data-testid="ai-topic"]', 'Addition');
      await takeAndVerifyScreenshot(
        page,
        'ai-generator-inputs-filled',
        'AI generator inputs filled',
      );

      // Generate activities
      await page.click('[data-testid="generate-activities-button"]');
      await page.waitForLoadState('networkidle');
      await takeAndVerifyScreenshot(page, 'ai-activities-generated', 'AI generated activities');
    });
  });

  test.describe('Settings and Profile', () => {
    test('User Profile Settings', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      await page.click('[data-testid="nav-settings"]');
      await takeAndVerifyScreenshot(page, 'settings-main', 'Settings main page');

      // Test profile settings
      await page.click('[data-testid="profile-settings-tab"]');
      await takeAndVerifyScreenshot(page, 'settings-profile', 'Profile settings page');

      // Test notification settings
      await page.click('[data-testid="notification-settings-tab"]');
      await takeAndVerifyScreenshot(page, 'settings-notifications', 'Notification settings page');

      // Test preferences
      await page.click('[data-testid="preferences-tab"]');
      await takeAndVerifyScreenshot(page, 'settings-preferences', 'Preferences settings page');
    });
  });

  test.describe('Responsive Design', () => {
    test('Mobile View - All Pages', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await loginViaUI(page, TEACHER_USER);
      await takeAndVerifyScreenshot(page, 'mobile-dashboard', 'Mobile dashboard view');

      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-toggle"]');
      await takeAndVerifyScreenshot(page, 'mobile-menu-open', 'Mobile menu opened');

      // Test mobile lesson planning
      await page.click('[data-testid="nav-lesson-plans"]');
      await takeAndVerifyScreenshot(page, 'mobile-lesson-plans', 'Mobile lesson plans view');
    });

    test('Tablet View - Key Pages', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await loginViaUI(page, TEACHER_USER);
      await takeAndVerifyScreenshot(page, 'tablet-dashboard', 'Tablet dashboard view');

      await page.click('[data-testid="nav-calendar"]');
      await takeAndVerifyScreenshot(page, 'tablet-calendar', 'Tablet calendar view');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('Network Error Handling', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      // Simulate network issues
      await page.route('**/api/**', (route) => route.abort());

      // Try to perform actions that require API calls
      await page.click('[data-testid="nav-lesson-plans"]');
      await takeAndVerifyScreenshot(page, 'network-error-state', 'Network error state');

      // Verify error message is shown
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test('Session Expiry Handling', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      // Clear authentication tokens
      await page.evaluate(() => {
        localStorage.removeItem('auth-token');
        sessionStorage.clear();
      });

      // Try to access protected content
      await page.click('[data-testid="nav-lesson-plans"]');
      await takeAndVerifyScreenshot(page, 'session-expired', 'Session expired redirect');

      // Should redirect to login
      await expect(page.url()).toContain('/login');
    });
  });

  test.describe('Performance and Loading States', () => {
    test('Loading States - All Pages', async ({ page }) => {
      await loginViaUI(page, TEACHER_USER);

      // Slow down network to capture loading states
      await page.route('**/api/**', (route) => {
        setTimeout(() => route.continue(), 2000);
      });

      // Navigate to pages and capture loading states
      const pages = ['lesson-plans', 'unit-plans', 'calendar', 'templates'];

      for (const pageName of pages) {
        await page.click(`[data-testid="nav-${pageName}"]`);
        await takeAndVerifyScreenshot(
          page,
          `loading-${pageName}`,
          `Loading state for ${pageName} page`,
        );
        await page.waitForLoadState('networkidle');
      }
    });
  });
});

// Summary test to verify all screenshots were created
test('Verify All Screenshots Created', async ({ page }) => {
  const screenshotFiles = await fs.readdir(SCREENSHOT_DIR);
  const screenshotCount = screenshotFiles.filter((file) => file.endsWith('.png')).length;

  console.log(`📊 Total screenshots created: ${screenshotCount}`);

  // Verify we have a reasonable number of screenshots
  expect(screenshotCount).toBeGreaterThan(30);

  // Create summary
  const summary = {
    totalScreenshots: screenshotCount,
    files: screenshotFiles.filter((file) => file.endsWith('.png')),
    timestamp: new Date().toISOString(),
  };

  await fs.writeFile(path.join(SCREENSHOT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
});
