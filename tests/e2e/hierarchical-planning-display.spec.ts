/**
 * E2E Test Suite for Hierarchical Planning Display
 * Tests the complete LRP → Units → Lessons hierarchy with coverage tracking
 * Includes validation of the enhanced week view with color coding and unit titles
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Hierarchical Planning Display', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Login as Emily McIsaac
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'emily.mcisaac@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await page.waitForURL(/dashboard|week/);
  });

  test.describe('Long Range Plans Display', () => {
    test('should display all 6 protected LRPs', async () => {
      await page.goto('/planner/long-range');
      
      // All 6 subjects should be visible
      const subjects = [
        'Français (Immersion)',
        'Mathématiques',
        'Sciences de la nature',
        'Sciences humaines',
        'Arts visuels',
        'Formation personnelle et sociale'
      ];
      
      for (const subject of subjects) {
        const lrpCard = page.locator(`[data-testid="lrp-card-${subject}"]`);
        await expect(lrpCard).toBeVisible();
        
        // Should show protected status
        await expect(lrpCard.locator('[data-testid="protected-badge"]')).toBeVisible();
        await expect(lrpCard.locator('[data-testid="protected-badge"]')).toHaveText('PROTECTED');
      }
    });

    test('should show unit count for each LRP', async () => {
      await page.goto('/planner/long-range');
      
      // Expected unit counts per subject
      const expectedCounts = {
        'Français (Immersion)': 10,
        'Mathématiques': 10,
        'Sciences de la nature': 10,
        'Sciences humaines': 10,
        'Arts visuels': 5,
        'Formation personnelle et sociale': 5
      };
      
      for (const [subject, count] of Object.entries(expectedCounts)) {
        const lrpCard = page.locator(`[data-testid="lrp-card-${subject}"]`);
        const unitCount = await lrpCard.locator('[data-testid="unit-count"]').textContent();
        expect(unitCount).toBe(`${count} units`);
      }
    });

    test('should navigate to unit plans when LRP is clicked', async () => {
      await page.goto('/planner/long-range');
      
      // Click on Mathematics LRP
      await page.click('[data-testid="lrp-card-Mathématiques"]');
      
      // Should navigate to units view
      await page.waitForURL('/planner/units?lrp=Mathématiques');
      
      // Should show filtered units for Mathematics
      await expect(page.locator('[data-testid="units-header"]')).toContainText('Mathématiques Units');
      
      // Should show 10 unit cards
      const unitCards = page.locator('[data-testid^="unit-card-"]');
      await expect(unitCards).toHaveCount(10);
    });
  });

  test.describe('Unit Plans Display', () => {
    test('should show all 50 unit plans with strategic distribution', async () => {
      await page.goto('/planner/units');
      
      // Should show all 50 units
      const unitCards = page.locator('[data-testid^="unit-card-"]');
      await expect(unitCards).toHaveCount(50);
      
      // Check strategic Health/FPS redistribution
      const healthUnits = [
        { title: 'Mon corps et ma sécurité', hours: 16 },
        { title: 'Mes émotions et sentiments', hours: 15 },
        { title: 'Amitiés et relations positives', hours: 15 },
        { title: 'Nutrition et mode de vie sain', hours: 14 },
        { title: 'Grandir, changer et célébrer ensemble', hours: 13 }
      ];
      
      for (const unit of healthUnits) {
        const unitCard = page.locator(`[data-testid="unit-card"]:has-text("${unit.title}")`);
        await expect(unitCard).toBeVisible();
        await expect(unitCard.locator('[data-testid="unit-hours"]')).toContainText(`${unit.hours} hours`);
      }
    });

    test('should show lesson count for each unit', async () => {
      await page.goto('/planner/units');
      
      // Each unit should show its lesson count
      const firstUnit = page.locator('[data-testid^="unit-card-"]').first();
      await expect(firstUnit.locator('[data-testid="lesson-count"]')).toBeVisible();
      
      const lessonCount = await firstUnit.locator('[data-testid="lesson-count"]').textContent();
      expect(lessonCount).toMatch(/\d+ lessons/);
    });

    test('should navigate to lessons when unit is clicked', async () => {
      await page.goto('/planner/units');
      
      // Click on first unit
      const firstUnit = page.locator('[data-testid^="unit-card-"]').first();
      const unitTitle = await firstUnit.locator('[data-testid="unit-title"]').textContent();
      await firstUnit.click();
      
      // Should navigate to lessons view
      await page.waitForURL(/\/planner\/lessons/);
      
      // Should show filtered lessons for that unit
      await expect(page.locator('[data-testid="lessons-header"]')).toContainText(unitTitle || '');
    });

    test('should show curriculum expectation coverage per unit', async () => {
      await page.goto('/planner/units');
      
      // Each unit should show coverage indicator
      const firstUnit = page.locator('[data-testid^="unit-card-"]').first();
      const coverage = firstUnit.locator('[data-testid="expectation-coverage"]');
      
      await expect(coverage).toBeVisible();
      await expect(coverage).toContainText(/\d+\/\d+ expectations/);
      
      // Should have visual indicator (progress bar)
      const progressBar = firstUnit.locator('[data-testid="coverage-progress"]');
      await expect(progressBar).toBeVisible();
    });
  });

  test.describe('Lessons Display with Hierarchical Context', () => {
    test('should show lessons with unit and LRP context', async () => {
      await page.goto('/planner/lessons');
      
      // Each lesson should show its hierarchy
      const firstLesson = page.locator('[data-testid^="lesson-card-"]').first();
      
      // Should show unit title
      await expect(firstLesson.locator('[data-testid="lesson-unit"]')).toBeVisible();
      
      // Should show subject from LRP
      await expect(firstLesson.locator('[data-testid="lesson-subject"]')).toBeVisible();
      
      // Should show lesson number within unit
      await expect(firstLesson.locator('[data-testid="lesson-number"]')).toBeVisible();
      const lessonNumber = await firstLesson.locator('[data-testid="lesson-number"]').textContent();
      expect(lessonNumber).toMatch(/#\d+/);
    });

    test('should maintain 970 total lessons across hierarchy', async () => {
      // This would be a data integrity test
      const response = await page.request.get('/api/planning/stats');
      const stats = await response.json();
      
      expect(stats.totalLessons).toBe(970);
      expect(stats.distribution).toEqual({
        'Français (Immersion)': 195,
        'Mathématiques': 195,
        'Sciences de la nature': 195,
        'Arts visuels': 195,
        'Sciences humaines': 97,
        'Formation personnelle et sociale': 98
      });
    });
  });

  test.describe('Enhanced Week View with Color Coding', () => {
    test('should display lessons with subject-based color coding', async () => {
      await page.goto('/planner/week');
      
      // Wait for lessons to load
      await page.waitForSelector('[data-testid="lesson-card"]');
      
      // Color mapping
      const subjectColors = {
        'Français (Immersion)': 'bg-blue-100',
        'Mathématiques': 'bg-green-100',
        'Sciences de la nature': 'bg-purple-100',
        'Arts visuels': 'bg-orange-100',
        'Sciences humaines': 'bg-cyan-100',
        'Formation personnelle et sociale': 'bg-pink-100'
      };
      
      // Check that lessons have appropriate colors
      for (const [subject, colorClass] of Object.entries(subjectColors)) {
        const subjectLesson = page.locator(`[data-testid="lesson-card"]:has-text("${subject}")`).first();
        const lessonExists = await subjectLesson.count() > 0;
        
        if (lessonExists) {
          await expect(subjectLesson).toHaveClass(new RegExp(colorClass));
        }
      }
    });

    test('should display unit titles on lesson cards', async () => {
      await page.goto('/planner/week');
      
      // Each lesson card should show unit title
      const lessonCards = page.locator('[data-testid="lesson-card"]');
      const count = await lessonCards.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const card = lessonCards.nth(i);
        const unitTitle = card.locator('.text-gray-500.italic');
        
        // Unit title should be visible
        await expect(unitTitle).toBeVisible();
        
        // Should contain actual unit name
        const title = await unitTitle.textContent();
        expect(title?.length).toBeGreaterThan(0);
      }
    });

    test('should display lesson numbers within units', async () => {
      await page.goto('/planner/week');
      
      const lessonCards = page.locator('[data-testid="lesson-card"]');
      const firstCard = lessonCards.first();
      
      // Should show lesson number
      const lessonNumber = await firstCard.locator('.text-xs.text-gray-500:has-text("#")').textContent();
      expect(lessonNumber).toMatch(/#\d+/);
    });

    test('should display curriculum expectations on cards', async () => {
      await page.goto('/planner/week');
      
      // Find a lesson with expectations
      const cardWithExpectations = page.locator('[data-testid="lesson-card"]').filter({
        has: page.locator('.bg-gray-100.text-gray-600')
      }).first();
      
      if (await cardWithExpectations.count() > 0) {
        // Should show expectation codes
        const expectationChips = cardWithExpectations.locator('.bg-gray-100.text-gray-600');
        const chipCount = await expectationChips.count();
        
        expect(chipCount).toBeGreaterThan(0);
        
        // Each chip should have a code
        const firstChip = expectationChips.first();
        const chipText = await firstChip.textContent();
        expect(chipText).toMatch(/[A-Z]+\.\d+/);
      }
    });

    test('should show warning for lessons without subjects', async () => {
      await page.goto('/planner/week');
      
      // Check if any lessons are missing subjects
      const warningIndicator = page.locator('.text-red-500:has-text("⚠️ No subject")');
      
      // If found, verify the warning is displayed correctly
      if (await warningIndicator.count() > 0) {
        await expect(warningIndicator.first()).toBeVisible();
        await expect(warningIndicator.first()).toHaveText('⚠️ No subject');
      }
    });

    test('should not display duration since all lessons are 45 minutes', async () => {
      await page.goto('/planner/week');
      
      const lessonCards = page.locator('[data-testid="lesson-card"]');
      const firstCard = lessonCards.first();
      
      // Should not contain duration text
      const cardText = await firstCard.textContent();
      expect(cardText).not.toContain('45 min');
      expect(cardText).not.toContain('duration');
    });

    test('should display truncated descriptions', async () => {
      await page.goto('/planner/week');
      
      // Find a lesson with description
      const cardWithDescription = page.locator('[data-testid="lesson-card"]').filter({
        has: page.locator('.line-clamp-2')
      }).first();
      
      if (await cardWithDescription.count() > 0) {
        const description = cardWithDescription.locator('.line-clamp-2');
        await expect(description).toBeVisible();
        
        // Should be truncated (max 100 chars + ...)
        const descText = await description.textContent();
        if (descText && descText.length > 100) {
          expect(descText).toContain('...');
        }
      }
    });
  });

  test.describe('Navigation Through Hierarchy', () => {
    test('should support breadcrumb navigation', async () => {
      // Start at LRP level
      await page.goto('/planner/long-range');
      
      // Click into Mathematics
      await page.click('[data-testid="lrp-card-Mathématiques"]');
      await page.waitForURL('/planner/units?lrp=Mathématiques');
      
      // Breadcrumb should show: Long Range Plans > Mathématiques
      const breadcrumb = page.locator('[data-testid="breadcrumb"]');
      await expect(breadcrumb).toContainText('Long Range Plans');
      await expect(breadcrumb).toContainText('Mathématiques');
      
      // Click into a unit
      const firstUnit = page.locator('[data-testid^="unit-card-"]').first();
      const unitTitle = await firstUnit.locator('[data-testid="unit-title"]').textContent();
      await firstUnit.click();
      
      // Breadcrumb should show: Long Range Plans > Mathématiques > [Unit Name]
      await expect(breadcrumb).toContainText('Long Range Plans');
      await expect(breadcrumb).toContainText('Mathématiques');
      await expect(breadcrumb).toContainText(unitTitle || '');
      
      // Should be able to navigate back via breadcrumb
      await breadcrumb.locator('a:has-text("Mathématiques")').click();
      await page.waitForURL('/planner/units?lrp=Mathématiques');
    });

    test('should maintain context when drilling down', async () => {
      await page.goto('/planner/long-range');
      
      // Select Sciences de la nature
      await page.click('[data-testid="lrp-card-Sciences de la nature"]');
      
      // Should only show Science units
      const unitCards = page.locator('[data-testid^="unit-card-"]');
      const count = await unitCards.count();
      
      for (let i = 0; i < count; i++) {
        const card = unitCards.nth(i);
        const subject = await card.locator('[data-testid="unit-subject"]').textContent();
        expect(subject).toBe('Sciences de la nature');
      }
    });
  });

  test.describe('Coverage Tracking Through Hierarchy', () => {
    test('should show coverage at LRP level', async () => {
      await page.goto('/planner/long-range');
      
      // Each LRP should show overall coverage
      const frenchLRP = page.locator('[data-testid="lrp-card-Français (Immersion)"]');
      const coverage = frenchLRP.locator('[data-testid="lrp-coverage"]');
      
      await expect(coverage).toBeVisible();
      await expect(coverage).toContainText(/\d+%/);
      
      // Should have progress indicator
      const progressBar = frenchLRP.locator('[data-testid="coverage-bar"]');
      await expect(progressBar).toBeVisible();
    });

    test('should aggregate coverage from lessons to units to LRPs', async () => {
      // This tests the data flow
      const response = await page.request.get('/api/planning/coverage-hierarchy');
      const coverage = await response.json();
      
      // Should have hierarchical structure
      expect(coverage).toHaveProperty('lrps');
      expect(coverage.lrps).toHaveLength(6);
      
      // Each LRP should aggregate from its units
      const mathLRP = coverage.lrps.find((lrp: any) => lrp.subject === 'Mathématiques');
      expect(mathLRP).toHaveProperty('totalExpectations');
      expect(mathLRP).toHaveProperty('coveredExpectations');
      expect(mathLRP).toHaveProperty('units');
      
      // Coverage should be sum of unit coverages
      const unitCoverageSum = mathLRP.units.reduce((sum: number, unit: any) => 
        sum + unit.coveredExpectations, 0);
      expect(mathLRP.coveredExpectations).toBe(unitCoverageSum);
    });
  });

  test.describe('Performance with Full Hierarchy', () => {
    test('should load hierarchy views quickly', async () => {
      // LRP view
      const lrpStart = Date.now();
      await page.goto('/planner/long-range');
      await page.waitForSelector('[data-testid^="lrp-card-"]');
      const lrpTime = Date.now() - lrpStart;
      expect(lrpTime).toBeLessThan(2000);
      
      // Units view
      const unitsStart = Date.now();
      await page.goto('/planner/units');
      await page.waitForSelector('[data-testid^="unit-card-"]');
      const unitsTime = Date.now() - unitsStart;
      expect(unitsTime).toBeLessThan(2000);
      
      // Week view with enhanced display
      const weekStart = Date.now();
      await page.goto('/planner/week');
      await page.waitForSelector('[data-testid="lesson-card"]');
      const weekTime = Date.now() - weekStart;
      expect(weekTime).toBeLessThan(2000);
    });

    test('should handle filtering efficiently', async () => {
      await page.goto('/planner/units');
      
      // Filter by subject
      await page.selectOption('[data-testid="subject-filter"]', 'Mathématiques');
      
      // Should update quickly
      await page.waitForTimeout(300);
      
      // Should only show Math units
      const unitCards = page.locator('[data-testid^="unit-card-"]');
      await expect(unitCards).toHaveCount(10);
    });
  });

  test.describe('Mobile Responsiveness for Hierarchy', () => {
    test('should display hierarchy on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // LRP cards should stack
      await page.goto('/planner/long-range');
      const lrpCards = page.locator('[data-testid^="lrp-card-"]');
      
      const firstCard = await lrpCards.first().boundingBox();
      const secondCard = await lrpCards.nth(1).boundingBox();
      
      // Should stack vertically
      expect(secondCard?.y).toBeGreaterThan((firstCard?.y || 0) + (firstCard?.height || 0));
      
      // Week view should remain functional
      await page.goto('/planner/week');
      await expect(page.locator('[data-testid="lesson-card"]').first()).toBeVisible();
    });

    test('should maintain color coding on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/planner/week');
      
      // Colors should still be visible
      const mathLesson = page.locator('[data-testid="lesson-card"]:has-text("Mathématiques")').first();
      if (await mathLesson.count() > 0) {
        await expect(mathLesson).toHaveClass(/bg-green-100/);
      }
    });
  });
});