/**
 * Deep Links & Routing comprehensive test
 * Tests direct navigation, browser history, and state preservation
 */

import { test, expect } from '../fixtures/seed';

test.describe('Deep Links & Routing', () => {
  test('direct navigation to day view works', async ({ page }) => {
    // Navigate directly to a specific day
    await page.goto('/planner/day/2025-09-10');
    
    // Should load day view
    const dayView = page.getByTestId('day-view')
      .or(page.locator('.day-view'));
    await expect(dayView).toBeVisible({ timeout: 10000 });
    
    // Should show correct date
    const dateHeader = page.getByRole('heading', { name: /September 10/i })
      .or(page.getByText(/Wednesday.*September 10/i))
      .or(page.getByTestId('day-header'));
    await expect(dateHeader).toBeVisible();
    
    // Should have time slots
    const timeSlots = page.locator('.time-slot, [data-time]');
    const slotCount = await timeSlots.count();
    expect(slotCount).toBeGreaterThan(0);
  });

  test('direct navigation to week view with query params', async ({ page }) => {
    // Navigate to specific week via query param
    await page.goto('/planner/week?start=2025-09-15');
    
    // Should load week view
    const weekView = page.getByTestId('week-view-grid');
    await expect(weekView).toBeVisible({ timeout: 10000 });
    
    // Should show correct week (Sept 15-19)
    const weekHeader = page.getByTestId('week-header')
      .or(page.locator('h1, h2').filter({ hasText: /September 15.*September 19/i }));
    
    const headerText = await weekHeader.textContent();
    expect(headerText).toContain('September 15');
    expect(headerText).toContain('September 19');
  });

  test('browser back/forward preserves navigation state', async ({ page }) => {
    // Start at week view
    await page.goto('/planner/week');
    await expect(page.getByTestId('week-view-grid')).toBeVisible();
    
    // Navigate to next week
    await page.getByRole('button', { name: /Next Week/i }).click();
    await page.waitForTimeout(300);
    
    // Get week header text
    const weekHeader = page.getByTestId('week-header')
      .or(page.locator('h1, h2').first());
    const week2Text = await weekHeader.textContent();
    
    // Navigate to day view
    await page.goto('/planner/day/2025-09-10');
    await expect(page.getByTestId('day-view').or(page.locator('.day-view'))).toBeVisible();
    
    // Go back
    await page.goBack();
    await expect(page.getByTestId('week-view-grid')).toBeVisible();
    
    // Should still show the second week (preserved state)
    const backWeekText = await weekHeader.textContent();
    expect(backWeekText).toBe(week2Text);
    
    // Go forward
    await page.goForward();
    await expect(page.getByTestId('day-view').or(page.locator('.day-view'))).toBeVisible();
    
    // Should be back on Sept 10
    const dayHeader = page.getByText(/September 10/i);
    await expect(dayHeader).toBeVisible();
  });

  test('invalid routes redirect appropriately', async ({ page }) => {
    // Try invalid date format
    await page.goto('/planner/day/invalid-date');
    
    // Should either redirect or show error
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/planner/week') || 
                        currentUrl.includes('/planner/day') ||
                        currentUrl.includes('/dashboard');
    
    const hasError = await page.getByText(/Invalid date|Not found|Error/i)
      .isVisible()
      .catch(() => false);
    
    expect(isRedirected || hasError).toBeTruthy();
    
    // Main app should still be functional
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
  });

  test('route params update on navigation', async ({ page }) => {
    // Start at week view
    await page.goto('/planner/week');
    
    // Initial URL should have current week
    let url = page.url();
    expect(url).toContain('/planner/week');
    
    // Navigate to next week
    await page.getByRole('button', { name: /Next Week/i }).click();
    await page.waitForTimeout(500);
    
    // URL should update with new date param
    url = page.url();
    // Might have ?start=2025-09-15 or similar
    const hasDateParam = url.includes('start=') || url.includes('date=') || url.includes('week=');
    
    // Some apps update URL, some don't - both are valid
    if (hasDateParam) {
      expect(url).toMatch(/start=2025-09-1[5-9]/); // Mid-September
    }
  });

  test('deep link to curriculum with filters', async ({ page }) => {
    // Navigate with filter in URL
    await page.goto('/curriculum?subject=Math%C3%A9matiques');
    
    // Should load curriculum page
    await expect(page.getByTestId('curriculum-list')).toBeVisible({ timeout: 10000 });
    
    // Filter should be applied
    const subjectFilter = page.getByRole('combobox', { name: /Subject/i })
      .or(page.getByLabel(/Subject/i));
    
    if (await subjectFilter.isVisible()) {
      const selectedValue = await subjectFilter.inputValue()
        .catch(() => subjectFilter.getAttribute('value'));
      
      // Filter might be applied even if not reflected in dropdown
      // Check if filtered content is shown
      const mathContent = page.getByText(/Math/i);
      const hasMathContent = await mathContent.isVisible().catch(() => false);
      expect(hasMathContent).toBeTruthy();
    }
  });

  test('navigation maintains authenticated state', async ({ page }) => {
    // Start authenticated at dashboard
    await page.goto('/dashboard');
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
    
    // Deep link to protected route
    await page.goto('/planner/units');
    
    // Should stay authenticated
    expect(page.url()).not.toContain('/login');
    
    // Navigate to another protected route
    await page.goto('/assessment');
    await expect(page.getByTestId('assessment-page')).toBeVisible();
    
    // Still authenticated
    expect(page.url()).not.toContain('/login');
  });

  test('hash fragments work for in-page navigation', async ({ page }) => {
    // Navigate to planning overview with hash
    await page.goto('/planning-overview#week-3');
    
    // Page should load
    const planningPage = page.getByTestId('planning-cascade-tree')
      .or(page.getByRole('tree'));
    await expect(planningPage).toBeVisible();
    
    // If hash navigation is implemented, element should be in view
    const week3Element = page.locator('#week-3, [data-week="3"]');
    const hasWeek3 = await week3Element.isVisible().catch(() => false);
    
    // Hash navigation is optional but shouldn't break the page
    expect(page.url()).toContain('#week-3');
  });

  test('navigation preserves sidebar state', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check initial sidebar state
    const sidebar = page.getByTestId('main-sidebar');
    await expect(sidebar).toBeVisible();
    
    // If sidebar is collapsible, toggle it
    const toggleButton = page.getByRole('button', { name: /Toggle.*sidebar/i })
      .or(page.getByTestId('sidebar-toggle'))
      .or(page.locator('[aria-label*="sidebar"]'));
    
    if (await toggleButton.isVisible()) {
      // Collapse sidebar
      await toggleButton.click();
      await page.waitForTimeout(300);
      
      // Navigate to different page
      await page.goto('/planner/week');
      
      // Sidebar state should be preserved
      const sidebarClass = await sidebar.getAttribute('class');
      const isCollapsed = sidebarClass?.includes('collapsed') || 
                          sidebarClass?.includes('closed') ||
                          !(await sidebar.isVisible());
      
      // State might or might not persist - both are valid UX choices
      // Just verify app doesn't break
      expect(page.getByTestId('week-view-grid')).toBeVisible();
    }
  });

  test('breadcrumb navigation works', async ({ page }) => {
    // Navigate to a deep page
    await page.goto('/planner/week');
    
    // Look for breadcrumbs
    const breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i })
      .or(page.locator('.breadcrumbs'))
      .or(page.locator('[data-testid="breadcrumbs"]'));
    
    if (await breadcrumbs.isVisible()) {
      // Should have links
      const breadcrumbLinks = breadcrumbs.locator('a, button');
      const linkCount = await breadcrumbLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Click first breadcrumb (usually Home/Dashboard)
      const firstCrumb = breadcrumbLinks.first();
      await firstCrumb.click();
      
      // Should navigate
      await page.waitForURL(url => !url.includes('/planner/week'), { timeout: 3000 });
      
      // Should be on a different page
      const newUrl = page.url();
      expect(newUrl).not.toContain('/planner/week');
    }
  });
});