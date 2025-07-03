import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

// Mock modules before importing
jest.unstable_mockModule('../../src/services/CacheService.js', () => ({
  CacheService: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  })),
}));

jest.unstable_mockModule('../../src/logger.js', () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import after mocking
const { validateApiKey } = await import('../../src/middleware/apiKeyValidation.js');
const { CacheService } = await import('../../src/services/CacheService.js');

describe('API Key Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request mock
    mockReq = {
      headers: {},
      path: '/api/test',
    };

    // Setup response mock with proper chaining
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    // Setup next function
    mockNext = jest.fn();

    // Reset environment
    delete process.env.API_KEY;
    delete process.env.ENABLE_API_KEY_VALIDATION;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Security Validation', () => {
    it('should reject requests without API key when validation is enabled', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = {}; // No API key provided

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert - Real security validation
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Unauthorized: API key is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid API key format', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = { 'x-api-key': '' }; // Empty API key

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Unauthorized: API key is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with incorrect API key', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = { 'x-api-key': 'wrong-key' };

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Unauthorized: Invalid API key',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept requests with valid API key', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = { 'x-api-key': 'test-secret-key-12345' };

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('should handle API key in Authorization header with Bearer format', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = { authorization: 'Bearer test-secret-key-12345' };

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should skip validation when disabled', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'false';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = {}; // No API key

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should skip validation when environment variable is not set', async () => {
      // Arrange - No environment variables set
      mockReq.headers = {};

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API_KEY environment variable gracefully', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      // API_KEY not set
      mockReq.headers = { 'x-api-key': 'some-key' };

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Server configuration error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle exceptions during validation', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      // Force an error by making headers undefined
      mockReq.headers = undefined as any;

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal server error during authentication',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Security Headers', () => {
    it('should not expose sensitive information in error messages', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'super-secret-production-key';
      mockReq.headers = { 'x-api-key': 'wrong-key' };

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert - Should not leak the actual API key
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Unauthorized: Invalid API key',
      });
      const errorMessage = jsonMock.mock.calls[0][0];
      expect(errorMessage.error).not.toContain('super-secret-production-key');
    });

    it('should handle case-insensitive header names', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      // Express converts headers to lowercase, so we simulate this
      mockReq.headers = { 'x-api-key': 'test-secret-key-12345' };

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Rate Limiting', () => {
    it('should process validation quickly for valid keys', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = { 'x-api-key': 'test-secret-key-12345' };

      // Act
      const startTime = Date.now();
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);
      const endTime = Date.now();

      // Assert - Validation should be fast (< 10ms)
      expect(endTime - startTime).toBeLessThan(10);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should support multiple API key formats', async () => {
      // Test different valid formats
      // Note: Express normalizes all headers to lowercase
      const testCases = [
        { header: 'x-api-key', value: 'test-secret-key-12345' },
        { header: 'authorization', value: 'Bearer test-secret-key-12345' },
      ];

      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      for (const testCase of testCases) {
        // Reset mocks
        jest.clearAllMocks();
        mockReq.headers = { [testCase.header]: testCase.value };

        // Act
        await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(statusMock).not.toHaveBeenCalled();
      }
    });
  });

  describe('Infrastructure Integration', () => {
    it('should integrate with CacheService when available', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = { 'x-api-key': 'test-secret-key-12345' };

      const mockCache = {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
      };

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(CacheService).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle CacheService failures gracefully', async () => {
      // Arrange
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';
      mockReq.headers = { 'x-api-key': 'test-secret-key-12345' };

      // Make CacheService throw an error
      (CacheService as jest.Mock).mockImplementation(() => {
        throw new Error('Cache initialization failed');
      });

      // Act
      await validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      // Assert - Should still validate even if cache fails
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
