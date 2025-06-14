import { prisma } from '../src/prisma';
import { beforeAll, afterAll } from '@jest/globals';


// Global setup for tests
beforeAll(async () => {
  // Ensure SQLite doesn't immediately error when the database is busy
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
});

afterAll(async () => {
  // Clean up after all tests
  await prisma.$disconnect();
});

// Global teardown
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
