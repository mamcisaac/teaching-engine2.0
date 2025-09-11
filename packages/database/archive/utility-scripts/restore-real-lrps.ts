import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreRealLRPs() {
  console.log('🎯 RESTORING REAL LONG RANGE PLANS FROM BACKUP');
  console.log('==============================================\n');
  
  try {
    // Read the backup file
    const backupPath = path.join(__dirname, 'backup/CRITICAL-PERFECT-PLANS-2025-08-14/LONG-RANGE-PLANS-COMPLETE.json');
    const lrpData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    console.log(`📂 Found ${lrpData.length} LRPs in backup\n`);
    
    // Clear existing LRPs for Emily (but save the unit plan references first)
    const existingUnits = await prisma.unitPlan.findMany({
      where: { userId: 23 },
      include: { longRangePlan: true }
    });
    
    // Map units to subjects for re-linking later
    const unitsBySubject: Record<string, any[]> = {};
    for (const unit of existingUnits) {
      const subject = unit.longRangePlan.subject;
      if (!unitsBySubject[subject]) {
        unitsBySubject[subject] = [];
      }
      unitsBySubject[subject].push(unit);
    }
    
    console.log('🧹 Clearing existing LRPs...');
    // Delete in correct order to avoid foreign key issues
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId: 23 } });
    await prisma.unitPlan.deleteMany({ where: { userId: 23 } });
    await prisma.longRangePlan.deleteMany({ where: { userId: 23 } });
    
    console.log('📚 Restoring comprehensive LRPs...\n');
    
    const createdLRPs: Record<string, string> = {};
    
    // Filter for Emily's subjects only (no PE/Music)
    const emilySubjects = [
      'Français (Immersion)',
      'Mathématiques', 
      'Sciences de la nature',
      'Sciences humaines',
      'Arts visuels',
      'Formation personnelle et sociale'
    ];
    
    for (const lrp of lrpData) {
      if (!emilySubjects.includes(lrp.subject)) {
        console.log(`  ⏭️  Skipping ${lrp.subject} (Emily doesn't teach this)`);
        continue;
      }
      
      // Map to new schema (15 essential fields)
      const lrpToCreate = {
        userId: 23,
        title: lrp.titleFr || lrp.title,
        subject: lrp.subject,
        grade: lrp.grade,
        academicYear: lrp.academicYear,
        description: lrp.descriptionFr || lrp.description,
        learningGoals: lrp.goalsFr || lrp.goals,
        monthlyThemes: lrp.thematicOverview ? JSON.stringify(lrp.thematicOverview) : lrp.themes,
        overarchingQuestions: lrp.overarchingQuestions,
        assessmentOverview: lrp.assessmentOverview || lrp.assessmentStrategy,
        resourceNeeds: lrp.resourceNeeds || lrp.resourceLibrary,
        indigenousPerspectives: lrp.indigenousPerspectives,
        parentCommunication: lrp.parentCommunication
      };
      
      const created = await prisma.longRangePlan.create({
        data: lrpToCreate
      });
      
      createdLRPs[lrp.subject] = created.id;
      
      console.log(`  ✅ Restored: ${lrp.subject}`);
      console.log(`     - ${lrp.unitPlans?.length || 0} units in original`);
      console.log(`     - ${lrp.expectations?.length || 0} curriculum expectations`);
    }
    
    // Now restore the units with proper links
    console.log('\n📊 Re-linking units to restored LRPs...\n');
    
    const unitBackupPath = path.join(__dirname, 'backup/CRITICAL-PERFECT-PLANS-2025-08-14/UNIT-PLANS-COMPLETE.json');
    const unitData = JSON.parse(fs.readFileSync(unitBackupPath, 'utf-8'));
    
    let unitsRestored = 0;
    
    for (const unit of unitData) {
      const subject = unit.longRangePlan?.subject;
      
      if (!subject || !createdLRPs[subject]) {
        continue;
      }
      
      const unitToCreate = {
        userId: 23,
        longRangePlanId: createdLRPs[subject],
        title: unit.titleFr || unit.title,
        startDate: new Date(unit.startDate),
        endDate: new Date(unit.endDate),
        bigIdeas: unit.bigIdeasFr || unit.bigIdeas,
        essentialQuestions: unit.essentialQuestions,
        description: unit.descriptionFr || unit.description,
        assessmentPlan: unit.assessmentPlan,
        culminatingTask: unit.culminatingTask,
        differentiationStrategies: typeof unit.differentiationStrategies === 'string' 
          ? unit.differentiationStrategies 
          : JSON.stringify(unit.differentiationStrategies),
        keyVocabulary: unit.keyVocabulary,
        priorKnowledge: unit.priorKnowledge,
        communityConnections: unit.communityConnections
      };
      
      await prisma.unitPlan.create({ data: unitToCreate });
      unitsRestored++;
    }
    
    console.log(`  ✅ Re-linked ${unitsRestored} units to LRPs\n`);
    
    // Final summary
    console.log('📊 RESTORATION COMPLETE:');
    console.log('========================');
    
    const finalLRPs = await prisma.longRangePlan.findMany({
      where: { userId: 23 },
      include: {
        _count: {
          select: { unitPlans: true }
        }
      }
    });
    
    for (const lrp of finalLRPs) {
      console.log(`  ${lrp.subject}: ${lrp._count.unitPlans} units`);
    }
    
    console.log('\n✨ Key improvements from backup:');
    console.log('  - Rich thematic overviews with monthly progression');
    console.log('  - Comprehensive Indigenous perspectives');
    console.log('  - Detailed assessment strategies');
    console.log('  - Specific resource libraries');
    console.log('  - Parent communication plans');
    console.log('  - Differentiation frameworks');
    
    console.log('\n⚠️  Still needed:');
    console.log('  1. Create actual lesson plans (0 exist)');
    console.log('  2. Link curriculum expectations');
    console.log('  3. Verify against ETFO standards');
    console.log('  4. Add professional development plans');
    
  } catch (error) {
    console.error('❌ Error restoring LRPs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreRealLRPs();