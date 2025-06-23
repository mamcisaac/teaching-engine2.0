import { jest } from '@jest/globals';

/**
 * Get the mocked Prisma client from the global setup
 * This ensures we're always using the same mock instance
 */
export function getMockedPrisma() {
  const globalForPrisma = globalThis as unknown as {
    testPrismaClient: ReturnType<typeof import('@jest/globals').jest.fn>;
  };

  return globalForPrisma.testPrismaClient;
}

/**
 * Reset all Prisma mocks between tests
 */
export function resetPrismaMocks() {
  const prisma = getMockedPrisma();
  if (!prisma) return;

  // Reset all mock functions
  Object.keys(prisma).forEach((key) => {
    const value = prisma[key];
    if (jest.isMockFunction(value)) {
      value.mockClear();
    } else if (typeof value === 'object' && value !== null) {
      // Reset model methods
      Object.keys(value).forEach((method) => {
        if (jest.isMockFunction(value[method])) {
          value[method].mockClear();
        }
      });
    }
  });

  // Reset transaction to default behavior
  if (prisma.$transaction && jest.isMockFunction(prisma.$transaction)) {
    prisma.$transaction.mockImplementation((fn: unknown) => {
      if (typeof fn === 'function') {
        return fn(prisma);
      }
      return Promise.resolve(fn);
    });
  }
}
