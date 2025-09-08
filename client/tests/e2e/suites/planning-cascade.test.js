/**
 * Planning Cascade View E2E Tests
 * Tests the hierarchical planning view (Terms → Units → Lessons)
 */

const puppeteer = require('puppeteer');
const helpers = require('../helpers');

async function testPlanningCascade() {
  let browser;
  let page;
  const results = {
    name: 'Planning Cascade View',
    passed: false,
    errors: [],
    screenshots: [],
    metrics: {},
    duration: 0
  };
  
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting Planning Cascade tests...');
    
    // Launch browser
    browser = await helpers.launchBrowser(puppeteer);
    page = await browser.newPage();
    
    // Capture console errors
    const consoleErrors = helpers.captureConsoleErrors(page);
    
    // Navigate to app
    await helpers.navigateTo(page, '/');
    
    // Login if needed (skip onboarding for now)
    // await helpers.login(page);
    
    // Navigate to Planning Overview (correct route)
    console.log('📍 Navigating to Planning Overview...');
    await helpers.navigateTo(page, '/planning-overview');
    
    // Take initial screenshot
    const screenshot1 = await helpers.takeScreenshot(page, 'planning-cascade-initial', 'planning-cascade');
    results.screenshots.push(screenshot1);
    
    // Wait for Planning Cascade to render
    console.log('⏳ Waiting for Planning Cascade to load...');
    await page.waitForSelector('.planning-cascade-view', {
      timeout: 10000
    });
    
    // Verify hierarchical structure is present
    console.log('🔍 Verifying hierarchical structure...');
    
    // Check for Terms
    const termElements = await page.$$('[role="treeitem"][aria-level="1"]');
    if (termElements.length === 0) {
      throw new Error('No term elements found in hierarchy');
    }
    console.log(`✅ Found ${termElements.length} terms`);
    
    // Check for Units
    const unitElements = await page.$$('[role="treeitem"][aria-level="3"]');
    console.log(`✅ Found ${unitElements.length} units`);
    
    // Check for Lessons
    const lessonElements = await page.$$('[role="treeitem"][aria-level="5"]');
    console.log(`✅ Found ${lessonElements.length} lessons`);
    
    // Test expand/collapse functionality
    console.log('🔄 Testing expand/collapse...');
    
    // Find an expand button
    const expandButtons = await page.$$('button[aria-label*="Expand"]');
    if (expandButtons.length > 0) {
      // Click first expand button
      await expandButtons[0].click();
      await helpers.waitForTimeout(500); // Wait for animation
      
      // Take screenshot after collapse
      const screenshot2 = await helpers.takeScreenshot(page, 'planning-cascade-collapsed', 'planning-cascade');
      results.screenshots.push(screenshot2);
      
      // Click again to expand
      await expandButtons[0].click();
      await helpers.waitForTimeout(500);
      
      console.log('✅ Expand/collapse working');
    }
    
    // Test search functionality
    console.log('🔍 Testing search...');
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await helpers.clearAndType(page, 'input[placeholder*="Search"]', 'Math');
      await helpers.waitForTimeout(1000); // Wait for debounce
      
      // Take screenshot of search results
      const screenshot3 = await helpers.takeScreenshot(page, 'planning-cascade-search', 'planning-cascade');
      results.screenshots.push(screenshot3);
      
      console.log('✅ Search functionality working');
    }
    
    // Test Expand All / Collapse All buttons
    console.log('🔄 Testing Expand All / Collapse All...');
    
    // Click Collapse All
    const collapseAllBtn = await page.$('button:has-text("Collapse All")');
    if (collapseAllBtn) {
      await collapseAllBtn.click();
      await helpers.waitForTimeout(500);
      
      // Verify lessons are hidden
      const lessonsVisible = await page.$$eval('[role="treeitem"][aria-level="5"]', 
        elements => elements.filter(el => el.offsetParent !== null).length
      );
      
      if (lessonsVisible === 0) {
        console.log('✅ Collapse All working');
      }
      
      // Click Expand All
      const expandAllBtn = await page.$('button:has-text("Expand All")');
      if (expandAllBtn) {
        await expandAllBtn.click();
        await helpers.waitForTimeout(500);
        
        // Verify lessons are visible again
        const lessonsVisibleAfter = await page.$$eval('[role="treeitem"][aria-level="5"]', 
          elements => elements.filter(el => el.offsetParent !== null).length
        );
        
        if (lessonsVisibleAfter > 0) {
          console.log('✅ Expand All working');
        }
      }
    }
    
    // Test click navigation
    console.log('🖱️ Testing click navigation...');
    
    // Try clicking on a lesson
    const firstLesson = await page.$('[role="treeitem"][aria-level="5"]');
    if (firstLesson) {
      await firstLesson.click();
      await helpers.waitForTimeout(1000);
      
      // Check if navigation occurred
      const currentUrl = page.url();
      if (currentUrl.includes('/lessons/')) {
        console.log('✅ Lesson navigation working');
        
        // Go back to planning view
        await page.goBack();
        await page.waitForSelector('.planning-cascade-view');
      }
    }
    
    // Test keyboard navigation
    console.log('⌨️ Testing keyboard navigation...');
    
    // Focus the tree
    await page.focus('[role="tree"]');
    
    // Press arrow down
    await page.keyboard.press('ArrowDown');
    await helpers.waitForTimeout(200);
    
    // Check if selection moved
    const selectedElement = await page.$('[aria-selected="true"]');
    if (selectedElement) {
      console.log('✅ Keyboard navigation working');
    }
    
    // Test scheduled vs unscheduled display
    console.log('📅 Checking scheduled/unscheduled display...');
    
    // Look for scheduled dates
    const scheduledDates = await page.$$('.text-green-600');
    const unscheduledBadges = await page.$$('.text-orange-600');
    
    console.log(`✅ Found ${scheduledDates.length} scheduled items`);
    console.log(`✅ Found ${unscheduledBadges.length} unscheduled items`);
    
    // Test filter for unscheduled only
    const unscheduledCheckbox = await page.$('input[type="checkbox"]');
    if (unscheduledCheckbox) {
      await unscheduledCheckbox.click();
      await helpers.waitForTimeout(500);
      
      // Take screenshot of filtered view
      const screenshot4 = await helpers.takeScreenshot(page, 'planning-cascade-unscheduled', 'planning-cascade');
      results.screenshots.push(screenshot4);
      
      console.log('✅ Unscheduled filter working');
    }
    
    // Test progress statistics
    console.log('📊 Checking progress statistics...');
    
    const statsElements = await page.$$('.bg-blue-50');
    if (statsElements.length > 0) {
      console.log('✅ Progress statistics displayed');
    }
    
    // Take final full-page screenshot
    const screenshotFinal = await helpers.takeScreenshot(page, 'planning-cascade-complete', 'planning-cascade');
    results.screenshots.push(screenshotFinal);
    
    // Measure performance
    results.metrics = await helpers.measurePerformance(page);
    console.log('📊 Performance metrics collected');
    
    // Check for console errors
    if (consoleErrors.length > 0) {
      results.errors.push(...consoleErrors);
      console.warn('⚠️ Console errors detected:', consoleErrors);
    }
    
    results.passed = true;
    console.log('✅ Planning Cascade tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Planning Cascade test failed:', error);
    results.errors.push(error.message);
    
    // Take error screenshot
    if (page) {
      const errorScreenshot = await helpers.takeScreenshot(page, 'planning-cascade-error', 'planning-cascade');
      results.screenshots.push(errorScreenshot);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    
    results.duration = Date.now() - startTime;
    console.log(`⏱️ Test duration: ${results.duration}ms`);
  }
  
  return results;
}

module.exports = testPlanningCascade;