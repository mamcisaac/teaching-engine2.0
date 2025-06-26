#!/usr/bin/env node

/**
 * Build Cache Manager for Teaching Engine 2.0
 * 
 * Implements intelligent caching strategies to optimize build times:
 * - Content-based cache keys
 * - Dependency graph tracking
 * - Incremental build support
 * - Cache invalidation strategies
 */

import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { createReadStream } from 'fs';

class BuildCacheManager {
  constructor() {
    this.cacheDir = path.join(process.cwd(), '.build-cache');
    this.cacheManifest = path.join(this.cacheDir, 'manifest.json');
    this.dependencyGraph = new Map();
    this.buildMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalBuilds: 0,
      timeSaved: 0
    };
    
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    fs.ensureDirSync(this.cacheDir);
    fs.ensureDirSync(path.join(this.cacheDir, 'artifacts'));
    fs.ensureDirSync(path.join(this.cacheDir, 'dependencies'));
  }

  /**
   * Generate a cache key based on file contents
   */
  async hashFile(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Generate cache key for a set of files
   */
  async getCacheKey(files, additionalFactors = {}) {
    const fileHashes = await Promise.all(
      files.map(async file => {
        try {
          const hash = await this.hashFile(file);
          const stats = await fs.stat(file);
          return `${file}:${hash}:${stats.mtime.getTime()}`;
        } catch (err) {
          console.warn(`Warning: Could not hash ${file}: ${err.message}`);
          return `${file}:missing`;
        }
      })
    );

    // Include additional factors in cache key
    const factors = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      ...additionalFactors
    };

    const combinedString = [
      ...fileHashes,
      JSON.stringify(factors)
    ].join(':');

    return crypto.createHash('sha256')
      .update(combinedString)
      .digest('hex');
  }

  /**
   * Check if cached artifacts exist for a given key
   */
  async checkCache(key) {
    try {
      const manifest = await this.loadManifest();
      const entry = manifest[key];
      
      if (!entry) {
        return null;
      }

      // Verify all artifacts still exist
      const allExist = await Promise.all(
        entry.artifacts.map(artifact => 
          fs.pathExists(path.join(this.cacheDir, 'artifacts', artifact.id))
        )
      );

      if (!allExist.every(exists => exists)) {
        // Cache corrupted, remove entry
        delete manifest[key];
        await this.saveManifest(manifest);
        return null;
      }

      // Check cache age (24 hours default)
      const maxAge = process.env.BUILD_CACHE_MAX_AGE || 24 * 60 * 60 * 1000;
      if (Date.now() - entry.timestamp > maxAge) {
        return null;
      }

      this.buildMetrics.cacheHits++;
      return entry;
    } catch (err) {
      console.warn('Cache check failed:', err.message);
      return null;
    }
  }

  /**
   * Save build artifacts to cache
   */
  async saveToCache(key, artifacts) {
    const manifest = await this.loadManifest();
    const artifactEntries = [];

    for (const artifact of artifacts) {
      const id = crypto.randomBytes(16).toString('hex');
      const destPath = path.join(this.cacheDir, 'artifacts', id);
      
      // Copy artifact to cache
      await fs.copy(artifact.path, destPath, { 
        preserveTimestamps: true,
        overwrite: true 
      });

      const stats = await fs.stat(artifact.path);
      artifactEntries.push({
        id,
        originalPath: artifact.path,
        size: stats.size,
        hash: await this.hashFile(artifact.path)
      });
    }

    manifest[key] = {
      timestamp: Date.now(),
      artifacts: artifactEntries,
      buildTime: artifacts.buildTime || 0
    };

    await this.saveManifest(manifest);
    this.buildMetrics.cacheMisses++;
  }

  /**
   * Restore cached artifacts
   */
  async restoreFromCache(key) {
    const entry = await this.checkCache(key);
    if (!entry) {
      return false;
    }

    const startTime = Date.now();

    for (const artifact of entry.artifacts) {
      const srcPath = path.join(this.cacheDir, 'artifacts', artifact.id);
      await fs.copy(srcPath, artifact.originalPath, {
        preserveTimestamps: true,
        overwrite: true
      });
    }

    const restoreTime = Date.now() - startTime;
    this.buildMetrics.timeSaved += (entry.buildTime - restoreTime);
    
    console.log(`✓ Cache hit! Restored ${entry.artifacts.length} artifacts in ${restoreTime}ms`);
    console.log(`  (saved ${entry.buildTime - restoreTime}ms)`);
    
    return true;
  }

  /**
   * Track file dependencies
   */
  async trackDependencies(entryFile, dependencies) {
    const depsFile = path.join(
      this.cacheDir, 
      'dependencies', 
      `${path.basename(entryFile)}.json`
    );
    
    await fs.writeJson(depsFile, {
      entry: entryFile,
      dependencies: dependencies.map(dep => ({
        path: dep,
        hash: await this.hashFile(dep).catch(() => 'unknown')
      })),
      timestamp: Date.now()
    });
  }

  /**
   * Get dependencies for a file
   */
  async getDependencies(entryFile) {
    const depsFile = path.join(
      this.cacheDir, 
      'dependencies', 
      `${path.basename(entryFile)}.json`
    );
    
    try {
      return await fs.readJson(depsFile);
    } catch {
      return null;
    }
  }

  /**
   * Clean old cache entries
   */
  async cleanCache(maxAge = 7 * 24 * 60 * 60 * 1000) {
    const manifest = await this.loadManifest();
    const now = Date.now();
    let removed = 0;
    let freedSpace = 0;

    for (const [key, entry] of Object.entries(manifest)) {
      if (now - entry.timestamp > maxAge) {
        // Remove artifacts
        for (const artifact of entry.artifacts) {
          const artifactPath = path.join(this.cacheDir, 'artifacts', artifact.id);
          if (await fs.pathExists(artifactPath)) {
            const stats = await fs.stat(artifactPath);
            freedSpace += stats.size;
            await fs.remove(artifactPath);
          }
        }
        
        delete manifest[key];
        removed++;
      }
    }

    await this.saveManifest(manifest);
    
    console.log(`Cache cleanup: removed ${removed} entries, freed ${(freedSpace / 1024 / 1024).toFixed(2)}MB`);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const manifest = await this.loadManifest();
    const artifacts = await fs.readdir(path.join(this.cacheDir, 'artifacts'));
    
    let totalSize = 0;
    for (const artifact of artifacts) {
      const stats = await fs.stat(path.join(this.cacheDir, 'artifacts', artifact));
      totalSize += stats.size;
    }

    return {
      entries: Object.keys(manifest).length,
      artifacts: artifacts.length,
      totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
      hitRate: this.buildMetrics.totalBuilds > 0 
        ? `${(this.buildMetrics.cacheHits / this.buildMetrics.totalBuilds * 100).toFixed(1)}%`
        : '0%',
      timeSaved: `${(this.buildMetrics.timeSaved / 1000).toFixed(1)}s`,
      ...this.buildMetrics
    };
  }

  /**
   * Load cache manifest
   */
  async loadManifest() {
    try {
      return await fs.readJson(this.cacheManifest);
    } catch {
      return {};
    }
  }

  /**
   * Save cache manifest
   */
  async saveManifest(manifest) {
    await fs.writeJson(this.cacheManifest, manifest, { spaces: 2 });
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  async invalidatePattern(pattern) {
    const manifest = await this.loadManifest();
    const regex = new RegExp(pattern);
    let invalidated = 0;

    for (const key of Object.keys(manifest)) {
      if (regex.test(key)) {
        delete manifest[key];
        invalidated++;
      }
    }

    await this.saveManifest(manifest);
    console.log(`Invalidated ${invalidated} cache entries matching ${pattern}`);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const cache = new BuildCacheManager();
  const command = process.argv[2];

  switch (command) {
    case 'clean':
      await cache.cleanCache();
      break;
    
    case 'stats':
      const stats = await cache.getCacheStats();
      console.log('Build Cache Statistics:');
      console.log(JSON.stringify(stats, null, 2));
      break;
    
    case 'invalidate':
      const pattern = process.argv[3];
      if (!pattern) {
        console.error('Usage: build-cache-manager invalidate <pattern>');
        process.exit(1);
      }
      await cache.invalidatePattern(pattern);
      break;
    
    default:
      console.log('Usage: build-cache-manager [clean|stats|invalidate <pattern>]');
  }
}

export default BuildCacheManager;