/**
 * Real UI-driven authentication setup for E2E tests
 * Uses actual login form instead of test endpoints
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
  
  // Add 5xx fail-fast
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
    
    // Fill in Emily's real credentials
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password|mot de passe/i);
    const loginButton = page.getByRole('button', { name: /sign in|se connecter|login/i });
    
    await emailInput.fill('emily@etfo.ca');
    await passwordInput.fill('etfo2024!Demo');
    
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