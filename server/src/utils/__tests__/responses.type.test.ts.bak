import type { Response } from 'express';
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendAccepted,
} from '../responses';

// Mock Response with proper typing
const createMockResponse = (): Response => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    locals: {
      requestId: 'test-request-id',
    },
  } as unknown as Response;

  return res;
};

describe('responses.ts type safety tests', () => {
  describe('Response locals typing', () => {
    it('should access res.locals.requestId without unsafe casts', () => {
      const res = createMockResponse();
      
      // After fixing types, we should be able to access locals directly
      // without the unsafe cast: (res as unknown as { locals?: { requestId?: string } })
      
      // This test verifies that the Response type properly includes locals
      expect(res.locals).toBeDefined();
      expect(res.locals.requestId).toBe('test-request-id');
    });

    it('should handle optional requestId in locals', () => {
      const res = createMockResponse();
      res.locals = {}; // No requestId
      
      // Should handle undefined requestId gracefully
      sendSuccess(res, { message: 'test' });
      
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.meta.requestId).toBeUndefined();
    });
  });

  describe('sendSuccess type safety', () => {
    it('should accept properly typed data without any casts', () => {
      const res = createMockResponse();
      
      interface UserData {
        id: number;
        name: string;
      }
      
      const userData: UserData = {
        id: 1,
        name: 'Test User',
      };
      
      sendSuccess(res, userData);
      
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.data).toEqual(userData);
      expect(jsonCall.meta.timestamp).toBeDefined();
      expect(jsonCall.meta.requestId).toBe('test-request-id');
    });
  });

  describe('sendCreated type safety', () => {
    it('should handle location header and requestId properly', () => {
      const res = createMockResponse();
      const location = '/api/users/1';
      
      sendCreated(res, { id: 1 }, location);
      
      expect(res.setHeader).toHaveBeenCalledWith('Location', location);
      expect(res.status).toHaveBeenCalledWith(201);
      
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.meta.location).toBe(location);
      expect(jsonCall.meta.requestId).toBe('test-request-id');
    });
  });

  describe('sendPaginated type safety', () => {
    it('should handle pagination metadata with proper typing', () => {
      const res = createMockResponse();
      const data = [{ id: 1 }, { id: 2 }];
      
      sendPaginated(res, data, 1, 10, 20);
      
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.meta.pagination).toEqual({
        page: 1,
        pageSize: 10,
        totalPages: 2,
        totalItems: 20,
        hasNextPage: true,
        hasPreviousPage: false,
      });
      expect(jsonCall.meta.requestId).toBe('test-request-id');
    });
  });

  describe('sendAccepted type safety', () => {
    it('should handle optional data parameter with proper typing', () => {
      const res = createMockResponse();
      
      // Without data
      sendAccepted(res);
      let jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.message).toBe('Request accepted for processing');
      expect(jsonCall.meta.requestId).toBe('test-request-id');
      
      // With data
      (res.json as jest.Mock).mockClear();
      sendAccepted(res, { jobId: 'job-123' });
      jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.data).toEqual({ jobId: 'job-123' });
    });
  });

  describe('Type inference', () => {
    it('should properly infer generic types', () => {
      const res = createMockResponse();
      
      interface Product {
        id: number;
        name: string;
        price: number;
      }
      
      const products: Product[] = [
        { id: 1, name: 'Product 1', price: 10.99 },
        { id: 2, name: 'Product 2', price: 20.99 },
      ];
      
      // Type should be inferred correctly
      sendPaginated(res, products, 1, 10, 2);
      
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      // TypeScript should know that data is Product[]
      expect(jsonCall.data[0].price).toBe(10.99);
    });
  });
});