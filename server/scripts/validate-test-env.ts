#!/usr/bin/env node

import { prisma } from '../src/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

class TestEnvironmentValidator {
  private results: ValidationResult[] = [];

  async validate(): Promise<boolean> {
    console.log('🔍 Validating test environment...\n');

    // Run all validations
    await this.validateNodeVersion();
    await this.validateDependencies();
    await this.validateEnvironmentVariables();
    await this.validateDatabase();
    await this.validateTestData();
    await this.validateFileSystem();
    await this.validateMemory();
    await this.validateParallelExecution();

    // Print results
    this.printResults();

    // Return overall status
    const failures = this.results.filter(r => r.status === 'fail');
    return failures.length === 0;
  }

  private async validateNodeVersion(): Promise<void> {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion >= 18) {
      this.addResult('Node.js Version', 'pass', `${nodeVersion} (>= 18.0.0)`);
    } else {
      this.addResult('Node.js Version', 'fail', `${nodeVersion} (requires >= 18.0.0)`);
    }
  }

  private async validateDependencies(): Promise<void> {
    try {
      // Check if node_modules exists
      await fs.access(path.join(process.cwd(), 'node_modules'));
      
      // Check critical dependencies
      const deps = ['jest', '@prisma/client', 'supertest', 'bcryptjs'];
      const missing: string[] = [];
      
      for (const dep of deps) {
        try {
          require.resolve(dep);
        } catch {
          missing.push(dep);
        }
      }
      
      if (missing.length === 0) {
        this.addResult('Dependencies', 'pass', 'All critical dependencies installed');
      } else {
        this.addResult('Dependencies', 'fail', `Missing: ${missing.join(', ')}`);
      }
    } catch {
      this.addResult('Dependencies', 'fail', 'node_modules not found - run pnpm install');
    }
  }

  private async validateEnvironmentVariables(): Promise<void> {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const optional = ['JWT_EXPIRES_IN', 'SMTP_HOST', 'EMAIL_FROM'];
    
    const missing = required.filter(v => !process.env[v]);
    const missingOptional = optional.filter(v => !process.env[v]);
    
    if (missing.length === 0) {
      this.addResult('Environment Variables', 'pass', 'All required variables set');
      if (missingOptional.length > 0) {
        this.addResult(
          'Optional Variables',
          'warn',
          `Missing optional: ${missingOptional.join(', ')}`
        );
      }
    } else {
      this.addResult(
        'Environment Variables',
        'fail',
        `Missing required: ${missing.join(', ')}`
      );
    }
  }

  private async validateDatabase(): Promise<void> {
    try {
      // Test connection
      await prisma.$connect();
      
      // Check if schema is applied
      const tables = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `;
      
      const expectedTables = ['User', 'Subject', 'Outcome', 'Milestone', 'Activity'];
      const existingTables = tables.map(t => t.name);
      const missingTables = expectedTables.filter(t => !existingTables.includes(t));
      
      if (missingTables.length === 0) {
        this.addResult('Database Schema', 'pass', `${tables.length} tables found`);
      } else {
        this.addResult(
          'Database Schema',
          'fail',
          `Missing tables: ${missingTables.join(', ')}`,
          'Run: pnpm db:push or pnpm db:migrate'
        );
      }
      
      // Check database settings
      const journalMode = await prisma.$queryRaw<Array<{ journal_mode: string }>>`
        PRAGMA journal_mode
      `;
      
      if (journalMode[0]?.journal_mode === 'wal') {
        this.addResult('Database Optimization', 'pass', 'WAL mode enabled');
      } else {
        this.addResult('Database Optimization', 'warn', 'WAL mode not enabled');
      }
      
      await prisma.$disconnect();
    } catch (error) {
      this.addResult(
        'Database Connection',
        'fail',
        `Connection failed: ${error}`,
        'Check DATABASE_URL and database availability'
      );
    }
  }

  private async validateTestData(): Promise<void> {
    try {
      const counts = {
        users: await prisma.user.count(),
        subjects: await prisma.subject.count(),
        outcomes: await prisma.outcome.count(),
      };
      
      if (counts.users > 0 && counts.subjects > 0 && counts.outcomes > 0) {
        this.addResult(
          'Test Data',
          'pass',
          `Found: ${counts.users} users, ${counts.subjects} subjects, ${counts.outcomes} outcomes`
        );
      } else {
        this.addResult(
          'Test Data',
          'warn',
          'No test data found',
          'Run: pnpm test:setup to seed test data'
        );
      }
    } catch (error) {
      this.addResult('Test Data', 'fail', `Failed to check test data: ${error}`);
    }
  }

  private async validateFileSystem(): Promise<void> {
    // Check required directories
    const dirs = [
      'tests',
      'src',
      '../packages/database/prisma',
    ];
    
    const missing: string[] = [];
    for (const dir of dirs) {
      try {
        await fs.access(path.join(process.cwd(), dir));
      } catch {
        missing.push(dir);
      }
    }
    
    if (missing.length === 0) {
      this.addResult('File System', 'pass', 'All required directories exist');
    } else {
      this.addResult(
        'File System',
        'fail',
        `Missing directories: ${missing.join(', ')}`
      );
    }
    
    // Check disk space
    try {
      const stats = await fs.statfs(process.cwd());
      const freeGB = (stats.bavail * stats.bsize) / (1024 * 1024 * 1024);
      
      if (freeGB > 2) {
        this.addResult('Disk Space', 'pass', `${freeGB.toFixed(2)}GB free`);
      } else if (freeGB > 1) {
        this.addResult('Disk Space', 'warn', `${freeGB.toFixed(2)}GB free (low)`);
      } else {
        this.addResult('Disk Space', 'fail', `${freeGB.toFixed(2)}GB free (< 1GB)`);
      }
    } catch {
      this.addResult('Disk Space', 'warn', 'Could not check disk space');
    }
  }

  private async validateMemory(): Promise<void> {
    const memUsage = process.memoryUsage();
    const totalMB = (memUsage.rss / 1024 / 1024).toFixed(0);
    const heapMB = (memUsage.heapUsed / 1024 / 1024).toFixed(0);
    
    this.addResult(
      'Memory Usage',
      'pass',
      `Total: ${totalMB}MB, Heap: ${heapMB}MB`
    );
    
    // Check system memory
    try {
      const output = execSync('free -m 2>/dev/null || vm_stat 2>/dev/null', {
        encoding: 'utf8',
      });
      
      // Parse available memory (simplified)
      const lines = output.split('\n');
      let availableMB = 0;
      
      if (output.includes('Mem:')) {
        // Linux
        const memLine = lines.find(l => l.includes('Mem:'));
        if (memLine) {
          const parts = memLine.split(/\s+/);
          availableMB = parseInt(parts[6] || '0');
        }
      } else if (output.includes('Pages free:')) {
        // macOS
        const freePages = parseInt(output.match(/Pages free:\s+(\d+)/)?.[1] || '0');
        availableMB = (freePages * 4096) / 1024 / 1024;
      }
      
      if (availableMB > 1000) {
        this.addResult('System Memory', 'pass', `~${Math.round(availableMB / 1024)}GB available`);
      } else if (availableMB > 500) {
        this.addResult('System Memory', 'warn', `~${availableMB}MB available (low)`);
      } else {
        this.addResult('System Memory', 'fail', `~${availableMB}MB available (critical)`);
      }
    } catch {
      this.addResult('System Memory', 'warn', 'Could not check system memory');
    }
  }

  private async validateParallelExecution(): Promise<void> {
    const workers = process.env.JEST_WORKER_ID ? 1 : os.cpus().length;
    const maxWorkers = process.env.CI ? 2 : Math.floor(workers / 2);
    
    this.addResult(
      'Parallel Execution',
      'pass',
      `${workers} CPU cores available, Jest will use ${maxWorkers} workers`
    );
    
    // Check for potential conflicts
    if (process.env.CI) {
      this.addResult(
        'CI Environment',
        'pass',
        'Running in CI mode with limited parallelism'
      );
    }
  }

  private addResult(name: string, status: ValidationResult['status'], message: string, details?: string): void {
    this.results.push({ name, status, message, details });
  }

  private printResults(): void {
    console.log('\n📊 Validation Results:\n');
    
    const grouped = {
      pass: this.results.filter(r => r.status === 'pass'),
      warn: this.results.filter(r => r.status === 'warn'),
      fail: this.results.filter(r => r.status === 'fail'),
    };
    
    // Print passes
    if (grouped.pass.length > 0) {
      console.log('✅ Passed:');
      grouped.pass.forEach(r => {
        console.log(`  • ${r.name}: ${r.message}`);
      });
    }
    
    // Print warnings
    if (grouped.warn.length > 0) {
      console.log('\n⚠️  Warnings:');
      grouped.warn.forEach(r => {
        console.log(`  • ${r.name}: ${r.message}`);
        if (r.details) {
          console.log(`    → ${r.details}`);
        }
      });
    }
    
    // Print failures
    if (grouped.fail.length > 0) {
      console.log('\n❌ Failed:');
      grouped.fail.forEach(r => {
        console.log(`  • ${r.name}: ${r.message}`);
        if (r.details) {
          console.log(`    → ${r.details}`);
        }
      });
    }
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`  • Passed: ${grouped.pass.length}`);
    console.log(`  • Warnings: ${grouped.warn.length}`);
    console.log(`  • Failed: ${grouped.fail.length}`);
    
    if (grouped.fail.length === 0) {
      console.log('\n✅ Test environment is ready!');
    } else {
      console.log('\n❌ Test environment validation failed. Please fix the issues above.');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  new TestEnvironmentValidator()
    .validate()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Validation error:', error);
      process.exit(1);
    });
}

export { TestEnvironmentValidator };