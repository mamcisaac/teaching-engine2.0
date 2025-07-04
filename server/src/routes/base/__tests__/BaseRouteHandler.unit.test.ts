/**
 * BaseRouteHandler Unit Tests
 * Comprehensive test suite for the BaseRouteHandler abstract class
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BaseRouteHandler, CrudOperations, AuthenticatedRequest } from '../BaseRouteHandler';
import { BaseService } from '../../../services/base/BaseService';
import { jest } from '@jest/globals';

// Mock logger
jest.mock('@/logger', () => ({
  default: {
    child: jest.fn(() => ({
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    })),
  },
}));

// Test implementation of BaseRouteHandler
class TestService extends BaseService {
  constructor() {
    super('TestService');
  }

  async create(data: unknown): Promise<unknown> {
    return { id: '123', ...data };
  }

  async findMany(): Promise<any[]> {
    return [{ id: '1', name: 'Test 1' }, { id: '2', name: 'Test 2' }];
  }

  async findById(id: string): Promise<any | null> {
    if (id === 'not-found') return null;
    return { id, name: `Test ${id}` };
  }

  async update(id: string, data: unknown): Promise<unknown> {
    return { id, ...data };
  }

  async delete(id: string): Promise<boolean> {
    return id !== 'not-found';
  }
}

class TestRouteHandler extends BaseRouteHandler {
  private testService: TestService;

  constructor() {
    super({
      routeName: 'test',
      requireAuth: true,
    });
    this.testService = new TestService();
  }

  protected getService(): BaseService {
    return this.testService;
  }

  protected getValidationSchemas() {
    return {
      create: z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
      }),
      update: z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      }),
      query: z.object({
        limit: z.coerce.number().int().min(1).max(100).default(10),
        offset: z.coerce.number().int().min(0).default(0),
        search: z.string().optional(),
      }),
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: this.testService.create.bind(this.testService),
      findMany: this.testService.findMany.bind(this.testService),
      findById: this.testService.findById.bind(this.testService),
      update: this.testService.update.bind(this.testService),
      delete: this.testService.delete.bind(this.testService),
    };
  }
}

describe('BaseRouteHandler', () => {
  let handler: TestRouteHandler;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    handler = new TestRouteHandler();
    mockRequest = {
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      userId: 1,
      params: {},
      query: {},
      body: {},
      method: 'GET',
      path: '/test',
    };
    mockResponse = {
      json: jest.fn(() => mockResponse as Response),
      status: jest.fn(() => mockResponse as Response),
      send: jest.fn(() => mockResponse as Response),
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('Authentication', () => {
    it('should require authentication by default', () => {
      expect(handler.getRouteName()).toBe('test');
    });

    it('should set userId from authenticated user', () => {
      const middleware = handler['requireAuthentication'];
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockRequest.userId).toBe(1);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated requests', () => {
      mockRequest.user = undefined;
      const middleware = handler['requireAuthentication'];
      middleware(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('CRUD Operations', () => {
    describe('handleList', () => {
      it('should return list of items', async () => {
        mockRequest.query = { limit: '5', offset: '0' };
        
        await handler['handleList'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.json).toHaveBeenCalledWith([
          { id: '1', name: 'Test 1' },
          { id: '2', name: 'Test 2' },
        ]);
      });

      it('should handle query validation errors', async () => {
        mockRequest.query = { limit: 'invalid' };
        
        await handler['handleList'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    describe('handleGet', () => {
      it('should return single item by id', async () => {
        mockRequest.params = { id: '123' };
        
        await handler['handleGet'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.json).toHaveBeenCalledWith({
          id: '123',
          name: 'Test 123',
        });
      });

      it('should return 404 for non-existent item', async () => {
        mockRequest.params = { id: 'not-found' };
        
        await handler['handleGet'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'test not found' });
      });
    });

    describe('handleCreate', () => {
      it('should create new item with valid data', async () => {
        mockRequest.body = { name: 'New Test Item', email: 'test@example.com' };
        
        await handler['handleCreate'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
          id: '123',
          name: 'New Test Item',
          email: 'test@example.com',
        });
      });

      it('should handle validation errors', async () => {
        mockRequest.body = { name: '', email: 'invalid-email' };
        
        await handler['handleCreate'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    describe('handleUpdate', () => {
      it('should update existing item', async () => {
        mockRequest.params = { id: '123' };
        mockRequest.body = { name: 'Updated Name' };
        
        await handler['handleUpdate'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.json).toHaveBeenCalledWith({
          id: '123',
          name: 'Updated Name',
        });
      });

      it('should handle partial updates', async () => {
        mockRequest.params = { id: '123' };
        mockRequest.body = { email: 'new@example.com' };
        
        await handler['handleUpdate'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.json).toHaveBeenCalledWith({
          id: '123',
          email: 'new@example.com',
        });
      });
    });

    describe('handleDelete', () => {
      it('should delete existing item', async () => {
        mockRequest.params = { id: '123' };
        
        await handler['handleDelete'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.send).toHaveBeenCalled();
      });

      it('should return 404 for non-existent item', async () => {
        mockRequest.params = { id: 'not-found' };
        
        await handler['handleDelete'](
          mockRequest as AuthenticatedRequest,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'test not found' });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      // Mock service to throw error
      jest.spyOn(handler.getCrudOperations(), 'findMany').mockRejectedValue(new Error('Service error'));
      
      await handler['handleList'](
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should log errors with context', async () => {
      const errorSpy = jest.spyOn(handler['logger'], 'error');
      jest.spyOn(handler.getCrudOperations(), 'findMany').mockRejectedValue(new Error('Service error'));
      
      await handler['handleList'](
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(errorSpy).toHaveBeenCalledWith('Error in test list:', expect.any(Error));
    });
  });

  describe('Ownership Validation', () => {
    it('should create proper ownership filter', () => {
      const filter = handler['createOwnershipFilter'](1, { status: 'active' });
      
      expect(filter).toEqual({
        AND: [
          {
            OR: [
              { isSystem: true },
              { createdByUserId: 1 },
              { userId: 1 },
            ],
          },
          { status: 'active' },
        ],
      });
    });

    it('should create ownership filter without additional filters', () => {
      const filter = handler['createOwnershipFilter'](1);
      
      expect(filter).toEqual({
        AND: [
          {
            OR: [
              { isSystem: true },
              { createdByUserId: 1 },
              { userId: 1 },
            ],
          },
        ],
      });
    });
  });

  describe('Async Handler Wrapper', () => {
    it('should catch and forward async errors', async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
      const wrappedFn = handler['asyncHandler'](asyncFn);
      
      await wrappedFn(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle successful async operations', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = handler['asyncHandler'](asyncFn);
      
      await wrappedFn(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(asyncFn).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Router Integration', () => {
    it('should provide router instance', () => {
      const router = handler.getRouter();
      expect(router).toBeDefined();
    });

    it('should have correct route name', () => {
      expect(handler.getRouteName()).toBe('test');
    });
  });
});