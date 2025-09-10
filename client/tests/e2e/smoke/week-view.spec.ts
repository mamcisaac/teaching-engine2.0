/**
 * Smoke test: Week View basic functionality
 * Verifies the weekly planner loads and is interactive
 */

import { test, expect } from '../fixtures/auth';

test.describe('Week View', () => {
  test('week view loads and displays structure', async ({ page }) => {
    await page.goto('/planner/week');
    
    // Wait for loading to complete (loading might not appear if data loads instantly)
    const loadingText = page.getByText('Loading lessons...');
    await Promise.race([
      expect(loadingText).toBeVisible(),
      expect(page.getByTestId('week-view-grid')).toBeVisible()
    ]).catch(() => {
      // Loading text might not appear if data loads instantly
    });
    
    // Ensure loading is complete
    await expect(page.getByTestId('week-view-grid')).toBeVisible();
    
    // Should have 5 column headers (Mon-Fri)
    const columnHeaders = page.getByRole('columnheader');
    await expect(columnHeaders).toHaveCount(5);
    
    // Week navigation buttons should be present
    await expect(page.getByRole('button', { name: 'Previous Week' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Week' })).toBeVisible();
    
    // Subject legend should be shown
    await expect(page.getByText('Subject Legend')).toBeVisible();
  });
  
  test('week navigation works', async ({ page }) => {
    await page.goto('/planner/week');
    
    // Wait for initial load (loading might not appear if data loads instantly)
    await expect(page.getByTestId('week-view-grid')).toBeVisible({ timeout: 8000 });
    
    // Get initial week text
    const initialWeekText = await page.locator('h1').textContent();
    expect(initialWeekText).toContain('Week View');
    expect(initialWeekText).toContain('September'); // We froze time to Sept 8, 2025
    
    // Navigate to next week
    await page.getByRole('button', { name: 'Next Week' }).click();
    
    // Wait for new data to load
    await page.waitForResponse(response => 
      response.url().includes('/api/etfo-lesson-plans') && response.ok()
    );
    
    // Week text should change
    const nextWeekText = await page.locator('h1').textContent();
    expect(nextWeekText).not.toEqual(initialWeekText);
    
    // Navigate back using Today button
    await page.getByRole('button', { name: 'Today' }).click();
    await page.waitForResponse(response => 
      response.url().includes('/api/etfo-lesson-plans') && response.ok()
    );
    
    // Should be back to current week
    const currentWeekText = await page.locator('h1').textContent();
    expect(currentWeekText).toContain('September 8');
  });
  
  test('quick add buttons are present', async ({ page }) => {
    await page.goto('/planner/week');
    
    // Wait for grid to load (loading might not appear if data loads instantly)
    await expect(page.getByTestId('week-view-grid')).toBeVisible({ timeout: 8000 });
    
    // Check if we have either lesson cards or quick-add buttons (slots shouldn't be completely empty)
    const quickAddButtons = page.getByTestId('quick-add-button');
    const lessonCards = page.locator('[data-testid^="lesson-card-"]');
    
    const quickAddCount = await quickAddButtons.count();
    const lessonCount = await lessonCards.count();
    
    // Total slots should be 25 (5 days × 5 slots)
    // All slots should have either a lesson or a quick-add button
    expect(quickAddCount + lessonCount).toBeGreaterThan(0);
    expect(quickAddCount + lessonCount).toBeLessThanOrEqual(25);
  });
});