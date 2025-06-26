import { test, expect } from '@playwright/test';
import { initApiContext, createTestUser, loginAsTestUser, cleanupTestUsers } from './helpers/auth-updated';

test.describe('ETFO Teacher Planning Workflow', () => {
  test.beforeAll(async ({ playwright }) => {
    await initApiContext(playwright);
  });

  test.afterAll(async () => {
    await cleanupTestUsers();
  });

  test('should complete full ETFO planning workflow from curriculum to daybook', async ({ page }) => {
    // Create a test teacher
    const teacher = await createTestUser('teacher', {
      name: 'ETFO Test Teacher',
    });

    // Login as the teacher
    await loginAsTestUser(page, teacher);

    // Navigate to curriculum import page
    await page.goto('/curriculum-import');
    await expect(page.locator('h1')).toContainText('Curriculum Import');

    // Simulate curriculum import (manual entry for testing)
    await page.locator('[data-testid="import-method-manual"]').click();
    await page.locator('[data-testid="manual-import-grade"]').selectOption('1');
    await page.locator('[data-testid="manual-import-subject"]').selectOption('Mathematics');
    
    // Add a curriculum expectation manually
    await page.locator('[data-testid="add-expectation-btn"]').click();
    await page.locator('[data-testid="expectation-code"]').fill('A1.1');
    await page.locator('[data-testid="expectation-description"]').fill('Students will count to 20 accurately');
    await page.locator('[data-testid="expectation-strand"]').fill('Number Sense');
    await page.locator('[data-testid="save-expectation-btn"]').click();

    // Complete curriculum import
    await page.locator('[data-testid="complete-import-btn"]').click();
    await expect(page.locator('[data-testid="import-success"]')).toBeVisible();

    // Navigate to long-range plans
    await page.goto('/long-range-plans');
    await expect(page.locator('h1')).toContainText('Long-Range Plans');

    // Create a new long-range plan
    await page.locator('[data-testid="create-lrp-btn"]').click();
    
    // Fill out long-range plan form
    await page.locator('[data-testid="lrp-title"]').fill('Grade 1 Mathematics - Full Year');
    await page.locator('[data-testid="lrp-academic-year"]').fill('2024-2025');
    await page.locator('[data-testid="lrp-grade"]').selectOption('1');
    await page.locator('[data-testid="lrp-subject"]').selectOption('Mathematics');
    await page.locator('[data-testid="lrp-description"]').fill('Comprehensive mathematics program for Grade 1 students');
    await page.locator('[data-testid="lrp-goals"]').fill('Develop number sense, counting skills, and basic operations');
    
    // Select curriculum expectations
    await page.locator('[data-testid="expectation-selector"]').click();
    await page.locator('[data-testid="expectation-A1.1"]').check();
    await page.locator('[data-testid="apply-expectations"]').click();

    // Save long-range plan
    await page.locator('[data-testid="save-lrp-btn"]').click();
    await expect(page.locator('[data-testid="lrp-created-success"]')).toBeVisible();

    // Navigate to unit plans for the created LRP
    await page.locator('[data-testid="view-units-btn"]').click();
    await expect(page.locator('h1')).toContainText('Unit Plans');

    // Create a new unit plan
    await page.locator('[data-testid="create-unit-btn"]').click();

    // Fill out unit plan form
    await page.locator('[data-testid="unit-title"]').fill('Numbers 1-10: Foundation Skills');
    await page.locator('[data-testid="unit-description"]').fill('Introduction to numbers 1-10 with counting and recognition activities');
    await page.locator('[data-testid="unit-big-ideas"]').fill('Numbers represent quantities and have relationships to each other');
    
    // Add essential questions
    await page.locator('[data-testid="add-question-btn"]').click();
    await page.locator('[data-testid="essential-question-0"]').fill('What is a number?');
    await page.locator('[data-testid="add-question-btn"]').click();
    await page.locator('[data-testid="essential-question-1"]').fill('How do we count objects accurately?');

    // Set dates
    await page.locator('[data-testid="unit-start-date"]').fill('2024-09-01');
    await page.locator('[data-testid="unit-end-date"]').fill('2024-09-30');
    await page.locator('[data-testid="unit-estimated-hours"]').fill('20');

    // Select expectations for unit
    await page.locator('[data-testid="unit-expectation-selector"]').click();
    await page.locator('[data-testid="expectation-A1.1"]').check();
    await page.locator('[data-testid="apply-unit-expectations"]').click();

    // Save unit plan
    await page.locator('[data-testid="save-unit-btn"]').click();
    await expect(page.locator('[data-testid="unit-created-success"]')).toBeVisible();

    // Navigate to lesson plans for the unit
    await page.locator('[data-testid="view-lessons-btn"]').click();
    await expect(page.locator('h1')).toContainText('Lesson Plans');

    // Create a new lesson plan
    await page.locator('[data-testid="create-lesson-btn"]').click();

    // Fill out lesson plan form - Overview tab
    await page.locator('[data-testid="lesson-title"]').fill('Counting to 5 with Manipulatives');
    await page.locator('[data-testid="lesson-date"]').fill('2024-09-15');
    await page.locator('[data-testid="lesson-duration"]').fill('45');

    // Three-part lesson structure tab
    await page.locator('[data-testid="tab-three-part"]').click();
    await page.locator('[data-testid="minds-on"]').fill('Sing counting songs and show fingers for numbers 1-5');
    await page.locator('[data-testid="action"]').fill('Use counting bears to practice counting objects from 1 to 5');
    await page.locator('[data-testid="consolidation"]').fill('Share different counting strategies and count classroom objects together');

    // Learning goals
    await page.locator('[data-testid="learning-goals"]').fill('Students will count objects accurately from 1 to 5 and recognize number patterns');

    // Materials tab
    await page.locator('[data-testid="tab-materials"]').click();
    await page.locator('[data-testid="add-material-btn"]').click();
    await page.locator('[data-testid="material-0"]').fill('counting bears');
    await page.locator('[data-testid="add-material-btn"]').click();
    await page.locator('[data-testid="material-1"]').fill('number cards 1-5');

    // Differentiation tab
    await page.locator('[data-testid="tab-differentiation"]').click();
    await page.locator('[data-testid="add-accommodation-btn"]').click();
    await page.locator('[data-testid="accommodation-0"]').fill('Visual number line available');
    await page.locator('[data-testid="add-extension-btn"]').click();
    await page.locator('[data-testid="extension-0"]').fill('Count backwards from 5 to 1');

    // Assessment tab
    await page.locator('[data-testid="tab-assessment"]').click();
    await page.locator('[data-testid="assessment-type"]').selectOption('formative');
    await page.locator('[data-testid="assessment-notes"]').fill('Observe counting accuracy and one-to-one correspondence');

    // Make it substitute-friendly
    await page.locator('[data-testid="tab-overview"]').click();
    await page.locator('[data-testid="sub-friendly-checkbox"]').check();
    await page.locator('[data-testid="sub-notes"]').fill('Counting bears are in the red bin on the math shelf. Number cards are in the pocket chart.');

    // Select curriculum expectations
    await page.locator('[data-testid="lesson-expectation-selector"]').click();
    await page.locator('[data-testid="expectation-A1.1"]').check();
    await page.locator('[data-testid="apply-lesson-expectations"]').click();

    // Save lesson plan
    await page.locator('[data-testid="save-lesson-btn"]').click();
    await expect(page.locator('[data-testid="lesson-created-success"]')).toBeVisible();

    // Test lesson plan features
    // View the created lesson
    await page.locator('[data-testid="lesson-row"]').first().click();
    await expect(page.locator('[data-testid="lesson-detail-title"]')).toContainText('Counting to 5 with Manipulatives');

    // Generate substitute version
    await page.locator('[data-testid="generate-sub-version-btn"]').click();
    await expect(page.locator('[data-testid="sub-plan-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="sub-plan-special-notes"]')).toContainText('red bin');

    // Close substitute modal
    await page.locator('[data-testid="close-sub-modal"]').click();

    // Print lesson plan
    await page.locator('[data-testid="print-lesson-btn"]').click();
    // Note: In real test, you might check for print dialog or download

    // Navigate to daybook entries
    await page.goto('/daybook');
    await expect(page.locator('h1')).toContainText('Daily Reflections');

    // Create a daybook entry for the lesson
    await page.locator('[data-testid="add-reflection-btn"]').click();
    await page.locator('[data-testid="reflection-date"]').fill('2024-09-15');
    
    // Link to the lesson plan
    await page.locator('[data-testid="lesson-selector"]').click();
    await page.locator('[data-testid="lesson-counting-to-5"]').click();

    // Fill out reflection
    await page.locator('[data-testid="what-worked"]').fill('Students were very engaged with the counting bears. The visual manipulatives really helped them understand one-to-one correspondence.');
    await page.locator('[data-testid="what-didnt-work"]').fill('A few students still struggled with pointing to each object while counting. Need more practice with this skill.');
    await page.locator('[data-testid="next-steps"]').fill('Provide more guided practice with pointing while counting. Maybe use larger objects that are easier to point to.');
    
    await page.locator('[data-testid="student-engagement"]').fill('High - students were excited to use the manipulatives and actively participated');
    await page.locator('[data-testid="student-successes"]').fill('Most students successfully counted to 5 and understood the concept');
    await page.locator('[data-testid="student-challenges"]').fill('Some students counted too quickly without pointing to each object');

    await page.locator('[data-testid="overall-rating"]').selectOption('4');
    await page.locator('[data-testid="would-reuse-lesson"]').check();
    await page.locator('[data-testid="general-notes"]').fill('Great lesson overall. Will repeat this format for numbers 6-10 next week.');

    // Save daybook entry
    await page.locator('[data-testid="save-reflection-btn"]').click();
    await expect(page.locator('[data-testid="reflection-saved-success"]')).toBeVisible();

    // Verify the complete workflow by checking progress
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="etfo-progress"]')).toBeVisible();
    
    // Check that all levels have progress
    await expect(page.locator('[data-testid="curriculum-progress"]')).toContainText('1'); // 1 expectation
    await expect(page.locator('[data-testid="lrp-progress"]')).toContainText('1'); // 1 long-range plan
    await expect(page.locator('[data-testid="unit-progress"]')).toContainText('1'); // 1 unit plan
    await expect(page.locator('[data-testid="lesson-progress"]')).toContainText('1'); // 1 lesson plan
    await expect(page.locator('[data-testid="reflection-progress"]')).toContainText('1'); // 1 daybook entry

    // Verify curriculum coverage tracking
    await page.locator('[data-testid="view-coverage-btn"]').click();
    await expect(page.locator('[data-testid="coverage-report"]')).toBeVisible();
    await expect(page.locator('[data-testid="expectation-A1.1-status"]')).toContainText('Covered'); // Should show as covered in lesson

    // Test lesson plan editing with auto-save
    await page.goto('/lesson-plans');
    await page.locator('[data-testid="lesson-row"]').first().click();
    await page.locator('[data-testid="edit-lesson-btn"]').click();
    
    // Make a change and verify auto-save indicator
    await page.locator('[data-testid="lesson-title"]').fill('Counting to 5 with Manipulatives - Updated');
    
    // Check for auto-save indicator
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('Saving');
    
    // Wait for save to complete
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('Saved');

    // Close and verify change was saved
    await page.locator('[data-testid="close-edit-modal"]').click();
    await expect(page.locator('[data-testid="lesson-title-display"]')).toContainText('Updated');
  });

  test('should handle AI-assisted lesson planning', async ({ page }) => {
    // Create a test teacher
    const teacher = await createTestUser('teacher', {
      name: 'AI Test Teacher',
    });

    // Login and set up basic data
    await loginAsTestUser(page, teacher);

    // Navigate to lesson plans and create one with AI assistance
    await page.goto('/lesson-plans');
    await page.locator('[data-testid="create-lesson-btn"]').click();

    // Fill basic information
    await page.locator('[data-testid="lesson-title"]').fill('Addition Concepts');
    await page.locator('[data-testid="lesson-duration"]').fill('60');

    // Use AI Assistant tab
    await page.locator('[data-testid="tab-ai-assistant"]').click();
    await expect(page.locator('[data-testid="ai-panel"]')).toBeVisible();

    // Generate lesson suggestions
    await page.locator('[data-testid="ai-subject"]').selectOption('Mathematics');
    await page.locator('[data-testid="ai-grade"]').selectOption('1');
    await page.locator('[data-testid="ai-topic"]').fill('introduction to addition');
    await page.locator('[data-testid="generate-suggestions-btn"]').click();

    // Wait for AI suggestions (or mock response)
    await expect(page.locator('[data-testid="ai-suggestions"]')).toBeVisible();
    
    // Apply a suggestion
    await page.locator('[data-testid="apply-suggestion-1"]').click();
    
    // Verify suggestion was applied to lesson content
    await page.locator('[data-testid="tab-three-part"]').click();
    await expect(page.locator('[data-testid="minds-on"]')).not.toBeEmpty();

    // Save the AI-assisted lesson
    await page.locator('[data-testid="save-lesson-btn"]').click();
    await expect(page.locator('[data-testid="lesson-created-success"]')).toBeVisible();
  });

  test('should support curriculum import confirmation workflow', async ({ page }) => {
    // Create a test teacher
    const teacher = await createTestUser('teacher', {
      name: 'Import Test Teacher',
    });

    await loginAsTestUser(page, teacher);

    // Navigate to curriculum import
    await page.goto('/curriculum-import');

    // Simulate file upload (use test fixture if available)
    await page.locator('[data-testid="import-method-file"]').click();
    await page.locator('[data-testid="file-input"]').setInputFiles('tests/e2e/fixtures/sample-curriculum.pdf');
    
    // Set metadata
    await page.locator('[data-testid="import-grade"]').selectOption('2');
    await page.locator('[data-testid="import-subject"]').selectOption('Science');
    
    // Start import
    await page.locator('[data-testid="start-import-btn"]').click();
    
    // Wait for processing (in real scenario, this might involve polling)
    await expect(page.locator('[data-testid="import-status"]')).toContainText('Processing');
    
    // Simulate completion and move to review
    await page.locator('[data-testid="proceed-to-review-btn"]').click();
    
    // Review imported expectations
    await expect(page.locator('[data-testid="review-expectations"]')).toBeVisible();
    await expect(page.locator('[data-testid="expectation-count"]')).toContainText('expectations found');
    
    // Edit an expectation
    await page.locator('[data-testid="edit-expectation-0"]').click();
    await page.locator('[data-testid="edit-expectation-description"]').fill('Updated expectation description');
    await page.locator('[data-testid="save-expectation-edit"]').click();
    
    // Confirm import
    await page.locator('[data-testid="confirm-import-btn"]').click();
    await expect(page.locator('[data-testid="import-completed-success"]')).toBeVisible();
    
    // Verify expectations are available for planning
    await page.goto('/long-range-plans');
    await page.locator('[data-testid="create-lrp-btn"]').click();
    await page.locator('[data-testid="expectation-selector"]').click();
    
    // Should see the imported expectations
    await expect(page.locator('[data-testid="grade-2-science-expectations"]')).toBeVisible();
  });

  test('should handle mobile-responsive planning workflow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const teacher = await createTestUser('teacher', {
      name: 'Mobile Test Teacher',
    });

    await loginAsTestUser(page, teacher);

    // Navigate to lesson planning on mobile
    await page.goto('/lesson-plans');
    
    // Mobile navigation should be present
    await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible();
    
    // Create lesson on mobile
    await page.locator('[data-testid="mobile-create-lesson-btn"]').click();
    
    // Mobile form should be optimized
    await expect(page.locator('[data-testid="mobile-lesson-form"]')).toBeVisible();
    
    // Fill out collapsible sections
    await page.locator('[data-testid="expand-basic-info"]').click();
    await page.locator('[data-testid="lesson-title"]').fill('Mobile Test Lesson');
    await page.locator('[data-testid="lesson-duration"]').fill('30');
    
    // Test mobile-optimized three-part lesson
    await page.locator('[data-testid="expand-three-part"]').click();
    await page.locator('[data-testid="minds-on"]').fill('Quick mobile entry for minds-on');
    
    // Save on mobile
    await page.locator('[data-testid="mobile-save-btn"]').click();
    await expect(page.locator('[data-testid="lesson-created-success"]')).toBeVisible();
    
    // Verify mobile lesson list view
    await expect(page.locator('[data-testid="mobile-lesson-card"]')).toBeVisible();
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    const teacher = await createTestUser('teacher', {
      name: 'Error Test Teacher',
    });

    await loginAsTestUser(page, teacher);

    // Test network error handling
    await page.route('**/api/long-range-plans', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto('/long-range-plans');
    await page.locator('[data-testid="create-lrp-btn"]').click();
    await page.locator('[data-testid="lrp-title"]').fill('Error Test Plan');
    await page.locator('[data-testid="save-lrp-btn"]').click();

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to save');

    // Remove network error
    await page.unroute('**/api/long-range-plans');

    // Test validation errors
    await page.locator('[data-testid="lrp-title"]').fill(''); // Clear required field
    await page.locator('[data-testid="save-lrp-btn"]').click();
    
    // Should show validation error
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Test unsaved changes warning
    await page.locator('[data-testid="lrp-title"]').fill('Unsaved Changes Test');
    
    // Try to navigate away
    await page.goto('/dashboard');
    
    // Should prompt about unsaved changes
    await expect(page.locator('[data-testid="unsaved-changes-modal"]')).toBeVisible();
    await page.locator('[data-testid="discard-changes-btn"]').click();
    
    // Should navigate to dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});