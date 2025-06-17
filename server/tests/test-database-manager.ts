import { PrismaClient } from '@teaching-engine/database';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    const root = resolve(__dirname, '..', '..');
    try {
      execSync('pnpm --filter @teaching-engine/database prisma db push --force-reset --skip-generate', {
        stdio: 'inherit',
        cwd: root,
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

    // For SQLite, we'll use savepoints instead of full transactions
    // since SQLite doesn't support nested transactions
    // Use $executeRawUnsafe to avoid parameterization of identifiers
    const safeSavepointName = `sp_${testId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await client.$executeRawUnsafe(`SAVEPOINT ${safeSavepointName}`);

    // Return the same client, but track that we have a savepoint
    this.transactions.set(testId, {
      client,
      rollback: async () => {
        const safeSavepointName = `sp_${testId.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await client.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${safeSavepointName}`);
        await client.$executeRawUnsafe(`RELEASE SAVEPOINT ${safeSavepointName}`);
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

    // Clear all data from tables in the correct order to avoid foreign key constraints
    const tables = [
      'WeeklySchedule',
      'DailyPlanItem',
      'DailyPlan',
      'LessonPlan',
      'ParentContact',
      'Newsletter',
      'Notification',
      'Activity',
      'Milestone',
      'Subject',
      'TimetableSlot',
      'Outcome',
      'User',
    ];

    try {
      for (const table of tables) {
        await client.$executeRawUnsafe(`DELETE FROM ${table}`);
      }
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
          await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
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
    const dbPath = resolve(__dirname, '..', '..', `test-${workerId}.db`);
    return `file:${dbPath}`;
  }
}

// Export a singleton instance
export const testDb = new TestDatabaseManager();