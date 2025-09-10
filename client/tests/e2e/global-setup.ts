/**
 * Global setup for Playwright tests
 * Uses real UI login instead of test endpoints
 */

import { chromium, FullConfig } from '@playwright/test';

async function waitForBackend(): Promise<void> {
  console.log('⏳ Waiting for backend to be ready...');
  
  const maxAttempts = 30;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    try {
      const response = await fetch('http://localhost:3000/readyz');
      const data = await response.json();
      
      if (response.ok && data.status === 'ok') {
        console.log('✅ Backend is ready!');
        console.log('  Database:', data.db);
        console.log('  Cache:', data.cache);
        return;
      }
      
      console.log(`⏳ Backend not ready yet (${attempt + 1}/${maxAttempts}): ${data.status}`);
    } catch (error) {
      console.log(`⏳ Backend not reachable yet (${attempt + 1}/${maxAttempts})`);
    }
    
    attempt++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('❌ Backend failed to become ready after 30 seconds');
}

async function realUILogin(): Promise<void> {
  console.log('🔐 Creating authenticated state via real UI login...');
  
  const browser = await chromium.launch({
    headless: process.env.CI === 'true'
  });
  
  const context = await browser.newContext({
    timezoneId: 'America/Halifax',
    ignoreHTTPSErrors: true,
  });
  
  const page = await context.newPage();
  
  // Add 5xx fail-fast to catch server errors early
  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    if (url.includes('/api/') && status >= 500) {
      throw new Error(`5xx from ${url} → ${status}`);
    }
  });
  
  try {
    // Navigate to login page
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in Emily's real credentials using multiple selector strategies
    const emailInput = page.locator('input[type="email"], input[name="email"], input#email, [data-testid="email-input"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"], input#password, [data-testid="password-input"]').first();
    const loginButton = page.locator('button[type="submit"], [data-testid="login-submit"]').first();
    
    await emailInput.fill('emmcisaac@gmail.com');
    await passwordInput.fill('myhusbandisthebest');
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForURL(/planner\/(week|today|dashboard)/, { timeout: 15000 }),
      loginButton.click()
    ]);
    
    console.log('✅ Login successful! Now on:', page.url());
    
    // Save the storage state for authenticated tests
    await context.storageState({ path: 'tests/e2e/auth.json' });
    console.log('✅ Auth state saved to tests/e2e/auth.json');
    
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup (real UI auth)...');
  console.log('🌎 Timezone: America/Halifax');
  
  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.TZ = 'America/Halifax';
  
  // Wait for backend to be ready
  await waitForBackend();
  
  // Create authenticated state via real UI login
  await realUILogin();
  
  console.log('✅ Global setup complete');
}

export default globalSetup;