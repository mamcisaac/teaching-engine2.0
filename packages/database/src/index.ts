// Re-export all Prisma Client types and functions
export * from './generated/client';
export { PrismaClient, Prisma } from './generated/client';
export type { PrismaClientKnownRequestError } from './generated/client/runtime/library';

// Create singleton instance for development
import { PrismaClient } from './generated/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
