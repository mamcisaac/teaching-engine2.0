#!/usr/bin/env tsx

/**
 * Script to properly set up integration test database
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
  console.log('🔧 Setting up integration test database...');

  // Set test database URL
  const testDbPath = resolve(__dirname, '../../packages/database/prisma/test-integration.db');
  const testDbUrl = `file:${testDbPath}`;
  process.env.DATABASE_URL = testDbUrl;

  // Ensure directory exists
  const dbDir = resolve(__dirname, '../../packages/database/prisma');
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  // Remove existing test database if it exists
  if (existsSync(testDbPath)) {
    console.log('🗑️  Removing existing test database...');
    rmSync(testDbPath);
    rmSync(`${testDbPath}-journal`, { force: true });
  }

  // Generate Prisma client
  console.log('🏗️  Generating Prisma client...');
  execSync('pnpm --filter @teaching-engine/database db:generate', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '../..'),
  });

  // Push database schema
  console.log('📊 Pushing database schema...');
  execSync('pnpm --filter @teaching-engine/database db:push', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '../..'),
    env: { ...process.env, DATABASE_URL: testDbUrl },
  });

  // Seed with minimal test data
  console.log('🌱 Seeding test database...');
  execSync('pnpm --filter @teaching-engine/database db:seed', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '../..'),
    env: { ...process.env, DATABASE_URL: testDbUrl },
  });

  console.log('✅ Integration test database setup complete!');
  console.log(`📍 Database location: ${testDbPath}`);
};

main().catch((error) => {
  console.error('❌ Error setting up test database:', error);
  process.exit(1);
});