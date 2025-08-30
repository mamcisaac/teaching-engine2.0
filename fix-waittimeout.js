#!/usr/bin/env node

/**
 * Fix waitForTimeout deprecation in all test files
 * Replace page.waitForTimeout(ms) with page.evaluate(() => new Promise(r => setTimeout(r, ms)))
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files
const testFiles = glob.sync('tests/e2e/**/*.js', { 
  ignore: ['**/node_modules/**', '**/reports/**'] 
});

console.log(`Found ${testFiles.length} test files to check...`);

let filesFixed = 0;

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace waitForTimeout with the new pattern
  // Match patterns like: page.waitForTimeout(1000) or this.page.waitForTimeout(500)
  content = content.replace(
    /(\w+\.)?page\.waitForTimeout\((\d+)\)/g,
    (match, prefix, ms) => {
      const pageVar = prefix ? `${prefix}page` : 'page';
      return `await ${pageVar}.evaluate(() => new Promise(resolve => setTimeout(resolve, ${ms})))`;
    }
  );
  
  // Also handle cases with await already present
  content = content.replace(
    /await (\w+\.)?page\.waitForTimeout\((\d+)\)/g,
    (match, prefix, ms) => {
      const pageVar = prefix ? `${prefix}page` : 'page';
      return `await ${pageVar}.evaluate(() => new Promise(resolve => setTimeout(resolve, ${ms})))`;
    }
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed: ${file}`);
    filesFixed++;
  }
});

console.log(`\n🎉 Fixed ${filesFixed} files!`);