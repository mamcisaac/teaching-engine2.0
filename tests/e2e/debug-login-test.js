/**
 * Debug Login Test - Figure out what's happening with authentication
 */

const puppeteer = require('puppeteer');

async function debugLogin() {
  console.log('🔍 Debug Login Test Starting...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable request/response logging
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('📤 Request:', request.method(), request.url());
        if (request.method() === 'POST') {
          console.log('   Body:', request.postData());
        }
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log('📥 Response:', response.status(), response.url());
      }
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Console Error:', msg.text());
      }
    });
    
    // Test direct API login first
    console.log('1️⃣ Testing direct API login...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:5173/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'emily.mcisaac@teachingengine.test',
            password: 'TeachingGrade1!'
          })
        });
        
        const data = await response.json();
        return {
          status: response.status,
          ok: response.ok,
          data: data
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('   API Response:', apiResponse);
    
    // Now test UI login
    console.log('\n2️⃣ Testing UI login...');
    await page.goto('http://localhost:5173/login', {
      waitUntil: 'networkidle0'
    });
    
    // Take screenshot of login page
    await page.screenshot({ path: 'screenshots/login-page.png' });
    console.log('   📸 Screenshot saved: screenshots/login-page.png');
    
    // Check what's on the page
    const pageContent = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input');
      const buttons = document.querySelectorAll('button');
      
      return {
        forms: forms.length,
        inputs: Array.from(inputs).map(i => ({
          type: i.type,
          name: i.name,
          id: i.id,
          placeholder: i.placeholder,
          testId: i.getAttribute('data-testid')
        })),
        buttons: Array.from(buttons).map(b => ({
          type: b.type,
          text: b.textContent,
          testId: b.getAttribute('data-testid')
        }))
      };
    });
    
    console.log('   Page structure:', JSON.stringify(pageContent, null, 2));
    
    // Try to find and fill form
    const emailInput = await page.$('input[type="email"]') || 
                       await page.$('input[name="email"]') ||
                       await page.$('#email');
    
    const passwordInput = await page.$('input[type="password"]') || 
                          await page.$('input[name="password"]') ||
                          await page.$('#password');
    
    if (emailInput && passwordInput) {
      console.log('\n3️⃣ Filling form...');
      await emailInput.type('emily.mcisaac@teachingengine.test');
      await passwordInput.type('TeachingGrade1!');
      
      // Find submit button
      const submitButton = await page.$('button[type="submit"]') ||
                          await page.$('button:has-text("Login")') ||
                          await page.$('button:has-text("Sign in")');
      
      if (submitButton) {
        console.log('   Clicking submit...');
        
        // Wait for navigation or error
        const navigationPromise = page.waitForNavigation({ 
          waitUntil: 'networkidle0',
          timeout: 5000 
        }).catch(e => console.log('   Navigation timeout'));
        
        await submitButton.click();
        await navigationPromise;
        
        // Check where we ended up
        const currentUrl = page.url();
        console.log('   Current URL:', currentUrl);
        
        if (!currentUrl.includes('/login')) {
          console.log('   ✅ Login successful!');
          
          // Take screenshot of dashboard
          await page.screenshot({ path: 'screenshots/dashboard.png' });
          console.log('   📸 Dashboard screenshot: screenshots/dashboard.png');
        } else {
          console.log('   ❌ Still on login page');
          
          // Check for error messages
          const errorText = await page.evaluate(() => {
            const alerts = document.querySelectorAll('.alert, .error, [role="alert"]');
            return Array.from(alerts).map(a => a.textContent);
          });
          
          if (errorText.length > 0) {
            console.log('   Error messages:', errorText);
          }
        }
      } else {
        console.log('   ❌ No submit button found');
      }
    } else {
      console.log('   ❌ Form inputs not found');
    }
    
    console.log('\n✅ Debug test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
debugLogin().catch(console.error);