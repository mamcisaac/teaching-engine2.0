#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

// Ensure the database directory exists
const dbPath = join(process.cwd(), 'packages', 'database', 'prisma', 'test.db');
const dbDir = dirname(dbPath);

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
  console.log(`Created directory: ${dbDir}`);
}

// Set environment variables for test
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = `file:${dbPath}`;

console.log(`Setting up E2E test database at: ${dbPath}`);

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('pnpm db:generate', { stdio: 'inherit' });
  
  // Run migrations to create the database
  console.log('Running migrations...');
  execSync('pnpm db:push', { stdio: 'inherit' });
  
  // Seed the database with test data
  console.log('Seeding test data...');
  execSync('pnpm db:seed:test', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: `file:${dbPath}` }
  });
  
  console.log('E2E database setup complete!');
} catch (error) {
  console.error('Failed to setup E2E database:', error);
  process.exit(1);
}