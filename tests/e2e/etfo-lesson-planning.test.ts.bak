/**
 * E2E Test for ETFO Lesson Planning UI
 * Verifies teachers can create and manage lesson plans through the UI
 */

import { test, expect } from '@playwright/test';

test.describe('ETFO Lesson Planning Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login
    await page.goto('http://localhost:5173');
    
    // Handle login if needed
    const loginButton = await page.locator('button:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.fill('input[type="email"]', 'teacher@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    }
  });

  test('should create a new lesson plan', async ({ page }) => {
    // Navigate to lesson planning
    await page.click('text=Lesson Plans');
    await page.waitForLoadState('networkidle');

    // Click create new lesson plan
    await page.click('button:has-text("New Lesson Plan")');
    
    // Fill in lesson plan details
    await page.fill('input[name="title"]', 'Math Fractions Introduction');
    await page.selectOption('select[name="unitPlanId"]', { index: 1 }); // Select first unit plan
    await page.fill('input[name="date"]', '2024-09-20');
    await page.fill('input[name="duration"]', '60');
    
    // Three-part lesson structure
    await page.fill('textarea[name="mindsOn"]', 'Quick mental math warm-up with fraction visuals');
    await page.fill('textarea[name="action"]', 'Students work in pairs to explore fraction manipulatives');
    await page.fill('textarea[name="consolidation"]', 'Exit ticket: Draw and label three different fractions');
    
    // Select curriculum expectations
    await page.click('text=Add Expectations');
    await page.check('input[type="checkbox"][value*="expectation"]', { trial: true });
    await page.click('button:has-text("Add Selected")');
    
    // Save the lesson plan
    await page.click('button:has-text("Save Lesson Plan")');
    
    // Verify success
    await expect(page.locator('text=Lesson plan created successfully')).toBeVisible();
    await expect(page.locator('h2:has-text("Math Fractions Introduction")')).toBeVisible();
  });

  test('should view and edit existing lesson plans', async ({ page }) => {
    // Navigate to lesson plans
    await page.click('text=Lesson Plans');
    await page.waitForLoadState('networkidle');
    
    // Check that lesson plans load
    await expect(page.locator('[data-testid="lesson-plan-card"]')).toHaveCount(1, { timeout: 10000 });
    
    // Click on a lesson plan to view details
    await page.click('[data-testid="lesson-plan-card"]').first();
    
    // Verify lesson plan details are shown
    await expect(page.locator('text=Minds On')).toBeVisible();
    await expect(page.locator('text=Action')).toBeVisible();
    await expect(page.locator('text=Consolidation')).toBeVisible();
    
    // Edit the lesson plan
    await page.click('button:has-text("Edit")');
    await page.fill('textarea[name="action"]', 'Updated: Students explore fractions using digital tools');
    await page.click('button:has-text("Save Changes")');
    
    // Verify update success
    await expect(page.locator('text=Lesson plan updated successfully')).toBeVisible();
  });

  test('should create daybook entry for lesson', async ({ page }) => {
    // Navigate to daybook
    await page.click('text=Daybook');
    await page.waitForLoadState('networkidle');
    
    // Create new entry
    await page.click('button:has-text("New Entry")');
    
    // Select lesson plan
    await page.selectOption('select[name="lessonPlanId"]', { index: 1 });
    
    // Fill reflection
    await page.fill('textarea[name="whatWorked"]', 'Students were engaged with the manipulatives');
    await page.fill('textarea[name="whatDidntWork"]', 'Need more time for consolidation activity');
    await page.fill('textarea[name="nextSteps"]', 'Plan follow-up lesson with more practice time');
    
    // Rate the lesson
    await page.click('[data-testid="rating-4"]'); // 4 out of 5 stars
    
    // Mark expectation coverage
    await page.selectOption('select[name="expectationCoverage"]', 'developing');
    
    // Save entry
    await page.click('button:has-text("Save Entry")');
    
    // Verify success
    await expect(page.locator('text=Daybook entry saved successfully')).toBeVisible();
  });

  test('should browse and use templates', async ({ page }) => {
    // Navigate to templates
    await page.click('text=Templates');
    await page.waitForLoadState('networkidle');
    
    // Filter templates
    await page.selectOption('select[name="type"]', 'LESSON_PLAN');
    await page.selectOption('select[name="grade"]', '4');
    
    // Click on a template
    await page.click('[data-testid="template-card"]').first();
    
    // Use template
    await page.click('button:has-text("Use This Template")');
    
    // Customize the template
    await page.fill('input[name="title"]', 'My Customized Lesson from Template');
    await page.click('button:has-text("Create from Template")');
    
    // Verify success
    await expect(page.locator('text=Lesson plan created from template')).toBeVisible();
  });

  test('should view unit plans with expectations', async ({ page }) => {
    // Navigate to unit plans
    await page.click('text=Unit Plans');
    await page.waitForLoadState('networkidle');
    
    // Click on a unit plan
    await page.click('[data-testid="unit-plan-card"]').first();
    
    // Verify expectations are shown
    await expect(page.locator('text=Curriculum Expectations')).toBeVisible();
    await expect(page.locator('[data-testid="expectation-item"]')).toHaveCount(1, { timeout: 10000 });
    
    // Verify lesson plans within unit
    await expect(page.locator('text=Lessons in this Unit')).toBeVisible();
  });
});

// Test using Puppeteer directly for schema verification
test.describe('Schema Verification with Puppeteer', () => {
  test('should verify API responses have correct schema', async ({ page }) => {
    // Intercept API calls to verify response structure
    const apiResponses: any[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        try {
          const json = await response.json();
          apiResponses.push({ url, data: json });
        } catch {
          // Not JSON response
        }
      }
    });
    
    // Navigate and trigger API calls
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Check lesson plans response
    const lessonPlansResponse = apiResponses.find(r => r.url.includes('/api/etfo-lesson-plans'));
    if (lessonPlansResponse) {
      expect(lessonPlansResponse.data).toHaveProperty('lessonPlans');
      expect(lessonPlansResponse.data.lessonPlans[0]).not.toHaveProperty('expectationCoverage');
      expect(lessonPlansResponse.data.lessonPlans[0]).toHaveProperty('expectations');
    }
    
    // Check daybook entries response
    const daybookResponse = apiResponses.find(r => r.url.includes('/api/daybook-entries'));
    if (daybookResponse) {
      expect(daybookResponse.data).toHaveProperty('entries');
      expect(daybookResponse.data.entries[0]).not.toHaveProperty('expectationCoverage');
      expect(daybookResponse.data.entries[0]).toHaveProperty('expectations');
    }
    
    // Check templates response
    const templatesResponse = apiResponses.find(r => r.url.includes('/api/templates'));
    if (templatesResponse) {
      expect(templatesResponse.data).toHaveProperty('templates');
      // Should return both system and user templates
    }
  });
});