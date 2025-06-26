const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`✅ Server is ready at ${url}`);
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    console.log(`⏳ Waiting for server... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function main() {
  console.log('Starting servers...');
  
  // Start the dev servers
  const devProcess = spawn('pnpm', ['run', 'dev'], {
    cwd: '/Users/michaelmcisaac/GitHub/teaching-engine2.0',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  devProcess.stdout.on('data', (data) => {
    console.log(`[DEV] ${data.toString().trim()}`);
  });

  devProcess.stderr.on('data', (data) => {
    console.error(`[DEV ERROR] ${data.toString().trim()}`);
  });

  // Wait for both servers to be ready
  console.log('Waiting for servers to start...');
  const frontendReady = await waitForServer('http://localhost:5173');
  const backendReady = await waitForServer('http://localhost:3000/api/health');

  if (!frontendReady || !backendReady) {
    console.error('❌ Servers failed to start');
    devProcess.kill();
    process.exit(1);
  }

  console.log('✅ Both servers are ready!');

  // Launch browser
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      const text = msg.text();
      if (!text.includes('Download the React DevTools') && !text.includes('React Router Future Flag Warning')) {
        console.log('[BROWSER]', text);
      }
    });
    
    page.on('pageerror', error => console.error('[BROWSER ERROR]', error.message));

    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    console.log('✅ Page loaded successfully!');
    
    // Take a screenshot
    await page.screenshot({ path: 'login-page.png' });
    console.log('📸 Screenshot saved as login-page.png');

    // Wait for login form
    console.log('Waiting for login form...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    console.log('✅ Login form found!');

    // Fill credentials
    console.log('Entering credentials...');
    await page.type('input[type="email"]', 'teacher@example.com');
    await page.type('input[type="password"]', 'Password123!');
    
    // Take screenshot before login
    await page.screenshot({ path: 'before-login.png' });
    console.log('📸 Screenshot saved as before-login.png');

    // Click login button
    console.log('Clicking login button...');
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    console.log('Waiting for login result...');
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.waitForSelector('.error', { timeout: 5000 }).catch(() => null)
    ]);

    // Check result
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/planner/dashboard')) {
      console.log('✅ LOGIN SUCCESSFUL! Redirected to dashboard.');
      await page.screenshot({ path: 'dashboard.png' });
      console.log('📸 Dashboard screenshot saved as dashboard.png');
    } else if (currentUrl.includes('/login')) {
      const errorElement = await page.$('.error, [role="alert"]');
      if (errorElement) {
        const errorText = await errorElement.evaluate(el => el.textContent);
        console.log('❌ Login failed with error:', errorText);
      } else {
        console.log('❌ Still on login page, but no error shown');
      }
    }

    console.log('\n✅ Test completed! Browser will remain open.');
    console.log('Press Ctrl+C to close everything.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await browser.close();
    devProcess.kill();
    process.exit(1);
  }

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\nCleaning up...');
    browser.close();
    devProcess.kill();
    process.exit(0);
  });
}

main().catch(console.error);