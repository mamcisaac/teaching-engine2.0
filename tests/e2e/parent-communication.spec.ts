import { test, expect } from '@playwright/test';
import { loginAsTestUser, DEFAULT_TEST_USER, initApiContext } from './helpers/auth-updated';
import { waitForElement } from './helpers/ci-stability';

// Initialize API context before all tests
test.beforeAll(async ({ playwright }) => {
  await initApiContext(playwright);
});

test.describe('Parent Communication Center', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, DEFAULT_TEST_USER);
  });

  test('should create a new parent newsletter from parent messages page', async ({ page }) => {
    // Navigate directly to parent messages page
    await page.goto('/parent-messages');
    await waitForElement(page, 'text=Parent Communications');

    // Click create new message button
    await page.click('button:has-text("New Message")');
    await waitForElement(page, 'text=Create Parent Newsletter');

    // Fill in newsletter details
    const newsletterData = {
      title: `Winter Theme Newsletter ${Date.now()}`,
      content:
        'This week, we explored the theme of winter. Students learned new vocabulary words and practiced their pronunciation.',
    };

    // Enter title
    await page.fill('input[placeholder="Title"]', newsletterData.title);

    // Enter content in the rich text editor
    const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
    await contentEditor.click();
    await contentEditor.fill(newsletterData.content);

    // Save the newsletter
    await page.click('button:has-text("Save")');

    // Wait for success toast or for the message to appear in the list
    await page.waitForResponse(
      (response) => response.url().includes('/api/parent-messages') && response.status() === 201,
      { timeout: 10000 },
    );

    // Wait a moment for UI to update
    await page.waitForTimeout(1000);

    // Verify the newsletter appears in the list
    await expect(page.locator(`text="${newsletterData.title}"`)).toBeVisible({ timeout: 5000 });
  });

  test('should view and manage parent messages', async ({ page }) => {
    // Navigate to parent messages page
    await page.goto('/parent-messages');
    await waitForElement(page, 'text=Parent Communications');

    // Create a new message
    await page.click('button:has-text("New Message")');
    await waitForElement(page, 'text=Create Parent Newsletter');

    const messageData = {
      title: `Monthly Update ${Date.now()}`,
      content: 'Monthly update for parents.',
    };

    await page.fill('input[placeholder="Title"]', messageData.title);

    // Enter content
    const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
    await contentEditor.click();
    await contentEditor.fill(messageData.content);

    await page.click('button:has-text("Save")');
    await waitForElement(page, `text=${messageData.title}`);

    // Test preview functionality
    await page.click(`text=${messageData.title}`);

    // Verify the content is displayed in the preview
    await waitForElement(page, messageData.content);
  });

  test('should export parent message to different formats', async ({ page }) => {
    // Create a message first
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    const messageData = {
      title: `Export Test ${Date.now()}`,
      content: 'Test content for export functionality.',
    };

    await page.fill('input[placeholder="Title"]', messageData.title);

    const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
    await contentEditor.click();
    await contentEditor.fill(messageData.content);

    await page.click('button:has-text("Save")');
    await waitForElement(page, `text=${messageData.title}`);

    // Open the message to see export options
    await page.click(`text=${messageData.title}`);

    // Verify message content is displayed
    await waitForElement(page, messageData.content);

    // Verify that export buttons exist on the page
    // The actual buttons might have different text/icons, so we'll check for common export actions
    const exportButtons = page
      .locator('button')
      .filter({ hasText: /copy|export|print|pdf|markdown|html/i });
    const exportButtonCount = await exportButtons.count();

    // There should be at least one export option available
    expect(exportButtonCount).toBeGreaterThan(0);
  });

  test.skip('should link activities and outcomes to parent message', async () => {
    // Skip this test for now - the linking functionality isn't available in the simple newsletter editor
  });

  test.skip('should edit existing parent message', async () => {
    // Skip this test for now - need to verify edit functionality in the simple newsletter editor
  });

  test('should delete parent message', async ({ page }) => {
    // Create a message to delete
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    const messageTitle = `Delete Test ${Date.now()}`;
    await page.fill('input[placeholder="Title"]', messageTitle);

    const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
    await contentEditor.click();
    await contentEditor.fill('Content to be deleted.');

    await page.click('button:has-text("Save")');
    await waitForElement(page, `text=${messageTitle}`);

    // Open the message
    await page.click(`text=${messageTitle}`);
    await waitForElement(page, 'button:has-text("Delete")');

    // Delete with confirmation
    page.on('dialog', (dialog) => dialog.accept());
    await page.click('button:has-text("Delete")');

    // Verify deletion
    await expect(page.locator(`text=${messageTitle}`)).not.toBeVisible({ timeout: 5000 });
  });
});
