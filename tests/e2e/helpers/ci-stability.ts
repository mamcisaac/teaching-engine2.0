import { Page, Locator } from '@playwright/test';

/**
 * CI-specific stability helpers
 * These helpers add extra stability measures when running in CI environments
 */

/**
 * Wait for network to be idle with CI-specific timeout
 */
export async function waitForNetworkIdle(page: Page, options?: { timeout?: number }) {
  const timeout = process.env.CI ? 10000 : 5000;
  await page.waitForLoadState('networkidle', {
    timeout: options?.timeout || timeout,
  });
}

/**
 * Click with retry logic for CI stability
 */
export async function clickWithRetry(
  locator: Locator,
  options?: { retries?: number; delay?: number },
) {
  const maxRetries = process.env.CI ? options?.retries || 3 : 1;
  const delay = process.env.CI ? options?.delay || 1000 : 500;

  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.click({ timeout: 10000 });
      return;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await locator.page().waitForTimeout(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Fill input with retry logic for CI stability
 */
export async function fillWithRetry(
  locator: Locator,
  value: string,
  options?: { retries?: number; delay?: number },
) {
  const maxRetries = process.env.CI ? options?.retries || 3 : 1;
  const delay = process.env.CI ? options?.delay || 1000 : 500;

  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await locator.fill(value, { timeout: 10000 });
      return;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await locator.page().waitForTimeout(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Wait for element with CI-specific timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; state?: 'attached' | 'detached' | 'visible' | 'hidden' },
) {
  const timeout = process.env.CI ? 30000 : 15000;
  return page.waitForSelector(selector, {
    timeout: options?.timeout || timeout,
    state: options?.state || 'visible',
  });
}

/**
 * Navigate with retry logic for CI stability
 */
export async function navigateWithRetry(
  page: Page,
  url: string,
  options?: { retries?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' },
) {
  const maxRetries = process.env.CI ? 3 : 1;
  const waitUntil = options?.waitUntil || 'networkidle';

  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(url, {
        waitUntil,
        timeout: process.env.CI ? 60000 : 30000,
      });
      return;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await page.waitForTimeout(2000);
      }
    }
  }
  throw lastError;
}

/**
 * Wait for API response with CI-specific timeout
 */
export async function waitForAPI(
  page: Page,
  urlPattern: string | RegExp,
  options?: { timeout?: number; method?: string },
) {
  const timeout = process.env.CI ? 30000 : 15000;
  return page.waitForResponse(
    (response) => {
      const matchesUrl =
        typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());
      const matchesMethod = !options?.method || response.request().method() === options.method;
      return matchesUrl && matchesMethod && response.status() < 400;
    },
    { timeout: options?.timeout || timeout },
  );
}

/**
 * Add CI-specific delay between actions
 */
export async function ciDelay(ms?: number) {
  if (process.env.CI) {
    await new Promise((resolve) => setTimeout(resolve, ms || 500));
  }
}

/**
 * Check if running in CI and log debug info
 */
export function debugCI(message: string, data?: unknown) {
  if (process.env.CI) {
    console.log(`[CI Debug] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

/**
 * Take screenshot with CI-specific naming
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  if (process.env.CI) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `test-results/screenshots/ci-debug-${name}-${timestamp}.png`,
      fullPage: true,
    });
  }
}
