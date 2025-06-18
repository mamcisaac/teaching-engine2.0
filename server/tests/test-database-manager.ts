import { PrismaClient } from '@teaching-engine/database';
import { execSync } from 'child_process';
import { resolve } from 'path';

interface TransactionClient {
  client: PrismaClient;
  rollback: () => Promise<void>;
}

class TestDatabaseManager {
  private clients: Map<string, PrismaClient> = new Map();
  private transactions: Map<string, TransactionClient> = new Map();
  private connectionStats: Map<string, { queries: number; startTime: number }> = new Map();

  async createTestDatabase(workerId: string): Promise<void> {
    const databaseUrl = this.getDatabaseUrl(workerId);
    process.env.DATABASE_URL = databaseUrl;

    // Create a new Prisma client for this worker
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    this.clients.set(workerId, client);
    this.connectionStats.set(workerId, { queries: 0, startTime: Date.now() });

    // Initialize the database schema
    const databasePath = resolve(process.cwd(), '..', 'packages', 'database');
    try {
      execSync('npx prisma db push --force-reset --skip-generate', {
        stdio: 'inherit',
        cwd: databasePath,
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    } catch (error) {
      console.error(`Failed to create test database for worker ${workerId}:`, error);
      throw error;
    }
  }

  async isDatabaseHealthy(workerId: string): Promise<boolean> {
    const client = this.clients.get(workerId);
    if (!client) return false;

    try {
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async startTransaction(testId: string): Promise<PrismaClient> {
    const workerId = process.env.JEST_WORKER_ID || 'default';
    const client = this.clients.get(workerId);

    if (!client) {
      throw new Error(`No client found for worker ${workerId}`);
    }

    // For SQLite, just return the client without transactions
    // We'll rely on resetting the database between tests
    this.transactions.set(testId, {
      client,
      rollback: async () => {
        // No-op for now
      },
    });

    return client;
  }

  async rollbackTransaction(testId: string): Promise<void> {
    const transaction = this.transactions.get(testId);
    if (transaction) {
      await transaction.rollback();
      this.transactions.delete(testId);
    }
  }

  async resetDatabase(workerId: string): Promise<void> {
    const client = this.clients.get(workerId);
    if (!client) return;

    try {
      // For SQLite, get all table names dynamically
      const tables = await client.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE '_prisma_migrations'
      `;

      // Disable foreign key constraints for SQLite
      await client.$executeRawUnsafe('PRAGMA foreign_keys = OFF');

      // Clear all tables
      for (const { name } of tables) {
        await client.$executeRawUnsafe(`DELETE FROM "${name}"`);
      }

      // Reset autoincrement sequences
      await client.$executeRawUnsafe(`DELETE FROM sqlite_sequence`);

      // Re-enable foreign key constraints
      await client.$executeRawUnsafe('PRAGMA foreign_keys = ON');
    } catch (error) {
      console.error(`Failed to reset database for worker ${workerId}:`, error);
      throw error;
    }
  }

  async getConnectionStats(workerId: string) {
    const stats = this.connectionStats.get(workerId);
    if (!stats) return null;

    return {
      queries: stats.queries,
      uptime: Date.now() - stats.startTime,
      workerId,
    };
  }

  async cleanup(): Promise<void> {
    // Disconnect all clients
    for (const [workerId, client] of this.clients) {
      try {
        await client.$disconnect();
      } catch (error) {
        console.error(`Failed to disconnect client for worker ${workerId}:`, error);
      }
    }

    this.clients.clear();
    this.transactions.clear();
    this.connectionStats.clear();
  }

  getPrismaClient(workerId: string): PrismaClient {
    let client = this.clients.get(workerId);
    if (!client) {
      // Create client on demand if it doesn't exist
      const databaseUrl = this.getDatabaseUrl(workerId);
      process.env.DATABASE_URL = databaseUrl;

      client = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      });

      this.clients.set(workerId, client);
      this.connectionStats.set(workerId, { queries: 0, startTime: Date.now() });
    }
    return client;
  }

  async executeWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // If it's a database locked error, wait before retrying
        if (lastError.message.includes('database is locked')) {
          await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
        } else {
          // For other errors, don't retry
          throw error;
        }
      }
    }

    throw lastError || new Error('Failed after retries');
  }

  private getDatabaseUrl(workerId: string): string {
    // Use a unique database file for each worker to avoid conflicts
    const dbPath = resolve(process.cwd(), 'tests', `test-${workerId}.db`);
    return `file:${dbPath}`;
  }
}

// Export a singleton instance
export const testDb = new TestDatabaseManager();
