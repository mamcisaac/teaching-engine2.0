/**
 * Real Test Database Configuration
 * Implements TDD requirements by using actual databases for all tests
 * 
 * Test Types:
 * - Unit Tests: SQLite in-memory for speed with real Prisma client
 * - Integration Tests: SQLite file-based or PostgreSQL based on environment
 * - E2E Tests: PostgreSQL to match production
 */

import { PrismaClient } from '@teaching-engine/database';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { mkdirSync, existsSync, rmSync } from 'fs';
import { randomBytes } from 'crypto';

export type TestDatabaseType = 'sqlite-memory' | 'sqlite-file' | 'postgresql';

interface TestDatabaseConfig {
  type: TestDatabaseType;
  url?: string;
  schemaPath?: string;
}

export class RealTestDatabase {
  private clients: Map<string, PrismaClient> = new Map();
  private config: TestDatabaseConfig;
  private databasePath: string;

  constructor(config?: Partial<TestDatabaseConfig>) {
    this.config = {
      type: this.determineTestDatabaseType(),
      schemaPath: resolve(process.cwd(), '..', 'packages', 'database', 'prisma', 'schema.prisma'),
      ...config,
    };
    
    this.databasePath = resolve(process.cwd(), '..', 'packages', 'database');
  }

  /**
   * Determine the appropriate database type based on test context
   */
  private determineTestDatabaseType(): TestDatabaseType {
    const testType = process.env.TEST_TYPE;
    const usePostgres = process.env.TEST_DATABASE === 'postgresql';

    if (usePostgres) {
      return 'postgresql';
    }

    switch (testType) {
      case 'unit':
        return 'sqlite-memory';
      case 'integration':
        return process.env.CI ? 'postgresql' : 'sqlite-file';
      case 'e2e':
      case 'performance':
      case 'security':
        return 'postgresql';
      default:
        return 'sqlite-memory';
    }
  }

  /**
   * Create a unique database URL based on configuration
   */
  private getDatabaseUrl(workerId: string): string {
    switch (this.config.type) {
      case 'sqlite-memory':
        // In-memory SQLite for fast unit tests
        return 'file::memory:?cache=shared';
      
      case 'sqlite-file':
        // File-based SQLite for integration tests
        const dbPath = resolve(process.cwd(), 'tests', 'databases', `test-${workerId}.db`);
        this.ensureDirectory(resolve(process.cwd(), 'tests', 'databases'));
        return `file:${dbPath}`;
      
      case 'postgresql':
        // PostgreSQL for production-like testing
        const baseUrl = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432';
        const dbName = `test_${workerId}_${randomBytes(4).toString('hex')}`;
        return `${baseUrl}/${dbName}`;
      
      default:
        throw new Error(`Unknown database type: ${this.config.type}`);
    }
  }

