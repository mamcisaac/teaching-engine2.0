/**
 * Visual Regression Tests for Critical Teacher-Facing Pages
 * Teaching Engine 2.0 - Ensuring UI consistency across platforms
 */

import { test, expect, Page } from '@playwright/test';

// Test data setup for consistent visual testing
const TEST_TEACHER = {
  email: 'visual.test@demo.edu',
  password: 'VisualTest123!',
  name: 'Visual Test Teacher',
  grade: '3',
  subject: 'Mathematics',
};

const VIEWPORT_BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

// Helper function to ensure stable page state before screenshots
async function waitForStablePageState(page: Page) {
  // Wait for network idle to ensure all resources are loaded
  await page.waitForLoadState('networkidle');

  // Wait for any animations to complete
  await page.waitForTimeout(1000);

  // Hide dynamic elements that cause visual flicker
  await page.addStyleTag({
    content: `
      /* Hide elements that cause visual inconsistency */
      .loading-spinner,
      .auto-save-indicator,
      .timestamp,
      .real-time-clock,
      .notification-badge {
        visibility: hidden !important;
      }
      
      /* Disable animations for consistent screenshots */
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      
      /* Ensure consistent cursor visibility */
      input, textarea {
        caret-color: transparent !important;
      }
    `,
  });
}

