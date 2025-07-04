/**
 * Middleware Unit Tests
 * Test suite for shared middleware functions
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  requireAuth,
  optionalAuth,
  requireRole,
  validate,
  validateQuery,
  asyncHandler,
  requestLogger,
  sanitizeInput,
  errorHandler,
  securityHeaders,
  AuthenticatedRequest,
} from '../middleware';
import { jest } from '@jest/globals';

// Mock logger
jest.mock('@/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Middleware Functions', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: { id: 1, email: 'test@example.com', name: 'Test User', role: 'TEACHER' },
      body: {},
      query: {},
      headers: {},
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        if (header === 'User-Agent') return 'Test User Agent';
        return undefined;
      }),
    };
    mockResponse = {
      json: jest.fn(() => mockResponse as Response),
      status: jest.fn(() => mockResponse as Response),
      send: jest.fn(() => mockResponse as Response),
      setHeader: jest.fn(),
      statusCode: 200,
    };
    mockNext = jest.fn();
  });

  describe('requireAuth', () => {
    it('should set userId for authenticated user', () => {
      requireAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockRequest.userId).toBe(1);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', () => {
      mockRequest.user = undefined;
      
      requireAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for user without id', () => {
      mockRequest.user = { email: 'test@example.com', name: 'Test User' } as unknown;
      
      requireAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('optionalAuth', () => {
    it('should set userId for authenticated user', () => {
      optionalAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockRequest.userId).toBe(1);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without userId for unauthenticated user', () => {
      mockRequest.user = undefined;
      
      optionalAuth(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockRequest.userId).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow user with correct role', () => {
      const middleware = requireRole('TEACHER');
      
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny user with incorrect role', () => {
      const middleware = requireRole('ADMIN');
      
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Forbidden: Insufficient permissions' 
      });
    });

    it('should deny user without role', () => {
      mockRequest.user = { id: 1, email: 'test@example.com', name: 'Test User' } as unknown;
      const middleware = requireRole('ADMIN');
      
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('validate', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    it('should validate and pass valid data', () => {
      mockRequest.body = { name: 'Test', email: 'test@example.com' };
      const middleware = validate(schema);
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockRequest.body).toEqual({ name: 'Test', email: 'test@example.com' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 for invalid data', () => {
      mockRequest.body = { name: '', email: 'invalid-email' };
      const middleware = validate(schema);
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'email' }),
        ]),
      });
    });
  });

  describe('validateQuery', () => {
    const schema = z.object({
      limit: z.coerce.number().int().min(1).max(100),
      offset: z.coerce.number().int().min(0),
    });

    it('should validate and transform query parameters', () => {
      mockRequest.query = { limit: '10', offset: '0' };
      const middleware = validateQuery(schema);
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockRequest.query).toEqual({ limit: 10, offset: 0 });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 for invalid query parameters', () => {
      mockRequest.query = { limit: 'invalid', offset: '-1' };
      const middleware = validateQuery(schema);
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'limit' }),
          expect.objectContaining({ field: 'offset' }),
        ]),
      });
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async operations', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const middleware = asyncHandler(asyncFn);
      
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch and forward async errors', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const middleware = asyncHandler(asyncFn);
      
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('requestLogger', () => {
    it('should log request completion', () => {
      const originalSend = mockResponse.send;
      mockResponse.send = jest.fn(() => {
        // Simulate response completion
        if (mockResponse.statusCode === undefined) {
          mockResponse.statusCode = 200;
        }
        return mockResponse as Response;
      });

      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      
      // Simulate sending response
      mockResponse.send!('test response');
      
      expect(mockResponse.send).toHaveBeenCalledWith('test response');
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML tags from strings', () => {
      mockRequest.body = {
        name: '<script>alert("xss")</script>John',
        description: 'This is a <b>test</b> description',
      };
      
      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockRequest.body).toEqual({
        name: 'John',
        description: 'This is a test description',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize nested objects', () => {
      mockRequest.body = {
        user: {
          name: '<script>alert("xss")</script>John',
          profile: {
            bio: 'This is a <b>test</b> bio',
          },
        },
      };
      
      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockRequest.body).toEqual({
        user: {
          name: 'John',
          profile: {
            bio: 'This is a test bio',
          },
        },
      });
    });

    it('should sanitize arrays', () => {
      mockRequest.body = {
        tags: ['<script>alert("xss")</script>tag1', 'normal tag', '<b>tag3</b>'],
      };
      
      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockRequest.body).toEqual({
        tags: ['tag1', 'normal tag', 'tag3'],
      });
    });

    it('should normalize whitespace', () => {
      mockRequest.body = {
        name: '  John   Doe  ',
        description: 'This  is  a   test',
      };
      
      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockRequest.body).toEqual({
        name: 'John Doe',
        description: 'This is a test',
      });
    });
  });

  describe('errorHandler', () => {
    it('should handle validation errors', () => {
      const validationError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
      ]);
      
      errorHandler(validationError, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [
          {
            field: 'name',
            message: 'Expected string, received number',
          },
        ],
      });
    });

    it('should handle Prisma unique constraint errors', () => {
      const error = new Error('Unique constraint failed');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Resource already exists' 
      });
    });

    it('should handle Prisma foreign key constraint errors', () => {
      const error = new Error('Foreign key constraint failed');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Invalid reference to related resource' 
      });
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');
      
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });

  describe('securityHeaders', () => {
    it('should set security headers', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security', 
        'max-age=31536000; includeSubDomains'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy', 
        'strict-origin-when-cross-origin'
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });
});