  /**
   * Initialize a test database for a specific worker/test
   */
  async initialize(workerId: string): Promise<PrismaClient> {
    const databaseUrl = this.config.url || this.getDatabaseUrl(workerId);
    
    // Create PostgreSQL database if needed
    if (this.config.type === 'postgresql') {
      await this.createPostgreSQLDatabase(databaseUrl);
    }

    // Create Prisma client with real database connection
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: process.env.DEBUG_TESTS === 'true' ? ['query', 'info', 'warn', 'error'] : [],
    });

    // Apply schema to the database
    await this.applySchema(databaseUrl);

    // Connect and verify
    await client.$connect();
    await client.$queryRaw`SELECT 1`;

    this.clients.set(workerId, client);
    return client;
  }

  /**
   * Apply Prisma schema to the test database
   */
  private async applySchema(databaseUrl: string): Promise<void> {
    try {
      execSync('npx prisma db push --skip-generate', {
        stdio: process.env.DEBUG_TESTS === 'true' ? 'inherit' : 'pipe',
        cwd: this.databasePath,
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    } catch (error: any) {
      console.error('Failed to apply schema:', error.message);
      throw new Error(`Schema application failed: ${error.message}`);
    }
  }

  /**
   * Create PostgreSQL database if it doesn't exist
   */
  private async createPostgreSQLDatabase(databaseUrl: string): Promise<void> {
    const urlParts = databaseUrl.split('/');
    const dbName = urlParts.pop();
    const baseUrl = urlParts.join('/');

    try {
      // Connect to postgres database to create test database
      const adminClient = new PrismaClient({
        datasources: {
          db: {
            url: `${baseUrl}/postgres`,
          },
        },
      });

      await adminClient.$connect();
      await adminClient.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
      await adminClient.$disconnect();
    } catch (error: any) {
      // Database might already exist, which is fine
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  /**
   * Get or create a Prisma client for a worker
   */
  async getClient(workerId: string): Promise<PrismaClient> {
    let client = this.clients.get(workerId);
    if (!client) {
      client = await this.initialize(workerId);
    }
    return client;
  }

  /**
   * Clean all data from database (maintains schema)
   */
  async cleanData(workerId: string): Promise<void> {
    const client = await this.getClient(workerId);

    // Get all table names (excluding system tables)
    const tables = await this.getTableNames(client);

    // Disable foreign key constraints temporarily
    await this.setForeignKeyConstraints(client, false);

    try {
      // Clear all tables in reverse dependency order
      for (const table of tables.reverse()) {
        await client.$executeRawUnsafe(`DELETE FROM "${table}"`);
      }

      // Reset sequences/auto-increment
      if (this.config.type === 'postgresql') {
        for (const table of tables) {
          await client.$executeRawUnsafe(
            `ALTER SEQUENCE IF EXISTS "${table}_id_seq" RESTART WITH 1`
          );
        }
      }
    } finally {
      // Re-enable foreign key constraints
      await this.setForeignKeyConstraints(client, true);
    }
  }

  /**
   * Get all user table names from the database
   */
  private async getTableNames(client: PrismaClient): Promise<string[]> {
    if (this.config.type === 'postgresql') {
      const result = await client.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE '_prisma%'
        ORDER BY tablename
      `;
      return result.map(r => r.tablename);
    } else {
      const result = await client.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master 
        WHERE type = 'table' 
        AND name NOT LIKE 'sqlite_%' 
        AND name NOT LIKE '_prisma%'
        ORDER BY name
      `;
      return result.map(r => r.name);
    }
  }

  /**
   * Enable/disable foreign key constraints
   */
  private async setForeignKeyConstraints(client: PrismaClient, enabled: boolean): Promise<void> {
    if (this.config.type === 'postgresql') {
      await client.$executeRawUnsafe(
        `SET session_replication_role = ${enabled ? 'origin' : 'replica'}`
      );
    } else {
      await client.$executeRawUnsafe(`PRAGMA foreign_keys = ${enabled ? 'ON' : 'OFF'}`);
    }
  }

  /**
   * Seed test data with proper relationships
   */
  async seedTestData(workerId: string, data?: SeedData): Promise<SeededData> {
    const client = await this.getClient(workerId);
    const seeded: SeededData = {
      users: [],
      subjects: [],
      students: [],
      expectations: [],
    };

    // Default test data if none provided
    const seedData: SeedData = data || {
      users: [
        { email: 'teacher@test.com', password: 'Test123!', name: 'Test Teacher' },
        { email: 'admin@test.com', password: 'Admin123!', name: 'Test Admin', role: 'ADMIN' },
      ],
      subjects: [
        { name: 'Mathematics', code: 'MATH' },
        { name: 'Science', code: 'SCI' },
      ],
    };

    // Seed users
    if (seedData.users) {
      for (const userData of seedData.users) {
        const user = await client.user.create({ data: userData });
        seeded.users.push(user);
      }
    }

    // Seed subjects (associate with first user)
    if (seedData.subjects && seeded.users.length > 0) {
      for (const subjectData of seedData.subjects) {
        const subject = await client.subject.create({
          data: {
            ...subjectData,
            userId: seeded.users[0].id,
          },
        });
        seeded.subjects.push(subject);
      }
    }

    // Seed students (associate with first user)
    if (seedData.students && seeded.users.length > 0) {
      for (const studentData of seedData.students) {
        const student = await client.student.create({
          data: {
            ...studentData,
            userId: seeded.users[0].id,
          },
        });
        seeded.students.push(student);
      }
    }

    // Seed curriculum expectations
    if (seedData.expectations) {
      for (const expectationData of seedData.expectations) {
        const expectation = await client.curriculumExpectation.create({
          data: expectationData,
        });
        seeded.expectations.push(expectation);
      }
    }

    return seeded;
  }

  /**
   * Cleanup database and disconnect
   */
  async cleanup(workerId: string): Promise<void> {
    const client = this.clients.get(workerId);
    if (!client) return;

    try {
      await client.$disconnect();
      
      // Drop PostgreSQL test database
      if (this.config.type === 'postgresql') {
        const databaseUrl = this.getDatabaseUrl(workerId);
        await this.dropPostgreSQLDatabase(databaseUrl);
      }
      
      // Delete SQLite file
      if (this.config.type === 'sqlite-file') {
        const dbPath = resolve(process.cwd(), 'tests', 'databases', `test-${workerId}.db`);
        if (existsSync(dbPath)) {
          rmSync(dbPath);
        }
      }
    } catch (_error) {
      console.error(`Cleanup error for worker ${workerId}:`, error);
    } finally {
      this.clients.delete(workerId);
    }
  }

  /**
   * Drop PostgreSQL database
   */
  private async dropPostgreSQLDatabase(databaseUrl: string): Promise<void> {
    const urlParts = databaseUrl.split('/');
    const dbName = urlParts.pop();
    const baseUrl = urlParts.join('/');

    try {
      const adminClient = new PrismaClient({
        datasources: {
          db: {
            url: `${baseUrl}/postgres`,
          },
        },
      });

      await adminClient.$connect();
      
      // Terminate existing connections
      await adminClient.$executeRawUnsafe(`
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = '${dbName}' AND pid <> pg_backend_pid()
      `);
      
      // Drop database
      await adminClient.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
      await adminClient.$disconnect();
    } catch (_error) {
      console.error(`Failed to drop database ${dbName}:`, error);
    }
  }

  /**
   * Ensure directory exists
   */
  private ensureDirectory(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Execute with retry for handling transient database errors
   */
  async executeWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Retry on transient errors
        if (
          error.message.includes('database is locked') ||
          error.message.includes('deadlock detected') ||
          error.message.includes('connection refused')
        ) {
          await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('Failed after retries');
  }
}

// Type definitions for seed data
interface SeedData {
  users?: Array<{
    email: string;
    password: string;
    name: string;
    role?: string;
  }>;
  subjects?: Array<{
    name: string;
    code?: string;
  }>;
  students?: Array<{
    firstName: string;
    lastName: string;
    grade: number;
  }>;
  expectations?: Array<{
    code: string;
    description: string;
    subject: string;
    grade: number;
    strand: string;
    substrand?: string;
  }>;
}

interface SeededData {
  users: Array<{ id: number; email: string; name: string }>;
  subjects: Array<{ id: number; name: string; code?: string | null }>;
  students: Array<{ id: number; firstName: string; lastName: string }>;
  expectations: Array<{ id: string; code: string; description: string }>;
}

// Singleton instance for test usage
export const realTestDb = new RealTestDatabase();