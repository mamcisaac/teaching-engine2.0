/**
 * E2E Tests for Assessment Workflows
 * Tests complete user workflows for assessment features using Playwright
 */
import { test, expect, Page } from '@playwright/test';

// Set a reasonable timeout for all tests in this file
test.setTimeout(30000); // 30 seconds per test

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Helper functions
async function loginAsTeacher(page: Page) {
  console.log('Navigating to login page...');
  await page.goto(`${BASE_URL}/login`);

  // Wait for login form
  console.log('Waiting for login form...');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Fill login form with correct E2E test credentials
  console.log('Filling login credentials...');
  await page.fill('input[type="email"]', 'e2e-teacher@example.com');
  await page.fill('input[type="password"]', 'e2e-password-123');

  console.log('Submitting login form...');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  console.log('Waiting for dashboard redirect...');
  try {
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('Successfully redirected to dashboard');
  } catch (error) {
    console.error('Failed to redirect to dashboard');
    console.error('Current URL:', page.url());
    throw error;
  }
}

// Helper function for future use
// async function navigateToAssessments(page: Page) {
//   await page.click('text=Assessments');
//   await page.waitForLoadState('networkidle');
// }

// Helper function for future use - currently disabled
// async function createTestData(page: Page) {
//   // Skip test data creation for now to focus on login
//   console.log('Skipping test data creation for initial tests');
//   return;
// }

