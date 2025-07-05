#!/usr/bin/env node

/**
 * UI Verification Script
 * 
 * This script uses Puppeteer to navigate through the entire application,
 * taking screenshots of each page and verifying that all features work correctly.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

// Configuration
const config = {
  baseUrl: 'http://localhost:5173',
  apiUrl: 'http://localhost:3000',
  screenshotsDir: path.join(__dirname, '..', 'ui-verification-screenshots'),
  headless: false, // Set to true to run in background
  slowMo: 100, // Slow down actions by 100ms for visibility
};

// Test user credentials
const testUser = {
  email: 'demo@teaching-engine.com',
  password: 'demo123',
  name: 'Demo Teacher',
};

// Helper functions
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${name}.png`;
  const filepath = path.join(config.screenshotsDir, filename);
  
  await page.screenshot({
    path: filepath,
    fullPage: true,
  });
  
  console.log(`📸 Screenshot: ${filename}`);
  return filepath;
}

async function waitAndClick(page, selector, options = {}) {
  await page.waitForSelector(selector, { visible: true, ...options });
  await page.click(selector);
}

async function waitAndType(page, selector, text, options = {}) {
  await page.waitForSelector(selector, { visible: true, ...options });
  await page.click(selector); // Focus the input
  await page.type(selector, text);
}

async function startServers() {
  console.log('🚀 Starting development servers...\n');
  
  const devProcess = spawn('pnpm', ['dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
  });
  
  // Wait for servers to be ready
  return new Promise((resolve, reject) => {
    let backendReady = false;
    let frontendReady = false;
    
    devProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      if (output.includes('Server running on port 3000')) {
        console.log('✅ Backend server ready');
        backendReady = true;
      }
      
      if (output.includes('Local:   http://localhost:5173')) {
        console.log('✅ Frontend server ready');
        frontendReady = true;
      }
      
      if (backendReady && frontendReady) {
        resolve(devProcess);
      }
    });
    
    devProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!backendReady || !frontendReady) {
        reject(new Error('Servers failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

async function createTestUser(page) {
  console.log('\n👤 Creating test user...');
  
  try {
    // Check if user already exists by trying to login
    await page.goto(`${config.baseUrl}/login`);
    await waitAndType(page, 'input[name="email"]', testUser.email);
    await waitAndType(page, 'input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait to see if login succeeds
    await page.waitForNavigation({ timeout: 5000 });
    
    if (page.url().includes('/dashboard')) {
      console.log('✅ Test user already exists');
      // Logout for clean state
      await page.goto(`${config.baseUrl}/logout`);
      return;
    }
  } catch (error) {
    // User doesn't exist, create it
    console.log('Creating new test user...');
  }
  
  // Navigate to signup
  await page.goto(`${config.baseUrl}/signup`);
  await takeScreenshot(page, '00-signup-page');
  
  // Fill signup form
  await waitAndType(page, 'input[name="name"]', testUser.name);
  await waitAndType(page, 'input[name="email"]', testUser.email);
  await waitAndType(page, 'input[name="password"]', testUser.password);
  await waitAndType(page, 'input[name="confirmPassword"]', testUser.password);
  
  // Select role and other details
  if (await page.$('select[name="role"]')) {
    await page.select('select[name="role"]', 'teacher');
  }
  
  if (await page.$('select[name="gradeLevel"]')) {
    await page.select('select[name="gradeLevel"]', '3');
  }
  
  if (await page.$('select[name="schoolBoard"]')) {
    await page.select('select[name="schoolBoard"]', 'ETFO');
  }
  
  await takeScreenshot(page, '01-signup-filled');
  
  // Submit signup
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  console.log('✅ Test user created successfully');
}

async function verifyUI() {
  let browser;
  let devProcess;
  
  try {
    // Ensure screenshots directory exists
    await ensureDir(config.screenshotsDir);
    
    // Start servers
    devProcess = await startServers();
    
    // Give servers a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Launch browser
    console.log('\n🌐 Launching browser...\n');
    browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1280,
        height: 800,
      },
    });
    
    const page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Browser error:', msg.text());
      }
    });
    
    // Create test user if needed
    await createTestUser(page);
    
    // Start UI verification
    console.log('\n🔍 Starting UI verification...\n');
    
    // 1. Landing Page
    console.log('📍 1. Landing Page');
    await page.goto(config.baseUrl);
    await takeScreenshot(page, '02-landing-page');
    
    // 2. Login Flow
    console.log('\n📍 2. Login Flow');
    await waitAndClick(page, 'a[href="/login"], button:has-text("Login")');
    await page.waitForURL('**/login');
    await takeScreenshot(page, '03-login-page');
    
    await waitAndType(page, 'input[name="email"]', testUser.email);
    await waitAndType(page, 'input[name="password"]', testUser.password);
    await takeScreenshot(page, '04-login-filled');
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await takeScreenshot(page, '05-dashboard');
    
    // 3. Dashboard Overview
    console.log('\n📍 3. Dashboard Overview');
    await page.waitForSelector('h1', { visible: true });
    const dashboardTitle = await page.$eval('h1', el => el.textContent);
    console.log(`Dashboard title: ${dashboardTitle}`);
    
    // Check for key dashboard elements
    const dashboardSections = await page.$$eval('.dashboard-section', sections => sections.length);
    console.log(`Found ${dashboardSections} dashboard sections`);
    
    // 4. Calendar View
    console.log('\n📍 4. Calendar View');
    await waitAndClick(page, 'a[href="/calendar"], nav a:has-text("Calendar")');
    await page.waitForURL('**/calendar');
    await page.waitForSelector('.calendar-container, .fc-view-container', { visible: true });
    await takeScreenshot(page, '06-calendar-view');
    
    // 5. Unit Plans
    console.log('\n📍 5. Unit Plans');
    await waitAndClick(page, 'a[href="/unit-plans"], nav a:has-text("Unit Plans")');
    await page.waitForURL('**/unit-plans');
    await takeScreenshot(page, '07-unit-plans-list');
    
    // Create a unit plan
    if (await page.$('button:has-text("Create Unit Plan"), button:has-text("New Unit Plan")')) {
      await waitAndClick(page, 'button:has-text("Create Unit Plan"), button:has-text("New Unit Plan")');
      await page.waitForSelector('[role="dialog"], .modal', { visible: true });
      await takeScreenshot(page, '08-create-unit-plan-modal');
      
      // Fill form
      await waitAndType(page, 'input[name="title"]', 'UI Test Unit Plan');
      await waitAndType(page, 'textarea[name="description"], textarea[name="overview"]', 
        'This unit plan was created by the UI verification script');
      
      if (await page.$('select[name="subject"]')) {
        await page.select('select[name="subject"]', 'Mathematics');
      }
      
      // Close modal for now
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // 6. Lesson Plans
    console.log('\n📍 6. Lesson Plans');
    await waitAndClick(page, 'a[href="/lesson-plans"], nav a:has-text("Lesson Plans")');
    await page.waitForURL('**/lesson-plans');
    await takeScreenshot(page, '09-lesson-plans-list');
    
    // 7. Templates
    console.log('\n📍 7. Templates');
    await waitAndClick(page, 'a[href="/templates"], nav a:has-text("Templates")');
    await page.waitForURL('**/templates');
    await takeScreenshot(page, '10-templates-gallery');
    
    // 8. ETFO Planning (if available)
    console.log('\n📍 8. ETFO Planning');
    if (await page.$('a[href="/etfo-planning"], nav a:has-text("ETFO")')) {
      await waitAndClick(page, 'a[href="/etfo-planning"], nav a:has-text("ETFO")');
      await page.waitForURL('**/etfo-planning');
      await takeScreenshot(page, '11-etfo-planning');
    }
    
    // 9. AI Assistant (if available)
    console.log('\n📍 9. AI Assistant');
    if (await page.$('a[href="/ai-assistant"], nav a:has-text("AI")')) {
      await waitAndClick(page, 'a[href="/ai-assistant"], nav a:has-text("AI")');
      await page.waitForURL('**/ai-assistant');
      await takeScreenshot(page, '12-ai-assistant');
    }
    
    // 10. Settings
    console.log('\n📍 10. Settings');
    await waitAndClick(page, 'a[href="/settings"], nav a:has-text("Settings")');
    await page.waitForURL('**/settings');
    await takeScreenshot(page, '13-settings-overview');
    
    // Check settings tabs
    const settingsTabs = ['Profile', 'Preferences', 'Notifications', 'Data & Privacy'];
    for (const tab of settingsTabs) {
      if (await page.$(`[role="tab"]:has-text("${tab}")`)) {
        await waitAndClick(page, `[role="tab"]:has-text("${tab}")`);
        await page.waitForTimeout(500);
        await takeScreenshot(page, `14-settings-${tab.toLowerCase().replace(/ /g, '-')}`);
      }
    }
    
    // 11. Mobile Responsive Test
    console.log('\n📍 11. Mobile Responsive Test');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${config.baseUrl}/dashboard`);
    await takeScreenshot(page, '15-mobile-dashboard');
    
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload();
    await takeScreenshot(page, '16-tablet-dashboard');
    
    // 12. Logout
    console.log('\n📍 12. Logout');
    await page.setViewport({ width: 1280, height: 800 });
    
    // Look for user menu or logout button
    if (await page.$('[aria-label="User menu"], button:has-text("Account")')) {
      await waitAndClick(page, '[aria-label="User menu"], button:has-text("Account")');
      await page.waitForTimeout(500);
    }
    
    await waitAndClick(page, 'button:has-text("Logout"), a[href="/logout"]');
    await page.waitForURL('**/login');
    await takeScreenshot(page, '17-logged-out');
    
    console.log('\n✅ UI verification completed successfully!');
    console.log(`\n📁 Screenshots saved to: ${config.screenshotsDir}`);
    
  } catch (error) {
    console.error('\n❌ UI verification failed:', error);
    
    // Take error screenshot if possible
    if (browser) {
      const pages = await browser.pages();
      if (pages.length > 0) {
        await takeScreenshot(pages[0], 'error-state');
      }
    }
    
    throw error;
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    
    if (devProcess) {
      console.log('\n🛑 Stopping development servers...');
      devProcess.kill();
      
      // Give processes time to clean up
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Run the verification
if (require.main === module) {
  verifyUI().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { verifyUI };