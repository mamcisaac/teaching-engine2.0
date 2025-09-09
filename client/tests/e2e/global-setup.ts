/**
 * Global setup for Playwright tests
 * Waits for backend to be ready and creates authenticated state
 */

import { chromium, FullConfig } from '@playwright/test';

const TEST_SECRET = process.env.TEST_SECRET || 'secret';

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

async function createAuthState(): Promise<void> {
  console.log('🔐 Creating authenticated state...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Use test login endpoint to get auth cookie
    // Login as Emily (userId: 23) for read-only tests
    const response = await page.request.post('http://localhost:3000/__test__/login', {
      headers: { 
        'X-Test-Token': TEST_SECRET,
        'Content-Type': 'application/json'
      },
      data: {
        userId: 23  // Emily's userId for read-only tests
      }
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to login: ${response.status()} ${response.statusText()}`);
    }
    
    // Navigate to verify auth works
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Verify we're not on login page
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Authentication failed - redirected to login page');
    }
    
    // Save the storage state for authenticated tests
    await context.storageState({ path: 'tests/e2e/auth.json' });
    console.log('✅ Auth state saved to tests/e2e/auth.json');
    
  } finally {
    await context.close();
    await browser.close();
  }
}

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright global setup...');
  
  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_SECRET = process.env.TEST_SECRET || 'secret';
  
  // Wait for backend to be ready
  await waitForBackend();
  
  // Create authenticated state for tests
  await createAuthState();
  
  console.log('✅ Global setup complete');
}

export default globalSetup;