/**
 * Global database setup for integration tests
 * Runs once before all integration tests
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function globalSetup() {
  // Set test database URL
  process.env.DATABASE_URL = 'file:./test-integration.db';
  process.env.NODE_ENV = 'test';
  
  // Ensure the database directory exists
  const dbPath = path.join(process.cwd(), 'test-integration.db');
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Remove existing test database
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  if (fs.existsSync(`${dbPath}-journal`)) {
    fs.unlinkSync(`${dbPath}-journal`);
  }
  
  try {
    // Generate Prisma client if needed
    execSync('pnpm --filter @teaching-engine/database db:generate', { stdio: 'pipe' });
    
    // Apply migrations
    execSync('pnpm --filter @teaching-engine/database db:push', { stdio: 'pipe' });
    
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}