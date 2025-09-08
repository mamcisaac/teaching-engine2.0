/**
 * Global setup for Playwright tests
 * Waits for backend to be ready before running tests
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

async function globalSetup() {
  console.log('🚀 Starting Playwright global setup...');
  
  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_SECRET = process.env.TEST_SECRET || 'test-secret-token';
  
  // Wait for backend to be ready
  await waitForBackend();
  
  console.log('✅ Global setup complete');
}

export default globalSetup;