/**
 * Logger Mock for Tests
 * Provides silent logging during tests to reduce console noise
 */

import { jest } from '@jest/globals';

const createSilentMock = () => jest.fn();

const mockLogger = {
  info: createSilentMock(),
  warn: createSilentMock(),
  error: createSilentMock(),
  debug: createSilentMock(),
  trace: createSilentMock(),
  fatal: createSilentMock(),
  child: jest.fn().mockReturnValue({
    info: createSilentMock(),
    warn: createSilentMock(),
    error: createSilentMock(),
    debug: createSilentMock(),
    trace: createSilentMock(),
    fatal: createSilentMock(),
    child: jest.fn().mockReturnThis(),
  }),
};

// Export as both default and named to match pino usage patterns
export default () => mockLogger;
export const pino = () => mockLogger;
