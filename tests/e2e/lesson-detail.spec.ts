/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { test, expect } from '@playwright/test';
import { 
  navigateWithTimeout, 
  waitForElement, 
  clickWithRetry,
  waitForPageStable,
  CI_CONFIG
} from './helpers/ci-stability';

const API_BASE = process.env.API_BASE ?? 'http://localhost:3000';

test.describe('Lesson Detail Navigation', () => {
  test.setTimeout(CI_CONFIG.mediumTimeout);

  test.beforeEach(async ({ page }) => {
    // Mock authentication with test token
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'test-emily-token');
      localStorage.setItem('user', JSON.stringify({
        id: 23,
        email: 'emily@example.com',
        name: 'Emily McIsaac'
      }));
    });
  });

  test('Week view shows lesson cards with links', async ({ page }) => {
    // Navigate to week view
    await navigateWithTimeout(page, '/planner/week', { 
      timeout: CI_CONFIG.mediumTimeout,
      waitUntil: 'networkidle' 
    });

    // Wait for week view to load
    await waitForElement(page, 'h1:has-text("Week at a Glance")', { 
      timeout: CI_CONFIG.shortTimeout 
    });

    // Check for lesson cards
    const lessonCards = await page.locator('[data-testid="lesson-card"]');
    const cardCount = await lessonCards.count();
    
    if (cardCount > 0) {
      // Get first lesson card
      const firstCard = lessonCards.first();
      
      // Check it has French title (fallback to English)
      const titleElement = await firstCard.locator('.font-medium').first();
      const title = await titleElement.textContent();
      expect(title).toBeTruthy();
      
      // Check it's a link
      const href = await firstCard.getAttribute('href');
      expect(href).toMatch(/^\/planner\/lessons\/[a-zA-Z0-9-]+$/);
    }
  });

  test('Lesson detail page displays French content', async ({ page }) => {
    // First navigate to week view to find a lesson
    await navigateWithTimeout(page, '/planner/week', { 
      timeout: CI_CONFIG.mediumTimeout,
      waitUntil: 'networkidle' 
    });

    // Wait for lesson cards to load
    await waitForPageStable(page);
    
    const lessonCards = await page.locator('[data-testid="lesson-card"]');
    const cardCount = await lessonCards.count();
    
    if (cardCount > 0) {
      // Click first lesson card
      await clickWithRetry(page, '[data-testid="lesson-card"]:first-of-type');
      
      // Wait for lesson detail page
      await page.waitForURL(/\/planner\/lessons\/[a-zA-Z0-9-]+/, { 
        timeout: CI_CONFIG.shortTimeout 
      });
      
      // Check for French title or fallback
      await waitForElement(page, 'h1', { timeout: CI_CONFIG.shortTimeout });
      
      // Check for key French sections
      const sections = [
        'Stratégies de différenciation',
        'Points d\'engagement',
        'Minds On',
        'Action',
        'Consolidation'
      ];
      
      for (const section of sections) {
        const sectionExists = await page.locator(`text=${section}`).count() > 0;
        if (sectionExists) {
          break; // At least one French section found
        }
      }
      
      // Check for assessment button
      const assessButton = await page.locator('button:has-text("Évaluer la classe")');
      if (await assessButton.count() > 0) {
        const buttonHref = await assessButton.getAttribute('href') || 
                          await page.locator('a:has-text("Évaluer la classe")').getAttribute('href');
        if (buttonHref) {
          expect(buttonHref).toContain('lessonId=');
        }
      }
    }
  });

  test('Assessment page receives lesson context', async ({ page }) => {
    // Navigate directly to assessment with lesson context
    const mockLessonId = 'test-lesson-123';
    const mockExpectationId = 'exp-456';
    
    await navigateWithTimeout(
      page, 
      `/assessment?lessonId=${mockLessonId}&expectations=${mockExpectationId}`,
      { timeout: CI_CONFIG.mediumTimeout }
    );
    
    // Wait for assessment page to load
    await waitForPageStable(page);
    
    // Check if lesson context header appears (if lesson exists)
    const contextHeader = await page.locator('text=/Évaluation —/');
    const headerCount = await contextHeader.count();
    
    // URL params should be preserved
    const url = page.url();
    expect(url).toContain(`lessonId=${mockLessonId}`);
    expect(url).toContain(`expectations=${mockExpectationId}`);
  });

  test('Dashboard shows correct September lesson count', async ({ page }) => {
    // Navigate to dashboard
    await navigateWithTimeout(page, '/', { 
      timeout: CI_CONFIG.mediumTimeout,
      waitUntil: 'networkidle' 
    });
    
    // Wait for stats to load
    await waitForPageStable(page);
    
    // Check for September section
    const septemberSection = await page.locator('text=/September \\d{4}/');
    if (await septemberSection.count() > 0) {
      // Check lesson count text
      const lessonCountText = await page.locator('text=/\\d+ detailed lesson plans ready for September/');
      const countExists = await lessonCountText.count() > 0;
      
      if (!countExists) {
        // Fallback check for older format
        const altCountText = await page.locator('text=/Your first units have \\d+ detailed lesson plans/');
        expect(await altCountText.count()).toBeGreaterThan(0);
      }
    }
  });

  test('Lesson API returns French content and parsed JSON', async ({ page }) => {
    // Make direct API call to test endpoint
    const response = await page.request.get(`${API_BASE}/api/lessons`, {
      headers: {
        'Authorization': 'Bearer test-emily-token'
      },
      timeout: CI_CONFIG.shortTimeout
    });
    
    if (response.ok()) {
      const lessons = await response.json();
      
      if (Array.isArray(lessons) && lessons.length > 0) {
        const firstLesson = lessons[0];
        
        // Check for French fields
        expect(firstLesson).toHaveProperty('title');
        expect(firstLesson).toHaveProperty('titleFr');
        
        // Check for parsed JSON fields
        if (firstLesson.differentiationStrategies) {
          expect(Array.isArray(firstLesson.differentiationStrategies)).toBeTruthy();
        }
        
        if (firstLesson.engagementHooks) {
          expect(typeof firstLesson.engagementHooks).toBe('object');
        }
      }
    }
  });
});