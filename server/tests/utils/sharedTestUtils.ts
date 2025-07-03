import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Request/Response mocks
export const mockRequest = (overrides: any = {}): Partial<Request> => ({
  headers: {},
  body: {},
  params: {},
  query: {},
  ...overrides
});

export const mockResponse = (): Partial<Response> => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = (): NextFunction => jest.fn();

// JWT utilities
export const generateTestToken = (payload: any, options: any = {}) => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(payload, secret, {
    expiresIn: '1h',
    ...options
  });
};

export const createAuthenticatedRequest = (user: any) => {
  const token = generateTestToken({ userId: user.id, role: user.role });
  return mockRequest({
    headers: { authorization: `Bearer ${token}` },
    user
  });
};

// Database transaction mock
export const createMockTransaction = () => {
  const txMock = {
    user: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    student: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    lessonPlan: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    commit: jest.fn(),
    rollback: jest.fn()
  };
  
  return txMock;
};

// Async test helpers
export const waitFor = async (
  condition: () => boolean | Promise<boolean>, 
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};

// Error simulation
export class TestError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'TestError';
  }
}

// Time control
export const mockDate = (date: Date | string) => {
  const RealDate = Date;
  const mockDate = new Date(date);
  
  global.Date = class extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        return mockDate;
      }
      return new RealDate(...args);
    }
    
    static now() {
      return mockDate.getTime();
    }
  } as any;
  
  return () => {
    global.Date = RealDate;
  };
};

// Memory monitoring
export class MemoryMonitor {
  private initialMemory: number;
  private peakMemory: number;
  private interval: NodeJS.Timeout | null = null;

  start() {
    this.initialMemory = process.memoryUsage().heapUsed;
    this.peakMemory = this.initialMemory;
    
    this.interval = setInterval(() => {
      const current = process.memoryUsage().heapUsed;
      if (current > this.peakMemory) {
        this.peakMemory = current;
      }
    }, 10);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getPeakUsage() {
    return this.peakMemory;
  }

  getIncrease() {
    return this.peakMemory - this.initialMemory;
  }
}

// Test data cleanup
export const cleanupTestData = async (prisma: any) => {
  // Delete in order to respect foreign key constraints
  await prisma.assessment.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.student.deleteMany();
  await prisma.curriculum.deleteMany();
  await prisma.user.deleteMany();
};

// Assertion helpers
export const expectToBeWithinRange = (actual: number, expected: number, tolerance: number) => {
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance);
  expect(actual).toBeLessThanOrEqual(expected + tolerance);
};

// Mock file creation
export const createMockFile = (
  filename: string, 
  size: number = 1024, 
  mimeType: string = 'application/octet-stream'
): Express.Multer.File => ({
  fieldname: 'file',
  originalname: filename,
  encoding: '7bit',
  mimetype: mimeType,
  size,
  buffer: Buffer.alloc(size),
  destination: '',
  filename,
  path: '',
  stream: null as any
});

// Performance timing
export const measureExecutionTime = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
};

// Retry helper for flaky tests
export const retryTest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 100
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};