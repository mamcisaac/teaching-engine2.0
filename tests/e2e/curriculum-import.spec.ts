import { test, expect } from '@playwright/test';
import { initApiContext, createTestUser, loginAsTestUser, cleanupTestUsers } from './helpers/auth-updated';

test.describe('Curriculum Import Workflow', () => {
  test.beforeAll(async ({ playwright }) => {
    await initApiContext(playwright);
  });

  test.afterAll(async () => {
    await cleanupTestUsers();
  });

  test('should complete full curriculum import confirmation workflow', async ({ page }) => {
    const teacher = await createTestUser('teacher', {
      name: 'Curriculum Import Teacher',
    });

    await loginAsTestUser(page, teacher);

    // Navigate to curriculum import page
    await page.goto('/curriculum-import');
    await expect(page.locator('h1')).toContainText('Curriculum Import');

    // Test manual curriculum entry workflow
    await page.locator('[data-testid="import-method-manual"]').click();
    await expect(page.locator('[data-testid="manual-import-form"]')).toBeVisible();

    // Set basic metadata
    await page.locator('[data-testid="manual-grade"]').selectOption('3');
    await page.locator('[data-testid="manual-subject"]').selectOption('Science');
    await page.locator('[data-testid="import-title"]').fill('Grade 3 Science Curriculum Test');

    // Add multiple curriculum expectations manually
    const expectations = [
      {
        code: 'SC3.1',
        description: 'Students will identify living and non-living things in their environment',
        strand: 'Life Systems',
        substrand: 'Living Things'
      },
      {
        code: 'SC3.2', 
        description: 'Students will describe the basic needs of plants and animals',
        strand: 'Life Systems',
        substrand: 'Basic Needs'
      },
      {
        code: 'SC3.3',
        description: 'Students will observe and describe changes in plants and animals',
        strand: 'Life Systems',
        substrand: 'Changes Over Time'
      }
    ];

    for (let i = 0; i < expectations.length; i++) {
      const exp = expectations[i];
      
      await page.locator('[data-testid="add-expectation-btn"]').click();
      
      // Fill expectation details
      await page.locator(`[data-testid="expectation-code-${i}"]`).fill(exp.code);
      await page.locator(`[data-testid="expectation-description-${i}"]`).fill(exp.description);
      await page.locator(`[data-testid="expectation-strand-${i}"]`).fill(exp.strand);
      await page.locator(`[data-testid="expectation-substrand-${i}"]`).fill(exp.substrand);
      
      // Save individual expectation
      await page.locator(`[data-testid="save-expectation-${i}"]`).click();
      await expect(page.locator(`[data-testid="expectation-saved-${i}"]`)).toBeVisible();
    }

    // Review all added expectations
    await expect(page.locator('[data-testid="expectation-count"]')).toContainText('3 expectations');
    
    // Preview the import
    await page.locator('[data-testid="preview-import-btn"]').click();
    await expect(page.locator('[data-testid="import-preview-modal"]')).toBeVisible();
    
    // Verify preview shows correct information
    await expect(page.locator('[data-testid="preview-grade"]')).toContainText('Grade 3');
    await expect(page.locator('[data-testid="preview-subject"]')).toContainText('Science');
    await expect(page.locator('[data-testid="preview-expectation-count"]')).toContainText('3');
    
    // Check strand breakdown
    await expect(page.locator('[data-testid="strand-life-systems"]')).toContainText('Life Systems: 3 expectations');
    
    await page.locator('[data-testid="close-preview"]').click();

    // Proceed to confirmation step
    await page.locator('[data-testid="proceed-to-confirmation"]').click();
    await expect(page.locator('[data-testid="confirmation-step"]')).toBeVisible();

    // Confirmation step should show review of all expectations
    await expect(page.locator('[data-testid="confirmation-title"]')).toContainText('Confirm Curriculum Import');
    await expect(page.locator('[data-testid="confirmation-summary"]')).toContainText('3 curriculum expectations');

    // Review and edit expectations if needed
    await page.locator('[data-testid="edit-expectation-SC3.1"]').click();
    await expect(page.locator('[data-testid="edit-modal"]')).toBeVisible();
    
    // Make a small edit
    await page.locator('[data-testid="edit-description"]').fill('Students will identify and classify living and non-living things in their environment');
    await page.locator('[data-testid="save-edit"]').click();
    await expect(page.locator('[data-testid="edit-saved"]')).toBeVisible();

    // Check clustering suggestions (if AI clustering is available)
    await expect(page.locator('[data-testid="clustering-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggested-clusters"]')).toContainText('Life Systems');
    
    // Apply suggested clustering
    await page.locator('[data-testid="apply-clustering"]').click();
    await expect(page.locator('[data-testid="clustering-applied"]')).toBeVisible();

    // Finalize the import
    await page.locator('[data-testid="confirm-import-btn"]').click();
    
    // Should show processing state
    await expect(page.locator('[data-testid="import-processing"]')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('[data-testid="import-completed"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="import-success-message"]')).toContainText('Successfully imported 3 curriculum expectations');

    // Verify import results
    await expect(page.locator('[data-testid="import-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="expectations-created"]')).toContainText('3');
    await expect(page.locator('[data-testid="clusters-created"]')).toContainText('1'); // Life Systems cluster

    // Navigate to view imported expectations
    await page.locator('[data-testid="view-expectations-btn"]').click();
    await expect(page.locator('h1')).toContainText('Curriculum Expectations');
    
    // Verify expectations are visible and searchable
    await expect(page.locator('[data-testid="expectation-SC3.1"]')).toBeVisible();
    await expect(page.locator('[data-testid="expectation-SC3.2"]')).toBeVisible();
    await expect(page.locator('[data-testid="expectation-SC3.3"]')).toBeVisible();
    
    // Test search functionality
    await page.locator('[data-testid="search-expectations"]').fill('plants');
    await page.locator('[data-testid="search-btn"]').click();
    await expect(page.locator('[data-testid="search-results"]')).toContainText('SC3.2');
    
    // Test filter by strand
    await page.locator('[data-testid="filter-strand"]').selectOption('Life Systems');
    await expect(page.locator('[data-testid="filtered-results"]')).toContainText('3 expectations');

    // Verify expectations can be used in planning
    await page.goto('/long-range-plans');
    await page.locator('[data-testid="create-lrp-btn"]').click();
    
    // Fill basic LRP info
    await page.locator('[data-testid="lrp-title"]').fill('Grade 3 Science Long-Range Plan');
    await page.locator('[data-testid="lrp-grade"]').selectOption('3');
    await page.locator('[data-testid="lrp-subject"]').selectOption('Science');
    
    // Select imported expectations
    await page.locator('[data-testid="expectation-selector"]').click();
    await expect(page.locator('[data-testid="available-expectations"]')).toContainText('SC3.1');
    await expect(page.locator('[data-testid="available-expectations"]')).toContainText('SC3.2');
    await expect(page.locator('[data-testid="available-expectations"]')).toContainText('SC3.3');
    
    // Select all imported expectations
    await page.locator('[data-testid="select-all-life-systems"]').click();
    await page.locator('[data-testid="apply-expectations"]').click();
    
    // Verify expectations are linked
    await expect(page.locator('[data-testid="selected-expectations"]')).toContainText('3 expectations selected');
    
    // Save LRP
    await page.locator('[data-testid="save-lrp-btn"]').click();
    await expect(page.locator('[data-testid="lrp-created-success"]')).toBeVisible();
  });

  test('should handle CSV curriculum import workflow', async ({ page }) => {
    const teacher = await createTestUser('teacher', {
      name: 'CSV Import Teacher',
    });

    await loginAsTestUser(page, teacher);

    await page.goto('/curriculum-import');

    // Select CSV import method
    await page.locator('[data-testid="import-method-csv"]').click();
    await expect(page.locator('[data-testid="csv-import-form"]')).toBeVisible();

    // Upload CSV file (mock file upload)
    const csvContent = `code,description,strand,substrand,grade,subject
MA4.1,"Students will add and subtract whole numbers up to 1000","Number Sense","Operations",4,"Mathematics"
MA4.2,"Students will multiply single-digit numbers","Number Sense","Operations",4,"Mathematics"
MA4.3,"Students will identify equivalent fractions","Number Sense","Fractions",4,"Mathematics"
MA4.4,"Students will measure length in metric units","Measurement","Length",4,"Mathematics"`;

    // Create a mock file and upload
    await page.locator('[data-testid="csv-file-input"]').setInputFiles({
      name: 'grade4-math.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });

    // Verify file was uploaded
    await expect(page.locator('[data-testid="file-uploaded"]')).toBeVisible();
    await expect(page.locator('[data-testid="uploaded-filename"]')).toContainText('grade4-math.csv');

    // Process CSV
    await page.locator('[data-testid="process-csv-btn"]').click();
    
    // Should show parsing results
    await expect(page.locator('[data-testid="csv-parsed"]')).toBeVisible();
    await expect(page.locator('[data-testid="parsed-count"]')).toContainText('4 expectations');
    await expect(page.locator('[data-testid="detected-grade"]')).toContainText('Grade 4');
    await expect(page.locator('[data-testid="detected-subject"]')).toContainText('Mathematics');

    // Review parsed expectations
    await expect(page.locator('[data-testid="parsed-expectation-MA4.1"]')).toBeVisible();
    await expect(page.locator('[data-testid="parsed-expectation-MA4.4"]')).toBeVisible();

    // Check strand distribution
    await expect(page.locator('[data-testid="strand-number-sense"]')).toContainText('Number Sense: 3');
    await expect(page.locator('[data-testid="strand-measurement"]')).toContainText('Measurement: 1');

    // Edit a parsed expectation
    await page.locator('[data-testid="edit-parsed-MA4.1"]').click();
    await page.locator('[data-testid="edit-parsed-description"]').fill('Students will add and subtract whole numbers up to 1000 with regrouping');
    await page.locator('[data-testid="save-parsed-edit"]').click();

    // Proceed to confirmation
    await page.locator('[data-testid="proceed-to-confirmation"]').click();
    
    // Confirmation should show updated count
    await expect(page.locator('[data-testid="confirmation-summary"]')).toContainText('4 curriculum expectations');
    
    // Final import
    await page.locator('[data-testid="confirm-import-btn"]').click();
    await expect(page.locator('[data-testid="import-completed"]')).toBeVisible();
    
    // Verify import success
    await expect(page.locator('[data-testid="import-success-message"]')).toContainText('Successfully imported 4 curriculum expectations');
  });

  test('should handle PDF curriculum import workflow', async ({ page }) => {
    const teacher = await createTestUser('teacher', {
      name: 'PDF Import Teacher',
    });

    await loginAsTestUser(page, teacher);

    await page.goto('/curriculum-import');

    // Select PDF import method
    await page.locator('[data-testid="import-method-pdf"]').click();
    await expect(page.locator('[data-testid="pdf-import-form"]')).toBeVisible();

    // Upload PDF file (mock)
    await page.locator('[data-testid="pdf-file-input"]').setInputFiles({
      name: 'grade2-english.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock PDF content')
    });

    // Set metadata for PDF processing
    await page.locator('[data-testid="pdf-grade"]').selectOption('2');
    await page.locator('[data-testid="pdf-subject"]').selectOption('English');
    
    // Start PDF processing
    await page.locator('[data-testid="process-pdf-btn"]').click();
    
    // Should show processing status
    await expect(page.locator('[data-testid="pdf-processing"]')).toBeVisible();
    await expect(page.locator('[data-testid="processing-status"]')).toContainText('Extracting text');
    
    // Mock processing completion
    await page.waitForSelector('[data-testid="pdf-processed"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="extracted-text-preview"]')).toBeVisible();
    
    // Should show parsed expectations (mock data)
    await expect(page.locator('[data-testid="pdf-parsed-count"]')).toContainText('expectations extracted');
    
    // Review and edit extracted expectations
    await page.locator('[data-testid="review-extracted"]').click();
    await expect(page.locator('[data-testid="extracted-expectations-list"]')).toBeVisible();
    
    // Proceed with import
    await page.locator('[data-testid="proceed-to-confirmation"]').click();
    await page.locator('[data-testid="confirm-import-btn"]').click();
    
    await expect(page.locator('[data-testid="import-completed"]')).toBeVisible();
  });

  test('should handle import validation and error scenarios', async ({ page }) => {
    const teacher = await createTestUser('teacher', {
      name: 'Validation Test Teacher',
    });

    await loginAsTestUser(page, teacher);

    await page.goto('/curriculum-import');

    // Test invalid CSV format
    await page.locator('[data-testid="import-method-csv"]').click();
    
    const invalidCsv = `code,description
INVALID,"Missing required columns"`;

    await page.locator('[data-testid="csv-file-input"]').setInputFiles({
      name: 'invalid.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(invalidCsv)
    });

    await page.locator('[data-testid="process-csv-btn"]').click();
    
    // Should show validation error
    await expect(page.locator('[data-testid="csv-validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Missing required columns');

    // Test manual validation
    await page.locator('[data-testid="import-method-manual"]').click();
    await page.locator('[data-testid="add-expectation-btn"]').click();
    
    // Try to save empty expectation
    await page.locator('[data-testid="save-expectation-0"]').click();
    
    // Should show validation errors
    await expect(page.locator('[data-testid="validation-error-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-description"]')).toBeVisible();

    // Test duplicate code validation
    await page.locator('[data-testid="expectation-code-0"]').fill('DUP.1');
    await page.locator('[data-testid="expectation-description-0"]').fill('First expectation');
    await page.locator('[data-testid="save-expectation-0"]').click();
    
    // Add another with same code
    await page.locator('[data-testid="add-expectation-btn"]').click();
    await page.locator('[data-testid="expectation-code-1"]').fill('DUP.1');
    await page.locator('[data-testid="expectation-description-1"]').fill('Duplicate expectation');
    await page.locator('[data-testid="save-expectation-1"]').click();
    
    // Should show duplicate error
    await expect(page.locator('[data-testid="duplicate-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="duplicate-error"]')).toContainText('Code already exists');

    // Test network error during import
    await page.route('**/api/curriculum-import', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    // Fix duplicate and try to proceed
    await page.locator('[data-testid="expectation-code-1"]').fill('DUP.2');
    await page.locator('[data-testid="save-expectation-1"]').click();
    
    await page.locator('[data-testid="proceed-to-confirmation"]').click();
    await page.locator('[data-testid="confirm-import-btn"]').click();
    
    // Should show network error
    await expect(page.locator('[data-testid="import-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to import');
    
    // Should offer retry option
    await expect(page.locator('[data-testid="retry-import-btn"]')).toBeVisible();
  });

  test('should support batch import operations', async ({ page }) => {
    const teacher = await createTestUser('teacher', {
      name: 'Batch Import Teacher',
    });

    await loginAsTestUser(page, teacher);

    await page.goto('/curriculum-import');

    // Test batch CSV import with multiple subjects
    await page.locator('[data-testid="import-method-batch"]').click();
    await expect(page.locator('[data-testid="batch-import-form"]')).toBeVisible();

    // Upload multiple files
    const files = [
      {
        name: 'grade1-math.csv',
        content: 'code,description,strand,grade,subject\nMA1.1,"Count to 20","Number Sense",1,"Mathematics"'
      },
      {
        name: 'grade1-science.csv', 
        content: 'code,description,strand,grade,subject\nSC1.1,"Living things","Life Systems",1,"Science"'
      }
    ];

    for (const file of files) {
      await page.locator('[data-testid="add-batch-file-btn"]').click();
      await page.locator('[data-testid="batch-file-input"]').last().setInputFiles({
        name: file.name,
        mimeType: 'text/csv',
        buffer: Buffer.from(file.content)
      });
    }

    // Process batch
    await page.locator('[data-testid="process-batch-btn"]').click();
    
    // Should show batch processing status
    await expect(page.locator('[data-testid="batch-processing"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-progress"]')).toContainText('Processing 2 files');
    
    // Wait for completion
    await expect(page.locator('[data-testid="batch-processed"]')).toBeVisible();
    
    // Should show summary of all files
    await expect(page.locator('[data-testid="batch-summary"]')).toContainText('2 files processed');
    await expect(page.locator('[data-testid="total-expectations"]')).toContainText('2 expectations');
    
    // Review batch results
    await page.locator('[data-testid="review-batch-results"]').click();
    await expect(page.locator('[data-testid="file-math-results"]')).toContainText('Mathematics: 1 expectation');
    await expect(page.locator('[data-testid="file-science-results"]')).toContainText('Science: 1 expectation');
    
    // Proceed with batch import
    await page.locator('[data-testid="proceed-batch-confirmation"]').click();
    await page.locator('[data-testid="confirm-batch-import"]').click();
    
    await expect(page.locator('[data-testid="batch-import-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-success-message"]')).toContainText('Successfully imported from 2 files');
  });
});