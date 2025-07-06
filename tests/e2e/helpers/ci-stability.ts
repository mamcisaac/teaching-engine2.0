/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Page, expect } from '@playwright/test';

// CI-optimized configuration
export const CI_CONFIG = {
  shortTimeout: 5000,    // 5 seconds for quick operations
  mediumTimeout: 15000,  // 15 seconds for medium operations
  longTimeout: 30000,    // 30 seconds for long operations
  waitDelay: 1000,       // 1 second between retries
  maxRetries: 3,
};

/**
 * Wait for element with CI-optimized timeouts
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options: { timeout?: number; state?: 'visible' | 'attached' | 'hidden' } = {}
): Promise<void> {
  const { timeout = CI_CONFIG.mediumTimeout, state = 'visible' } = options;
  
  try {
    await page.waitForSelector(selector, { timeout, state });
  } catch (error) {
    // Take a screenshot for debugging
    await page.screenshot({ 
      path: `test-results/timeout-${Date.now()}-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png` 
    });
    throw new Error(`Timeout waiting for element: ${selector}`);
  }
}

/**
 * Click element with retry logic
 */
export async function clickWithRetry(
  page: Page,
  selector: string,
  options: { timeout?: number; retries?: number } = {}
): Promise<void> {
  const { timeout = CI_CONFIG.shortTimeout, retries = CI_CONFIG.maxRetries } = options;
  
  for (let i = 0; i <= retries; i++) {
    try {
      await page.locator(selector).click({ timeout });
      return;
    } catch (error) {
      if (i === retries) {
        throw new Error(`Failed to click ${selector} after ${retries} retries: ${error}`);
      }
      await page.waitForTimeout(CI_CONFIG.waitDelay);
    }
  }
}

/**
 * Fill input with retry logic
 */
export async function fillWithRetry(
  page: Page,
  selector: string,
  value: string,
  options: { timeout?: number; retries?: number } = {}
): Promise<void> {
  const { timeout = CI_CONFIG.shortTimeout, retries = CI_CONFIG.maxRetries } = options;
  
  for (let i = 0; i <= retries; i++) {
    try {
      await page.locator(selector).fill(value, { timeout });
      return;
    } catch (error) {
      if (i === retries) {
        throw new Error(`Failed to fill ${selector} after ${retries} retries: ${error}`);
      }
      await page.waitForTimeout(CI_CONFIG.waitDelay);
    }
  }
}

/**
 * Wait for navigation with timeout
 */
export async function navigateWithTimeout(
  page: Page,
  url: string,
  options: { timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}
): Promise<void> {
  const { timeout = CI_CONFIG.longTimeout, waitUntil = 'domcontentloaded' } = options;
  
  try {
    await page.goto(url, { timeout, waitUntil });
  } catch (error) {
    // Try with reduced waiting if networkidle times out
    if (waitUntil === 'networkidle') {
      console.log('Network idle timeout, retrying with domcontentloaded...');
      await page.goto(url, { timeout, waitUntil: 'domcontentloaded' });
    } else {
      throw error;
    }
  }
}

/**
 * Wait for API response with timeout
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  options: { timeout?: number; status?: number } = {}
): Promise<void> {
  const { timeout = CI_CONFIG.mediumTimeout, status = 200 } = options;
  
  try {
    await page.waitForResponse(
      (response) => {
        const matches = typeof urlPattern === 'string' 
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());
        return matches && response.status() === status;
      },
      { timeout }
    );
  } catch (error) {
    console.warn(`API response timeout for ${urlPattern}, continuing...`);
  }
}

/**
 * Batch wait for multiple elements
 */
export async function waitForElements(
  page: Page,
  selectors: string[],
  options: { timeout?: number; waitAll?: boolean } = {}
): Promise<void> {
  const { timeout = CI_CONFIG.mediumTimeout, waitAll = false } = options;
  
  if (waitAll) {
    // Wait for all elements
    await Promise.all(
      selectors.map(selector => 
        waitForElement(page, selector, { timeout })
      )
    );
  } else {
    // Wait for any element
    await Promise.race(
      selectors.map(selector => 
        waitForElement(page, selector, { timeout })
      )
    );
  }
}

/**
 * Optimized test user creation for CI
 */
export async function createCITestUser(
  role: 'teacher' | 'admin' = 'teacher',
  customData?: { name?: string; email?: string; password?: string }
): Promise<{ email: string; password: string; name: string; role: string }> {
  // Use simpler timestamps for CI
  const timestamp = Date.now().toString().slice(-6);
  
  return {
    email: customData?.email || `ci-${role}-${timestamp}@test.com`,
    password: customData?.password || `Pass${timestamp}!`,
    name: customData?.name || `CI ${role} ${timestamp}`,
    role,
  };
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(
  page: Page,
  selector: string,
  options: { timeout?: number } = {}
): Promise<boolean> {
  const { timeout = CI_CONFIG.shortTimeout } = options;
  
  try {
    await page.waitForSelector(selector, { timeout, state: 'attached' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for page to be stable (no network activity)
 */
export async function waitForPageStable(
  page: Page,
  options: { timeout?: number; idleTime?: number } = {}
): Promise<void> {
  const { timeout = CI_CONFIG.mediumTimeout, idleTime = 500 } = options;
  
  try {
    // First wait for DOM to be loaded
    await page.waitForLoadState('domcontentloaded', { timeout: timeout / 2 });
    
    // Then wait for no network activity for idleTime
    let lastRequestTime = Date.now();
    let isStable = false;
    
    const requestHandler = () => {
      lastRequestTime = Date.now();
    };
    
    page.on('request', requestHandler);
    
    const checkStability = async () => {
      while (!isStable && Date.now() - lastRequestTime < timeout) {
        if (Date.now() - lastRequestTime > idleTime) {
          isStable = true;
          break;
        }
        await page.waitForTimeout(100);
      }
    };
    
    await checkStability();
    page.off('request', requestHandler);
  } catch (error) {
    console.log('Page stability timeout, continuing...');
  }
}