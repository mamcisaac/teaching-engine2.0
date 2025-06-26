/**
 * Database-specific test helpers and utilities
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Database test utilities for managing test databases
 */
export class DatabaseTestHelper {
  private testDbPath: string;
  private isSetup = false;

  constructor(testName?: string) {
    const dbName = testName ? `test_${testName}_${Date.now()}.db` : `test_${Date.now()}.db`;
    this.testDbPath = path.join(process.cwd(), 'tests', 'temp', dbName);
  }

  /**
   * Sets up a fresh test database
   */
  async setup(): Promise<void> {
    if (this.isSetup) return;

    // Ensure temp directory exists
    const tempDir = path.dirname(this.testDbPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Set environment variable for this test
    process.env.DATABASE_URL = `file:${this.testDbPath}`;

    // Generate Prisma client if needed
    try {
      execSync('pnpm --filter @teaching-engine/database db:generate', {
        stdio: 'pipe',
        timeout: 30000,
        cwd: path.resolve(__dirname, '../../..'),
      });
    } catch (error) {
      console.warn('Failed to generate Prisma client:', error);
    }

    this.isSetup = true;
  }

  /**
   * Cleans up the test database
   */
  async cleanup(): Promise<void> {
    try {
      // Remove database files
      if (fs.existsSync(this.testDbPath)) {
        fs.unlinkSync(this.testDbPath);
      }
      
      // Remove WAL and SHM files
      const walPath = `${this.testDbPath}-wal`;
      const shmPath = `${this.testDbPath}-shm`;
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
    } catch (error) {
      console.warn('Database cleanup failed:', error);
    }
  }

  /**
   * Gets the database URL for this test
   */
  getDatabaseUrl(): string {
    return `file:${this.testDbPath}`;
  }

  /**
   * Resets the database to a clean state
   */
  async reset(): Promise<void> {
    await this.cleanup();
    this.isSetup = false;
    await this.setup();
  }
}

/**
 * Creates a database helper for testing
 */
export const createDatabaseHelper = (testName?: string) => {
  return new DatabaseTestHelper(testName);
};

/**
 * Manages multiple test databases for parallel test execution
 */
export class DatabasePool {
  private static instance: DatabasePool;
  private availableDatabases: string[] = [];
  private usedDatabases = new Set<string>();

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  /**
   * Gets an available database for testing
   */
  async acquireDatabase(): Promise<string> {
    // Create a new database for this test
    const dbName = `test_${Date.now()}_${Math.random().toString(36).substring(7)}.db`;
    const dbPath = path.join(process.cwd(), 'tests', 'temp', dbName);
    
    this.usedDatabases.add(dbPath);
    return `file:${dbPath}`;
  }

  /**
   * Releases a database back to the pool
   */
  async releaseDatabase(databaseUrl: string): Promise<void> {
    const dbPath = databaseUrl.replace('file:', '');
    this.usedDatabases.delete(dbPath);

    try {
      // Clean up the database file
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        
        // Clean up WAL and SHM files
        const walPath = `${dbPath}-wal`;
        const shmPath = `${dbPath}-shm`;
        if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
        if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
      }
    } catch (error) {
      console.warn(`Failed to clean up database ${dbPath}:`, error);
    }
  }

  /**
   * Cleans up all databases
   */
  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.usedDatabases).map(dbPath =>
      this.releaseDatabase(`file:${dbPath}`)
    );
    await Promise.all(cleanupPromises);
  }
}

/**
 * Sets up test database isolation for parallel testing
 */
export const setupTestDatabaseIsolation = async () => {
  const pool = DatabasePool.getInstance();
  const databaseUrl = await pool.acquireDatabase();
  
  // Set environment variable for this test worker
  process.env.DATABASE_URL = databaseUrl;

  return {
    databaseUrl,
    cleanup: () => pool.releaseDatabase(databaseUrl),
  };
};

/**
 * Mock database transaction helper
 */
export const createMockTransaction = () => {
  const mockClient = {
    // Add mock methods as needed
  };

  return {
    client: mockClient,
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
  };
};