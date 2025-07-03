/**
 * Global setup for visual regression tests
 * Ensures consistent test environment for screenshot comparisons
 */

import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

async function globalSetup(config: FullConfig) {
  console.log('🎨 Preparing visual regression test environment...');

  // Create necessary directories
  const visualTestDirs = [
    'visual-test-results',
    'visual-test-results/artifacts',
    'tests/visual/__screenshots__',
  ];

  for (const dir of visualTestDirs) {
    await fs.mkdir(path.join(config.rootDir, dir), { recursive: true });
  }

  // Ensure test database exists
  if (process.env.NODE_ENV === 'test') {
    try {
      console.log('📊 Setting up test database...');
      execSync('pnpm --filter @teaching-engine/database db:push --skip-generate', {
        cwd: config.rootDir,
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Failed to setup test database:', error);
    }
  }

  // Set consistent environment variables for visual tests
  process.env.TZ = 'America/Toronto';
  process.env.LANG = 'en_CA.UTF-8';
  process.env.VISUAL_TESTING = 'true';
  process.env.DISABLE_ANIMATIONS = 'true';

  console.log('✅ Visual test environment ready');
}

export default globalSetup;
