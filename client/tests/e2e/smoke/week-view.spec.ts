/**
 * Smoke test: Week View basic functionality
 * Verifies the weekly planner loads and is interactive
 */

import { test, expect } from '../fixtures/seed';

test.describe('Week View', () => {
  test('week view loads and displays structure', async ({ page, seedData }) => {
    await page.goto('/planner/week');
    
    // Wait for loading to complete
    const loadingText = page.getByText('Loading lessons...');
    await expect(loadingText).toBeVisible();
    await expect(loadingText).toBeHidden({ timeout: 8000 });
    
    // Grid should be visible
    await expect(page.getByTestId('week-view-grid')).toBeVisible();
    
    // Should have 6 column headers (Lesson Slots + Mon-Fri)
    const columnHeaders = page.getByRole('columnheader');
    await expect(columnHeaders).toHaveCount(6);
    
    // Week navigation buttons should be present
    await expect(page.getByRole('button', { name: 'Previous Week' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Week' })).toBeVisible();
    
    // Subject legend should be shown
    await expect(page.getByText('Subject Legend')).toBeVisible();
  });
  
  test('week navigation works', async ({ page, seedData }) => {
    await page.goto('/planner/week');
    
    // Wait for initial load
    await expect(page.getByText('Loading lessons...')).toBeHidden({ timeout: 8000 });
    
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
  
  test('quick add buttons are present', async ({ page, seedData }) => {
    await page.goto('/planner/week');
    
    // Wait for grid to load
    await expect(page.getByTestId('week-view-grid')).toBeVisible();
    await expect(page.getByText('Loading lessons...')).toBeHidden({ timeout: 8000 });
    
    // Should have quick-add buttons in empty slots
    const quickAddButtons = page.getByTestId('quick-add-button');
    const count = await quickAddButtons.count();
    
    // With 30 lessons in smoke data and 25 slots per week (5 days × 5 slots),
    // we should have some empty slots with quick-add buttons
    expect(count).toBeGreaterThan(0);
  });
});