/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Visual Regression Testing Suite
 * Automated screenshot comparison testing for UI consistency
 */

import { test, expect, Page } from '@playwright/test';
import { VISUAL_REGRESSION_PAGES } from './config';
import { VisualTestManager } from './utils/VisualTestManager';

interface VisualTestResult {
  pageName: string;
  viewport: string;
  passed: boolean;
  diffPixels?: number;
  diffPercentage?: number;
  screenshotPath?: string;
  diffImagePath?: string;
}

class VisualRegressionSuite {
  private testManager: VisualTestManager;
  private results: VisualTestResult[] = [];

  constructor() {
    this.testManager = new VisualTestManager();
  }

  async runVisualTest(
    page: Page,
    pageName: string,
    url: string,
    viewport: { width: number; height: number; name: string },
    options: {
      waitForSelector?: string;
      masks?: string[];
      animations?: 'disabled' | 'allow';
    } = {},
  ): Promise<VisualTestResult> {
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    // Navigate to page
    await page.goto(url);

    // Wait for page to be ready
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
    }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    // Disable animations if requested
    if (options.animations === 'disabled') {
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      });
    }

    // Apply masks to dynamic content
    if (options.masks && options.masks.length > 0) {
      for (const mask of options.masks) {
        await page
          .locator(mask)
          .evaluate((element) => {
            if (element) {
              element.style.visibility = 'hidden';
            }
          })
          .catch(() => {
            // Mask selector might not exist, continue
          });
      }
    }

    // Wait a bit for any remaining dynamic content to settle
    await page.waitForTimeout(1000);

    const testName = `${pageName}-${viewport.name}`;

    try {
      // Take screenshot and compare
      await expect(page).toHaveScreenshot(`${testName}.png`, {
        fullPage: true,
        animations: options.animations || 'disabled',
        maxDiffPixels: 200,
        threshold: 0.2,
      });

      const result: VisualTestResult = {
        pageName,
        viewport: viewport.name,
        passed: true,
      };

      this.results.push(result);
      return result;
    } catch (_error) {
      const result: VisualTestResult = {
        pageName,
        viewport: viewport.name,
        passed: false,
        diffPixels: this.extractDiffPixels(error),
        diffPercentage: this.extractDiffPercentage(error),
      };

      this.results.push(result);
      throw error; // Re-throw to fail the test
    }
  }

  private extractDiffPixels(error: any): number | undefined {
    const message = error?.message || '';
    const match = message.match(/(\d+) pixels? different/);
    return match ? parseInt(match[1]) : undefined;
  }

  private extractDiffPercentage(error: any): number | undefined {
    const message = error?.message || '';
    const match = message.match(/(\d+\.?\d*)% different/);
    return match ? parseFloat(match[1]) : undefined;
  }

  getResults(): VisualTestResult[] {
    return this.results;
  }

  async generateVisualReport(): Promise<void> {
    await this.testManager.generateReport(this.results);
  }
}

const visualSuite = new VisualRegressionSuite();