// Authentication helper for visual tests
async function authenticateForVisualTest(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', TEST_TEACHER.email);
  await page.fill('[data-testid="password-input"]', TEST_TEACHER.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
  await waitForStablePageState(page);
}

test.describe('Critical Teacher Pages - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Disable real-time features that cause visual inconsistency
    await page.addInitScript(() => {
      // Mock current time for consistent timestamps
      const mockDate = new Date('2024-01-15T09:00:00Z');
      Date.now = () => mockDate.getTime();
      Date.prototype.getTime = () => mockDate.getTime();

      // Disable WebSocket connections for visual tests
      window.WebSocket = class MockWebSocket {
        constructor() {
          /* Mock WebSocket */
        }
        close() {}
        send() {}
      };
    });
  });

  test('Dashboard - Teacher Homepage', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Ensure dashboard is fully loaded with stable data
    await page.waitForSelector('[data-testid="dashboard-content"]');
    await page.waitForSelector('[data-testid="recent-plans"]');
    await page.waitForSelector('[data-testid="upcoming-events"]');

    await waitForStablePageState(page);

    // Take full page screenshot of dashboard
    await expect(page).toHaveScreenshot('dashboard-full-page.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test specific dashboard components
    await expect(page.locator('[data-testid="weekly-overview"]')).toHaveScreenshot(
      'dashboard-weekly-overview.png',
    );
    await expect(page.locator('[data-testid="quick-actions"]')).toHaveScreenshot(
      'dashboard-quick-actions.png',
    );
    await expect(page.locator('[data-testid="recent-plans"]')).toHaveScreenshot(
      'dashboard-recent-plans.png',
    );
  });

  test('Lesson Planning Interface - ETFO Plans', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Navigate to lesson planning
    await page.click('[data-testid="nav-lesson-plans"]');
    await page.waitForURL('**/etfo-lesson-plans');
    await page.waitForSelector('[data-testid="lesson-plan-list"]');

    await waitForStablePageState(page);

    // Take screenshots of lesson planning interface
    await expect(page).toHaveScreenshot('lesson-plans-list-view.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test lesson plan creation form
    await page.click('[data-testid="create-lesson-plan"]');
    await page.waitForSelector('[data-testid="lesson-plan-form"]');
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="lesson-plan-form"]')).toHaveScreenshot(
      'lesson-plan-creation-form.png',
    );

    // Test three-part lesson structure
    await expect(page.locator('[data-testid="minds-on-section"]')).toHaveScreenshot(
      'lesson-minds-on-section.png',
    );
    await expect(page.locator('[data-testid="action-section"]')).toHaveScreenshot(
      'lesson-action-section.png',
    );
    await expect(page.locator('[data-testid="consolidation-section"]')).toHaveScreenshot(
      'lesson-consolidation-section.png',
    );
  });

  test('Curriculum Expectations Browser', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Navigate to curriculum expectations
    await page.goto('/curriculum-expectations');
    await page.waitForSelector('[data-testid="curriculum-grid"]');

    // Test filter functionality visual state
    await page.click('[data-testid="filter-grade"]');
    await page.selectOption('[data-testid="filter-grade"]', TEST_TEACHER.grade);
    await page.click('[data-testid="filter-subject"]');
    await page.selectOption('[data-testid="filter-subject"]', TEST_TEACHER.subject);

    await waitForStablePageState(page);

    // Screenshots of curriculum browser states
    await expect(page).toHaveScreenshot('curriculum-expectations-filtered.png', {
      fullPage: true,
      animations: 'disabled',
    });

    await expect(page.locator('[data-testid="filter-panel"]')).toHaveScreenshot(
      'curriculum-filter-panel.png',
    );
    await expect(page.locator('[data-testid="expectations-grid"]')).toHaveScreenshot(
      'curriculum-expectations-grid.png',
    );

    // Test expectation detail view
    await page.click('[data-testid="expectation-card"]:first-child');
    await page.waitForSelector('[data-testid="expectation-detail"]');
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="expectation-detail"]')).toHaveScreenshot(
      'curriculum-expectation-detail.png',
    );
  });

  // Student Management Interface test removed - app does not store student data

  test('Newsletter Editor Interface', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Navigate to newsletter creation
    await page.goto('/parent-newsletter');
    await page.waitForSelector('[data-testid="newsletter-editor"]');
    await waitForStablePageState(page);

    // Newsletter editor views
    await expect(page).toHaveScreenshot('newsletter-editor-empty.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test newsletter generation
    await page.click('[data-testid="generate-newsletter"]');
    await page.waitForSelector('[data-testid="newsletter-preview"]', { timeout: 15000 });
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="newsletter-preview"]')).toHaveScreenshot(
      'newsletter-preview.png',
    );
    await expect(page.locator('[data-testid="newsletter-settings"]')).toHaveScreenshot(
      'newsletter-settings-panel.png',
    );
  });

  test('Calendar Planning Interface', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Navigate to calendar planning
    await page.goto('/calendar');
    await page.waitForSelector('[data-testid="calendar-grid"]');
    await waitForStablePageState(page);

    // Calendar views
    await expect(page).toHaveScreenshot('calendar-month-view.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test week view
    await page.click('[data-testid="view-week"]');
    await page.waitForSelector('[data-testid="calendar-week-view"]');
    await waitForStablePageState(page);

    await expect(page).toHaveScreenshot('calendar-week-view.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test event creation modal
    await page.click('[data-testid="calendar-day-cell"]:first-child');
    await page.waitForSelector('[data-testid="event-modal"]');
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="event-modal"]')).toHaveScreenshot(
      'calendar-event-modal.png',
    );
  });

  test('Settings and Preferences', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Navigate to settings
    await page.goto('/settings');
    await page.waitForSelector('[data-testid="settings-panel"]');
    await waitForStablePageState(page);

    // Settings interface
    await expect(page).toHaveScreenshot('settings-main-panel.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test different settings sections
    await page.click('[data-testid="settings-tab-preferences"]');
    await waitForStablePageState(page);
    await expect(page.locator('[data-testid="preferences-section"]')).toHaveScreenshot(
      'settings-preferences.png',
    );

    await page.click('[data-testid="settings-tab-notifications"]');
    await waitForStablePageState(page);
    await expect(page.locator('[data-testid="notifications-section"]')).toHaveScreenshot(
      'settings-notifications.png',
    );

    await page.click('[data-testid="settings-tab-backup"]');
    await waitForStablePageState(page);
    await expect(page.locator('[data-testid="backup-section"]')).toHaveScreenshot(
      'settings-backup.png',
    );
  });
});

