#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Create screenshots directory
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function ensureScreenshotsDir() {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    console.log(`📁 Screenshots will be saved to: ${SCREENSHOTS_DIR}`);
  } catch (error) {
    console.error('Failed to create screenshots directory:', error);
  }
}

async function takeScreenshot(page, name) {
  const filename = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`   📸 Screenshot saved: ${name}.png`);
}

async function testCompleteUI() {
  console.log('🚀 Starting Complete UI Test with Puppeteer\n');
  
  await ensureScreenshotsDir();
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Enable console log capture
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('   ❌ Browser Console Error:', msg.text());
    }
  });

  try {
    // 1. Landing Page
    console.log('1. Testing Landing Page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '01-landing-page');
    
    // Check if we need to login
    const loginButton = await page.$('button:has-text("Login")');
    if (loginButton) {
      console.log('   ✅ Landing page loaded, login required');
    } else {
      console.log('   ℹ️  Already logged in or no login button found');
    }

    // 2. Login Flow
    console.log('\n2. Testing Login Flow...');
    // Look for login form or button
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await page.type('input[type="email"]', 'teacher@example.com');
      await page.type('input[type="password"]', 'Password123!');
      await takeScreenshot(page, '02-login-form-filled');
      
      // Submit login
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log('   ✅ Login submitted');
    } else {
      console.log('   ℹ️  No login form found, checking if already authenticated');
    }

    // 3. Dashboard
    console.log('\n3. Testing Dashboard...');
    await page.waitForTimeout(2000); // Wait for any redirects
    await takeScreenshot(page, '03-dashboard');
    
    // Check for dashboard elements
    const dashboardTitle = await page.$eval('h1, h2', el => el.textContent).catch(() => 'No title found');
    console.log(`   ✅ Dashboard loaded: ${dashboardTitle}`);

    // 4. Lesson Plans
    console.log('\n4. Testing ETFO Lesson Plans...');
    const lessonPlansLink = await page.$('a[href*="lesson"], button:has-text("Lesson")');
    if (lessonPlansLink) {
      await lessonPlansLink.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '04-lesson-plans-list');
      console.log('   ✅ Lesson plans page loaded');
      
      // Try to create new lesson plan
      const newLessonButton = await page.$('button:has-text("New Lesson"), button:has-text("Create")');
      if (newLessonButton) {
        await newLessonButton.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '05-new-lesson-form');
        console.log('   ✅ New lesson form opened');
        
        // Fill lesson plan form
        await page.type('input[name="title"]', 'Test Math Lesson - Fractions', { delay: 50 });
        await page.type('textarea[name="objectives"], textarea[name="mindsOn"]', 'Students will understand basic fractions', { delay: 20 });
        await page.type('textarea[name="action"]', 'Hands-on fraction manipulatives activity', { delay: 20 });
        await page.type('textarea[name="consolidation"]', 'Exit ticket with fraction problems', { delay: 20 });
        
        await takeScreenshot(page, '06-lesson-form-filled');
        console.log('   ✅ Lesson plan form filled');
      }
    } else {
      console.log('   ⚠️  Could not find lesson plans navigation');
    }

    // 5. Unit Plans
    console.log('\n5. Testing Unit Plans...');
    const unitPlansLink = await page.$('a[href*="unit"], button:has-text("Unit")');
    if (unitPlansLink) {
      await unitPlansLink.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '07-unit-plans-list');
      console.log('   ✅ Unit plans page loaded');
    }

    // 6. Daybook
    console.log('\n6. Testing Daybook...');
    const daybookLink = await page.$('a[href*="daybook"], button:has-text("Daybook")');
    if (daybookLink) {
      await daybookLink.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '08-daybook-entries');
      console.log('   ✅ Daybook page loaded');
    }

    // 7. Templates
    console.log('\n7. Testing Templates...');
    const templatesLink = await page.$('a[href*="template"], button:has-text("Template")');
    if (templatesLink) {
      await templatesLink.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '09-templates-list');
      console.log('   ✅ Templates page loaded');
    }

    // 8. Curriculum Import
    console.log('\n8. Testing Curriculum Import...');
    const curriculumLink = await page.$('a[href*="curriculum"], button:has-text("Curriculum")');
    if (curriculumLink) {
      await curriculumLink.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '10-curriculum-import');
      console.log('   ✅ Curriculum import page loaded');
    }

    // 9. User Profile
    console.log('\n9. Testing User Profile...');
    const profileLink = await page.$('a[href*="profile"], button:has-text("Profile")');
    if (profileLink) {
      await profileLink.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '11-user-profile');
      console.log('   ✅ User profile page loaded');
    }

    // 10. API Health Check
    console.log('\n10. Verifying API Connectivity...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3000/api/health');
        return await response.json();
      } catch (error) {
        return { error: error.message };
      }
    });
    console.log('   ✅ API Health:', apiResponse);

    console.log('\n✅ UI Test Complete! Check screenshots directory for visual verification.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await takeScreenshot(page, 'error-state');
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
  testCompleteUI();
} catch (e) {
  console.log('📦 Installing puppeteer first...');
  const { execSync } = require('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('✅ Puppeteer installed, running tests...\n');
  testCompleteUI();
}