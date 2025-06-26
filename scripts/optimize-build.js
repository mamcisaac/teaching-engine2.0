#!/usr/bin/env node

/**
 * Build Optimization Script for Teaching Engine 2.0
 * 
 * This script orchestrates the build process with:
 * - Intelligent caching
 * - Performance monitoring
 * - Parallel execution
 * - Build analysis
 */

import { spawn } from 'child_process';
import BuildCacheManager from './build-cache-manager.js';
import BuildPerformanceMonitor from './build-monitor.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

class BuildOptimizer {
  constructor() {
    this.cache = new BuildCacheManager();
    this.monitor = new BuildPerformanceMonitor();
    this.buildSteps = [];
  }

  /**
   * Run optimized build process
   */
  async run() {
    console.log(chalk.bold.blue('🚀 Starting Optimized Build Process'));
    console.log(chalk.gray('═'.repeat(60)));

    try {
      // Phase 1: Pre-build checks
      await this.preBuildChecks();

      // Phase 2: Dependencies
      await this.buildDependencies();

      // Phase 3: Parallel builds
      await this.parallelBuild();

      // Phase 4: Post-build optimization
      await this.postBuildOptimization();

      // Generate report
      await this.monitor.generateReport();
      
      console.log(chalk.bold.green('\n✅ Build completed successfully!'));
    } catch (error) {
      console.error(chalk.bold.red('\n❌ Build failed:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Pre-build checks and cache validation
   */
  async preBuildChecks() {
    this.monitor.startPhase('Pre-build Checks');

    // Check for uncommitted changes
    const gitStatus = await this.exec('git status --porcelain');
    if (gitStatus.trim()) {
      this.monitor.addWarning('Uncommitted changes detected', {
        files: gitStatus.trim().split('\n').length
      });
    }

    // Clean old cache entries
    await this.cache.cleanCache();

    // Check disk space
    const diskSpace = await this.checkDiskSpace();
    if (diskSpace < 1024 * 1024 * 1024) { // Less than 1GB
      this.monitor.addWarning('Low disk space', {
        available: `${(diskSpace / 1024 / 1024).toFixed(0)}MB`
      });
    }

    this.monitor.endPhase('Pre-build Checks');
  }

  /**
   * Build dependencies with caching
   */
  async buildDependencies() {
    this.monitor.startPhase('Dependencies Build');

    // Check cache for database package
    const dbFiles = [
      'packages/database/prisma/schema.prisma',
      'packages/database/package.json'
    ];
    
    const dbCacheKey = await this.cache.getCacheKey(dbFiles, {
      command: 'db:generate'
    });

    const dbCached = await this.cache.checkCache(dbCacheKey);
    
    if (dbCached) {
      console.log(chalk.green('✓ Using cached Prisma client'));
      await this.cache.restoreFromCache(dbCacheKey);
    } else {
      console.log(chalk.yellow('⚙️  Generating Prisma client...'));
      const startTime = Date.now();
      
      await this.exec('pnpm db:generate');
      
      const buildTime = Date.now() - startTime;
      await this.cache.saveToCache(dbCacheKey, [
        {
          path: 'packages/database/node_modules/.prisma',
          buildTime
        },
        {
          path: 'packages/database/node_modules/@prisma',
          buildTime
        }
      ]);
    }

    this.monitor.endPhase('Dependencies Build');
  }

  /**
   * Run parallel builds for client and server
   */
  async parallelBuild() {
    this.monitor.startPhase('Parallel Build');

    const builds = [
      this.buildClient(),
      this.buildServer(),
      this.buildScripts()
    ];

    await Promise.all(builds);

    this.monitor.endPhase('Parallel Build');
  }

  /**
   * Build client with Vite
   */
  async buildClient() {
    this.monitor.startPhase('Client Build');

    const clientFiles = await this.getSourceFiles('client/src');
    const clientCacheKey = await this.cache.getCacheKey(clientFiles, {
      buildTool: 'vite',
      config: 'client/vite.config.ts'
    });

    const cached = await this.cache.checkCache(clientCacheKey);
    
    if (cached) {
      console.log(chalk.green('✓ Using cached client build'));
      await this.cache.restoreFromCache(clientCacheKey);
    } else {
      console.log(chalk.yellow('⚙️  Building client...'));
      const startTime = Date.now();
      
      // Use optimized Vite config if available
      const configPath = await fs.pathExists('client/vite.config.optimized.ts')
        ? 'client/vite.config.optimized.ts'
        : 'client/vite.config.ts';
      
      await this.exec(`pnpm --filter client vite build --config ${configPath}`, {
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });
      
      const buildTime = Date.now() - startTime;
      
      // Track bundle sizes
      await this.monitor.trackBundleSizes('client/dist');
      
      // Cache the build
      await this.cache.saveToCache(clientCacheKey, [
        {
          path: 'client/dist',
          buildTime
        }
      ]);
    }

    this.monitor.endPhase('Client Build');
  }

  /**
   * Build server with TypeScript
   */
  async buildServer() {
    this.monitor.startPhase('Server Build');

    const serverFiles = await this.getSourceFiles('server/src');
    const serverCacheKey = await this.cache.getCacheKey(serverFiles, {
      buildTool: 'tsc',
      tsconfig: 'server/tsconfig.json'
    });

    const cached = await this.cache.checkCache(serverCacheKey);
    
    if (cached) {
      console.log(chalk.green('✓ Using cached server build'));
      await this.cache.restoreFromCache(serverCacheKey);
    } else {
      console.log(chalk.yellow('⚙️  Building server...'));
      const startTime = Date.now();
      
      await this.exec('pnpm --filter server build', {
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });
      
      const buildTime = Date.now() - startTime;
      
      // Cache the build
      await this.cache.saveToCache(serverCacheKey, [
        {
          path: 'server/dist',
          buildTime
        }
      ]);
    }

    this.monitor.endPhase('Server Build');
  }

  /**
   * Build scripts package
   */
  async buildScripts() {
    this.monitor.startPhase('Scripts Build');

    const scriptsFiles = await this.getSourceFiles('scripts', ['.js', '.ts']);
    
    if (scriptsFiles.length > 0) {
      // TypeScript files need compilation
      const tsFiles = scriptsFiles.filter(f => f.endsWith('.ts'));
      if (tsFiles.length > 0) {
        await this.exec('pnpm --filter scripts tsc');
      }
    }

    this.monitor.endPhase('Scripts Build');
  }

  /**
   * Post-build optimization
   */
  async postBuildOptimization() {
    this.monitor.startPhase('Post-build Optimization');

    // Compress static assets
    if (await fs.pathExists('client/dist')) {
      console.log(chalk.yellow('📦 Compressing assets...'));
      
      // Find all JS and CSS files
      const assets = await this.getFilesRecursively('client/dist', ['.js', '.css']);
      
      for (const asset of assets) {
        // Skip if already compressed
        if (await fs.pathExists(`${asset}.gz`) || await fs.pathExists(`${asset}.br`)) {
          continue;
        }
        
        // Gzip compression
        await this.exec(`gzip -k -9 "${asset}"`).catch(() => {});
        
        // Brotli compression (if available)
        await this.exec(`brotli -k -Z "${asset}"`).catch(() => {});
      }
    }

    // Generate build manifest
    await this.generateBuildManifest();

    this.monitor.endPhase('Post-build Optimization');
  }

  /**
   * Generate build manifest
   */
  async generateBuildManifest() {
    const manifest = {
      timestamp: new Date().toISOString(),
      version: await this.getVersion(),
      commit: await this.getGitCommit(),
      branch: await this.getGitBranch(),
      stats: await this.cache.getCacheStats(),
      files: {}
    };

    // Add file hashes
    if (await fs.pathExists('client/dist')) {
      const files = await this.getFilesRecursively('client/dist', ['.js', '.css']);
      for (const file of files) {
        const hash = await this.cache.hashFile(file);
        const stats = await fs.stat(file);
        manifest.files[path.relative('client/dist', file)] = {
          size: stats.size,
          hash
        };
      }
    }

    await fs.writeJson('build-manifest.json', manifest, { spaces: 2 });
    console.log(chalk.green('✓ Build manifest generated'));
  }

  /**
   * Get source files for a directory
   */
  async getSourceFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];
    
    if (!await fs.pathExists(dir)) {
      return files;
    }

    const walk = async (currentDir) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    await walk(dir);
    return files;
  }

  /**
   * Get files recursively with extensions
   */
  async getFilesRecursively(dir, extensions) {
    const files = [];
    
    const walk = async (currentDir) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    await walk(dir);
    return files;
  }

  /**
   * Execute command with promise
   */
  exec(command, options = {}) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, {
        shell: true,
        stdio: 'pipe',
        ...options
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed: ${command}\n${stderr}`));
        }
      });
    });
  }

  /**
   * Check available disk space
   */
  async checkDiskSpace() {
    try {
      const output = await this.exec("df -k . | tail -1 | awk '{print $4}'");
      return parseInt(output.trim()) * 1024; // Convert to bytes
    } catch {
      return Infinity; // Assume enough space if check fails
    }
  }

  /**
   * Get package version
   */
  async getVersion() {
    try {
      const pkg = await fs.readJson('package.json');
      return pkg.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get current git commit
   */
  async getGitCommit() {
    try {
      const commit = await this.exec('git rev-parse --short HEAD');
      return commit.trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get current git branch
   */
  async getGitBranch() {
    try {
      const branch = await this.exec('git rev-parse --abbrev-ref HEAD');
      return branch.trim();
    } catch {
      return 'unknown';
    }
  }
}

// Run the optimizer
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new BuildOptimizer();
  optimizer.run();
}