test.describe('Responsive Design - Cross-Device Visual Testing', () => {
  test('Mobile Responsiveness - Critical Pages', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_BREAKPOINTS.mobile);
    await authenticateForVisualTest(page);

    // Test mobile dashboard
    await waitForStablePageState(page);
    await expect(page).toHaveScreenshot('mobile-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-toggle"]');
    await page.waitForSelector('[data-testid="mobile-navigation"]');
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="mobile-navigation"]')).toHaveScreenshot(
      'mobile-navigation-menu.png',
    );

    // Test mobile lesson planning
    await page.goto('/etfo-lesson-plans');
    await page.waitForSelector('[data-testid="lesson-plan-list"]');
    await waitForStablePageState(page);

    await expect(page).toHaveScreenshot('mobile-lesson-plans.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Tablet Responsiveness - Planning Workflows', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_BREAKPOINTS.tablet);
    await authenticateForVisualTest(page);

    // Test tablet dashboard layout
    await waitForStablePageState(page);
    await expect(page).toHaveScreenshot('tablet-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test tablet lesson planning interface
    await page.goto('/etfo-lesson-plans');
    await page.waitForSelector('[data-testid="lesson-plan-list"]');
    await waitForStablePageState(page);

    await expect(page).toHaveScreenshot('tablet-lesson-planning.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test tablet curriculum browsing
    await page.goto('/curriculum-expectations');
    await page.waitForSelector('[data-testid="curriculum-grid"]');
    await waitForStablePageState(page);

    await expect(page).toHaveScreenshot('tablet-curriculum-browser.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Accessibility Visual Testing', () => {
  test('High Contrast Mode Compatibility', async ({ page }) => {
    // Enable high contrast mode simulation
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await authenticateForVisualTest(page);

    await waitForStablePageState(page);

    // Test high contrast dashboard
    await expect(page).toHaveScreenshot('high-contrast-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test high contrast forms
    await page.goto('/etfo-lesson-plans');
    await page.click('[data-testid="create-lesson-plan"]');
    await page.waitForSelector('[data-testid="lesson-plan-form"]');
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="lesson-plan-form"]')).toHaveScreenshot(
      'high-contrast-form.png',
    );
  });

  test('Large Text Support (200% Zoom)', async ({ page }) => {
    // Simulate 200% zoom by adjusting viewport and scale
    await page.setViewportSize({ width: 960, height: 540 });
    await page.addStyleTag({
      content: `
        body {
          zoom: 2;
          transform-origin: top left;
        }
      `,
    });

    await authenticateForVisualTest(page);
    await waitForStablePageState(page);

    // Test large text dashboard
    await expect(page).toHaveScreenshot('large-text-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test large text form readability
    await page.goto('/etfo-lesson-plans');
    await page.click('[data-testid="create-lesson-plan"]');
    await page.waitForSelector('[data-testid="lesson-plan-form"]');
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="lesson-plan-form"]')).toHaveScreenshot(
      'large-text-form.png',
    );
  });

  test('Focus Indicators and Keyboard Navigation', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Test keyboard focus indicators
    await page.keyboard.press('Tab'); // Focus first interactive element
    await waitForStablePageState(page);

    await expect(page).toHaveScreenshot('keyboard-focus-dashboard.png');

    // Navigate to form and test focus states
    await page.goto('/etfo-lesson-plans');
    await page.click('[data-testid="create-lesson-plan"]');
    await page.waitForSelector('[data-testid="lesson-plan-form"]');

    // Tab through form elements to test focus indicators
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="lesson-plan-form"]')).toHaveScreenshot(
      'keyboard-focus-form.png',
    );
  });
});

test.describe('Print Layout Visual Testing', () => {
  test('Lesson Plan Print Layout', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Navigate to a lesson plan
    await page.goto('/etfo-lesson-plans');
    await page.click('[data-testid="lesson-plan-card"]:first-child');
    await page.waitForSelector('[data-testid="lesson-plan-detail"]');

    // Simulate print media
    await page.emulateMedia({ media: 'print' });
    await waitForStablePageState(page);

    await expect(page).toHaveScreenshot('lesson-plan-print-layout.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Weekly Planning Print Layout', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Navigate to weekly planning view
    await page.goto('/calendar?view=week');
    await page.waitForSelector('[data-testid="calendar-week-view"]');

    // Simulate print media
    await page.emulateMedia({ media: 'print' });
    await waitForStablePageState(page);

    await expect(page).toHaveScreenshot('weekly-plan-print-layout.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Newsletter Print Layout', async ({ page }) => {
    await authenticateForVisualTest(page);

    // Navigate to newsletter and generate content
    await page.goto('/parent-newsletter');
    await page.click('[data-testid="generate-newsletter"]');
    await page.waitForSelector('[data-testid="newsletter-preview"]', { timeout: 15000 });

    // Simulate print media
    await page.emulateMedia({ media: 'print' });
    await waitForStablePageState(page);

    await expect(page.locator('[data-testid="newsletter-preview"]')).toHaveScreenshot(
      'newsletter-print-layout.png',
    );
  });
});
