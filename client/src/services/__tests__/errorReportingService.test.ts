import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as Sentry from '@sentry/react';
import { ErrorReportingService } from '../errorReportingService';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
  setTag: vi.fn(),
  setTags: vi.fn(),
  addBreadcrumb: vi.fn(),
  configureScope: vi.fn((callback) => {
    callback({
      setUser: vi.fn(),
      setContext: vi.fn(),
      setTag: vi.fn(),
      setTags: vi.fn(),
      addAttachment: vi.fn(),
      clear: vi.fn(),
    });
  }),
  withScope: vi.fn((callback) => {
    callback({
      setUser: vi.fn(),
      setContext: vi.fn(),
      setTag: vi.fn(),
      setTags: vi.fn(),
      setLevel: vi.fn(),
    });
  }),
  getCurrentHub: vi.fn(() => ({
    getClient: vi.fn(() => ({
      getOptions: vi.fn(() => ({})),
    })),
  })),
  Severity: {
    Fatal: 'fatal',
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
    Debug: 'debug',
  },
  BrowserTracing: vi.fn(),
  Replay: vi.fn(),
}));

// Mock console for testing
const originalConsole = { ...console };

describe('ErrorReportingService', () => {
  let errorReportingService: ErrorReportingService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    import.meta.env.VITE_SENTRY_DSN = 'https://test@sentry.io/123456';
    import.meta.env.MODE = 'test';
    errorReportingService = new ErrorReportingService();
    
    // Mock console methods
    console.info = vi.fn();
    console.warn = vi.fn();
    console.debug = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console
    Object.assign(console, originalConsole);
  });

  describe('initialization', () => {
    it('should initialize Sentry in production environment', () => {
      import.meta.env.MODE = 'production';
      import.meta.env.VITE_SENTRY_DSN = 'https://test@sentry.io/123456';
      
      const service = new ErrorReportingService();
      service.init();

      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123456',
        environment: 'production',
        integrations: expect.any(Array),
        tracesSampleRate: expect.any(Number),
        replaysSessionSampleRate: expect.any(Number),
        replaysOnErrorSampleRate: expect.any(Number),
        beforeSend: expect.any(Function),
        beforeBreadcrumb: expect.any(Function),
      });
    });

    it('should not initialize Sentry in development environment', () => {
      import.meta.env.MODE = 'development';
      
      const service = new ErrorReportingService();
      service.init();

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith('Error reporting disabled in development');
    });

    it('should not initialize Sentry without DSN', () => {
      import.meta.env.MODE = 'production';
      delete import.meta.env.VITE_SENTRY_DSN;
      
      const service = new ErrorReportingService();
      service.init();

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('VITE_SENTRY_DSN not configured, error reporting disabled');
    });

    it('should create mock service when VITE_SENTRY_MOCK is true', () => {
      import.meta.env.VITE_SENTRY_MOCK = 'true';
      
      const service = new ErrorReportingService();
      service.init();

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith('Using mock error reporting service');
    });
  });

  describe('captureError', () => {
    beforeEach(() => {
      errorReportingService.init();
    });

    it('should capture regular errors', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test-action' };

      errorReportingService.captureError(error, context);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: expect.any(Object),
        contexts: { custom: context },
      });
    });

    it('should capture React error info', () => {
      const error = new Error('React error');
      const errorInfo = { componentStack: 'Component stack trace' };
      
      errorReportingService.captureError(error, {}, errorInfo);

      expect(Sentry.withScope).toHaveBeenCalled();
    });

    it('should sanitize sensitive data in error context', () => {
      const error = new Error('Test error');
      const sensitiveContext = {
        password: 'secret123',
        token: 'auth-token',
        apiKey: 'api-key-123',
        email: 'user@example.com',
        creditCard: '1234-5678-9012-3456',
      };

      errorReportingService.captureError(error, sensitiveContext);

      const captureCall = (Sentry.captureException as any).mock.calls[0];
      const capturedContext = captureCall[1].contexts.custom;

      expect(capturedContext.password).toBe('[REDACTED]');
      expect(capturedContext.token).toBe('[REDACTED]');
      expect(capturedContext.apiKey).toBe('[REDACTED]');
      expect(capturedContext.email).toMatch(/\*\*\*/);
      expect(capturedContext.creditCard).toBe('[REDACTED]');
    });

    it('should handle errors without stack traces', () => {
      const error = { message: 'Custom error object' };
      
      expect(() => {
        errorReportingService.captureError(error as Error);
      }).not.toThrow();

      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should respect enabled flag', () => {
      errorReportingService.disable();
      
      const error = new Error('Test error');
      errorReportingService.captureError(error);

      expect(Sentry.captureException).not.toHaveBeenCalled();
      expect(console.debug).toHaveBeenCalledWith(
        'Error reporting disabled, skipping:',
        expect.any(Object)
      );
    });
  });

  describe('captureMessage', () => {
    beforeEach(() => {
      errorReportingService.init();
    });

    it('should capture messages with severity', () => {
      errorReportingService.captureMessage('Test message', 'warning');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'warning');
    });

    it('should default to info severity', () => {
      errorReportingService.captureMessage('Test message');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'info');
    });
  });

  describe('setUserContext', () => {
    beforeEach(() => {
      errorReportingService.init();
    });

    it('should set user context with sanitized data', () => {
      const user = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'teacher',
        organizationId: '456',
      };

      errorReportingService.setUserContext(user);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: '123',
        email: expect.stringMatching(/\*\*\*/),
        username: 'John Doe',
        role: 'teacher',
        organizationId: '456',
      });
    });

    it('should clear user context when null is passed', () => {
      errorReportingService.setUserContext(null);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('addBreadcrumb', () => {
    beforeEach(() => {
      errorReportingService.init();
    });

    it('should add breadcrumb with sanitized data', () => {
      errorReportingService.addBreadcrumb({
        message: 'User action',
        category: 'user',
        level: 'info',
        data: {
          action: 'click',
          password: 'should-be-removed',
        },
      });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User action',
        category: 'user',
        level: 'info',
        data: {
          action: 'click',
        },
        timestamp: expect.any(Number),
      });
    });
  });

  describe('setErrorContext', () => {
    beforeEach(() => {
      errorReportingService.init();
    });

    it('should set multiple contexts', () => {
      errorReportingService.setErrorContext('browser', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewport: { width: 1920, height: 1080 },
      });

      expect(Sentry.setContext).toHaveBeenCalledWith('browser', expect.any(Object));
    });

    it('should sanitize PII in context', () => {
      errorReportingService.setErrorContext('user_data', {
        ssn: '123-45-6789',
        phone: '555-1234',
        address: '123 Main St',
      });

      const contextCall = (Sentry.setContext as any).mock.calls[0];
      const sanitizedData = contextCall[1];

      expect(sanitizedData.ssn).toBe('[REDACTED]');
      expect(sanitizedData.phone).toBe('[REDACTED]');
      expect(sanitizedData.address).toBe('[REDACTED]');
    });
  });

  describe('categorizeError', () => {
    it('should categorize network errors', () => {
      const error = new Error('Network request failed');
      const category = errorReportingService.categorizeError(error);

      expect(category).toEqual({
        category: 'network',
        severity: 'warning',
        tags: {
          error_type: 'Error',
        },
      });
    });

    it('should categorize authentication errors', () => {
      const error = new Error('Unauthorized access');
      const category = errorReportingService.categorizeError(error);

      expect(category).toEqual({
        category: 'authentication',
        severity: 'warning',
        tags: {
          error_type: 'Error',
        },
      });
    });

    it('should categorize validation errors', () => {
      const error = new Error('Validation failed for field email');
      const category = errorReportingService.categorizeError(error);

      expect(category).toEqual({
        category: 'validation',
        severity: 'warning',
        tags: {
          error_type: 'Error',
        },
      });
    });

    it('should categorize React errors', () => {
      const error = new Error('Cannot read property of undefined');
      error.name = 'TypeError';
      const category = errorReportingService.categorizeError(error);

      expect(category).toEqual({
        category: 'react',
        severity: 'error',
        tags: {
          error_type: 'TypeError',
        },
      });
    });
  });

  describe('privacy protection', () => {
    beforeEach(() => {
      errorReportingService.init();
    });

    it('should filter sensitive fields from beforeSend', () => {
      const mockBeforeSend = (Sentry.init as any).mock.calls[0][0].beforeSend;
      
      const event = {
        message: 'Error with password=secret123',
        extra: {
          data: {
            password: 'secret',
            creditCard: '1234-5678',
            normal: 'data',
          },
        },
        request: {
          headers: {
            authorization: 'Bearer token',
            'x-api-key': 'secret-key',
          },
          data: {
            email: 'user@example.com',
          },
        },
      };

      const sanitizedEvent = mockBeforeSend(event, {});

      expect(sanitizedEvent.message).not.toContain('secret123');
      expect(sanitizedEvent.extra.data.password).toBe('[REDACTED]');
      expect(sanitizedEvent.extra.data.creditCard).toBe('[REDACTED]');
      expect(sanitizedEvent.extra.data.normal).toBe('data');
      expect(sanitizedEvent.request.headers.authorization).toBe('[REDACTED]');
      expect(sanitizedEvent.request.headers['x-api-key']).toBe('[REDACTED]');
    });

    it('should filter sensitive breadcrumbs', () => {
      const mockBeforeBreadcrumb = (Sentry.init as any).mock.calls[0][0].beforeBreadcrumb;
      
      const breadcrumb = {
        category: 'console',
        message: 'User password: secret123',
        data: {
          token: 'auth-token',
          action: 'login',
        },
      };

      const sanitizedBreadcrumb = mockBeforeBreadcrumb(breadcrumb, {});

      expect(sanitizedBreadcrumb.message).not.toContain('secret123');
      expect(sanitizedBreadcrumb.data.token).toBe('[REDACTED]');
      expect(sanitizedBreadcrumb.data.action).toBe('login');
    });

    it('should filter console breadcrumbs with sensitive data', () => {
      const mockBeforeBreadcrumb = (Sentry.init as any).mock.calls[0][0].beforeBreadcrumb;
      
      const breadcrumb = {
        category: 'console',
        level: 'warning',
        message: 'API Key: 12345',
      };

      const result = mockBeforeBreadcrumb(breadcrumb, {});

      expect(result).toBeNull();
    });
  });

  describe('mock mode', () => {
    beforeEach(() => {
      import.meta.env.VITE_SENTRY_MOCK = 'true';
      errorReportingService = new ErrorReportingService();
      errorReportingService.init();
    });

    it('should log errors instead of sending to Sentry', () => {
      const error = new Error('Test error');
      errorReportingService.captureError(error, { test: true });

      expect(Sentry.captureException).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith(
        '[MOCK] Would capture error:',
        expect.objectContaining({
          error: (error instanceof Error ? error.message : String(error)),
          stack: expect.any(String),
          context: { test: true },
        })
      );
    });

    it('should log messages instead of sending to Sentry', () => {
      errorReportingService.captureMessage('Test message', 'warning');

      expect(Sentry.captureMessage).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith(
        '[MOCK] Would capture message:',
        expect.objectContaining({
          message: 'Test message',
          level: 'warning',
        })
      );
    });
  });
});