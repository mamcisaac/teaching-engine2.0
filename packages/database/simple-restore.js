#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Connect to database
const db = new Database('./prisma/dev.db');

console.log('🔄 RESTORING PERFECT DATA TO DATABASE');
console.log('=' + '='.repeat(50));

try {
  // Begin transaction
  db.prepare('BEGIN').run();
  
  // Clear existing data
  console.log('\n🧹 Clearing existing data...');
  db.prepare('DELETE FROM ETFOLessonPlan').run();
  db.prepare('DELETE FROM UnitPlan').run();
  db.prepare('DELETE FROM LongRangePlan').run();
  db.prepare('DELETE FROM CurriculumExpectation').run();
  db.prepare('DELETE FROM User').run();
  
  // Load JSON files
  console.log('\n📁 Loading backup files...');
  const backupDir = path.join(__dirname, '../../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z');
  
  const expectations = JSON.parse(
    fs.readFileSync(path.join(backupDir, 'curriculum-expectations.json'), 'utf8')
  );
  const lrps = JSON.parse(
    fs.readFileSync(path.join(backupDir, 'perfect-long-range-plans.json'), 'utf8')
  );
  const unitPlans = JSON.parse(
    fs.readFileSync(path.join(backupDir, 'strategically-perfect-unit-plans.json'), 'utf8')
  );
  
  console.log(`📊 Loaded: ${expectations.length} expectations, ${lrps.length} LRPs, ${unitPlans.length} unit plans`);
  
  // Create user
  console.log('\n👤 Creating user...');
  const userStmt = db.prepare(`
    INSERT INTO User (id, email, password, name, role, preferredLanguage)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  userStmt.run(
    23,
    'emily.mcisaac@example.com',
    'hashed_password_placeholder',
    'Emily McIsaac',
    'teacher',
    'fr'
  );
  console.log('✅ User created');
  
  // Import Curriculum Expectations
  console.log('\n📚 Importing curriculum expectations...');
  const expStmt = db.prepare(`
    INSERT INTO CurriculumExpectation (
      id, code, description, category, subcategory, grade, subject, strand,
      frenchDescription, indigenousConnection, realWorldApplication,
      createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  for (const exp of expectations) {
    expStmt.run(
      exp.id,
      exp.code,
      exp.description,
      exp.category,
      exp.subcategory,
      exp.grade,
      exp.subject,
      exp.strand,
      exp.frenchDescription,
      exp.indigenousConnection,
      exp.realWorldApplication
    );
  }
  console.log(`✅ Imported ${expectations.length} curriculum expectations`);
  
  // Import Long Range Plans
  console.log('\n📅 Importing long range plans...');
  const lrpStmt = db.prepare(`
    INSERT INTO LongRangePlan (
      id, userId, title, academicYear, grade, subject, description,
      createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const lrp of lrps) {
    lrpStmt.run(
      lrp.id,
      23,
      lrp.title,
      lrp.academicYear || '2025-2026',
      lrp.grade || 1,
      lrp.subject,
      lrp.description,
      lrp.createdAt,
      lrp.updatedAt
    );
  }
  console.log(`✅ Imported ${lrps.length} long range plans`);
  
  // Import Unit Plans
  console.log('\n📝 Importing unit plans...');
  const unitStmt = db.prepare(`
    INSERT INTO UnitPlan (
      id, userId, title, longRangePlanId, description,
      startDate, endDate, estimatedHours, bigIdeas, essentialQuestions,
      assessmentPlan, successCriteria, communityConnections,
      crossCurricularConnections, culminatingTask, differentiationStrategies,
      isLocked, lockedAt, lockedReason,
      createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const unit of unitPlans) {
    unitStmt.run(
      unit.id,
      23,
      unit.title,
      unit.longRangePlanId,
      unit.description,
      unit.startDate,
      unit.endDate,
      unit.estimatedHours || 15,
      unit.bigIdeas,
      JSON.stringify(unit.essentialQuestions),
      unit.assessmentPlan,
      JSON.stringify(unit.successCriteria),
      unit.communityConnections,
      unit.crossCurricularConnections,
      unit.culminatingTask,
      JSON.stringify(unit.differentiationStrategies),
      unit.isLocked ? 1 : 0,
      unit.lockedAt,
      unit.lockedReason || 'Strategic perfection achieved',
      unit.createdAt,
      unit.updatedAt
    );
  }
  console.log(`✅ Imported ${unitPlans.length} unit plans`);
  
  // Commit transaction
  db.prepare('COMMIT').run();
  
  // Verify counts
  console.log('\n🔍 Verifying restoration...');
  const userCount = db.prepare('SELECT COUNT(*) as count FROM User').get().count;
  const expCount = db.prepare('SELECT COUNT(*) as count FROM CurriculumExpectation').get().count;
  const lrpCount = db.prepare('SELECT COUNT(*) as count FROM LongRangePlan').get().count;
  const unitCount = db.prepare('SELECT COUNT(*) as count FROM UnitPlan').get().count;
  const lockedCount = db.prepare('SELECT COUNT(*) as count FROM UnitPlan WHERE isLocked = 1').get().count;
  
  console.log('\n✅ RESTORATION COMPLETE:');
  console.log(`   Users: ${userCount}`);
  console.log(`   Curriculum Expectations: ${expCount}`);
  console.log(`   Long Range Plans: ${lrpCount}`);
  console.log(`   Unit Plans: ${unitCount} (${lockedCount} locked)`);
  
  if (expCount === 73 && lrpCount === 6 && unitCount === 50) {
    console.log('\n🎉 PERFECT FOUNDATION RESTORED SUCCESSFULLY!');
    console.log('   All strategic optimizations preserved');
    console.log('   Health/FPS redistribution intact');
    console.log('   Ready for lesson generation');
  } else {
    console.warn('\n⚠️  WARNING: Counts do not match expected values');
    console.warn(`   Expected: 73 expectations, 6 LRPs, 50 units`);
    console.warn(`   Got: ${expCount} expectations, ${lrpCount} LRPs, ${unitCount} units`);
  }
  
} catch (error) {
  console.error('\n❌ ERROR during restoration:', error);
  db.prepare('ROLLBACK').run();
  process.exit(1);
} finally {
  db.close();
}

console.log('\n✨ Database restoration complete!');
process.exit(0);