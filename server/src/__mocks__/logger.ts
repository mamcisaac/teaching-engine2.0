/**
 * Mock logger for testing
 */
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  fatal: jest.fn(),
  trace: jest.fn(),
};

// child should return the same mock logger instance
mockLogger.child = jest.fn(() => mockLogger);

export { mockLogger };
export { mockLogger as logger };
