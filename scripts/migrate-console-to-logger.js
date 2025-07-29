#!/usr/bin/env node
/**
 * Script to automatically migrate console statements to proper logger calls
 * Usage: node scripts/migrate-console-to-logger.js [file-or-directory]
 * 
 * This script will:
 * 1. Find all console.log/error/warn/info/debug statements
 * 2. Replace them with appropriate logger calls
 * 3. Add necessary imports if missing
 * 4. Skip test files and logger implementation files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const LOGGER_IMPORTS = {
  client: "import { logger } from '../utils/logger';",
  server: "import { structuredLogger } from '../utils/structuredLogger';",
  serverCompat: "import { logger } from '../logger';"
};

const CONSOLE_TO_LOGGER_MAP = {
  'console.log': 'logger.debug',
  'console.error': 'logger.error',
  'console.warn': 'logger.warn',
  'console.info': 'logger.info',
  'console.debug': 'logger.debug',
  'console.trace': 'logger.trace'
};

const SERVER_CONSOLE_TO_LOGGER_MAP = {
  'console.log': 'structuredLogger.debug',
  'console.error': 'structuredLogger.error',
  'console.warn': 'structuredLogger.warn',
  'console.info': 'structuredLogger.info',
  'console.debug': 'structuredLogger.debug',
  'console.trace': 'structuredLogger.trace'
};

// Files/directories to skip
const SKIP_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/build/**',
  '**/__tests__/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/test-utils/**',
  '**/setupTests.ts',
  '**/logger.ts',
  '**/structuredLogger.ts',
  '**/logger-migration.ts',
  '**/*.d.ts'
];

/**
 * Check if file should be skipped
 */
function shouldSkipFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return SKIP_PATTERNS.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
    return regex.test(normalizedPath);
  });
}

/**
 * Determine if file is server-side or client-side
 */
function isServerFile(filePath) {
  return filePath.includes('/server/') || filePath.includes('\\server\\');
}

/**
 * Add logger import if missing
 */
function addLoggerImport(content, filePath) {
  const isServer = isServerFile(filePath);
  
  // Check if logger is already imported
  if (content.includes('logger') && (
    content.includes("from '../utils/logger'") ||
    content.includes("from '../logger'") ||
    content.includes("from '../utils/structuredLogger'") ||
    content.includes('from "./utils/logger"') ||
    content.includes('from "./logger"') ||
    content.includes('from "./utils/structuredLogger"')
  )) {
    return content;
  }

  // Determine import statement
  let importStatement;
  if (isServer) {
    importStatement = LOGGER_IMPORTS.server;
  } else {
    importStatement = LOGGER_IMPORTS.client;
  }

  // Calculate relative path for import
  const fileDir = path.dirname(filePath);
  const srcIndex = fileDir.lastIndexOf('/src/');
  if (srcIndex !== -1) {
    const depth = fileDir.substring(srcIndex + 5).split('/').length - 1;
    const prefix = '../'.repeat(depth);
    importStatement = importStatement.replace('../', prefix);
  }

  // Add import after the last import statement or at the beginning
  const importRegex = /^import\s+.*from\s+['"].*['"];?\s*$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    return content.slice(0, lastImportIndex + lastImport.length) + 
           '\n' + importStatement + 
           content.slice(lastImportIndex + lastImport.length);
  } else {
    // Add at the beginning of the file
    return importStatement + '\n\n' + content;
  }
}

/**
 * Process error handling for console.error
 */
