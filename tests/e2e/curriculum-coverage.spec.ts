/**
 * E2E Test Suite for Curriculum Coverage Dashboard
 * Issue #306: Curriculum Coverage Dashboard + Uncovered Expectations List with Quick-Plan
 * 
 * ETFO Alignment: Ensures all 68 Grade 1 French Immersion expectations are covered
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Curriculum Coverage Dashboard', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Login as Emily McIsaac
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'emily.mcisaac@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await page.waitForURL(/dashboard|week/);
  });

  test.describe('Coverage Widget Display', () => {
    test('should show subject-level coverage bars on dashboard', async () => {
      // Navigate to dashboard or ensure widget is visible
      await page.goto('/dashboard');
      
      // Coverage widget should be visible
      await expect(page.locator('[data-testid="coverage-widget"]')).toBeVisible();
      
      // Should show all 6 subjects for Grade 1 French Immersion
      const subjects = [
        'Français (Immersion)',
        'Mathématiques',
        'Sciences de la nature',
        'Sciences humaines',
        'Arts visuels',
        'Formation personnelle et sociale'
      ];
      
      for (const subject of subjects) {
        const subjectBar = page.locator(`[data-testid="coverage-bar-${subject}"]`);
        await expect(subjectBar).toBeVisible();
        
        // Each should show percentage
        const percentage = await subjectBar.locator('[data-testid="coverage-percentage"]').textContent();
        expect(percentage).toMatch(/\d+%/);
      }
    });

    test('should show accurate coverage totals', async () => {
      await page.goto('/dashboard');
      
      // Check French Language Arts (15 expectations)
      const frenchBar = page.locator('[data-testid="coverage-bar-Français (Immersion)"]');
      const frenchStats = await frenchBar.locator('[data-testid="coverage-stats"]').textContent();
      
      // Should show format like "8/15 covered"
      expect(frenchStats).toMatch(/\d+\/15/);
      
      // Check Mathematics (14 expectations)
      const mathBar = page.locator('[data-testid="coverage-bar-Mathématiques"]');
      const mathStats = await mathBar.locator('[data-testid="coverage-stats"]').textContent();
      expect(mathStats).toMatch(/\d+\/14/);
    });

    test('should calculate percentages correctly', async () => {
      await page.goto('/dashboard');
      
      // Get coverage data for verification
      const coverageData = await page.evaluate(() => {
        // This would be extracted from the actual rendered data
        return {
          french: { covered: 8, total: 15 },
          math: { covered: 10, total: 14 }
        };
      });
      
      // Verify French percentage (8/15 = 53%)
      const frenchPercentage = await page.locator('[data-testid="coverage-bar-Français (Immersion)"] [data-testid="coverage-percentage"]').textContent();
      expect(frenchPercentage).toBe('53%');
      
      // Verify Math percentage (10/14 = 71%)
      const mathPercentage = await page.locator('[data-testid="coverage-bar-Mathématiques"] [data-testid="coverage-percentage"]').textContent();
      expect(mathPercentage).toBe('71%');
    });

    test('should use visual indicators for coverage levels', async () => {
      await page.goto('/dashboard');
      
      // Different colors/styles based on coverage percentage
      const bars = page.locator('[data-testid^="coverage-bar-"]');
      const count = await bars.count();
      
      for (let i = 0; i < count; i++) {
        const bar = bars.nth(i);
        const percentage = parseInt(await bar.locator('[data-testid="coverage-percentage"]').textContent() || '0');
        
        if (percentage < 30) {
          await expect(bar).toHaveClass(/coverage-low/); // Red
        } else if (percentage < 70) {
          await expect(bar).toHaveClass(/coverage-medium/); // Yellow
        } else {
          await expect(bar).toHaveClass(/coverage-high/); // Green
        }
      }
    });
  });

  test.describe('Drill-Down to Uncovered Expectations', () => {
    test('should navigate to detailed coverage page', async () => {
      await page.goto('/dashboard');
      
      // Click on a subject bar to drill down
      await page.click('[data-testid="coverage-bar-Mathématiques"]');
      
      // Should navigate to coverage detail page
      await page.waitForURL('/coverage/Mathématiques');
      
      // Page should show detailed expectations list
      await expect(page.locator('[data-testid="expectations-list"]')).toBeVisible();
    });

    test('should show list of uncovered expectations with codes and descriptions', async () => {
      await page.goto('/coverage');
      
      // Uncovered expectations list should be visible
      await expect(page.locator('[data-testid="uncovered-expectations"]')).toBeVisible();
      
      // Each expectation should show code and description
      const expectations = page.locator('[data-testid="uncovered-expectation-row"]');
      const firstExpectation = expectations.first();
      
      // Should have code (e.g., "MATH.1.NS.2")
      await expect(firstExpectation.locator('[data-testid="expectation-code"]')).toBeVisible();
      const code = await firstExpectation.locator('[data-testid="expectation-code"]').textContent();
      expect(code).toMatch(/[A-Z]+\.\d+\.[A-Z]+\.\d+/);
      
      // Should have description
      await expect(firstExpectation.locator('[data-testid="expectation-description"]')).toBeVisible();
      const description = await firstExpectation.locator('[data-testid="expectation-description"]').textContent();
      expect(description?.length).toBeGreaterThan(10);
    });

    test('should have "Plan Lesson" button for each uncovered expectation', async () => {
      await page.goto('/coverage');
      
      const uncoveredRows = page.locator('[data-testid="uncovered-expectation-row"]');
      const count = await uncoveredRows.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) { // Check first 3
        const row = uncoveredRows.nth(i);
        const planButton = row.locator('[data-testid="plan-lesson-button"]');
        
        await expect(planButton).toBeVisible();
        await expect(planButton).toHaveText('Plan Lesson');
      }
    });

    test('should open lesson modal pre-linked to expectation', async () => {
      await page.goto('/coverage');
      
      // Get the expectation code before clicking
      const firstRow = page.locator('[data-testid="uncovered-expectation-row"]').first();
      const expectationCode = await firstRow.locator('[data-testid="expectation-code"]').textContent();
      
      // Click "Plan Lesson"
      await firstRow.locator('[data-testid="plan-lesson-button"]').click();
      
      // Lesson modal should open
      await expect(page.locator('[data-testid="lesson-modal"]')).toBeVisible();
      
      // Expectation should be pre-selected
      const selectedExpectations = page.locator('[data-testid="selected-expectations"]');
      await expect(selectedExpectations).toContainText(expectationCode || '');
      
      // Expectation should not be removable (locked)
      const expectationChip = selectedExpectations.locator(`[data-testid="expectation-chip-${expectationCode}"]`);
      await expect(expectationChip).toHaveClass(/locked/);
    });

    test('should update coverage immediately after lesson creation', async () => {
      await page.goto('/coverage');
      
      // Get initial uncovered count
      const initialCount = await page.locator('[data-testid="uncovered-count"]').textContent();
      
      // Plan a lesson for first uncovered expectation
      const firstRow = page.locator('[data-testid="uncovered-expectation-row"]').first();
      const expectationCode = await firstRow.locator('[data-testid="expectation-code"]').textContent();
      
      await firstRow.locator('[data-testid="plan-lesson-button"]').click();
      
      // Fill minimal lesson details
      await page.fill('[data-testid="lesson-title-input"]', 'Coverage Test Lesson');
      await page.click('[data-testid="save-lesson-button"]');
      
      // Wait for modal to close
      await expect(page.locator('[data-testid="lesson-modal"]')).not.toBeVisible();
      
      // Expectation should disappear from uncovered list
      await expect(page.locator(`[data-testid="expectation-code"]:has-text("${expectationCode}")`)).not.toBeVisible();
      
      // Count should decrease
      const newCount = await page.locator('[data-testid="uncovered-count"]').textContent();
      expect(parseInt(newCount || '0')).toBeLessThan(parseInt(initialCount || '0'));
    });
  });

  test.describe('Filtering and Search', () => {
    test('should filter to show uncovered expectations only', async () => {
      await page.goto('/coverage');
      
      // Toggle should exist
      await expect(page.locator('[data-testid="show-uncovered-toggle"]')).toBeVisible();
      
      // Initially might show all expectations
      await page.click('[data-testid="show-all-expectations"]');
      let allRows = await page.locator('[data-testid^="expectation-row"]').count();
      
      // Toggle to uncovered only
      await page.click('[data-testid="show-uncovered-toggle"]');
      let uncoveredRows = await page.locator('[data-testid="uncovered-expectation-row"]').count();
      
      expect(uncoveredRows).toBeLessThanOrEqual(allRows);
      
      // All visible should be uncovered
      const visibleRows = page.locator('[data-testid^="expectation-row"]:visible');
      const visibleCount = await visibleRows.count();
      
      for (let i = 0; i < visibleCount; i++) {
        const row = visibleRows.nth(i);
        await expect(row).toHaveClass(/uncovered/);
      }
    });

    test('should search expectations by code', async () => {
      await page.goto('/coverage');
      
      // Search for specific code pattern
      await page.fill('[data-testid="expectation-search"]', 'MATH.1.NS');
      
      // Only Number Sense math expectations should show
      const visibleRows = page.locator('[data-testid^="expectation-row"]:visible');
      const count = await visibleRows.count();
      
      for (let i = 0; i < count; i++) {
        const code = await visibleRows.nth(i).locator('[data-testid="expectation-code"]').textContent();
        expect(code).toContain('MATH.1.NS');
      }
    });

    test('should search expectations by description text', async () => {
      await page.goto('/coverage');
      
      // Search for description keyword
      await page.fill('[data-testid="expectation-search"]', 'counting');
      
      // All visible expectations should have "counting" in description
      const visibleRows = page.locator('[data-testid^="expectation-row"]:visible');
      const count = await visibleRows.count();
      
      for (let i = 0; i < count; i++) {
        const description = await visibleRows.nth(i).locator('[data-testid="expectation-description"]').textContent();
        expect(description?.toLowerCase()).toContain('counting');
      }
    });

    test('should combine filters and search', async () => {
      await page.goto('/coverage');
      
      // Show uncovered only
      await page.click('[data-testid="show-uncovered-toggle"]');
      
      // Search within uncovered
      await page.fill('[data-testid="expectation-search"]', 'A1.2');
      
      // Results should be both uncovered AND match search
      const visibleRows = page.locator('[data-testid^="expectation-row"]:visible');
      const count = await visibleRows.count();
      
      if (count > 0) {
        const firstRow = visibleRows.first();
        await expect(firstRow).toHaveClass(/uncovered/);
        const code = await firstRow.locator('[data-testid="expectation-code"]').textContent();
        expect(code).toContain('A1.2');
      }
    });
  });

  test.describe('Visual Coverage Indicators', () => {
    test('should show checkmarks for covered expectations', async () => {
      await page.goto('/coverage');
      await page.click('[data-testid="show-all-expectations"]');
      
      const coveredRows = page.locator('[data-testid="covered-expectation-row"]');
      const count = await coveredRows.count();
      
      if (count > 0) {
        const firstCovered = coveredRows.first();
        
        // Should have checkmark icon
        await expect(firstCovered.locator('[data-testid="covered-checkmark"]')).toBeVisible();
        await expect(firstCovered.locator('[data-testid="covered-checkmark"]')).toHaveText('✓');
        
        // Should have different styling
        await expect(firstCovered).toHaveClass(/covered/);
      }
    });

    test('should show flags or warnings for uncovered expectations', async () => {
      await page.goto('/coverage');
      
      const uncoveredRows = page.locator('[data-testid="uncovered-expectation-row"]');
      const firstUncovered = uncoveredRows.first();
      
      // Should have flag/warning icon
      await expect(firstUncovered.locator('[data-testid="uncovered-flag"]')).toBeVisible();
      
      // Should have attention-grabbing styling
      await expect(firstUncovered).toHaveClass(/attention/);
    });

    test('should highlight curriculum browser with uncovered expectations', async () => {
      await page.goto('/coverage');
      
      // Click link to curriculum browser
      await page.click('[data-testid="view-curriculum-browser"]');
      
      // Browser should open with highlighting enabled
      await page.waitForURL('/curriculum');
      await expect(page.locator('[data-testid="highlight-uncovered-enabled"]')).toBeChecked();
      
      // Uncovered expectations should be highlighted
      const uncoveredInBrowser = page.locator('[data-testid="curriculum-expectation"].uncovered');
      const count = await uncoveredInBrowser.count();
      expect(count).toBeGreaterThan(0);
      
      // Should have visual distinction
      const firstUncovered = uncoveredInBrowser.first();
      await expect(firstUncovered).toHaveClass(/highlighted/);
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load coverage data within 2 seconds', async () => {
      const startTime = Date.now();
      
      await page.goto('/coverage');
      await page.waitForSelector('[data-testid="uncovered-expectations"]');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });

    test('should use virtualized list for long expectation lists', async () => {
      await page.goto('/coverage');
      await page.click('[data-testid="show-all-expectations"]');
      
      // Check that virtualization is active
      const container = page.locator('[data-testid="expectations-list-container"]');
      const virtualizedList = container.locator('[data-testid="virtualized-list"]');
      
      await expect(virtualizedList).toBeVisible();
      
      // Should only render visible items
      const renderedRows = await page.locator('[data-testid^="expectation-row"]').count();
      
      // For 68 total expectations, should render fewer if virtualized
      expect(renderedRows).toBeLessThan(68);
      
      // Scrolling should load more
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);
      
      const newRenderedRows = await page.locator('[data-testid^="expectation-row"]').count();
      expect(newRenderedRows).toBeGreaterThanOrEqual(renderedRows);
    });

    test('should cache coverage calculations', async () => {
      await page.goto('/coverage');
      
      // Record initial load time
      const startTime = Date.now();
      await page.waitForSelector('[data-testid="coverage-loaded"]');
      const firstLoadTime = Date.now() - startTime;
      
      // Navigate away and back
      await page.goto('/dashboard');
      await page.goto('/coverage');
      
      // Second load should be faster (cached)
      const secondStartTime = Date.now();
      await page.waitForSelector('[data-testid="coverage-loaded"]');
      const secondLoadTime = Date.now() - secondStartTime;
      
      expect(secondLoadTime).toBeLessThan(firstLoadTime * 0.5);
    });
  });

  test.describe('Integration with Curriculum Browser', () => {
    test('should link to full curriculum browser', async () => {
      await page.goto('/coverage');
      
      // Link should be present
      await expect(page.locator('[data-testid="view-curriculum-browser"]')).toBeVisible();
      
      // Click to navigate
      await page.click('[data-testid="view-curriculum-browser"]');
      await page.waitForURL('/curriculum');
      
      // Should maintain context (subject filter if applicable)
      const urlParams = new URL(page.url()).searchParams;
      expect(urlParams.has('highlight')).toBeTruthy();
      expect(urlParams.get('highlight')).toBe('uncovered');
    });

    test('should allow drilling into specific strands', async () => {
      await page.goto('/coverage/Mathématiques');
      
      // Should show strand breakdown
      const strands = ['Number Sense', 'Measurement', 'Geometry', 'Patterning', 'Data Management'];
      
      for (const strand of strands) {
        const strandSection = page.locator(`[data-testid="strand-${strand}"]`);
        await expect(strandSection).toBeVisible();
        
        // Each strand should show its own coverage
        const strandCoverage = strandSection.locator('[data-testid="strand-coverage"]');
        await expect(strandCoverage).toContainText(/\d+\/\d+/);
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display coverage widget on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      
      // Coverage widget should still be visible
      await expect(page.locator('[data-testid="coverage-widget"]')).toBeVisible();
      
      // Bars should stack vertically
      const bars = page.locator('[data-testid^="coverage-bar-"]');
      const firstBar = await bars.first().boundingBox();
      const secondBar = await bars.nth(1).boundingBox();
      
      // Second bar should be below first (vertical stacking)
      expect(secondBar?.y).toBeGreaterThan(firstBar?.y || 0);
    });

    test('should have touch-friendly Plan Lesson buttons', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/coverage');
      
      const planButtons = page.locator('[data-testid="plan-lesson-button"]');
      const firstButton = planButtons.first();
      
      const box = await firstButton.boundingBox();
      
      // Minimum touch target size
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Teacher Workflow Integration', () => {
    test('should proactively suggest planning uncovered expectations', async () => {
      await page.goto('/dashboard');
      
      // If coverage is low, should show alert/suggestion
      const coverageAlert = page.locator('[data-testid="low-coverage-alert"]');
      
      // Check if alert exists (depends on actual coverage)
      const alertVisible = await coverageAlert.isVisible().catch(() => false);
      
      if (alertVisible) {
        await expect(coverageAlert).toContainText(/expectations still need to be covered/);
        
        // Should have quick action button
        await expect(coverageAlert.locator('[data-testid="plan-uncovered-button"]')).toBeVisible();
      }
    });

    test('should integrate with year-end planning', async () => {
      await page.goto('/coverage');
      
      // Should show timeline indicator
      await expect(page.locator('[data-testid="school-year-progress"]')).toBeVisible();
      
      // Should show remaining weeks
      const remainingWeeks = await page.locator('[data-testid="weeks-remaining"]').textContent();
      expect(remainingWeeks).toMatch(/\d+ weeks remaining/);
      
      // Should calculate coverage pace needed
      const paceIndicator = page.locator('[data-testid="coverage-pace-needed"]');
      await expect(paceIndicator).toBeVisible();
      await expect(paceIndicator).toContainText(/expectations per week/);
    });

    test('should support bulk planning for multiple uncovered expectations', async () => {
      await page.goto('/coverage');
      
      // Select multiple uncovered expectations
      const checkboxes = page.locator('[data-testid="select-expectation-checkbox"]');
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();
      
      // Bulk action button should appear
      await expect(page.locator('[data-testid="bulk-plan-lessons"]')).toBeVisible();
      
      // Click bulk plan
      await page.click('[data-testid="bulk-plan-lessons"]');
      
      // Should open planning wizard
      await expect(page.locator('[data-testid="bulk-planning-wizard"]')).toBeVisible();
      
      // Should show selected expectations
      await expect(page.locator('[data-testid="selected-expectations-count"]')).toHaveText('3 expectations selected');
    });
  });
});