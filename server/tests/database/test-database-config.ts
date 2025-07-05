/**
 * Test Database Configuration
 * 
 * Provides centralized configuration for test databases across different environments.
 * Supports both SQLite (local development) and PostgreSQL (CI/production testing).
 */

import { resolve } from 'path';

export interface TestDatabaseConfig {
  provider: 'sqlite' | 'postgresql';
  url: string;
  isolationStrategy: 'file' | 'schema' | 'transaction';
  supportsConcurrentTests: boolean;
  supportsTransactions: boolean;
  supportsNestedTransactions: boolean;
  maxConnections: number;
  connectionTimeout: number;
  migrationStrategy: 'push' | 'migrate';
}

/**
 * Get database configuration based on environment
 */
export function getTestDatabaseConfig(workerId: string): TestDatabaseConfig {
  const provider = process.env.TEST_DATABASE_PROVIDER || 'sqlite';
  
  if (provider === 'postgresql') {
    return getPostgreSQLConfig(workerId);
  }
  
  return getSQLiteConfig(workerId);
}

/**
 * SQLite configuration for local development
 */
function getSQLiteConfig(workerId: string): TestDatabaseConfig {
  const dbPath = resolve(process.cwd(), 'tests', 'databases', `test-${workerId}.db`);
  
  return {
    provider: 'sqlite',
    url: `file:${dbPath}`,
    isolationStrategy: 'file', // Each worker gets its own database file
    supportsConcurrentTests: true,
    supportsTransactions: false, // SQLite has limited transaction support
    supportsNestedTransactions: false,
    maxConnections: 1,
    connectionTimeout: 5000,
    migrationStrategy: 'push', // Use db push for SQLite
  };
}

/**
 * PostgreSQL configuration for CI and production testing
 */
function getPostgreSQLConfig(workerId: string): TestDatabaseConfig {
  const baseUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/teaching_engine_test';
  const schemaName = `test_worker_${workerId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  // Parse base URL and add schema parameter
  const url = new URL(baseUrl);
  url.searchParams.set('schema', schemaName);
  
  return {
    provider: 'postgresql',
    url: url.toString(),
    isolationStrategy: 'schema', // Each worker gets its own schema
    supportsConcurrentTests: true,
    supportsTransactions: true,
    supportsNestedTransactions: true,
    maxConnections: 5,
    connectionTimeout: 10000,
    migrationStrategy: 'migrate', // Use migrations for PostgreSQL
  };
}

/**
 * Get connection pool configuration
 */
export function getConnectionPoolConfig(config: TestDatabaseConfig) {
  return {
    max: config.maxConnections,
    min: 0,
    acquireTimeout: config.connectionTimeout,
    idleTimeout: 30000,
    reapInterval: 1000,
    createRetryInterval: 500,
    propagateCreateError: false,
  };
}

/**
 * Environment-specific test database URLs
 */
export const TEST_DATABASE_URLS = {
  // Local development
  development: 'file:./test.db',
  
  // CI environments
  github: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/teaching_engine_test',
  gitlab: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/teaching_engine_test',
  jenkins: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/teaching_engine_test',
  
  // Docker compose
  docker: 'postgresql://postgres:postgres@test-db:5432/teaching_engine_test',
};

/**
 * Test isolation levels
 */
export enum TestIsolationLevel {
  /** No isolation - tests share database state */
  NONE = 'none',
  
  /** Table-level isolation - each test clears tables */
  TABLE = 'table',
  
  /** Transaction isolation - each test runs in a transaction */
  TRANSACTION = 'transaction',
  
  /** Schema isolation - each test gets its own schema */
  SCHEMA = 'schema',
  
  /** Database isolation - each test gets its own database */
  DATABASE = 'database',
}

/**
 * Get recommended isolation level based on test type
 */
export function getRecommendedIsolationLevel(testType: string): TestIsolationLevel {
  switch (testType) {
    case 'unit':
      return TestIsolationLevel.TRANSACTION;
    case 'integration':
      return TestIsolationLevel.TABLE;
    case 'performance':
      return TestIsolationLevel.NONE;
    case 'e2e':
      return TestIsolationLevel.SCHEMA;
    default:
      return TestIsolationLevel.TABLE;
  }
}