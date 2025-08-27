#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    console.error(`❌ JSON Error in ${filePath}: ${error.message}`);
    return false;
  }
}

function validateDirectory(dirPath) {
  let validFiles = 0;
  let totalFiles = 0;
  let errors = [];
  
  function processFiles(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processFiles(fullPath);
      } else if (item.endsWith('.json') && !item.includes('.backup')) {
        totalFiles++;
        if (validateJSON(fullPath)) {
          validFiles++;
        } else {
          errors.push(fullPath);
        }
      }
    }
  }
  
  processFiles(dirPath);
  return { validFiles, totalFiles, errors };
}

// Validate all JSON files
const lessonsDir = '/Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons';
console.log('Validating JSON syntax for all lesson files...');

const results = validateDirectory(lessonsDir);

console.log(`\n=== JSON VALIDATION COMPLETE ===`);
console.log(`Files validated: ${results.totalFiles}`);
console.log(`Valid JSON files: ${results.validFiles}`);
console.log(`JSON errors: ${results.errors.length}`);

if (results.errors.length === 0) {
  console.log('✅ All JSON files have valid syntax!');
} else {
  console.log('❌ Files with JSON errors:');
  results.errors.forEach(file => console.log(`  - ${file}`));
}