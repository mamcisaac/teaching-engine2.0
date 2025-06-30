/**
 * Fast TypeScript Transformer for Jest
 * Uses SWC for faster TypeScript compilation
 */

import { transformSync } from '@swc/core';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = join(process.cwd(), '.jest-swc-cache');

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

function getCacheKey(filename, src) {
  const hash = createHash('md5');
  hash.update(filename);
  hash.update(src);
  hash.update(process.version);
  return hash.digest('hex');
}

function getCachePath(cacheKey) {
  return join(CACHE_DIR, `${cacheKey}.js`);
}

export function process(src, filename) {
  // Skip non-TypeScript files
  if (!filename.endsWith('.ts') && !filename.endsWith('.tsx')) {
    return src;
  }

  // Check cache
  const cacheKey = getCacheKey(filename, src);
  const cachePath = getCachePath(cacheKey);

  if (existsSync(cachePath)) {
    return readFileSync(cachePath, 'utf8');
  }

  try {
    // Transform with SWC for speed
    const result = transformSync(src, {
      filename,
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: filename.endsWith('.tsx'),
          decorators: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
        target: 'es2022',
        loose: true,
        externalHelpers: false,
      },
      module: {
        type: 'es6',
        ignoreDynamic: true,
      },
      sourceMaps: false, // Disable for speed
      minify: false,
    });

    // Cache the result
    writeFileSync(cachePath, result.code);

    return result.code;
  } catch (error) {
    console.error(`Transform error in ${filename}:`, error.message);
    throw error;
  }
}

export function getCacheKeyForFileContent(sourceText, sourcePath, _options) {
  return getCacheKey(sourcePath, sourceText);
}

// Clean cache command
if (process.argv[2] === 'clean') {
  console.log('Cleaning SWC cache...');
  if (existsSync(CACHE_DIR)) {
    const files = readdirSync(CACHE_DIR);
    files.forEach((file) => unlinkSync(join(CACHE_DIR, file)));
    console.log(`Removed ${files.length} cached files`);
  }
}
