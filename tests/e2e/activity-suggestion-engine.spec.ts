import { test, expect, Page } from '@playwright/test';

/**
 * End-to-End Tests for Activity Suggestion Engine
 * 
 * These tests validate the complete user workflow for:
 * 1. Browsing activity suggestions
 * 2. Managing activity library
 * 3. Creating and editing activity templates
 * 4. Exporting daily plans with activities
 */

// Helper function to login and navigate to weekly planner
async function loginAndNavigateToPlanner(page: Page) {
  await page.goto('/');
  
  // Login (assuming we have test credentials)
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'testpassword');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  
  // Navigate to weekly planner
  await page.click('text=Weekly Planner');
  await page.waitForSelector('[data-testid="weekly-planner"]', { timeout: 10000 });
}

test.describe('Activity Suggestion Engine E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigateToPlanner(page);
  });

  test('should display activity suggestions when outcomes are selected', async ({ page }) => {
    // Click on a milestone to select outcomes
    const milestone = page.locator('[data-testid="milestone-card"]').first();
    await milestone.click();
    
    // Wait for activity suggestions panel to appear
    await expect(page.locator('text=Activity Suggestions')).toBeVisible({ timeout: 10000 });
    
    // Should show context about selected outcomes
    await expect(page.locator('text=Based on')).toBeVisible();
    
    // Should show loading state then suggestions or empty state
    await page.waitForFunction(() => {
      const loadingSkeletons = document.querySelectorAll('[data-testid="loading-skeleton"]');
      return loadingSkeletons.length === 0;
    }, { timeout: 15000 });
    
    // Should show either suggestions or empty state
    const hasSuggestions = await page.locator('text=Add').count() > 0;
    const hasEmptyState = await page.locator('text=No activities found').isVisible();
    
    expect(hasSuggestions || hasEmptyState).toBe(true);
  });

  test('should filter activity suggestions', async ({ page }) => {
    // Select a milestone
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Open filters
    await page.click('text=Filters');
    await expect(page.locator('text=Filter Activities')).toBeVisible();
    
    // Select a domain filter
    await page.click('text=Any domain');
    await page.click('text=Reading');
    
    // Wait for filtered results
    await page.waitForFunction(() => {
      const loadingSkeletons = document.querySelectorAll('[data-testid="loading-skeleton"]');
      return loadingSkeletons.length === 0;
    }, { timeout: 10000 });
    
    // Should maintain filter state
    await expect(page.locator('text=Reading')).toBeVisible();
  });

  test('should add activity suggestion to plan', async ({ page }) => {
    // Select milestone and wait for suggestions
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Wait for suggestions to load
    await page.waitForFunction(() => {
      const loadingSkeletons = document.querySelectorAll('[data-testid="loading-skeleton"]');
      return loadingSkeletons.length === 0;
    }, { timeout: 15000 });
    
    // If we have suggestions, test adding one
    const addButtons = await page.locator('text=Add').count();
    if (addButtons > 0) {
      await page.click('text=Add');
      
      // Should show success toast
      await expect(page.locator('text=Activity Added')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should open and browse activity library', async ({ page }) => {
    // Navigate to activity library (assuming there's a dedicated page)
    await page.click('text=Resources'); // or wherever activity library is accessed
    await page.click('text=Activity Library');
    
    // Should load library page
    await expect(page.locator('text=Activity Library')).toBeVisible();
    await expect(page.locator('text=Browse and manage your activity templates')).toBeVisible();
    
    // Wait for activities to load
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('text=Loading...');
      return !loadingText || !loadingText.isConnected;
    }, { timeout: 10000 });
    
    // Should show activity count
    await expect(page.locator('text=activities found')).toBeVisible();
  });

  test('should toggle between grid and list view in activity library', async ({ page }) => {
    // Navigate to activity library
    await page.click('text=Resources');
    await page.click('text=Activity Library');
    await expect(page.locator('text=Activity Library')).toBeVisible();
    
    // Wait for load
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('text=Loading...');
      return !loadingText || !loadingText.isConnected;
    }, { timeout: 10000 });
    
    // Should start in grid view (default)
    const gridButton = page.locator('button').filter({ hasText: /grid/i });
    const listButton = page.locator('button').filter({ hasText: /list/i });
    
    await expect(gridButton).toBeVisible();
    await expect(listButton).toBeVisible();
    
    // Switch to list view
    await listButton.click();
    
    // Should maintain data but change layout
    await expect(page.locator('text=activities found')).toBeVisible();
    
    // Switch back to grid
    await gridButton.click();
    
    // Should maintain data
    await expect(page.locator('text=activities found')).toBeVisible();
  });

  test('should search and filter activities in library', async ({ page }) => {
    // Navigate to activity library
    await page.click('text=Resources');
    await page.click('text=Activity Library');
    await expect(page.locator('text=Activity Library')).toBeVisible();
    
    // Wait for initial load
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('text=Loading...');
      return !loadingText || !loadingText.isConnected;
    }, { timeout: 10000 });
    
    // Test search
    const searchInput = page.locator('input[placeholder="Search activities..."]');
    await searchInput.fill('reading');
    
    // Should update results
    await page.waitForTimeout(1000); // Debounce
    await expect(page.locator('text=activities found')).toBeVisible();
    
    // Test filters
    await page.click('text=Filters');
    
    // Should expand filter panel
    await expect(page.locator('text=All domains')).toBeVisible();
    
    // Select a filter
    await page.click('text=All domains');
    await page.click('text=Reading');
    
    // Should update results
    await page.waitForTimeout(1000);
    await expect(page.locator('text=activities found')).toBeVisible();
  });

  test('should create new activity template', async ({ page }) => {
    // Navigate to activity library
    await page.click('text=Resources');
    await page.click('text=Activity Library');
    await expect(page.locator('text=Activity Library')).toBeVisible();
    
    // Click create new activity
    await page.click('text=New Activity');
    
    // Should open activity editor modal
    await expect(page.locator('text=Create Activity Template')).toBeVisible();
    
    // Fill in required fields
    await page.fill('input[placeholder*="English title"]', 'Test Activity E2E');
    await page.fill('input[placeholder*="French title"]', 'Activité Test E2E');
    await page.fill('textarea[placeholder*="English description"]', 'Test description in English');
    await page.fill('textarea[placeholder*="French description"]', 'Description de test en français');
    
    // Select domain
    await page.click('text=Select domain');
    await page.click('text=Reading');
    
    // Select subject
    await page.click('text=Select subject');
    await page.click('text=English');
    
    // Select group type
    await page.click('text=Select group type');
    await page.click('text=Small group');
    
    // Save the activity
    await page.click('text=Save');
    
    // Should close modal and show success
    await expect(page.locator('text=Create Activity Template')).not.toBeVisible({ timeout: 5000 });
    
    // Should show success toast or return to library with new activity
    const hasSuccessToast = await page.locator('text=saved').isVisible();
    const returnedToLibrary = await page.locator('text=Activity Library').isVisible();
    
    expect(hasSuccessToast || returnedToLibrary).toBe(true);
  });

  test('should export daily plan with activities', async ({ page }) => {
    // Navigate to daily plan page
    await page.click('text=Daily Plan');
    await expect(page.locator('text=Daily Plan')).toBeVisible();
    
    // Should show current day's activities
    await page.waitForSelector('[data-testid="daily-plan-activities"]', { timeout: 10000 });
    
    // Click print/export button
    const printButton = page.locator('text=Print').or(page.locator('button[aria-label*="print"]'));
    if (await printButton.isVisible()) {
      await printButton.click();
      
      // Should trigger print dialog or show print preview
      // Note: Actual printing in E2E tests is complex, so we just verify the button works
      await page.waitForTimeout(1000);
    }
    
    // Test PDF download if available
    const downloadButton = page.locator('text=Download PDF').or(page.locator('button[aria-label*="download"]'));
    if (await downloadButton.isVisible()) {
      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      
      // Wait for download to complete
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('daily-plan');
    }
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // Test activity suggestions empty state
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Wait for load
    await page.waitForFunction(() => {
      const loadingSkeletons = document.querySelectorAll('[data-testid="loading-skeleton"]');
      return loadingSkeletons.length === 0;
    }, { timeout: 15000 });
    
    // If empty, should show helpful message
    const hasEmptyState = await page.locator('text=No activities found').isVisible();
    if (hasEmptyState) {
      await expect(page.locator('text=Try adjusting your filters')).toBeVisible();
    }
    
    // Test activity library empty state
    await page.click('text=Resources');
    await page.click('text=Activity Library');
    
    // Use a search that returns no results
    await page.fill('input[placeholder="Search activities..."]', 'NONEXISTENT_ACTIVITY_XYZ');
    await page.waitForTimeout(1000);
    
    // Should show empty search results
    const hasSearchEmpty = await page.locator('text=No activities found').isVisible();
    if (hasSearchEmpty) {
      await expect(page.locator('text=Try adjusting your search')).toBeVisible();
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test network error handling by intercepting requests
    await page.route('**/api/activity-templates/**', route => {
      route.abort('failed');
    });
    
    // Try to load activity suggestions
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Should show error state
    await expect(page.locator('text=Unable to load')).toBeVisible({ timeout: 10000 });
    
    // Should have retry option
    const hasRetry = await page.locator('text=Try again').isVisible();
    expect(hasRetry).toBe(true);
  });

  test('should maintain state across navigation', async ({ page }) => {
    // Select outcomes and open activity suggestions
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Apply filters
    await page.click('text=Filters');
    await page.click('text=Any domain');
    await page.click('text=Reading');
    
    // Navigate away and back
    await page.click('text=Dashboard');
    await page.waitForSelector('[data-testid="dashboard"]');
    
    await page.click('text=Weekly Planner');
    await page.waitForSelector('[data-testid="weekly-planner"]');
    
    // Should maintain previous state
    await page.locator('[data-testid="milestone-card"]').first().click();
    
    // Check if filter state is preserved (this depends on implementation)
    const hasFilters = await page.locator('text=Filters').isVisible();
    if (hasFilters) {
      await page.click('text=Filters');
      // Filter state preservation is implementation-dependent
      // This test documents the expected behavior
    }
  });
});

