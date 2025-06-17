import { test, expect } from '@playwright/test';
import { 
  login, 
  TestDataFactory, 
  retry,
  capturePageState,
  waitForResponse 
} from './improved-helpers';

test.describe('Milestone Management Workflow', () => {
  test('complete milestone creation and configuration workflow', async ({ page }) => {
    let testData: TestDataFactory;
    
    try {
      // Login and get token
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create a subject first (milestone depends on subject)
      const subject = await retry(async () => {
        return await testData.createSubject('Milestone Test Subject');
      });

      // Navigate to milestones page or subject detail page
      await page.goto(`/subjects/${subject.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle');

      // Look for milestone creation button
      const addMilestoneButton = page.locator('button:has-text("Add Milestone"), button:has-text("Create Milestone"), button:has-text("New Milestone")');
      
      // If not found on subject page, try milestones page
      if (!(await addMilestoneButton.isVisible({ timeout: 3000 }))) {
        await page.goto('/milestones', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForLoadState('networkidle');
      }

      // Create new milestone
      const milestoneTitle = `E2E Test Milestone ${Date.now()}`;
      
      await addMilestoneButton.waitFor({ state: 'visible', timeout: 10000 });
      await addMilestoneButton.click();

      // Fill in milestone form
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i], input[placeholder*="name" i]');
      await titleInput.waitFor({ state: 'visible', timeout: 10000 });
      await titleInput.fill(milestoneTitle);

      // Set start date (today)
      const startDateInput = page.locator('input[name="startDate"], input[type="date"]').first();
      if (await startDateInput.isVisible({ timeout: 3000 })) {
        const today = new Date().toISOString().split('T')[0];
        await startDateInput.fill(today);
      }

      // Set end date (2 weeks from now)
      const endDateInput = page.locator('input[name="endDate"], input[type="date"]').last();
      if (await endDateInput.isVisible({ timeout: 3000 })) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 14);
        await endDateInput.fill(futureDate.toISOString().split('T')[0]);
      }

      // Select subject if needed
      const subjectSelect = page.locator('select[name="subjectId"], select:has(option:text("Subject"))');
      if (await subjectSelect.isVisible({ timeout: 3000 })) {
        await subjectSelect.selectOption(subject.id.toString());
      }

      // Submit the form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
      await submitButton.click();

      // Wait for milestone to be created
      await waitForResponse(page, '/api/milestones', { method: 'POST' });
      await page.waitForLoadState('networkidle');

      // Verify milestone appears in the interface
      await expect(page.locator(`text="${milestoneTitle}"`)).toBeVisible({ timeout: 10000 });

    } catch (error) {
      await capturePageState(page, 'milestone-creation-failure');
      throw error;
    }
  });

  test('milestone date validation and conflict detection', async ({ page }) => {
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create subject
      const subject = await testData.createSubject('Date Validation Subject');

      // Navigate to milestone creation
      await page.goto(`/subjects/${subject.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle');

      const addMilestoneButton = page.locator('button:has-text("Add Milestone"), button:has-text("Create Milestone")');
      if (await addMilestoneButton.isVisible({ timeout: 3000 })) {
        await addMilestoneButton.click();

        // Test invalid date range (end before start)
        const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
        await titleInput.waitFor({ state: 'visible' });
        await titleInput.fill('Invalid Date Test');

        const startDateInput = page.locator('input[name="startDate"], input[type="date"]').first();
        const endDateInput = page.locator('input[name="endDate"], input[type="date"]').last();

        if (await startDateInput.isVisible() && await endDateInput.isVisible()) {
          // Set end date before start date
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          await startDateInput.fill(today.toISOString().split('T')[0]);
          await endDateInput.fill(yesterday.toISOString().split('T')[0]);

          const submitButton = page.locator('button[type="submit"], button:has-text("Save")');
          await submitButton.click();

          // Should show validation error
          const errorMessage = page.locator('text*="invalid", text*="before", text*="after", [role="alert"], .error');
          await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
        }

        // Cancel form
        const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Close")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }

    } catch (error) {
      await capturePageState(page, 'milestone-validation-failure');
      throw error;
    }
  });

  test('milestone editing and progress tracking', async ({ page }) => {
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create test data
      const subject = await testData.createSubject('Progress Tracking Subject');
      const milestone = await testData.createMilestone(subject.id, {
        title: 'Editable Milestone Test',
      });

      // Navigate to milestone detail page
      await page.goto(`/milestones/${milestone.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle');

      // Verify milestone is displayed
      await expect(page.locator(`text="${milestone.title}"`)).toBeVisible({ timeout: 10000 });

      // Test editing milestone
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-milestone"]');
      if (await editButton.isVisible({ timeout: 5000 })) {
        await editButton.click();

        const titleInput = page.locator('input[name="title"], input[value*="Editable"]');
        await titleInput.waitFor({ state: 'visible' });
        
        const updatedTitle = `${milestone.title} - Updated`;
        await titleInput.fill(updatedTitle);

        const saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")');
        await saveButton.click();

        await waitForResponse(page, `/api/milestones/${milestone.id}`, { method: 'PUT' });
        await expect(page.locator(`text="${updatedTitle}"`)).toBeVisible({ timeout: 10000 });
      }

      // Test milestone completion/progress if available
      const progressIndicator = page.locator('[data-testid="milestone-progress"], .progress, text*="progress"');
      if (await progressIndicator.isVisible({ timeout: 3000 })) {
        // Progress tracking is implemented
        console.log('Milestone progress tracking is available');
      }

    } catch (error) {
      await capturePageState(page, 'milestone-editing-failure');
      throw error;
    }
  });

  test('milestone to activity workflow integration', async ({ page }) => {
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create test data
      const subject = await testData.createSubject('Activity Integration Subject');
      const milestone = await testData.createMilestone(subject.id, {
        title: 'Activity Parent Milestone',
      });

      // Navigate to milestone detail page
      await page.goto(`/milestones/${milestone.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle');

      // Add activity to milestone
      const addActivityButton = page.locator('button:has-text("Add Activity"), button:has-text("Create Activity"), button:has-text("New Activity")');
      
      if (await addActivityButton.isVisible({ timeout: 5000 })) {
        await addActivityButton.click();

        const activityTitle = `E2E Test Activity ${Date.now()}`;
        const titleInput = page.locator('input[name="title"], input[placeholder*="activity" i], input[placeholder*="title" i]');
        await titleInput.waitFor({ state: 'visible' });
        await titleInput.fill(activityTitle);

        // Add description if field exists
        const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]');
        if (await descriptionInput.isVisible({ timeout: 2000 })) {
          await descriptionInput.fill('This is a test activity created via E2E test');
        }

        // Set duration if field exists
        const durationInput = page.locator('input[name="duration"], input[type="number"]');
        if (await durationInput.isVisible({ timeout: 2000 })) {
          await durationInput.fill('30');
        }

        const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
        await submitButton.click();

        await waitForResponse(page, '/api/activities', { method: 'POST' });
        await page.waitForLoadState('networkidle');

        // Verify activity appears under milestone
        await expect(page.locator(`text="${activityTitle}"`)).toBeVisible({ timeout: 10000 });

        // Test activity completion if checkbox exists
        const completionCheckbox = page.locator('input[type="checkbox"][data-testid*="complete"], input[type="checkbox"]:near(:text("Complete"))');
        if (await completionCheckbox.isVisible({ timeout: 3000 })) {
          await completionCheckbox.check();
          await page.waitForLoadState('networkidle');
          
          // Verify completion state
          await expect(completionCheckbox).toBeChecked();
        }
      }

    } catch (error) {
      await capturePageState(page, 'milestone-activity-integration-failure');
      throw error;
    }
  });

  test('milestone timeline and calendar integration', async ({ page }) => {
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create multiple milestones with different dates
      const subject = await testData.createSubject('Timeline Subject');
      
      const startDate1 = new Date();
      const endDate1 = new Date();
      endDate1.setDate(endDate1.getDate() + 7);
      
      const startDate2 = new Date();
      startDate2.setDate(startDate2.getDate() + 8);
      const endDate2 = new Date();
      endDate2.setDate(endDate2.getDate() + 21);

      const milestone1 = await testData.createMilestone(subject.id, {
        title: 'Current Week Milestone',
        startDate: startDate1,
        endDate: endDate1,
      });

      const milestone2 = await testData.createMilestone(subject.id, {
        title: 'Future Milestone',
        startDate: startDate2,
        endDate: endDate2,
      });

      // Navigate to milestones overview or calendar view
      await page.goto('/milestones', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle');

      // Verify both milestones are visible
      await expect(page.locator(`text="${milestone1.title}"`)).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text="${milestone2.title}"`)).toBeVisible({ timeout: 10000 });

      // Test calendar view if available
      const calendarViewButton = page.locator('button:has-text("Calendar"), [data-testid="calendar-view"]');
      if (await calendarViewButton.isVisible({ timeout: 3000 })) {
        await calendarViewButton.click();
        await page.waitForLoadState('networkidle');
        
        // Milestones should be visible in calendar format
        await expect(page.locator(`text="${milestone1.title}"`)).toBeVisible({ timeout: 10000 });
      }

      // Test timeline view if available
      const timelineViewButton = page.locator('button:has-text("Timeline"), [data-testid="timeline-view"]');
      if (await timelineViewButton.isVisible({ timeout: 3000 })) {
        await timelineViewButton.click();
        await page.waitForLoadState('networkidle');
        
        // Milestones should be visible in timeline format
        await expect(page.locator(`text="${milestone1.title}"`)).toBeVisible({ timeout: 10000 });
      }

    } catch (error) {
      await capturePageState(page, 'milestone-timeline-failure');
      throw error;
    }
  });

  test('milestone deletion and cascade effects', async ({ page }) => {
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create milestone with activity
      const subject = await testData.createSubject('Deletion Test Subject');
      const milestone = await testData.createMilestone(subject.id, {
        title: 'Milestone To Delete',
      });
      
      // Add an activity to test cascade deletion
      const activity = await testData.createActivity(milestone.id, 'Activity To Delete');

      // Navigate to milestone
      await page.goto(`/milestones/${milestone.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle');

      // Verify activity exists
      await expect(page.locator(`text="${activity.title}"`)).toBeVisible({ timeout: 10000 });

      // Delete milestone
      const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-milestone"]');
      if (await deleteButton.isVisible({ timeout: 5000 })) {
        await deleteButton.click();

        // Handle confirmation dialog
        const confirmDialog = page.locator('text*="confirm", text*="sure", text*="delete"');
        if (await confirmDialog.isVisible({ timeout: 3000 })) {
          const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm"), button:has-text("Yes")');
          await confirmButton.click();
        }

        await waitForResponse(page, `/api/milestones/${milestone.id}`, { method: 'DELETE' });

        // Should redirect away from deleted milestone page
        await page.waitForURL('**/milestones**', { timeout: 10000 });
        
        // Verify milestone is no longer in list
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`text="${milestone.title}"`)).not.toBeVisible();
      }

    } catch (error) {
      await capturePageState(page, 'milestone-deletion-failure');
      throw error;
    }
  });

  test('milestone filtering and search functionality', async ({ page }) => {
    let testData: TestDataFactory;
    
    try {
      const token = await login(page);
      testData = new TestDataFactory(page, token);

      // Create multiple subjects and milestones for filtering
      const mathSubject = await testData.createSubject('Mathematics');
      const scienceSubject = await testData.createSubject('Science');

      const mathMilestone = await testData.createMilestone(mathSubject.id, {
        title: 'Algebra Basics',
      });
      
      const scienceMilestone = await testData.createMilestone(scienceSubject.id, {
        title: 'Scientific Method',
      });

      // Navigate to milestones page
      await page.goto('/milestones', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle');

      // Verify both milestones are visible
      await expect(page.locator(`text="${mathMilestone.title}"`)).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text="${scienceMilestone.title}"`)).toBeVisible({ timeout: 10000 });

      // Test subject filtering if available
      const subjectFilter = page.locator('select:has(option:text("Mathematics")), [data-testid="subject-filter"]');
      if (await subjectFilter.isVisible({ timeout: 3000 })) {
        await subjectFilter.selectOption('Mathematics');
        await page.waitForLoadState('networkidle');
        
        // Should show only math milestone
        await expect(page.locator(`text="${mathMilestone.title}"`)).toBeVisible();
        // Science milestone should be filtered out
      }

      // Test search functionality
      const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('Algebra');
        await page.waitForTimeout(500);
        
        await expect(page.locator(`text="${mathMilestone.title}"`)).toBeVisible();
        
        // Clear search
        await searchInput.clear();
        await page.waitForTimeout(500);
      }

    } catch (error) {
      await capturePageState(page, 'milestone-filtering-failure');
      throw error;
    }
  });
});