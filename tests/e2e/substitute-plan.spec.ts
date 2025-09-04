/**
 * E2E Test Suite for One-Click Substitute Day Plan
 * Issue #307: One-Click Substitute Day Plan (PDF) with Class Routines/Notes
 * 
 * Critical Feature: Must work at 6 AM on mobile when teacher is sick
 */

import { test, expect, Page } from '@playwright/test';
import { readFileSync } from 'fs';

test.describe('One-Click Substitute Day Plan', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Login as Emily
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'emily.mcisaac@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/dashboard|week/);
  });

  test.describe('Critical: Emergency Sick Day Scenario', () => {
    test('should generate sub plan at 6 AM on mobile', async () => {
      // Simulate mobile device (iPhone)
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to today view
      await page.goto('/today');
      
      // Sub plan button should be prominently visible
      await expect(page.locator('[data-testid="sub-plan-button"]')).toBeVisible();
      
      // Should be reachable within one tap
      const buttonBox = await page.locator('[data-testid="sub-plan-button"]').boundingBox();
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44); // Touch target
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
      
      // One click to generate
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="sub-plan-button"]');
      
      // Should generate PDF immediately
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('substitute-plan');
      expect(download.suggestedFilename()).toContain('.pdf');
      
      // Verify it's a valid PDF
      const path = await download.path();
      if (path) {
        const content = readFileSync(path);
        expect(content.toString('utf-8', 0, 4)).toBe('%PDF'); // PDF magic number
      }
    });

    test('should work without network connection', async () => {
      // Load page with network
      await page.goto('/today');
      
      // Go offline
      await page.context().setOffline(true);
      
      // Should still generate plan from cached data
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="sub-plan-button"]');
      
      const download = await downloadPromise;
      expect(download).toBeTruthy();
    });

    test('should complete generation in one click', async () => {
      await page.goto('/today');
      
      let clickCount = 0;
      page.on('click', () => clickCount++);
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      
      // Click sub plan button
      await page.click('[data-testid="sub-plan-button"]');
      
      // Wait for download
      await downloadPromise;
      
      // Should only require one click
      expect(clickCount).toBe(1);
    });
  });

  test.describe('Sub Plan Content', () => {
    test('should include complete daily schedule', async () => {
      await page.goto('/today');
      
      // Generate preview instead of download for content testing
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      // Preview should open
      await expect(page.locator('[data-testid="sub-plan-preview"]')).toBeVisible();
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      
      // Should include timetable
      await expect(content.locator('[data-testid="timetable"]')).toBeVisible();
      
      // Should show all scheduled lessons
      const lessons = content.locator('[data-testid="lesson-entry"]');
      await expect(lessons).toHaveCount.greaterThan(0);
      
      // Each lesson should have time, subject, and brief description
      const firstLesson = lessons.first();
      await expect(firstLesson.locator('[data-testid="lesson-time"]')).toBeVisible();
      await expect(firstLesson.locator('[data-testid="lesson-subject"]')).toBeVisible();
      await expect(firstLesson.locator('[data-testid="lesson-summary"]')).toBeVisible();
    });

    test('should include lesson materials and resources', async () => {
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      const lessons = content.locator('[data-testid="lesson-entry"]');
      
      // Each lesson should list materials
      const firstLesson = lessons.first();
      await expect(firstLesson.locator('[data-testid="lesson-materials"]')).toBeVisible();
      
      // Materials should be clearly formatted
      const materials = await firstLesson.locator('[data-testid="lesson-materials"]').textContent();
      expect(materials).toContain('Materials:');
      expect(materials?.length).toBeGreaterThan(10);
    });

    test('should show French titles for French lessons', async () => {
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      
      // Find French lesson
      const frenchLesson = content.locator('[data-testid="lesson-entry"][data-subject="Français"]');
      
      if (await frenchLesson.count() > 0) {
        const title = await frenchLesson.first().locator('[data-testid="lesson-title"]').textContent();
        
        // Should be in French
        expect(title).toMatch(/[àâäæçéèêëïîôùûüÿœ]/i); // Contains French characters
      }
    });
  });

  test.describe('Substitute Information Settings', () => {
    test('should persist substitute info for reuse', async () => {
      // Navigate to settings
      await page.goto('/settings/substitute');
      
      // Fill substitute information
      await page.fill('[data-testid="class-routines"]', 'Morning circle at 8:30');
      await page.fill('[data-testid="attendance-location"]', 'Office mailbox');
      await page.fill('[data-testid="dismissal-procedures"]', 'Bus students at 2:45');
      await page.fill('[data-testid="emergency-contacts"]', 'Office: 902-555-0100');
      await page.fill('[data-testid="student-notes"]', 'Emma - peanut allergy');
      
      // Save
      await page.click('[data-testid="save-sub-info"]');
      await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
      
      // Generate sub plan
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      // Should include saved info
      const content = page.locator('[data-testid="sub-plan-content"]');
      await expect(content).toContainText('Morning circle at 8:30');
      await expect(content).toContainText('Office mailbox');
      await expect(content).toContainText('Bus students at 2:45');
      await expect(content).toContainText('Emma - peanut allergy');
    });

    test('should include safety and medical information', async () => {
      await page.goto('/settings/substitute');
      
      // Add critical safety info
      await page.fill('[data-testid="medical-alerts"]', 'EpiPen in top drawer for Emma');
      await page.fill('[data-testid="safety-procedures"]', 'Fire drill - Line up at door');
      
      await page.click('[data-testid="save-sub-info"]');
      
      // Generate plan
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      // Safety info should be prominent
      const content = page.locator('[data-testid="sub-plan-content"]');
      const safetySection = content.locator('[data-testid="safety-section"]');
      
      await expect(safetySection).toBeVisible();
      await expect(safetySection).toHaveClass(/highlighted|important/);
      await expect(safetySection).toContainText('EpiPen');
      await expect(safetySection).toContainText('Fire drill');
    });

    test('should update future PDFs when info changes', async () => {
      await page.goto('/settings/substitute');
      
      // Update phone number
      await page.fill('[data-testid="emergency-contacts"]', 'Office: 902-555-9999');
      await page.click('[data-testid="save-sub-info"]');
      
      // Generate new plan
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      // Should have updated info
      const content = page.locator('[data-testid="sub-plan-content"]');
      await expect(content).toContainText('902-555-9999');
      await expect(content).not.toContainText('902-555-0100');
    });
  });

  test.describe('PDF Generation and Format', () => {
    test('should generate well-formatted PDF', async () => {
      await page.goto('/today');
      
      // Generate PDF
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="sub-plan-button"]');
      const download = await downloadPromise;
      
      // Verify filename format
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/substitute-plan-\d{4}-\d{2}-\d{2}\.pdf/);
      
      // File should be reasonable size (not empty, not huge)
      const path = await download.path();
      if (path) {
        const stats = require('fs').statSync(path);
        expect(stats.size).toBeGreaterThan(1024); // At least 1KB
        expect(stats.size).toBeLessThan(10485760); // Less than 10MB
      }
    });

    test('should be printer-friendly', async () => {
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      // Check print styles
      await page.click('[data-testid="print-preview"]');
      
      // Should have appropriate formatting
      const printStyles = await page.evaluate(() => {
        const styles = document.querySelector('[media="print"]');
        return styles?.textContent || '';
      });
      
      expect(printStyles).toContain('page-break');
      expect(printStyles).toContain('@page');
      
      // Should fit on standard paper sizes
      const content = page.locator('[data-testid="sub-plan-content"]');
      const box = await content.boundingBox();
      
      // A4/Letter width in pixels at 96dpi
      expect(box?.width).toBeLessThanOrEqual(816);
    });

    test('should include header and footer on each page', async () => {
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      
      // Header should include date and teacher name
      const header = content.locator('[data-testid="pdf-header"]');
      await expect(header).toContainText('Emily McIsaac');
      await expect(header).toContainText(new Date().toLocaleDateString());
      
      // Footer should include page numbers
      const footer = content.locator('[data-testid="pdf-footer"]');
      await expect(footer).toContainText('Page');
    });
  });

  test.describe('Quick Access from Different Views', () => {
    test('should be accessible from Today view', async () => {
      await page.goto('/today');
      await expect(page.locator('[data-testid="sub-plan-button"]')).toBeVisible();
    });

    test('should be accessible from Week view', async () => {
      await page.goto('/week');
      
      // Should have sub plan button in toolbar
      await expect(page.locator('[data-testid="sub-plan-button"]')).toBeVisible();
      
      // Also in each day column
      const dayColumns = page.locator('[data-testid^="day-column-"]');
      const mondayColumn = dayColumns.first();
      
      await mondayColumn.hover();
      await expect(mondayColumn.locator('[data-testid="day-sub-plan-button"]')).toBeVisible();
    });

    test('should allow date selection with default to today', async () => {
      await page.goto('/week');
      
      // Click sub plan button
      await page.click('[data-testid="sub-plan-button"]');
      
      // Should show date picker with today selected
      await expect(page.locator('[data-testid="sub-plan-date-picker"]')).toBeVisible();
      
      const selectedDate = await page.locator('[data-testid="selected-date"]').getAttribute('value');
      const today = new Date().toISOString().split('T')[0];
      expect(selectedDate).toBe(today);
      
      // Can change date
      await page.click('[data-testid="tomorrow-button"]');
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const newSelectedDate = await page.locator('[data-testid="selected-date"]').getAttribute('value');
      expect(newSelectedDate).toBe(tomorrow);
    });

    test('should generate plan for specific day from week view', async () => {
      await page.goto('/week');
      
      // Click Wednesday's sub plan button
      const wednesdayColumn = page.locator('[data-testid="day-column-wednesday"]');
      await wednesdayColumn.hover();
      await wednesdayColumn.locator('[data-testid="day-sub-plan-button"]').click();
      
      // Should generate for Wednesday
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      await expect(content.locator('[data-testid="plan-date"]')).toContainText('Wednesday');
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should generate plan within 3 seconds', async () => {
      await page.goto('/today');
      
      const startTime = Date.now();
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="sub-plan-button"]');
      await downloadPromise;
      
      const generationTime = Date.now() - startTime;
      expect(generationTime).toBeLessThan(3000);
    });

    test('should handle missing lessons gracefully', async () => {
      // Navigate to a day with no lessons
      await page.goto('/today?date=2024-01-06'); // Saturday
      
      // Should still generate plan
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      await expect(content).toContainText('No lessons scheduled');
      
      // Should still include substitute info
      await expect(content.locator('[data-testid="sub-info-section"]')).toBeVisible();
    });

    test('should handle partial data gracefully', async () => {
      await page.goto('/today');
      
      // Even with missing materials or details
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      const lessons = content.locator('[data-testid="lesson-entry"]');
      
      // Should show placeholder for missing data
      for (let i = 0; i < await lessons.count(); i++) {
        const lesson = lessons.nth(i);
        const materials = await lesson.locator('[data-testid="lesson-materials"]').textContent();
        
        if (!materials || materials === '') {
          await expect(lesson).toContainText('No materials specified');
        }
      }
    });

    test('should work across different timezones', async () => {
      // Set timezone to different location
      await page.evaluate(() => {
        // Mock timezone
        Date.prototype.getTimezoneOffset = () => -480; // UTC+8
      });
      
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      // Times should display correctly
      const content = page.locator('[data-testid="sub-plan-content"]');
      const firstLessonTime = await content.locator('[data-testid="lesson-time"]').first().textContent();
      
      // Should be formatted time
      expect(firstLessonTime).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard accessible', async () => {
      await page.goto('/today');
      
      // Tab to sub plan button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should focus on button
      await expect(page.locator('[data-testid="sub-plan-button"]:focus')).toBeVisible();
      
      // Enter to activate
      const downloadPromise = page.waitForEvent('download');
      await page.keyboard.press('Enter');
      await downloadPromise;
    });

    test('should have appropriate ARIA labels', async () => {
      await page.goto('/today');
      
      const button = page.locator('[data-testid="sub-plan-button"]');
      
      await expect(button).toHaveAttribute('aria-label', /Generate substitute plan/i);
      await expect(button).toHaveAttribute('role', 'button');
    });

    test('should work with screen readers', async () => {
      await page.goto('/today');
      
      // Check for screen reader announcements
      const liveRegion = page.locator('[aria-live="polite"]');
      
      await page.click('[data-testid="sub-plan-button"]');
      
      // Should announce generation
      await expect(liveRegion).toContainText(/Generating substitute plan/i);
      
      // Should announce completion
      await expect(liveRegion).toContainText(/Plan generated successfully/i);
    });
  });

  test.describe('Integration with Other Features', () => {
    test('should include lesson completion status if available', async () => {
      // Mark some lessons as complete
      await page.goto('/today');
      await page.locator('[data-testid="completion-checkbox"]').first().click();
      
      // Generate sub plan
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      
      // Should indicate completed lessons
      const firstLesson = content.locator('[data-testid="lesson-entry"]').first();
      await expect(firstLesson).toContainText('Already completed');
    });

    test('should include recent assessment notes', async () => {
      await page.goto('/today');
      await page.click('[data-testid="sub-plan-preview-button"]');
      
      const content = page.locator('[data-testid="sub-plan-content"]');
      
      // Should have assessment section if data exists
      const assessmentSection = content.locator('[data-testid="recent-assessments"]');
      
      if (await assessmentSection.isVisible()) {
        await expect(assessmentSection).toContainText(/Assessment Notes/i);
      }
    });
  });
});