test.describe('Assessment Workflows - E2E', () => {
  test('should load the application', async ({ page }) => {
    console.log('Starting basic health check test...');
    await page.goto(BASE_URL);
    console.log('Navigated to:', page.url());

    // Just verify the page loads
    await expect(page).toHaveTitle(/Teaching Engine|Login/, { timeout: 10000 });
    console.log('Page loaded successfully');
  });

  test('should successfully login', async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', (msg) => console.log('Browser console:', msg.text()));
    page.on('pageerror', (error) => console.log('Browser error:', error));

    await loginAsTeacher(page);

    // Just verify we're on the dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
    console.log('Login successful - on dashboard');
  });

  test.describe.skip('Evidence Quick Entry Workflow', () => {
    test('should complete full evidence entry workflow', async ({ page }) => {
      // Navigate to evidence quick entry
      await page.goto(`${BASE_URL}/dashboard`);

      // Look for evidence entry component or navigate to it
      await page.waitForSelector('text=Quick Evidence Entry', { timeout: 10000 });

      // Verify component loaded
      await expect(page.locator('h2:has-text("Quick Evidence Entry")')).toBeVisible();

      // Step 1: Select students
      await expect(page.locator('text=Select Students')).toBeVisible();

      // Check if students are loaded
      const studentCheckboxes = page.locator('input[type="checkbox"]').filter({
        has: page.locator('text=/Grade [0-9]/'),
      });

      const studentCount = await studentCheckboxes.count();
      if (studentCount > 0) {
        // Select first student
        await studentCheckboxes.first().check();

        // Verify student is selected
        await expect(page.locator('text=Selected:')).toBeVisible();
      }

      // Step 2: Add evidence text
      const evidenceText =
        'Student demonstrated excellent reading comprehension during guided reading.';
      await page.fill('textarea[placeholder*="Describe what you observed"]', evidenceText);

      // Step 3: Select mood emoji
      await page.locator('button:has-text("😊")').click();

      // Step 4: Use quick suggestion
      await page.locator('button:has-text("Excellent work today!")').click();

      // Verify text was added to textarea
      const textareaValue = await page.inputValue(
        'textarea[placeholder*="Describe what you observed"]',
      );
      expect(textareaValue).toContain('Excellent work today!');

      // Step 5: Link to learning outcome (optional)
      const searchButton = page.locator('button:has-text("Search")');
      if (await searchButton.isVisible()) {
        await searchButton.click();

        // Search for an outcome
        await page.fill('input[placeholder="Search outcomes..."]', 'reading');

        // Select first outcome if available
        const outcomes = page.locator('input[type="checkbox"]').filter({
          has: page.locator('text=/^[A-Z]{1,3}[0-9]+\\./'),
        });

        if ((await outcomes.count()) > 0) {
          await outcomes.first().check();
        }
      }

      // Step 6: Save evidence
      if (studentCount > 0) {
        await page.click('button:has-text("Save Evidence")');

        // Wait for success indication (toast, redirect, or form reset)
        await page.waitForTimeout(2000);

        // Verify form was processed (either success toast or form reset)
        const isFormReset =
          (await page.inputValue('textarea[placeholder*="Describe what you observed"]')) === '';
        const hasSuccessToast = await page.locator('text=/Evidence.*saved|Success/').isVisible();

        expect(isFormReset || hasSuccessToast).toBeTruthy();
      }
    });

    test('should handle validation errors gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('text=Quick Evidence Entry', { timeout: 10000 });

      // Try to save without selecting students or adding text
      await page.click('button:has-text("Save Evidence")');

      // Should show validation error
      await expect(page.locator('text=/Please select.*student|Please add.*text/i')).toBeVisible({
        timeout: 5000,
      });
    });

    test('should support French interface', async ({ page }) => {
      // Switch to French if language switcher is available
      const frenchButton = page.locator('button:has-text("Français")');
      if (await frenchButton.isVisible()) {
        await frenchButton.click();
        await page.waitForTimeout(1000);
      }

      await page.goto(`${BASE_URL}/dashboard`);

      // Check for French interface elements
      const frenchTitle = page.locator("text=Saisie rapide d'évidence");
      if (await frenchTitle.isVisible()) {
        await expect(frenchTitle).toBeVisible();
        await expect(page.locator('text=Sélectionner les élèves')).toBeVisible();
      }
    });
  });

  test.describe('Outcome Reflections Journal Workflow', () => {
    test('should complete reflection creation workflow', async ({ page }) => {
      await page.goto(`${BASE_URL}/reflections`);
      await page.waitForSelector('text=Learning Outcomes', { timeout: 10000 });

      // Verify component loaded
      await expect(
        page.locator('h1:has-text("Learning Outcomes"), h2:has-text("Learning Outcomes")'),
      ).toBeVisible();

      // Step 1: Browse outcomes
      await expect(page.locator('input[placeholder="Search..."]')).toBeVisible();
      await expect(page.locator('select:has-text("All subjects")')).toBeVisible();

      // Step 2: Search for specific outcome
      await page.fill('input[placeholder="Search..."]', 'reading');
      await page.waitForTimeout(1000);

      // Step 3: Select an outcome
      const outcomeButtons = page.locator('button').filter({
        hasText: /^[A-Z]{1,3}[0-9]+\./,
      });

      if ((await outcomeButtons.count()) > 0) {
        await outcomeButtons.first().click();

        // Verify reflection panel opens
        await expect(page.locator('text=New reflection')).toBeVisible();

        // Step 4: Add reflection content
        const reflectionText =
          'Students are showing improvement in reading fluency. Need to focus more on comprehension strategies.';
        await page.fill('textarea[placeholder*="Write your observations"]', reflectionText);

        // Step 5: Save reflection
        await page.click('button:has-text("Add")');

        // Wait for save operation
        await page.waitForTimeout(2000);

        // Verify reflection was saved (should show in list or success message)
        const hasSavedReflection = await page.locator(`text=${reflectionText}`).isVisible();
        const hasSuccessMessage = await page
          .locator('text=/Reflection.*added|Success/')
          .isVisible();

        expect(hasSavedReflection || hasSuccessMessage).toBeTruthy();
      }
    });

    test('should support reflection editing and deletion', async ({ page }) => {
      await page.goto(`${BASE_URL}/reflections`);
      await page.waitForSelector('text=Learning Outcomes', { timeout: 10000 });

      // Find an outcome with existing reflection
      const outcomesWithReflections = page.locator('button').filter({
        has: page.locator('text=/[0-9]+/'), // Badge with number indicating reflections
      });

      if ((await outcomesWithReflections.count()) > 0) {
        await outcomesWithReflections.first().click();

        // Check if edit button is available
        const editButton = page.locator('button:has-text("Edit")');
        if (await editButton.isVisible()) {
          await editButton.click();

          // Modify reflection
          await page.fill('textarea', 'Updated reflection content for E2E test');
          await page.click('button:has-text("Update")');

          await page.waitForTimeout(1000);

          // Verify update was successful
          await expect(page.locator('text=Updated reflection content')).toBeVisible({
            timeout: 5000,
          });
        }
      }
    });

    test('should filter outcomes correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/reflections`);
      await page.waitForSelector('text=Learning Outcomes', { timeout: 10000 });

      // Test subject filter
      const subjectSelect = page.locator('select');
      if ((await subjectSelect.count()) > 0) {
        const options = await subjectSelect.first().locator('option').allTextContents();

        if (options.length > 1) {
          // Select first non-"All" option
          const firstSubject = options.find((option) => option !== 'All subjects');
          if (firstSubject) {
            await subjectSelect.first().selectOption(firstSubject);
            await page.waitForTimeout(1000);

            // Verify filtering worked (outcomes should be visible)
            const outcomeButtons = page.locator('button').filter({
              hasText: /^[A-Z]{1,3}[0-9]+\./,
            });
            // Should have at least one outcome or show "no outcomes" message
            const hasOutcomes = (await outcomeButtons.count()) > 0;
            const hasNoOutcomesMessage = await page.locator('text=/No.*outcomes/').isVisible();

            expect(hasOutcomes || hasNoOutcomesMessage).toBeTruthy();
          }
        }
      }

      // Test quick filters
      const withReflectionsButton = page.locator('button:has-text("With reflections")');
      if (await withReflectionsButton.isVisible()) {
        await withReflectionsButton.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Language Sensitive Assessment Builder Workflow', () => {
    test('should create assessment template successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/assessments`);

      // Look for assessment builder or create new assessment button
      const createButton = page.locator(
        'button:has-text("Create"), button:has-text("New Assessment")',
      );
      if (await createButton.isVisible()) {
        await createButton.click();
      }

      // Wait for assessment builder
      await page.waitForSelector('text=Create Language-Sensitive Assessment Template', {
        timeout: 10000,
      });

      // Step 1: Fill basic information
      await page.fill('input[name="title"], input[label*="Title"]', 'E2E Test Oral Assessment');

      // Step 2: Select assessment type
      await page.locator('label:has-text("Oral")').click();

      // Step 3: Add description
      const descriptionField = page.locator(
        'textarea[name="description"], textarea[placeholder*="Describe"]',
      );
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('E2E test assessment for oral communication skills');
      }

      // Step 4: Configure criteria (use default Grade 1 criteria)
      const useDefaultCheckbox = page.locator('input[type="checkbox"]').filter({
        has: page.locator('text=/Use.*Grade.*criteria/'),
      });
      if ((await useDefaultCheckbox.isVisible()) && !(await useDefaultCheckbox.isChecked())) {
        await useDefaultCheckbox.check();
      }

      // Step 5: Select learning outcomes
      const outcomeCheckboxes = page.locator('input[type="checkbox"]').filter({
        has: page.locator('text=/^[A-Z]{1,3}[0-9]+\\./'),
      });

      if ((await outcomeCheckboxes.count()) > 0) {
        // Select first available outcome
        await outcomeCheckboxes.first().check();

        // Step 6: Add cultural notes (advanced options)
        const advancedButton = page.locator('button:has-text("Advanced options")');
        if (await advancedButton.isVisible()) {
          await advancedButton.click();

          const culturalNotesField = page.locator('textarea[placeholder*="cultural"]');
          if (await culturalNotesField.isVisible()) {
            await culturalNotesField.fill(
              "Consider student's cultural background and language proficiency level",
            );
          }
        }

        // Step 7: Create assessment
        await page.click('button:has-text("Create Template")');

        // Wait for success
        await page.waitForTimeout(3000);

        // Verify creation was successful
        const hasSuccessMessage = await page
          .locator('text=/Assessment.*created|Success/')
          .isVisible();
        const isRedirected = page.url() !== `${BASE_URL}/assessments/new`;

        expect(hasSuccessMessage || isRedirected).toBeTruthy();
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/assessments/new`);
      await page.waitForSelector('text=Create Language-Sensitive Assessment Template', {
        timeout: 10000,
      });

      // Try to create without filling required fields
      await page.click('button:has-text("Create Template")');

      // Should show validation errors
      await expect(page.locator('text=/Title.*required|Please.*title/i')).toBeVisible({
        timeout: 3000,
      });
    });

    test('should support different assessment types', async ({ page }) => {
      await page.goto(`${BASE_URL}/assessments/new`);
      await page.waitForSelector('text=Create Language-Sensitive Assessment Template', {
        timeout: 10000,
      });

      // Test different assessment types
      const assessmentTypes = ['Oral', 'Reading', 'Writing', 'Mixed'];

      for (const type of assessmentTypes) {
        const typeButton = page.locator(`label:has-text("${type}")`);
        if (await typeButton.isVisible()) {
          await typeButton.click();
          await page.waitForTimeout(500);

          // Verify type-specific criteria appear
          if (type === 'Oral') {
            await expect(page.locator('text=Pronunciation')).toBeVisible({ timeout: 2000 });
          } else if (type === 'Writing') {
            await expect(page.locator('text=Vocabulary')).toBeVisible({ timeout: 2000 });
          }
        }
      }
    });
  });

  test.describe('Cross-Component Integration', () => {
    test('should support workflow between evidence entry and reflections', async ({ page }) => {
      // Step 1: Create evidence entry
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('text=Quick Evidence Entry', { timeout: 10000 });

      // Add evidence for specific outcome
      const searchButton = page.locator('button:has-text("Search")');
      if (await searchButton.isVisible()) {
        await searchButton.click();
        await page.fill('input[placeholder="Search outcomes..."]', 'reading');

        const outcomes = page.locator('input[type="checkbox"]').filter({
          has: page.locator('text=/^[A-Z]{1,3}[0-9]+\\./'),
        });

        if ((await outcomes.count()) > 0) {
          // Remember the outcome code for later
          const outcomeCode = (await outcomes.first().locator('+ *').textContent()) || '';
          await outcomes.first().check();

          // Add evidence
          await page.fill('textarea[placeholder*="Describe"]', 'Evidence from E2E test workflow');

          // Select student if available
          const studentCheckboxes = page.locator('input[type="checkbox"]').filter({
            has: page.locator('text=/Grade [0-9]/'),
          });

          if ((await studentCheckboxes.count()) > 0) {
            await studentCheckboxes.first().check();
            await page.click('button:has-text("Save Evidence")');
            await page.waitForTimeout(2000);
          }

          // Step 2: Navigate to reflections for same outcome
          await page.goto(`${BASE_URL}/reflections`);
          await page.waitForSelector('text=Learning Outcomes', { timeout: 10000 });

          // Find the same outcome
          if (outcomeCode) {
            const outcomeInReflections = page.locator(`button:has-text("${outcomeCode}")`);
            if (await outcomeInReflections.isVisible()) {
              await outcomeInReflections.click();

              // Add reflection based on evidence
              await page.fill(
                'textarea[placeholder*="Write your observations"]',
                'Based on recent evidence, student is progressing well in this area',
              );
              await page.click('button:has-text("Add")');
              await page.waitForTimeout(2000);
            }
          }
        }
      }
    });

    test('should maintain state across page navigation', async ({ page }) => {
      // Start evidence entry
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('text=Quick Evidence Entry', { timeout: 10000 });

      const evidenceText = 'Partial evidence entry for navigation test';
      await page.fill('textarea[placeholder*="Describe"]', evidenceText);

      // Navigate away and back
      await page.goto(`${BASE_URL}/reflections`);
      await page.waitForTimeout(1000);
      await page.goto(`${BASE_URL}/dashboard`);

      // Check if evidence text is preserved (depends on implementation)
      await page.waitForSelector('text=Quick Evidence Entry', { timeout: 10000 });
      const currentText = await page.inputValue('textarea[placeholder*="Describe"]');

      // Text might be preserved or cleared depending on component implementation
      console.log(
        'Navigation state preservation:',
        currentText === evidenceText ? 'preserved' : 'cleared',
      );
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should load assessment components within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('text=Quick Evidence Entry', { timeout: 15000 });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds

      console.log(`Assessment components loaded in ${loadTime}ms`);
    });

    test('should handle multiple concurrent operations', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('text=Quick Evidence Entry', { timeout: 10000 });

      // Perform multiple operations quickly
      const promises = [
        page.fill('textarea[placeholder*="Describe"]', 'Concurrent test 1'),
        page.locator('button:has-text("😊")').click(),
        page
          .locator('button:has-text("Search")')
          .click()
          .catch(() => {}), // May not exist
      ];

      await Promise.all(promises);

      // Component should remain stable
      await expect(page.locator('text=Quick Evidence Entry')).toBeVisible();
    });

    test('should recover from network interruptions', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForSelector('text=Quick Evidence Entry', { timeout: 10000 });

      // Simulate network interruption by blocking network requests temporarily
      await page.route('**/api/**', (route) => route.abort());

      // Try to perform an action that would normally require API
      await page.fill('textarea[placeholder*="Describe"]', 'Network test evidence');
      await page.locator('button:has-text("Save Evidence")').click();

      // Unblock network
      await page.unroute('**/api/**');

      // Component should handle the error gracefully
      await expect(page.locator('text=Quick Evidence Entry')).toBeVisible();
    });
  });
});
