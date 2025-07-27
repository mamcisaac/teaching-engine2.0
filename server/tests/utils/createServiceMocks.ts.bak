import { PrismaClient } from '@teaching-engine/database';
import { Logger } from 'pino';
import { ServiceDependencies } from '../../src/services/base/BaseService';

/**
 * Creates mock dependencies for services in Jest tests
 * @param jest - The Jest object from the test context
 */
export function createMockDependencies(jest: any): ServiceDependencies {
  // Create mock Prisma client
  const mockPrisma = {
    $transaction: jest.fn().mockImplementation(async (fn: any) => {
      if (typeof fn === 'function') {
        return await fn(mockPrisma);
      }
      return await Promise.all(fn);
    }),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),

    curriculumExpectation: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    curriculumImport: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teacher: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lessonPlan: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    expectationCluster: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    expectationEmbedding: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as PrismaClient;

  // Create mock logger
  const mockLogger = {
    child: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
    level: 'info',
  } as unknown as Logger;

  // Make child return itself for chaining
  mockLogger.child.mockReturnValue(mockLogger);

  return {
    prisma: mockPrisma,
    logger: mockLogger,
  };
}

/**
 * Validates that mock dependencies are properly configured
 */
export function validateMockDependencies(deps: ServiceDependencies): boolean {
  if (!deps.prisma || !deps.logger) {
    return false;
  }

  const prisma = deps.prisma as any;
  const logger = deps.logger as any;

  const prismaMethods = ['$transaction', '$queryRaw', '$connect', '$disconnect'];
  const loggerMethods = ['child', 'info', 'warn', 'error', 'debug'];

  for (const method of prismaMethods) {
    if (!prisma[method] || typeof prisma[method] !== 'function') {
      console.error(`Mock validation failed: prisma.${method} is not a function`);
      return false;
    }
  }

  for (const method of loggerMethods) {
    if (!logger[method] || typeof logger[method] !== 'function') {
      console.error(`Mock validation failed: logger.${method} is not a function`);
      return false;
    }
  }

  return true;
}
