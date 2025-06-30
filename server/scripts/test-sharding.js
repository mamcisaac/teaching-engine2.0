#!/usr/bin/env node

/**
 * Test Sharding Script
 * Splits tests across multiple processes for parallel execution
 */

import { spawn } from 'child_process';
import { glob } from 'glob';
import { cpus } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DEFAULT_SHARDS = cpus().length;
const TEST_PATTERNS = [
  'tests/unit/**/*.test.ts',
  'src/**/*.unit.test.ts',
  'tests/**/*.fast.test.ts',
];

async function getTestFiles() {
  const files = new Set();
  
  for (const pattern of TEST_PATTERNS) {
    const matches = await glob(pattern, {
      cwd: join(__dirname, '..'),
      absolute: false,
    });
    matches.forEach(file => files.add(file));
  }
  
  return Array.from(files);
}

function distributeTests(testFiles, shardCount) {
  const shards = Array.from({ length: shardCount }, () => []);
  
  // Sort files by estimated complexity (longer paths usually = more complex)
  testFiles.sort((a, b) => b.length - a.length);
  
  // Distribute tests round-robin with load balancing
  testFiles.forEach((file, index) => {
    // Find shard with least tests
    const minShard = shards.reduce((min, shard, idx) => 
      shard.length < shards[min].length ? idx : min, 0
    );
    shards[minShard].push(file);
  });
  
  return shards;
}

async function runShard(shardId, testFiles, totalShards) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Shard ${shardId + 1}/${totalShards}: Running ${testFiles.length} tests`);
    
    const env = {
      ...process.env,
      NODE_OPTIONS: '--experimental-vm-modules --max-old-space-size=512',
      JEST_SHARD_ID: String(shardId),
      JEST_TOTAL_SHARDS: String(totalShards),
    };
    
    const args = [
      '--config', 'jest.config.performance.js',
      '--maxWorkers', '1', // Each shard runs single-threaded
      '--testTimeout', '3000',
      '--bail',
      ...testFiles,
    ];
    
    const child = spawn('jest', args, {
      stdio: 'pipe',
      env,
      cwd: join(__dirname, '..'),
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(`[Shard ${shardId + 1}] ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(`[Shard ${shardId + 1}] ${data}`);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Shard ${shardId + 1}/${totalShards}: Completed successfully`);
        resolve({ shardId, success: true, output });
      } else {
        console.error(`❌ Shard ${shardId + 1}/${totalShards}: Failed with code ${code}`);
        resolve({ shardId, success: false, output, errorOutput });
      }
    });
    
    child.on('error', (err) => {
      console.error(`❌ Shard ${shardId + 1}/${totalShards}: Error - ${err.message}`);
      reject(err);
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Shard ${shardId + 1} timed out`));
    }, 60000);
  });
}

async function main() {
  const shardCount = parseInt(process.argv[2]) || DEFAULT_SHARDS;
  
  console.log('🔍 Discovering test files...');
  const testFiles = await getTestFiles();
  console.log(`📋 Found ${testFiles.length} test files`);
  
  if (testFiles.length === 0) {
    console.error('❌ No test files found');
    process.exit(1);
  }
  
  console.log(`🎯 Distributing tests across ${shardCount} shards...`);
  const shards = distributeTests(testFiles, shardCount);
  
  // Display shard distribution
  shards.forEach((files, idx) => {
    console.log(`  Shard ${idx + 1}: ${files.length} files`);
  });
  
  const startTime = Date.now();
  
  try {
    // Run all shards in parallel
    const results = await Promise.all(
      shards.map((files, idx) => runShard(idx, files, shardCount))
    );
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    // Aggregate results
    const allPassed = results.every(r => r.success);
    const passedShards = results.filter(r => r.success).length;
    
    console.log('\n📊 Test Sharding Results:');
    console.log(`  Total time: ${totalTime.toFixed(2)}s`);
    console.log(`  Shards passed: ${passedShards}/${shardCount}`);
    
    if (allPassed) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.error('❌ Some tests failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test sharding failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}