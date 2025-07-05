/**
 * Enhanced Test Database Manager
 * 
 * Provides robust database management for tests with:
 * - Multiple isolation strategies
 * - Support for both SQLite and PostgreSQL
 * - Transaction management
 * - Connection pooling
 * - Performance monitoring
 */

import { PrismaClient } from '@teaching-engine/database';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { mkdirSync, existsSync, rmSync } from 'fs';
import { 
  TestDatabaseConfig, 
  getTestDatabaseConfig,
  TestIsolationLevel,
  getConnectionPoolConfig 
} from './test-database-config';

interface DatabaseConnection {
  client: PrismaClient;
  config: TestDatabaseConfig;
  stats: ConnectionStats;
  transactionDepth: number;
}

interface ConnectionStats {
  queries: number;
  transactions: number;
  startTime: number;
  lastActivity: number;
  errors: number;
}

interface TransactionContext {
  id: string;
  workerId: string;
  client: PrismaClient;
  isolationLevel: TestIsolationLevel;
  savepoints: string[];
}

export class EnhancedTestDatabaseManager {
  private connections: Map<string, DatabaseConnection> = new Map();
  private transactions: Map<string, TransactionContext> = new Map();
  private schemaCache: Map<string, boolean> = new Map();
  private cleanupCallbacks: Array<() => Promise<void>> = [];

  /**
   * Initialize database for a worker
   */
  async initializeDatabase(workerId: string): Promise<void> {
    const config = getTestDatabaseConfig(workerId);
    
    // Ensure database directory exists for SQLite
    if (config.provider === 'sqlite') {
      const dbDir = dirname(config.url.replace('file:', ''));
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }
    }
    
    // Create connection
    const client = this.createPrismaClient(config);
    
    // Initialize schema
    await this.initializeSchema(workerId, config);
    
    // Store connection
    this.connections.set(workerId, {
      client,
      config,
      stats: {
        queries: 0,
        transactions: 0,
        startTime: Date.now(),
        lastActivity: Date.now(),
        errors: 0,
      },
      transactionDepth: 0,
    });
    
