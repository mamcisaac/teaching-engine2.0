// Import everything from the database package
import * as DatabaseExports from '@teaching-engine/database';
import { PrismaClient } from '@teaching-engine/database';

// Re-export Prisma namespace from the imported module
export const Prisma = DatabaseExports.Prisma;

// Re-export everything else
export * from '@teaching-engine/database';

// Create singleton instance for server usage
const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
  testPrismaClient: InstanceType<typeof PrismaClient> | undefined;
};

// In test environment, use the test client if available
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;

// Create a getter that always returns the current test client
const getPrisma = () => {
  if (isTestEnvironment && globalForPrisma.testPrismaClient) {
    return globalForPrisma.testPrismaClient;
  }
  return (
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  );
};

// Create a proxy to always use the current client
export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get(target, prop) {
    const client = getPrisma();
    return client[prop as keyof InstanceType<typeof PrismaClient>];
  },
  has(target, prop) {
    const client = getPrisma();
    return prop in client;
  },
});

if (process.env.NODE_ENV !== 'production' && !isTestEnvironment) {
  globalForPrisma.prisma = getPrisma();
}

// Re-export PrismaClient
export { PrismaClient };
