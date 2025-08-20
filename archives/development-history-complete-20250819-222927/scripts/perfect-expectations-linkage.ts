import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectExpectationsLinkage() {
  try {
    console.log('🎯 PHASE 1: PERFECT CURRICULUM EXPECTATIONS LINKAGE\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Get all Arts curriculum expectations
    const artsExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });

    console.log('📚 Arts Visuels Curriculum Expectations:');
    for (const exp of artsExpectations) {
      console.log(`  ${exp.code}: ${exp.description}`);
    }
    console.log();

    // Get all units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    console.log('🔗 LINKING ALL EXPECTATIONS TO EACH UNIT:\n');

    for (const unit of units) {
      console.log(`Unit: ${unit.title}`);
      
      // Get existing expectations for this unit
      const existing = await prisma.unitPlanExpectation.findMany({
        where: { unitPlanId: unit.id }
      });
      
      console.log(`  Current: ${existing.length} expectations linked`);
      
      // Link all 4 expectations to each unit
      for (const exp of artsExpectations) {
        // Check if already linked
        const alreadyLinked = existing.some(e => e.expectationId === exp.id);
        
        if (!alreadyLinked) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: exp.id
            }
          });
          console.log(`  ✅ Linked ${exp.code}`);
        } else {
          console.log(`  ↔️  ${exp.code} already linked`);
        }
      }
      
      // Verify final count
      const finalCount = await prisma.unitPlanExpectation.count({
        where: { unitPlanId: unit.id }
      });
      
      console.log(`  Final: ${finalCount} expectations linked\n`);
    }

    console.log('═'.repeat(60));
    console.log('✅ PHASE 1 COMPLETE: All units now have all 4 expectations!');
    
    // Final verification
    console.log('\n📊 VERIFICATION:');
    for (const unit of units) {
      const count = await prisma.unitPlanExpectation.count({
        where: { unitPlanId: unit.id }
      });
      console.log(`  ${unit.title}: ${count}/4 expectations ${count === 4 ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('Error in expectations linkage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectExpectationsLinkage();