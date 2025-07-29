/**
 * API Validation Integration Tests
 * 
 * Tests the real API validation utilities with various scenarios
 */

import { describe, it, expect } from '@jest/globals';
import * as apiValidation from '../../shared/utils/apiValidation';
import * as typeGuards from '../../shared/utils/typeGuards';

describe('API Validation - Response Structures', () => {
  describe('isStandardApiResponse', () => {
    it('should validate standard API responses', () => {
      const successResponse = {
        success: true,
        data: { id: 1, name: 'Test' }
      };
      
      expect(apiValidation.isStandardApiResponse(successResponse)).toBe(true);
      
      const errorResponse = {
        success: false,
        error: 'Something went wrong',
        message: 'Please try again later'
      };
      
      expect(apiValidation.isStandardApiResponse(errorResponse)).toBe(true);
      
      const minimalResponse = {
        success: true
      };
      
      expect(apiValidation.isStandardApiResponse(minimalResponse)).toBe(true);
    });

    it('should reject invalid API responses', () => {
      // Missing success field
      expect(apiValidation.isStandardApiResponse({ data: 'test' })).toBe(false);
      
      // Success is not boolean
      expect(apiValidation.isStandardApiResponse({ success: 'true' })).toBe(false);
      
      // Error is not string
      expect(apiValidation.isStandardApiResponse({ 
        success: false, 
        error: 123 
      })).toBe(false);
      
      // Message is not string
      expect(apiValidation.isStandardApiResponse({ 
        success: true, 
        message: { text: 'hello' } 
      })).toBe(false);
      
      // Not an object
      expect(apiValidation.isStandardApiResponse('success')).toBe(false);
      expect(apiValidation.isStandardApiResponse(null)).toBe(false);
    });

    it('should handle optional fields correctly', () => {
      const responseWithNullData = {
        success: true,
        data: null
      };
      
      // data can be null or any value
      expect(apiValidation.isStandardApiResponse(responseWithNullData)).toBe(true);
      
      const responseWithUndefinedError = {
        success: true,
        error: undefined
      };
      
      // undefined optional fields are valid
      expect(apiValidation.isStandardApiResponse(responseWithUndefinedError)).toBe(true);
    });
  });

  describe('isPaginatedResponse', () => {
    it('should validate paginated responses', () => {
      const validPaginated = {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        total: 50,
        page: 1,
        pageSize: 10,
        hasMore: true
      };
      
      expect(apiValidation.isPaginatedResponse(validPaginated)).toBe(true);
      
      const minimalPaginated = {
        items: [],
        total: 0
      };
      
      expect(apiValidation.isPaginatedResponse(minimalPaginated)).toBe(true);
    });

    it('should reject invalid paginated responses', () => {
      // Missing items
      expect(apiValidation.isPaginatedResponse({ total: 10 })).toBe(false);
      
      // Items not array
      expect(apiValidation.isPaginatedResponse({ 
        items: 'not array', 
        total: 10 
      })).toBe(false);
      
      // Missing total
      expect(apiValidation.isPaginatedResponse({ items: [] })).toBe(false);
      
      // Total not number
      expect(apiValidation.isPaginatedResponse({ 
        items: [], 
        total: '10' 
      })).toBe(false);
      
      // Invalid total (NaN)
      expect(apiValidation.isPaginatedResponse({ 
        items: [], 
        total: NaN 
      })).toBe(false);
    });
  });

  describe('isDatabaseResult', () => {
    it('should validate database results', () => {
      expect(apiValidation.isDatabaseResult(null)).toBe(true);
      expect(apiValidation.isDatabaseResult({})).toBe(true);
      expect(apiValidation.isDatabaseResult({ id: 1, name: 'Test' })).toBe(true);
      
      expect(apiValidation.isDatabaseResult(undefined)).toBe(false);
      expect(apiValidation.isDatabaseResult('string')).toBe(false);
      expect(apiValidation.isDatabaseResult(123)).toBe(false);
      expect(apiValidation.isDatabaseResult([])).toBe(false);
    });
  });

  describe('isValidRequestBody', () => {
    it('should validate request bodies', () => {
      expect(apiValidation.isValidRequestBody({ key: 'value' })).toBe(true);
      expect(apiValidation.isValidRequestBody({ a: 1, b: 2 })).toBe(true);
      
      expect(apiValidation.isValidRequestBody({})).toBe(false); // Empty object
      expect(apiValidation.isValidRequestBody(null)).toBe(false);
      expect(apiValidation.isValidRequestBody('string')).toBe(false);
      expect(apiValidation.isValidRequestBody([])).toBe(false);
    });
  });
});

