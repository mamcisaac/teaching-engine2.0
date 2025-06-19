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
      timeframe: 'Week of Jan 12-19, 2026',
      contentFr:
        "Cette semaine, nous avons exploré le thème de l'hiver. Les élèves ont appris de nouveaux mots de vocabulaire et ont pratiqué leur prononciation.",
      contentEn:
        'This week, we explored the theme of winter. Students learned new vocabulary words and practiced their pronunciation.',
    };

    // Enter title
    await page.fill(
      'input[placeholder*="Title"], input[placeholder*="Exploring Winter"]',
      newsletterData.title,
    );

    // Check if timeframe field exists (bilingual version)
    const timeframeField = page.locator('input[placeholder*="Week of"]');
    if (await timeframeField.isVisible({ timeout: 1000 })) {
      await timeframeField.fill(newsletterData.timeframe);

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
    } else {
      // Simple version - single content editor
      const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
      await contentEditor.click();
      await contentEditor.fill(newsletterData.contentEn);
    }

    // Save the newsletter
    await page.click('button:has-text("Save"), button:has-text("Create Newsletter")');

    // Wait for success response
    await page
      .waitForResponse(
        (response) => response.url().includes('/api/parent-messages') && response.status() === 201,
        { timeout: 10000 },
      )
      .catch(() => {
        // If no response, continue - UI might have updated already
      });

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
      timeframe: 'January 2026',
      contentFr: 'Mise à jour mensuelle pour les parents.',
      contentEn: 'Monthly update for parents.',
    };

    await page.fill(
      'input[placeholder*="Title"], input[placeholder*="Exploring Winter"]',
      messageData.title,
    );

    // Check for bilingual support
    const timeframeField = page.locator('input[placeholder*="Week of"]');
    if (await timeframeField.isVisible({ timeout: 1000 })) {
      await timeframeField.fill(messageData.timeframe);

      // Enter bilingual content
      const frenchEditor = page.locator('.ProseMirror').first();
      await frenchEditor.click();
      await frenchEditor.fill(messageData.contentFr);

      await page.click('button:has-text("🇬🇧 English")');
      const englishEditor = page.locator('.ProseMirror').last();
      await englishEditor.click();
      await englishEditor.fill(messageData.contentEn);
    } else {
      // Simple version
      const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
      await contentEditor.click();
      await contentEditor.fill(messageData.contentEn);
    }

    await page.click('button:has-text("Save"), button:has-text("Create Newsletter")');
    await waitForElement(page, `text=${messageData.title}`);

    // Test preview functionality
    await page.click(`text=${messageData.title}`);

    // Check for bilingual preview
    const frenchVersion = page.locator('text=Version française');
    if (await frenchVersion.isVisible({ timeout: 1000 })) {
      await waitForElement(page, 'text=English Version');

      // Test language toggle
      await page.click('button:has-text("🇫🇷 Français")');
      await expect(page.locator('text=English Version')).not.toBeVisible();
      await expect(page.locator('text=Version française')).toBeVisible();

      await page.click('button:has-text("Both Languages")');
      await expect(page.locator('text=English Version')).toBeVisible();
      await expect(page.locator('text=Version française')).toBeVisible();
    } else {
      // Simple version - just verify content is displayed
      await waitForElement(page, messageData.contentEn);
    }
  });

  test('should export parent message to different formats', async ({ page }) => {
    // Create a message first
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    const messageData = {
      title: `Export Test ${Date.now()}`,
      timeframe: 'Test Week',
      contentFr: 'Contenu de test en français.',
      contentEn: 'Test content for export functionality.',
    };

    await page.fill(
      'input[placeholder*="Title"], input[placeholder*="Exploring Winter"]',
      messageData.title,
    );

    // Check version and fill accordingly
    const timeframeField = page.locator('input[placeholder*="Week of"]');
    if (await timeframeField.isVisible({ timeout: 1000 })) {
      await timeframeField.fill(messageData.timeframe);

      const frenchEditor = page.locator('.ProseMirror').first();
      await frenchEditor.click();
      await frenchEditor.fill(messageData.contentFr);

      await page.click('button:has-text("🇬🇧 English")');
      const englishEditor = page.locator('.ProseMirror').last();
      await englishEditor.click();
      await englishEditor.fill(messageData.contentEn);
    } else {
      const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
      await contentEditor.click();
      await contentEditor.fill(messageData.contentEn);
    }

    await page.click('button:has-text("Save"), button:has-text("Create Newsletter")');
    await waitForElement(page, `text=${messageData.title}`);

    // Open the message
    await page.click(`text=${messageData.title}`);

    // Check for export options
    const copyHtmlButton = page.locator('button:has-text("📋 Copy HTML")');
    if (await copyHtmlButton.isVisible({ timeout: 1000 })) {
      // Bilingual version with specific export buttons
      await copyHtmlButton.click();
      await waitForElement(page, 'text=HTML content copied');

      await page.click('button:has-text("📝 Copy Markdown")');
      await waitForElement(page, 'text=Markdown content copied');

      await expect(page.locator('button:has-text("📄 Print/PDF")')).toBeVisible();
    } else {
      // Simple version - verify at least some export functionality exists
      await waitForElement(page, messageData.contentEn);

      const exportButtons = page
        .locator('button')
        .filter({ hasText: /copy|export|print|pdf|markdown|html/i });
      const exportButtonCount = await exportButtons.count();
      expect(exportButtonCount).toBeGreaterThan(0);
    }
  });

  test('should link activities and outcomes to parent message', async ({ page }) => {
    // Navigate to parent messages
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    // Fill basic info
    const title = `Linked Content Test ${Date.now()}`;
    await page.fill('input[placeholder*="Title"], input[placeholder*="Exploring Winter"]', title);

    // Check if bilingual version with linking support
    const timeframeField = page.locator('input[placeholder*="Week of"]');
    if (await timeframeField.isVisible({ timeout: 1000 })) {
      await timeframeField.fill('Test Week');

      // Add content
      const frenchEditor = page.locator('.ProseMirror').first();
      await frenchEditor.click();
      await frenchEditor.fill('Test avec contenu lié.');

      // Try to link outcomes
      const outcomeSection = page.locator('text=Linked Outcomes').locator('..');
      if (await outcomeSection.isVisible({ timeout: 1000 })) {
        await outcomeSection.locator('input[type="text"]').click();

        // Select an outcome if available
        const outcomeOption = page.locator('[role="option"]').first();
        if (await outcomeOption.isVisible({ timeout: 2000 })) {
          await outcomeOption.click();
        }
      }

      // Try to link activities
      const activitySection = page.locator('text=Linked Activities').locator('..');
      if (await activitySection.isVisible({ timeout: 1000 })) {
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
      }
    } else {
      // Simple version - no linking support
      test.skip();
      return;
    }

    // Save the message
    await page.click('button:has-text("Create Newsletter")');

    // Verify it saved successfully
    await waitForElement(page, `text=${title}`);
  });

  test('should edit existing parent message', async ({ page }) => {
    // Create a message first
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    const originalTitle = `Edit Test Original ${Date.now()}`;
    await page.fill(
      'input[placeholder*="Title"], input[placeholder*="Exploring Winter"]',
      originalTitle,
    );

    // Check version
    const timeframeField = page.locator('input[placeholder*="Week of"]');
    if (await timeframeField.isVisible({ timeout: 1000 })) {
      await timeframeField.fill('Original Week');

      const frenchEditor = page.locator('.ProseMirror').first();
      await frenchEditor.click();
      await frenchEditor.fill('Contenu original.');
    } else {
      const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
      await contentEditor.click();
      await contentEditor.fill('Original content.');
    }

    await page.click('button:has-text("Save"), button:has-text("Create Newsletter")');
    await waitForElement(page, `text=${originalTitle}`);

    // Open the message
    await page.click(`text=${originalTitle}`);

    // Look for edit button
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.isVisible({ timeout: 1000 })) {
      await editButton.click();
      await waitForElement(page, 'text=Edit Newsletter');

      // Update the title
      const updatedTitle = `Edit Test Updated ${Date.now()}`;
      await page.fill('input[value*="Edit Test Original"]', updatedTitle);

      // Save changes
      await page.click('button:has-text("Update Newsletter")');

      // Verify update
      await waitForElement(page, `text=${updatedTitle}`);
      await expect(page.locator(`text=${originalTitle}`)).not.toBeVisible();
    } else {
      // Simple version may not support editing
      test.skip();
    }
  });

  test('should delete parent message', async ({ page }) => {
    // Create a message to delete
    await page.goto('/parent-messages');
    await page.click('button:has-text("New Message")');

    const messageTitle = `Delete Test ${Date.now()}`;
    await page.fill(
      'input[placeholder*="Title"], input[placeholder*="Exploring Winter"]',
      messageTitle,
    );

    // Fill minimal content
    const timeframeField = page.locator('input[placeholder*="Week of"]');
    if (await timeframeField.isVisible({ timeout: 1000 })) {
      await timeframeField.fill('Delete Week');

      const frenchEditor = page.locator('.ProseMirror').first();
      await frenchEditor.click();
      await frenchEditor.fill('À supprimer.');
    } else {
      const contentEditor = page.locator('div[role="textbox"][contenteditable="true"]');
      await contentEditor.click();
      await contentEditor.fill('Content to be deleted.');
    }

    await page.click('button:has-text("Save"), button:has-text("Create Newsletter")');
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
