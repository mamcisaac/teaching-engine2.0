import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreCurriculumExpectations() {
  console.log('📚 RESTORING CURRICULUM EXPECTATIONS FROM BACKUP');
  console.log('================================================\n');
  
  try {
    // Read the backup file
    const backupPath = path.join(__dirname, 'backup/CRITICAL-PERFECT-PLANS-2025-08-14/CURRICULUM-EXPECTATIONS-COMPLETE.json');
    const expectationsData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    console.log(`📂 Found ${expectationsData.length} curriculum expectations in backup\n`);
    
    // Clear existing expectations
    console.log('🧹 Clearing existing curriculum expectations...');
    await prisma.curriculumExpectation.deleteMany({
      where: { grade: 1 }
    });
    
    // Group by subject for reporting
    const expectationsBySubject: Record<string, any[]> = {};
    
    for (const exp of expectationsData) {
      const subject = exp.subject;
      if (!expectationsBySubject[subject]) {
        expectationsBySubject[subject] = [];
      }
      expectationsBySubject[subject].push(exp);
    }
    
    console.log('📊 Expectations by subject:');
    for (const [subject, exps] of Object.entries(expectationsBySubject)) {
      console.log(`  - ${subject}: ${exps.length} expectations`);
    }
    console.log('');
    
    // Restore each expectation
    console.log('📝 Restoring expectations...\n');
    
    let totalRestored = 0;
    const createdExpectations: Record<string, string> = {};
    
    for (const exp of expectationsData) {
      // Skip PE and Music since Emily doesn't teach them
      if (exp.subject === 'Éducation physique' || exp.subject === 'Music') {
        continue;
      }
      
      const expectationToCreate = {
        code: exp.code,
        title: exp.titleFr || exp.title || exp.description.substring(0, 50),
        description: exp.descriptionFr || exp.description,
        strand: exp.strandFr || exp.strand,
        substrand: exp.substrandFr || exp.substrand || null,
        grade: exp.grade,
        subject: exp.subject,
        descriptionFr: exp.descriptionFr || exp.description,
        strandFr: exp.strandFr || exp.strand,
        substrandFr: exp.substrandFr || exp.substrand || null,
        titleFr: exp.titleFr || exp.title || exp.description.substring(0, 50)
      };
      
      try {
        const created = await prisma.curriculumExpectation.create({
          data: expectationToCreate
        });
        
        createdExpectations[exp.code] = created.id;
        totalRestored++;
        
        if (totalRestored % 10 === 0) {
          console.log(`  ✅ Restored ${totalRestored} expectations...`);
        }
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation - expectation already exists
          console.log(`  ⚠️  Skipping duplicate: ${exp.code}`);
        } else {
          console.log(`  ❌ Error creating ${exp.code}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Restored ${totalRestored} curriculum expectations\n`);
    
    // Now link expectations to units
    console.log('🔗 Linking expectations to unit plans...\n');
    
    const unitBackupPath = path.join(__dirname, 'backup/CRITICAL-PERFECT-PLANS-2025-08-14/UNIT-PLANS-COMPLETE.json');
    const unitData = JSON.parse(fs.readFileSync(unitBackupPath, 'utf-8'));
    
    let linksCreated = 0;
    
    for (const unit of unitData) {
      // Skip PE and Music units
      if (unit.longRangePlan?.subject === 'Éducation physique' || 
          unit.longRangePlan?.subject === 'Music') {
        continue;
      }
      
      // Find the current unit in our database
      const currentUnit = await prisma.unitPlan.findFirst({
        where: {
          title: unit.titleFr || unit.title,
          userId: 23
        }
      });
      
      if (!currentUnit) {
        console.log(`  ⚠️  Unit not found: "${unit.titleFr || unit.title}"`);
        continue;
      }
      
      // Link expectations from backup
      if (unit.expectations && Array.isArray(unit.expectations)) {
        for (const expLink of unit.expectations) {
          const expectationCode = expLink.expectation?.code;
          
          if (!expectationCode) continue;
          
          // Find the expectation we created
          const expectation = await prisma.curriculumExpectation.findFirst({
            where: { code: expectationCode }
          });
          
          if (expectation) {
            try {
              await prisma.unitPlanExpectation.create({
                data: {
                  unitPlanId: currentUnit.id,
                  expectationId: expectation.id
                }
              });
              linksCreated++;
            } catch (error) {
              // Ignore duplicate links
            }
          }
        }
      }
    }
    
    console.log(`  ✅ Created ${linksCreated} unit-expectation links\n`);
    
    // Final summary
    console.log('📊 RESTORATION SUMMARY:');
    console.log('========================');
    
    const finalExpectations = await prisma.curriculumExpectation.groupBy({
      by: ['subject'],
      where: { grade: 1 },
      _count: true
    });
    
    for (const group of finalExpectations) {
      console.log(`  ${group.subject}: ${group._count} expectations`);
    }
    
    // Check unit coverage
    const unitsWithExpectations = await prisma.unitPlan.findMany({
      where: { userId: 23 },
      include: {
        _count: {
          select: { expectations: true }
        }
      }
    });
    
    console.log('\n📋 Unit Coverage:');
    let unitsWithoutExpectations = 0;
    for (const unit of unitsWithExpectations) {
      if (unit._count.expectations === 0) {
        unitsWithoutExpectations++;
        console.log(`  ⚠️  "${unit.title}" has no expectations linked`);
      }
    }
    
    if (unitsWithoutExpectations === 0) {
      console.log('  ✅ All units have curriculum expectations linked!');
    } else {
      console.log(`  ⚠️  ${unitsWithoutExpectations} units need expectations linked`);
    }
    
    console.log('\n✨ Restoration complete!');
    console.log('  - Grade 1 curriculum expectations restored');
    console.log('  - Unit-expectation links created');
    console.log('  - Ready for lesson planning');
    
  } catch (error) {
    console.error('❌ Error restoring expectations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreCurriculumExpectations();