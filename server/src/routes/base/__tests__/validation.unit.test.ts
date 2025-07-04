/**
 * Validation Utilities Unit Tests
 * Test suite for shared validation functions and schemas
 */

import { z } from 'zod';
import {
  commonValidations,
  commonQuerySchemas,
  createValidationSchema,
  sanitize,
  formatValidationError,
} from '../validation.js';

describe('Validation Utilities', () => {
  describe('commonValidations', () => {
    describe('title', () => {
      it('should accept valid titles', () => {
        expect(() => commonValidations.title.parse('Valid Title')).not.toThrow();
        expect(() => commonValidations.title.parse('Title with 123')).not.toThrow();
      });

      it('should reject empty titles', () => {
        expect(() => commonValidations.title.parse('')).toThrow();
      });

      it('should reject titles with HTML tags', () => {
        expect(() => commonValidations.title.parse('<script>alert("xss")</script>')).toThrow();
        expect(() => commonValidations.title.parse('Title with <b>bold</b>')).toThrow();
      });

      it('should reject titles longer than 255 characters', () => {
        const longTitle = 'a'.repeat(256);
        expect(() => commonValidations.title.parse(longTitle)).toThrow();
      });
    });

    describe('description', () => {
      it('should accept valid descriptions', () => {
        expect(() => commonValidations.description.parse('Valid description')).not.toThrow();
        expect(() => commonValidations.description.parse(undefined)).not.toThrow();
      });

      it('should reject descriptions longer than 2000 characters', () => {
        const longDescription = 'a'.repeat(2001);
        expect(() => commonValidations.description.parse(longDescription)).toThrow();
      });
    });

    describe('dateRange', () => {
      it('should accept valid date ranges', () => {
        const validRange = {
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-12-31T23:59:59.999Z',
        };
        expect(() => commonValidations.dateRange.parse(validRange)).not.toThrow();
      });

      it('should reject invalid date ranges where end is before start', () => {
        const invalidRange = {
          startDate: '2025-12-31T23:59:59.999Z',
          endDate: '2025-01-01T00:00:00.000Z',
        };
        expect(() => commonValidations.dateRange.parse(invalidRange)).toThrow();
      });

      it('should reject invalid date formats', () => {
        const invalidRange = {
          startDate: 'invalid-date',
          endDate: '2025-12-31T23:59:59.999Z',
        };
        expect(() => commonValidations.dateRange.parse(invalidRange)).toThrow();
      });
    });

    describe('gradeRange', () => {
      it('should accept valid grade ranges', () => {
        const validRange = { gradeMin: 1, gradeMax: 12 };
        expect(() => commonValidations.gradeRange.parse(validRange)).not.toThrow();
      });

      it('should accept single grades', () => {
        const singleGrade = { gradeMin: 5 };
        expect(() => commonValidations.gradeRange.parse(singleGrade)).not.toThrow();
      });

      it('should reject invalid grade ranges', () => {
        const invalidRange = { gradeMin: 8, gradeMax: 3 };
        expect(() => commonValidations.gradeRange.parse(invalidRange)).toThrow();
      });

      it('should reject grades outside valid range', () => {
        expect(() => commonValidations.gradeRange.parse({ gradeMin: 0 })).toThrow();
        expect(() => commonValidations.gradeRange.parse({ gradeMax: 13 })).toThrow();
      });
    });

    describe('tags', () => {
      it('should accept valid tag arrays', () => {
        const validTags = ['math', 'science', 'english'];
        expect(() => commonValidations.tags.parse(validTags)).not.toThrow();
      });

      it('should accept empty arrays', () => {
        expect(() => commonValidations.tags.parse([])).not.toThrow();
        expect(() => commonValidations.tags.parse(undefined)).not.toThrow();
      });

      it('should reject arrays with too many tags', () => {
        const tooManyTags = Array(21).fill('tag');
        expect(() => commonValidations.tags.parse(tooManyTags)).toThrow();
      });

      it('should reject tags that are too long', () => {
        const longTag = 'a'.repeat(51);
        expect(() => commonValidations.tags.parse([longTag])).toThrow();
      });
    });

    describe('estimatedMinutes', () => {
      it('should accept valid minute estimates', () => {
        expect(() => commonValidations.estimatedMinutes.parse(30)).not.toThrow();
        expect(() => commonValidations.estimatedMinutes.parse(480)).not.toThrow();
      });

      it('should reject negative values', () => {
        expect(() => commonValidations.estimatedMinutes.parse(-10)).toThrow();
      });

      it('should reject values over 480 minutes', () => {
        expect(() => commonValidations.estimatedMinutes.parse(500)).toThrow();
      });
    });

    describe('pagination', () => {
      it('should accept valid pagination parameters', () => {
        const validPagination = { limit: 10, offset: 0 };
        expect(() => commonValidations.pagination.parse(validPagination)).not.toThrow();
      });

      it('should use default values', () => {
        const result = commonValidations.pagination.parse({});
        expect(result.limit).toBe(10);
        expect(result.offset).toBe(0);
        expect(result.sortOrder).toBe('desc');
      });

      it('should reject invalid limits', () => {
        expect(() => commonValidations.pagination.parse({ limit: 0 })).toThrow();
        expect(() => commonValidations.pagination.parse({ limit: 101 })).toThrow();
      });
    });
  });

  describe('commonQuerySchemas', () => {
    describe('list', () => {
      it('should parse valid list query parameters', () => {
        const query = { limit: '20', offset: '10', search: 'test' };
        const result = commonQuerySchemas.list.parse(query);
        
        expect(result).toEqual({
          limit: 20,
          offset: 10,
          sortOrder: 'desc',
          search: 'test',
        });
      });

      it('should use default values for missing parameters', () => {
        const result = commonQuerySchemas.list.parse({});
        
        expect(result.limit).toBe(10);
        expect(result.offset).toBe(0);
        expect(result.sortOrder).toBe('desc');
      });
    });

    describe('educational', () => {
      it('should parse educational query parameters', () => {
        const query = {
          subject: 'Math',
          grade: '5',
          category: 'practice',
          tags: 'algebra,geometry',
        };
        const result = commonQuerySchemas.educational.parse(query);
        
        expect(result.subject).toBe('Math');
        expect(result.grade).toBe(5);
        expect(result.tags).toEqual(['algebra', 'geometry']);
      });

      it('should handle tags as array', () => {
        const query = { tags: ['algebra', 'geometry'] };
        const result = commonQuerySchemas.educational.parse(query);
        
        expect(result.tags).toEqual(['algebra', 'geometry']);
      });
    });
  });

  describe('createValidationSchema', () => {
    describe('crud', () => {
      it('should create CRUD schemas', () => {
        const schemas = createValidationSchema.crud({
          name: z.string(),
          age: z.number(),
        });
        
        expect(schemas.create).toBeDefined();
        expect(schemas.update).toBeDefined();
        expect(schemas.query).toBeDefined();
        
        // Test create schema
        expect(() => schemas.create.parse({ name: 'John', age: 30 })).not.toThrow();
        
        // Test update schema (partial)
        expect(() => schemas.update.parse({ name: 'Jane' })).not.toThrow();
        expect(() => schemas.update.parse({})).not.toThrow();
      });
    });

    describe('educational', () => {
      it('should create educational content schemas', () => {
        const schemas = createValidationSchema.educational({
          title: z.string(),
          content: z.string(),
        });
        
        expect(schemas.create).toBeDefined();
        expect(schemas.update).toBeDefined();
        expect(schemas.query).toBeDefined();
        
        // Test create schema with educational fields
        const validData = {
          title: 'Math Lesson',
          content: 'Lesson content',
          subject: 'Mathematics',
          gradeMin: 3,
          gradeMax: 5,
          tags: ['math', 'algebra'],
        };
        
        expect(() => schemas.create.parse(validData)).not.toThrow();
      });
    });

    describe('withTitleDescription', () => {
      it('should create schemas with title and description', () => {
        const schemas = createValidationSchema.withTitleDescription({
          type: z.string(),
        });
        
        const validData = {
          title: 'Test Title',
          description: 'Test description',
          type: 'lesson',
        };
        
        expect(() => schemas.create.parse(validData)).not.toThrow();
      });
    });
  });

  describe('sanitize', () => {
    describe('removeHtmlTags', () => {
      it('should remove HTML tags', () => {
        const input = '<script>alert("xss")</script>Hello <b>World</b>';
        const result = sanitize.removeHtmlTags(input);
        expect(result).toBe('alert("xss")Hello World');
      });

      it('should handle strings without HTML tags', () => {
        const input = 'Plain text';
        const result = sanitize.removeHtmlTags(input);
        expect(result).toBe('Plain text');
      });
    });

    describe('normalizeWhitespace', () => {
      it('should normalize whitespace', () => {
        const input = '  Hello   World  ';
        const result = sanitize.normalizeWhitespace(input);
        expect(result).toBe('Hello World');
      });

      it('should handle tabs and newlines', () => {
        const input = 'Hello\t\tWorld\n\nTest';
        const result = sanitize.normalizeWhitespace(input);
        expect(result).toBe('Hello World Test');
      });
    });

    describe('stringArray', () => {
      it('should sanitize array of strings', () => {
        const input = [
          '<script>alert("xss")</script>test1',
          '  test2  ',
          '',
          '<b>test3</b>',
        ];
        const result = sanitize.stringArray(input);
        expect(result).toEqual(['test1', 'test2', 'test3']);
      });

      it('should filter out empty strings', () => {
        const input = ['test1', '', '   ', 'test2'];
        const result = sanitize.stringArray(input);
        expect(result).toEqual(['test1', 'test2']);
      });
    });
  });

  describe('formatValidationError', () => {
    it('should format Zod validation errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number',
        },
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          path: ['email'],
          message: 'String must contain at least 1 character(s)',
        },
      ]);
      
      const result = formatValidationError(zodError);
      
      expect(result.message).toBe('Validation failed');
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toEqual({
        field: 'name',
        message: 'Expected string, received number',
      });
      expect(result.errors[1]).toEqual({
        field: 'email',
        message: 'String must contain at least 1 character(s)',
      });
    });

    it('should handle nested field paths', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['user', 'profile', 'name'],
          message: 'Expected string, received number',
        },
      ]);
      
      const result = formatValidationError(zodError);
      
      expect(result.errors[0].field).toBe('user.profile.name');
    });
  });
});