describe('API Validation - Error Handling', () => {
  describe('createErrorResponse', () => {
    it('should create error response from Error instances', () => {
      const error = new Error('Test error');
      const response = apiValidation.createErrorResponse(error);
      
      expect(response.error).toBe('Test error');
      expect(response.details).toBeUndefined();
    });

    it('should create error response from error-like objects', () => {
      const errorLike = { 
        message: 'Custom error', 
        code: 'E001',
        statusCode: 400 
      };
      const response = apiValidation.createErrorResponse(errorLike);
      
      expect(response.error).toBe('Custom error');
      expect(response.details).toEqual(errorLike);
    });

    it('should handle unknown error types', () => {
      const response1 = apiValidation.createErrorResponse('string error');
      expect(response1.error).toBe('An unknown error occurred');
      
      const response2 = apiValidation.createErrorResponse(123);
      expect(response2.error).toBe('An unknown error occurred');
      
      const response3 = apiValidation.createErrorResponse(null);
      expect(response3.error).toBe('An unknown error occurred');
    });
  });
});

describe('API Validation - JSON Parsing', () => {
  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = apiValidation.safeJsonParse('{"key": "value"}');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ key: 'value' });
      }
    });

    it('should handle parsing errors', () => {
      const result = apiValidation.safeJsonParse('invalid json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unexpected');
      }
    });

    it('should validate parsed data with custom validator', () => {
      const validator = (value: unknown): value is { type: string } => {
        return typeGuards.isObject(value) && 
               typeGuards.hasProperty(value, 'type') && 
               typeGuards.isString(value.type);
      };
      
      const validResult = apiValidation.safeJsonParse(
        '{"type": "test"}',
        validator
      );
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data.type).toBe('test');
      }
      
      const invalidResult = apiValidation.safeJsonParse(
        '{"name": "test"}',
        validator
      );
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error).toBe('Parsed data does not match expected format');
      }
    });

    it('should handle edge cases', () => {
      // Empty string
      const emptyResult = apiValidation.safeJsonParse('');
      expect(emptyResult.success).toBe(false);
      
      // Null value
      const nullResult = apiValidation.safeJsonParse('null');
      expect(nullResult.success).toBe(true);
      if (nullResult.success) {
        expect(nullResult.data).toBe(null);
      }
      
      // Simple values
      const numberResult = apiValidation.safeJsonParse('123');
      expect(numberResult.success).toBe(true);
      if (numberResult.success) {
        expect(numberResult.data).toBe(123);
      }
      
      const boolResult = apiValidation.safeJsonParse('true');
      expect(boolResult.success).toBe(true);
      if (boolResult.success) {
        expect(boolResult.data).toBe(true);
      }
    });
  });
});