function processErrorReplacement(match, indent, args) {
  // Check if first argument after message is an error object
  const errorPattern = /^(['"`][^'"`]*['"`])\s*,\s*(\w+)/;
  const errorMatch = args.match(errorPattern);
  
  if (errorMatch) {
    const [, message, errorVar] = errorMatch;
    const remaining = args.substring(errorMatch[0].length);
    
    // Check if errorVar looks like an error variable
    if (errorVar.toLowerCase().includes('error') || errorVar.toLowerCase().includes('err')) {
      if (remaining.trim().startsWith(',')) {
        // Has additional arguments
        const additionalArgs = remaining.substring(1).trim();
        return `${indent}logger.error(${message}, ${errorVar}, { data: ${additionalArgs} })`;
      } else {
        return `${indent}logger.error(${message}, ${errorVar})`;
      }
    }
  }
  
  // Default replacement
  return `${indent}logger.error(${args})`;
}

/**
 * Replace console statements with logger calls
 */
function replaceConsoleStatements(content, filePath) {
  const isServer = isServerFile(filePath);
  const replacementMap = isServer ? SERVER_CONSOLE_TO_LOGGER_MAP : CONSOLE_TO_LOGGER_MAP;
  let modified = content;
  let hasChanges = false;

  // Replace each console method
  Object.entries(replacementMap).forEach(([consoleMethod, loggerMethod]) => {
    const regex = new RegExp(`^(\\s*)${consoleMethod.replace('.', '\\.')}\\s*\\(([^)]+)\\)`, 'gm');
    
    modified = modified.replace(regex, (match, indent, args) => {
      hasChanges = true;
      
      // Special handling for console.error
      if (consoleMethod === 'console.error' && !isServer) {
        return processErrorReplacement(match, indent, args);
      }
      
      // For server-side structured logger, we might need to adjust the arguments
      if (isServer && consoleMethod === 'console.error') {
        const errorPattern = /^(['"`][^'"`]*['"`])\s*,\s*(\w+)/;
        const errorMatch = args.match(errorPattern);
        
        if (errorMatch) {
          const [, message, errorVar] = errorMatch;
          if (errorVar.toLowerCase().includes('error') || errorVar.toLowerCase().includes('err')) {
            return `${indent}structuredLogger.error(${message}, ${errorVar})`;
          }
        }
      }
      
      return `${indent}${loggerMethod}(${args})`;
    });
  });

  // Add logger import if we made changes
  if (hasChanges) {
    modified = addLoggerImport(modified, filePath);
  }

  return { content: modified, hasChanges };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return { processed: false, reason: 'skipped' };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains console statements
    if (!content.match(/console\.(log|error|warn|info|debug|trace)/)) {
      return { processed: false, reason: 'no console statements' };
    }

    const { content: modifiedContent, hasChanges } = replaceConsoleStatements(content, filePath);
    
    if (hasChanges) {
      // Create backup
      const backupPath = filePath + '.console-backup';
      fs.writeFileSync(backupPath, content);
      
      // Write modified content
      fs.writeFileSync(filePath, modifiedContent);
      
      return { 
        processed: true, 
        backupPath,
        changes: content.match(/console\.(log|error|warn|info|debug|trace)/g)?.length || 0
      };
    }
    
    return { processed: false, reason: 'no changes needed' };
  } catch (error) {
    return { processed: false, reason: `error: ${error.message}` };
  }
}

/**
 * Process multiple files
 */
function processFiles(pattern) {
  const files = glob.sync(pattern, { 
    ignore: SKIP_PATTERNS,
    absolute: true 
  });

  const results = {
    total: files.length,
    processed: 0,
    skipped: 0,
    errors: 0,
    totalChanges: 0,
    files: []
  };

  files.forEach(filePath => {
    const result = processFile(filePath);
    
    if (result.processed) {
      results.processed++;
      results.totalChanges += result.changes || 0;
      results.files.push({
        path: filePath,
        backup: result.backupPath,
        changes: result.changes
      });
      console.log(`✓ Processed: ${path.relative(process.cwd(), filePath)} (${result.changes} changes)`);
    } else if (result.reason === 'skipped') {
      results.skipped++;
    } else if (result.reason.startsWith('error')) {
      results.errors++;
      console.error(`✗ Error processing ${path.relative(process.cwd(), filePath)}: ${result.reason}`);
    }
  });

  return results;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node migrate-console-to-logger.js <file-or-directory>');
    console.log('Example: node migrate-console-to-logger.js ./src');
    console.log('Example: node migrate-console-to-logger.js ./src/components/MyComponent.tsx');
    process.exit(1);
  }

  const target = args[0];
  const targetPath = path.resolve(target);

  console.log('Console to Logger Migration Tool');
  console.log('================================');
  console.log(`Target: ${targetPath}`);
  console.log('');

  let pattern;
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    pattern = path.join(targetPath, '**/*.{ts,tsx,js,jsx}');
  } else if (fs.existsSync(targetPath)) {
    pattern = targetPath;
  } else {
    console.error(`Error: Target path does not exist: ${targetPath}`);
    process.exit(1);
  }

  const results = processFiles(pattern);

  console.log('\nMigration Summary');
  console.log('=================');
  console.log(`Total files scanned: ${results.total}`);
  console.log(`Files processed: ${results.processed}`);
  console.log(`Files skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Total console statements replaced: ${results.totalChanges}`);

  if (results.processed > 0) {
    console.log('\nProcessed Files:');
    results.files.forEach(file => {
      console.log(`  - ${path.relative(process.cwd(), file.path)} (${file.changes} changes)`);
      console.log(`    Backup: ${path.relative(process.cwd(), file.backup)}`);
    });
    
    console.log('\nNext Steps:');
    console.log('1. Review the changes in your code editor');
    console.log('2. Run your tests to ensure everything works');
    console.log('3. Delete backup files when satisfied: find . -name "*.console-backup" -delete');
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { processFile, processFiles, replaceConsoleStatements };