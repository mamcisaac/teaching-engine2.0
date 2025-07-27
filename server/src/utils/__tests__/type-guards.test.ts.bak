import { describe, it, expect } from '@jest/globals';
import {
  getErrorMessage,
  isRecord,
  hasArrayProperty,
  hasProperty,
  safeJsonParse,
  toRecord,
  isString,
  isNumber,
  isArray,
  getNestedProperty,
  isRequestLike,
  getTypedBody,
  getTypedParams,
  getTypedQuery
} from '../type-guards';

describe('Type Guards', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error instances', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should convert non-Error values to string', () => {
      expect(getErrorMessage('string error')).toBe('string error');
      expect(getErrorMessage(123)).toBe('123');
      expect(getErrorMessage(null)).toBe('null');
      expect(getErrorMessage(undefined)).toBe('undefined');
      expect(getErrorMessage({ code: 'ERR' })).toBe('[object Object]');
    });
  });

  describe('isRecord', () => {
    it('should identify valid records', () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ key: 'value' })).toBe(true);
    });

    it('should reject non-records', () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord(undefined)).toBe(false);
      expect(isRecord([])).toBe(false);
      expect(isRecord('string')).toBe(false);
      expect(isRecord(123)).toBe(false);
    });
  });

  describe('hasArrayProperty', () => {
    it('should identify objects with array properties', () => {
      const obj = { items: [1, 2, 3], name: 'test' };
      expect(hasArrayProperty(obj, 'items')).toBe(true);
      expect(hasArrayProperty(obj, 'name')).toBe(false);
    });

    it('should handle invalid inputs', () => {
      expect(hasArrayProperty(null, 'items')).toBe(false);
      expect(hasArrayProperty('string', 'items')).toBe(false);
      expect(hasArrayProperty({}, 'items')).toBe(false);
    });
  });

  describe('hasProperty', () => {
    it('should identify objects with specific properties', () => {
      const obj = { id: '123', name: 'test' };
      expect(hasProperty(obj, 'id')).toBe(true);
      expect(hasProperty(obj, 'name')).toBe(true);
      expect(hasProperty(obj, 'missing')).toBe(false);
    });

    it('should handle invalid inputs', () => {
      expect(hasProperty(null, 'id')).toBe(false);
      expect(hasProperty(undefined, 'id')).toBe(false);
      expect(hasProperty([], 'id')).toBe(false);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      expect(safeJsonParse('{"id": 123}')).toEqual({ id: 123 });
      expect(safeJsonParse('"string"')).toBe('string');
      expect(safeJsonParse('123')).toBe(123);
      expect(safeJsonParse('true')).toBe(true);
      expect(safeJsonParse('null')).toBe(null);
    });

    it('should return default value for invalid JSON', () => {
      expect(safeJsonParse('invalid', 'default')).toBe('default');
      expect(safeJsonParse('{invalid}', null)).toBe(null);
      expect(safeJsonParse('', undefined)).toBe(undefined);
    });

    it('should handle typed parsing', () => {
      interface User {
        id: number;
        name: string;
      }
      
      const user = safeJsonParse<User>('{"id": 1, "name": "John"}');
      expect(user?.id).toBe(1);
      expect(user?.name).toBe('John');
    });
  });

  describe('toRecord', () => {
    it('should return records as-is', () => {
      const obj = { key: 'value' };
      expect(toRecord(obj)).toBe(obj);
    });

    it('should convert non-records to empty object', () => {
      expect(toRecord(null)).toEqual({});
      expect(toRecord(undefined)).toEqual({});
      expect(toRecord('string')).toEqual({});
      expect(toRecord(123)).toEqual({});
      expect(toRecord([])).toEqual({});
    });
  });

  describe('Basic type guards', () => {
    describe('isString', () => {
      it('should identify strings', () => {
        expect(isString('hello')).toBe(true);
        expect(isString('')).toBe(true);
        expect(isString(123)).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('should identify valid numbers', () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber(0)).toBe(true);
        expect(isNumber(-123.45)).toBe(true);
        expect(isNumber(NaN)).toBe(false);
        expect(isNumber('123')).toBe(false);
        expect(isNumber(null)).toBe(false);
      });
    });

    describe('isArray', () => {
      it('should identify arrays', () => {
        expect(isArray([])).toBe(true);
        expect(isArray([1, 2, 3])).toBe(true);
        expect(isArray({})).toBe(false);
        expect(isArray('string')).toBe(false);
        expect(isArray(null)).toBe(false);
      });
    });
  });

  describe('getNestedProperty', () => {
    const obj = {
      user: {
        profile: {
          name: 'John',
          age: 30
        },
        settings: {
          theme: 'dark'
        }
      }
    };

    it('should access nested properties', () => {
      expect(getNestedProperty(obj, ['user', 'profile', 'name'])).toBe('John');
      expect(getNestedProperty(obj, ['user', 'settings', 'theme'])).toBe('dark');
    });

    it('should return default value for missing paths', () => {
      expect(getNestedProperty(obj, ['user', 'missing'], 'default')).toBe('default');
      expect(getNestedProperty(obj, ['missing', 'path'], null)).toBe(null);
      expect(getNestedProperty(null, ['any', 'path'], 'default')).toBe('default');
    });
  });

  describe('Request type guards', () => {
    describe('isRequestLike', () => {
      it('should identify request-like objects', () => {
        expect(isRequestLike({})).toBe(true);
        expect(isRequestLike({ body: {}, params: {} })).toBe(true);
        expect(isRequestLike(null)).toBe(false);
        expect(isRequestLike('string')).toBe(false);
      });
    });

    describe('getTypedBody', () => {
      it('should extract typed body', () => {
        interface CreateUserBody {
          name: string;
          email: string;
        }

        const req = { body: { name: 'John', email: 'john@example.com' } };
        const body = getTypedBody<CreateUserBody>(req);
        
        expect(body?.name).toBe('John');
        expect(body?.email).toBe('john@example.com');
      });

      it('should return undefined for missing body', () => {
        expect(getTypedBody({})).toBe(undefined);
      });
    });

    describe('getTypedParams', () => {
      it('should extract typed params', () => {
        const req = { params: { id: '123', type: 'user' } };
        const params = getTypedParams<{ id: string; type: string }>(req);
        
        expect(params?.id).toBe('123');
        expect(params?.type).toBe('user');
      });
    });

    describe('getTypedQuery', () => {
      it('should extract typed query', () => {
        const req = { query: { page: '1', sort: 'name' } };
        const query = getTypedQuery<{ page: string; sort: string }>(req);
        
        expect(query?.page).toBe('1');
        expect(query?.sort).toBe('name');
      });
    });
  });
});