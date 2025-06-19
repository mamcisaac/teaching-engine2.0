import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth-updated';
import { waitForElement } from './helpers/ci-stability';

test.describe('Parent Communication Center', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should create a new parent newsletter from weekly planner', async ({ page }) => {
    // Navigate to weekly planner
    await page.goto('/weekly-planner');
    await waitForElement(page, 'text=Weekly Planner');

    // Click create newsletter button
    await page.click('button:has-text("📰 Create Newsletter")');
    await waitForElement(page, 'text=Create Parent Newsletter');

    // Fill in newsletter details
    const newsletterData = {
      title: `Winter Theme Newsletter ${Date.now()}`,
      timeframe: 'Week of Jan 12-19, 2026',
      contentFr:
        "Cette semaine, nous avons exploré le thème de l'hiver. Les élèves ont appris de nouveaux mots de vocabulaire et ont pratiqué leur prononciation.",
      contentEn:
        'This week, we explored the theme of winter. Students learned new vocabulary words and practiced their pronunciation.',
    };

    // Enter title
    await page.fill('input[placeholder*="Exploring Winter"]', newsletterData.title);

    // Set timeframe
    await page.fill('input[placeholder*="Week of"]', newsletterData.timeframe);

    // Enter French content
    await page.click('button:has-text("🇫🇷 Français")');
    const frenchEditor = page.locator('.ProseMirror').first();
    await frenchEditor.click();
    await frenchEditor.fill(newsletterData.contentFr);

    // Switch to English and enter content
    await page.click('button:has-text("🇬🇧 English")');
    const englishEditor = page.locator('.ProseMirror').last();
    await englishEditor.click();
    await englishEditor.fill(newsletterData.contentEn);

    // Save the newsletter
    await page.click('button:has-text("Create Newsletter")');

    // Wait for success message
    await waitForElement(page, 'text=Newsletter created successfully');

    // Verify modal closes
    await expect(page.locator('text=Create Parent Newsletter')).not.toBeVisible({ timeout: 5000 });
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
      timeframe: 'January 2026',
      contentFr: 'Mise à jour mensuelle pour les parents.',
      contentEn: 'Monthly update for parents.',
    };

    await page.fill('input[placeholder*="Exploring Winter"]', messageData.title);
    await page.fill('input[placeholder*="Week of"]', messageData.timeframe);

    // Enter bilingual content
    const frenchEditor = page.locator('.ProseMirror').first();
    await frenchEditor.click();
    await frenchEditor.fill(messageData.contentFr);

    await page.click('button:has-text("🇬🇧 English")');
    const englishEditor = page.locator('.ProseMirror').last();
    await englishEditor.click();
    await englishEditor.fill(messageData.contentEn);

    await page.click('button:has-text("Create Newsletter")');
    await waitForElement(page, `text=${messageData.title}`);

    // Test preview functionality
    await page.click(`text=${messageData.title}`);
    await waitForElement(page, 'text=Version française');
    await waitForElement(page, 'text=English Version');

    // Test language toggle
    await page.click('button:has-text("🇫🇷 Français")');
    await expect(page.locator('text=English Version')).not.toBeVisible();
    await expect(page.locator('text=Version française')).toBeVisible();

    await page.click('button:has-text("Both Languages")');
    await expect(page.locator('text=English Version')).toBeVisible();
    await expect(page.locator('text=Version française')).toBeVisible();
  });

  test('should export parent message to different formats', async ({ page }) => {
    // Create a message first
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    const messageData = {
      title: `Export Test ${Date.now()}`,
      timeframe: 'Test Week',
      contentFr: 'Contenu de test en français.',
      contentEn: 'Test content in English.',
    };

    await page.fill('input[placeholder*="Exploring Winter"]', messageData.title);
    await page.fill('input[placeholder*="Week of"]', messageData.timeframe);

    const frenchEditor = page.locator('.ProseMirror').first();
    await frenchEditor.click();
    await frenchEditor.fill(messageData.contentFr);

    await page.click('button:has-text("🇬🇧 English")');
    const englishEditor = page.locator('.ProseMirror').last();
    await englishEditor.click();
    await englishEditor.fill(messageData.contentEn);

    await page.click('button:has-text("Create Newsletter")');
    await waitForElement(page, `text=${messageData.title}`);

    // Open the message
    await page.click(`text=${messageData.title}`);
    await waitForElement(page, 'text=Version française');

    // Test copy HTML functionality
    await page.click('button:has-text("📋 Copy HTML")');
    await waitForElement(page, 'text=HTML content copied');

    // Test copy Markdown functionality
    await page.click('button:has-text("📝 Copy Markdown")');
    await waitForElement(page, 'text=Markdown content copied');

    // Print/PDF test would open a new window, so we'll just verify the button exists
    await expect(page.locator('button:has-text("📄 Print/PDF")')).toBeVisible();
  });

  test('should link activities and outcomes to parent message', async ({ page }) => {
    // Navigate to parent messages
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    // Fill basic info
    await page.fill('input[placeholder*="Exploring Winter"]', `Linked Content Test ${Date.now()}`);
    await page.fill('input[placeholder*="Week of"]', 'Test Week');

    // Add content
    const frenchEditor = page.locator('.ProseMirror').first();
    await frenchEditor.click();
    await frenchEditor.fill('Test avec contenu lié.');

    // Open outcome selector
    const outcomeSection = page.locator('text=Linked Outcomes').locator('..');
    await outcomeSection.locator('input[type="text"]').click();

    // Select an outcome if available
    const outcomeOption = page.locator('[role="option"]').first();
    if (await outcomeOption.isVisible({ timeout: 2000 })) {
      await outcomeOption.click();
    }

    // Open activity selector
    const activitySection = page.locator('text=Linked Activities').locator('..');
    await activitySection.locator('input[placeholder*="Search activities"]').click();

    // Expand a milestone if available
    const milestoneHeader = page.locator('.bg-gray-50').first();
    if (await milestoneHeader.isVisible({ timeout: 2000 })) {
      await milestoneHeader.click();

      // Select an activity
      const activityCheckbox = page.locator('input[type="checkbox"]').first();
      if (await activityCheckbox.isVisible({ timeout: 2000 })) {
        await activityCheckbox.click();
      }
    }

    // Save the message
    await page.click('button:has-text("Create Newsletter")');

    // Verify it saved successfully
    await waitForElement(page, 'text=Linked Content Test');
  });

  test('should edit existing parent message', async ({ page }) => {
    // Create a message first
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    const originalTitle = `Edit Test Original ${Date.now()}`;
    await page.fill('input[placeholder*="Exploring Winter"]', originalTitle);
    await page.fill('input[placeholder*="Week of"]', 'Original Week');

    const frenchEditor = page.locator('.ProseMirror').first();
    await frenchEditor.click();
    await frenchEditor.fill('Contenu original.');

    await page.click('button:has-text("Create Newsletter")');
    await waitForElement(page, `text=${originalTitle}`);

    // Open the message
    await page.click(`text=${originalTitle}`);
    await waitForElement(page, 'button:has-text("Edit")');

    // Click edit
    await page.click('button:has-text("Edit")');
    await waitForElement(page, 'text=Edit Newsletter');

    // Update the title
    const updatedTitle = `Edit Test Updated ${Date.now()}`;
    await page.fill('input[value*="Edit Test Original"]', updatedTitle);

    // Save changes
    await page.click('button:has-text("Update Newsletter")');

    // Verify update
    await waitForElement(page, `text=${updatedTitle}`);
    await expect(page.locator(`text=${originalTitle}`)).not.toBeVisible();
  });

  test('should delete parent message', async ({ page }) => {
    // Create a message to delete
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    const messageTitle = `Delete Test ${Date.now()}`;
    await page.fill('input[placeholder*="Exploring Winter"]', messageTitle);
    await page.fill('input[placeholder*="Week of"]', 'Delete Week');

    const frenchEditor = page.locator('.ProseMirror').first();
    await frenchEditor.click();
    await frenchEditor.fill('À supprimer.');

    await page.click('button:has-text("Create Newsletter")');
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
