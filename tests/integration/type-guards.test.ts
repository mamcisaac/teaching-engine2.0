/**
 * Type Guards Integration Tests
 * 
 * Tests the real type guard functionality with various edge cases
 */

import { describe, it, expect } from '@jest/globals';
import * as typeGuards from '../../shared/utils/typeGuards';

describe('Type Guards - Basic Validators', () => {
  describe('isDefined', () => {
    it('should correctly identify defined values', () => {
      expect(typeGuards.isDefined(0)).toBe(true);
      expect(typeGuards.isDefined('')).toBe(true);
      expect(typeGuards.isDefined(false)).toBe(true);
      expect(typeGuards.isDefined([])).toBe(true);
      expect(typeGuards.isDefined({})).toBe(true);
      
      expect(typeGuards.isDefined(null)).toBe(false);
      expect(typeGuards.isDefined(undefined)).toBe(false);
    });

    it('should work with type narrowing', () => {
      const value: string | null | undefined = 'test';
      
      if (typeGuards.isDefined(value)) {
        // TypeScript should know value is string here
        expect(value.length).toBe(4);
      }
    });
  });

  describe('isObject', () => {
    it('should identify plain objects', () => {
      expect(typeGuards.isObject({})).toBe(true);
      expect(typeGuards.isObject({ key: 'value' })).toBe(true);
      expect(typeGuards.isObject(Object.create(null))).toBe(true);
      
      expect(typeGuards.isObject(null)).toBe(false);
      expect(typeGuards.isObject(undefined)).toBe(false);
      expect(typeGuards.isObject([])).toBe(false);
      expect(typeGuards.isObject(new Date())).toBe(false);
      expect(typeGuards.isObject('string')).toBe(false);
      expect(typeGuards.isObject(123)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(typeGuards.isObject(new Map())).toBe(false);
      expect(typeGuards.isObject(new Set())).toBe(false);
      expect(typeGuards.isObject(/regex/)).toBe(false);
      expect(typeGuards.isObject(() => {})).toBe(false);
    });
  });

  describe('Error type guards', () => {
    it('should identify Error instances', () => {
      expect(typeGuards.isError(new Error('test'))).toBe(true);
      expect(typeGuards.isError(new TypeError('test'))).toBe(true);
      expect(typeGuards.isError(new RangeError('test'))).toBe(true);
      
      expect(typeGuards.isError({ message: 'test' })).toBe(false);
      expect(typeGuards.isError('error')).toBe(false);
    });

    it('should identify error-like objects', () => {
      expect(typeGuards.isErrorLike({ message: 'test error' })).toBe(true);
      expect(typeGuards.isErrorLike({ message: 'test', code: 'E001' })).toBe(true);
      
      expect(typeGuards.isErrorLike({ msg: 'test' })).toBe(false);
      expect(typeGuards.isErrorLike({ message: 123 })).toBe(false);
      expect(typeGuards.isErrorLike('error')).toBe(false);
      expect(typeGuards.isErrorLike(null)).toBe(false);
    });

    it('should check for error message property', () => {
      expect(typeGuards.hasErrorMessage({ message: 'error' })).toBe(true);
      expect(typeGuards.hasErrorMessage({ message: '' })).toBe(true);
      
      expect(typeGuards.hasErrorMessage({ message: null })).toBe(false);
      expect(typeGuards.hasErrorMessage({ msg: 'error' })).toBe(false);
      expect(typeGuards.hasErrorMessage({})).toBe(false);
    });
  });

  describe('String validators', () => {
    it('should validate strings', () => {
      expect(typeGuards.isString('')).toBe(true);
      expect(typeGuards.isString('test')).toBe(true);
      expect(typeGuards.isString(String('test'))).toBe(true);
      
      expect(typeGuards.isString(123)).toBe(false);
      expect(typeGuards.isString(null)).toBe(false);
      expect(typeGuards.isString(undefined)).toBe(false);
      expect(typeGuards.isString(['string'])).toBe(false);
    });

    it('should validate non-empty strings', () => {
      expect(typeGuards.isNonEmptyString('test')).toBe(true);
      expect(typeGuards.isNonEmptyString(' ')).toBe(true);
      
      expect(typeGuards.isNonEmptyString('')).toBe(false);
      expect(typeGuards.isNonEmptyString(123)).toBe(false);
      expect(typeGuards.isNonEmptyString(null)).toBe(false);
    });
  });

  describe('Number validators', () => {
    it('should validate valid numbers', () => {
      expect(typeGuards.isValidNumber(0)).toBe(true);
      expect(typeGuards.isValidNumber(-123)).toBe(true);
      expect(typeGuards.isValidNumber(123.456)).toBe(true);
      expect(typeGuards.isValidNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
      expect(typeGuards.isValidNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
      
      expect(typeGuards.isValidNumber(NaN)).toBe(false);
      expect(typeGuards.isValidNumber(Infinity)).toBe(false);
      expect(typeGuards.isValidNumber(-Infinity)).toBe(false);
      expect(typeGuards.isValidNumber('123')).toBe(false);
      expect(typeGuards.isValidNumber(null)).toBe(false);
    });

    it('should validate positive numbers', () => {
      expect(typeGuards.isPositiveNumber(1)).toBe(true);
      expect(typeGuards.isPositiveNumber(0.1)).toBe(true);
      expect(typeGuards.isPositiveNumber(999999)).toBe(true);
      
      expect(typeGuards.isPositiveNumber(0)).toBe(false);
      expect(typeGuards.isPositiveNumber(-1)).toBe(false);
      expect(typeGuards.isPositiveNumber(NaN)).toBe(false);
      expect(typeGuards.isPositiveNumber('1')).toBe(false);
    });
  });

  describe('Array validators', () => {
    it('should validate arrays', () => {
      expect(typeGuards.isArray([])).toBe(true);
      expect(typeGuards.isArray([1, 2, 3])).toBe(true);
      expect(typeGuards.isArray(new Array())).toBe(true);
      
      expect(typeGuards.isArray('array')).toBe(false);
      expect(typeGuards.isArray({ length: 0 })).toBe(false);
      expect(typeGuards.isArray(null)).toBe(false);
    });

    it('should validate non-empty arrays', () => {
      expect(typeGuards.isNonEmptyArray([1])).toBe(true);
      expect(typeGuards.isNonEmptyArray(['a', 'b'])).toBe(true);
      
      expect(typeGuards.isNonEmptyArray([])).toBe(false);
      expect(typeGuards.isNonEmptyArray('not array')).toBe(false);
    });

    it('should validate arrays of specific types', () => {
      expect(typeGuards.isArrayOf(['a', 'b', 'c'], typeGuards.isString)).toBe(true);
      expect(typeGuards.isArrayOf([1, 2, 3], typeGuards.isValidNumber)).toBe(true);
      expect(typeGuards.isArrayOf([], typeGuards.isString)).toBe(true);
      
      expect(typeGuards.isArrayOf(['a', 1, 'c'], typeGuards.isString)).toBe(false);
      expect(typeGuards.isArrayOf([1, NaN, 3], typeGuards.isValidNumber)).toBe(false);
      expect(typeGuards.isArrayOf('not array', typeGuards.isString)).toBe(false);
    });
  });

  describe('Function validation', () => {
    it('should validate functions', () => {
      expect(typeGuards.isFunction(() => {})).toBe(true);
      expect(typeGuards.isFunction(function() {})).toBe(true);
      expect(typeGuards.isFunction(async () => {})).toBe(true);
      expect(typeGuards.isFunction(Date)).toBe(true);
      expect(typeGuards.isFunction(Math.max)).toBe(true);
      
      expect(typeGuards.isFunction({})).toBe(false);
      expect(typeGuards.isFunction('function')).toBe(false);
      expect(typeGuards.isFunction(null)).toBe(false);
    });
  });
});

describe('Type Guards - Complex Validators', () => {
  describe('API Response validation', () => {
    it('should validate API response structure', () => {
      const validResponse = {
        data: { id: 1, name: 'Test' },
        status: 200
      };
      
      expect(typeGuards.isApiResponse(validResponse)).toBe(true);
      
      const withError = {
        error: 'Something went wrong',
        status: 400
      };
      
      expect(typeGuards.isApiResponse(withError)).toBe(true);
      
      const withErrorObject = {
        error: { message: 'Detailed error' },
        status: 500
      };
      
      expect(typeGuards.isApiResponse(withErrorObject)).toBe(true);
    });

    it('should reject invalid API responses', () => {
      expect(typeGuards.isApiResponse({ data: null })).toBe(false);
      expect(typeGuards.isApiResponse({ error: 123 })).toBe(false);
      expect(typeGuards.isApiResponse({ status: 'ok' })).toBe(false);
      expect(typeGuards.isApiResponse('not an object')).toBe(false);
      expect(typeGuards.isApiResponse(null)).toBe(false);
    });
  });

  describe('Property checks', () => {
    it('should check single property existence', () => {
      const obj = { name: 'test', age: 25 };
      
      expect(typeGuards.hasProperty(obj, 'name')).toBe(true);
      expect(typeGuards.hasProperty(obj, 'age')).toBe(true);
      expect(typeGuards.hasProperty(obj, 'missing')).toBe(false);
      
      expect(typeGuards.hasProperty(null, 'name')).toBe(false);
      expect(typeGuards.hasProperty('string', 'length')).toBe(false);
    });

    it('should check multiple properties', () => {
      const obj = { a: 1, b: 2, c: 3 };
      
      expect(typeGuards.hasProperties(obj, 'a', 'b')).toBe(true);
      expect(typeGuards.hasProperties(obj, 'a', 'b', 'c')).toBe(true);
      expect(typeGuards.hasProperties(obj, 'a', 'd')).toBe(false);
      expect(typeGuards.hasProperties({}, 'a')).toBe(false);
    });
  });

  describe('ID object validation', () => {
    it('should validate objects with valid IDs', () => {
      expect(typeGuards.hasId({ id: 'abc123' })).toBe(true);
      expect(typeGuards.hasId({ id: 123 })).toBe(true);
      expect(typeGuards.hasId({ id: 0 })).toBe(true);
      expect(typeGuards.hasId({ id: 'abc123', name: 'Test' })).toBe(true);
      
      expect(typeGuards.hasId({ id: null })).toBe(false);
      expect(typeGuards.hasId({ id: undefined })).toBe(false);
      expect(typeGuards.hasId({ id: '' })).toBe(true); // Empty string is valid
      expect(typeGuards.hasId({ id: NaN })).toBe(false);
      expect(typeGuards.hasId({ ID: 'abc' })).toBe(false);
      expect(typeGuards.hasId({})).toBe(false);
    });
  });

  describe('Optional type guards', () => {
    it('should validate optional values', () => {
      expect(typeGuards.isOptional(undefined, typeGuards.isString)).toBe(true);
      expect(typeGuards.isOptional('test', typeGuards.isString)).toBe(true);
      expect(typeGuards.isOptional(123, typeGuards.isString)).toBe(false);
      expect(typeGuards.isOptional(null, typeGuards.isString)).toBe(false);
    });
  });
});

describe('Type Guards - Safe Utilities', () => {
  describe('tryParseJSON', () => {
    it('should safely parse valid JSON', () => {
      expect(typeGuards.tryParseJSON('{"key": "value"}')).toEqual({ key: 'value' });
      expect(typeGuards.tryParseJSON('123')).toBe(123);
      expect(typeGuards.tryParseJSON('true')).toBe(true);
      expect(typeGuards.tryParseJSON('null')).toBe(null);
      expect(typeGuards.tryParseJSON('[]')).toEqual([]);
    });

    it('should return null for invalid JSON', () => {
      expect(typeGuards.tryParseJSON('invalid')).toBe(null);
      expect(typeGuards.tryParseJSON('{key: value}')).toBe(null);
      expect(typeGuards.tryParseJSON('')).toBe(null);
      expect(typeGuards.tryParseJSON('undefined')).toBe(null);
    });

    it('should validate parsed JSON with validator', () => {
      const validator = (value: unknown): value is { type: string } => {
        return typeGuards.isObject(value) && typeGuards.hasProperty(value, 'type') && typeGuards.isString(value.type);
      };
      
      expect(typeGuards.tryParseJSON('{"type": "test"}', validator)).toEqual({ type: 'test' });
      expect(typeGuards.tryParseJSON('{"name": "test"}', validator)).toBe(null);
      expect(typeGuards.tryParseJSON('invalid', validator)).toBe(null);
    });
  });

  describe('safeBoolean', () => {
    it('should convert values to boolean safely', () => {
      // Falsy values
      expect(typeGuards.safeBoolean(null)).toBe(false);
      expect(typeGuards.safeBoolean(undefined)).toBe(false);
      expect(typeGuards.safeBoolean(false)).toBe(false);
      expect(typeGuards.safeBoolean(0)).toBe(false);
      expect(typeGuards.safeBoolean(NaN)).toBe(false);
      expect(typeGuards.safeBoolean('')).toBe(false);
      expect(typeGuards.safeBoolean([])).toBe(false);
      expect(typeGuards.safeBoolean({})).toBe(false);
      
      // Truthy values
      expect(typeGuards.safeBoolean(true)).toBe(true);
      expect(typeGuards.safeBoolean(1)).toBe(true);
      expect(typeGuards.safeBoolean(-1)).toBe(true);
      expect(typeGuards.safeBoolean('test')).toBe(true);
      expect(typeGuards.safeBoolean([1])).toBe(true);
      expect(typeGuards.safeBoolean({ key: 'value' })).toBe(true);
    });
  });

  describe('validate', () => {
    it('should return validation results', () => {
      const stringValidator = typeGuards.isString;
      
      const validResult = typeGuards.validate('test', stringValidator);
      expect(validResult.isValid).toBe(true);
      expect(validResult.value).toBe('test');
      expect(validResult.error).toBeUndefined();
      
      const invalidResult = typeGuards.validate(123, stringValidator, 'Must be a string');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.value).toBeUndefined();
      expect(invalidResult.error).toBe('Must be a string');
    });
  });

  describe('validateAsync', () => {
    it('should handle async validation', async () => {
      const asyncValidator = async (value: unknown): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return typeGuards.isString(value) && value === 'valid';
      };
      
      const transform = (value: unknown): string => String(value).toUpperCase();
      
      const validResult = await typeGuards.validateAsync('valid', asyncValidator, transform);
      expect(validResult.isValid).toBe(true);
      expect(validResult.value).toBe('VALID');
      
      const invalidResult = await typeGuards.validateAsync('invalid', asyncValidator, transform, 'Invalid value');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('Invalid value');
    });

    it('should handle async validation errors', async () => {
      const failingValidator = async (): Promise<boolean> => {
        throw new Error('Validation error');
      };
      
      const result = await typeGuards.validateAsync('test', failingValidator, (v) => v);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Validation error');
    });
  });
});

describe('Type Guards - Domain Specific', () => {
  describe('AISuggestion validation', () => {
    it('should validate valid AI suggestions', () => {
      const validSuggestion = {
        type: 'goals',
        suggestions: ['Goal 1', 'Goal 2'],
        rationale: 'Based on curriculum'
      };
      
      expect(typeGuards.isAISuggestion(validSuggestion)).toBe(true);
      
      const withoutRationale = {
        type: 'activities',
        suggestions: ['Activity 1']
      };
      
      expect(typeGuards.isAISuggestion(withoutRationale)).toBe(true);
    });

    it('should reject invalid AI suggestions', () => {
      expect(typeGuards.isAISuggestion({
        type: 'invalid-type',
        suggestions: ['Test']
      })).toBe(false);
      
      expect(typeGuards.isAISuggestion({
        type: 'goals',
        suggestions: 'not an array'
      })).toBe(false);
      
      expect(typeGuards.isAISuggestion({
        type: 'goals',
        suggestions: [1, 2, 3]
      })).toBe(false);
      
      expect(typeGuards.isAISuggestion({
        suggestions: ['Test']
      })).toBe(false);
    });
  });

  describe('React event type guards', () => {
    it('should validate React events', () => {
      expect(typeGuards.isReactEvent({ target: {} })).toBe(true);
      expect(typeGuards.isReactEvent({ target: null })).toBe(true);
      
      expect(typeGuards.isReactEvent({})).toBe(false);
      expect(typeGuards.isReactEvent(null)).toBe(false);
    });

    it('should validate input events', () => {
      expect(typeGuards.isInputEvent({
        target: { value: 'test input' }
      })).toBe(true);
      
      expect(typeGuards.isInputEvent({
        target: { value: 123 }
      })).toBe(false);
      
      expect(typeGuards.isInputEvent({
        target: {}
      })).toBe(false);
    });

    it('should validate select events', () => {
      expect(typeGuards.isSelectEvent({
        target: { value: 'option1', checked: true }
      })).toBe(true);
      
      expect(typeGuards.isSelectEvent({
        target: { value: 'option2' }
      })).toBe(true);
      
      expect(typeGuards.isSelectEvent({
        target: { checked: true }
      })).toBe(false);
    });
  });

  describe('Educational data type guards', () => {
    it('should validate curriculum expectations', () => {
      const valid = {
        id: 'exp-123',
        code: 'MATH.7.A1',
        description: 'Algebra basics',
        content: 'Students will learn...'
      };
      
      expect(typeGuards.isCurriculumExpectation(valid)).toBe(true);
      
      const missing = {
        id: 'exp-123',
        code: 'MATH.7.A1',
        description: 'Algebra basics'
      };
      
      expect(typeGuards.isCurriculumExpectation(missing)).toBe(false);
    });

    it('should validate lesson plans', () => {
      const valid = {
        title: 'Introduction to Algebra',
        date: '2024-01-15',
        duration: 60,
        expectations: ['EXP1', 'EXP2']
      };
      
      expect(typeGuards.isLessonPlan(valid)).toBe(true);
      
      const withDateObject = {
        title: 'Test Lesson',
        date: new Date(),
        duration: 45
      };
      
      expect(typeGuards.isLessonPlan(withDateObject)).toBe(true);
      
      const invalidDuration = {
        title: 'Test',
        date: '2024-01-15',
        duration: 'sixty'
      };
      
      expect(typeGuards.isLessonPlan(invalidDuration)).toBe(false);
    });

    it('should validate unit plans', () => {
      const valid = {
        id: 'unit-123',
        title: 'Algebra Unit',
        subject: 'Mathematics',
        grade: 7
      };
      
      expect(typeGuards.isUnitPlan(valid)).toBe(true);
      
      const invalidGrade = {
        title: 'Test Unit',
        subject: 'Science',
        grade: 'seven'
      };
      
      expect(typeGuards.isUnitPlan(invalidGrade)).toBe(false);
    });

    it('should validate school info', () => {
      expect(typeGuards.isSchoolInfo({})).toBe(true);
      expect(typeGuards.isSchoolInfo({ name: 'Test School' })).toBe(true);
      expect(typeGuards.isSchoolInfo({ board: 'Test Board' })).toBe(true);
      expect(typeGuards.isSchoolInfo({ name: 'School', board: 'Board' })).toBe(true);
      
      expect(typeGuards.isSchoolInfo({ name: 123 })).toBe(false);
      expect(typeGuards.isSchoolInfo(null)).toBe(false);
    });
  });

  describe('Date validation', () => {
    it('should validate date strings', () => {
      expect(typeGuards.isValidDateString('2024-01-15')).toBe(true);
      expect(typeGuards.isValidDateString('2024-01-15T10:30:00Z')).toBe(true);
      expect(typeGuards.isValidDateString('January 15, 2024')).toBe(true);
      
      expect(typeGuards.isValidDateString('invalid-date')).toBe(false);
      expect(typeGuards.isValidDateString('')).toBe(false);
      expect(typeGuards.isValidDateString(123)).toBe(false);
    });

    it('should validate date-like values', () => {
      expect(typeGuards.isDateLike(new Date())).toBe(true);
      expect(typeGuards.isDateLike('2024-01-15')).toBe(true);
      
      expect(typeGuards.isDateLike('invalid')).toBe(false);
      expect(typeGuards.isDateLike(123)).toBe(false);
      expect(typeGuards.isDateLike(null)).toBe(false);
    });
  });
});

describe('Type Guards - Performance', () => {
  it('should execute type guards efficiently', () => {
    const iterations = 10000;
    const testData = {
      id: 'test-123',
      name: 'Test Object',
      value: 42,
      nested: { key: 'value' }
    };
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      typeGuards.isObject(testData);
      typeGuards.hasProperty(testData, 'id');
      typeGuards.isString(testData.name);
      typeGuards.isValidNumber(testData.value);
    }
    
    const duration = performance.now() - start;
    const averageTime = duration / iterations;
    
    // Each iteration should be under 0.01ms
    expect(averageTime).toBeLessThan(0.01);
  });
});