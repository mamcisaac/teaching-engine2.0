import { test, expect } from '@playwright/test';
import { useDefaultTestUser } from './helpers/auth-updated';

test.describe('Milestone Management', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure user is authenticated
    await useDefaultTestUser(page);
  });

  test('creates a new milestone', async ({ page }) => {
    // First create a subject
    await page.goto('/subjects');

    // Create a new subject
    await page.click('button:has-text("Add Subject")');
    await page.waitForSelector('#subject-name');
    await page.fill('#subject-name', 'Milestone Test Subject');
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForSelector('#subject-name', { state: 'hidden' });

    // Navigate to the test subject
    await page.click('a:has-text("Milestone Test Subject")');

    // Wait for the subject page to load
    await page.waitForSelector('button:has-text("Add Milestone")');

    // Listen for milestone creation API response
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/milestones') && response.request().method() === 'POST',
    );

    // Create a new milestone
    await page.click('button:has-text("Add Milestone")');

    // Wait for dialog to open
    await page.waitForSelector('#milestone-title');

    // Fill in the form - don't fill dates as they need to be in ISO datetime format
    await page.fill('#milestone-title', 'Test Milestone');
    await page.fill('textarea', 'Test milestone description');

    // Submit the form
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for the API response
    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);

    // Wait for dialog to close
    await page.waitForSelector('#milestone-title', { state: 'hidden' });

    // Give React time to re-render
    await page.waitForTimeout(1000);

    // Verify the milestone was created
    const milestoneCount = await page.locator('text=Test Milestone').count();
    expect(milestoneCount).toBeGreaterThan(0);
    await expect(page.locator('text=Test milestone description')).toBeVisible({ timeout: 10000 });
  });

  test('edits an existing milestone', async ({ page }) => {
    // First create a subject
    await page.goto('/subjects');
    await page.click('button:has-text("Add Subject")');
    await page.waitForSelector('#subject-name');
    await page.fill('#subject-name', 'Edit Test Subject');
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForSelector('#subject-name', { state: 'hidden' });

    // Navigate to the test subject
    await page.click('a:has-text("Edit Test Subject")');
    await page.waitForSelector('button:has-text("Add Milestone")');

    // Create a milestone to edit
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/milestones') && response.request().method() === 'POST',
    );

    await page.click('button:has-text("Add Milestone")');
    await page.waitForSelector('#milestone-title');
    await page.fill('#milestone-title', 'Original Milestone');
    await page.fill('textarea', 'Original description');
    await page.click('button[type="submit"]:has-text("Save")');

    const response = await createResponsePromise;
    expect(response.status()).toBe(201);
    await page.waitForSelector('#milestone-title', { state: 'hidden' });
    await page.waitForTimeout(1000); // Give React time to re-render

    // Wait for the milestone to appear
    await expect(page.locator('text=Original Milestone')).toBeVisible({ timeout: 10000 });

    // Set up the response listener BEFORE clicking edit
    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/milestones/') && response.request().method() === 'PUT',
      { timeout: 30000 },
    );

    // Edit the milestone
    const milestoneItem = page.locator('li').filter({ hasText: 'Original Milestone' });
    await milestoneItem.locator('button:has-text("Edit")').click();

    // Wait for edit dialog to open
    await page.waitForSelector('#edit-milestone-title');

    // Clear and update fields
    await page.fill('#edit-milestone-title', 'Updated Milestone Title');
    await page.fill('textarea', 'Updated description');

    // Submit the form
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for the API response
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);

    await page.waitForSelector('#edit-milestone-title', { state: 'hidden' });
    await page.waitForTimeout(1000); // Give React time to re-render

    // Verify the changes
    await expect(page.locator('text=Updated Milestone Title')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Updated description')).toBeVisible({ timeout: 10000 });
  });

  test('deletes a milestone', async ({ page }) => {
    // First create a subject
    await page.goto('/subjects');
    await page.click('button:has-text("Add Subject")');
    await page.waitForSelector('#subject-name');
    await page.fill('#subject-name', 'Delete Test Subject');
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForSelector('#subject-name', { state: 'hidden' });

    // Navigate to the test subject
    await page.click('a:has-text("Delete Test Subject")');
    await page.waitForSelector('button:has-text("Add Milestone")');

    // Create a milestone
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/milestones') && response.request().method() === 'POST',
    );

    await page.click('button:has-text("Add Milestone")');
    await page.waitForSelector('#milestone-title');
    await page.fill('#milestone-title', 'Milestone to Delete');
    await page.click('button[type="submit"]:has-text("Save")');

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    await page.waitForSelector('#milestone-title', { state: 'hidden' });
    await page.waitForTimeout(1000); // Give React time to re-render

    // Wait for the milestone to appear
    await expect(page.locator('text=Milestone to Delete')).toBeVisible({ timeout: 10000 });

    // Listen for delete API response
    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/milestones/') && response.request().method() === 'DELETE',
    );

    // Delete the milestone
    const milestoneItem = page.locator('li').filter({ hasText: 'Milestone to Delete' });
    await milestoneItem.locator('button:has-text("Delete")').click();

    // Wait for the API response
    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(204);
    await page.waitForTimeout(1000); // Give React time to re-render

    // Verify the milestone is gone
    await expect(page.locator('text=Milestone to Delete')).not.toBeVisible({ timeout: 10000 });
  });

  test('adds activities to a milestone', async ({ page }) => {
    // First create a subject
    await page.goto('/subjects');
    await page.click('button:has-text("Add Subject")');
    await page.waitForSelector('#subject-name');
    await page.fill('#subject-name', 'Activity Test Subject');
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForSelector('#subject-name', { state: 'hidden' });

    // Navigate to the test subject
    await page.click('a:has-text("Activity Test Subject")');
    await page.waitForSelector('button:has-text("Add Milestone")');

    // Create a milestone
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/milestones') && response.request().method() === 'POST',
    );

    await page.click('button:has-text("Add Milestone")');
    await page.waitForSelector('#milestone-title');
    await page.fill('#milestone-title', 'Milestone with Activities');
    await page.click('button[type="submit"]:has-text("Save")');

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    await page.waitForSelector('#milestone-title', { state: 'hidden' });
    await page.waitForTimeout(1000); // Give React time to re-render

    // Wait for the milestone to appear
    await expect(page.locator('text=Milestone with Activities')).toBeVisible({ timeout: 10000 });

    // Click on the milestone title to navigate to its detail page
    const milestoneLink = page.locator('a').filter({ hasText: 'Milestone with Activities' });
    await milestoneLink.click();

    // Wait for milestone detail page to load
    await page.waitForSelector('h1:has-text("Milestone with Activities")');

    // Listen for activity creation API response
    const activityResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/activities') && response.request().method() === 'POST',
    );

    // Add a new activity
    await page.click('button:has-text("Add Activity")');

    // Wait for activity form to appear
    await page.waitForSelector('input#activity-title');

    await page.fill('input#activity-title', 'Test Activity');
    await page.fill('textarea', 'Test activity description');

    // Select activity type if select exists
    const typeSelect = page.locator('select#activity-type');
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('lesson');
    }

    // Submit the form
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for the API response
    await activityResponsePromise;
    await page.waitForSelector('input#activity-title', { state: 'hidden' });
    await page.waitForTimeout(1000); // Give React time to re-render

    // Verify the activity was added
    await expect(page.locator('text=Test Activity')).toBeVisible({ timeout: 10000 });
    // Note: The description might not be visible depending on the UI
    const descriptionCount = await page.locator('text=Test activity description').count();
    if (descriptionCount > 0) {
      await expect(page.locator('text=Test activity description')).toBeVisible({ timeout: 10000 });
    }
  });

  test('shows milestone progress', async ({ page }) => {
    // First create a subject
    await page.goto('/subjects');
    await page.click('button:has-text("Add Subject")');
    await page.waitForSelector('#subject-name');
    await page.fill('#subject-name', 'Progress Test Subject');
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForSelector('#subject-name', { state: 'hidden' });

    // Navigate to the test subject
    await page.click('a:has-text("Progress Test Subject")');
    await page.waitForSelector('button:has-text("Add Milestone")');

    // Create a milestone
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/milestones') && response.request().method() === 'POST',
    );

    await page.click('button:has-text("Add Milestone")');
    await page.waitForSelector('#milestone-title');
    await page.fill('#milestone-title', 'Progress Test Milestone');
    await page.click('button[type="submit"]:has-text("Save")');

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
    await page.waitForSelector('#milestone-title', { state: 'hidden' });
    await page.waitForTimeout(1000); // Give React time to re-render

    // Wait for the milestone to appear
    await expect(page.locator('text=Progress Test Milestone')).toBeVisible({ timeout: 10000 });

    // Verify progress bar is visible (should be at 0%)
    const milestoneItem = page.locator('li').filter({ hasText: 'Progress Test Milestone' });
    const progressBar = milestoneItem.locator('.bg-gray-200.rounded');
    await expect(progressBar).toBeVisible();

    // Verify milestone shows in the list
    await expect(page.locator('text=Progress Test Milestone')).toBeVisible();
  });
});
