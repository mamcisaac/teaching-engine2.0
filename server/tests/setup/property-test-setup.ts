/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Property-based testing setup for Teaching Engine 2.0
 * Configures fast-check for education domain testing
 */

import { jest } from '@jest/globals';
import { configureGlobal } from 'fast-check';

// Configure fast-check globally for all property tests
configureGlobal({
  // Default number of runs for property tests
  numRuns: 100,
  
  // Enable verbose mode for debugging
  verbose: process.env.DEBUG_PROPERTY_TESTS === 'true',
  
  // Configure seeds for reproducible tests
  seed: process.env.PROPERTY_TEST_SEED ? parseInt(process.env.PROPERTY_TEST_SEED, 10) : undefined,
  
  // Enable path for minimal shrinking
  path: process.env.PROPERTY_TEST_PATH,
  
  // Configure timeout for property tests
  timeout: 30000,
  
  // Enable async mode for async property tests
  asyncReporter: async (out) => {
    if (process.env.DEBUG_PROPERTY_TESTS === 'true') {
      console.log(out);
    }
  },
  
  // Configure shrinking options
  endOnFailure: true,
  skipAllAfterTimeLimit: 25000, // 25 seconds
  
  // Configure interruption handling
  interruptAfterTimeLimit: 28000, // 28 seconds
  markInterruptAsFailure: true,
});

// Mock external dependencies for property tests
jest.mock('@teaching-engine/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    curriculum: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lessonPlan: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    unitPlan: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    etfoLessonPlan: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    weeklyPlannerState: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    daybookEntry: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    assessment: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock external services
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked OpenAI response' } }],
        }),
      },
    },
  })),
}));

// Mock file system operations
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
}));

// Mock path operations
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/')),
  basename: jest.fn((path) => path.split('/').pop()),
  extname: jest.fn((path) => path.includes('.') ? '.' + path.split('.').pop() : ''),
}));

// Mock validation libraries
jest.mock('validator', () => ({
  isEmail: jest.fn((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  isURL: jest.fn((url) => /^https?:\/\//.test(url)),
  isUUID: jest.fn((uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)),
  isNumeric: jest.fn((str) => /^\d+$/.test(str)),
  isLength: jest.fn((str, options) => str.length >= options.min && str.length <= options.max),
}));

// Mock date-fns for date manipulation
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => date.toISOString()),
  parseISO: jest.fn((str) => new Date(str)),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfWeek: jest.fn((date) => new Date(date.getTime() - date.getDay() * 24 * 60 * 60 * 1000)),
  endOfWeek: jest.fn((date) => new Date(date.getTime() + (6 - date.getDay()) * 24 * 60 * 60 * 1000)),
  isValid: jest.fn((date) => date instanceof Date && !isNaN(date.getTime())),
  isBefore: jest.fn((date1, date2) => date1.getTime() < date2.getTime()),
  isAfter: jest.fn((date1, date2) => date1.getTime() > date2.getTime()),
}));

// Mock crypto for UUID generation
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => '12345678-1234-5678-9012-123456789012'),
  randomBytes: jest.fn((size) => Buffer.alloc(size, 'test')),
}));

// Configure console for property test output
const originalConsole = console;
beforeEach(() => {
  if (process.env.DEBUG_PROPERTY_TESTS !== 'true') {
    // Suppress console output unless debugging
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterEach(() => {
  if (process.env.DEBUG_PROPERTY_TESTS !== 'true') {
    // Restore console
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
});

// Global test utilities
global.generateTestId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
global.generateTestEmail = () => `test-${Date.now()}@example.com`;
global.generateTestDate = () => new Date('2024-01-01');

// Property test environment configuration
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DATABASE_URL = 'file:./test-property.db';

console.log('✅ Property-based testing environment configured');