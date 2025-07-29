/**
 * Server-Side Module Resolution Integration Tests
 * 
 * Tests real module imports and resolution for server-side code
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { createTestApp, cleanupTestApp, TestContext } from '../setup/integration-test-utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Module Resolution - Server Side', () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await createTestApp();
  });

  afterAll(async () => {
    await cleanupTestApp(testContext);
  });

  describe('Database Module Resolution', () => {
    it('should import Prisma client and types correctly', async () => {
      const databasePath = path.join(__dirname, '../../server/src/utils/database.ts');
      const content = await readFile(databasePath, 'utf-8');
      
      // Verify Prisma imports
      expect(content).toContain("import { Prisma } from '@prisma/client'");
      
      // Verify it uses Prisma types
      expect(content).toContain('Prisma.JsonObject');
      expect(content).toContain('Prisma.BatchPayload');
    });

    it('should import security utilities from scripts', async () => {
      const databasePath = path.join(__dirname, '../../server/src/utils/database.ts');
      const content = await readFile(databasePath, 'utf-8');
      
      // Verify script imports with proper relative path
      expect(content).toContain("import { validateFieldName } from '../../../scripts/db-security-utils'");
      
      // Verify usage of imported function
      expect(content).toContain('validateFieldName(');
    });

    it('should import performance utilities', async () => {
      const databasePath = path.join(__dirname, '../../server/src/utils/database.ts');
      const content = await readFile(databasePath, 'utf-8');
      
      // Verify performance import
      expect(content).toContain("import { measureDatabaseQuery } from './performance'");
      
      // Verify usage
      expect(content).toContain('measureDatabaseQuery(');
    });

    it('should import logger correctly', async () => {
      const databasePath = path.join(__dirname, '../../server/src/utils/database.ts');
      const content = await readFile(databasePath, 'utf-8');
      
      // Verify logger import
      expect(content).toContain("import { logger } from '../logger'");
      
      // Verify logger usage
      expect(content).toContain('logger.warn(');
    });
  });

  describe('Logger Module Resolution', () => {
    it('should import pino and its types', async () => {
      const loggerPath = path.join(__dirname, '../../server/src/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Verify pino imports
      expect(content).toContain("import pino, { stdSerializers } from 'pino'");
      expect(content).toContain("import { performance } from 'perf_hooks'");
      
      // Verify pino configuration
      expect(content).toContain('pino.LoggerOptions');
      expect(content).toContain('pino.Logger');
    });

    it('should handle ESLint disable comments properly', async () => {
      const loggerPath = path.join(__dirname, '../../server/src/logger.ts');
      const content = await readFile(loggerPath, 'utf-8');
      
      // Verify ESLint pragmas
      expect(content).toContain('/* eslint-disable @typescript-eslint/no-explicit-any');
      expect(content).toContain('// eslint-disable-next-line import/no-named-as-default');
    });
  });

  describe('Jest Configuration Module Resolution', () => {
    it('should properly configure module name mapper', async () => {
      const jestConfigPath = path.join(__dirname, '../../server/jest.config.js');
      const content = await readFile(jestConfigPath, 'utf-8');
      
      // Verify module name mapper configuration
      expect(content).toContain('moduleNameMapper:');
      expect(content).toContain("'^(\\.{1,2}/.*)\\.js$': '$1'");
      expect(content).toContain("'^@/(.*)$': '<rootDir>/src/$1'");
      expect(content).toContain("'^@shared/(.*)$': '<rootDir>/../shared/$1'");
      expect(content).toContain("'^tests/(.*)$': '<rootDir>/tests/$1'");
    });

    it('should configure transform patterns correctly', async () => {
      const jestConfigPath = path.join(__dirname, '../../server/jest.config.js');
      const content = await readFile(jestConfigPath, 'utf-8');
      
      // Verify transform configuration
      expect(content).toContain('transform:');
      expect(content).toContain('ts-jest');
      expect(content).toContain('useESM: true');
      expect(content).toContain("tsconfig: 'tsconfig.test.json'");
    });

    it('should handle different test types with proper configurations', async () => {
      const jestConfigPath = path.join(__dirname, '../../server/jest.config.js');
      const content = await readFile(jestConfigPath, 'utf-8');
      
      // Verify different test configurations
      expect(content).toContain('unitTestProject');
      expect(content).toContain('integrationTestProject');
      expect(content).toContain('securityTestProject');
      expect(content).toContain('performanceTestProject');
    });
  });

  describe('Shared Module Imports', () => {
    it('should import from shared utils correctly', async () => {
      const apiValidationPath = path.join(__dirname, '../../shared/utils/apiValidation.ts');
      const content = await readFile(apiValidationPath, 'utf-8');
      
      // Verify imports from shared modules
      expect(content).toContain("import { isObject, isString, isValidNumber, hasProperty, isError } from './typeGuards'");
      
      // Verify these are relative imports within shared
      expect(content).toMatch(/from '\.\/typeGuards'/);
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have proper test TypeScript configuration', async () => {
      const tsconfigTestPath = path.join(__dirname, '../../server/tsconfig.test.json');
      const content = await readFile(tsconfigTestPath, 'utf-8');
      const tsconfig = JSON.parse(content);
      
      // Verify extends
      expect(tsconfig.extends).toBe('./tsconfig.json');
      
      // Verify compiler options for tests
      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.types).toContain('jest');
      expect(tsconfig.compilerOptions.types).toContain('node');
      
      // Verify includes
      expect(tsconfig.include).toContain('tests/**/*');
      expect(tsconfig.include).toContain('src/**/*');
    });
  });

  describe('Module Resolution Performance', () => {
    it('should resolve server modules efficiently', async () => {
      const start = performance.now();
      
      // Test actual imports by dynamically importing modules
      const modules = [
        import('../../server/src/logger'),
        import('../../server/src/utils/database'),
        import('../../shared/utils/typeGuards'),
        import('../../shared/utils/apiValidation')
      ];
      
      await Promise.all(modules);
      
      const duration = performance.now() - start;
      
      // Server module resolution should be fast
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Circular Dependency Prevention', () => {
    it('should not have circular dependencies between logger and database', async () => {
      const loggerPath = path.join(__dirname, '../../server/src/logger.ts');
      const databasePath = path.join(__dirname, '../../server/src/utils/database.ts');
      
      const loggerContent = await readFile(loggerPath, 'utf-8');
      const databaseContent = await readFile(databasePath, 'utf-8');
      
      // Logger should not import database utilities
      expect(loggerContent).not.toContain("from './utils/database");
      expect(loggerContent).not.toContain("from '@/utils/database");
      
      // Database can import logger
      expect(databaseContent).toContain("from '../logger'");
    });
  });

  describe('Real Module Loading', () => {
    it('should successfully load and use the logger module', async () => {
      const { logger } = await import('../../server/src/logger');
      
      // Verify logger has expected methods
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.trace).toBe('function');
      
      // Verify custom methods
      expect(typeof logger.audit).toBe('function');
      expect(typeof logger.security).toBe('function');
      expect(typeof logger.business).toBe('function');
      expect(typeof logger.database).toBe('function');
      expect(typeof logger.ai).toBe('function');
    });

    it('should successfully load database utilities', async () => {
      const { dbUtils, commonIncludes } = await import('../../server/src/utils/database');
      
      // Verify exported utilities
      expect(typeof dbUtils.getPaginationParams).toBe('function');
      expect(typeof dbUtils.getSortingParams).toBe('function');
      expect(typeof dbUtils.buildDateRangeQuery).toBe('function');
      expect(typeof dbUtils.buildSearchQuery).toBe('function');
      
      // Verify common includes
      expect(commonIncludes.userBasic).toBeDefined();
      expect(typeof commonIncludes.withCounts).toBe('function');
      expect(typeof commonIncludes.withLimitedRelations).toBe('function');
    });
  });
});