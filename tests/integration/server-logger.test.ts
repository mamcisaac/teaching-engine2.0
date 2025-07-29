/**
 * Server Logger Integration Tests
 * 
 * Tests the real server logger functionality with pino
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { performance } from 'perf_hooks';
import { EnhancedLogger, logger } from '../../server/src/logger';

describe('Server Logger Functionality', () => {
  let capturedLogs: Array<any> = [];
  let originalWrite: typeof process.stdout.write;

  beforeEach(() => {
    // Capture logs by intercepting stdout
    capturedLogs = [];
    originalWrite = process.stdout.write;
    
    process.stdout.write = (chunk: any, ...args: any[]): boolean => {
      if (typeof chunk === 'string') {
        try {
          // Try to parse as JSON (pino format)
          const parsed = JSON.parse(chunk);
          capturedLogs.push(parsed);
        } catch {
          // If not JSON, store as-is
          capturedLogs.push(chunk);
        }
      }
      return true;
    };
  });

  afterEach(() => {
    // Restore stdout
    process.stdout.write = originalWrite;
  });

  describe('Standard Log Methods', () => {
    it('should log with all standard levels', () => {
      logger.error('Test error', 'Error message');
      logger.warn('Test warning', 'Warning message');
      logger.info('Test info', 'Info message');
      logger.debug('Test debug', 'Debug message');
      logger.trace('Test trace', 'Trace message');

      // Filter logs by level
      const errorLog = capturedLogs.find(log => log.level === 50);
      const warnLog = capturedLogs.find(log => log.level === 40);
      const infoLog = capturedLogs.find(log => log.level === 30);
      const debugLog = capturedLogs.find(log => log.level === 20);
      const traceLog = capturedLogs.find(log => log.level === 10);

      expect(errorLog).toBeDefined();
      expect(errorLog.msg).toBe('Error message');
      expect(errorLog.message).toBe('Test error');
      
      expect(warnLog).toBeDefined();
      expect(warnLog.msg).toBe('Warning message');
      
      expect(infoLog).toBeDefined();
      expect(infoLog.msg).toBe('Info message');
      
      // Debug and trace might not appear based on log level
      if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV !== 'production') {
        expect(debugLog).toBeDefined();
      }
    });

    it('should enhance log objects with metadata', () => {
      logger.info({ userId: 123, action: 'login' }, 'User logged in');

      const log = capturedLogs.find(log => log.msg === 'User logged in');
      expect(log).toBeDefined();
      expect(log.userId).toBe(123);
      expect(log.action).toBe('login');
      expect(log.service).toBe('teaching-engine');
      expect(log.requestId).toBeDefined(); // Will be null unless set
    });

    it('should handle string-only logging', () => {
      logger.info('Simple string message');

      const log = capturedLogs.find(log => log.message === 'Simple string message');
      expect(log).toBeDefined();
      expect(log.service).toBe('teaching-engine');
    });
  });

  describe('Request ID Tracking', () => {
    it('should track request IDs across log entries', () => {
      const requestId = 'req-12345';
      logger.setRequestId(requestId);

      logger.info('First log');
      logger.warn('Second log');

      const logs = capturedLogs.filter(log => log.requestId === requestId);
      expect(logs).toHaveLength(2);
    });

    it('should propagate request ID to child loggers', () => {
      const requestId = 'req-67890';
      logger.setRequestId(requestId);

      const childLogger = logger.child({ module: 'auth' });
      childLogger.info('Child log');

      const log = capturedLogs.find(log => log.msg === 'Child log');
      expect(log).toBeDefined();
      expect(log.requestId).toBe(requestId);
      expect(log.module).toBe('auth');
    });
  });

  describe('Specialized Logging Methods', () => {
    it('should log audit events with sanitization', () => {
      logger.audit('user_update', {
        userId: 123,
        email: 'test@example.com',
        password: 'should-be-removed',
        token: 'should-be-removed',
        changes: { name: 'New Name' }
      });

      const log = capturedLogs.find(log => log.msg?.includes('Audit: user_update'));
      expect(log).toBeDefined();
      expect(log.audit).toBe(true);
      expect(log.operation).toBe('user_update');
      expect(log.details.password).toBeUndefined();
      expect(log.details.token).toBeUndefined();
      expect(log.details.email).toMatch(/^te\*\*\*@example\.com$/);
      expect(log.details.changes).toEqual({ name: 'New Name' });
    });

    it('should log security events with IP masking', () => {
      logger.security('failed_login', {
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        attemptedEmail: 'hacker@evil.com'
      });

      const log = capturedLogs.find(log => log.msg?.includes('Security: failed_login'));
      expect(log).toBeDefined();
      expect(log.security).toBe(true);
      expect(log.event).toBe('failed_login');
      expect(log.details.ip).toBe('192.168.xxx.xxx');
      expect(log.details.userAgent).toHaveLength(100); // Truncated
    });

    it('should log business events with PII removal', () => {
      logger.business('enrollment_created', {
        enrollmentId: 456,
        courseId: 789,
        studentData: { ssn: '123-45-6789' }, // Should be removed
        personalInfo: { creditCard: '1234-5678-9012-3456' } // Should be removed
      });

      const log = capturedLogs.find(log => log.msg?.includes('Business: enrollment_created'));
      expect(log).toBeDefined();
      expect(log.business).toBe(true);
      expect(log.action).toBe('enrollment_created');
      expect(log.context.enrollmentId).toBe(456);
      expect(log.context.studentData).toBeUndefined();
      expect(log.context.personalInfo).toBeUndefined();
    });

    it('should log database operations with query sanitization', () => {
      logger.database('user_insert', {
        table: 'users',
        query: "INSERT INTO users (email, password) VALUES ('test@example.com', password='secret123')",
        duration: 45
      });

      const log = capturedLogs.find(log => log.msg?.includes('Database: user_insert'));
      expect(log).toBeDefined();
      expect(log.database).toBe(true);
      expect(log.details.query).toContain("password='[REDACTED]'");
      expect(log.details.query).not.toContain('secret123');
    });

    it('should log AI operations with prompt truncation', () => {
      const longPrompt = 'a'.repeat(600);
      logger.ai('completion', 'gpt-3.5-turbo', {
        prompt: longPrompt,
        tokens: 150,
        response: 'AI response'
      });

      const log = capturedLogs.find(log => log.msg?.includes('AI: completion using gpt-3.5-turbo'));
      expect(log).toBeDefined();
      expect(log.ai).toBe(true);
      expect(log.model).toBe('gpt-3.5-turbo');
      expect(log.details.prompt).toHaveLength(503); // 500 + '...'
      expect(log.details.tokens).toBe(150);
    });
  });

  describe('API Request/Response Logging', () => {
    it('should log API requests', () => {
      const req = {
        method: 'POST',
        url: '/api/users',
        headers: { 'content-type': 'application/json' },
        body: { name: 'Test User' }
      };

      logger.apiRequest(req, { correlationId: 'corr-123' });

      const log = capturedLogs.find(log => log.type === 'request');
      expect(log).toBeDefined();
      expect(log.api).toBe(true);
      expect(log.req).toEqual(req);
      expect(log.correlationId).toBe('corr-123');
    });

    it('should log API responses with duration', () => {
      const req = { method: 'GET', url: '/api/users/123' };
      const res = { statusCode: 200, data: { id: 123, name: 'Test' } };

      logger.apiResponse(req, res, 125.5, { cached: true });

      const log = capturedLogs.find(log => log.type === 'response');
      expect(log).toBeDefined();
      expect(log.api).toBe(true);
      expect(log.duration).toBe(125.5);
      expect(log.cached).toBe(true);
      expect(log.msg).toContain('GET /api/users/123 - 200 (125.5ms)');
    });
  });

  describe('Performance Logging', () => {
    it('should track performance timing', () => {
      const label = 'database_query';
      
      // Capture current time
      const startTime = performance.now();
      logger.time(label);

      // Simulate some work
      const workDuration = 50;
      const start = Date.now();
      while (Date.now() - start < workDuration) {
        // Busy wait
      }

      logger.timeEnd(label);

      // Check logs
      const startLog = capturedLogs.find(log => 
        log.performanceStart === label
      );
      const endLog = capturedLogs.find(log => 
        log.performanceEnd === label
      );

      expect(startLog).toBeDefined();
      expect(endLog).toBeDefined();
      expect(startLog.timestamp).toBeLessThan(endLog.timestamp);
    });
  });

  describe('Serializers', () => {
    it('should serialize request objects', () => {
      const req = {
        method: 'POST',
        url: '/api/auth/login',
        headers: {
          'user-agent': 'TestAgent/1.0',
          'content-type': 'application/json',
          'authorization': 'Bearer secret-token'
        },
        remoteAddress: '10.0.0.1',
        remotePort: 54321
      };

      logger.info({ req }, 'Request received');

      const log = capturedLogs.find(log => log.msg === 'Request received');
      expect(log).toBeDefined();
      expect(log.req.headers.authorization).toBe('[REDACTED]');
      expect(log.req.headers['user-agent']).toBe('TestAgent/1.0');
      expect(log.req.remoteAddress).toBe('10.0.0.1');
    });

    it('should serialize response objects', () => {
      const res = {
        statusCode: 201,
        getHeader: (name: string) => {
          const headers: Record<string, string> = {
            'content-type': 'application/json',
            'content-length': '42'
          };
          return headers[name];
        }
      };

      logger.info({ res }, 'Response sent');

      const log = capturedLogs.find(log => log.msg === 'Response sent');
      expect(log).toBeDefined();
      expect(log.res.statusCode).toBe(201);
      expect(log.res.headers['content-type']).toBe('application/json');
      expect(log.res.headers['content-length']).toBe('42');
    });

    it('should serialize error objects', () => {
      const err = new Error('Test error');
      err.stack = 'Error: Test error\n    at Test.fn (test.js:10:15)';

      logger.error({ err }, 'An error occurred');

      const log = capturedLogs.find(log => log.msg === 'An error occurred');
      expect(log).toBeDefined();
      expect(log.err.message).toBe('Test error');
      expect(log.err.stack).toContain('Test error');
      expect(log.err.type).toBe('Error');
    });

    it('should serialize user objects with email masking', () => {
      const user = {
        id: 123,
        email: 'john.doe@example.com',
        role: 'admin',
        password: 'should-not-appear'
      };

      logger.info({ user }, 'User action');

      const log = capturedLogs.find(log => log.msg === 'User action');
      expect(log).toBeDefined();
      expect(log.user.id).toBe(123);
      expect(log.user.email).toBe('joh***');
      expect(log.user.role).toBe('admin');
      expect(log.user.password).toBeUndefined();
    });
  });

  describe('Child Logger Creation', () => {
    it('should create child logger with additional context', () => {
      const childLogger = logger.child({ 
        module: 'auth',
        version: '1.0.0'
      });

      childLogger.info('Child logger message');

      const log = capturedLogs.find(log => log.msg === 'Child logger message');
      expect(log).toBeDefined();
      expect(log.module).toBe('auth');
      expect(log.version).toBe('1.0.0');
      expect(log.service).toBe('teaching-engine');
    });

    it('should maintain child logger type with all methods', () => {
      const childLogger = logger.child({ component: 'test' });

      // Verify child has all enhanced methods
      expect(typeof childLogger.audit).toBe('function');
      expect(typeof childLogger.security).toBe('function');
      expect(typeof childLogger.business).toBe('function');
      expect(typeof childLogger.database).toBe('function');
      expect(typeof childLogger.ai).toBe('function');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined values in sanitization', () => {
      logger.audit('test_audit', {
        email: null,
        data: undefined,
        valid: true
      });

      const log = capturedLogs.find(log => log.operation === 'test_audit');
      expect(log).toBeDefined();
      expect(log.details.email).toBeNull();
      expect(log.details.data).toBeUndefined();
      expect(log.details.valid).toBe(true);
    });

    it('should handle invalid IP addresses', () => {
      logger.security('invalid_ip', {
        ip: 'not-an-ip',
        action: 'test'
      });

      const log = capturedLogs.find(log => log.event === 'invalid_ip');
      expect(log).toBeDefined();
      expect(log.details.ip).toBe('xxx.xxx.xxx.xxx');
    });

    it('should handle missing email parts', () => {
      const childLogger = logger.child({});
      
      // Test with invalid email in audit log
      (childLogger as any).redactEmail('invalid-email');
      (childLogger as any).redactEmail('@no-local-part.com');
      (childLogger as any).redactEmail('no-domain@');
      
      // These should not throw errors
      expect(() => {
        logger.audit('email_test', { email: 'invalid' });
      }).not.toThrow();
    });

    it('should handle circular references in log data', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      // Should not throw when logging circular references
      expect(() => {
        logger.info({ data: circular }, 'Circular reference test');
      }).not.toThrow();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should log efficiently without significant overhead', () => {
      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        logger.info({ iteration: i }, `Log message ${i}`);
      }

      const duration = performance.now() - start;
      const averageTime = duration / iterations;

      // Average time per log should be under 1ms
      expect(averageTime).toBeLessThan(1);
    });
  });
});