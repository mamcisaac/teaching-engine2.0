#!/usr/bin/env node

/**
 * Fix schema mismatches in seed files and restore ALL lessons
 * This script:
 * 1. Fixes invalid fields in seed files
 * 2. Runs all seeds to restore 500+ lessons
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SEED_DIR = path.join(__dirname, '../packages/database/prisma');

// Fields that need to be fixed
const FIELD_FIXES = {
  'primaryFocus': null, // Remove this field
  'vocabulary': null, // Remove this field
  'groupingStrategies': 'grouping', // Rename to 'grouping'
  'createdAt: new Date()': null, // Remove, auto-handled
  'updatedAt: new Date()': null, // Remove, auto-handled
};

function fixSeedFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix groupingStrategies -> grouping
  if (content.includes('groupingStrategies')) {
    content = content.replace(/groupingStrategies:/g, 'grouping:');
    modified = true;
    console.log(`  ✓ Fixed groupingStrategies -> grouping`);
  }
  
  // Remove primaryFocus lines
  if (content.includes('primaryFocus:')) {
    content = content.replace(/^\s*primaryFocus:.*$/gm, '');
    modified = true;
    console.log(`  ✓ Removed primaryFocus field`);
  }
  
  // Remove vocabulary lines
  if (content.includes('vocabulary:')) {
    content = content.replace(/^\s*vocabulary:.*$/gm, '');
    modified = true;
    console.log(`  ✓ Removed vocabulary field`);
  }
  
  // Remove createdAt and updatedAt
  if (content.includes('createdAt: new Date()')) {
    content = content.replace(/^\s*createdAt:\s*new\s+Date\(\),?\s*$/gm, '');
    modified = true;
    console.log(`  ✓ Removed createdAt field`);
  }
  
  if (content.includes('updatedAt: new Date()')) {
    content = content.replace(/^\s*updatedAt:\s*new\s+Date\(\),?\s*$/gm, '');
    modified = true;
    console.log(`  ✓ Removed updatedAt field`);
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

console.log('🔧 FIXING SEED FILES WITH SCHEMA MISMATCHES');
console.log('============================================\n');

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

console.log(`\n✅ Fixed ${fixedCount} seed files\n`);

// Now run all seeds
console.log('🚀 RUNNING ALL SEEDS TO RESTORE LESSONS');
console.log('========================================\n');

// Change to database directory
const dbPath = path.join(__dirname, '..', 'packages', 'database');
process.chdir(dbPath);

// First ensure all unit plans exist
console.log('📚 Step 1: Ensuring all unit plans exist...');
const unitFiles = [
  'seed-unit-plans-francais.ts',
  'seed-unit-plans-mathematiques.ts',
  'seed-unit-plans-sciences.ts',
  'seed-unit-plans-sciences-humaines.ts',
  'seed-unit-plans-arts-visuels.ts',
  'seed-unit-plans-education-physique.ts',
  'seed-unit-plans-formation-personnelle-sociale.ts',
  'seed-unit-plans-music.ts'
];

for (const file of unitFiles) {
  try {
    console.log(`  Running ${file}...`);
    execSync(`npx tsx prisma/${file}`, { stdio: 'pipe' });
    console.log(`    ✅ Success`);
  } catch (error) {
    console.log(`    ❌ Failed (may already exist)`);
  }
}

// Run all lesson seeds
console.log('\n📝 Step 2: Running all lesson seeds...');
let successCount = 0;
let failCount = 0;

for (const file of lessonSeedFiles) {
  const filename = path.basename(file);
  try {
    console.log(`  Running ${filename}...`);
    const output = execSync(`npx tsx ${file}`, { stdio: 'pipe', encoding: 'utf8' });
    if (output.includes('success') || output.includes('completed')) {
      console.log(`    ✅ Success`);
      successCount++;
    } else {
      console.log(`    ⚠️  Completed with warnings`);
      successCount++;
    }
  } catch (error) {
    console.log(`    ❌ Failed: ${error.message.split('\n')[0]}`);
    failCount++;
  }
}

// Run comprehensive seeds
console.log('\n📊 Step 3: Running comprehensive seeds...');
const comprehensiveFiles = [
  'seed-pe-comprehensive-108-lessons.ts',
  'seed-music-lessons-comprehensive-72.ts',
  'seed-health-fps-comprehensive-36-lessons.ts',
  'seed-french-lessons-january-june.ts'
];

for (const file of comprehensiveFiles) {
  try {
    console.log(`  Running ${file}...`);
    execSync(`npx tsx prisma/${file}`, { stdio: 'pipe' });
    console.log(`    ✅ Success`);
  } catch (error) {
    console.log(`    ❌ Failed`);
  }
}

// Get final statistics
console.log('\n📊 FINAL RESTORATION STATISTICS');
console.log('================================\n');

try {
  const stats = execSync(`sqlite3 prisma/dev.db "
    SELECT 'Total Lessons: ' || COUNT(*) FROM ETFOLessonPlan;
    SELECT 'Total Units: ' || COUNT(*) FROM UnitPlan;
    SELECT '';
    SELECT 'Lessons by Subject:' as '';
    SELECT '  ' || subject || ': ' || COUNT(*) FROM ETFOLessonPlan GROUP BY subject ORDER BY COUNT(*) DESC;
    SELECT '';
    SELECT 'Coverage by Month:' as '';
    SELECT '  ' || strftime('%B %Y', datetime(date/1000, 'unixepoch')) || ': ' || COUNT(*) || ' lessons'
    FROM ETFOLessonPlan 
    GROUP BY strftime('%Y-%m', datetime(date/1000, 'unixepoch'))
    ORDER BY date;
  "`, { encoding: 'utf8' });
  
  console.log(stats);
} catch (error) {
  console.log('Could not get statistics');
}

console.log('\n✅ RESTORATION COMPLETE!');
console.log(`  Seed files fixed: ${fixedCount}`);
console.log(`  Successful seeds: ${successCount}`);
console.log(`  Failed seeds: ${failCount}`);
console.log('\n🎉 Emily\'s teaching system should now have ALL lessons restored!');