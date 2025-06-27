#!/usr/bin/env node

import { spawn } from 'child_process';
import { unlinkSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    console.log(`🔍 Checking for processes on port ${port}...`);
    const killProc = spawn('lsof', ['-ti', `:${port}`], { stdio: 'pipe' });

    killProc.stdout.on('data', (data) => {
      const pids = data.toString().trim().split('\n').filter(Boolean);
      if (pids.length > 0) {
        console.log(`🔪 Killing processes on port ${port}: ${pids.join(', ')}`);
        pids.forEach((pid) => {
          try {
            process.kill(pid, 'SIGKILL');
            console.log(`   ✅ Killed process ${pid}`);
          } catch (err) {
            console.log(`   ⚠️  Process ${pid} already dead`);
          }
        });
      } else {
        console.log(`   ✅ No processes found on port ${port}`);
      }
    });

    killProc.on('close', () => {
      resolve();
    });

    killProc.stderr.on('data', () => {
      console.log(`   ✅ No processes found on port ${port}`);
      resolve();
    });
  });
}

function cleanupFiles() {
  console.log('🧹 Cleaning up development files...');

  const filesToClean = [
    'dev-server.pid',
    'server.log',
    'dev.log',
    'dev-server.log',
    'server-output.log',
    'server-restart.log',
    'full-dev.log',
    'dev-clean.log',
  ];

  filesToClean.forEach((file) => {
    const filePath = join(projectRoot, file);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
        console.log(`   ✅ Removed ${file}`);
      } catch (err) {
        console.log(`   ⚠️  Could not remove ${file}: ${err.message}`);
      }
    }
  });

  // Clean up test database files
  try {
    const files = readdirSync(projectRoot);
    const testDbFiles = files.filter((file) => file.match(/^test.*\.db(-journal)?$/));
    testDbFiles.forEach((file) => {
      try {
        unlinkSync(join(projectRoot, file));
        console.log(`   ✅ Removed test database: ${file}`);
      } catch (err) {
        console.log(`   ⚠️  Could not remove ${file}: ${err.message}`);
      }
    });
  } catch (err) {
    console.log(`   ⚠️  Could not clean test databases: ${err.message}`);
  }
}

async function cleanup() {
  console.log('🧽 Teaching Engine 2.0 Development Cleanup\n');

  // Kill processes on common development ports
  await killProcessOnPort(3000); // Backend
  await killProcessOnPort(5173); // Frontend
  await killProcessOnPort(5555); // Prisma Studio
  await killProcessOnPort(9229); // Node Inspector

  // Clean up files
  cleanupFiles();

  console.log('\n🎉 Cleanup complete! You can now run `pnpm dev` safely.');
}

cleanup().catch(console.error);
