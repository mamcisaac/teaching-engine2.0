#!/usr/bin/env tsx
/**
 * AI Snapshot Update Script
 * 
 * Safely updates AI snapshots after review and approval.
 * Used for managing AI output changes and preventing regressions.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SnapshotUpdateOptions {
  testType?: string;
  scenario?: string;
  force?: boolean;
  dryRun?: boolean;
  reviewRequired?: boolean;
}

class AISnapshotUpdater {
  private readonly snapshotsDir: string;
  private readonly validationDir: string;

  constructor() {
    this.snapshotsDir = path.join(__dirname, '../tests/ai-snapshots/snapshots');
    this.validationDir = path.join(__dirname, '../tests/ai-snapshots/snapshots/validation-reports');
  }

  /**
   * Update AI snapshots with safety checks
   */
  async updateSnapshots(options: SnapshotUpdateOptions = {}): Promise<void> {
    console.log('🔄 Starting AI snapshot update process...');
    
    try {
      // Validate environment
      await this.validateEnvironment();
      
      // Check for uncommitted changes
      if (!options.force) {
        await this.checkGitStatus();
      }
      
      // Backup current snapshots
      await this.backupSnapshots();
      
      // Run tests to generate new snapshots
      await this.generateNewSnapshots(options);
      
      // Analyze changes
      const changes = await this.analyzeChanges();
      
      if (changes.length === 0) {
        console.log('✅ No snapshot changes detected');
        return;
      }
      
      // Review changes (if required)
      if (options.reviewRequired && !options.force) {
        await this.presentChangesForReview(changes);
        const approved = await this.promptForApproval();
        
        if (!approved) {
          console.log('❌ Update cancelled by user');
          await this.restoreBackup();
          return;
        }
      }
      
      // Validate new snapshots
      await this.validateNewSnapshots();
      
      // Commit changes (if not dry run)
      if (!options.dryRun) {
        await this.commitChanges(changes);
      }
      
      console.log('✅ AI snapshot update completed successfully');
      
    } catch (error) {
      console.error('❌ Snapshot update failed:', error);
      await this.restoreBackup();
      throw error;
    }
  }

  /**
   * Validate that the environment is ready for snapshot updates
   */
  private async validateEnvironment(): Promise<void> {
    console.log('🔍 Validating environment...');
    
    // Check if tests directory exists
    try {
      await fs.access(this.snapshotsDir);
    } catch {
      throw new Error('Snapshots directory not found. Run tests first to generate snapshots.');
    }
    
    // Check if we're in a git repository
    try {
      execSync('git status', { stdio: 'pipe' });
    } catch {
      throw new Error('Not in a git repository');
    }
    
    // Check for required dependencies
    try {
      execSync('pnpm --version', { stdio: 'pipe' });
    } catch {
      throw new Error('pnpm not found. Please install pnpm.');
    }
    
    console.log('✅ Environment validation passed');
  }

  /**
   * Check git status for uncommitted changes
   */
  private async checkGitStatus(): Promise<void> {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      
      if (status.trim()) {
        console.warn('⚠️  Uncommitted changes detected:');
        console.log(status);
        
        const response = await this.prompt('Continue anyway? (y/N): ');
        if (response.toLowerCase() !== 'y') {
          throw new Error('Update cancelled due to uncommitted changes');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Update cancelled')) {
        throw error;
      }
      console.warn('Could not check git status:', error);
    }
  }

  /**
   * Backup current snapshots
   */
  private async backupSnapshots(): Promise<void> {
    console.log('💾 Creating snapshot backup...');
    
    const backupDir = path.join(__dirname, '../tests/ai-snapshots/backup');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `snapshots-${timestamp}`);
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      await fs.cp(this.snapshotsDir, backupPath, { recursive: true });
      
      // Store backup path for restoration
      await fs.writeFile(
        path.join(backupDir, 'latest-backup'),
        backupPath,
        'utf-8'
      );
      
      console.log(`✅ Backup created at: ${backupPath}`);
    } catch (error) {
      console.warn('⚠️  Could not create backup:', error);
    }
  }

  /**
   * Generate new snapshots by running tests
   */
  private async generateNewSnapshots(options: SnapshotUpdateOptions): Promise<void> {
    console.log('🧪 Generating new snapshots...');
    
    const env = {
      ...process.env,
      AI_TESTING_MODE: 'snapshot',
      NODE_ENV: 'test',
    };
    
    let testCommand = 'pnpm test tests/ai-snapshots/';
    
    if (options.testType) {
      testCommand += `${options.testType}.snapshot.test.ts`;
    } else {
      testCommand += '*.snapshot.test.ts';
    }
    
    try {
      execSync(testCommand, {
        stdio: 'inherit',
        env,
        cwd: path.join(__dirname, '..'),
      });
      
      console.log('✅ New snapshots generated');
    } catch (error) {
      throw new Error(`Test execution failed: ${error}`);
    }
  }

  /**
   * Analyze what changed in the snapshots
   */
  private async analyzeChanges(): Promise<SnapshotChange[]> {
    console.log('📊 Analyzing snapshot changes...');
    
    try {
      const gitDiff = execSync('git diff --name-only tests/ai-snapshots/snapshots/', {
        encoding: 'utf-8',
        cwd: path.join(__dirname, '..'),
      });
      
      const changedFiles = gitDiff.trim().split('\n').filter(file => file);
      const changes: SnapshotChange[] = [];
      
      for (const file of changedFiles) {
        if (file.endsWith('.snapshot.json')) {
          const changeDetails = await this.getChangeDetails(file);
          changes.push(changeDetails);
        }
      }
      
      return changes;
    } catch (error) {
      console.warn('Could not analyze changes:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a specific change
   */
  private async getChangeDetails(filePath: string): Promise<SnapshotChange> {
    const fullPath = path.join(__dirname, '..', filePath);
    const fileName = path.basename(filePath);
    
    try {
      // Get git diff for this file
      const diff = execSync(`git diff ${filePath}`, {
        encoding: 'utf-8',
        cwd: path.join(__dirname, '..'),
      });
      
      // Parse the snapshot to get test type and scenario
      const snapshotContent = await fs.readFile(fullPath, 'utf-8');
      const snapshot = JSON.parse(snapshotContent);
      
      return {
        file: fileName,
        path: filePath,
        testType: snapshot.metadata?.testType || 'unknown',
        scenario: snapshot.metadata?.scenario || 'unknown',
        diff,
        hasValidationChanges: diff.includes('validation'),
        hasContentChanges: diff.includes('response'),
      };
    } catch (error) {
      return {
        file: fileName,
        path: filePath,
        testType: 'unknown',
        scenario: 'unknown',
        diff: '',
        hasValidationChanges: false,
        hasContentChanges: false,
      };
    }
  }

  /**
   * Present changes for human review
   */
  private async presentChangesForReview(changes: SnapshotChange[]): Promise<void> {
    console.log('\n📋 Snapshot Changes Summary:');
    console.log('=' .repeat(50));
    
    for (const change of changes) {
      console.log(`\n📄 File: ${change.file}`);
      console.log(`   Test Type: ${change.testType}`);
      console.log(`   Scenario: ${change.scenario}`);
      console.log(`   Content Changes: ${change.hasContentChanges ? '✅' : '❌'}`);
      console.log(`   Validation Changes: ${change.hasValidationChanges ? '✅' : '❌'}`);
      
      if (change.diff) {
        console.log('\n   Diff Preview:');
        const diffLines = change.diff.split('\n').slice(0, 10);
        diffLines.forEach(line => console.log(`   ${line}`));
        
        if (change.diff.split('\n').length > 10) {
          console.log('   ... (truncated)');
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
  }

  /**
   * Prompt user for approval
   */
  private async promptForApproval(): Promise<boolean> {
    const response = await this.prompt('\nApprove these changes? (y/N): ');
    return response.toLowerCase() === 'y' || response.toLowerCase() === 'yes';
  }

  /**
   * Validate that new snapshots meet quality standards
   */
  private async validateNewSnapshots(): Promise<void> {
    console.log('🔍 Validating new snapshots...');
    
    // Run content validation tests
    try {
      execSync('pnpm test tests/ai-snapshots/content-validation.test.ts', {
        stdio: 'pipe',
        cwd: path.join(__dirname, '..'),
        env: {
          ...process.env,
          NODE_ENV: 'test',
        },
      });
      
      console.log('✅ Snapshot validation passed');
    } catch (error) {
      throw new Error('New snapshots failed validation. Update aborted.');
    }
  }

  /**
   * Commit the snapshot changes
   */
  private async commitChanges(changes: SnapshotChange[]): Promise<void> {
    console.log('💾 Committing snapshot changes...');
    
    try {
      // Stage snapshot files
      execSync('git add tests/ai-snapshots/snapshots/', {
        cwd: path.join(__dirname, '..'),
      });
      
      // Create commit message
      const testTypes = [...new Set(changes.map(c => c.testType))];
      const commitMessage = `chore: update AI snapshots for ${testTypes.join(', ')}
      
Updated ${changes.length} snapshot(s):
${changes.map(c => `- ${c.testType}: ${c.scenario}`).join('\n')}

🤖 Generated with AI Snapshot Updater`;
      
      execSync(`git commit -m "${commitMessage}"`, {
        cwd: path.join(__dirname, '..'),
      });
      
      console.log('✅ Changes committed successfully');
    } catch (error) {
      console.warn('Could not commit changes:', error);
      throw new Error('Failed to commit snapshot changes');
    }
  }

  /**
   * Restore from backup if something goes wrong
   */
  private async restoreBackup(): Promise<void> {
    console.log('🔄 Restoring from backup...');
    
    try {
      const backupDir = path.join(__dirname, '../tests/ai-snapshots/backup');
      const latestBackupPath = await fs.readFile(
        path.join(backupDir, 'latest-backup'),
        'utf-8'
      );
      
      if (await this.pathExists(latestBackupPath)) {
        await fs.rm(this.snapshotsDir, { recursive: true, force: true });
        await fs.cp(latestBackupPath, this.snapshotsDir, { recursive: true });
        console.log('✅ Backup restored successfully');
      }
    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
    }
  }

  /**
   * Check if a path exists
   */
  private async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Simple prompt utility
   */
  private async prompt(question: string): Promise<string> {
    process.stdout.write(question);
    
    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }
}

interface SnapshotChange {
  file: string;
  path: string;
  testType: string;
  scenario: string;
  diff: string;
  hasValidationChanges: boolean;
  hasContentChanges: boolean;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: SnapshotUpdateOptions = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test-type':
        options.testType = args[++i];
        break;
      case '--scenario':
        options.scenario = args[++i];
        break;
      case '--force':
        options.force = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-review':
        options.reviewRequired = false;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }
  
  // Default to requiring review
  if (options.reviewRequired === undefined) {
    options.reviewRequired = true;
  }
  
  const updater = new AISnapshotUpdater();
  
  try {
    await updater.updateSnapshots(options);
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
AI Snapshot Update Tool

Usage: tsx update-ai-snapshots.ts [options]

Options:
  --test-type <type>    Update only specific test type (long-range-plans, unit-plans, etc.)
  --scenario <id>       Update only specific scenario
  --force              Skip safety checks and prompts
  --dry-run            Show what would be updated without making changes
  --no-review          Skip manual review of changes
  --help               Show this help message

Examples:
  tsx update-ai-snapshots.ts                                    # Update all snapshots with review
  tsx update-ai-snapshots.ts --test-type long-range-plans      # Update only long-range plan snapshots
  tsx update-ai-snapshots.ts --dry-run                         # Preview changes without updating
  tsx update-ai-snapshots.ts --force --no-review               # Update without prompts (CI mode)
  `);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AISnapshotUpdater };