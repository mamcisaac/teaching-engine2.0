import { execSync } from 'child_process';
import { chromium } from '@playwright/test';

/**
 * Global setup for Playwright tests.
 * 1. Ensures Playwright browsers are installed
 * 2. Sets up test database
 * 3. Seeds test data if needed
 */
export default async function globalSetup(): Promise<void> {
  try {
    // Install Playwright browsers
    console.log('Installing Playwright browsers...');
    execSync('pnpm exec playwright install --with-deps', { stdio: 'inherit' });

    // Set up test database
    console.log('Setting up test database...');
    const dbUrl = process.env.DATABASE_URL || 'file:./packages/database/prisma/test.db';
    process.env.DATABASE_URL = dbUrl;
    console.log(`Using DATABASE_URL: ${dbUrl}`);

    execSync('pnpm db:generate', { stdio: 'inherit' });
    execSync('pnpm db:push --force-reset', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    execSync('pnpm --filter @teaching-engine/database db:seed', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl },
    });

    // Create a new browser context to ensure everything works
    console.log('Verifying browser setup...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.close();
    await browser.close();

    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
}
