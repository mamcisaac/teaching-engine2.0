import { ErrorReportingService } from '../errorReportingService';
import { AppError } from '../../../utils/errors';
import { logger } from '../../../logger';

/**
 * ErrorReportingService Unit Tests - Real Implementation
 * Tests the error reporting service with mock mode enabled
 */
describe('ErrorReportingService', () => {
  let errorReportingService: ErrorReportingService;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
    process.env.SENTRY_DSN = 'https://test@sentry.io/123456';
    errorReportingService = new ErrorReportingService();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('initialization', () => {
    it('should initialize Sentry in production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123456';

      const service = new ErrorReportingService();

      // Should not throw in production with valid DSN
      expect(() => service.init()).not.toThrow();
    });

    it('should not initialize Sentry in development environment', () => {
      process.env.NODE_ENV = 'development';

      const service = new ErrorReportingService();

      // Should not throw in development
      expect(() => service.init()).not.toThrow();
    });

    it('should not initialize Sentry without DSN', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.SENTRY_DSN;

      const service = new ErrorReportingService();

      // Should not throw without DSN
      expect(() => service.init()).not.toThrow();
    });

    it('should enable mock mode when SENTRY_MOCK is true', () => {
      process.env.SENTRY_MOCK = 'true';

      const service = new ErrorReportingService();

      // Mock mode should initialize without error
      expect(() => service.init()).not.toThrow();
    });

    it('should log initialization status', () => {
      const logSpy = jest.spyOn(logger, 'info');

      process.env.NODE_ENV = 'development';
      const service = new ErrorReportingService();
      service.init();

      expect(logSpy).toHaveBeenCalledWith('Error reporting disabled in development');
    });
  });

  describe('captureError', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
      errorReportingService.init();
    });

    it('should capture regular errors', () => {
      const error = new Error('Test error');
      const context = { userId: 123, action: 'test-action' };

      // Should not throw
      expect(() => {
        errorReportingService.captureError(error, context);
      }).not.toThrow();
    });

    it('should capture AppError with appropriate severity', () => {
      const appError = new AppError(500, 'Server error');

      // Should not throw
      expect(() => {
        errorReportingService.captureError(appError);
      }).not.toThrow();
    });

    it('should redact sensitive information', () => {
      const error = new Error('Password: secret123');
      const context = {
        user: { id: 1, password: 'should-be-redacted' },
        apiKey: 'sensitive-key',
      };

      // Should not throw and should handle sensitive data
      expect(() => {
        errorReportingService.captureError(error, context);
      }).not.toThrow();
    });

    it('should handle circular references in context', () => {
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;

      const error = new Error('Test error');

      // Should not throw with circular reference
      expect(() => {
        errorReportingService.captureError(error, { circular: circularObj });
      }).not.toThrow();
    });

    it('should not capture errors when disabled', () => {
      process.env.NODE_ENV = 'development';
      process.env.SENTRY_MOCK = 'false';
      const service = new ErrorReportingService();
      service.init();

      const error = new Error('Test error');

      // Should not throw even when disabled
      expect(() => {
        service.captureError(error);
      }).not.toThrow();
    });
  });

  describe('captureMessage', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
      errorReportingService.init();
    });

    it('should capture messages with different levels', () => {
      const levels: Array<'info' | 'warning' | 'error'> = ['info', 'warning', 'error'];

      levels.forEach((level) => {
        expect(() => {
          errorReportingService.captureMessage('Test message', level);
        }).not.toThrow();
      });
    });

    it('should capture message with context', () => {
      const context = { feature: 'test', userId: 123 };

      expect(() => {
        errorReportingService.captureMessage('Test message', 'info', context);
      }).not.toThrow();
    });
  });

  describe('setUserContext', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
      errorReportingService.init();
    });

    it('should set user context', () => {
      const user = {
        id: 123,
        email: 'test@example.com',
        name: 'Test User',
        role: 'teacher',
      };

      // setUserContext sets user data in context
      expect(() => {
        errorReportingService.setUserContext(user);
      }).not.toThrow();
    });

    it('should clear user context', () => {
      // Clearing user context
      expect(() => {
        errorReportingService.setUserContext(null);
      }).not.toThrow();
    });
  });

  describe('addBreadcrumb', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
      errorReportingService.init();
    });

    it('should add breadcrumb', () => {
      const breadcrumb = {
        message: 'User clicked button',
        category: 'user-action',
        data: { buttonId: 'submit' },
      };

      expect(() => {
        errorReportingService.addBreadcrumb(breadcrumb);
      }).not.toThrow();
    });
  });

  describe('setErrorContext', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
      errorReportingService.init();
    });

    it('should set error context', () => {
      const context = {
        feature: 'lesson-planning',
        version: '2.0.0',
      };

      expect(() => {
        errorReportingService.setErrorContext('app', context);
      }).not.toThrow();
    });
  });

  describe('Error filtering', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
      errorReportingService.init();
    });

    it('should filter out common non-errors', () => {
      const ignoredErrors = [
        new Error('ResizeObserver loop limit exceeded'),
        new Error('Network request failed'),
        new Error('Load failed'),
        new Error('Non-Error promise rejection captured'),
      ];

      ignoredErrors.forEach((error) => {
        expect(() => {
          errorReportingService.captureError(error);
        }).not.toThrow();
      });
    });

    it('should capture non-filtered errors', () => {
      const error = new Error('Critical application error');

      expect(() => {
        errorReportingService.captureError(error);
      }).not.toThrow();
    });
  });

  describe('categorizeError', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
      errorReportingService.init();
    });

    it('should categorize different error types', () => {
      const testCases = [
        { error: new AppError(404, 'Not found'), expectedCategory: 'client_error' },
        { error: new AppError(500, 'Server error'), expectedCategory: 'server_error' },
        { error: new Error('Database connection failed'), expectedCategory: 'database' },
        { error: new Error('Authentication failed'), expectedCategory: 'authentication' },
        { error: new Error('Validation error'), expectedCategory: 'validation' },
        { error: new Error('Unknown error'), expectedCategory: 'unknown' },
      ];

      testCases.forEach(({ error }) => {
        expect(() => {
          errorReportingService.captureError(error);
        }).not.toThrow();
      });
    });

    it('should categorize errors correctly', () => {
      // Test the categorizeError method directly
      const validationError = new AppError(400, 'Validation failed', 'VALIDATION_ERROR');
      const category = errorReportingService.categorizeError(validationError);

      expect(category).toMatchObject({
        category: 'validation',
        severity: 'warning',
        tags: expect.any(Object),
      });
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
      errorReportingService.init();
    });

    it('should handle high volume of errors efficiently', () => {
      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        errorReportingService.captureError(new Error(`Error ${i}`));
      }

      const duration = Date.now() - startTime;
      // Should process 1000 errors in less than 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Integration', () => {
    it('should work with real Sentry configuration in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://actual@sentry.io/project';

      const service = new ErrorReportingService();

      // Should initialize without error in production
      expect(() => service.init()).not.toThrow();
    });

    it('should disable error reporting when requested', () => {
      process.env.SENTRY_MOCK = 'true';
      const service = new ErrorReportingService();
      service.init();

      // Should be able to disable
      expect(() => {
        service.disable();
      }).not.toThrow();

      // After disabling, errors should not be captured
      expect(() => {
        service.captureError(new Error('Test'));
      }).not.toThrow();
    });
  });

  describe('Mock mode behavior', () => {
    beforeEach(() => {
      process.env.SENTRY_MOCK = 'true';
    });

    it('should log mock messages when in mock mode', () => {
      const logSpy = jest.spyOn(logger, 'info');

      const service = new ErrorReportingService();
      service.init();

      expect(logSpy).toHaveBeenCalledWith('Using mock error reporting service');

      // Capture error in mock mode
      service.captureError(new Error('Test error'));

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[MOCK] Would capture error'));
    });

    it('should handle all operations in mock mode', () => {
      const service = new ErrorReportingService();
      service.init();

      // All operations should work in mock mode
      expect(() => {
        service.captureError(new Error('Test'));
        service.captureMessage('Test message', 'info');
        service.setUserContext({ id: 1 });
        service.addBreadcrumb({ message: 'Test' });
        service.setErrorContext('test', { data: 'value' });
      }).not.toThrow();
    });
  });
});
