import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

describe('Full Application E2E Flow', () => {
  let browser: Browser;
  let page: Page;
  let backendProcess: ChildProcess;
  let frontendProcess: ChildProcess;
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const baseUrl = 'http://localhost:5173';
  const apiUrl = 'http://localhost:3000';

  // Helper to take screenshots with descriptive names
  async function takeScreenshot(name: string) {
    await fs.mkdir(screenshotsDir, { recursive: true });
    const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}-${name}.png`;
    await page.screenshot({
      path: path.join(screenshotsDir, filename),
      fullPage: true,
    });
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  // Helper to wait for network idle
  async function waitForNetworkIdle() {
    await page.waitForLoadState('networkidle');
  }

  beforeAll(async () => {
    console.log('🚀 Starting development servers...');
    
    // Start backend server
    backendProcess = spawn('pnpm', ['--filter', 'server', 'dev'], {
      cwd: path.join(__dirname, '../..'),
      stdio: 'pipe',
    });

    // Start frontend server
    frontendProcess = spawn('pnpm', ['--filter', 'client', 'dev'], {
      cwd: path.join(__dirname, '../..'),
      stdio: 'pipe',
    });

    // Wait for servers to start
    console.log('⏳ Waiting for servers to start...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Check if servers are running
    try {
      const healthCheck = await fetch(`${apiUrl}/health`);
      if (!healthCheck.ok) {
        throw new Error('Backend health check failed');
      }
      console.log('✅ Backend is healthy');
    } catch (error) {
      console.error('❌ Backend failed to start:', error);
      throw error;
    }

    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1280,
        height: 800,
      },
    });

    page = await browser.newPage();
    
    // Set up console log capture
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });

    // Set up request interception for debugging
    page.on('request', request => {
      console.log('→', request.method(), request.url());
    });

    page.on('response', response => {
      if (!response.ok() && response.status() !== 304) {
        console.log('←', response.status(), response.url());
      }
    });
  }, 60000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    
    if (backendProcess) {
      backendProcess.kill();
    }
    
    if (frontendProcess) {
      frontendProcess.kill();
    }
    
    // Wait for processes to clean up
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it('should complete full application flow', async () => {
    // 1. Landing Page
    console.log('\n📍 Step 1: Landing Page');
    await page.goto(baseUrl);
    await waitForNetworkIdle();
    await takeScreenshot('01-landing-page');
    
    // Verify landing page elements
    await expect(page.title()).resolves.toContain('Teaching Engine');
    const heroText = await page.$eval('h1', el => el.textContent);
    expect(heroText).toContain('Teaching Engine');

    // 2. Navigate to Login
    console.log('\n📍 Step 2: Navigate to Login');
    await page.click('a[href="/login"]');
    await page.waitForURL('**/login');
    await takeScreenshot('02-login-page');

    // 3. Fill Login Form
    console.log('\n📍 Step 3: Login Process');
    await page.type('input[name="email"]', 'teacher@example.com');
    await page.type('input[name="password"]', 'password123');
    await takeScreenshot('03-login-filled');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await waitForNetworkIdle();
    await takeScreenshot('04-dashboard');

    // 4. Verify Dashboard
    console.log('\n📍 Step 4: Dashboard Overview');
    const dashboardTitle = await page.$eval('h1', el => el.textContent);
    expect(dashboardTitle).toContain('Dashboard');
    
    // Check for main navigation elements
    const navItems = await page.$$eval('nav a', links => 
      links.map(link => link.textContent)
    );
    expect(navItems).toContain('Calendar');
    expect(navItems).toContain('Unit Plans');
    expect(navItems).toContain('Lesson Plans');

    // 5. Navigate to Calendar
    console.log('\n📍 Step 5: Calendar View');
    await page.click('nav a:has-text("Calendar")');
    await page.waitForURL('**/calendar');
    await waitForNetworkIdle();
    await takeScreenshot('05-calendar-view');

    // 6. Navigate to Unit Plans
    console.log('\n📍 Step 6: Unit Plans');
    await page.click('nav a:has-text("Unit Plans")');
    await page.waitForURL('**/unit-plans');
    await waitForNetworkIdle();
    await takeScreenshot('06-unit-plans-list');

    // Click create unit plan button
    await page.click('button:has-text("Create Unit Plan")');
    await page.waitForSelector('[role="dialog"]');
    await takeScreenshot('07-create-unit-plan-modal');

    // Fill unit plan form
    console.log('\n📍 Step 7: Create Unit Plan');
    await page.type('input[name="title"]', 'Test Unit Plan');
    await page.type('textarea[name="description"]', 'This is a test unit plan created by Puppeteer');
    await page.selectOption('select[name="subject"]', 'Mathematics');
    await page.selectOption('select[name="gradeLevel"]', '3');
    
    // Set dates
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks
    
    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);
    
    await takeScreenshot('08-unit-plan-filled');
    
    // Submit form
    await page.click('button[type="submit"]');
    await page.waitForSelector('.toast-success', { timeout: 5000 });
    await takeScreenshot('09-unit-plan-created');

    // 7. Navigate to Lesson Plans
    console.log('\n📍 Step 8: Lesson Plans');
    await page.click('nav a:has-text("Lesson Plans")');
    await page.waitForURL('**/lesson-plans');
    await waitForNetworkIdle();
    await takeScreenshot('10-lesson-plans-list');

    // Create lesson plan
    await page.click('button:has-text("Create Lesson")');
    await page.waitForSelector('[role="dialog"]');
    await takeScreenshot('11-create-lesson-modal');

    // 8. Navigate to Templates
    console.log('\n📍 Step 9: Templates');
    await page.click('nav a:has-text("Templates")');
    await page.waitForURL('**/templates');
    await waitForNetworkIdle();
    await takeScreenshot('12-templates-gallery');

    // 9. Navigate to Settings
    console.log('\n📍 Step 10: Settings');
    await page.click('nav a:has-text("Settings")');
    await page.waitForURL('**/settings');
    await waitForNetworkIdle();
    await takeScreenshot('13-settings-page');

    // Check settings tabs
    const settingsTabs = await page.$$eval('[role="tab"]', tabs => 
      tabs.map(tab => tab.textContent)
    );
    expect(settingsTabs).toContain('Profile');
    expect(settingsTabs).toContain('Preferences');
    expect(settingsTabs).toContain('Notifications');

    // 10. Test AI Features (if available)
    console.log('\n📍 Step 11: AI Features');
    await page.click('nav a:has-text("AI Assistant")');
    await page.waitForURL('**/ai-assistant');
    await waitForNetworkIdle();
    await takeScreenshot('14-ai-assistant');

    // 11. Test Data Export
    console.log('\n📍 Step 12: Data Export');
    await page.click('nav a:has-text("Settings")');
    await page.click('[role="tab"]:has-text("Data & Privacy")');
    await takeScreenshot('15-data-privacy-settings');
    
    // 12. Logout
    console.log('\n📍 Step 13: Logout');
    await page.click('button[aria-label="User menu"]');
    await page.click('button:has-text("Logout")');
    await page.waitForURL('**/login');
    await takeScreenshot('16-logged-out');

    console.log('\n✅ Full application flow completed successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
  }, 120000); // 2 minute timeout for full flow

  // Additional specific feature tests
  it('should handle ETFO lesson planning workflow', async () => {
    console.log('\n🎯 ETFO Lesson Planning Workflow');
    
    // Login first
    await page.goto(`${baseUrl}/login`);
    await page.type('input[name="email"]', 'teacher@example.com');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Navigate to ETFO planning
    await page.click('nav a:has-text("ETFO Planning")');
    await page.waitForURL('**/etfo-planning');
    await waitForNetworkIdle();
    await takeScreenshot('etfo-01-planning-dashboard');

    // Create ETFO lesson plan
    await page.click('button:has-text("New ETFO Lesson")');
    await page.waitForSelector('.etfo-lesson-form');
    await takeScreenshot('etfo-02-lesson-form');

    // Fill ETFO-specific fields
    await page.type('input[name="title"]', 'ETFO Mathematics Lesson');
    await page.selectOption('select[name="strand"]', 'Number Sense');
    await page.type('textarea[name="expectations"]', 'B1.1 - Understand place value');
    
    // Add learning goals
    await page.click('button:has-text("Add Learning Goal")');
    await page.type('.learning-goal-input', 'Students will understand place value up to 1000');
    
    // Add success criteria
    await page.click('button:has-text("Add Success Criteria")');
    await page.type('.success-criteria-input', 'I can identify the place value of each digit');
    
    await takeScreenshot('etfo-03-lesson-filled');
    
    // Submit and verify
    await page.click('button[type="submit"]');
    await page.waitForSelector('.toast-success');
    await takeScreenshot('etfo-04-lesson-created');
  }, 60000);

  it('should test responsive design', async () => {
    console.log('\n📱 Testing Responsive Design');
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(baseUrl);
    await takeScreenshot('responsive-01-mobile-landing');
    
    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload();
    await takeScreenshot('responsive-02-tablet-landing');
    
    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await page.reload();
    await takeScreenshot('responsive-03-desktop-landing');
  }, 30000);

  it('should handle error states gracefully', async () => {
    console.log('\n⚠️ Testing Error Handling');
    
    // Test 404 page
    await page.goto(`${baseUrl}/non-existent-page`);
    await takeScreenshot('error-01-404-page');
    
    // Test form validation errors
    await page.goto(`${baseUrl}/login`);
    await page.click('button[type="submit"]'); // Submit empty form
    await takeScreenshot('error-02-validation-errors');
    
    // Test network error handling (mock offline)
    await page.setOfflineMode(true);
    await page.goto(`${baseUrl}/dashboard`).catch(() => {});
    await takeScreenshot('error-03-offline-state');
    await page.setOfflineMode(false);
  }, 30000);
});