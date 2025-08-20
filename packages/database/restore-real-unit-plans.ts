import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreRealUnitPlans() {
  console.log('🔄 RESTORING REAL UNIT PLANS FROM BACKUP');
  console.log('=========================================\n');
  
  try {
    // Read the backup file
    const backupPath = path.join(__dirname, 'backup/CRITICAL-PERFECT-PLANS-2025-08-14/UNIT-PLANS-COMPLETE.json');
    const unitPlansData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    console.log(`📂 Found ${unitPlansData.length} unit plans in backup\n`);
    
    // Clear existing unit plans for Emily
    console.log('🧹 Clearing existing unit plans...');
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId: 23 } });
    await prisma.unitPlan.deleteMany({ where: { userId: 23 } });
    
    // Group units by subject
    const unitsBySubject: Record<string, any[]> = {};
    
    for (const unit of unitPlansData) {
      const subject = unit.longRangePlan?.subject || 'Unknown';
      if (!unitsBySubject[subject]) {
        unitsBySubject[subject] = [];
      }
      unitsBySubject[subject].push(unit);
    }
    
    console.log('📊 Units by subject:');
    for (const [subject, units] of Object.entries(unitsBySubject)) {
      console.log(`  - ${subject}: ${units.length} units`);
    }
    console.log('');
    
    // Get current LRPs
    const currentLRPs = await prisma.longRangePlan.findMany({
      where: { userId: 23 }
    });
    
    const lrpMap: Record<string, string> = {};
    for (const lrp of currentLRPs) {
      lrpMap[lrp.subject] = lrp.id;
    }
    
    console.log('🔗 Mapping units to current LRPs...\n');
    
    let totalCreated = 0;
    let totalLessonsToCreate = 0;
    
    // Process each unit
    for (const unitData of unitPlansData) {
      const subject = unitData.longRangePlan?.subject;
      
      if (!subject || !lrpMap[subject]) {
        console.log(`  ⚠️  Skipping unit "${unitData.title}" - no matching LRP for subject: ${subject}`);
        continue;
      }
      
      // Map the old fields to new schema fields
      const unitToCreate = {
        userId: 23,
        longRangePlanId: lrpMap[subject],
        title: unitData.titleFr || unitData.title,
        startDate: new Date(unitData.startDate),
        endDate: new Date(unitData.endDate),
        bigIdeas: unitData.bigIdeasFr || unitData.bigIdeas,
        essentialQuestions: unitData.essentialQuestions,
        description: unitData.descriptionFr || unitData.description,
        assessmentPlan: unitData.assessmentPlan,
        culminatingTask: unitData.culminatingTask,
        differentiationStrategies: typeof unitData.differentiationStrategies === 'string' 
          ? unitData.differentiationStrategies 
          : JSON.stringify(unitData.differentiationStrategies),
        keyVocabulary: unitData.keyVocabulary,
        priorKnowledge: unitData.priorKnowledge,
        communityConnections: unitData.communityConnections
      };
      
      // Create the unit
      const createdUnit = await prisma.unitPlan.create({
        data: unitToCreate
      });
      
      // Calculate expected lessons based on unit duration and subject
      const startDate = new Date(unitData.startDate);
      const endDate = new Date(unitData.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let expectedLessons = 0;
      if (subject === 'Français (Immersion)') {
        // French has 2 lessons per day
        expectedLessons = daysDiff * 2;
      } else if (subject === 'Mathématiques') {
        // Math has 1 lesson per day
        expectedLessons = daysDiff;
      } else {
        // Rotation subjects have 2 lessons per day when active
        expectedLessons = Math.min(daysDiff * 2, unitData.estimatedHours || 15);
      }
      
      totalLessonsToCreate += expectedLessons;
      totalCreated++;
      
      console.log(`  ✅ ${subject}: "${unitData.titleFr || unitData.title}"`);
      console.log(`     ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
      console.log(`     Needs ${expectedLessons} lessons`);
    }
    
    // Calculate totals by subject
    console.log('\n📊 RESTORATION SUMMARY:');
    console.log('========================');
    
    const finalUnitsBySubject = await prisma.unitPlan.groupBy({
      by: ['longRangePlanId'],
      where: { userId: 23 },
      _count: true
    });
    
    for (const group of finalUnitsBySubject) {
      const lrp = await prisma.longRangePlan.findUnique({
        where: { id: group.longRangePlanId }
      });
      console.log(`  ${lrp?.subject}: ${group._count} units`);
    }
    
    console.log(`\n  Total units restored: ${totalCreated}`);
    console.log(`  Total lessons needed: ${totalLessonsToCreate}`);
    
    // Check curriculum expectations
    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('  1. Link curriculum expectations to units');
    console.log('  2. Create actual lesson plans for each unit');
    console.log('  3. Verify timing aligns with school calendar');
    console.log('  4. Review against ETFO standards');
    
  } catch (error) {
    console.error('❌ Error restoring unit plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreRealUnitPlans();