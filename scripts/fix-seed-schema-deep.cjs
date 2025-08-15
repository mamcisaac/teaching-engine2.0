#!/usr/bin/env node

/**
 * Deep fix for schema mismatches in seed files
 * Handles fields in template strings and additional invalid fields
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '../packages/database/prisma');

function fixSeedFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const filename = path.basename(filePath);
  
  // Fix groupingStrategies -> grouping
  if (content.includes('groupingStrategies')) {
    content = content.replace(/groupingStrategies:/g, 'grouping:');
    modified = true;
    console.log(`  ✓ Fixed groupingStrategies -> grouping`);
  }
  
  // Remove standalone field definitions
  const fieldsToRemove = [
    'primaryFocus:',
    'vocabulary:',
    'mathConnection:',
    'scienceConnection:',
    'specialFocus:',
    'createdAt: new Date()',
    'updatedAt: new Date()'
  ];
  
  for (const field of fieldsToRemove) {
    const regex = new RegExp(`^\\s*${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$`, 'gm');
    if (content.match(regex)) {
      content = content.replace(regex, '');
      modified = true;
      console.log(`  ✓ Removed ${field} field`);
    }
  }
  
  // Fix template string references to removed fields
  // Replace ${lessonData.primaryFocus} with 'French language development'
  if (content.includes('${lessonData.primaryFocus}')) {
    content = content.replace(/\$\{lessonData\.primaryFocus\}/g, 'French language development');
    modified = true;
    console.log(`  ✓ Fixed primaryFocus template references`);
  }
  
  // Replace ${lessonData.vocabulary.join(', ')} with 'family vocabulary'
  if (content.includes('${lessonData.vocabulary')) {
    content = content.replace(/\$\{lessonData\.vocabulary\.join\([^)]+\)\}/g, 'family vocabulary');
    modified = true;
    console.log(`  ✓ Fixed vocabulary template references`);
  }
  
  // Fix conditional template references
  // ${lessonData.mathConnection ? ` Natural connection: ${lessonData.mathConnection}` : ''}
  if (content.includes('lessonData.mathConnection')) {
    content = content.replace(/\$\{lessonData\.mathConnection\s*\?\s*[^}]+\}/g, '');
    modified = true;
    console.log(`  ✓ Fixed mathConnection conditionals`);
  }
  
  if (content.includes('lessonData.scienceConnection')) {
    content = content.replace(/\$\{lessonData\.scienceConnection\s*\?\s*[^}]+\}/g, '');
    modified = true;
    console.log(`  ✓ Fixed scienceConnection conditionals`);
  }
  
  // Remove any specialFocus field
  if (content.includes('specialFocus:')) {
    content = content.replace(/^\s*specialFocus:.*$/gm, '');
    modified = true;
    console.log(`  ✓ Removed specialFocus field`);
  }
  
  // Clean up any trailing commas from removed fields
  content = content.replace(/,(\s*\n\s*})/g, '$1');
  
  // Clean up any double blank lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

console.log('🔧 DEEP FIXING SEED FILES WITH SCHEMA MISMATCHES');
console.log('==============================================\n');

// Get all lesson seed files
const lessonSeedFiles = fs.readdirSync(SEED_DIR)
  .filter(file => file.startsWith('seed-lesson-plans-') && file.endsWith('.ts'))
  .map(file => path.join(SEED_DIR, file));

console.log(`Found ${lessonSeedFiles.length} lesson seed files to check\n`);

// Fix each file
let fixedCount = 0;
for (const file of lessonSeedFiles) {
  const filename = path.basename(file);
  console.log(`Checking ${filename}...`);
  
  if (fixSeedFile(file)) {
    fixedCount++;
    console.log(`  ✅ Fixed!\n`);
  } else {
    console.log(`  ⏭️  No changes needed\n`);
  }
}

console.log(`\n✅ Fixed ${fixedCount} seed files`);
console.log('\nNow run: cd packages/database && npm run seed:lessons');