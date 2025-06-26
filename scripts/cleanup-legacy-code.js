#!/usr/bin/env node

/**
 * Legacy Code Cleanup Script for Teaching Engine 2.0
 * Removes commented legacy code and tracks TODOs
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

class LegacyCodeCleaner {
  constructor() {
    this.archivedModels = [
      'Activity',
      'Milestone',
      'TeacherPreferences',
      'SubstituteInfo',
      'Holiday',
      'PlanningConversation'
    ];
    
    this.filesToClean = [];
    this.todosToImplement = [];
    this.stats = {
      filesProcessed: 0,
      commentsRemoved: 0,
      todosFound: 0,
      linesRemoved: 0
    };
  }

  /**
   * Find files with legacy code or TODOs
   */
  async findFilesWithLegacyCode() {
    const patterns = [
      'server/src/**/*.{ts,js}',
      'client/src/**/*.{ts,tsx,js,jsx}',
      'packages/**/*.{ts,js}'
    ];
    
    const files = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/__mocks__/**']
      });
      files.push(...matches);
    }
    
    console.log(chalk.blue(`🔍 Scanning ${files.length} files for legacy code...\n`));
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        // Check for commented code referencing archived models
        const hasLegacyComments = this.archivedModels.some(model => {
          const singleLineRegex = new RegExp(`//.*${model}`, 'g');
          const multiLineRegex = new RegExp(`/\\*[^*]*${model}[^*]*\\*/`, 'gs');
          return singleLineRegex.test(content) || multiLineRegex.test(content);
        });
        
        // Check for TODOs
        const hasTodos = content.includes('TODO:') || content.includes('FIXME:');
        
        if (hasLegacyComments || hasTodos) {
          this.filesToClean.push({
            path: file,
            hasLegacy: hasLegacyComments,
            hasTodos
          });
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Could not read ${file}: ${error.message}`));
      }
    }
    
    return this.filesToClean;
  }

  /**
   * Clean a single file
   */
  async cleanFile(filePath, dryRun = false) {
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;
    const originalLineCount = content.split('\n').length;
    
    // Track what we're removing
    const removedComments = [];
    
    // Remove commented legacy code
    this.archivedModels.forEach(model => {
      // Remove single-line comments
      const singleLineRegex = new RegExp(`\\s*//.*${model}.*\\n`, 'g');
      const singleLineMatches = content.match(singleLineRegex) || [];
      removedComments.push(...singleLineMatches);
      
      if (!dryRun) {
        content = content.replace(singleLineRegex, '\n');
      }
      
      // Remove multi-line comments
      const multiLineRegex = new RegExp(`/\\*[^*]*${model}[^*]*\\*/`, 'gs');
      const multiLineMatches = content.match(multiLineRegex) || [];
      removedComments.push(...multiLineMatches);
      
      if (!dryRun) {
        content = content.replace(multiLineRegex, '');
      }
    });
    
    // Extract TODOs for tracking
    const todoRegex = /(TODO|FIXME):\s*(.+)/g;
    let match;
    while ((match = todoRegex.exec(content)) !== null) {
      this.todosToImplement.push({
        file: filePath,
        type: match[1],
        todo: match[2].trim(),
        line: content.substring(0, match.index).split('\n').length
      });
      this.stats.todosFound++;
    }
    
    // Clean up extra blank lines (more than 2 consecutive)
    if (!dryRun) {
      content = content.replace(/\n{3,}/g, '\n\n');
    }
    
    const newLineCount = content.split('\n').length;
    const linesRemoved = originalLineCount - newLineCount;
    
    if (content !== originalContent && !dryRun) {
      await fs.writeFile(filePath, content);
      this.stats.filesProcessed++;
      this.stats.commentsRemoved += removedComments.length;
      this.stats.linesRemoved += linesRemoved;
      
      console.log(chalk.green(`✅ ${path.relative(process.cwd(), filePath)}`));
      console.log(chalk.gray(`   Removed ${removedComments.length} legacy comments (${linesRemoved} lines)`));
    }
    
    return {
      changed: content !== originalContent,
      removedComments,
      linesRemoved
    };
  }

  /**
   * Generate TODO tracking report
   */
  async generateTodoReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalTodos: this.todosToImplement.length,
      byFile: {},
      byType: {
        TODO: [],
        FIXME: []
      },
      priorities: {
        high: [],
        medium: [],
        low: []
      }
    };
    
    // Organize TODOs
    this.todosToImplement.forEach(({ file, type, todo, line }) => {
      const relPath = path.relative(process.cwd(), file);
      
      // By file
      if (!report.byFile[relPath]) {
        report.byFile[relPath] = [];
      }
      report.byFile[relPath].push({ type, todo, line });
      
      // By type
      report.byType[type].push({ file: relPath, todo, line });
      
      // Categorize by priority based on keywords
      const todoLower = todo.toLowerCase();
      if (todoLower.includes('critical') || todoLower.includes('security') || todoLower.includes('urgent')) {
        report.priorities.high.push({ file: relPath, type, todo, line });
      } else if (todoLower.includes('important') || todoLower.includes('fix') || type === 'FIXME') {
        report.priorities.medium.push({ file: relPath, type, todo, line });
      } else {
        report.priorities.low.push({ file: relPath, type, todo, line });
      }
    });
    
    // Write JSON report
    const reportPath = path.join(process.cwd(), 'docs', 'todo-tracking.json');
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    // Generate markdown report
    const mdReport = this.generateMarkdownReport(report);
    const mdPath = path.join(process.cwd(), 'docs', 'TODO-TRACKING.md');
    await fs.writeFile(mdPath, mdReport);
    
    return report;
  }

  /**
   * Generate markdown TODO report
   */
  generateMarkdownReport(report) {
    const lines = [];
    
    lines.push('# TODO Tracking Report');
    lines.push(`\nGenerated: ${new Date(report.timestamp).toLocaleString()}`);
    lines.push(`\nTotal TODOs: ${report.totalTodos}`);
    
    // Priority summary
    lines.push('\n## Priority Summary');
    lines.push(`- 🔴 High Priority: ${report.priorities.high.length}`);
    lines.push(`- 🟡 Medium Priority: ${report.priorities.medium.length}`);
    lines.push(`- 🟢 Low Priority: ${report.priorities.low.length}`);
    
    // High priority items
    if (report.priorities.high.length > 0) {
      lines.push('\n## 🔴 High Priority Items');
      report.priorities.high.forEach(({ file, type, todo, line }) => {
        lines.push(`\n### ${file}:${line}`);
        lines.push(`**${type}**: ${todo}`);
      });
    }
    
    // Medium priority items
    if (report.priorities.medium.length > 0) {
      lines.push('\n## 🟡 Medium Priority Items');
      report.priorities.medium.forEach(({ file, type, todo, line }) => {
        lines.push(`- \`${file}:${line}\` - ${todo}`);
      });
    }
    
    // Files with most TODOs
    lines.push('\n## Files with Most TODOs');
    const filesSorted = Object.entries(report.byFile)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 10);
    
    filesSorted.forEach(([file, todos]) => {
      lines.push(`\n### ${file} (${todos.length} TODOs)`);
      todos.forEach(({ type, todo, line }) => {
        lines.push(`- Line ${line}: **${type}** - ${todo}`);
      });
    });
    
    return lines.join('\n');
  }

  /**
   * Run cleanup with options
   */
  async run(options = {}) {
    const { dryRun = false, verbose = false } = options;
    
    console.log(chalk.blue.bold('\n🧹 Legacy Code Cleanup Tool\n'));
    
    if (dryRun) {
      console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be modified\n'));
    }
    
    // Find files
    await this.findFilesWithLegacyCode();
    
    if (this.filesToClean.length === 0) {
      console.log(chalk.green('✨ No legacy code or TODOs found!'));
      return;
    }
    
    console.log(chalk.cyan(`Found ${this.filesToClean.length} files to process\n`));
    
    // Process files
    for (const { path: filePath, hasLegacy, hasTodos } of this.filesToClean) {
      const tags = [];
      if (hasLegacy) tags.push('legacy');
      if (hasTodos) tags.push('todos');
      
      if (verbose || dryRun) {
        console.log(chalk.gray(`Processing ${path.relative(process.cwd(), filePath)} [${tags.join(', ')}]`));
      }
      
      await this.cleanFile(filePath, dryRun);
    }
    
    // Generate reports
    if (!dryRun && this.todosToImplement.length > 0) {
      console.log(chalk.blue('\n📝 Generating TODO report...'));
      const report = await this.generateTodoReport();
      console.log(chalk.green(`✅ TODO report saved to docs/TODO-TRACKING.md`));
    }
    
    // Summary
    console.log(chalk.blue.bold('\n📊 Summary:'));
    console.log(`  Files processed: ${this.stats.filesProcessed}`);
    console.log(`  Legacy comments removed: ${this.stats.commentsRemoved}`);
    console.log(`  Lines removed: ${this.stats.linesRemoved}`);
    console.log(`  TODOs found: ${this.stats.todosFound}`);
    
    if (dryRun) {
      console.log(chalk.yellow('\n💡 Run without --dry-run to apply changes'));
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    console.log(`
${chalk.blue.bold('Legacy Code Cleanup Tool')}

${chalk.green('Usage:')}
  node cleanup-legacy-code.js [options]

${chalk.green('Options:')}
  --dry-run, -d    Show what would be cleaned without making changes
  --verbose, -v    Show detailed progress
  --help, -h       Show this help

${chalk.green('Examples:')}
  node cleanup-legacy-code.js --dry-run
  node cleanup-legacy-code.js --verbose
`);
    process.exit(0);
  }
  
  const cleaner = new LegacyCodeCleaner();
  await cleaner.run(options);
}

// Run if called directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  main().catch(error => {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  });
}

export default LegacyCodeCleaner;