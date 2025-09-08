// Re-export all Prisma Client types and functions
export * from '@prisma/client';

// Import for singleton
import { PrismaClient } from '@prisma/client';

// Create singleton instance for development
const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
  testPrismaClient: InstanceType<typeof PrismaClient> | undefined;
};

// Create a getter for lazy initialization
const getPrisma = (): PrismaClient => {
  // In test environment, use test client if available
  if (process.env.NODE_ENV === 'test' && globalForPrisma.testPrismaClient !== undefined) {
    return globalForPrisma.testPrismaClient;
  }
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  
  return globalForPrisma.prisma;
};

// Export a proxy that lazily initializes on first use
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop): unknown {
    const client = getPrisma();
    return client[prop as keyof PrismaClient];
  },
  has(_target, prop): boolean {
    const client = getPrisma();
    return prop in client;
  },
});
