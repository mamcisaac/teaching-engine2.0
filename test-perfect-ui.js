#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Create screenshots directory
const SCREENSHOTS_DIR = path.join(__dirname, 'perfect-ui-screenshots');

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

async function waitAndClick(page, selector, description) {
  console.log(`   🖱️  Clicking: ${description}`);
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.click(selector);
}

async function waitAndType(page, selector, text, description) {
  console.log(`   ⌨️  Typing in ${description}: ${text}`);
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.click(selector, { clickCount: 3 }); // Select all
  await page.type(selector, text);
}

async function testPerfectUI() {
  console.log('🚀 Testing Perfect Teaching Engine 2.0 UI\n');
  
  await ensureScreenshotsDir();
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Enable detailed console logging
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`   ⚠️  Browser ${type}:`, msg.text());
    }
  });

  // Monitor network errors
  page.on('response', response => {
    if (!response.ok() && response.url().includes('/api/')) {
      console.log(`   ❌ API Error: ${response.status()} ${response.url()}`);
    }
  });

  try {
    // 1. Navigate to the app
    console.log('1️⃣  Testing Homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '01-homepage');

    // 2. Navigate to login if not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      console.log('   Navigating to login page...');
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    }
    await takeScreenshot(page, '02-login-page');

    // 3. Perform login
    console.log('\n2️⃣  Testing Login...');
    await waitAndType(page, 'input[type="email"]', 'teacher@example.com', 'email field');
    await waitAndType(page, 'input[type="password"]', 'Password123!', 'password field');
    await takeScreenshot(page, '03-login-filled');
    
    // Click submit and wait for navigation
    console.log('   Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]).catch(async (error) => {
      console.log('   ⚠️  Navigation may have failed, checking current state...');
      await page.waitForTimeout(2000);
    });
    
    await takeScreenshot(page, '04-after-login');

    // 4. Check if we're on the dashboard
    const dashboardUrl = page.url();
    console.log(`   Current URL: ${dashboardUrl}`);
    
    if (dashboardUrl.includes('/dashboard') || dashboardUrl.includes('/home')) {
      console.log('   ✅ Successfully logged in to dashboard!');
    } else {
      console.log('   ⚠️  Not on dashboard, checking for error messages...');
      const errorText = await page.evaluate(() => {
        const error = document.querySelector('.error-message') || 
                     document.querySelector('[role="alert"]') ||
                     document.querySelector('.text-red-500');
        return error ? error.textContent : null;
      });
      if (errorText) {
        console.log(`   Error message: ${errorText}`);
      }
    }

    // 5. Test navigation menu
    console.log('\n3️⃣  Testing Navigation...');
    
    // Look for navigation links
    const navLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href*="lesson"], a[href*="unit"], a[href*="daybook"], a[href*="template"], nav a').forEach(link => {
        links.push({
          text: link.textContent.trim(),
          href: link.getAttribute('href')
        });
      });
      return links;
    });
    
    console.log(`   Found ${navLinks.length} navigation links:`, navLinks.map(l => l.text).join(', '));

    // 6. Test ETFO Lesson Plans
    console.log('\n4️⃣  Testing ETFO Lesson Plans...');
    const lessonLink = navLinks.find(l => l.text.toLowerCase().includes('lesson'));
    if (lessonLink) {
      await page.goto(`http://localhost:5173${lessonLink.href}`, { waitUntil: 'networkidle2' });
      await takeScreenshot(page, '05-lesson-plans');
      console.log('   ✅ Lesson Plans page loaded');
    }

    // 7. Test Unit Plans
    console.log('\n5️⃣  Testing Unit Plans...');
    const unitLink = navLinks.find(l => l.text.toLowerCase().includes('unit'));
    if (unitLink) {
      await page.goto(`http://localhost:5173${unitLink.href}`, { waitUntil: 'networkidle2' });
      await takeScreenshot(page, '06-unit-plans');
      console.log('   ✅ Unit Plans page loaded');
    }

    // 8. Test Daybook
    console.log('\n6️⃣  Testing Daybook...');
    const daybookLink = navLinks.find(l => l.text.toLowerCase().includes('daybook'));
    if (daybookLink) {
      await page.goto(`http://localhost:5173${daybookLink.href}`, { waitUntil: 'networkidle2' });
      await takeScreenshot(page, '07-daybook');
      console.log('   ✅ Daybook page loaded');
    }

    // 9. Test Templates
    console.log('\n7️⃣  Testing Templates...');
    const templateLink = navLinks.find(l => l.text.toLowerCase().includes('template'));
    if (templateLink) {
      await page.goto(`http://localhost:5173${templateLink.href}`, { waitUntil: 'networkidle2' });
      await takeScreenshot(page, '08-templates');
      console.log('   ✅ Templates page loaded');
    }

    // 10. Test API endpoints
    console.log('\n8️⃣  Testing API Endpoints...');
    
    // Get auth token from localStorage
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
    });
    
    if (authToken) {
      console.log('   ✅ Auth token found in storage');
      
      // Test notifications API
      const notificationsResponse = await page.evaluate(async (token) => {
        try {
          const response = await fetch('http://localhost:3000/api/notifications', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          return {
            status: response.status,
            ok: response.ok,
            data: response.ok ? await response.json() : null
          };
        } catch (error) {
          return { error: error.message };
        }
      }, authToken);
      
      console.log('   Notifications API:', notificationsResponse.ok ? '✅ Working' : `❌ Failed (${notificationsResponse.status})`);
    } else {
      console.log('   ⚠️  No auth token found in storage');
    }

    console.log('\n✅ UI Test Complete! Check the screenshots directory for visual verification.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await takeScreenshot(page, 'error-state');
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will remain open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

// Run the test
testPerfectUI();