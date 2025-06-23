/**
 * Mock setup for unit tests only
 * This file sets up all mocks needed for unit testing without database connections
 */
import { jest } from '@jest/globals';

// Create console mock
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock console methods (but still allow test output)
global.console = {
  ...console,
  log: jest.fn((...args) => {
    if (process.env.DEBUG_TESTS) {
      console.log(...args);
    }
  }),
  error: jest.fn((...args) => {
    if (process.env.DEBUG_TESTS) {
      console.error(...args);
    }
  }),
  warn: jest.fn((...args) => {
    if (process.env.DEBUG_TESTS) {
      console.warn(...args);
    }
  }),
  info: jest.fn((...args) => {
    if (process.env.DEBUG_TESTS) {
      console.info(...args);
    }
  }),
  debug: jest.fn((...args) => {
    if (process.env.DEBUG_TESTS) {
      console.debug(...args);
    }
  }),
};

// Mock the logger module
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  fatal: jest.fn(),
  trace: jest.fn(),
  child: jest.fn(() => mockLogger),
};

// Mock src/logger
jest.doMock('../src/logger', () => ({
  __esModule: true,
  default: mockLogger,
  ...mockLogger,
}));

// Logger is already mocked above

// Mock email service
jest.doMock('../src/services/emailService', () => ({
  __esModule: true,
  emailService: {
    sendEmail: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
    sendBulkEmails: jest.fn().mockResolvedValue([{ id: 'mock-email-id' }]),
    validateEmail: jest.fn().mockReturnValue(true),
  },
}));

// Mock llmService (OpenAI)
jest.doMock('../src/services/llmService', () => ({
  __esModule: true,
  llmService: {
    generateText: jest.fn().mockResolvedValue('Generated text'),
    generateActivityIdeas: jest.fn().mockResolvedValue([]),
    generateNewsletterContent: jest.fn().mockResolvedValue('Newsletter content'),
  },
  openai: null, // Mock as unavailable for unit tests
}));

// Mock embeddingService - commented out as individual tests handle their own mocks
// jest.doMock('../src/services/embeddingService', () => ({
//   __esModule: true,
//   embeddingService: {
//     isEmbeddingServiceAvailable: jest.fn().mockReturnValue(false),
//     generateMissingEmbeddings: jest.fn().mockResolvedValue(0),
//     findSimilarOutcomes: jest.fn().mockResolvedValue([]),
//     searchOutcomesByText: jest.fn().mockResolvedValue([]),
//     getOrCreateOutcomeEmbedding: jest.fn().mockResolvedValue(null),
//   },
// }));

// Mock auth middleware
jest.doMock('../src/middleware/auth', () => ({
  requireAuth: jest.fn((req, res, next) => {
    req.user = { userId: '1' };
    next();
  }),
  requireAdminToken: jest.fn((req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token === 'valid-admin-token') {
      next();
    } else {
      res.status(403).json({ error: 'Invalid admin token' });
    }
  }),
}));

// Mock browser APIs for unit tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock canvas for chart tests if HTMLCanvasElement exists
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  }));
}

// Mock prisma
const mockPrisma = {
  $transaction: jest.fn((fn) => {
    if (typeof fn === 'function') {
      return fn(mockPrisma);
    }
    return Promise.resolve(fn);
  }),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $connect: jest.fn().mockResolvedValue(undefined),
  $queryRaw: jest.fn().mockResolvedValue([]),
  $executeRaw: jest.fn().mockResolvedValue(0),
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  subject: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  outcome: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  milestone: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  activity: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  activityOutcome: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  weeklySchedule: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  dailyPlanItem: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
};

jest.doMock('../src/prisma', () => ({
  prisma: mockPrisma,
}));

// Export mocks for use in tests
export { mockLogger, mockConsole, mockPrisma };
