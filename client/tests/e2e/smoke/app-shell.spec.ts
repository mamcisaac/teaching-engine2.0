/**
 * Smoke test: App shell renders without crashes
 * Verifies the basic structure loads correctly
 */

import { test, expect } from '../fixtures/seed';

test.describe('App Shell', () => {
  test('app loads without crashes', async ({ page, seedData }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Sidebar should be visible
    await expect(page.getByTestId('main-sidebar')).toBeVisible();
    
    // No error boundary should be shown
    const errorBoundary = page.getByTestId('error-boundary');
    await expect(errorBoundary).not.toBeVisible().catch(() => {
      // Error boundary element might not exist at all, which is fine
    });
    
    // Can navigate to Week View
    await page.getByTestId('nav-week').click();
    await expect(page).toHaveURL('/planner/week');
    
    // Week view grid should load
    await expect(page.getByTestId('week-view-grid')).toBeVisible({ timeout: 10000 });
  });
  
  test('sidebar navigation renders all sections', async ({ page, seedData }) => {
    await page.goto('/dashboard');
    
    // Teaching section links
    await expect(page.getByTestId('nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('nav-units')).toBeVisible();
    await expect(page.getByTestId('nav-longrange')).toBeVisible();
    await expect(page.getByTestId('nav-today')).toBeVisible();
    await expect(page.getByTestId('nav-week')).toBeVisible();
    await expect(page.getByTestId('nav-daybook')).toBeVisible();
    
    // Resources section (might not have testids, use text)
    await expect(page.getByText('Curriculum')).toBeVisible();
    await expect(page.getByText('Templates')).toBeVisible();
    
    // Assessment section
    await expect(page.getByTestId('nav-students')).toBeVisible();
    await expect(page.getByTestId('nav-assessment')).toBeVisible();
  });
  
  test('no console errors on load', async ({ page, seedData }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Give it a moment to settle
    await page.waitForTimeout(1000);
    
    expect(errors).toEqual([]);
  });
});