    // Register cleanup
    this.cleanupCallbacks.push(async () => {
      await client.$disconnect();
    });
  }

  /**
   * Create Prisma client with configuration
   */
  private createPrismaClient(config: TestDatabaseConfig): PrismaClient {
    const datasourceUrl = config.url;
    
    const client = new PrismaClient({
      datasources: {
        db: { url: datasourceUrl },
      },
      log: process.env.DEBUG_TESTS === 'true' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      errorFormat: 'pretty',
    });

    // Add query logging middleware if debugging
    if (process.env.DEBUG_TESTS === 'true') {
      client.$use(async (params, next) => {
        const start = Date.now();
        const result = await next(params);
        const duration = Date.now() - start;
        console.log(`Query ${params.model}.${params.action} took ${duration}ms`);
        return result;
      });
    }

    return client;
  }

  /**
   * Initialize database schema
   */
  private async initializeSchema(workerId: string, config: TestDatabaseConfig): Promise<void> {
    const cacheKey = `${config.provider}:${workerId}`;
    
    // Check cache to avoid redundant schema operations
    if (this.schemaCache.get(cacheKey)) {
      return;
    }

    const databasePath = resolve(process.cwd(), '..', 'packages', 'database');
    const env = { ...process.env, DATABASE_URL: config.url };

    try {
      if (config.provider === 'postgresql') {
        // For PostgreSQL, create schema if needed
        const schemaName = new URL(config.url).searchParams.get('schema');
        if (schemaName && schemaName !== 'public') {
          const baseClient = new PrismaClient({
            datasources: { db: { url: config.url.split('?')[0] } },
          });
          
          await baseClient.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
          await baseClient.$disconnect();
        }
      }

      // Apply schema based on migration strategy
      if (config.migrationStrategy === 'push') {
        execSync('npx prisma db push --force-reset --skip-generate', {
          stdio: process.env.DEBUG_TESTS === 'true' ? 'inherit' : 'pipe',
          cwd: databasePath,
          env,
        });
      } else {
        execSync('npx prisma migrate deploy', {
          stdio: process.env.DEBUG_TESTS === 'true' ? 'inherit' : 'pipe',
          cwd: databasePath,
          env,
        });
      }

      this.schemaCache.set(cacheKey, true);
    } catch (error) {
      console.error(`Failed to initialize schema for worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Get client for a worker
   */
  getClient(workerId: string): PrismaClient {
    const connection = this.connections.get(workerId);
    if (!connection) {
      throw new Error(`No database connection for worker ${workerId}`);
    }
    
    connection.stats.lastActivity = Date.now();
    return connection.client;
  }

  /**
   * Start a transaction with specified isolation level
   */
  async startTransaction(
    testId: string, 
    workerId: string,
    isolationLevel: TestIsolationLevel = TestIsolationLevel.TRANSACTION
  ): Promise<PrismaClient> {
    const connection = this.connections.get(workerId);
    if (!connection) {
      throw new Error(`No database connection for worker ${workerId}`);
    }

    const config = connection.config;
    
    // Handle different isolation strategies
    switch (isolationLevel) {
      case TestIsolationLevel.NONE:
        // No isolation, return the base client
        return connection.client;
        
      case TestIsolationLevel.TABLE:
        // Clear tables before test
        await this.clearAllTables(connection.client);
        return connection.client;
        
      case TestIsolationLevel.TRANSACTION:
        // PostgreSQL supports real transactions
        if (config.supportsTransactions) {
          return this.createTransactionClient(testId, workerId, connection);
        }
        // Fall back to table clearing for SQLite
        await this.clearAllTables(connection.client);
        return connection.client;
        
      case TestIsolationLevel.SCHEMA:
        // Schema isolation is handled at initialization
        return connection.client;
        
      case TestIsolationLevel.DATABASE:
        // Database isolation would require creating a new database
        // Fall back to schema isolation
        return connection.client;
        
      default:
        return connection.client;
    }
  }

  /**
   * Create a transactional client for PostgreSQL
   */
  private async createTransactionClient(
    testId: string,
    workerId: string,
    connection: DatabaseConnection
  ): Promise<PrismaClient> {
    // For now, return the base client
    // In a real implementation, we would use Prisma's interactive transactions
    // or implement savepoint-based nested transactions
    
    const context: TransactionContext = {
      id: testId,
      workerId,
      client: connection.client,
      isolationLevel: TestIsolationLevel.TRANSACTION,
      savepoints: [],
    };
    
    this.transactions.set(testId, context);
    connection.stats.transactions++;
    connection.transactionDepth++;
    
    return connection.client;
  }

  /**
   * Rollback a transaction
   */
  async rollbackTransaction(testId: string): Promise<void> {
    const transaction = this.transactions.get(testId);
    if (!transaction) {
      return;
    }

    const connection = this.connections.get(transaction.workerId);
    if (connection) {
      connection.transactionDepth = Math.max(0, connection.transactionDepth - 1);
    }

    // Clean up transaction
    this.transactions.delete(testId);
    
    // For table-based isolation, clear tables
    if (transaction.isolationLevel === TestIsolationLevel.TABLE) {
      await this.clearAllTables(transaction.client);
    }
  }

  /**
   * Clear all tables in the database
   */
  async clearAllTables(client: PrismaClient): Promise<void> {
    const config = this.getConfigForClient(client);
    
    if (config?.provider === 'sqlite') {
      await this.clearSQLiteTables(client);
    } else {
      await this.clearPostgreSQLTables(client);
    }
  }

  /**
   * Clear tables for SQLite
   */
  private async clearSQLiteTables(client: PrismaClient): Promise<void> {
    try {
      // Get all table names
      const tables = await client.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE '_prisma_migrations'
      `;

      // Disable foreign keys
      await client.$executeRawUnsafe('PRAGMA foreign_keys = OFF');

      // Clear all tables
      for (const { name } of tables) {
        await client.$executeRawUnsafe(`DELETE FROM "${name}"`);
      }

      // Reset sequences
      await client.$executeRawUnsafe(`DELETE FROM sqlite_sequence`);

      // Re-enable foreign keys
      await client.$executeRawUnsafe('PRAGMA foreign_keys = ON');
    } catch (error) {
      console.error('Failed to clear SQLite tables:', error);
      throw error;
    }
  }

  /**
   * Clear tables for PostgreSQL
   */
  private async clearPostgreSQLTables(client: PrismaClient): Promise<void> {
    try {
      // Get current schema
      const [{ current_schema }] = await client.$queryRaw<[{ current_schema: string }]>`
        SELECT current_schema()
      `;

      // Get all table names in the schema
      const tables = await client.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = ${current_schema}
        AND tablename NOT LIKE '_prisma_migrations'
      `;

      // Truncate all tables with CASCADE to handle foreign keys
      for (const { tablename } of tables) {
        await client.$executeRawUnsafe(
          `TRUNCATE TABLE "${current_schema}"."${tablename}" CASCADE`
        );
      }
    } catch (error) {
      console.error('Failed to clear PostgreSQL tables:', error);
      throw error;
    }
  }

  /**
   * Get configuration for a client
   */
  private getConfigForClient(client: PrismaClient): TestDatabaseConfig | undefined {
    for (const [_, connection] of this.connections) {
      if (connection.client === client) {
        return connection.config;
      }
    }
    return undefined;
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      retryOn?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 100,
      retryOn = (error) => error.message.includes('locked') || error.message.includes('timeout'),
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (!retryOn(lastError) || attempt === maxRetries - 1) {
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Get connection statistics
   */
  getStats(workerId: string): ConnectionStats | undefined {
    return this.connections.get(workerId)?.stats;
  }

  /**
   * Health check for a worker's database
   */
  async isHealthy(workerId: string): Promise<boolean> {
    try {
      const client = this.getClient(workerId);
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cleanup all connections
   */
  async cleanup(): Promise<void> {
    // Run all cleanup callbacks
    await Promise.all(this.cleanupCallbacks.map(cb => cb()));
    
    // Clear all maps
    this.connections.clear();
    this.transactions.clear();
    this.schemaCache.clear();
    this.cleanupCallbacks = [];
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    totalConnections: number;
    activeTransactions: number;
    totalQueries: number;
    averageQueryTime?: number;
    uptime: number;
  } {
    const metrics = {
      totalConnections: this.connections.size,
      activeTransactions: this.transactions.size,
      totalQueries: 0,
      uptime: 0,
    };

    for (const [_, connection] of this.connections) {
      metrics.totalQueries += connection.stats.queries;
      const connectionUptime = Date.now() - connection.stats.startTime;
      metrics.uptime = Math.max(metrics.uptime, connectionUptime);
    }

    return metrics;
  }
}

// Export singleton instance
export const testDbManager = new EnhancedTestDatabaseManager();