/**
 * Production Day-in-Life Smoke Test
 * 
 * Purpose: Validate Emily's complete workflow in production mode with real authentication
 * - No test scaffolding (no /__test__ routes)
 * - Real authentication (not test cookies)
 * - 5xx error detection and timezone handling
 * - Week planner → planning cascade → curriculum flow
 */

import { test, expect } from '../fixtures/base';

test.describe('Production Day-in-Life Smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Capture 5xx errors globally
    page.on('response', response => {
      if (response.status() >= 500 && response.status() < 600) {
        throw new Error(`5xx Error detected: ${response.status()} ${response.statusText()} on ${response.url()}`);
      }
    });
    
    // Set Halifax timezone for consistent date handling
    await page.addInitScript(() => {
      // Mock Intl.DateTimeFormat to use Halifax timezone
      const originalDateTimeFormat = Intl.DateTimeFormat;
      // @ts-ignore
      globalThis.Intl.DateTimeFormat = function(locale, options) {
        const modifiedOptions = { ...options, timeZone: 'America/Halifax' };
        return new originalDateTimeFormat(locale, modifiedOptions);
      };
    });
  });

  test('Emily completes full planning workflow - production auth', async ({ page }) => {
    // STEP 1: Real login (no test scaffolding)
    await page.goto('/login');
    
    // Fill in Emily's real credentials (userId: 23)
    await page.getByTestId('email-input').fill('emily@example.com');
    await page.getByTestId('password-input').fill('emily-password');
    await page.getByTestId('login-button').click();
    
    // Verify successful authentication
    await expect(page).toHaveURL('/dashboard');
    
    // STEP 2: Navigate to Week Planner
    await page.getByTestId('nav-week').click();
    await expect(page).toHaveURL('/planner/week');
    
    // Week view should load with Emily's 970 lessons
    await expect(page.getByTestId('week-view-grid')).toBeVisible({ timeout: 15000 });
    
    // Should see some scheduled lessons
    const lessonCards = page.getByTestId('lesson-card');
    await expect(lessonCards.first()).toBeVisible({ timeout: 10000 });
    
    // STEP 3: Access a lesson for planning
    await lessonCards.first().click();
    
    // Lesson detail view should open
    await expect(page.getByTestId('lesson-detail-panel')).toBeVisible();
    
    // STEP 4: Navigate to curriculum expectations
    await page.getByTestId('nav-curriculum').click();
    await expect(page).toHaveURL('/resources/curriculum');
    
    // Should load Grade 1 French Immersion expectations
    await expect(page.getByTestId('curriculum-subject-list')).toBeVisible({ timeout: 10000 });
    
    // Verify we see French Immersion subjects
    await expect(page.getByText('Français (Immersion)')).toBeVisible();
    await expect(page.getByText('Mathématiques')).toBeVisible();
    
    // STEP 5: Navigate to Students/Assessment
    await page.getByTestId('nav-students').click();
    await expect(page).toHaveURL('/assessment/students');
    
    // Students list should load
    await expect(page.getByTestId('students-grid')).toBeVisible({ timeout: 10000 });
    
    // STEP 6: Return to Dashboard - complete cycle
    await page.getByTestId('nav-dashboard').click();
    await expect(page).toHaveURL('/dashboard');
    
    // Dashboard widgets should be functional
    await expect(page.getByTestId('dashboard-overview')).toBeVisible();
    
    console.log('✅ Production day-in-life flow completed successfully');
  });

  test('production mode blocks test routes', async ({ page }) => {
    // Verify that test routes are blocked in production
    const testRoutes = [
      '/__test__/login',
      '/__test__/seed/smoke',
      '/__test__/reset'
    ];
    
    for (const route of testRoutes) {
      const response = await page.request.get(route, { 
        headers: { 'X-Test-Token': 'any-token' },
        failOnStatusCode: false 
      });
      
      // Should return 404 or 403 (not 200)
      expect([404, 403]).toContain(response.status());
      console.log(`✅ Test route ${route} properly blocked: ${response.status()}`);
    }
  });

  test('halifax timezone rendering consistency', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check that dates render consistently in Halifax timezone
    const dateElements = page.getByTestId('date-display');
    
    if (await dateElements.count() > 0) {
      const firstDate = await dateElements.first().textContent();
      
      // Should not contain obvious timezone mismatches
      expect(firstDate).not.toContain('UTC');
      expect(firstDate).not.toContain('+0000');
      
      console.log(`✅ Date rendering: ${firstDate}`);
    }
    
    // Verify no timezone-related errors in console
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('timezone')) {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});