import { test, expect } from '@playwright/test';
import { S } from '../config/selectors';
import { failOn5xx } from '../config/network';

test.describe('Planning cascade overview', () => {
  test.beforeEach(async ({ page }) => { await failOn5xx(page); });

  test('Planning cascade shows LRP → Unit → Lesson hierarchy', async ({ page }) => {
    // Navigate to planning cascade
    await page.goto('/planning-overview');
    
    // Wait for cascade page to load
    await page.waitForSelector(S.cascade.page, { timeout: 10000 });

    // Check for cascade nodes
    const nodes = page.locator(S.cascade.node);
    const nodeCount = await nodes.count();
    
    // Should have at least some nodes (LRPs, Units, or header)
    expect(nodeCount).toBeGreaterThan(0);

    // Look for key terms in the hierarchy
    const pageText = await page.textContent('body');
    
    // Check for LRP indicators
    const hasLRPContent = pageText?.includes('Long Range') || 
                         pageText?.includes('LRP') ||
                         pageText?.includes('année');
    
    // Check for unit indicators  
    const hasUnitContent = pageText?.includes('Unit') ||
                          pageText?.includes('Unité') ||
                          pageText?.includes('heures');
    
    // Check for lesson indicators
    const hasLessonContent = pageText?.includes('lesson') ||
                            pageText?.includes('leçon') ||
                            pageText?.includes('minutes');

    // At least 2 of 3 hierarchy levels should be mentioned
    const hierarchyLevels = [hasLRPContent, hasUnitContent, hasLessonContent].filter(Boolean).length;
    expect(hierarchyLevels).toBeGreaterThanOrEqual(2);

    // Check for subject mentions (Emily teaches 6 subjects)
    const subjects = ['Français', 'Mathématiques', 'Sciences', 'Arts', 'Études sociales', 'Santé'];
    const mentionedSubjects = subjects.filter(s => pageText?.includes(s));
    expect(mentionedSubjects.length).toBeGreaterThan(0);
  });
});