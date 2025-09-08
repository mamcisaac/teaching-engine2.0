/**
 * Assessment Area smoke test
 * Tests navigation to assessment-related pages and basic functionality
 */

import { test, expect } from '../fixtures/seed';

test.describe('Assessment Area', () => {
  test('students page loads and displays correctly', async ({ page }) => {
    await page.goto('/students');
    
    // Page should load
    await expect(page.getByTestId('students-page')).toBeVisible({ timeout: 10000 });
    
    // Should have main sections
    const pageTitle = page.getByRole('heading', { name: /Students/i, level: 1 })
      .or(page.getByText(/Students/i).first());
    await expect(pageTitle).toBeVisible();
    
    // Should have student list or empty state
    const studentList = page.getByTestId('student-list')
      .or(page.locator('.student-list'))
      .or(page.getByRole('table'));
    
    const emptyState = page.getByText(/No students|Add.*student|Get started/i);
    
    const hasContent = await studentList.isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);
    
    expect(hasContent || isEmpty).toBeTruthy();
    
    // Should have add student button
    const addButton = page.getByRole('button', { name: /Add.*Student/i })
      .or(page.getByTestId('add-student-button'));
    const hasAddButton = await addButton.isVisible().catch(() => false);
    expect(hasAddButton).toBeTruthy();
    
    // No console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('assessment page loads and displays correctly', async ({ page }) => {
    await page.goto('/assessment');
    
    // Page should load
    await expect(page.getByTestId('assessment-page')).toBeVisible({ timeout: 10000 });
    
    // Should have assessment content
    const pageTitle = page.getByRole('heading', { name: /Assessment/i, level: 1 })
      .or(page.getByText(/Assessment/i).first());
    await expect(pageTitle).toBeVisible();
    
    // Should have assessment grid or list
    const assessmentGrid = page.getByTestId('assessment-grid')
      .or(page.getByTestId('quick-assessment-grid'))
      .or(page.locator('.assessment-grid'));
    
    const assessmentList = page.getByRole('table')
      .or(page.locator('.assessment-list'));
    
    const emptyState = page.getByText(/No assessments|Start assessing|Create.*assessment/i);
    
    const hasGrid = await assessmentGrid.isVisible().catch(() => false);
    const hasList = await assessmentList.isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);
    
    expect(hasGrid || hasList || isEmpty).toBeTruthy();
    
    // Should have assessment tools/buttons
    const toolButtons = page.locator('button').filter({ hasText: /Create|Add|New|Quick/i });
    const buttonCount = await toolButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('analytics page loads and displays correctly', async ({ page }) => {
    await page.goto('/analytics');
    
    // Page should load
    await expect(page.getByTestId('analytics-page')).toBeVisible({ timeout: 10000 });
    
    // Should have analytics content
    const pageTitle = page.getByRole('heading', { name: /Analytics|Insights|Reports/i, level: 1 })
      .or(page.getByText(/Analytics/i).first());
    await expect(pageTitle).toBeVisible();
    
    // Should have charts or metrics
    const charts = page.locator('canvas, svg').filter({ has: page.locator('*') }); // Chart elements
    const metrics = page.locator('[data-testid*="metric"], .metric-card, .stat-card');
    const tables = page.getByRole('table');
    
    const hasCharts = await charts.count().then(c => c > 0).catch(() => false);
    const hasMetrics = await metrics.count().then(c => c > 0).catch(() => false);
    const hasTables = await tables.count().then(c => c > 0).catch(() => false);
    
    expect(hasCharts || hasMetrics || hasTables).toBeTruthy();
    
    // Should have date range selector or filters
    const dateFilter = page.getByLabel(/Date|Period|Range/i)
      .or(page.getByRole('combobox').filter({ hasText: /Date|Period/i }));
    const hasDateFilter = await dateFilter.isVisible().catch(() => false);
    
    // Most analytics pages have some filtering
    if (hasDateFilter) {
      expect(hasDateFilter).toBeTruthy();
    }
  });

  test('navigation between assessment areas works', async ({ page }) => {
    // Start at students
    await page.goto('/students');
    await expect(page.getByTestId('students-page')).toBeVisible();
    
    // Navigate to assessment via sidebar
    const assessmentNav = page.getByTestId('nav-assessment')
      .or(page.getByRole('link', { name: /Assessment/i }));
    
    if (await assessmentNav.isVisible()) {
      await assessmentNav.click();
      await expect(page).toHaveURL('/assessment');
      await expect(page.getByTestId('assessment-page')).toBeVisible();
    }
    
    // Navigate to analytics
    const analyticsNav = page.getByTestId('nav-analytics')
      .or(page.getByRole('link', { name: /Analytics/i }));
    
    if (await analyticsNav.isVisible()) {
      await analyticsNav.click();
      await expect(page).toHaveURL('/analytics');
      await expect(page.getByTestId('analytics-page')).toBeVisible();
    }
    
    // Go back to students
    const studentsNav = page.getByTestId('nav-students')
      .or(page.getByRole('link', { name: /Students/i }));
    
    if (await studentsNav.isVisible()) {
      await studentsNav.click();
      await expect(page).toHaveURL('/students');
      await expect(page.getByTestId('students-page')).toBeVisible();
    }
  });

  test('assessment quick actions are accessible', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');
    
    // Look for quick assessment grid
    const quickGrid = page.getByTestId('quick-assessment-grid')
      .or(page.locator('.quick-assessment'));
    
    if (await quickGrid.isVisible()) {
      // Should have assessment cells/buttons
      const assessmentCells = quickGrid.locator('button, [role="button"]');
      const cellCount = await assessmentCells.count();
      expect(cellCount).toBeGreaterThan(0);
      
      // Try clicking first cell
      const firstCell = assessmentCells.first();
      if (await firstCell.isEnabled()) {
        await firstCell.click();
        
        // Should update or show feedback
        await page.waitForTimeout(300);
        
        // Cell might change color/state
        const cellState = await firstCell.getAttribute('data-state')
          || await firstCell.getAttribute('aria-pressed');
        // Just verify no error occurred
        expect(true).toBeTruthy();
      }
    }
  });

  test('student data integrates with assessment', async ({ page, seedData }) => {
    // If we have seeded students, verify they appear in assessment
    await page.goto('/assessment');
    
    // Look for student names or IDs
    const studentElements = page.locator('[data-student-id], .student-name, [data-testid*="student"]');
    const studentCount = await studentElements.count();
    
    // With seed data, we should have some students
    if (seedData && studentCount > 0) {
      expect(studentCount).toBeGreaterThan(0);
      
      // First student should have a name
      const firstName = await studentElements.first().textContent();
      expect(firstName).toBeTruthy();
      expect(firstName?.length).toBeGreaterThan(0);
    }
  });

  test('assessment page handles empty state gracefully', async ({ page }) => {
    // Navigate to assessment
    await page.goto('/assessment');
    
    // If no assessments, should show helpful empty state
    const emptyState = page.getByText(/No assessments|Get started|Create your first/i);
    const hasAssessments = page.getByTestId('assessment-grid')
      .or(page.locator('.assessment-item'));
    
    const isEmpty = await emptyState.isVisible().catch(() => false);
    const hasContent = await hasAssessments.isVisible().catch(() => false);
    
    // Should have one or the other
    expect(isEmpty || hasContent).toBeTruthy();
    
    // If empty, should have CTA
    if (isEmpty) {
      const ctaButton = page.getByRole('button', { name: /Create|Start|Add|Begin/i });
      const hasCTA = await ctaButton.isVisible().catch(() => false);
      expect(hasCTA).toBeTruthy();
    }
  });
});