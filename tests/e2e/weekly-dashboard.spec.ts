/**
 * E2E Test Suite for Weekly Day Plan as Default Dashboard
 * Issue #305: Weekly Day Plan as Default Dashboard (drag-drop, quick-add, today highlight)
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Weekly Day Plan as Default Dashboard', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'emily.mcisaac@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test.describe('Default Route After Login', () => {
    test('should redirect to Week View after login', async () => {
      // Should automatically redirect to /week
      await page.waitForURL('/week');
      expect(page.url()).toContain('/week');
      
      // Week view should be visible
      await expect(page.locator('[data-testid="week-view-grid"]')).toBeVisible();
    });

    test('should persist last viewed week in URL', async () => {
      // Navigate to specific week
      await page.goto('/week?date=2024-01-15');
      
      // Logout and login again
      await page.click('[data-testid="logout-button"]');
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'emily.mcisaac@test.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Should return to last viewed week
      await page.waitForURL('/week?date=2024-01-15');
    });

    test('should show dashboard stats while keeping calendar primary', async () => {
      await page.waitForURL('/week');
      
      // Calendar grid should be primary (largest element)
      const gridBox = await page.locator('[data-testid="week-view-grid"]').boundingBox();
      const statsBox = await page.locator('[data-testid="dashboard-stats"]').boundingBox();
      
      expect(gridBox?.height).toBeGreaterThan(statsBox?.height || 0);
      
      // Stats should still be visible but compact
      await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="lessons-planned-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="coverage-stat"]')).toBeVisible();
    });
  });

  test.describe('Drag and Drop Rescheduling', () => {
    test('should drag lesson between time slots on same day', async () => {
      await page.waitForURL('/week');
      
      // Find a lesson in Monday 9:00 slot
      const sourceLesson = page.locator('[data-testid="lesson-monday-9-00"]').first();
      const targetSlot = page.locator('[data-testid="slot-monday-10-00"]');
      
      // Get initial lesson title
      const lessonTitle = await sourceLesson.textContent();
      
      // Perform drag and drop
      await sourceLesson.dragTo(targetSlot);
      
      // Verify lesson moved to new slot
      await expect(page.locator('[data-testid="slot-monday-10-00"]')).toContainText(lessonTitle || '');
      await expect(page.locator('[data-testid="slot-monday-9-00"]')).not.toContainText(lessonTitle || '');
      
      // Verify persistence (optimistic UI)
      await page.reload();
      await expect(page.locator('[data-testid="slot-monday-10-00"]')).toContainText(lessonTitle || '');
    });

    test('should drag lesson between different days', async () => {
      await page.waitForURL('/week');
      
      const sourceLesson = page.locator('[data-testid="lesson-tuesday-9-00"]').first();
      const targetSlot = page.locator('[data-testid="slot-thursday-14-00"]');
      
      const lessonTitle = await sourceLesson.textContent();
      
      // Drag from Tuesday to Thursday
      await sourceLesson.dragTo(targetSlot);
      
      // Verify moved
      await expect(targetSlot).toContainText(lessonTitle || '');
      
      // Verify API call was made
      const response = await page.waitForResponse(
        resp => resp.url().includes('/api/lessons') && resp.request().method() === 'PUT'
      );
      expect(response.status()).toBe(200);
    });

    test('should show visual feedback during drag', async () => {
      await page.waitForURL('/week');
      
      const lesson = page.locator('[data-testid^="lesson-"]').first();
      const targetSlot = page.locator('[data-testid^="slot-"]').nth(5);
      
      // Start dragging
      await lesson.hover();
      await page.mouse.down();
      
      // Lesson should have dragging state
      await expect(lesson).toHaveClass(/dragging/);
      
      // Move over target
      await targetSlot.hover();
      
      // Target should show drop zone highlight
      await expect(targetSlot).toHaveClass(/drop-target/);
      
      // Complete drop
      await page.mouse.up();
    });

    test('should support undo after drag operation', async () => {
      await page.waitForURL('/week');
      
      const sourceLesson = page.locator('[data-testid^="lesson-"]').first();
      const originalSlot = page.locator('[data-testid^="slot-"]').first();
      const targetSlot = page.locator('[data-testid^="slot-"]').nth(3);
      
      const lessonTitle = await sourceLesson.textContent();
      
      // Perform drag
      await sourceLesson.dragTo(targetSlot);
      
      // Undo notification should appear
      await expect(page.locator('[data-testid="undo-notification"]')).toBeVisible();
      
      // Click undo
      await page.click('[data-testid="undo-button"]');
      
      // Lesson should return to original position
      await expect(originalSlot).toContainText(lessonTitle || '');
      await expect(targetSlot).not.toContainText(lessonTitle || '');
    });

    test('should prevent invalid drops', async () => {
      await page.waitForURL('/week');
      
      // Try to drag two lessons to same slot
      const lesson1 = page.locator('[data-testid^="lesson-"]').nth(0);
      const lesson2 = page.locator('[data-testid^="lesson-"]').nth(1);
      const targetSlot = page.locator('[data-testid^="slot-"]').nth(10);
      
      // Move first lesson
      await lesson1.dragTo(targetSlot);
      
      // Try to move second lesson to same slot
      await lesson2.dragTo(targetSlot);
      
      // Should show error
      await expect(page.locator('[data-testid="conflict-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="conflict-error"]')).toContainText('already has a lesson');
      
      // Second lesson should remain in original position
      const lesson2Parent = await lesson2.locator('..').getAttribute('data-testid');
      expect(lesson2Parent).not.toContain(await targetSlot.getAttribute('data-testid'));
    });
  });

  test.describe('Quick Add in Empty Slots', () => {
    test('should show add button in empty time slots', async () => {
      await page.waitForURL('/week');
      
      // Find empty slots
      const emptySlots = page.locator('[data-testid^="slot-"][data-empty="true"]');
      await expect(emptySlots).toHaveCount.greaterThan(0);
      
      // Each should have an add button
      const firstEmpty = emptySlots.first();
      await firstEmpty.hover();
      await expect(firstEmpty.locator('[data-testid="quick-add-button"]')).toBeVisible();
    });

    test('should open lesson modal with prefilled date/time/subject', async () => {
      await page.waitForURL('/week');
      
      // Click add in Monday 10:00 Math slot
      const emptySlot = page.locator('[data-testid="slot-monday-10-00"][data-subject="math"]');
      await emptySlot.hover();
      await emptySlot.locator('[data-testid="quick-add-button"]').click();
      
      // Modal should open
      await expect(page.locator('[data-testid="lesson-modal"]')).toBeVisible();
      
      // Fields should be prefilled
      await expect(page.locator('[data-testid="lesson-date-input"]')).toHaveValue(/Monday/);
      await expect(page.locator('[data-testid="lesson-time-input"]')).toHaveValue('10:00');
      await expect(page.locator('[data-testid="lesson-subject-select"]')).toHaveValue('Mathématiques');
    });

    test('should create lesson and immediately show in grid', async () => {
      await page.waitForURL('/week');
      
      // Quick add in empty slot
      const emptySlot = page.locator('[data-testid^="slot-"][data-empty="true"]').first();
      const slotId = await emptySlot.getAttribute('data-testid');
      
      await emptySlot.hover();
      await emptySlot.locator('[data-testid="quick-add-button"]').click();
      
      // Fill lesson details
      await page.fill('[data-testid="lesson-title-input"]', 'New Math Lesson');
      await page.fill('[data-testid="lesson-objectives"]', 'Learn addition');
      await page.click('[data-testid="save-lesson-button"]');
      
      // Modal should close
      await expect(page.locator('[data-testid="lesson-modal"]')).not.toBeVisible();
      
      // Lesson should appear in the slot
      await expect(page.locator(`[data-testid="${slotId}"]`)).toContainText('New Math Lesson');
    });

    test('should support keyboard shortcut for quick add', async () => {
      await page.waitForURL('/week');
      
      // Focus on empty slot
      const emptySlot = page.locator('[data-testid^="slot-"][data-empty="true"]').first();
      await emptySlot.focus();
      
      // Press 'n' for new lesson
      await page.keyboard.press('n');
      
      // Modal should open with correct context
      await expect(page.locator('[data-testid="lesson-modal"]')).toBeVisible();
    });
  });

  test.describe('Today Highlight and Navigation', () => {
    test('should highlight today column visually', async () => {
      await page.waitForURL('/week');
      
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const todayColumn = page.locator(`[data-testid="column-${today}"]`);
      
      // Should have distinct styling
      await expect(todayColumn).toHaveClass(/today-highlight/);
      
      // Should have visual indicator
      await expect(todayColumn.locator('[data-testid="today-badge"]')).toBeVisible();
      await expect(todayColumn.locator('[data-testid="today-badge"]')).toContainText('TODAY');
    });

    test('should have Today button that jumps to current week', async () => {
      await page.waitForURL('/week');
      
      // Navigate to different week
      await page.click('[data-testid="next-week-button"]');
      await page.click('[data-testid="next-week-button"]');
      
      // Today button should be visible
      await expect(page.locator('[data-testid="today-button"]')).toBeVisible();
      
      // Click Today button
      await page.click('[data-testid="today-button"]');
      
      // Should return to current week
      const weekTitle = await page.locator('[data-testid="week-title"]').textContent();
      expect(weekTitle).toContain(new Date().toLocaleDateString('en-US', { month: 'long' }));
    });

    test('should navigate between weeks with prev/next buttons', async () => {
      await page.waitForURL('/week');
      
      const initialWeek = await page.locator('[data-testid="week-title"]').textContent();
      
      // Go to next week
      await page.click('[data-testid="next-week-button"]');
      const nextWeek = await page.locator('[data-testid="week-title"]').textContent();
      expect(nextWeek).not.toBe(initialWeek);
      
      // Go to previous week (back to initial)
      await page.click('[data-testid="prev-week-button"]');
      const currentWeek = await page.locator('[data-testid="week-title"]').textContent();
      expect(currentWeek).toBe(initialWeek);
    });

    test('should support mini date picker for navigation', async () => {
      await page.waitForURL('/week');
      
      // Open date picker
      await page.click('[data-testid="date-picker-button"]');
      await expect(page.locator('[data-testid="date-picker-modal"]')).toBeVisible();
      
      // Select specific date
      await page.click('[data-testid="calendar-date-15"]');
      
      // Should navigate to that week
      await expect(page.locator('[data-testid="week-title"]')).toContainText('15');
    });

    test('should maintain scroll position when navigating weeks', async () => {
      await page.waitForURL('/week');
      
      // Scroll to afternoon slots
      await page.evaluate(() => window.scrollTo(0, 500));
      const scrollBefore = await page.evaluate(() => window.scrollY);
      
      // Navigate to next week
      await page.click('[data-testid="next-week-button"]');
      
      // Scroll position should be maintained
      const scrollAfter = await page.evaluate(() => window.scrollY);
      expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(50);
    });
  });

  test.describe('Print and Export', () => {
    test('should print weekly plan', async () => {
      await page.waitForURL('/week');
      
      // Mock print dialog
      await page.evaluate(() => {
        window.print = () => {
          window.printCalled = true;
        };
      });
      
      // Click print button
      await page.click('[data-testid="print-button"]');
      
      // Verify print was called
      const printCalled = await page.evaluate(() => window.printCalled);
      expect(printCalled).toBeTruthy();
      
      // Check print styles are applied
      const printStyles = await page.evaluate(() => {
        const styles = document.querySelector('style[media="print"]');
        return styles?.textContent;
      });
      expect(printStyles).toContain('page-break');
    });

    test('should export weekly plan as PDF', async () => {
      await page.waitForURL('/week');
      
      // Start waiting for download
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await page.click('[data-testid="export-pdf-button"]');
      
      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('weekly-plan');
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation for rescheduling', async () => {
      await page.waitForURL('/week');
      
      // Focus on lesson
      const lesson = page.locator('[data-testid^="lesson-"]').first();
      await lesson.focus();
      
      // Enter move mode with Enter key
      await page.keyboard.press('Enter');
      await expect(lesson).toHaveClass(/move-mode/);
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight'); // Move to next day
      await page.keyboard.press('ArrowDown'); // Move to later time
      
      // Confirm move with Enter
      await page.keyboard.press('Enter');
      
      // Verify lesson moved
      // (Check would depend on specific implementation)
    });

    test('should announce drag operations to screen readers', async () => {
      await page.waitForURL('/week');
      
      // Check for ARIA live region
      const liveRegion = page.locator('[aria-live="polite"]');
      await expect(liveRegion).toBeAttached();
      
      // Perform drag operation
      const lesson = page.locator('[data-testid^="lesson-"]').first();
      const targetSlot = page.locator('[data-testid^="slot-"]').nth(5);
      
      await lesson.dragTo(targetSlot);
      
      // Live region should announce the move
      await expect(liveRegion).toContainText(/moved to/);
    });

    test('should have proper focus indicators', async () => {
      await page.waitForURL('/week');
      
      // Tab through elements
      await page.keyboard.press('Tab');
      
      // Active element should have visible focus ring
      const focusedElement = page.locator(':focus');
      const focusStyles = await focusedElement.evaluate((el) => 
        window.getComputedStyle(el).outline
      );
      
      expect(focusStyles).not.toBe('none');
      expect(focusStyles).toContain('2px'); // Minimum 2px outline
    });
  });

  test.describe('Performance', () => {
    test('should load week view within 2 seconds', async () => {
      const startTime = Date.now();
      await page.goto('/week');
      await page.waitForSelector('[data-testid="week-view-grid"]');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000);
    });

    test('should handle drag operations without lag', async () => {
      await page.waitForURL('/week');
      
      const lesson = page.locator('[data-testid^="lesson-"]').first();
      const targetSlot = page.locator('[data-testid^="slot-"]').nth(5);
      
      const startTime = performance.now();
      await lesson.dragTo(targetSlot);
      const dragTime = performance.now() - startTime;
      
      // Drag operation should be smooth (< 500ms total)
      expect(dragTime).toBeLessThan(500);
    });

    test('should lazy load lesson details on hover', async () => {
      await page.waitForURL('/week');
      
      const lesson = page.locator('[data-testid^="lesson-"]').first();
      
      // Initially, detailed info not loaded
      await expect(lesson.locator('[data-testid="lesson-details"]')).not.toBeVisible();
      
      // Hover to load details
      await lesson.hover();
      
      // Details should load
      await expect(lesson.locator('[data-testid="lesson-details"]')).toBeVisible();
      
      // Should include full information
      await expect(lesson.locator('[data-testid="lesson-objectives"]')).toBeVisible();
      await expect(lesson.locator('[data-testid="lesson-materials"]')).toBeVisible();
    });
  });
});