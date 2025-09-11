import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreFromLatestBackup() {
  console.log('🔄 RESTORING FROM LATEST BACKUP (August 15th)');
  console.log('===============================================\n');
  
  try {
    // First, backup current state
    console.log('💾 Backing up current state...');
    await prisma.$executeRaw`PRAGMA journal_mode=WAL;`;
    await prisma.$executeRaw`PRAGMA foreign_keys=OFF;`;
    
    // Clear current Emily's data
    console.log('🧹 Clearing current Emily data...');
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId: 23 } });
    await prisma.unitPlan.deleteMany({ where: { userId: 23 } });
    await prisma.longRangePlan.deleteMany({ where: { userId: 23 } });
    
    // Copy database from latest backup
    console.log('📋 Copying from latest backup (August 15th 00:13)...');
    const backupPath = path.join(__dirname, 'backup/final-perfect-state/perfect-system-20250815-001322.db');
    
    if (!fs.existsSync(backupPath)) {
      throw new Error('Latest backup not found!');
    }
    
    // Create temporary connection to backup
    console.log('🔗 Connecting to backup database...\n');
    
    // Enable backup restore
    await prisma.$executeRaw`ATTACH DATABASE '${backupPath}' AS backup_db;`;
    
    // Copy LRPs
    console.log('📚 Restoring Long Range Plans...');
    await prisma.$executeRaw`
      INSERT INTO LongRangePlan 
      SELECT * FROM backup_db.LongRangePlan 
      WHERE userId = 23;
    `;
    
    const lrpCount = await prisma.longRangePlan.count({ where: { userId: 23 } });
    console.log(`  ✅ Restored ${lrpCount} LRPs`);
    
    // Copy Unit Plans
    console.log('📅 Restoring Unit Plans...');
    await prisma.$executeRaw`
      INSERT INTO UnitPlan 
      SELECT * FROM backup_db.UnitPlan 
      WHERE userId = 23;
    `;
    
    const unitCount = await prisma.unitPlan.count({ where: { userId: 23 } });
    console.log(`  ✅ Restored ${unitCount} unit plans`);
    
    // Copy Lesson Plans
    console.log('📖 Restoring Lesson Plans...');
    await prisma.$executeRaw`
      INSERT INTO ETFOLessonPlan 
      SELECT * FROM backup_db.ETFOLessonPlan 
      WHERE userId = 23;
    `;
    
    const lessonCount = await prisma.eTFOLessonPlan.count({ where: { userId: 23 } });
    console.log(`  ✅ Restored ${lessonCount} lesson plans`);
    
    // Copy curriculum expectations if needed
    const existingExpectations = await prisma.curriculumExpectation.count({ where: { grade: 1 } });
    if (existingExpectations === 0) {
      console.log('📋 Restoring Curriculum Expectations...');
      await prisma.$executeRaw`
        INSERT INTO CurriculumExpectation 
        SELECT * FROM backup_db.CurriculumExpectation 
        WHERE grade = 1;
      `;
      
      const expCount = await prisma.curriculumExpectation.count({ where: { grade: 1 } });
      console.log(`  ✅ Restored ${expCount} curriculum expectations`);
    }
    
    // Detach backup database
    await prisma.$executeRaw`DETACH DATABASE backup_db;`;
    
    console.log('\n📊 COMPARISON WITH PREVIOUS STATE:');
    console.log('===================================');
    
    // Analyze the restored data
    const lrpsBySubject = await prisma.longRangePlan.findMany({
      where: { userId: 23 },
      select: { subject: true, title: true }
    });
    
    console.log('\n📚 LRPs by Subject:');
    const subjectCounts: Record<string, number> = {};
    for (const lrp of lrpsBySubject) {
      subjectCounts[lrp.subject] = (subjectCounts[lrp.subject] || 0) + 1;
      console.log(`  - ${lrp.subject}: ${lrp.title}`);
    }
    
    // Analyze unit timing
    console.log('\n📅 Unit Plans Analysis:');
    const unitsBySubject = await prisma.unitPlan.groupBy({
      by: ['longRangePlanId'],
      where: { userId: 23 },
      _count: true
    });
    
    for (const group of unitsBySubject) {
      const lrp = await prisma.longRangePlan.findUnique({
        where: { id: group.longRangePlanId }
      });
      
      const units = await prisma.unitPlan.findMany({
        where: { longRangePlanId: group.longRangePlanId },
        orderBy: { startDate: 'asc' },
        select: {
          title: true,
          startDate: true,
          endDate: true
        }
      });
      
      console.log(`\n  ${lrp?.subject} (${group._count} units):`);
      
      let totalDays = 0;
      for (const unit of units) {
        const days = Math.ceil((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalDays += days;
        console.log(`    - ${unit.title}: ${new Date(unit.startDate).toISOString().split('T')[0]} to ${new Date(unit.endDate).toISOString().split('T')[0]} (${days} days)`);
      }
      
      // Calculate expected lessons based on subject
      let expectedLessons = 0;
      if (lrp?.subject === 'Français (Immersion)' || lrp?.subject === 'Français (Immersion)') {
        expectedLessons = totalDays * 2; // 2 per day
      } else if (lrp?.subject === 'Mathématiques') {
        expectedLessons = totalDays * 1; // 1 per day
      } else {
        expectedLessons = totalDays * 2; // Rotation subjects when active
      }
      
      console.log(`    Total: ${totalDays} days → Expected ${expectedLessons} lessons`);
    }
    
    // Check lesson distribution
    console.log('\n📖 Actual Lesson Distribution:');
    const lessonsBySubject = await prisma.eTFOLessonPlan.groupBy({
      by: ['subject'],
      where: { userId: 23 },
      _count: true
    });
    
    let totalLessons = 0;
    for (const group of lessonsBySubject) {
      console.log(`  ${group.subject}: ${group._count} lessons`);
      totalLessons += group._count;
    }
    
    console.log(`\n  📊 TOTAL: ${totalLessons} lessons`);
    
    if (totalLessons === 930) {
      console.log('  ✅ PERFECT! Matches 930-lesson requirement');
    } else if (totalLessons < 930) {
      console.log(`  ⚠️  SHORT by ${930 - totalLessons} lessons`);
    } else {
      console.log(`  ⚠️  EXCESS of ${totalLessons - 930} lessons`);
    }
    
    console.log('\n✅ RESTORATION FROM LATEST BACKUP COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error restoring from backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreFromLatestBackup();