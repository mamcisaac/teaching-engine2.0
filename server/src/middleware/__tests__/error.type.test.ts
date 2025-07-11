import { describe, it, expect } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../utils/errors';

// Test type safety for error middleware
describe('Error Middleware Type Safety', () => {
  describe('Error type handling', () => {
    it('should handle different error types', () => {
      const errors: unknown[] = [
        new Error('Standard error'),
        new AppError(400, 'App error'),
        new ZodError([]),
        { message: 'Object error' },
        'String error',
        null,
        undefined
      ];

      errors.forEach(err => {
        // Safe error message extraction
        const message = err instanceof Error 
          ? err.message 
          : err && typeof err === 'object' && 'message' in err 
            ? String((err as Record<string, unknown>).message)
            : String(err);
            
        expect(typeof message).toBe('string');
      });
    });
  });

  describe('Request body type safety', () => {
    it('should safely handle request body', () => {
      const req = {
        body: { user: 'test', data: [1, 2, 3] } as unknown,
        method: 'POST',
        path: '/api/test'
      };

      // Type guard for body
      const body = req.body && typeof req.body === 'object' 
        ? req.body as Record<string, unknown>
        : {};
        
      expect(body.user).toBe('test');
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('Safe error logging data', () => {
    it('should construct error data safely', () => {
      const req = {
        method: 'GET',
        path: '/api/users',
        query: { page: '1' },
        body: undefined,
        user: { id: 123, email: 'test@example.com' },
        id: 'req-123',
        ip: '127.0.0.1',
        get: (header: string) => header === 'user-agent' ? 'Test Agent' : undefined,
        startTime: Date.now() - 100
      };

      const err = new Error('Test error');

      const errorData = {
        error: err,
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body as unknown,
        userId: req.user?.id,
        requestId: req.id,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        duration: req.startTime ? Date.now() - req.startTime : undefined,
      };

      expect(errorData.error).toBe(err);
      expect(errorData.method).toBe('GET');
      expect(errorData.userId).toBe(123);
      expect(typeof errorData.duration).toBe('number');
    });
  });

  describe('Error status code determination', () => {
    it('should determine status code safely', () => {
      function getStatusCode(err: unknown): number {
        if (err instanceof AppError) {
          return err.statusCode;
        }
        if (err instanceof ZodError) {
          return 400;
        }
        if (err && typeof err === 'object' && 'statusCode' in err) {
          const code = (err as Record<string, unknown>).statusCode;
          return typeof code === 'number' ? code : 500;
        }
        return 500;
      }

      expect(getStatusCode(new AppError(404, 'Test'))).toBe(404);
      expect(getStatusCode(new ZodError([]))).toBe(400);
      expect(getStatusCode(new Error('Test'))).toBe(500);
      expect(getStatusCode({ statusCode: 403 })).toBe(403);
      expect(getStatusCode('string error')).toBe(500);
    });
  });

  describe('Safe error response formatting', () => {
    it('should format error response safely', () => {
      interface ErrorResponse {
        error: string;
        message?: string;
        details?: unknown;
        statusCode: number;
        timestamp: string;
        requestId?: string;
      }

      function formatError(err: unknown, requestId?: string): ErrorResponse {
        const message = err instanceof Error ? err.message : String(err);
        const statusCode = err instanceof AppError ? err.statusCode : 500;
        
        return {
          error: 'Internal Server Error',
          message,
          statusCode,
          timestamp: new Date().toISOString(),
          requestId
        };
      }

      const response = formatError(new AppError(404, 'Not found'), 'req-123');
      expect(response.message).toBe('Not found');
      expect(response.statusCode).toBe(404);
      expect(response.requestId).toBe('req-123');
    });
  });
});