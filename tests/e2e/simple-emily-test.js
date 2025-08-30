/**
 * Simple Emily Test - Basic connectivity verification
 */

const puppeteer = require('puppeteer');

async function runSimpleTest() {
  console.log('🚀 Starting Simple Emily Test');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Test 1: Server health check
    console.log('📋 Test 1: Server Health Check');
    const response = await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    if (response.ok()) {
      console.log('  ✅ Server is responding');
    } else {
      console.log('  ❌ Server returned status:', response.status());
    }
    
    // Test 2: Login page exists
    console.log('📋 Test 2: Login Page');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    // Check for login form elements
    const emailInput = await page.$('[data-testid="email-input"]') || await page.$('input[type="email"]') || await page.$('input[name="email"]');
    const passwordInput = await page.$('[data-testid="password-input"]') || await page.$('input[type="password"]') || await page.$('input[name="password"]');
    const submitButton = await page.$('[data-testid="login-submit"]') || await page.$('button[type="submit"]');
    
    if (emailInput && passwordInput && submitButton) {
      console.log('  ✅ Login form found');
    } else {
      console.log('  ❌ Login form elements missing');
      console.log('    Email input:', !!emailInput);
      console.log('    Password input:', !!passwordInput);
      console.log('    Submit button:', !!submitButton);
    }
    
    // Test 3: Try to login
    console.log('📋 Test 3: Authentication');
    
    if (emailInput && passwordInput && submitButton) {
      await emailInput.type('emily.mcisaac@teachingengine.test');
      await passwordInput.type('TeachingGrade1!');
      
      // Click submit and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Navigation timeout')),
        submitButton.click()
      ]);
      
      // Check if we're logged in
      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        console.log('  ✅ Login successful, redirected to:', currentUrl);
      } else {
        console.log('  ❌ Still on login page');
        
        // Check for error messages
        const errorMessage = await page.$('.error-message, .alert-danger, [role="alert"]');
        if (errorMessage) {
          const errorText = await errorMessage.textContent();
          console.log('    Error:', errorText);
        }
      }
    } else {
      console.log('  ⚠️ Cannot test login - form elements not found');
    }
    
    // Test 4: Check for dashboard
    console.log('📋 Test 4: Dashboard Access');
    const dashboard = await page.$('[data-testid="dashboard"], .dashboard, main');
    if (dashboard) {
      console.log('  ✅ Dashboard element found');
    } else {
      console.log('  ❌ Dashboard not found');
    }
    
    console.log('\n✅ Simple test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runSimpleTest().catch(console.error);