test.describe('Visual Regression Tests', () => {
  // Run visual tests for each configured page
  for (const pageConfig of VISUAL_REGRESSION_PAGES) {
    for (const viewport of pageConfig.viewports) {
      test(`Visual: ${pageConfig.name} - ${viewport.name}`, async ({ page }) => {
        await visualSuite.runVisualTest(page, pageConfig.name, pageConfig.url, viewport, {
          waitForSelector: pageConfig.waitForSelector,
          masks: pageConfig.masks,
          animations: 'disabled',
        });
      });
    }
  }

  // Component-level visual tests
  test.describe('Component Visual Tests', () => {
    test('Navigation Bar Consistency', async ({ page }) => {
      const pages = ['/dashboard', '/etfo-lesson-plans', '/unit-plans', '/curriculum-expectations'];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForSelector('[data-testid="main-nav"]', { timeout: 5000 });

        await expect(page.locator('[data-testid="main-nav"]')).toHaveScreenshot(
          `nav-${pagePath.replace('/', '')}.png`,
          {
            animations: 'disabled',
            maxDiffPixels: 50,
          },
        );
      }
    });

    test('Form Components Visual Consistency', async ({ page }) => {
      await page.goto('/etfo-lesson-plans/new');
      await page.waitForSelector('form', { timeout: 5000 });

      // Test different form states
      await expect(page.locator('form')).toHaveScreenshot('lesson-form-empty.png', {
        animations: 'disabled',
      });

      // Fill some fields
      await page.fill('[data-testid="lesson-title"]', 'Sample Lesson Title');
      await page.selectOption('[data-testid="subject-select"]', 'Mathematics');

      await expect(page.locator('form')).toHaveScreenshot('lesson-form-partial.png', {
        animations: 'disabled',
      });
    });

    test('Loading States Visual Test', async ({ page }) => {
      // Intercept API calls to show loading states
      await page.route('**/api/curriculum-expectations', (route) => {
        // Delay response to capture loading state
        setTimeout(() => {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ expectations: [] }),
          });
        }, 2000);
      });

      await page.goto('/curriculum-expectations');

      // Capture loading state
      await expect(page.locator('[data-testid="loading-spinner"]')).toHaveScreenshot(
        'loading-state.png',
        {
          animations: 'disabled',
          timeout: 5000,
        },
      );
    });

    test('Error States Visual Test', async ({ page }) => {
      // Intercept API calls to return errors
      await page.route('**/api/curriculum-expectations', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await page.goto('/curriculum-expectations');
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });

      await expect(page.locator('[data-testid="error-container"]')).toHaveScreenshot(
        'error-state.png',
        {
          animations: 'disabled',
        },
      );
    });
  });

  // Dark mode visual tests (if supported)
  test.describe('Dark Mode Visual Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
    });

    test('Dashboard Dark Mode', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 5000 });

      await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('Forms Dark Mode', async ({ page }) => {
      await page.goto('/etfo-lesson-plans/new');
      await page.waitForSelector('form', { timeout: 5000 });

      await expect(page.locator('form')).toHaveScreenshot('form-dark-mode.png', {
        animations: 'disabled',
      });
    });
  });

  // Mobile-specific visual tests
  test.describe('Mobile Visual Tests', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('Mobile Navigation', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="mobile-nav-toggle"]', { timeout: 5000 });

      // Test collapsed navigation
      await expect(page).toHaveScreenshot('mobile-nav-collapsed.png', {
        fullPage: true,
        animations: 'disabled',
      });

      // Test expanded navigation
      await page.click('[data-testid="mobile-nav-toggle"]');
      await page.waitForSelector('[data-testid="mobile-nav-menu"]', { timeout: 2000 });

      await expect(page).toHaveScreenshot('mobile-nav-expanded.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('Mobile Forms', async ({ page }) => {
      await page.goto('/etfo-lesson-plans/new');
      await page.waitForSelector('form', { timeout: 5000 });

      await expect(page).toHaveScreenshot('mobile-form.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  // Print styles visual tests
  test.describe('Print Styles Visual Tests', () => {
    test('Lesson Plan Print View', async ({ page }) => {
      await page.goto('/etfo-lesson-plans/1');
      await page.waitForSelector('[data-testid="lesson-plan-content"]', { timeout: 5000 });

      // Emulate print media
      await page.emulateMedia({ media: 'print' });

      await expect(page).toHaveScreenshot('lesson-plan-print.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('Newsletter Print View', async ({ page }) => {
      await page.goto('/parent-newsletter');
      await page.waitForSelector('[data-testid="newsletter-content"]', { timeout: 5000 });

      await page.emulateMedia({ media: 'print' });

      await expect(page).toHaveScreenshot('newsletter-print.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  // Accessibility visual tests
  test.describe('Accessibility Visual Tests', () => {
    test('High Contrast Mode', async ({ page }) => {
      // Enable high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background: white !important;
              color: black !important;
              border: 1px solid black !important;
            }
          }
        `,
      });

      await page.goto('/dashboard');
      await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 5000 });

      await expect(page).toHaveScreenshot('dashboard-high-contrast.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('Focus States', async ({ page }) => {
      await page.goto('/etfo-lesson-plans/new');
      await page.waitForSelector('form', { timeout: 5000 });

      // Focus on different form elements and capture
      const focusableElements = ['input[type="text"]', 'select', 'textarea', 'button'];

      for (const selector of focusableElements) {
        const element = page.locator(selector).first();
        if ((await element.count()) > 0) {
          await element.focus();
          await expect(element).toHaveScreenshot(`focus-${selector.replace(/[^a-z]/g, '')}.png`, {
            animations: 'disabled',
          });
        }
      }
    });
  });

  test.afterAll(async () => {
    await visualSuite.generateVisualReport();
  });
});

export { VisualRegressionSuite, VisualTestResult };
