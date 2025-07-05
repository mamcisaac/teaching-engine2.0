/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Global Setup for Performance Testing
 * Initializes test environment and baseline measurements
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up performance testing environment...');

  // Ensure performance test directories exist
  const dirs = [
    'test-results/performance',
    'test-results/performance-artifacts',
    'test-results/visual/baseline',
    'test-results/visual/reports',
    'test-results/visual/diffs',
    'test-results/load-testing',
    'test-results/monitoring',
    'test-results/memory-tracking',
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  // Setup authentication for performance tests
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto('http://localhost:5173/login');

    // Login with test credentials
    await page.fill('[data-testid="email"]', 'teacher@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for login to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Save authentication state
    await page.context().storageState({
      path: 'test-results/performance-auth.json',
    });

    console.log('✅ Authentication state saved for performance tests');
  } catch (_error) {
    console.warn('⚠️ Could not setup authentication state:', error.message);
    // Continue without auth state - tests should handle this gracefully
  } finally {
    await browser.close();
  }

  // Create performance test configuration
  const performanceConfig = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
    },
    baselines: {
      created: new Date().toISOString(),
      version: '1.0.0',
    },
    thresholds: {
      responseTime: {
        fast: 500,
        acceptable: 1000,
        slow: 2000,
      },
      memoryUsage: {
        frontend: 150, // MB
        backend: 300, // MB
        database: 200, // MB
      },
      loadTesting: {
        minThroughput: 10, // requests/second
        maxErrorRate: 5, // percentage
      },
    },
  };

  await fs.writeFile(
    'test-results/performance/config.json',
    JSON.stringify(performanceConfig, null, 2),
  );

  // Initialize baseline measurements
  console.log('📊 Initializing baseline performance measurements...');

  const baseline = {
    timestamp: new Date().toISOString(),
    measurements: {
      serverStartupTime: await measureServerStartupTime(),
      initialMemoryUsage: process.memoryUsage(),
      databaseConnectionTime: await measureDatabaseConnection(),
    },
  };

  await fs.writeFile('test-results/performance/baseline.json', JSON.stringify(baseline, null, 2));

  console.log('✅ Performance testing environment setup complete');
}

async function measureServerStartupTime(): Promise<number> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // Try to connect to the development server
    const response = await fetch('http://localhost:3000/api/health', {
      signal: controller.signal,
    });

    if (response.ok) {
      clearTimeout(timeoutId);
      return Date.now() - startTime;
    }
  } catch (error: any) {
    console.warn('Could not measure server startup time:', error.message);
  } finally {
    clearTimeout(timeoutId);
  }

  return -1; // Indicates measurement failed
}

async function measureDatabaseConnection(): Promise<number> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // Try to connect to the database via API
    const response = await fetch('http://localhost:3000/api/curriculum-expectations?limit=1', {
      signal: controller.signal,
    });

    if (response.ok) {
      clearTimeout(timeoutId);
      return Date.now() - startTime;
    }
  } catch (error: any) {
    console.warn('Could not measure database connection time:', error.message);
  } finally {
    clearTimeout(timeoutId);
  }

  return -1; // Indicates measurement failed
}

export default globalSetup;
