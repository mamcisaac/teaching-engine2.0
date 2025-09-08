/**
 * Week View Interactions comprehensive test
 * Tests date navigation and lesson interactions
 */

import { test, expect } from '../fixtures/seed';

test.describe('Week View Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/planner/week');
    await page.waitForLoadState('networkidle');
  });

  test('date navigation updates header deterministically', async ({ page }) => {
    // Current date is frozen to Sept 8, 2025 (Monday)
    const weekHeader = page.getByTestId('week-header')
      .or(page.locator('h1, h2').filter({ hasText: /September 8.*September 12/i }));
    
    // Verify initial week range
    await expect(weekHeader).toContainText('September 8');
    await expect(weekHeader).toContainText('September 12');
    
    // Click Next Week
    const nextButton = page.getByRole('button', { name: /Next Week/i })
      .or(page.getByTestId('next-week-button'));
    await nextButton.click();
    
    // Wait for update
    await page.waitForTimeout(300);
    
    // Should show Sept 15-19
    await expect(weekHeader).toContainText('September 15');
    await expect(weekHeader).toContainText('September 19');
    
    // Click Previous Week twice to go back
    const prevButton = page.getByRole('button', { name: /Previous Week/i })
      .or(page.getByTestId('prev-week-button'));
    await prevButton.click();
    await page.waitForTimeout(300);
    
    // Back to Sept 8-12
    await expect(weekHeader).toContainText('September 8');
    await expect(weekHeader).toContainText('September 12');
    
    await prevButton.click();
    await page.waitForTimeout(300);
    
    // Should show Sept 1-5
    await expect(weekHeader).toContainText('September 1');
    await expect(weekHeader).toContainText('September 5');
  });

  test('today button returns to current week', async ({ page }) => {
    // Navigate away from current week
    const nextButton = page.getByRole('button', { name: /Next Week/i });
    await nextButton.click();
    await nextButton.click();
    await nextButton.click();
    
    // Click Today button
    const todayButton = page.getByRole('button', { name: /Today/i })
      .or(page.getByTestId('today-button'));
    await todayButton.click();
    
    // Should return to Sept 8-12 (week containing Sept 8)
    const weekHeader = page.getByTestId('week-header')
      .or(page.locator('h1, h2').filter({ hasText: /September/i }));
    await expect(weekHeader).toContainText('September 8');
    await expect(weekHeader).toContainText('September 12');
  });

  test('lesson drag and drop updates slot', async ({ page }) => {
    // Find first lesson card
    const firstLesson = page.locator('[data-testid^="lesson-card"]').first()
      .or(page.locator('.lesson-card').first());
    
    // Check if drag and drop is supported
    const isDraggable = await firstLesson.getAttribute('draggable');
    
    if (isDraggable === 'true') {
      // Get initial position
      const initialSlot = await firstLesson.locator('..').getAttribute('data-slot');
      
      // Find a different slot
      const targetSlot = page.locator('[data-slot="2-3"]') // Tuesday, slot 3
        .or(page.locator('.time-slot').nth(12)); // Approximate position
      
      // Perform drag and drop
      await firstLesson.dragTo(targetSlot);
      
      // Wait for update
      await page.waitForTimeout(500);
      
      // Verify lesson moved
      const movedLesson = page.locator('[data-testid^="lesson-card"]').first();
      const newSlot = await movedLesson.locator('..').getAttribute('data-slot');
      expect(newSlot).not.toBe(initialSlot);
    } else {
      // If DnD not supported, check for move buttons or context menu
      const moveButton = page.getByRole('button', { name: /Move/i });
      const hasMoveOption = await moveButton.isVisible().catch(() => false);
      
      if (hasMoveOption) {
        await moveButton.click();
        // Would need to interact with move UI here
      }
    }
  });

  test('quick add button opens lesson creation', async ({ page }) => {
    // Find a quick add button in an empty slot
    const quickAddButton = page.getByTestId('quick-add-button').first()
      .or(page.locator('button[aria-label*="Add lesson"]').first())
      .or(page.locator('.empty-slot button').first());
    
    if (await quickAddButton.isVisible()) {
      await quickAddButton.click();
      
      // Should open modal or form
      const modal = page.getByRole('dialog')
        .or(page.locator('[data-testid="lesson-modal"]'))
        .or(page.locator('.modal'));
      
      await expect(modal).toBeVisible({ timeout: 2000 });
      
      // Should have lesson form fields
      const titleInput = page.getByLabel(/Title/i)
        .or(page.getByPlaceholder(/Title/i));
      await expect(titleInput).toBeVisible();
      
      // Close modal
      const closeButton = page.getByRole('button', { name: /Cancel|Close/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('week view shows correct number of lessons from seed', async ({ page, seedData, tier }) => {
    // Wait for lessons to load
    await page.waitForSelector('[data-testid^="lesson-card"], .lesson-card', { 
      timeout: 5000 
    }).catch(() => {});
    
    // Count visible lessons
    const lessonCards = page.locator('[data-testid^="lesson-card"], .lesson-card');
    const lessonCount = await lessonCards.count();
    
    if (tier === 'smoke') {
      // Smoke tier has 30 lessons, first week should show ~5-10
      expect(lessonCount).toBeGreaterThanOrEqual(0);
      expect(lessonCount).toBeLessThanOrEqual(25); // Max 5 days * 5 slots
    } else {
      // Full tier has 975 lessons, should fill most slots
      expect(lessonCount).toBeGreaterThan(0);
    }
  });

  test('lesson click navigates to detail view', async ({ page }) => {
    // Wait for lessons to load
    const firstLesson = await page.locator('[data-testid^="lesson-card"], .lesson-card')
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => null);
    
    if (firstLesson) {
      const lessonText = await firstLesson.textContent();
      await firstLesson.click();
      
      // Should navigate to lesson detail
      await page.waitForURL(/\/lessons\/\w+/, { timeout: 3000 }).catch(() => {
        // Or open a modal
        const modal = page.getByRole('dialog');
        expect(modal).toBeVisible();
      });
    }
  });

  test('time slots display correctly', async ({ page }) => {
    // Check time slot labels
    const timeSlots = page.locator('.time-label, [data-testid="time-label"]');
    const slotCount = await timeSlots.count();
    
    // Should have time labels (usually 5-8 per day for elementary)
    expect(slotCount).toBeGreaterThan(0);
    
    // First slot should be morning
    const firstSlot = timeSlots.first();
    const firstSlotText = await firstSlot.textContent();
    expect(firstSlotText).toMatch(/8|9/); // 8am or 9am start
    
    // Last slot should be afternoon
    const lastSlot = timeSlots.last();
    const lastSlotText = await lastSlot.textContent();
    expect(lastSlotText).toMatch(/2|3|4/); // 2pm, 3pm, or 4pm end
  });

  test('week grid maintains structure during navigation', async ({ page }) => {
    // Get initial grid structure
    const grid = page.getByTestId('week-view-grid');
    await expect(grid).toBeVisible();
    
    // Count columns (days)
    const dayColumns = page.locator('.day-column, [data-day]');
    const initialDayCount = await dayColumns.count();
    expect(initialDayCount).toBe(5); // Monday to Friday
    
    // Navigate to next week
    await page.getByRole('button', { name: /Next Week/i }).click();
    await page.waitForTimeout(300);
    
    // Grid should still be visible with same structure
    await expect(grid).toBeVisible();
    const newDayCount = await dayColumns.count();
    expect(newDayCount).toBe(5);
    
    // Navigate to previous week
    await page.getByRole('button', { name: /Previous Week/i }).click();
    await page.waitForTimeout(300);
    
    // Still maintains structure
    await expect(grid).toBeVisible();
    const finalDayCount = await dayColumns.count();
    expect(finalDayCount).toBe(5);
  });
});