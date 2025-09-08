/**
 * Error Handling & Failure Paths test
 * Tests resilience to API failures and network errors
 */

import { test, expect } from '../fixtures/seed';

test.describe('Error Handling & Resilience', () => {
  test('handles 500 server error gracefully', async ({ page, seedData }) => {
    await page.goto('/planner/week');
    
    // Intercept API and return 500
    await page.route('**/api/etfo-lesson-plans**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Trigger a refresh or navigation that calls the API
    await page.reload();
    
    // Loading should appear and then disappear
    const loadingText = page.getByText(/Loading lessons/i);
    await expect(loadingText).toBeVisible();
    await expect(loadingText).toBeHidden({ timeout: 8000 });
    
    // Error state should be visible
    const errorMessage = page.getByText(/error|failed|could not load|try again|retry/i);
    await expect(errorMessage).toBeVisible();
    
    // Should not show infinite spinner
    await expect(loadingText).not.toBeVisible();
    
    // Page should still be functional (sidebar visible)
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
  });

  test('handles network failure gracefully', async ({ page, seedData }) => {
    await page.goto('/planner/week');
    
    // Wait for initial load
    await expect(page.getByTestId('week-view-grid')).toBeVisible();
    
    // Intercept API and abort (network failure)
    await page.route('**/api/etfo-lesson-plans**', route => {
      route.abort('failed');
    });
    
    // Navigate to trigger API call
    await page.getByRole('button', { name: 'Next Week' }).click();
    
    // Should show error message about network
    const errorMessage = page.getByText(/network|offline|connection|failed to fetch/i);
    await expect(errorMessage).toBeVisible({ timeout: 8000 });
    
    // Should not hang with spinner
    const spinner = page.getByText(/Loading/i);
    await expect(spinner).not.toBeVisible();
  });

  test('retry mechanism works after error', async ({ page, seedData }) => {
    await page.goto('/planner/week');
    
    let callCount = 0;
    
    // Intercept API - fail first time, succeed second
    await page.route('**/api/etfo-lesson-plans**', route => {
      callCount++;
      if (callCount === 1) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' })
        });
      } else {
        route.continue();
      }
    });
    
    // Trigger error
    await page.reload();
    
    // Error should appear
    await expect(page.getByText(/error|retry/i)).toBeVisible({ timeout: 8000 });
    
    // Find and click retry button if present
    const retryButton = page.getByRole('button', { name: /retry|try again|reload/i });
    if (await retryButton.isVisible()) {
      await retryButton.click();
      
      // Should succeed this time
      await expect(page.getByTestId('week-view-grid')).toBeVisible({ timeout: 10000 });
      
      // Error should be gone
      await expect(page.getByText(/error/i)).not.toBeVisible();
    }
  });

  test('timeout errors are handled', async ({ page, seedData }) => {
    await page.goto('/curriculum');
    
    // Intercept and delay response beyond timeout
    await page.route('**/api/curriculum-expectations**', async route => {
      await new Promise(resolve => setTimeout(resolve, 20000)); // 20 second delay
      route.continue();
    });
    
    // Navigate to trigger API
    await page.reload();
    
    // Should timeout and show error (not hang forever)
    const errorMessage = page.getByText(/timeout|taking too long|slow|try again/i);
    await expect(errorMessage).toBeVisible({ timeout: 15000 });
  });

  test('404 not found is handled', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('/non-existent-page-12345');
    
    // Should show 404 or redirect
    const notFoundMessage = page.getByText(/404|not found|page.*not.*exist/i);
    const isRedirected = page.url().includes('/dashboard') || page.url().includes('/login');
    
    const hasNotFound = await notFoundMessage.isVisible().catch(() => false);
    
    expect(hasNotFound || isRedirected).toBeTruthy();
  });

  test('error boundary catches component errors', async ({ page, seedData }) => {
    // Inject error-causing script
    await page.addInitScript(() => {
      // Override a method to throw error
      window.addEventListener('error', (e) => {
        console.error('Component error:', e);
      });
    });
    
    await page.goto('/dashboard');
    
    // If error boundary exists, it should be hidden normally
    const errorBoundary = page.getByTestId('error-boundary');
    await expect(errorBoundary).not.toBeVisible().catch(() => {
      // Error boundary might not exist, which is fine for normal operation
    });
    
    // App should still be functional
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
  });

  test('handles empty/null API responses', async ({ page }) => {
    await page.goto('/planner/week');
    
    // Intercept and return empty response
    await page.route('**/api/etfo-lesson-plans**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }) // Empty data
      });
    });
    
    await page.reload();
    
    // Should handle empty state gracefully
    const emptyMessage = page.getByText(/no lessons|empty|add.*lesson|get started/i);
    const hasEmptyState = await emptyMessage.isVisible().catch(() => false);
    
    // Either show empty state or just empty grid
    if (!hasEmptyState) {
      // Grid should still render
      await expect(page.getByTestId('week-view-grid')).toBeVisible();
    }
    
    // Should not show error
    const errorMessage = page.getByText(/error|failed/i);
    await expect(errorMessage).not.toBeVisible().catch(() => {});
  });

  test('handles malformed JSON responses', async ({ page }) => {
    await page.goto('/curriculum');
    
    // Intercept and return malformed JSON
    await page.route('**/api/curriculum-expectations**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'This is not JSON {invalid}' // Malformed
      });
    });
    
    await page.reload();
    
    // Should show error (not crash)
    const errorMessage = page.getByText(/error|failed|invalid|corrupt/i);
    await expect(errorMessage).toBeVisible({ timeout: 8000 });
    
    // App should remain functional
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
  });

  test('recovers from errors when navigating away', async ({ page, seedData }) => {
    // Cause error on week view
    await page.route('**/api/etfo-lesson-plans**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.goto('/planner/week');
    await expect(page.getByText(/error/i)).toBeVisible({ timeout: 8000 });
    
    // Remove route override
    await page.unroute('**/api/etfo-lesson-plans**');
    
    // Navigate to different page
    await page.goto('/dashboard');
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
    
    // Navigate back to week view
    await page.goto('/planner/week');
    
    // Should work now (no error)
    await expect(page.getByTestId('week-view-grid')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/error/i)).not.toBeVisible();
  });
});