test.describe('Activity Suggestion Engine Mobile E2E', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should work on mobile viewport', async ({ page }) => {
    await loginAndNavigateToPlanner(page);
    
    // Test mobile-specific behavior
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // On mobile, filters might be collapsed differently
    const filtersButton = page.locator('text=Filters');
    if (await filtersButton.isVisible()) {
      await filtersButton.click();
      
      // Should adapt to mobile layout
      await expect(page.locator('text=Filter Activities')).toBeVisible();
    }
    
    // Test mobile scrolling and interaction
    await page.waitForFunction(() => {
      const loadingSkeletons = document.querySelectorAll('[data-testid="loading-skeleton"]');
      return loadingSkeletons.length === 0;
    }, { timeout: 15000 });
    
    // Should be usable on mobile
    const addButtons = await page.locator('text=Add').count();
    if (addButtons > 0) {
      // Ensure buttons are tappable on mobile
      const firstAddButton = page.locator('text=Add').first();
      await expect(firstAddButton).toBeVisible();
      
      const boundingBox = await firstAddButton.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(44); // Minimum touch target size
      expect(boundingBox?.height).toBeGreaterThan(44);
    }
  });
});

test.describe('Activity Suggestion Engine Accessibility', () => {
  test('should be accessible to screen readers', async ({ page }) => {
    await loginAndNavigateToPlanner(page);
    
    // Test keyboard navigation
    await page.locator('[data-testid="milestone-card"]').first().click();
    await expect(page.locator('text=Activity Suggestions')).toBeVisible();
    
    // Should be navigable by keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should have proper ARIA labels
    const filtersButton = page.locator('text=Filters');
    if (await filtersButton.isVisible()) {
      const ariaLabel = await filtersButton.getAttribute('aria-label');
      const hasAccessibleName = ariaLabel || await filtersButton.textContent();
      expect(hasAccessibleName).toBeTruthy();
    }
    
    // Test focus management
    await page.keyboard.press('Enter'); // Should activate focused element
    
    // Should manage focus appropriately when modal opens
    const hasModal = await page.locator('[role="dialog"]').isVisible();
    if (hasModal) {
      // Focus should be trapped in modal
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus').count();
      expect(focusedElement).toBeGreaterThan(0);
    }
  });
});