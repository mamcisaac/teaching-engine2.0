// Re-export all Prisma Client types and functions
export * from '@prisma/client';

// Import for singleton
import { PrismaClient } from '@prisma/client';

// Create singleton instance for development
const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
  testPrismaClient: InstanceType<typeof PrismaClient> | undefined;
};

// In test environment, use test client if available
export const prisma = 
  (process.env.NODE_ENV === 'test' && globalForPrisma.testPrismaClient) ?
  globalForPrisma.testPrismaClient :
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  globalForPrisma.prisma = prisma;
}
