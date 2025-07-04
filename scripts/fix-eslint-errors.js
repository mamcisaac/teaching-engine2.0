#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix common patterns
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Fix 1: Replace any with unknown for API responses and external data
  const apiPatterns = [
    // API response patterns
    /(\s+)(data|response|result|payload|body):\s*any/g,
    /Promise<any>/g,
    /Observable<any>/g,
    /\)\s*:\s*any\s*{/g,
    /\)\s*:\s*Promise<any>/g,
    /catch\((error|err|e):\s*any\)/g,
    /<any>/g,
  ];

  apiPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      if (pattern.source.includes('Promise<any>')) {
        content = content.replace(pattern, 'Promise<unknown>');
      } else if (pattern.source.includes('Observable<any>')) {
        content = content.replace(pattern, 'Observable<unknown>');
      } else if (pattern.source.includes('catch')) {
        content = content.replace(pattern, 'catch($1: unknown)');
      } else if (pattern.source.includes('<any>')) {
        content = content.replace(pattern, '<unknown>');
      } else if (pattern.source.includes('): any {')) {
        content = content.replace(pattern, '): unknown {');
      } else if (pattern.source.includes('): Promise<any>')) {
        content = content.replace(pattern, '): Promise<unknown>');
      } else {
        content = content.replace(pattern, '$1$2: unknown');
      }
      changes += matches.length;
    }
  });

  // Fix 2: Replace any[] with unknown[]
  content = content.replace(/:\s*any\[\]/g, ': unknown[]');
  
  // Fix 3: Replace Record<string, any> with Record<string, unknown>
  content = content.replace(/Record<string,\s*any>/g, 'Record<string, unknown>');
  
  // Fix 4: Fix function parameters that are any
  content = content.replace(/\(([\w]+):\s*any\)/g, '($1: unknown)');
  
  // Fix 5: Fix unused variables by prefixing with underscore
  const unusedPatterns = [
    /catch\s*\((error|err|e)\)/g,
    /\.then\s*\(([a-zA-Z_]+)\s*=>/g,
  ];

  unusedPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const varName = match.match(/\(([a-zA-Z_]+)\)/)?.[1];
        if (varName && !content.includes(`${varName}.`) && !content.includes(`${varName})`)) {
          content = content.replace(new RegExp(`\\(${varName}\\)`, 'g'), `(_${varName})`);
          changes++;
        }
      });
    }
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${changes} issues in ${filePath}`);
  }

  return changes;
}

// Main execution
const serverFiles = glob.sync('server/src/**/*.{ts,tsx}', { absolute: true });
const clientFiles = glob.sync('client/src/**/*.{ts,tsx}', { absolute: true });

let totalChanges = 0;

console.log('Fixing server files...');
serverFiles.forEach(file => {
  totalChanges += fixFile(file);
});

console.log('\nFixing client files...');
clientFiles.forEach(file => {
  totalChanges += fixFile(file);
});

console.log(`\nTotal changes made: ${totalChanges}`);