#!/usr/bin/env node

/**
 * RESTORE PERFECT DATA FROM JSON BACKUPS
 * Restores the strategically perfect foundation to database
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./packages/database/dev.db'
    }
  }
});

async function restorePerfectData() {
  console.log('🔄 RESTORING PERFECT FOUNDATION TO DATABASE');
  console.log('=' + '='.repeat(50));
  
  try {
    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    await prisma.lessonPlan.deleteMany();
    await prisma.unitPlan.deleteMany();
    await prisma.longRangePlan.deleteMany();
    await prisma.curriculumExpectation.deleteMany();
    await prisma.user.deleteMany();
    
    // Create user (Emily)
    console.log('\n👤 Creating user...');
    const user = await prisma.user.create({
      data: {
        id: 23,
        email: 'emily.mcisaac@example.com',
        name: 'Emily McIsaac',
        hasCompletedOnboarding: true,
        selectedSubjects: ['Français (Immersion)', 'Mathématiques', 'Sciences de la nature', 'Sciences humaines', 'Arts visuels', 'Formation personnelle et sociale'],
        onboardingStep: 4
      }
    });
    console.log('✅ User created: Emily McIsaac');
    
    // Load JSON files
    console.log('\n📁 Loading backup files...');
    const backupDir = path.join(__dirname, '..', 'server', 'backups', 'perfect-foundation-2025-08-20T01-27-21-406Z');
    
    const expectations = JSON.parse(
      await fs.readFile(path.join(backupDir, 'curriculum-expectations.json'), 'utf8')
    );
    const lrps = JSON.parse(
      await fs.readFile(path.join(backupDir, 'perfect-long-range-plans.json'), 'utf8')
    );
    const unitPlans = JSON.parse(
      await fs.readFile(path.join(backupDir, 'strategically-perfect-unit-plans.json'), 'utf8')
    );
    
    console.log(`📊 Loaded: ${expectations.length} expectations, ${lrps.length} LRPs, ${unitPlans.length} unit plans`);
    
    // Import Curriculum Expectations
    console.log('\n📚 Importing curriculum expectations...');
    for (const exp of expectations) {
      await prisma.curriculumExpectation.create({
        data: {
          id: exp.id,
          code: exp.code,
          description: exp.description,
          category: exp.category,
          subcategory: exp.subcategory,
          grade: exp.grade,
          subject: exp.subject,
          strand: exp.strand,
          frenchDescription: exp.frenchDescription,
          indigenousConnection: exp.indigenousConnection,
          realWorldApplication: exp.realWorldApplication
        }
      });
    }
    console.log(`✅ Imported ${expectations.length} curriculum expectations`);
    
    // Import Long Range Plans
    console.log('\n📅 Importing long range plans...');
    for (const lrp of lrps) {
      // Clean up the data
      const cleanLrp = {
        id: lrp.id,
        userId: user.id,
        title: lrp.title,
        academicYear: lrp.academicYear || '2025-2026',
        grade: lrp.grade || 1,
        subject: lrp.subject,
        description: lrp.description,
        createdAt: new Date(lrp.createdAt),
        updatedAt: new Date(lrp.updatedAt)
      };
      
      await prisma.longRangePlan.create({
        data: cleanLrp
      });
    }
    console.log(`✅ Imported ${lrps.length} long range plans`);
    
    // Import Unit Plans
    console.log('\n📝 Importing unit plans...');
    for (const unit of unitPlans) {
      // Parse dates properly
      const unitData = {
        id: unit.id,
        userId: user.id,
        title: unit.title,
        longRangePlanId: unit.longRangePlanId,
        description: unit.description,
        startDate: unit.startDate ? new Date(unit.startDate) : null,
        endDate: unit.endDate ? new Date(unit.endDate) : null,
        estimatedHours: unit.estimatedHours || 15,
        bigIdeas: unit.bigIdeas,
        essentialQuestions: unit.essentialQuestions,
        assessmentPlan: unit.assessmentPlan,
        successCriteria: unit.successCriteria,
        communityConnections: unit.communityConnections,
        crossCurricularConnections: unit.crossCurricularConnections,
        culminatingTask: unit.culminatingTask,
        differentiationStrategies: unit.differentiationStrategies,
        isLocked: unit.isLocked || true,
        lockedAt: unit.lockedAt ? new Date(unit.lockedAt) : new Date(),
        lockedReason: unit.lockedReason || 'Strategic perfection achieved',
        createdAt: new Date(unit.createdAt),
        updatedAt: new Date(unit.updatedAt)
      };
      
      await prisma.unitPlan.create({
        data: unitData
      });
    }
    console.log(`✅ Imported ${unitPlans.length} unit plans (all locked)`);
    
    // Verify counts
    console.log('\n🔍 Verifying restoration...');
    const counts = {
      users: await prisma.user.count(),
      expectations: await prisma.curriculumExpectation.count(),
      lrps: await prisma.longRangePlan.count(),
      unitPlans: await prisma.unitPlan.count(),
      lockedUnits: await prisma.unitPlan.count({ where: { isLocked: true } })
    };
    
    console.log('\n✅ RESTORATION COMPLETE:');
    console.log(`   Users: ${counts.users}`);
    console.log(`   Curriculum Expectations: ${counts.expectations}`);
    console.log(`   Long Range Plans: ${counts.lrps}`);
    console.log(`   Unit Plans: ${counts.unitPlans} (${counts.lockedUnits} locked)`);
    
    if (counts.expectations === 73 && counts.lrps === 6 && counts.unitPlans === 50) {
      console.log('\n🎉 PERFECT FOUNDATION RESTORED SUCCESSFULLY!');
      console.log('   All strategic optimizations preserved');
      console.log('   Health/FPS redistribution intact');
      console.log('   Ready for lesson generation');
    } else {
      console.warn('\n⚠️  WARNING: Counts do not match expected values');
      console.warn(`   Expected: 73 expectations, 6 LRPs, 50 units`);
      console.warn(`   Got: ${counts.expectations} expectations, ${counts.lrps} LRPs, ${counts.unitPlans} units`);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR during restoration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  restorePerfectData()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export { restorePerfectData };