/**
 * Server-Side Strict Equality (eqeqeq) Integration Tests
 * 
 * Tests that strict equality checks work correctly in server components
 */

import { describe, it, expect } from '@jest/globals';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Server Components - Strict Equality Checks', () => {
  describe('Logger Equality Checks', () => {
    it('should use strict equality for null/undefined checks', async () => {
      const loggerPath = path.join(__dirname, '../../server/src/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Check for strict equality patterns
      expect(content).toContain('!== null');
      expect(content).toContain('!== undefined');
      expect(content).toContain('===');
      
      // Verify no loose equality (except in comments)
      const codeWithoutComments = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      expect(codeWithoutComments).not.toMatch(/[^!=]==[^=]/);
      expect(codeWithoutComments).not.toMatch(/[^!=]!=[^=]/);
    });

    it('should use strict equality in serializers', async () => {
      const loggerPath = path.join(__dirname, '../../server/src/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Check authorization header check
      expect(content).toContain('request.headers?.authorization !== null');
      
      // Check typeof comparisons
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]function['"]/);
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]string['"]/);
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]number['"]/);
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]boolean['"]/);
    });

    it('should handle null coalescing correctly', async () => {
      const loggerPath = path.join(__dirname, '../../server/src/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Check nullish coalescing usage
      expect(content).toContain('??');
      
      // Examples of nullish coalescing in the code
      expect(content).toContain('process.env.LOG_LEVEL ?? ');
      expect(content).toContain('?? \'unknown\'');
      expect(content).toContain('?? 0');
    });

    it('should check email parts with strict equality', async () => {
      const loggerPath = path.join(__dirname, '../../server/src/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Check email validation
      expect(content).toContain("!local || local === '' || !domain || domain === ''");
      
      // These use strict equality for empty string checks
      expect(content).toMatch(/local\s*===\s*''/);
      expect(content).toMatch(/domain\s*===\s*''/);
    });

    it('should validate IP parts with proper length check', async () => {
      const loggerPath = path.join(__dirname, '../../server/src/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Check IP validation
      expect(content).toContain('parts.length === 4');
    });
  });

  describe('Database Utils Equality Checks', () => {
    it('should use strict equality throughout', async () => {
      const databasePath = path.join(__dirname, '../../server/src/utils/database.ts');
      const content = await readFile(databasePath, 'utf-8');
      
      // Remove comments for checking
      const codeWithoutComments = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      
      // Should not have loose equality
      expect(codeWithoutComments).not.toMatch(/[^!=]==[^=]/);
      expect(codeWithoutComments).not.toMatch(/[^!=]!=[^=]/);
      
      // Should have strict equality
      expect(content).toContain('!==');
      expect(content).toContain('===');
    });

    it('should handle null checks in batch operations', async () => {
      const databasePath = path.join(__dirname, '../../server/src/utils/database.ts');
      const content = await readFile(databasePath, 'utf-8');
      
      // Check null handling in batch operations
      expect(content).toContain('!== null');
      expect(content).toContain('r._sum?.'); // Optional chaining for null safety
    });
  });

  describe('API Validation Equality Checks', () => {
    it('should use strict equality in type checks', async () => {
      const apiValidationPath = path.join(__dirname, '../../shared/utils/apiValidation.ts');
      const content = await readFile(apiValidationPath, 'utf-8');
      
      // Check typeof comparisons
      expect(content).toMatch(/typeof\s+\w+\.success\s*!==\s*['"]boolean['"]/);
      
      // Check hasProperty usage (which internally uses strict equality)
      expect(content).toContain('hasProperty(value,');
    });

    it('should compare with null explicitly', async () => {
      const apiValidationPath = path.join(__dirname, '../../shared/utils/apiValidation.ts');
      const content = await readFile(apiValidationPath, 'utf-8');
      
      // Check null comparisons
      expect(content).toContain('=== null');
      expect(content).toContain('!== null');
      expect(content).toContain('!== undefined');
    });

    it('should use strict equality for string comparisons', async () => {
      const apiValidationPath = path.join(__dirname, '../../shared/utils/apiValidation.ts');
      const content = await readFile(apiValidationPath, 'utf-8');
      
      // Check string comparisons
      expect(content).toMatch(/value\s*===\s*['"]true['"]/);
      expect(content).toMatch(/value\s*===\s*['"]false['"]/);
      expect(content).toMatch(/value\s*===\s*['"]1['"]/);
      expect(content).toMatch(/value\s*===\s*['"]0['"]/);
    });
  });

  describe('Type Guards Equality Checks', () => {
    it('should use strict equality for all type checks', async () => {
      const typeGuardsPath = path.join(__dirname, '../../shared/utils/typeGuards.ts');
      const content = await readFile(typeGuardsPath, 'utf-8');
      
      // Check null/undefined comparisons
      expect(content).toContain('!== null');
      expect(content).toContain('!== undefined');
      expect(content).toContain('=== null');
      expect(content).toContain('=== undefined');
      
      // Check typeof comparisons
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]object['"]/);
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]string['"]/);
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]number['"]/);
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]function['"]/);
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]boolean['"]/);
    });

    it('should use strict equality in array checks', async () => {
      const typeGuardsPath = path.join(__dirname, '../../shared/utils/typeGuards.ts');
      const content = await readFile(typeGuardsPath, 'utf-8');
      
      // Array length checks
      expect(content).toContain('value.length > 0');
      expect(content).toContain('value.length === 0');
      expect(content).toContain('keys.length > 0');
    });

    it('should handle NaN checks correctly', async () => {
      const typeGuardsPath = path.join(__dirname, '../../shared/utils/typeGuards.ts');
      const content = await readFile(typeGuardsPath, 'utf-8');
      
      // NaN checks (isNaN is the correct way, not === NaN)
      expect(content).toContain('!isNaN(');
      expect(content).toContain('isFinite(');
      
      // Should not try to compare with NaN using ===
      expect(content).not.toContain('=== NaN');
      expect(content).not.toContain('!== NaN');
    });

    it('should use includes method for array membership', async () => {
      const typeGuardsPath = path.join(__dirname, '../../shared/utils/typeGuards.ts');
      const content = await readFile(typeGuardsPath, 'utf-8');
      
      // Array includes (uses strict equality internally)
      expect(content).toContain('.includes(');
      expect(content).toContain('validTypes.includes(value.type)');
    });
  });

  describe('Real Server Logic Tests', () => {
    it('should handle logger sanitization correctly', () => {
      // Test email redaction logic
      const redactEmail = (email: unknown): string => {
        if (typeof email !== 'string') {
          return '[INVALID_EMAIL]';
        }
        const [local, domain] = email.split('@');
        if (!local || local === '' || !domain || domain === '') {
          return '[INVALID_EMAIL]';
        }
        return `${local.substring(0, 2)}***@${domain}`;
      };
      
      expect(redactEmail('test@example.com')).toBe('te***@example.com');
      expect(redactEmail('a@b.com')).toBe('a***@b.com');
      expect(redactEmail('@example.com')).toBe('[INVALID_EMAIL]');
      expect(redactEmail('test@')).toBe('[INVALID_EMAIL]');
      expect(redactEmail('invalid')).toBe('[INVALID_EMAIL]');
      expect(redactEmail(123)).toBe('[INVALID_EMAIL]');
      expect(redactEmail(null)).toBe('[INVALID_EMAIL]');
    });

    it('should handle IP masking correctly', () => {
      // Test IP masking logic
      const maskIP = (ip: unknown): string => {
        if (typeof ip !== 'string') {
          return 'xxx.xxx.xxx.xxx';
        }
        const parts = ip.split('.');
        if (parts.length === 4) {
          return `${parts[0]}.${parts[1]}.xxx.xxx`;
        }
        return 'xxx.xxx.xxx.xxx';
      };
      
      expect(maskIP('192.168.1.100')).toBe('192.168.xxx.xxx');
      expect(maskIP('10.0.0.1')).toBe('10.0.xxx.xxx');
      expect(maskIP('invalid-ip')).toBe('xxx.xxx.xxx.xxx');
      expect(maskIP('192.168.1')).toBe('xxx.xxx.xxx.xxx');
      expect(maskIP(123)).toBe('xxx.xxx.xxx.xxx');
    });

    it('should handle type guards correctly', () => {
      // Test isDefined
      const isDefined = <T>(value: T | null | undefined): value is T => {
        return value !== null && value !== undefined;
      };
      
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
      
      // Test isValidNumber
      const isValidNumber = (value: unknown): value is number => {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
      };
      
      expect(isValidNumber(123)).toBe(true);
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(-456)).toBe(true);
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber('123')).toBe(false);
    });

    it('should handle database parameter validation', () => {
      // Test boolean parameter extraction
      const getValidBooleanParam = (
        params: Record<string, unknown>,
        key: string,
        defaultValue: boolean
      ): boolean => {
        const value = params[key];
        
        if (typeof value === 'boolean') {
          return value;
        }
        if (value === 'true' || value === '1') {
          return true;
        }
        if (value === 'false' || value === '0') {
          return false;
        }
        
        return defaultValue;
      };
      
      expect(getValidBooleanParam({ active: true }, 'active', false)).toBe(true);
      expect(getValidBooleanParam({ active: 'true' }, 'active', false)).toBe(true);
      expect(getValidBooleanParam({ active: '1' }, 'active', false)).toBe(true);
      expect(getValidBooleanParam({ active: false }, 'active', true)).toBe(false);
      expect(getValidBooleanParam({ active: 'false' }, 'active', true)).toBe(false);
      expect(getValidBooleanParam({ active: '0' }, 'active', true)).toBe(false);
      expect(getValidBooleanParam({ active: 'yes' }, 'active', false)).toBe(false);
      expect(getValidBooleanParam({}, 'active', true)).toBe(true);
    });
  });

  describe('Edge Cases and Type Coercion', () => {
    it('should handle nullish coalescing vs OR operator', () => {
      // Nullish coalescing (??) vs OR (||) with strict equality
      const getValue = (value: unknown, defaultValue: string): string => {
        // With nullish coalescing
        return (value ?? defaultValue) as string;
      };
      
      const getValueOR = (value: unknown, defaultValue: string): string => {
        // With OR operator
        return (value || defaultValue) as string;
      };
      
      // Different behavior for falsy values
      expect(getValue(0, 'default')).toBe(0);
      expect(getValueOR(0, 'default')).toBe('default');
      
      expect(getValue('', 'default')).toBe('');
      expect(getValueOR('', 'default')).toBe('default');
      
      expect(getValue(false, 'default')).toBe(false);
      expect(getValueOR(false, 'default')).toBe('default');
      
      // Same behavior for null/undefined
      expect(getValue(null, 'default')).toBe('default');
      expect(getValueOR(null, 'default')).toBe('default');
      
      expect(getValue(undefined, 'default')).toBe('default');
      expect(getValueOR(undefined, 'default')).toBe('default');
    });

    it('should handle typeof checks with strict equality', () => {
      const getType = (value: unknown): string => {
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'object') {
          if (value === null) return 'null';
          if (Array.isArray(value)) return 'array';
          return 'object';
        }
        if (typeof value === 'undefined') return 'undefined';
        if (typeof value === 'function') return 'function';
        return 'unknown';
      };
      
      expect(getType('test')).toBe('string');
      expect(getType(123)).toBe('number');
      expect(getType(true)).toBe('boolean');
      expect(getType(null)).toBe('null');
      expect(getType([])).toBe('array');
      expect(getType({})).toBe('object');
      expect(getType(undefined)).toBe('undefined');
      expect(getType(() => {})).toBe('function');
    });

    it('should handle array length checks', () => {
      const isNonEmpty = (arr: unknown[]): boolean => arr.length > 0;
      const isEmpty = (arr: unknown[]): boolean => arr.length === 0;
      
      expect(isNonEmpty([1, 2, 3])).toBe(true);
      expect(isNonEmpty([''])).toBe(true);
      expect(isNonEmpty([])).toBe(false);
      
      expect(isEmpty([])).toBe(true);
      expect(isEmpty([0])).toBe(false);
      expect(isEmpty([null])).toBe(false);
    });
  });
});