describe('API Validation - Query Parameters', () => {
  describe('getValidQueryParam', () => {
    it('should extract valid string parameters', () => {
      const params = {
        name: 'test',
        empty: '',
        number: 123,
        nullValue: null,
        undefinedValue: undefined
      };
      
      expect(apiValidation.getValidQueryParam(params, 'name', 'default')).toBe('test');
      expect(apiValidation.getValidQueryParam(params, 'empty', 'default')).toBe('default');
      expect(apiValidation.getValidQueryParam(params, 'number', 'default')).toBe('default');
      expect(apiValidation.getValidQueryParam(params, 'nullValue', 'default')).toBe('default');
      expect(apiValidation.getValidQueryParam(params, 'missing', 'default')).toBe('default');
    });
  });

  describe('getValidNumericParam', () => {
    it('should extract valid numeric parameters', () => {
      const params = {
        validNumber: 42,
        stringNumber: '123',
        invalidString: 'abc',
        float: 3.14,
        zero: 0,
        negative: -10
      };
      
      expect(apiValidation.getValidNumericParam(params, 'validNumber', 0)).toBe(42);
      expect(apiValidation.getValidNumericParam(params, 'stringNumber', 0)).toBe(123);
      expect(apiValidation.getValidNumericParam(params, 'invalidString', 0)).toBe(0);
      expect(apiValidation.getValidNumericParam(params, 'float', 0)).toBe(3.14);
      expect(apiValidation.getValidNumericParam(params, 'zero', 10)).toBe(0);
      expect(apiValidation.getValidNumericParam(params, 'negative', 0)).toBe(-10);
      expect(apiValidation.getValidNumericParam(params, 'missing', 99)).toBe(99);
    });

    it('should handle edge cases', () => {
      const params = {
        nan: NaN,
        infinity: Infinity,
        stringFloat: '3.14',
        hexString: '0xFF',
        emptyString: ''
      };
      
      expect(apiValidation.getValidNumericParam(params, 'nan', 0)).toBe(0);
      expect(apiValidation.getValidNumericParam(params, 'infinity', 0)).toBe(0);
      expect(apiValidation.getValidNumericParam(params, 'stringFloat', 0)).toBe(3); // parseInt
      expect(apiValidation.getValidNumericParam(params, 'hexString', 0)).toBe(0);
      expect(apiValidation.getValidNumericParam(params, 'emptyString', 5)).toBe(5);
    });
  });

  describe('getValidBooleanParam', () => {
    it('should extract valid boolean parameters', () => {
      const params = {
        boolTrue: true,
        boolFalse: false,
        stringTrue: 'true',
        stringFalse: 'false',
        one: '1',
        zero: '0',
        other: 'yes'
      };
      
      expect(apiValidation.getValidBooleanParam(params, 'boolTrue', false)).toBe(true);
      expect(apiValidation.getValidBooleanParam(params, 'boolFalse', true)).toBe(false);
      expect(apiValidation.getValidBooleanParam(params, 'stringTrue', false)).toBe(true);
      expect(apiValidation.getValidBooleanParam(params, 'stringFalse', true)).toBe(false);
      expect(apiValidation.getValidBooleanParam(params, 'one', false)).toBe(true);
      expect(apiValidation.getValidBooleanParam(params, 'zero', true)).toBe(false);
      expect(apiValidation.getValidBooleanParam(params, 'other', false)).toBe(false);
      expect(apiValidation.getValidBooleanParam(params, 'missing', true)).toBe(true);
    });
  });
});

describe('API Validation - File Upload', () => {
  describe('isValidFileUpload', () => {
    it('should validate file upload objects', () => {
      const validFile = {
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test content')
      };
      
      expect(apiValidation.isValidFileUpload(validFile)).toBe(true);
    });

    it('should reject invalid file uploads', () => {
      // Missing filename
      expect(apiValidation.isValidFileUpload({
        mimetype: 'text/plain',
        size: 100,
        buffer: Buffer.from('test')
      })).toBe(false);
      
      // Invalid buffer
      expect(apiValidation.isValidFileUpload({
        filename: 'test.txt',
        mimetype: 'text/plain',
        size: 100,
        buffer: 'not a buffer'
      })).toBe(false);
      
      // Invalid size
      expect(apiValidation.isValidFileUpload({
        filename: 'test.txt',
        mimetype: 'text/plain',
        size: 'large',
        buffer: Buffer.from('test')
      })).toBe(false);
      
      // Not an object
      expect(apiValidation.isValidFileUpload('file')).toBe(false);
    });
  });
});

