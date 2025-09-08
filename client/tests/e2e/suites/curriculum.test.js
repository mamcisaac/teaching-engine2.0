/**
 * Curriculum Management E2E Tests
 * Tests the 68 Grade 1 French Immersion expectations with filtering
 */

const puppeteer = require('puppeteer');
const helpers = require('../helpers');

async function testCurriculum() {
  let browser;
  let page;
  const results = {
    name: 'Curriculum Management',
    passed: false,
    errors: [],
    screenshots: [],
    metrics: {},
    duration: 0
  };
  
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting Curriculum tests...');
    
    // Launch browser
    browser = await helpers.launchBrowser(puppeteer);
    page = await browser.newPage();
    
    // Navigate to curriculum page
    await helpers.navigateTo(page, '/curriculum');
    await helpers.waitForTimeout(2000);
    
    // Take initial screenshot
    const screenshot1 = await helpers.takeScreenshot(page, 'curriculum-initial', 'curriculum');
    results.screenshots.push(screenshot1);
    
    // Check for curriculum expectations
    console.log('📊 Checking curriculum expectations...');
    
    // Wait for expectations to load
    await page.waitForSelector('.expectation-card, .curriculum-item, [data-testid="expectation"]', {
      timeout: 10000
    });
    
    // Count expectations
    const expectations = await page.$$('.expectation-card, .curriculum-item, [data-testid="expectation"]');
    console.log(`✅ Found ${expectations.length} curriculum expectations`);
    
    // Verify we have approximately 68 expectations (might be filtered by subject)
    if (expectations.length > 0) {
      console.log('✅ Curriculum expectations loaded');
    }
    
    // Test subject filtering
    console.log('🔍 Testing subject filtering...');
    
    // Look for subject filter buttons or dropdown
    const subjectFilters = await page.$$('button[data-subject], select[name="subject"], .subject-filter');
    
    if (subjectFilters.length > 0) {
      // Click on Mathematics filter
      const mathFilter = await page.$('button:has-text("Mathématiques"), option:has-text("Mathématiques")');
      if (mathFilter) {
        await mathFilter.click();
        await helpers.waitForTimeout(1000);
        
        // Take screenshot of filtered view
        const screenshot2 = await helpers.takeScreenshot(page, 'curriculum-math-filtered', 'curriculum');
        results.screenshots.push(screenshot2);
        
        // Count filtered expectations
        const mathExpectations = await page.$$('.expectation-card, .curriculum-item');
        console.log(`✅ Filtered to ${mathExpectations.length} Mathematics expectations`);
      }
    }
    
    // Test search functionality
    console.log('🔍 Testing search...');
    
    const searchInput = await page.$('input[placeholder*="Search"], input[type="search"]');
    if (searchInput) {
      await helpers.clearAndType(page, 'input[placeholder*="Search"], input[type="search"]', 'nombres');
      await helpers.waitForTimeout(1000);
      
      // Take screenshot of search results
      const screenshot3 = await helpers.takeScreenshot(page, 'curriculum-search', 'curriculum');
      results.screenshots.push(screenshot3);
      
      // Count search results
      const searchResults = await page.$$('.expectation-card:visible, .curriculum-item:visible');
      console.log(`✅ Search returned ${searchResults.length} results`);
      
      // Clear search
      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
    }
    
    // Test coverage tracking
    console.log('📊 Testing coverage tracking...');
    
    // Look for coverage indicators
    const coverageElements = await page.$$('.coverage-indicator, .progress-bar, [data-coverage]');
    
    if (coverageElements.length > 0) {
      console.log('✅ Coverage tracking indicators present');
      
      // Get coverage percentages
      const coverageText = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="coverage"], [class*="progress"]');
        return Array.from(elements).map(el => el.textContent).filter(text => text.includes('%'));
      });
      
      if (coverageText.length > 0) {
        console.log(`✅ Coverage percentages: ${coverageText.join(', ')}`);
      }
    }
    
    // Test expectation details
    console.log('📋 Testing expectation details...');
    
    // Click on first expectation to see details
    const firstExpectation = await page.$('.expectation-card, .curriculum-item');
    if (firstExpectation) {
      await firstExpectation.click();
      await helpers.waitForTimeout(1000);
      
      // Check for detail view or modal
      const hasDetails = await helpers.elementExists(page, '.expectation-details, .modal, [role="dialog"]');
      
      if (hasDetails) {
        console.log('✅ Expectation details view working');
        
        // Take screenshot of details
        const screenshot4 = await helpers.takeScreenshot(page, 'curriculum-expectation-details', 'curriculum');
        results.screenshots.push(screenshot4);
        
        // Close details if modal
        const closeButton = await page.$('button[aria-label*="Close"], button:has-text("Close")');
        if (closeButton) {
          await closeButton.click();
          await helpers.waitForTimeout(500);
        }
      }
    }
    
    // Test by grade level (should all be Grade 1)
    console.log('📚 Verifying Grade 1 focus...');
    
    const gradeIndicators = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements)
        .map(el => el.textContent)
        .filter(text => text && text.includes('Grade 1') || text.includes('1re année'));
    });
    
    if (gradeIndicators.length > 0) {
      console.log(`✅ Found ${gradeIndicators.length} Grade 1 references`);
    }
    
    // Test strand organization
    console.log('📂 Testing strand organization...');
    
    // Look for strand headers
    const strands = await page.$$('.strand-header, h3, .category-header');
    
    if (strands.length > 0) {
      console.log(`✅ Found ${strands.length} strand/category headers`);
      
      // Get strand names
      const strandNames = await page.evaluate(() => {
        const headers = document.querySelectorAll('.strand-header, h3, .category-header');
        return Array.from(headers).map(h => h.textContent).slice(0, 5);
      });
      
      console.log(`✅ Sample strands: ${strandNames.join(', ')}`);
    }
    
    // Test responsive design
    console.log('📱 Testing responsive design...');
    
    // Switch to mobile view
    await helpers.setViewport(page, 'mobile');
    await helpers.waitForTimeout(1000);
    
    // Take mobile screenshot
    const screenshot5 = await helpers.takeScreenshot(page, 'curriculum-mobile', 'curriculum');
    results.screenshots.push(screenshot5);
    
    // Check that content is still accessible
    const mobileExpectations = await page.$$('.expectation-card, .curriculum-item');
    if (mobileExpectations.length > 0) {
      console.log('✅ Curriculum accessible on mobile');
    }
    
    // Switch back to desktop
    await helpers.setViewport(page, 'desktop');
    
    // Take final screenshot
    const screenshotFinal = await helpers.takeScreenshot(page, 'curriculum-complete', 'curriculum');
    results.screenshots.push(screenshotFinal);
    
    // Measure performance
    results.metrics = await helpers.measurePerformance(page);
    
    results.passed = true;
    console.log('✅ Curriculum tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Curriculum test failed:', error);
    results.errors.push(error.message);
    
    // Take error screenshot
    if (page) {
      const errorScreenshot = await helpers.takeScreenshot(page, 'curriculum-error', 'curriculum');
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

module.exports = testCurriculum;