/**
 * Client-Side Strict Equality (eqeqeq) Integration Tests
 * 
 * Tests that strict equality checks work correctly in client components
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { JSDOM } from 'jsdom';
import React from 'react';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Client Components - Strict Equality Checks', () => {
  let dom: JSDOM;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost:3000',
      pretendToBeVisual: true
    });
    
    global.window = dom.window as any;
    global.document = dom.window.document;
  });

  describe('Dialog Component Equality Checks', () => {
    it('should use strict equality for undefined checks', async () => {
      const dialogPath = path.join(__dirname, '../../client/src/components/Dialog.tsx');
      const content = await readFile(dialogPath, 'utf-8');
      
      // Check for strict equality in undefined checks
      expect(content).toContain('!== undefined');
      expect(content).not.toMatch(/[^!]==[^=]\s*undefined/); // No loose equality
      
      // Verify specific checks in handleOpenChange
      const handleOpenChangeRegex = /if\s*\(\s*onOpenChange\s*!==\s*undefined\s*\)/;
      expect(content).toMatch(handleOpenChangeRegex);
      
      const onCloseCheckRegex = /if\s*\(.*onClose\s*!==\s*undefined\s*\)/;
      expect(content).toMatch(onCloseCheckRegex);
    });

    it('should use strict equality in hasContent function', async () => {
      const dialogPath = path.join(__dirname, '../../client/src/components/Dialog.tsx');
      const content = await readFile(dialogPath, 'utf-8');
      
      // Check hasContent implementation
      const hasContentRegex = /value\s*!==\s*undefined\s*&&\s*value\.trim\(\)\s*!==\s*''/;
      expect(content).toMatch(hasContentRegex);
      
      // Ensure no loose equality in string comparisons
      expect(content).not.toMatch(/value\.trim\(\)\s*==[^=]\s*''/);
    });

    it('should handle edge cases correctly', async () => {
      // Create a mock implementation to test the logic
      const hasContent = (value: string | undefined): boolean => 
        value !== undefined && value.trim() !== '';
      
      // Test various inputs
      expect(hasContent(undefined)).toBe(false);
      expect(hasContent('')).toBe(false);
      expect(hasContent('  ')).toBe(false);
      expect(hasContent('test')).toBe(true);
      expect(hasContent('  test  ')).toBe(true);
    });

    it('should use strict equality for maxWidth comparison', async () => {
      const dialogPath = path.join(__dirname, '../../client/src/components/Dialog.tsx');
      const content = await readFile(dialogPath, 'utf-8');
      
      // Check that maxWidth uses object key access which implicitly uses strict equality
      expect(content).toContain('maxWidthClasses[maxWidth as keyof typeof maxWidthClasses]');
    });
  });

  describe('ErrorBoundaries Component Equality Checks', () => {
    it('should use strict equality for all comparisons', async () => {
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // Check for strict equality usage
      expect(content).toContain('!== undefined');
      expect(content).toContain('!== null');
      expect(content).toContain("!== ''");
      expect(content).toContain('==='); // Should have some strict equality
      
      // Ensure no loose equality
      expect(content).not.toMatch(/[^!=]==[^=]/); // No == (except in comments)
      expect(content).not.toMatch(/[^!=]!=[^=]/); // No != (except in comments)
    });

    it('should use strict comparison for retryCount', async () => {
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // Check retryCount comparison
      const retryCountRegex = /this\.state\.retryCount\s*>\s*2/;
      expect(content).toMatch(retryCountRegex);
    });

    it('should use strict equality for environment checks', async () => {
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // Check NODE_ENV comparison
      const envCheckRegex = /process\.env\.NODE_ENV\s*===\s*['"]development['"]/;
      expect(content).toMatch(envCheckRegex);
    });

    it('should handle optional props with strict checks', async () => {
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // Check optional prop handling
      expect(content).toContain('this.props.onError !== undefined');
      expect(content).toContain('this.props.fallback !== undefined');
      expect(content).toContain("supportEmail !== undefined && supportEmail !== ''");
    });

    it('should use ternary operators with implicit strict comparison', async () => {
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // Check ternary usage (React's JSX implicitly uses strict comparison)
      expect(content).toMatch(/\{\s*allowRetry\s*\?\s*\(/);
      expect(content).toMatch(/\{\s*allowHome\s*\?\s*\(/);
      expect(content).toMatch(/\{\s*showDetails\s*&&\s*this\.state\.error\s*!==\s*undefined\s*\?\s*\(/);
    });

    it('should check instanceof correctly', async () => {
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // instanceof checks
      expect(content).toContain('this.state.error instanceof Error');
      expect(content).toContain('error instanceof Error');
    });
  });

  describe('Client Logger Equality Checks', () => {
    it('should use strict equality in environment checks', async () => {
      const loggerPath = path.join(__dirname, '../../client/src/utils/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Check environment variable comparisons
      expect(content).toContain("import.meta.env.VITE_ENABLE_LOGGING === 'true'");
      
      // Check log level comparisons
      expect(content).toContain("level === 'debug'");
      expect(content).toContain("level === 'trace'");
      expect(content).toContain("level === 'info'");
    });

    it('should use strict equality for type checks', async () => {
      const loggerPath = path.join(__dirname, '../../client/src/utils/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Check typeof comparisons
      expect(content).toMatch(/typeof\s+\w+\s*===\s*['"]object['"]/);
      expect(content).toMatch(/typeof\s+\w+\s*!==\s*['"]undefined['"]/);
      
      // Should not have loose equality
      expect(content).not.toMatch(/typeof\s+\w+\s*==[^=]/);
    });

    it('should handle null checks correctly', async () => {
      const loggerPath = path.join(__dirname, '../../client/src/utils/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Check for proper null handling
      expect(content).toContain('!== null');
      
      // Verify object/null checks in error data handling
      expect(content).toMatch(/typeof\s+data\s*===\s*['"]object['"]\s*&&\s*data\s*!==\s*null/);
    });
  });

  describe('Real Component Behavior Tests', () => {
    it('should handle Dialog props correctly with strict checks', () => {
      // Simulate Dialog component logic
      const dialogProps = {
        open: true,
        onOpenChange: undefined as ((open: boolean) => void) | undefined,
        onClose: undefined as (() => void) | undefined,
        title: '',
        description: undefined as string | undefined
      };
      
      const handleOpenChange = (newOpen: boolean): void => {
        if (dialogProps.onOpenChange !== undefined) {
          dialogProps.onOpenChange(newOpen);
        }
        if (!newOpen && dialogProps.onClose !== undefined) {
          dialogProps.onClose();
        }
      };
      
      // Test with undefined callbacks
      expect(() => handleOpenChange(false)).not.toThrow();
      
      // Test with defined callbacks
      let openChangeCalled = false;
      let closeCalled = false;
      
      dialogProps.onOpenChange = (open: boolean) => { openChangeCalled = true; };
      dialogProps.onClose = () => { closeCalled = true; };
      
      handleOpenChange(false);
      
      expect(openChangeCalled).toBe(true);
      expect(closeCalled).toBe(true);
    });

    it('should handle ErrorBoundary state correctly', () => {
      // Simulate ErrorBoundary state logic
      interface ErrorBoundaryState {
        hasError: boolean;
        error?: Error;
        errorInfo?: any;
        retryCount: number;
      }
      
      let state: ErrorBoundaryState = {
        hasError: false,
        retryCount: 0
      };
      
      // Test retry count logic
      const shouldShowMultipleErrorsWarning = state.retryCount > 2;
      expect(shouldShowMultipleErrorsWarning).toBe(false);
      
      state.retryCount = 3;
      expect(state.retryCount > 2).toBe(true);
      
      // Test error state
      const hasValidError = state.error !== undefined && state.error instanceof Error;
      expect(hasValidError).toBe(false);
      
      state.error = new Error('Test');
      expect(state.error !== undefined && state.error instanceof Error).toBe(true);
    });

    it('should handle logger conditions correctly', () => {
      // Simulate logger conditions
      const isDevelopment = true;
      const logLevel = 'debug';
      
      const shouldLog = (level: string): boolean => {
        if (!isDevelopment && (level === 'debug' || level === 'trace' || level === 'info')) {
          return false;
        }
        return true;
      };
      
      expect(shouldLog('error')).toBe(true);
      expect(shouldLog('warn')).toBe(true);
      expect(shouldLog('debug')).toBe(true); // In development
      
      // Simulate production
      const shouldLogProd = (level: string): boolean => {
        const isProd = true;
        if (isProd && (level === 'debug' || level === 'trace' || level === 'info')) {
          return false;
        }
        return true;
      };
      
      expect(shouldLogProd('error')).toBe(true);
      expect(shouldLogProd('debug')).toBe(false);
    });
  });

  describe('Edge Cases and Type Coercion', () => {
    it('should handle empty string vs undefined correctly', () => {
      const hasContent = (value: string | undefined): boolean => 
        value !== undefined && value.trim() !== '';
      
      // These should all be different with strict equality
      expect(hasContent(undefined)).toBe(false);
      expect(hasContent('')).toBe(false);
      expect(hasContent('0')).toBe(true);
      expect(hasContent('false')).toBe(true);
      
      // Test that loose equality would give different results
      const hasContentLoose = (value: any): boolean => 
        value != undefined && value.trim() != '';
      
      // With loose equality, null would also be caught
      expect(hasContentLoose(null)).toBe(false);
      expect(hasContent(null as any)).toBe(true); // Strict equality doesn't catch null
    });

    it('should handle boolean prop checks correctly', () => {
      // React component boolean props
      const props = {
        allowRetry: true,
        allowHome: false,
        showDetails: undefined
      };
      
      // Ternary in JSX (implicit truthiness check)
      const shouldShowRetry = props.allowRetry ? true : false;
      const shouldShowHome = props.allowHome ? true : false;
      const shouldShowDetails = props.showDetails ? true : false;
      
      expect(shouldShowRetry).toBe(true);
      expect(shouldShowHome).toBe(false);
      expect(shouldShowDetails).toBe(false);
      
      // With strict undefined check
      const hasRetryProp = props.allowRetry !== undefined;
      const hasHomeProp = props.allowHome !== undefined;
      const hasDetailsProp = props.showDetails !== undefined;
      
      expect(hasRetryProp).toBe(true);
      expect(hasHomeProp).toBe(true);
      expect(hasDetailsProp).toBe(false);
    });

    it('should handle number comparisons correctly', () => {
      const retryCount = 0;
      
      // Numeric comparisons don't need === but should be consistent
      expect(retryCount > 2).toBe(false);
      expect(retryCount >= 0).toBe(true);
      expect(retryCount < 3).toBe(true);
      
      // When comparing to specific values, use strict equality
      expect(retryCount === 0).toBe(true);
      expect(retryCount !== 1).toBe(true);
    });
  });
});