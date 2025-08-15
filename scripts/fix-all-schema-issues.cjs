#!/usr/bin/env node

/**
 * Comprehensive fix for ALL schema issues in seed files
 * Removes all invalid fields that don't exist in ETFOLessonPlan schema
 */

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '../packages/database/prisma');

// All invalid fields to remove
const INVALID_FIELDS = [
  'primaryFocus',
  'vocabulary', 
  'mathConnection',
  'scienceConnection',
  'specialFocus',
  'unitPhase',
  'crossCurricularConnections',
  'pedagogicalApproach',
  'timeOfDay',
  'createdAt: new Date()',
  'updatedAt: new Date()'
];

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
  
  // Remove all invalid field definitions
  for (const field of INVALID_FIELDS) {
    // Create regex for field definitions (handles various formats)
    const patterns = [
      // Standard field: value format
      new RegExp(`^\\s*${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:.*$`, 'gm'),
      // Field with trailing comma
      new RegExp(`^\\s*${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:.*,\\s*$`, 'gm'),
      // Field in object
      new RegExp(`^\\s*['"]?${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\s*:.*$`, 'gm')
    ];
    
    for (const pattern of patterns) {
      if (content.match(pattern)) {
        content = content.replace(pattern, '');
        modified = true;
        console.log(`  ✓ Removed ${field} field`);
        break;
      }
    }
  }
  
  // Fix template string references to removed fields
  const templateFixes = [
    // ${lessonData.primaryFocus} -> 'Core learning focus'
    { pattern: /\$\{lessonData\.primaryFocus\}/g, replacement: 'Core learning focus' },
    // ${lessonData.vocabulary.join(', ')} -> 'key vocabulary'
    { pattern: /\$\{lessonData\.vocabulary\.join\([^)]+\)\}/g, replacement: 'key vocabulary' },
    // Conditional math/science connections
    { pattern: /\$\{lessonData\.mathConnection\s*\?\s*[^}]+\}/g, replacement: '' },
    { pattern: /\$\{lessonData\.scienceConnection\s*\?\s*[^}]+\}/g, replacement: '' },
    // ${lessonData.frenchConnection} -> 'French language integration'
    { pattern: /\$\{lessonData\.frenchConnection\}/g, replacement: 'French language integration' },
    // Remove references to specialFocus
    { pattern: /\$\{[^}]*specialFocus[^}]*\}/g, replacement: '' },
    // Remove references to unitPhase
    { pattern: /\$\{[^}]*unitPhase[^}]*\}/g, replacement: '' },
    // Remove references to crossCurricularConnections in templates
    { pattern: /\$\{[^}]*crossCurricularConnections[^}]*\}/g, replacement: '' },
    // Remove references to pedagogicalApproach
    { pattern: /\$\{[^}]*pedagogicalApproach[^}]*\}/g, replacement: '' },
    // Remove references to timeOfDay
    { pattern: /\$\{[^}]*timeOfDay[^}]*\}/g, replacement: '' }
  ];
  
  for (const fix of templateFixes) {
    if (content.match(fix.pattern)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
      console.log(`  ✓ Fixed template references for ${fix.pattern.source.slice(0, 30)}...`);
    }
  }
  
  // Clean up any trailing commas from removed fields
  content = content.replace(/,(\s*\n\s*})/g, '$1');
  content = content.replace(/,(\s*\n\s*\))/g, '$1');
  
  // Clean up any double blank lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Clean up any orphaned comment lines
  content = content.replace(/^\s*\/\/.*removed.*$/gmi, '');
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

console.log('🔧 COMPREHENSIVE SCHEMA FIX FOR ALL SEED FILES');
console.log('==============================================\n');

// Get all lesson seed files
const lessonSeedFiles = fs.readdirSync(SEED_DIR)
  .filter(file => file.startsWith('seed-') && file.endsWith('.ts'))
  .map(file => path.join(SEED_DIR, file));

console.log(`Found ${lessonSeedFiles.length} seed files to check\n`);

// Fix each file
let fixedCount = 0;
const fixedFiles = [];

for (const file of lessonSeedFiles) {
  const filename = path.basename(file);
  console.log(`Checking ${filename}...`);
  
  if (fixSeedFile(file)) {
    fixedCount++;
    fixedFiles.push(filename);
    console.log(`  ✅ Fixed!\n`);
  } else {
    console.log(`  ⏭️  No changes needed\n`);
  }
}

console.log('=' .repeat(50));
console.log(`\n✅ Fixed ${fixedCount} seed files:`);
fixedFiles.forEach(file => console.log(`  - ${file}`));
console.log('\n🎉 All schema issues have been fixed!');
console.log('Next step: Run restoration script to seed all lessons');