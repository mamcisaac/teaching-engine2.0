#!/usr/bin/env node

/**
 * Test database setup script
 * Ensures test database is properly initialized before E2E tests run
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(__dirname, '../../packages/database/prisma/test.db');
const testDbDir = path.dirname(testDbPath);

console.log('🗄️  Setting up test database...');

// Ensure directory exists
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}

// Remove old test database if exists
if (fs.existsSync(testDbPath)) {
  console.log('Removing old test database...');
  fs.unlinkSync(testDbPath);
  // Also remove journal files
  const journalPath = `${testDbPath}-journal`;
  if (fs.existsSync(journalPath)) {
    fs.unlinkSync(journalPath);
  }
}

// Set environment for test database
process.env.DATABASE_URL = `file:${testDbPath}`;

try {
  // Push schema to test database
  console.log('Creating test database schema...');
  execSync('pnpm --filter @teaching-engine/database db:push --skip-generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: `file:${testDbPath}`,
    },
  });

  // Seed test database
  console.log('Seeding test database...');
  execSync('pnpm --filter @teaching-engine/database db:seed', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: `file:${testDbPath}`,
    },
  });

  console.log('✅ Test database setup complete!');
  console.log(`Database location: ${testDbPath}`);
} catch (error) {
  console.error('❌ Test database setup failed:', error);
  process.exit(1);
}
