import { Page } from '@playwright/test';

/**
 * Debug helper for CI environments
 */
export class DebugHelper {
  constructor(private page: Page) {}

  /**
   * Log current page state for debugging
   */
  async logPageState(context: string) {
    if (!process.env.CI) return;

    console.log(`\n=== Debug: ${context} ===`);
    console.log(`URL: ${this.page.url()}`);
    console.log(`Title: ${await this.page.title()}`);

    // Log any console errors
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });

    // Log network failures
    this.page.on('requestfailed', (request) => {
      console.log(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
  }

  /**
   * Take screenshot on failure in CI
   */
  async screenshotOnFailure(testName: string) {
    if (!process.env.CI) return;

    try {
      await this.page.screenshot({
        path: `test-results/screenshots/${testName}-${Date.now()}.png`,
        fullPage: true,
      });
      console.log(`Screenshot saved for ${testName}`);
    } catch (error) {
      console.log(`Failed to take screenshot: ${error}`);
    }
  }

  /**
   * Wait for network to be idle with timeout
   */
  async waitForNetworkIdle(timeout = 10000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch {
      // Network might have continuous polling, that's ok
      console.log('Network idle timeout - continuing');
    }
  }

  /**
   * Log localStorage contents for debugging auth issues
   */
  async logAuthState() {
    if (!process.env.CI) return;

    const localStorage = await this.page.evaluate(() => {
      return {
        token: window.localStorage.getItem('token'),
        authToken: window.localStorage.getItem('auth-token'),
        user: window.localStorage.getItem('user'),
        onboarded: window.localStorage.getItem('onboarded'),
      };
    });

    console.log('Auth state:', {
      hasToken: !!localStorage.token,
      hasAuthToken: !!localStorage.authToken,
      hasUser: !!localStorage.user,
      isOnboarded: localStorage.onboarded,
    });
  }
}

/**
 * Create debug helper for a page
 */
export function createDebugHelper(page: Page): DebugHelper {
  return new DebugHelper(page);
}
