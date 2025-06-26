/**
 * Optimized database setup for faster test execution
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

interface TestDatabaseOptions {
  useInMemory?: boolean;
  useCaching?: boolean;
  isolateTests?: boolean;
}

/**
 * Optimized database manager for tests
 */
export class OptimizedDatabaseManager {
  private static instance: OptimizedDatabaseManager;
  private databaseCache = new Map<string, string>();
  private setupPromises = new Map<string, Promise<void>>();

  static getInstance(): OptimizedDatabaseManager {
    if (!OptimizedDatabaseManager.instance) {
      OptimizedDatabaseManager.instance = new OptimizedDatabaseManager();
    }
    return OptimizedDatabaseManager.instance;
  }

  /**
   * Creates a hash of the current schema for caching
   */
  private getSchemaHash(): string {
    try {
      const schemaPath = path.resolve(__dirname, '../../../packages/database/prisma/schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      return crypto.createHash('md5').update(schemaContent).digest('hex');
    } catch (error) {
      console.warn('Could not read schema file for hashing:', error);
      return Date.now().toString();
    }
  }

  /**
   * Sets up a test database with caching and optimization
   */
  async setupDatabase(testName: string, options: TestDatabaseOptions = {}): Promise<string> {
    const {
      useInMemory = true,
      useCaching = true,
      isolateTests = true,
    } = options;

    const cacheKey = `${testName}_${this.getSchemaHash()}`;

    // Check if we already have a setup promise for this test
    if (this.setupPromises.has(cacheKey)) {
      await this.setupPromises.get(cacheKey);
      return this.databaseCache.get(cacheKey)!;
    }

    // Create setup promise
    const setupPromise = this._setupDatabaseInternal(testName, options);
    this.setupPromises.set(cacheKey, setupPromise);

    try {
      await setupPromise;
      return this.databaseCache.get(cacheKey)!;
    } catch (error) {
      this.setupPromises.delete(cacheKey);
      throw error;
    }
  }

  private async _setupDatabaseInternal(
    testName: string,
    options: TestDatabaseOptions
  ): Promise<void> {
    const { useInMemory = true, isolateTests = true } = options;
    const cacheKey = `${testName}_${this.getSchemaHash()}`;

    // Generate database path
    let databaseUrl: string;
    if (useInMemory) {
      // Use in-memory SQLite for maximum speed
      databaseUrl = 'file::memory:?cache=shared';
    } else if (isolateTests) {
      // Use isolated file-based database
      const dbName = `test_${testName}_${Date.now()}.db`;
      const dbPath = path.join(process.cwd(), 'tests', 'temp', dbName);
      databaseUrl = `file:${dbPath}`;
    } else {
      // Use shared test database (faster but less isolated)
      const dbPath = path.join(process.cwd(), 'tests', 'temp', 'shared_test.db');
      databaseUrl = `file:${dbPath}`;
    }

    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), 'tests', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Set environment variables
    process.env.DATABASE_URL = databaseUrl;

    try {
      // Generate Prisma client if needed (with caching)
      await this.ensurePrismaClient();

      // Initialize database schema
      if (!useInMemory) {
        await this.initializeSchema(databaseUrl);
      }

      this.databaseCache.set(cacheKey, databaseUrl);
    } catch (error) {
      console.error(`Failed to setup database for ${testName}:`, error);
      throw error;
    }
  }

  /**
   * Ensures Prisma client is generated (with caching)
   */
  private async ensurePrismaClient(): Promise<void> {
    const clientCacheFile = path.join(process.cwd(), 'tests', 'temp', '.prisma-client-cache');
    const schemaHash = this.getSchemaHash();

    // Check if client is already generated for this schema
    if (fs.existsSync(clientCacheFile)) {
      try {
        const cachedHash = fs.readFileSync(clientCacheFile, 'utf8').trim();
        if (cachedHash === schemaHash) {
          return; // Client is up to date
        }
      } catch (error) {
        // Ignore cache read errors
      }
    }

    // Generate Prisma client
    try {
      execSync('pnpm --filter @teaching-engine/database db:generate', {
        stdio: 'pipe',
        timeout: 30000,
        cwd: path.resolve(__dirname, '../../..'),
      });

      // Update cache
      fs.writeFileSync(clientCacheFile, schemaHash);
    } catch (error) {
      console.warn('Failed to generate Prisma client:', error);
      throw error;
    }
  }

