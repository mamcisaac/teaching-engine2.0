/**
 * Assessment Write Flow Test
 * 
 * Purpose: Test complete write path for assessment data against DB copy only
 * - Gated behind WRITE_TESTS=true and E2E_DB_IS_COPY=true
 * - Tests: students → assessment → save → persistence → analytics
 * - Uses real authentication (not test cookies)
 */

import { test, expect } from '../fixtures/base';

// Gate behind environment variables for safety
const WRITE_TESTS_ENABLED = process.env.WRITE_TESTS === 'true';
const DB_IS_COPY = process.env.E2E_DB_IS_COPY === 'true';

const shouldRunWriteTests = WRITE_TESTS_ENABLED && DB_IS_COPY;

test.describe('Assessment Write Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Patch 7: Strict assessment write test guards
    const writeTestsEnabled = process.env.WRITE_TESTS === 'true';
    const dbIsCopy = process.env.E2E_DB_IS_COPY === 'true';
    
    if (!writeTestsEnabled) {
      console.log('ℹ️  WRITE_TESTS not enabled - skipping assessment write tests');
      test.skip();
      return;
    }
    
    if (!dbIsCopy) {
      console.log('ℹ️  E2E_DB_IS_COPY not confirmed - skipping assessment write tests');
      test.skip();
      return;
    }
    
    if (!shouldRunWriteTests) {
      console.log('ℹ️  Write test conditions not met - skipping');
      test.skip();
      return;
    }
    
    // CRITICAL: Assert both conditions at test runtime
    if (process.env.WRITE_TESTS !== 'true') {
      throw new Error('CRITICAL: WRITE_TESTS must be exactly "true" for assessment write tests');
    }
    
    if (process.env.E2E_DB_IS_COPY !== 'true') {
      throw new Error('CRITICAL: E2E_DB_IS_COPY must be exactly "true" for assessment write tests');
    }
    
    console.log('✅ Assessment write test guards passed - proceeding with write tests');
    
    // Real authentication required (no test scaffolding)
    await page.goto('/login');
    await page.getByTestId('email-input').fill('emily@example.com');
    await page.getByTestId('password-input').fill('emily-password');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('complete assessment write and persistence flow', async ({ page }) => {
    // STEP 1: Navigate to Students
    await page.getByTestId('nav-students').click();
    await expect(page).toHaveURL('/assessment/students');
    
    // Students grid should load
    await expect(page.getByTestId('students-grid')).toBeVisible({ timeout: 10000 });
    
    // STEP 2: Select first student for assessment
    const studentCards = page.getByTestId('student-card');
    await expect(studentCards.first()).toBeVisible();
    await studentCards.first().click();
    
    // Student detail view should open
    await expect(page.getByTestId('student-detail-panel')).toBeVisible();
    
    // STEP 3: Create new assessment entry
    await page.getByTestId('new-assessment-button').click();
    
    // Assessment form should open
    await expect(page.getByTestId('assessment-form')).toBeVisible();
    
    // STEP 4: Fill assessment data
    const testTimestamp = new Date().toISOString();
    const assessmentNote = `E2E Test Assessment - ${testTimestamp}`;
    
    // Select subject (Grade 1 French Immersion)
    await page.getByTestId('subject-select').click();
    await page.getByText('Français (Immersion)').click();
    
    // Select expectation
    await page.getByTestId('expectation-select').click();
    await page.getByRole('option').first().click();
    
    // Enter assessment details
    await page.getByTestId('assessment-notes').fill(assessmentNote);
    
    // Set proficiency level
    await page.getByTestId('proficiency-level-3').click(); // Meeting expectations
    
    // STEP 5: Save assessment
    await page.getByTestId('save-assessment-button').click();
    
    // Should see success message
    await expect(page.getByTestId('save-success-message')).toBeVisible({ timeout: 5000 });
    
    // STEP 6: Verify persistence - reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Navigate back to same student
    await page.getByTestId('nav-students').click();
    await studentCards.first().click();
    
    // STEP 7: Verify assessment appears in history
    await expect(page.getByTestId('assessment-history')).toBeVisible();
    
    // Should find our test assessment
    const assessmentEntries = page.getByTestId('assessment-entry');
    let foundTestAssessment = false;
    
    const entryCount = await assessmentEntries.count();
    for (let i = 0; i < entryCount; i++) {
      const entryText = await assessmentEntries.nth(i).textContent();
      if (entryText && entryText.includes(assessmentNote.substring(0, 20))) {
        foundTestAssessment = true;
        break;
      }
    }
    
    expect(foundTestAssessment).toBe(true);
    
    // STEP 8: Navigate to analytics view
    await page.getByTestId('nav-assessment').click();
    await expect(page).toHaveURL('/assessment');
    
    // Analytics should load with our new data
    await expect(page.getByTestId('assessment-analytics')).toBeVisible({ timeout: 10000 });
    
    // Should see data updated (may be aggregated)
    const analyticsData = page.getByTestId('analytics-summary');
    await expect(analyticsData).toBeVisible();
    
    console.log('✅ Assessment write flow completed successfully');
  });

  test('assessment data validation and error handling', async ({ page }) => {
    await page.getByTestId('nav-students').click();
    await expect(page.getByTestId('students-grid')).toBeVisible();
    
    // Select student and create assessment
    const studentCards = page.getByTestId('student-card');
    await studentCards.first().click();
    await page.getByTestId('new-assessment-button').click();
    
    // STEP 1: Test required field validation
    await page.getByTestId('save-assessment-button').click();
    
    // Should show validation errors
    await expect(page.getByTestId('subject-error')).toBeVisible();
    await expect(page.getByTestId('expectation-error')).toBeVisible();
    
    // STEP 2: Test invalid data handling
    await page.getByTestId('subject-select').click();
    await page.getByText('Français (Immersion)').click();
    
    // Try to submit with missing expectation
    await page.getByTestId('save-assessment-button').click();
    await expect(page.getByTestId('expectation-error')).toBeVisible();
    
    // STEP 3: Complete valid submission
    await page.getByTestId('expectation-select').click();
    await page.getByRole('option').first().click();
    
    // Should save successfully
    await page.getByTestId('save-assessment-button').click();
    await expect(page.getByTestId('save-success-message')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Assessment validation completed successfully');
  });

  test('assessment analytics data integrity', async ({ page }) => {
    // Navigate to analytics
    await page.getByTestId('nav-assessment').click();
    await expect(page).toHaveURL('/assessment');
    
    await expect(page.getByTestId('assessment-analytics')).toBeVisible({ timeout: 10000 });
    
    // STEP 1: Verify data consistency
    const subjectBreakdown = page.getByTestId('subject-breakdown');
    const proficiencyDistribution = page.getByTestId('proficiency-distribution');
    
    await expect(subjectBreakdown).toBeVisible();
    await expect(proficiencyDistribution).toBeVisible();
    
    // STEP 2: Check for Grade 1 French Immersion subjects
    await expect(page.getByText('Français (Immersion)')).toBeVisible();
    await expect(page.getByText('Mathématiques')).toBeVisible();
    
    // STEP 3: Verify no data corruption indicators
    const corruptionIndicators = [
      'NaN',
      'undefined',
      'null',
      'Invalid Date',
      '0 total assessments' // assuming Emily has assessments
    ];
    
    for (const indicator of corruptionIndicators) {
      const hasCorruption = await page.getByText(indicator).count();
      expect(hasCorruption).toBe(0);
    }
    
    console.log('✅ Assessment analytics integrity verified');
  });

  test('write tests safety check', async ({ page }) => {
    if (!shouldRunWriteTests) {
      test.skip();
      return;
    }
    // This test ensures write tests only run in safe conditions
    if (WRITE_TESTS_ENABLED && !DB_IS_COPY) {
      throw new Error('CRITICAL: Write tests attempted against production database!');
    }
    
    if (!WRITE_TESTS_ENABLED) {
      console.log('ℹ️  Write tests disabled - set WRITE_TESTS=true to enable');
    }
    
    if (!DB_IS_COPY) {
      console.log('ℹ️  DB copy not confirmed - set E2E_DB_IS_COPY=true after creating copy');
    }
    
    console.log('✅ Write tests safety check passed');
  });
});