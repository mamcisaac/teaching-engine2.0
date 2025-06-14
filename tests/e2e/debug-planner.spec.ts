import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('debug planner component errors', async ({ page }) => {
  // Capture all console messages
  const consoleMessages: string[] = [];
  page.on('console', (msg) => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  // Capture uncaught errors
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(`Page Error: ${error.message}\nStack: ${error.stack}`);
  });

  await login(page);

  console.log('Navigating to planner page...');
  await page.goto('/planner');

  // Wait a bit for any errors to surface
  await page.waitForTimeout(3000);

  // Check if we can find the error boundary
  const errorBoundary = page.locator('text=Something went wrong');
  const isErrorVisible = await errorBoundary.isVisible();

  if (isErrorVisible) {
    console.log('Error boundary is visible, checking for error details...');

    // Try to click the error details if available
    const errorDetails = page.locator('summary:has-text("Error Details")');
    if (await errorDetails.isVisible()) {
      await errorDetails.click();
      const errorText = await page.locator('pre').textContent();
      console.log('Error Details:', errorText);
    }
  }

  // Log all console messages
  console.log('\n=== Console Messages ===');
  consoleMessages.forEach((msg) => console.log(msg));

  // Log all page errors
  console.log('\n=== Page Errors ===');
  pageErrors.forEach((error) => console.log(error));

  // Check if planner grid is present despite error
  const plannerGrid = page.locator('.planner-grid');
  const hasGrid = (await plannerGrid.count()) > 0;
  console.log('Planner grid present:', hasGrid);

  // Take a screenshot for debugging
  await page.screenshot({ path: 'debug-planner.png' });
  console.log('Screenshot saved: debug-planner.png');

  // This test is just for debugging, we don't expect it to pass
  expect(isErrorVisible).toBe(false);
});
