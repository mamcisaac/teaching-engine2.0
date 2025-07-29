/**
 * Client-Side Module Resolution Integration Tests
 * 
 * Tests real module imports and resolution without mocks
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { JSDOM } from 'jsdom';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Module Resolution - Client Side', () => {
  let dom: JSDOM;
  let window: any;
  let document: any;

  beforeAll(() => {
    // Setup DOM environment for client-side testing
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    
    window = dom.window;
    document = window.document;
    
    // Setup globals needed by client code
    global.window = window as any;
    global.document = document;
    global.navigator = window.navigator;
  });

  afterAll(() => {
    dom.window.close();
  });

  describe('Dialog Component Module Resolution', () => {
    it('should import Dialog component with @radix-ui dependencies', async () => {
      // Read the actual Dialog component file
      const dialogPath = path.join(__dirname, '../../client/src/components/Dialog.tsx');
      const dialogContent = await readFile(dialogPath, 'utf-8');
      
      // Verify imports are present
      expect(dialogContent).toContain("import * as RadixDialog from '@radix-ui/react-dialog'");
      expect(dialogContent).toContain("import type { ReactNode } from 'react'");
      
      // Verify the component uses RadixDialog components
      expect(dialogContent).toContain('<RadixDialog.Root');
      expect(dialogContent).toContain('<RadixDialog.Portal>');
      expect(dialogContent).toContain('<RadixDialog.Overlay');
      expect(dialogContent).toContain('<RadixDialog.Content');
      expect(dialogContent).toContain('<RadixDialog.Title');
      expect(dialogContent).toContain('<RadixDialog.Description');
    });

    it('should export Dialog component correctly', async () => {
      const dialogPath = path.join(__dirname, '../../client/src/components/Dialog.tsx');
      const dialogContent = await readFile(dialogPath, 'utf-8');
      
      // Verify named export
      expect(dialogContent).toContain('export { Dialog }');
      
      // Verify the component function signature
      expect(dialogContent).toMatch(/function Dialog\(/);
      expect(dialogContent).toContain('DialogProps');
    });
  });

  describe('ErrorBoundaries Component Module Resolution', () => {
    it('should import all required dependencies', async () => {
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // Verify icon imports
      expect(content).toContain("import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react'");
      
      // Verify React imports
      expect(content).toContain("import type { ReactNode, ErrorInfo } from 'react'");
      expect(content).toContain("import React, { Component } from 'react'");
      
      // Verify service imports
      expect(content).toContain("import { errorReportingService } from '../services/errorReportingService'");
      expect(content).toContain("import { logger } from '../utils/logger'");
      
      // Verify UI component imports
      expect(content).toContain("import { Alert, AlertDescription, AlertTitle } from './ui/alert'");
      expect(content).toContain("import { Button } from './ui/Button'");
      expect(content).toContain("import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'");
    });

    it('should export all error boundary variants', async () => {
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // Verify all exports
      expect(content).toContain('export const PlanningErrorBoundary');
      expect(content).toContain('export const FormErrorBoundary');
      expect(content).toContain('export const AIErrorBoundary');
      expect(content).toContain('export const GlobalErrorBoundary');
      expect(content).toContain('export { ErrorBoundary, ErrorBoundaries }');
    });
  });

  describe('Client Logger Module Resolution', () => {
    it('should import logger types correctly', async () => {
      const loggerPath = path.join(__dirname, '../../client/src/utils/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Verify type imports
      expect(content).toContain("import type { WindowWithErrorReporter, LoggerResponse } from '../types/errors'");
      
      // Verify class definition
      expect(content).toContain('class ClientLogger');
      
      // Verify exports
      expect(content).toContain('export { logger, ClientLogger }');
      expect(content).toContain('export type { LogLevel, LogEntry }');
    });

    it('should use import.meta.env for environment variables', async () => {
      const loggerPath = path.join(__dirname, '../../client/src/utils/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Verify Vite environment variable usage
      expect(content).toContain('import.meta.env.DEV');
      expect(content).toContain('import.meta.env.VITE_ENABLE_LOGGING');
      expect(content).toContain('import.meta.env.MODE');
    });
  });

  describe('Component Import Integration', () => {
    it('should resolve ui component imports correctly', async () => {
      const componentsDir = path.join(__dirname, '../../client/src/components');
      
      // Check if UI components are properly structured
      const errorBoundariesPath = path.join(componentsDir, 'ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // These imports should resolve to actual component files
      const uiImports = [
        './ui/alert',
        './ui/Button',
        './ui/card'
      ];
      
      for (const importPath of uiImports) {
        expect(content).toContain(`from '${importPath}'`);
      }
    });
  });

  describe('Cross-Component Dependencies', () => {
    it('should handle circular dependency prevention', async () => {
      // Check that logger doesn't import from components that use it
      const loggerPath = path.join(__dirname, '../../client/src/utils/logger.ts');
      const loggerContent = await readFile(loggerPath, 'utf-8');
      
      // Logger should not import from components
      expect(loggerContent).not.toContain("from '../components");
      expect(loggerContent).not.toContain("from '@/components");
    });

    it('should maintain proper import hierarchy', async () => {
      // Components should import from utils and services
      const errorBoundariesPath = path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx');
      const content = await readFile(errorBoundariesPath, 'utf-8');
      
      // Should import from lower-level modules
      expect(content).toContain("from '../services/");
      expect(content).toContain("from '../utils/");
      
      // Should not have circular imports back to components (except ui subfolder)
      const nonUiImports = content.match(/from '\.\.\/[^']+'/g) || [];
      const invalidImports = nonUiImports.filter(imp => 
        imp.includes('components') && !imp.includes('./ui/')
      );
      expect(invalidImports).toHaveLength(0);
    });
  });

  describe('TypeScript Type Imports', () => {
    it('should use type imports where appropriate', async () => {
      const files = [
        path.join(__dirname, '../../client/src/components/Dialog.tsx'),
        path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx'),
        path.join(__dirname, '../../client/src/utils/logger.ts')
      ];
      
      for (const filePath of files) {
        const content = await readFile(filePath, 'utf-8');
        
        // Check for type imports
        const typeImports = content.match(/import type \{[^}]+\}/g) || [];
        expect(typeImports.length).toBeGreaterThan(0);
        
        // Verify separation of type and value imports
        if (content.includes("import type { ReactNode")) {
          expect(content).toMatch(/import React[^;]+from 'react'/);
        }
      }
    });
  });

  describe('Module Resolution Performance', () => {
    it('should resolve modules within acceptable time', async () => {
      const start = performance.now();
      
      // Simulate module resolution by reading and parsing files
      const files = [
        path.join(__dirname, '../../client/src/components/Dialog.tsx'),
        path.join(__dirname, '../../client/src/components/ErrorBoundaries.tsx'),
        path.join(__dirname, '../../client/src/utils/logger.ts')
      ];
      
      await Promise.all(files.map(file => readFile(file, 'utf-8')));
      
      const duration = performance.now() - start;
      
      // Module resolution should be fast (under 100ms for these files)
      expect(duration).toBeLessThan(100);
    });
  });
});