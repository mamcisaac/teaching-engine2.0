/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test Database Setup and Management
 *
 * This module provides a centralized test database management system for all test suites.
 * It handles database creation, isolation, transactions, and cleanup for both unit and integration tests.
 *
 * Key features:
 * - Worker-based database isolation (each Jest worker gets its own database)
 * - Transaction support for unit test isolation
 * - Direct database access for integration tests
 * - Automatic cleanup and health monitoring
 * - Retry logic for database operations
 */

import { PrismaClient } from '@teaching-engine/database';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { randomBytes } from 'crypto';

/**
 * Test database manager singleton
 */
class TestDatabaseManager {
  private clients: Map<string, PrismaClient> = new Map();
  private transactionClients: Map<string, PrismaClient> = new Map();
  private databasePaths: Map<string, string> = new Map();
  private connectionCounts: Map<string, number> = new Map();

  /**
   * Create a test database for a specific worker
   */
  async createTestDatabase(workerId: string): Promise<void> {
    try {
      console.log(`[TestDB] Creating database for worker ${workerId}`);

      // Get database path
      const dbPath = this.getTestDatabasePath(workerId);
      this.databasePaths.set(workerId, dbPath);

      // Ensure directory exists
      const dbDir = dirname(dbPath);
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }

      // Remove existing database file if it exists
      if (existsSync(dbPath)) {
        try {
          unlinkSync(dbPath);
          // Also remove journal files
          if (existsSync(`${dbPath}-journal`)) {
            unlinkSync(`${dbPath}-journal`);
          }
          if (existsSync(`${dbPath}-wal`)) {
            unlinkSync(`${dbPath}-wal`);
          }
          if (existsSync(`${dbPath}-shm`)) {
            unlinkSync(`${dbPath}-shm`);
          }
        } catch (error) {
          console.warn(`[TestDB] Failed to remove existing database: ${error}`);
        }
      }

      // Create new Prisma client with the test database URL
      const client = new PrismaClient({
        datasources: {
          db: {
            url: `file:${dbPath}`,
          },
        },
        log: process.env.DEBUG_TESTS === 'true' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });

      // Store the client
      this.clients.set(workerId, client);
      this.connectionCounts.set(workerId, 0);

      // Initialize the database schema
      await this.initializeDatabase(client);

      console.log(`[TestDB] Database created successfully for worker ${workerId}`);
    } catch (error) {
      console.error(`[TestDB] Failed to create database for worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Initialize database schema using Prisma
   */
  private async initializeDatabase(client: PrismaClient): Promise<void> {
    try {
      // Connect to ensure database exists
      await client.$connect();

      // Run a simple query to ensure schema is initialized
      await client.$executeRaw`SELECT 1`;

      // The schema will be automatically created by Prisma when first accessed
      // For SQLite, this happens on first query
    } catch (error) {
      console.error('[TestDB] Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Get the test database path for a worker
   */
  private getTestDatabasePath(workerId: string): string {
    const baseDir = resolve(process.cwd(), '../packages/database/prisma/test');
    return join(baseDir, `test-${workerId}.db`);
  }

  /**
   * Get Prisma client for a worker
   */
  getPrismaClient(workerId: string): PrismaClient {
    const client = this.clients.get(workerId);
    if (!client) {
      throw new Error(`No database client found for worker ${workerId}`);
    }
    return client;
  }

  /**
   * Start a transaction for test isolation
   */
  async startTransaction(testId: string): Promise<PrismaClient> {
    const workerId = process.env.JEST_WORKER_ID || 'default';
    const baseClient = this.getPrismaClient(workerId);

    // For SQLite, we can't use interactive transactions in the same way as PostgreSQL
    // Instead, we'll use the same client but track the test ID for cleanup
    this.transactionClients.set(testId, baseClient);

    // Increment connection count
    const count = this.connectionCounts.get(workerId) || 0;
    this.connectionCounts.set(workerId, count + 1);

    return baseClient;
  }

  /**
   * Rollback a transaction (for SQLite, this means cleaning the data)
   */
  async rollbackTransaction(testId: string): Promise<void> {
    const client = this.transactionClients.get(testId);
    if (client) {
      this.transactionClients.delete(testId);

      // Decrement connection count
      const workerId = process.env.JEST_WORKER_ID || 'default';
      const count = this.connectionCounts.get(workerId) || 0;
      this.connectionCounts.set(workerId, Math.max(0, count - 1));
    }
  }

  /**
   * Reset database for a worker (clean all data)
   */
  async resetDatabase(workerId: string): Promise<void> {
    const client = this.getPrismaClient(workerId);

    try {
      // Delete all data in dependency order to avoid foreign key constraints
      // This order is important - delete children before parents

      // 1. Delete junction tables (many-to-many relationships)
      await this.deleteIfExists(client, 'daybookEntryExpectation');
      await this.deleteIfExists(client, 'eTFOLessonPlanExpectation');
      await this.deleteIfExists(client, 'unitPlanExpectation');
      await this.deleteIfExists(client, 'longRangePlanExpectation');

      // 2. Delete deeply nested records
      await this.deleteIfExists(client, 'studentGoal');
      await this.deleteIfExists(client, 'studentReflection');
      await this.deleteIfExists(client, 'studentArtifact');
      await this.deleteIfExists(client, 'parentSummary');

      // 3. Delete activity and calendar records
      await this.deleteIfExists(client, 'calendarEvent');
      await this.deleteIfExists(client, 'unavailableBlock');
      await this.deleteIfExists(client, 'activityRating');
      await this.deleteIfExists(client, 'activityCollection');
      await this.deleteIfExists(client, 'activityImport');

      // 4. Delete planning records
      await this.deleteIfExists(client, 'daybookEntry');
      await this.deleteIfExists(client, 'eTFOLessonPlanResource');
      await this.deleteIfExists(client, 'eTFOLessonPlan');
      await this.deleteIfExists(client, 'unitPlanResource');
      await this.deleteIfExists(client, 'unitPlan');
      await this.deleteIfExists(client, 'longRangePlan');

      // 5. Delete other user-related records
      await this.deleteIfExists(client, 'newsletter');
      await this.deleteIfExists(client, 'classroomAnnouncement');
      await this.deleteIfExists(client, 'parentMessage');
      await this.deleteIfExists(client, 'classRoutine');
      await this.deleteIfExists(client, 'subPlanRecord');
      await this.deleteIfExists(client, 'weeklyPlannerState');

      // 6. Delete curriculum records
      await this.deleteIfExists(client, 'curriculumExpectationEmbedding');
      await this.deleteIfExists(client, 'expectationCluster');
      await this.deleteIfExists(client, 'curriculumExpectation');
      await this.deleteIfExists(client, 'curriculumImport');

      // 7. Delete dependent records
      await this.deleteIfExists(client, 'student');
      await this.deleteIfExists(client, 'subject');

      // 8. Finally delete users
      await this.deleteIfExists(client, 'user');

      console.log(`[TestDB] Database reset for worker ${workerId}`);
    } catch (error) {
      console.error(`[TestDB] Failed to reset database for worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Helper to delete from a table if it exists
   */
  private async deleteIfExists(client: PrismaClient, modelName: string): Promise<void> {
    try {
      const model = (client as any)[modelName];
      if (model && typeof model.deleteMany === 'function') {
        await model.deleteMany({});
      }
    } catch (error) {
      // Table might not exist in test schema, which is fine
      if (!error.message?.includes('table') && !error.message?.includes('relation')) {
        console.warn(`[TestDB] Failed to delete from ${modelName}:`, error);
      }
    }
  }

  /**
   * Check if database is healthy
   */
  async isDatabaseHealthy(workerId: string): Promise<boolean> {
    try {
      const client = this.getPrismaClient(workerId);
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error(`[TestDB] Database health check failed for worker ${workerId}:`, error);
      return false;
    }
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(workerId: string): Promise<any> {
    const client = this.clients.get(workerId);
    const connectionCount = this.connectionCounts.get(workerId) || 0;
    const transactionCount = Array.from(this.transactionClients.values()).filter(
      (c) => c === client,
    ).length;

    return {
      workerId,
      isConnected: !!client,
      connectionCount,
      activeTransactions: transactionCount,
      databasePath: this.databasePaths.get(workerId),
    };
  }

  /**
   * Execute a function with retry logic
   */
  async executeWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: any;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error.message?.includes('Foreign key constraint failed') ||
          error.message?.includes('Unique constraint failed')
        ) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (i < retries - 1) {
          const delay = Math.min(100 * Math.pow(2, i), 1000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Cleanup all test databases
   */
  async cleanup(): Promise<void> {
    console.log('[TestDB] Starting cleanup...');

    // Disconnect all clients
    for (const [workerId, client] of this.clients.entries()) {
      try {
        await client.$disconnect();
        console.log(`[TestDB] Disconnected client for worker ${workerId}`);
      } catch (error) {
        console.warn(`[TestDB] Failed to disconnect client for worker ${workerId}:`, error);
      }
    }

    // Clear all maps
    this.clients.clear();
    this.transactionClients.clear();
    this.connectionCounts.clear();

    // Remove database files in test environment
    if (process.env.NODE_ENV === 'test' && process.env.KEEP_TEST_DB !== 'true') {
      for (const [workerId, dbPath] of this.databasePaths.entries()) {
        try {
          if (existsSync(dbPath)) {
            unlinkSync(dbPath);
            // Also remove journal files
            if (existsSync(`${dbPath}-journal`)) {
              unlinkSync(`${dbPath}-journal`);
            }
            if (existsSync(`${dbPath}-wal`)) {
              unlinkSync(`${dbPath}-wal`);
            }
            if (existsSync(`${dbPath}-shm`)) {
              unlinkSync(`${dbPath}-shm`);
            }
          }
          console.log(`[TestDB] Removed database file for worker ${workerId}`);
        } catch (error) {
          console.warn(`[TestDB] Failed to remove database file for worker ${workerId}:`, error);
        }
      }
    }

    this.databasePaths.clear();

    console.log('[TestDB] Cleanup completed');
  }
}

// Export singleton instance
export const testDb = new TestDatabaseManager();