describe('API Validation - Authentication', () => {
  describe('isValidAuthData', () => {
    it('should validate authentication data', () => {
      expect(apiValidation.isValidAuthData({
        email: 'test@example.com'
      })).toBe(true);
      
      expect(apiValidation.isValidAuthData({
        email: 'user@domain.co.uk',
        password: 'secret123'
      })).toBe(true);
      
      expect(apiValidation.isValidAuthData({
        email: 'user@example.com',
        token: 'jwt-token-here'
      })).toBe(true);
    });

    it('should reject invalid authentication data', () => {
      // Missing email
      expect(apiValidation.isValidAuthData({
        password: 'secret'
      })).toBe(false);
      
      // Invalid email format
      expect(apiValidation.isValidAuthData({
        email: 'not-an-email'
      })).toBe(false);
      
      // Email not string
      expect(apiValidation.isValidAuthData({
        email: 123
      })).toBe(false);
      
      // Not an object
      expect(apiValidation.isValidAuthData('email@example.com')).toBe(false);
      expect(apiValidation.isValidAuthData(null)).toBe(false);
    });
  });
});

describe('API Validation - Integration Scenarios', () => {
  it('should validate complex API response', () => {
    const complexResponse = {
      success: true,
      data: {
        users: [
          { id: 1, name: 'User 1', email: 'user1@example.com' },
          { id: 2, name: 'User 2', email: 'user2@example.com' }
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          hasMore: false
        }
      },
      message: 'Users retrieved successfully'
    };
    
    expect(apiValidation.isStandardApiResponse(complexResponse)).toBe(true);
    
    // Check nested pagination
    if (typeGuards.isObject(complexResponse.data)) {
      expect(apiValidation.isPaginatedResponse({
        items: complexResponse.data.users as any[],
        ...complexResponse.data.pagination
      })).toBe(true);
    }
  });

  it('should handle error response transformation', () => {
    // Simulate API error
    const apiError = {
      response: {
        status: 400,
        data: {
          success: false,
          error: 'Validation failed',
          details: {
            field: 'email',
            message: 'Invalid email format'
          }
        }
      }
    };
    
    const errorResponse = apiValidation.createErrorResponse(apiError.response.data);
    expect(errorResponse.error).toBe('Validation failed');
    expect(errorResponse.details).toEqual(apiError.response.data);
  });

  it('should validate and parse API request flow', () => {
    // Simulate incoming request
    const requestBody = '{"name": "New User", "email": "new@example.com"}';
    
    // Parse request body
    const parseResult = apiValidation.safeJsonParse(requestBody);
    expect(parseResult.success).toBe(true);
    
    if (parseResult.success) {
      // Validate it's a proper request body
      expect(apiValidation.isValidRequestBody(parseResult.data)).toBe(true);
      
      // Validate auth data if needed
      if (typeGuards.hasProperty(parseResult.data, 'email')) {
        expect(apiValidation.isValidAuthData(parseResult.data)).toBe(true);
      }
    }
  });
});

describe('API Validation - Performance', () => {
  it('should validate efficiently', () => {
    const iterations = 10000;
    const testResponse = {
      success: true,
      data: { id: 1, name: 'Test' },
      message: 'Success'
    };
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      apiValidation.isStandardApiResponse(testResponse);
      apiValidation.createErrorResponse(new Error('Test'));
      apiValidation.getValidQueryParam({ page: '1' }, 'page', '1');
      apiValidation.getValidNumericParam({ limit: '10' }, 'limit', 10);
    }
    
    const duration = performance.now() - start;
    const averageTime = duration / iterations;
    
    // Each iteration should be under 0.01ms
    expect(averageTime).toBeLessThan(0.01);
  });
});