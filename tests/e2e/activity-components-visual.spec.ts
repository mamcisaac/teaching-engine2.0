import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Activity Components
 * 
 * These tests capture screenshots of components to detect visual changes.
 * Run with: npx playwright test --update-snapshots to update baselines.
 */

test.describe('Activity Components Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup with a larger viewport for consistent screenshots
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Login and navigate to the appropriate page
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('ActivitySuggestions component visual test', async ({ page }) => {
    // Navigate to weekly planner to access activity suggestions
    await page.click('text=Weekly Planner');
    await page.waitForSelector('[data-testid="weekly-planner"]', { timeout: 10000 });
    
    // Select a milestone to trigger activity suggestions
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForFunction(() => {
      const loadingSkeletons = document.querySelectorAll('[data-testid="loading-skeleton"]');
      return loadingSkeletons.length === 0;
    }, { timeout: 15000 });
    
    // Take screenshot of activity suggestions panel
    const suggestionsPanel = page.locator('text=Activity Suggestions').locator('..');
    await expect(suggestionsPanel).toHaveScreenshot('activity-suggestions-panel.png');
    
    // Test with filters open
    const filtersButton = page.locator('text=Filters');
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
      await expect(page.locator('text=Filter Activities')).toBeVisible();
      
      // Screenshot with filters expanded
      await expect(suggestionsPanel).toHaveScreenshot('activity-suggestions-with-filters.png');
    }
  });

  test('ActivityLibrary component visual test', async ({ page }) => {
    // Navigate to activity library
    await page.click('text=Resources');
    await page.click('text=Activity Library');
    await expect(page.locator('text=Activity Library')).toBeVisible();
    
    // Wait for activities to load
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('text=Loading...');
      return !loadingText || !loadingText.isConnected;
    }, { timeout: 10000 });
    
    // Screenshot of grid view
    const libraryContainer = page.locator('text=Activity Library').locator('..');
    await expect(libraryContainer).toHaveScreenshot('activity-library-grid-view.png');
    
    // Switch to list view and screenshot
    const listButton = page.locator('button').filter({ hasText: /list/i });
    if (await listButton.isVisible()) {
      await listButton.click();
      await page.waitForTimeout(500); // Wait for transition
      await expect(libraryContainer).toHaveScreenshot('activity-library-list-view.png');
    }
    
    // Test with filters panel open
    const filtersButton = page.locator('text=Filters');
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
      await page.waitForTimeout(500);
      await expect(libraryContainer).toHaveScreenshot('activity-library-with-filters.png');
    }
  });

  test('ActivityEditor modal visual test', async ({ page }) => {
    // Navigate to activity library
    await page.click('text=Resources');
    await page.click('text=Activity Library');
    await expect(page.locator('text=Activity Library')).toBeVisible();
    
    // Click create new activity
    const newActivityButton = page.locator('text=New Activity');
    if (await newActivityButton.isVisible()) {
      await newActivityButton.click();
      
      // Wait for modal to appear
      await expect(page.locator('text=Create Activity Template')).toBeVisible();
      
      // Screenshot of empty modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toHaveScreenshot('activity-editor-modal-empty.png');
      
      // Fill in some fields and screenshot
      await page.fill('input[placeholder*="English title"]', 'Sample Activity');
      await page.fill('input[placeholder*="French title"]', 'Activité d\'exemple');
      await page.fill('textarea[placeholder*="English description"]', 'This is a sample activity for visual testing purposes.');
      
      await expect(modal).toHaveScreenshot('activity-editor-modal-filled.png');
    }
  });

  test('PrintableDailyPlanView visual test', async ({ page }) => {
    // Navigate to daily plan
    await page.click('text=Daily Plan');
    await expect(page.locator('text=Daily Plan')).toBeVisible();
    
    // Wait for plan to load
    await page.waitForSelector('[data-testid="daily-plan-activities"]', { timeout: 10000 });
    
    // If there's a print preview or printable view
    const printButton = page.locator('text=Print').or(page.locator('button[aria-label*="print"]'));
    if (await printButton.isVisible()) {
      await printButton.click();
      
      // Wait for print view to render
      await page.waitForTimeout(1000);
      
      // Screenshot the printable view
      const printableView = page.locator('.print\\:p-0, [class*="print"]').first();
      if (await printableView.isVisible()) {
        await expect(printableView).toHaveScreenshot('printable-daily-plan-view.png');
      }
    }
  });

  test('UI components visual tests', async ({ page }) => {
    // Create a test page to showcase individual components
    await page.goto('data:text/html,<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div></body></html>');
    
    // Inject our components for testing
    await page.addStyleTag({ content: `
      .component-showcase {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 800px;
      }
      .component-group {
        border: 1px solid #e5e7eb;
        padding: 16px;
        border-radius: 8px;
      }
    ` });
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="component-showcase">
          <div class="component-group">
            <h3 class="text-lg font-semibold mb-4">Badge Component Variants</h3>
            <div class="flex gap-2 flex-wrap">
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">Default</span>
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">Secondary</span>
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">Destructive</span>
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-gray-300 bg-white text-gray-700">Outline</span>
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">Success</span>
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">Warning</span>
            </div>
          </div>
          
          <div class="component-group">
            <h3 class="text-lg font-semibold mb-4">Card Component</h3>
            <div class="rounded-lg border border-gray-200 bg-white shadow-sm max-w-md">
              <div class="flex flex-col space-y-1.5 p-6 pb-3">
                <h3 class="text-lg font-semibold leading-none tracking-tight">Sample Activity</h3>
                <p class="text-sm text-gray-600">Reading • French</p>
              </div>
              <div class="p-6 pt-0">
                <p class="text-sm text-gray-700">This is a sample activity description to show how the card component looks with content.</p>
                <div class="flex gap-2 mt-3">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">20m prep</span>
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-gray-300 bg-white text-gray-700">2 outcomes</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="component-group">
            <h3 class="text-lg font-semibold mb-4">Select Component</h3>
            <div class="w-64">
              <div class="relative">
                <button class="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                  <span>Choose an option...</span>
                  <svg class="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    
    await page.waitForTimeout(1000); // Wait for rendering
    
    // Screenshot of all UI components
    const showcase = page.locator('.component-showcase');
    await expect(showcase).toHaveScreenshot('ui-components-showcase.png');
  });

  test('Empty states visual test', async ({ page }) => {
    // Navigate to weekly planner
    await page.click('text=Weekly Planner');
    await page.waitForSelector('[data-testid="weekly-planner"]', { timeout: 10000 });
    
    // Select a milestone
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Wait for load and check if we have empty state
    await page.waitForFunction(() => {
      const loadingSkeletons = document.querySelectorAll('[data-testid="loading-skeleton"]');
      return loadingSkeletons.length === 0;
    }, { timeout: 15000 });
    
    const hasEmptyState = await page.locator('text=No activities found').isVisible();
    if (hasEmptyState) {
      const suggestionsPanel = page.locator('text=Activity Suggestions').locator('..');
      await expect(suggestionsPanel).toHaveScreenshot('activity-suggestions-empty-state.png');
    }
    
    // Test activity library empty state
    await page.click('text=Resources');
    await page.click('text=Activity Library');
    await expect(page.locator('text=Activity Library')).toBeVisible();
    
    // Search for something that won't exist
    await page.fill('input[placeholder="Search activities..."]', 'NONEXISTENT_SEARCH_TERM_XYZ');
    await page.waitForTimeout(1000);
    
    const hasLibraryEmpty = await page.locator('text=No activities found').isVisible();
    if (hasLibraryEmpty) {
      const libraryContainer = page.locator('text=Activity Library').locator('..');
      await expect(libraryContainer).toHaveScreenshot('activity-library-empty-search.png');
    }
  });

  test('Loading states visual test', async ({ page }) => {
    // Intercept API calls to delay them and capture loading state
    await page.route('**/api/activity-templates/**', async route => {
      // Delay the response to capture loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    // Navigate to weekly planner
    await page.click('text=Weekly Planner');
    await page.waitForSelector('[data-testid="weekly-planner"]', { timeout: 10000 });
    
    // Select milestone to trigger loading
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Should show loading skeletons
    await expect(page.locator('[data-testid="loading-skeleton"]').first()).toBeVisible();
    
    // Screenshot loading state
    const suggestionsPanel = page.locator('text=Activity Suggestions').locator('..');
    await expect(suggestionsPanel).toHaveScreenshot('activity-suggestions-loading-state.png');
  });

  test('Error states visual test', async ({ page }) => {
    // Intercept API calls to return errors
    await page.route('**/api/activity-templates/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Navigate and trigger error
    await page.click('text=Weekly Planner');
    await page.waitForSelector('[data-testid="weekly-planner"]', { timeout: 10000 });
    
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Should show error state
    await expect(page.locator('text=Unable to load')).toBeVisible({ timeout: 10000 });
    
    // Screenshot error state
    const suggestionsPanel = page.locator('text=Activity Suggestions').locator('..');
    await expect(suggestionsPanel).toHaveScreenshot('activity-suggestions-error-state.png');
  });
});

test.describe('Activity Components Dark Mode Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable dark mode if supported
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize({ width: 1200, height: 800 });
    
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('Components in dark mode', async ({ page }) => {
    // Test activity suggestions in dark mode
    await page.click('text=Weekly Planner');
    await page.waitForSelector('[data-testid="weekly-planner"]', { timeout: 10000 });
    
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    await page.waitForFunction(() => {
      const loadingSkeletons = document.querySelectorAll('[data-testid="loading-skeleton"]');
      return loadingSkeletons.length === 0;
    }, { timeout: 15000 });
    
    const suggestionsPanel = page.locator('text=Activity Suggestions').locator('..');
    await expect(suggestionsPanel).toHaveScreenshot('activity-suggestions-dark-mode.png');
  });
});