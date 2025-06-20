/**
 * Analytics E2E Tests
 *
 * Tests complete user workflows for analytics features
 * using Playwright to simulate real user interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the analytics dashboard
    await page.goto('/analytics');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Curriculum Analytics Workflow', () => {
    test('should display curriculum heatmap and allow interactions', async ({ page }) => {
      // Navigate to curriculum analytics
      await page.click('[data-testid="curriculum-analytics-tab"]');

      // Wait for heatmap to load
      await expect(page.locator('[data-testid="curriculum-heatmap"]')).toBeVisible();

      // Check that heatmap has data
      const heatmapCells = page.locator('[data-testid="heatmap-cell"]');
      await expect(heatmapCells.first()).toBeVisible();

      // Test hover interaction
      await heatmapCells.first().hover();
      await expect(page.locator('[data-testid="heatmap-tooltip"]')).toBeVisible();

      // Test view mode switching
      await page.click('[data-testid="view-mode-monthly"]');
      await page.waitForTimeout(1000); // Wait for re-render

      // Verify URL updated
      await expect(page).toHaveURL(/viewMode=monthly/);

      // Test export functionality
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-csv"]');

      // Wait for download
      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('curriculum-heatmap');
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should show curriculum coverage statistics', async ({ page }) => {
      await page.click('[data-testid="curriculum-analytics-tab"]');

      // Check coverage statistics are displayed
      await expect(page.locator('[data-testid="total-outcomes"]')).toBeVisible();
      await expect(page.locator('[data-testid="covered-outcomes"]')).toBeVisible();
      await expect(page.locator('[data-testid="coverage-percentage"]')).toBeVisible();

      // Verify numbers are realistic
      const totalOutcomes = await page.locator('[data-testid="total-outcomes"]').textContent();
      const coveredOutcomes = await page.locator('[data-testid="covered-outcomes"]').textContent();

      expect(parseInt(totalOutcomes || '0')).toBeGreaterThan(0);
      expect(parseInt(coveredOutcomes || '0')).toBeGreaterThanOrEqual(0);

      // Test subject filter
      await page.selectOption('[data-testid="subject-filter"]', 'Mathematics');
      await page.waitForTimeout(1000);

      // Statistics should update
      const newCoveredOutcomes = await page
        .locator('[data-testid="covered-outcomes"]')
        .textContent();
      expect(newCoveredOutcomes).not.toBe(coveredOutcomes);
    });

    test('should identify and display curriculum gaps', async ({ page }) => {
      await page.click('[data-testid="curriculum-analytics-tab"]');

      // Check for gaps section
      await expect(page.locator('[data-testid="curriculum-gaps"]')).toBeVisible();

      // Should show gap recommendations
      const gapItems = page.locator('[data-testid="gap-item"]');
      const gapCount = await gapItems.count();

      if (gapCount > 0) {
        // Check first gap item has required information
        const firstGap = gapItems.first();
        await expect(firstGap.locator('[data-testid="gap-outcome"]')).toBeVisible();
        await expect(firstGap.locator('[data-testid="gap-recommendation"]')).toBeVisible();

        // Test click to view details
        await firstGap.click();
        await expect(page.locator('[data-testid="gap-details-modal"]')).toBeVisible();

        // Close modal
        await page.click('[data-testid="close-modal"]');
        await expect(page.locator('[data-testid="gap-details-modal"]')).not.toBeVisible();
      }
    });
  });

  test.describe('Domain Analytics Workflow', () => {
    test('should display student domain radar chart', async ({ page }) => {
      await page.click('[data-testid="domain-analytics-tab"]');

      // Select a student
      await page.selectOption('[data-testid="student-selector"]', '1');
      await page.waitForTimeout(1000);

      // Check radar chart is displayed
      await expect(page.locator('[data-testid="domain-radar-chart"]')).toBeVisible();

      // Check radar chart has canvas element
      const canvas = page.locator('canvas').first();
      await expect(canvas).toBeVisible();

      // Check student information is displayed
      await expect(page.locator('[data-testid="student-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="overall-score"]')).toBeVisible();

      // Verify score is in valid range
      const overallScore = await page.locator('[data-testid="overall-score"]').textContent();
      const score = parseFloat(overallScore?.replace(/[^\d.]/g, '') || '0');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);

      // Check strengths and areas for growth
      await expect(page.locator('[data-testid="student-strengths"]')).toBeVisible();
      await expect(page.locator('[data-testid="areas-for-growth"]')).toBeVisible();
    });

    test('should show class domain summary', async ({ page }) => {
      await page.click('[data-testid="domain-analytics-tab"]');
      await page.click('[data-testid="class-summary-tab"]');

      // Check class averages are displayed
      await expect(page.locator('[data-testid="class-averages"]')).toBeVisible();

      // Check domain distribution charts
      await expect(page.locator('[data-testid="domain-distribution"]')).toBeVisible();

      // Check recommendations
      await expect(page.locator('[data-testid="recommended-focus"]')).toBeVisible();

      // Test domain filter
      await page.selectOption('[data-testid="domain-filter"]', 'reading');
      await page.waitForTimeout(1000);

      // Chart should update
      const chartContainer = page.locator('[data-testid="domain-chart-container"]');
      await expect(chartContainer).toBeVisible();
    });

    test('should display domain trends over time', async ({ page }) => {
      await page.click('[data-testid="domain-analytics-tab"]');
      await page.click('[data-testid="trends-tab"]');

      // Select student and domain
      await page.selectOption('[data-testid="student-selector"]', '1');
      await page.selectOption('[data-testid="domain-selector"]', 'reading');
      await page.waitForTimeout(1000);

      // Check trend chart is displayed
      await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();

      // Check projection information
      await expect(page.locator('[data-testid="trend-projection"]')).toBeVisible();
      await expect(page.locator('[data-testid="trajectory-indicator"]')).toBeVisible();

      // Test time range selector
      await page.selectOption('[data-testid="time-range"]', '24');
      await page.waitForTimeout(1000);

      // Chart should update with more data points
      const dataPoints = page.locator('[data-testid="trend-data-point"]');
      const pointCount = await dataPoints.count();
      expect(pointCount).toBeGreaterThan(12); // Should have more than 12 weeks
    });
  });

  test.describe('Theme Analytics Workflow', () => {
    test('should display theme usage analytics', async ({ page }) => {
      await page.click('[data-testid="theme-analytics-tab"]');

      // Check theme statistics
      await expect(page.locator('[data-testid="total-themes"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-themes"]')).toBeVisible();
      await expect(page.locator('[data-testid="average-usage"]')).toBeVisible();

      // Check most used themes list
      await expect(page.locator('[data-testid="most-used-themes"]')).toBeVisible();

      const themeItems = page.locator('[data-testid="theme-item"]');
      const themeCount = await themeItems.count();

      if (themeCount > 0) {
        // Click on first theme to expand details
        await themeItems.first().click();

        // Check expanded details
        await expect(page.locator('[data-testid="theme-details"]')).toBeVisible();
        await expect(page.locator('[data-testid="usage-breakdown"]')).toBeVisible();
        await expect(page.locator('[data-testid="subject-connections"]')).toBeVisible();
      }

      // Test sorting options
      await page.selectOption('[data-testid="sort-themes"]', 'integration');
      await page.waitForTimeout(500);

      // Order should change
      const firstThemeAfterSort = await themeItems.first().textContent();
      expect(firstThemeAfterSort).toBeDefined();
    });

    test('should show theme balance and recommendations', async ({ page }) => {
      await page.click('[data-testid="theme-analytics-tab"]');

      // Check theme balance section
      await expect(page.locator('[data-testid="theme-balance"]')).toBeVisible();
      await expect(page.locator('[data-testid="balance-chart"]')).toBeVisible();

      // Check recommendations
      await expect(page.locator('[data-testid="theme-recommendations"]')).toBeVisible();

      // Check cross-subject connections
      await expect(page.locator('[data-testid="cross-subject-connections"]')).toBeVisible();

      const connectionItems = page.locator('[data-testid="connection-item"]');
      const connectionCount = await connectionItems.count();

      if (connectionCount > 0) {
        // Check connection details
        const firstConnection = connectionItems.first();
        await expect(firstConnection.locator('[data-testid="connection-strength"]')).toBeVisible();
        await expect(firstConnection.locator('[data-testid="connected-subjects"]')).toBeVisible();
      }
    });

    test('should display theme usage matrix', async ({ page }) => {
      await page.click('[data-testid="theme-analytics-tab"]');
      await page.click('[data-testid="matrix-view"]');

      // Check matrix is displayed
      await expect(page.locator('[data-testid="theme-matrix"]')).toBeVisible();

      // Test view by options
      await page.selectOption('[data-testid="matrix-view-by"]', 'subject');
      await page.waitForTimeout(1000);

      // Matrix should update
      await expect(page.locator('[data-testid="matrix-headers"]')).toBeVisible();

      // Test matrix cell interactions
      const matrixCells = page.locator('[data-testid="matrix-cell"]');
      const cellCount = await matrixCells.count();

      if (cellCount > 0) {
        // Hover over a cell to see tooltip
        await matrixCells.first().hover();
        await expect(page.locator('[data-testid="matrix-tooltip"]')).toBeVisible();
      }
    });
  });

  test.describe('Vocabulary Analytics Workflow', () => {
    test('should display vocabulary growth analytics', async ({ page }) => {
      await page.click('[data-testid="vocabulary-analytics-tab"]');

      // Select a student
      await page.selectOption('[data-testid="student-selector"]', '1');
      await page.waitForTimeout(1000);

      // Check growth statistics
      await expect(page.locator('[data-testid="total-words"]')).toBeVisible();
      await expect(page.locator('[data-testid="words-this-term"]')).toBeVisible();
      await expect(page.locator('[data-testid="acquisition-rate"]')).toBeVisible();

      // Check growth chart
      await expect(page.locator('[data-testid="vocabulary-growth-chart"]')).toBeVisible();

      // Check domain breakdown
      await expect(page.locator('[data-testid="domain-breakdown"]')).toBeVisible();

      // Check difficulty progression
      await expect(page.locator('[data-testid="difficulty-progression"]')).toBeVisible();

      // Test time range filter
      await page.selectOption('[data-testid="time-range"]', 'year');
      await page.waitForTimeout(1000);

      // Chart should update with more data
      const chartContainer = page.locator('[data-testid="vocabulary-chart-container"]');
      await expect(chartContainer).toBeVisible();
    });

    test('should show vocabulary trends and insights', async ({ page }) => {
      await page.click('[data-testid="vocabulary-analytics-tab"]');
      await page.click('[data-testid="trends-tab"]');

      // Check trends are displayed
      await expect(page.locator('[data-testid="vocabulary-trends"]')).toBeVisible();

      // Check insights section
      await expect(page.locator('[data-testid="vocabulary-insights"]')).toBeVisible();

      const insightItems = page.locator('[data-testid="insight-item"]');
      const insightCount = await insightItems.count();

      if (insightCount > 0) {
        // Check insight details
        const firstInsight = insightItems.first();
        await expect(firstInsight.locator('[data-testid="insight-text"]')).toBeVisible();
        await expect(firstInsight.locator('[data-testid="insight-confidence"]')).toBeVisible();
      }
    });
  });

  test.describe('Export and Sharing Workflow', () => {
    test('should export analytics data in multiple formats', async ({ page }) => {
      await page.click('[data-testid="curriculum-analytics-tab"]');

      // Test CSV export
      const csvDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-csv"]');

      const csvDownload = await csvDownloadPromise;
      expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);

      // Test PDF export
      const pdfDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-pdf"]');

      const pdfDownload = await pdfDownloadPromise;
      expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/);

      // Test PNG export
      const pngDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-png"]');

      const pngDownload = await pngDownloadPromise;
      expect(pngDownload.suggestedFilename()).toMatch(/\.png$/);
    });

    test('should generate comprehensive reports', async ({ page }) => {
      await page.click('[data-testid="reports-tab"]');

      // Configure report
      await page.selectOption('[data-testid="report-type"]', 'comprehensive');
      await page.selectOption('[data-testid="report-period"]', 'term');
      await page.check('[data-testid="include-recommendations"]');

      // Generate report
      const reportDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="generate-report"]');

      // Wait for generation to complete
      await expect(page.locator('[data-testid="report-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-complete"]')).toBeVisible({ timeout: 30000 });

      const reportDownload = await reportDownloadPromise;
      expect(reportDownload.suggestedFilename()).toContain('comprehensive-report');
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load analytics dashboard within performance budget', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds

      // Check that charts are rendered
      await expect(page.locator('canvas').first()).toBeVisible();
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('/analytics');

      // Tab through navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="curriculum-analytics-tab"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="domain-analytics-tab"]')).toBeFocused();

      // Navigate using Enter key
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="domain-analytics-content"]')).toBeVisible();

      // Tab to interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to use dropdowns with keyboard
      const dropdown = page.locator('[data-testid="student-selector"]');
      if (await dropdown.isVisible()) {
        await expect(dropdown).toBeFocused();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/analytics');

      // Check main landmarks
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('[role="navigation"]')).toBeVisible();

      // Check chart accessibility
      const charts = page.locator('canvas');
      const chartCount = await charts.count();

      for (let i = 0; i < chartCount; i++) {
        const chart = charts.nth(i);
        const ariaLabel = await chart.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }

      // Check button accessibility
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        // Check first 10 buttons
        const button = buttons.nth(i);
        const hasLabel = (await button.getAttribute('aria-label')) || (await button.textContent());
        expect(hasLabel).toBeTruthy();
      }
    });

    test('should work with screen reader announcements', async ({ page }) => {
      await page.goto('/analytics');

      // Check for live regions
      await expect(page.locator('[aria-live]')).toBeVisible();

      // Change data and check announcements
      await page.selectOption('[data-testid="student-selector"]', '2');

      // Should have status announcement
      await expect(page.locator('[aria-live="polite"]')).toBeVisible();

      // Check that error states are announced
      // Simulate network error
      await page.route('**/api/analytics/**', (route) => route.abort());
      await page.reload();

      await expect(page.locator('[role="alert"]')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and return errors
      await page.route('**/api/analytics/curriculum-heatmap', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await page.goto('/analytics');

      // Should show error state
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

      // Test retry functionality
      await page.unroute('**/api/analytics/curriculum-heatmap');
      await page.click('[data-testid="retry-button"]');

      // Should recover and show data
      await expect(page.locator('[data-testid="curriculum-heatmap"]')).toBeVisible();
    });

    test('should handle empty data states', async ({ page }) => {
      // Mock empty responses
      await page.route('**/api/analytics/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            outcomes: [],
            weeks: [],
            grid: {},
            metadata: { totalOutcomes: 0, coveragePercentage: 0 },
          }),
        });
      });

      await page.goto('/analytics');

      // Should show empty state
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-state-message"]')).toContainText(
        'No data available',
      );
    });

    test('should handle slow loading gracefully', async ({ page }) => {
      // Add delay to API responses
      await page.route('**/api/analytics/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        route.continue();
      });

      await page.goto('/analytics');

      // Should show loading state
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

      // Should eventually load
      await expect(page.locator('[data-testid="curriculum-heatmap"]')).toBeVisible({
        timeout: 5000,
      });
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    });
  });
});
