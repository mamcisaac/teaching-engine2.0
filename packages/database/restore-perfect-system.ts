#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function restorePerfectSystem() {
  console.log('🚀 Perfect System Recovery Tool');
  console.log('================================\n');
  
  const args = process.argv.slice(2);
  const restoreType = args[0] || 'check';
  
  if (restoreType === 'check') {
    await checkCurrentState();
  } else if (restoreType === 'db') {
    await restoreFromDatabase();
  } else if (restoreType === 'json') {
    await restoreFromJSON();
  } else {
    console.log('Usage:');
    console.log('  npx tsx restore-perfect-system.ts check    - Check current system state');
    console.log('  npx tsx restore-perfect-system.ts db       - Restore from database backup');
    console.log('  npx tsx restore-perfect-system.ts json     - Restore from JSON export');
  }
  
  await prisma.$disconnect();
}

async function checkCurrentState() {
  console.log('📊 Checking current system state...\n');
  
  try {
    const stats = {
      longRangePlans: await prisma.longRangePlan.count({ where: { grade: 1 }}),
      unitPlans: await prisma.unitPlan.count(),
      expectations: await prisma.curriculumExpectation.count({ where: { grade: 1 }}),
      withTitles: await prisma.curriculumExpectation.count({ 
        where: { grade: 1, title: { not: null }}
      }),
      mappedToUnits: await prisma.curriculumExpectation.count({
        where: { grade: 1, unitPlans: { some: {} }}
      })
    };
    
    console.log('Current System State:');
    console.log(`  Long Range Plans: ${stats.longRangePlans}`);
    console.log(`  Unit Plans: ${stats.unitPlans}`);
    console.log(`  Curriculum Expectations: ${stats.expectations}`);
    console.log(`  Expectations with titles: ${stats.withTitles}`);
    console.log(`  Expectations mapped to units: ${stats.mappedToUnits}`);
    
    // Check if system is perfect
    const isPerfect = 
      stats.longRangePlans === 8 &&
      stats.unitPlans === 45 &&
      stats.expectations === 73 &&
      stats.withTitles === 73 &&
      stats.mappedToUnits === 73;
    
    if (isPerfect) {
      console.log('\n✅ System is PERFECT! No restoration needed.');
    } else {
      console.log('\n⚠️ System is not in perfect state. Consider restoration.');
      console.log('\nExpected perfect state:');
      console.log('  Long Range Plans: 8');
      console.log('  Unit Plans: 45');
      console.log('  Curriculum Expectations: 73');
      console.log('  All with titles and mappings');
    }
    
  } catch (error) {
    console.error('❌ Error checking state:', error);
  }
}

async function restoreFromDatabase() {
  console.log('💾 Restoring from database backup...\n');
  
  const backupDir = path.join(__dirname, 'backup');
  
  // Find the latest perfect system backup
  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('perfect-system-') && f.endsWith('.db'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    console.error('❌ No perfect system backups found!');
    return;
  }
  
  const latestBackup = files[0];
  const backupPath = path.join(backupDir, latestBackup);
  const dbPath = path.join(__dirname, 'prisma', 'dev.db');
  
  console.log(`Found backup: ${latestBackup}`);
  console.log('⚠️ WARNING: This will replace the current database!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    // Create backup of current database
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const currentBackup = path.join(backupDir, `pre-restore-${timestamp}.db`);
    fs.copyFileSync(dbPath, currentBackup);
    console.log(`✅ Current database backed up to: pre-restore-${timestamp}.db`);
    
    // Restore from backup
    fs.copyFileSync(backupPath, dbPath);
    console.log(`✅ Database restored from: ${latestBackup}`);
    
    // Verify restoration
    await checkCurrentState();
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
  }
}

async function restoreFromJSON() {
  console.log('📄 Restoring from JSON export...\n');
  
  const exportDir = path.join(__dirname, 'backup');
  
  // Find the latest perfect export
  const dirs = fs.readdirSync(exportDir)
    .filter(f => f.startsWith('perfect-export-') && fs.statSync(path.join(exportDir, f)).isDirectory())
    .sort()
    .reverse();
  
  if (dirs.length === 0) {
    console.error('❌ No perfect system JSON exports found!');
    return;
  }
  
  const latestExport = dirs[0];
  const exportPath = path.join(exportDir, latestExport);
  
  console.log(`Found export: ${latestExport}`);
  console.log('⚠️ WARNING: This will clear and rebuild the database!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    // Read JSON files
    const lrpData = JSON.parse(
      fs.readFileSync(path.join(exportPath, 'long-range-plans.json'), 'utf-8')
    );
    const unitData = JSON.parse(
      fs.readFileSync(path.join(exportPath, 'unit-plans.json'), 'utf-8')
    );
    const expectationData = JSON.parse(
      fs.readFileSync(path.join(exportPath, 'curriculum-expectations.json'), 'utf-8')
    );
    
    console.log('📊 Data loaded:');
    console.log(`  - ${lrpData.length} long range plans`);
    console.log(`  - ${unitData.length} unit plans`);
    console.log(`  - ${expectationData.length} curriculum expectations`);
    
    // This would need full implementation to recreate all relationships
    console.log('\n⚠️ Full JSON restoration requires manual implementation.');
    console.log('For now, use database backup restoration instead.');
    
  } catch (error) {
    console.error('❌ JSON restoration failed:', error);
  }
}

// Run the restoration tool
restorePerfectSystem()
  .then(() => console.log('\n✨ Recovery tool completed'))
  .catch((error) => {
    console.error('💥 Recovery failed:', error);
    process.exit(1);
  });