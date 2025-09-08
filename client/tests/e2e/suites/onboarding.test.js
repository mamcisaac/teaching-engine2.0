/**
 * Onboarding Flow E2E Tests
 * Tests the 4-step onboarding wizard with subject selection
 */

const puppeteer = require('puppeteer');
const helpers = require('../helpers');

async function testOnboarding() {
  let browser;
  let page;
  const results = {
    name: 'Onboarding Flow',
    passed: false,
    errors: [],
    screenshots: [],
    metrics: {},
    duration: 0
  };
  
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting Onboarding tests...');
    
    // Launch browser
    browser = await helpers.launchBrowser(puppeteer);
    page = await browser.newPage();
    
    // Clear localStorage to ensure fresh onboarding
    await helpers.navigateTo(page, '/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Refresh to trigger onboarding
    await page.reload();
    await helpers.waitForTimeout(1000);
    
    // STEP 1: Welcome Screen
    console.log('📍 Step 1: Welcome Screen...');
    
    // Wait for onboarding modal
    await page.waitForSelector('.onboarding-modal, [role="dialog"]', {
      timeout: 10000
    });
    
    // Take screenshot of welcome
    const screenshot1 = await helpers.takeScreenshot(page, 'onboarding-step1-welcome', 'onboarding');
    results.screenshots.push(screenshot1);
    
    // Check for welcome content
    const hasWelcome = await helpers.elementExists(page, 'h2');
    if (hasWelcome) {
      const welcomeText = await helpers.getElementText(page, 'h2');
      console.log(`✅ Welcome message: ${welcomeText}`);
    }
    
    // Click Next
    await helpers.clickElement(page, 'button:has-text("Next"), button:has-text("Get Started")');
    await helpers.waitForTimeout(500);
    
    // STEP 2: ETFO Planning Introduction
    console.log('📍 Step 2: ETFO Planning Introduction...');
    
    // Take screenshot
    const screenshot2 = await helpers.takeScreenshot(page, 'onboarding-step2-etfo', 'onboarding');
    results.screenshots.push(screenshot2);
    
    // Verify ETFO content is present
    const hasETFO = await page.evaluate(() => 
      document.body.innerText.includes('ETFO') || 
      document.body.innerText.includes('planning') ||
      document.body.innerText.includes('three-part')
    );
    
    if (hasETFO) {
      console.log('✅ ETFO planning content present');
    }
    
    // Click Next
    await helpers.clickElement(page, 'button:has-text("Next"), button:has-text("Continue")');
    await helpers.waitForTimeout(500);
    
    // STEP 3: Subject Selection
    console.log('📍 Step 3: Subject Selection...');
    
    // Take screenshot
    const screenshot3 = await helpers.takeScreenshot(page, 'onboarding-step3-subjects', 'onboarding');
    results.screenshots.push(screenshot3);
    
    // Look for subject checkboxes
    const subjectCheckboxes = await page.$$('input[type="checkbox"]');
    console.log(`✅ Found ${subjectCheckboxes.length} subject options`);
    
    // Select core subjects (Français and Mathématiques)
    const coreSubjects = ['Français', 'Mathématiques'];
    for (const subject of coreSubjects) {
      const checkbox = await page.$(`label:has-text("${subject}") input[type="checkbox"]`);
      if (checkbox) {
        await checkbox.click();
        console.log(`✅ Selected ${subject}`);
      }
    }
    
    // Select optional subjects (Sciences, Arts)
    const optionalSubjects = ['Sciences', 'Arts'];
    for (const subject of optionalSubjects) {
      const checkbox = await page.$(`label:has-text("${subject}") input[type="checkbox"]`);
      if (checkbox) {
        await checkbox.click();
        console.log(`✅ Selected ${subject}`);
      }
    }
    
    // Take screenshot after selection
    const screenshot3b = await helpers.takeScreenshot(page, 'onboarding-step3-selected', 'onboarding');
    results.screenshots.push(screenshot3b);
    
    // Click Next
    await helpers.clickElement(page, 'button:has-text("Next"), button:has-text("Continue")');
    await helpers.waitForTimeout(500);
    
    // STEP 4: Feature Overview
    console.log('📍 Step 4: Feature Overview...');
    
    // Take screenshot
    const screenshot4 = await helpers.takeScreenshot(page, 'onboarding-step4-features', 'onboarding');
    results.screenshots.push(screenshot4);
    
    // Check for feature content
    const hasFeatures = await page.evaluate(() => 
      document.body.innerText.includes('AI') || 
      document.body.innerText.includes('assistant') ||
      document.body.innerText.includes('features')
    );
    
    if (hasFeatures) {
      console.log('✅ Feature overview content present');
    }
    
    // Complete onboarding
    await helpers.clickElement(page, 'button:has-text("Finish"), button:has-text("Complete"), button:has-text("Get Started")');
    await helpers.waitForTimeout(1000);
    
    // Verify onboarding completed
    console.log('🔍 Verifying onboarding completion...');
    
    // Check localStorage for selected subjects
    const selectedSubjects = await page.evaluate(() => {
      const subjects = localStorage.getItem('teacher-subjects');
      return subjects ? JSON.parse(subjects) : null;
    });
    
    if (selectedSubjects && selectedSubjects.length > 0) {
      console.log(`✅ Subjects saved: ${selectedSubjects.join(', ')}`);
    } else {
      throw new Error('Subjects not saved to localStorage');
    }
    
    // Check that onboarding flag is set
    const onboardingComplete = await page.evaluate(() => {
      return localStorage.getItem('onboarded') === 'true';
    });
    
    if (onboardingComplete) {
      console.log('✅ Onboarding marked as complete');
    }
    
    // Verify redirect to dashboard
    await helpers.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/planning')) {
      console.log('✅ Redirected to dashboard after onboarding');
      
      // Take screenshot of dashboard
      const screenshot5 = await helpers.takeScreenshot(page, 'onboarding-complete-dashboard', 'onboarding');
      results.screenshots.push(screenshot5);
    }
    
    // Test that onboarding doesn't show again
    console.log('🔄 Testing onboarding persistence...');
    
    await page.reload();
    await helpers.waitForTimeout(2000);
    
    // Check that onboarding modal is NOT present
    const onboardingPresent = await helpers.elementExists(page, '.onboarding-modal, [role="dialog"]');
    
    if (!onboardingPresent) {
      console.log('✅ Onboarding does not reappear after completion');
    } else {
      throw new Error('Onboarding incorrectly showing after completion');
    }
    
    // Test subject filtering in curriculum
    console.log('🔍 Testing subject filtering...');
    
    // Navigate to curriculum page
    await helpers.navigateTo(page, '/curriculum');
    await helpers.waitForTimeout(2000);
    
    // Check that selected subjects are displayed
    const subjectTags = await page.$$('.subject-tag, .badge');
    if (subjectTags.length > 0) {
      console.log('✅ Subject filtering active in curriculum view');
      
      // Take screenshot
      const screenshot6 = await helpers.takeScreenshot(page, 'onboarding-subjects-filtered', 'onboarding');
      results.screenshots.push(screenshot6);
    }
    
    // Measure performance
    results.metrics = await helpers.measurePerformance(page);
    
    results.passed = true;
    console.log('✅ Onboarding tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Onboarding test failed:', error);
    results.errors.push(error.message);
    
    // Take error screenshot
    if (page) {
      const errorScreenshot = await helpers.takeScreenshot(page, 'onboarding-error', 'onboarding');
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

module.exports = testOnboarding;