  /**
   * Initializes database schema
   */
  private async initializeSchema(databaseUrl: string): Promise<void> {
    try {
      // Push schema to database
      execSync('pnpm --filter @teaching-engine/database db:push --force-reset', {
        stdio: 'pipe',
        timeout: 30000,
        cwd: path.resolve(__dirname, '../../..'),
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    } catch (error) {
      console.warn('Failed to initialize database schema:', error);
      throw error;
    }
  }

  /**
   * Cleans up test databases
   */
  async cleanup(): Promise<void> {
    const tempDir = path.join(process.cwd(), 'tests', 'temp');
    
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          if (file.startsWith('test_') && file.endsWith('.db')) {
            const filePath = path.join(tempDir, file);
            try {
              fs.unlinkSync(filePath);
              
              // Clean up WAL and SHM files
              const walPath = `${filePath}-wal`;
              const shmPath = `${filePath}-shm`;
              if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
              if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
            } catch (error) {
              console.warn(`Failed to delete test database: ${file}`, error);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Database cleanup failed:', error);
    }

    // Clear caches
    this.databaseCache.clear();
    this.setupPromises.clear();
  }
}

/**
 * Test result caching for faster test reruns
 */
export class TestResultCache {
  private static instance: TestResultCache;
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'tests', 'temp', '.test-cache');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  static getInstance(): TestResultCache {
    if (!TestResultCache.instance) {
      TestResultCache.instance = new TestResultCache();
    }
    return TestResultCache.instance;
  }

  /**
   * Gets a cache key for a test
   */
  private getCacheKey(testPath: string, testContent: string): string {
    const hash = crypto.createHash('md5')
      .update(testPath)
      .update(testContent)
      .update(this.getTestDependenciesHash())
      .digest('hex');
    return hash;
  }

  /**
   * Gets hash of test dependencies (source files that could affect tests)
   */
  private getTestDependenciesHash(): string {
    try {
      const srcDir = path.join(process.cwd(), 'src');
      const sourceFiles = this.getAllSourceFiles(srcDir);
      
      const contentHashes = sourceFiles.map(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const stats = fs.statSync(file);
          return `${file}:${stats.mtime.getTime()}:${content.length}`;
        } catch {
          return `${file}:missing`;
        }
      }).join('|');

      return crypto.createHash('md5').update(contentHashes).digest('hex');
    } catch {
      return Date.now().toString();
    }
  }

  /**
   * Gets all source files recursively
   */
  private getAllSourceFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory() && !entry.startsWith('.')) {
          files.push(...this.getAllSourceFiles(fullPath));
        } else if (stats.isFile() && /\.(ts|js)$/.test(entry)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Ignore errors
    }
    
    return files;
  }

  /**
   * Checks if test results are cached and valid
   */
  isCached(testPath: string): boolean {
    try {
      const testContent = fs.readFileSync(testPath, 'utf8');
      const cacheKey = this.getCacheKey(testPath, testContent);
      const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
      
      if (!fs.existsSync(cacheFile)) {
        return false;
      }

      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const cacheAge = Date.now() - cacheData.timestamp;
      
      // Cache is valid for 1 hour
      return cacheAge < 60 * 60 * 1000;
    } catch {
      return false;
    }
  }

  /**
   * Stores test results in cache
   */
  cache(testPath: string, results: any): void {
    try {
      const testContent = fs.readFileSync(testPath, 'utf8');
      const cacheKey = this.getCacheKey(testPath, testContent);
      const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
      
      const cacheData = {
        testPath,
        results,
        timestamp: Date.now(),
      };
      
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.warn('Failed to cache test results:', error);
    }
  }

  /**
   * Clears the test cache
   */
  clear(): void {
    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(this.cacheDir, file));
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear test cache:', error);
    }
  }
}

// Export singleton instances
export const optimizedDatabaseManager = OptimizedDatabaseManager.getInstance();
export const testResultCache = TestResultCache.getInstance();