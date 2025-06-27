#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const pidFile = join(projectRoot, 'dev-server.pid');

// Store running processes
const runningProcesses = [];

// Cleanup function
function cleanup() {
  console.log('\n🧹 Cleaning up development servers...');

  // Kill all running processes
  runningProcesses.forEach((proc) => {
    if (proc && !proc.killed) {
      try {
        process.kill(-proc.pid); // Kill process group
      } catch (err) {
        // Process might already be dead
      }
    }
  });

  // Remove PID file
  if (existsSync(pidFile)) {
    unlinkSync(pidFile);
  }

  console.log('✅ Cleanup complete');
  process.exit(0);
}

// Handle various termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);
process.on('exit', cleanup);

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  cleanup();
});

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const killProc = spawn('lsof', ['-ti', `:${port}`], { stdio: 'pipe' });

    killProc.stdout.on('data', (data) => {
      const pids = data.toString().trim().split('\n').filter(Boolean);
      if (pids.length > 0) {
        console.log(`🔪 Killing existing processes on port ${port}: ${pids.join(', ')}`);
        pids.forEach((pid) => {
          try {
            process.kill(pid, 'SIGTERM');
          } catch (err) {
            // Process might already be dead
          }
        });
      }
    });

    killProc.on('close', () => {
      // Wait a moment for processes to die
      setTimeout(resolve, 1000);
    });
  });
}

async function startDevelopmentServers() {
  console.log('🚀 Starting Teaching Engine 2.0 development servers...\n');

  // Kill any existing processes on our ports
  await killProcessOnPort(3000); // Backend
  await killProcessOnPort(5173); // Frontend

  // Generate Prisma client first
  console.log('📦 Generating Prisma client...');
  const prismaGenerate = spawn('pnpm', ['db:generate'], {
    cwd: projectRoot,
    stdio: 'inherit',
    detached: true,
  });

  await new Promise((resolve, reject) => {
    prismaGenerate.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Prisma generate failed with code ${code}`));
      }
    });
  });

  console.log('✅ Prisma client generated\n');

  // Start backend server
  console.log('🔧 Starting backend server (port 3000)...');
  const backend = spawn('pnpm', ['--filter', 'server', 'run', 'dev'], {
    cwd: projectRoot,
    stdio: ['inherit', 'inherit', 'inherit'],
    detached: true,
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  });

  runningProcesses.push(backend);

  backend.on('error', (err) => {
    console.error('❌ Backend server error:', err);
  });

  // Wait for backend to start
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Start frontend server
  console.log('🎨 Starting frontend server (port 5173)...');
  const frontend = spawn('pnpm', ['--filter', 'client', 'run', 'dev'], {
    cwd: projectRoot,
    stdio: ['inherit', 'inherit', 'inherit'],
    detached: true,
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  });

  runningProcesses.push(frontend);

  frontend.on('error', (err) => {
    console.error('❌ Frontend server error:', err);
  });

  // Save PID for cleanup
  writeFileSync(pidFile, process.pid.toString());

  console.log('\n🎉 Development servers started successfully!');
  console.log('📍 Backend:  http://localhost:3000');
  console.log('📍 Frontend: http://localhost:5173');
  console.log('\n💡 Press Ctrl+C to stop all servers\n');

  // Keep the process alive
  setInterval(() => {}, 1000);
}

// Start the servers
startDevelopmentServers().catch((err) => {
  console.error('❌ Failed to start development servers:', err);
  cleanup();
});
