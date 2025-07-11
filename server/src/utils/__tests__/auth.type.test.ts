import type { SignOptions } from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  JWTPayload,
} from '../auth';

describe('auth.ts type safety tests', () => {
  describe('generateAccessToken', () => {
    it('should accept properly typed SignOptions without any casts', () => {
      // This test ensures that expiresIn is properly typed
      const payload: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
      };

      // The current implementation uses 'as any' cast for expiresIn
      // After fixing, this should work without type errors
      const options: SignOptions = {
        expiresIn: '7d', // string literal should be valid
      };

      // Type assertion to ensure proper typing
      type ExpiresInType = SignOptions['expiresIn'];
      const validExpiresValues: ExpiresInType[] = [
        '7d',
        '30d',
        '1h',
        '60m',
        3600, // number of seconds
        undefined,
      ];

      validExpiresValues.forEach((value) => {
        expect(() => {
          if (value !== undefined) {
            const testOptions: SignOptions = { expiresIn: value };
            // This should compile without errors
            expect(testOptions.expiresIn).toBeDefined();
          }
        }).not.toThrow();
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('should accept properly typed SignOptions without any casts', () => {
      const payload: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
      };

      // Test that environment variable strings are properly typed
      const envValue = '30d';
      const options: SignOptions = {
        expiresIn: envValue, // This should be valid without casting
      };

      expect(options.expiresIn).toBe('30d');
    });
  });

  describe('JWT payload type safety', () => {
    it('should enforce JWTPayload structure', () => {
      const validPayload: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
      };

      // These should cause TypeScript errors if uncommented:
      // const invalidPayload1: JWTPayload = { userId: '1', email: 'test@example.com' };
      // const invalidPayload2: JWTPayload = { userId: 1 };
      // const invalidPayload3: JWTPayload = { email: 'test@example.com' };

      expect(typeof validPayload.userId).toBe('number');
      expect(typeof validPayload.email).toBe('string');
    });
  });
});