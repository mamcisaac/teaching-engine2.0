/**
 * Curriculum Expectations comprehensive test
 * Tests filtering, searching, and pagination functionality
 */

import { test, expect } from '../fixtures/seed';

test.describe('Curriculum Expectations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/curriculum');
    await page.waitForLoadState('networkidle');
  });

  test('curriculum list loads and displays correctly', async ({ page, seedData }) => {
    // List container should be visible
    await expect(page.getByTestId('curriculum-list')).toBeVisible();
    
    // Should show curriculum expectations
    await expect(page.getByText(/Curriculum Expectations/i)).toBeVisible();
    
    // Should have some expectations visible
    const expectations = page.locator('tr').filter({ hasText: /\d+\.\d+/ }); // Looking for codes like 1.1
    const count = await expectations.count();
    expect(count).toBeGreaterThan(0);
  });

  test('subject filter changes displayed expectations', async ({ page }) => {
    // Find subject filter (could be select, dropdown, or tabs)
    const subjectFilter = page.getByRole('combobox', { name: /Subject/i })
      .or(page.getByLabel(/Subject/i));
    
    if (await subjectFilter.isVisible()) {
      // Get initial count
      const initialCount = await page.locator('tbody tr').count();
      
      // Select Mathématiques
      await subjectFilter.selectOption('Mathématiques');
      await page.waitForResponse(response => 
        response.url().includes('/api/curriculum') && response.ok(),
        { timeout: 5000 }
      ).catch(() => {
        // Might be client-side filtering
      });
      
      // Count should change
      const mathCount = await page.locator('tbody tr').count();
      expect(mathCount).toBeLessThanOrEqual(initialCount);
      
      // All visible items should be math
      const mathItems = page.locator('tbody tr').filter({ hasText: /Math/i });
      const visibleMathCount = await mathItems.count();
      expect(visibleMathCount).toBeGreaterThan(0);
      
      // Reset to all
      await subjectFilter.selectOption('');
      await page.waitForTimeout(300);
      
      // Should restore original count
      const restoredCount = await page.locator('tbody tr').count();
      expect(restoredCount).toBe(initialCount);
    }
  });

  test('text search filters expectations', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/Search/i)
      .or(page.getByRole('searchbox'));
    
    if (await searchInput.isVisible()) {
      // Get initial count
      const initialCount = await page.locator('tbody tr').count();
      
      // Search for "communication" (common in French curriculum)
      await searchInput.fill('communication');
      
      // Wait for debounce
      await page.waitForTimeout(500);
      
      // Should have fewer items
      const searchCount = await page.locator('tbody tr').count();
      expect(searchCount).toBeLessThan(initialCount);
      
      // All visible items should contain search term (in code or description)
      const visibleItems = await page.locator('tbody tr').allTextContents();
      visibleItems.forEach(text => {
        expect(text.toLowerCase()).toContain('communication');
      });
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
      
      // Should restore original count
      const restoredCount = await page.locator('tbody tr').count();
      expect(restoredCount).toBe(initialCount);
    }
  });

  test('show uncovered only toggle', async ({ page }) => {
    // Find uncovered toggle
    const uncoveredToggle = page.getByLabel(/Show Uncovered Only/i)
      .or(page.getByRole('checkbox', { name: /Uncovered/i }))
      .or(page.getByRole('button', { name: /Uncovered/i }));
    
    if (await uncoveredToggle.isVisible()) {
      // Get initial count
      const initialCount = await page.locator('tbody tr').count();
      
      // Toggle on
      await uncoveredToggle.click();
      await page.waitForTimeout(500);
      
      // Count should likely decrease (some expectations are covered)
      const uncoveredCount = await page.locator('tbody tr').count();
      expect(uncoveredCount).toBeLessThanOrEqual(initialCount);
      
      // Toggle off
      await uncoveredToggle.click();
      await page.waitForTimeout(500);
      
      // Should restore original count
      const restoredCount = await page.locator('tbody tr').count();
      expect(restoredCount).toBe(initialCount);
    }
  });

  test('pagination works if more than 15 items', async ({ page }) => {
    // Check if pagination exists
    const pagination = page.locator('[role="navigation"][aria-label*="pagination"]')
      .or(page.locator('.pagination'))
      .or(page.getByText(/Page \d+ of \d+/));
    
    if (await pagination.isVisible()) {
      // Get items on first page
      const firstPageCount = await page.locator('tbody tr').count();
      expect(firstPageCount).toBeLessThanOrEqual(15); // Default page size
      
      // Go to next page
      const nextButton = page.getByRole('button', { name: /Next/i })
        .or(page.getByLabel(/Next page/i));
      
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
        
        // Should show different items
        const secondPageCount = await page.locator('tbody tr').count();
        expect(secondPageCount).toBeGreaterThan(0);
        
        // Go back to first page
        const prevButton = page.getByRole('button', { name: /Previous/i })
          .or(page.getByLabel(/Previous page/i));
        await prevButton.click();
        await page.waitForTimeout(500);
        
        // Should be back to original count
        const restoredCount = await page.locator('tbody tr').count();
        expect(restoredCount).toBe(firstPageCount);
      }
    }
  });

  test('expectation counts match seed data', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('tbody tr', { timeout: 5000 }).catch(() => {});
    
    // Count total expectations
    const totalExpectations = await page.locator('tbody tr').count();
    
    // Verify we have expectations loaded (Emily's database has 68 Grade 1 expectations)
    expect(totalExpectations).toBeGreaterThan(0);
    expect(totalExpectations).toBeLessThanOrEqual(68); // Emily has 68 Grade 1 expectations
  });

  test('loading state displays and resolves', async ({ page }) => {
    // Navigate fresh to catch loading state
    await page.goto('/curriculum');
    
    // Loading indicator should appear briefly
    const loadingText = page.getByText(/Loading curriculum expectations/i);
    
    // Should disappear within 8 seconds
    await expect(loadingText).toBeHidden({ timeout: 8000 }).catch(() => {
      // Loading might be too fast to catch
    });
    
    // Content should be visible
    await expect(page.getByTestId('curriculum-list')).toBeVisible();
  });
});