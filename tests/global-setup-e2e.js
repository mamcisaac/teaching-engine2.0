/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const { chromium } = require('@playwright/test');
const { TestServer } = require('./test-server.cjs');

/**
 * Wait for server to be ready with exponential backoff
 */
async function waitForServer(url, maxRetries = 30) {
  console.log(`Waiting for server at ${url} to be ready...`);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'healthy') {
          console.log('✅ Server is ready!');
          return;
        }
      }
    } catch (error) {
      // Server not ready yet
    }
    
    const delay = Math.min(1000 * Math.pow(1.5, i), 5000); // Exponential backoff, max 5s
    console.log(`Server not ready, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error(`Server failed to start after ${maxRetries} attempts`);
}

/**
 * Create E2E test users via API
 */
async function createE2ETestUsers(serverUrl) {
  console.log('Creating E2E test users...');
  
  // Default test user for E2E tests
  const testUser = {
    email: 'teacher@example.com',
    password: 'password123',
    name: 'Test Teacher',
    role: 'teacher'
  };

  try {
    // First, try to create the user via test endpoint
    const createResponse = await fetch(`${serverUrl}/api/test/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (!createResponse.ok) {
      // If user already exists, that's fine
      const error = await createResponse.text();
      if (!error.includes('already exists')) {
        throw new Error(`Failed to create test user: ${error}`);
      }
      console.log('Test user already exists, continuing...');
    } else {
      console.log('✅ Test user created successfully');
    }

    // Now login to get a token
    const loginResponse = await fetch(`${serverUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Failed to login test user: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    
    // Store test user info globally
    global.__E2E_TEST_USER__ = {
      email: testUser.email,
      password: testUser.password,
      token: loginData.token,
    };

    console.log('✅ Test user logged in successfully');
  } catch (error) {
    console.error('Failed to create E2E test users:', error);
    throw error;
  }
}

/**
 * Global setup for E2E tests
 */
module.exports = async function globalSetup() {
  console.log('\n🚀 Starting E2E global setup...\n');
  
  const path = require('path');
  const fs = require('fs');
  
  try {
    // Set up test database first
    console.log('📁 Setting up test database...');
    const { execSync } = require('child_process');
    
    // Use absolute path for database
    const dbPath = path.join(process.cwd(), 'server', 'test-e2e.db');
    const dbDir = path.dirname(dbPath);
    
    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Remove existing test database if it exists
    if (fs.existsSync(dbPath)) {
      console.log('Removing existing test database...');
      fs.unlinkSync(dbPath);
    }
    
    process.env.DATABASE_URL = `file:${dbPath}`;
    console.log(`Database URL: ${process.env.DATABASE_URL}`);
    
    // Run database setup with proper error handling
    try {
      execSync('pnpm --filter @teaching-engine/database db:push --force-reset', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL
        }
      });
      console.log('✅ Test database ready');
    } catch (dbError) {
      console.error('Failed to set up database:', dbError);
      throw new Error(`Database setup failed: ${dbError.message}`);
    }

    // Start test server
    console.log('🔧 Starting test server...');
    const testServer = new TestServer();
    
    // Start server with dynamic port
    await testServer.start();
    const serverUrl = testServer.getBaseUrl();
    
    // Store server reference globally
    global.__TEST_SERVER__ = testServer;
    global.__TEST_SERVER_URL__ = serverUrl;
    
    // Also set as environment variable for tests
    process.env.API_BASE = serverUrl;
    process.env.TEST_SERVER_URL = serverUrl;
    
    console.log(`✅ Test server running at: ${serverUrl}`);
    
    // Wait for server to be fully ready with extended timeout
    console.log('Waiting for server to be ready...');
    await waitForServer(serverUrl, 60); // 60 retries = 5 minutes max
    
    // Create test users with retry logic
    let userCreated = false;
    let retries = 3;
    while (!userCreated && retries > 0) {
      try {
        await createE2ETestUsers(serverUrl);
        userCreated = true;
      } catch (error) {
        console.error(`Failed to create test users (retries left: ${retries - 1}):`, error);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }
    
    // Set up authentication state for Playwright
    console.log('Setting up authentication state...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Navigate to the app with retry logic
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      let pageLoaded = false;
      let pageRetries = 3;
      
      while (!pageLoaded && pageRetries > 0) {
        try {
          console.log(`Navigating to ${clientUrl}...`);
          await page.goto(clientUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
          });
          pageLoaded = true;
        } catch (navError) {
          console.error(`Failed to navigate to client (retries left: ${pageRetries - 1}):`, navError);
          pageRetries--;
          if (pageRetries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw navError;
          }
        }
      }
      
      // Set authentication data in localStorage
      console.log('Setting authentication data in localStorage...');
      await page.evaluate((userData) => {
        // Clear any existing auth data
        window.localStorage.clear();
        
        // Set new auth data
        window.localStorage.setItem('token', userData.token);
        window.localStorage.setItem('auth-token', userData.token);
        window.localStorage.setItem('user', JSON.stringify({
          email: userData.email,
          name: 'E2E Test Teacher',
          role: 'teacher'
        }));
        window.localStorage.setItem('onboarded', 'true');
        
        // Debug: log what was set
        console.log('Auth data set:', {
          token: window.localStorage.getItem('token'),
          authToken: window.localStorage.getItem('auth-token'),
          user: window.localStorage.getItem('user'),
          onboarded: window.localStorage.getItem('onboarded')
        });
      }, global.__E2E_TEST_USER__);
      
      // Ensure storage directory exists
      const storageDir = path.join(process.cwd(), 'tests', 'storage');
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      
      // Save the authentication state
      const authPath = path.join(storageDir, 'auth.json');
      await context.storageState({ path: authPath });
      console.log(`✅ Authentication state saved to ${authPath}`);
      
    } finally {
      await browser.close();
    }
    
    console.log('\n✅ E2E global setup complete\n');
    console.log('Test environment details:');
    console.log(`  - Server URL: ${serverUrl}`);
    console.log(`  - Database: ${process.env.DATABASE_URL}`);
    console.log(`  - Test user: ${global.__E2E_TEST_USER__.email}`);
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ E2E global setup failed:', error);
    console.error('Stack trace:', error.stack);
    
    // Clean up on failure
    if (global.__TEST_SERVER__) {
      console.log('Cleaning up test server...');
      await global.__TEST_SERVER__.stop();
    }
    
    throw error;
  }
};