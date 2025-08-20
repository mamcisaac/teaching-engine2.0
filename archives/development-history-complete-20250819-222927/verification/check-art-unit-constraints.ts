import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkArtUnitConstraints() {
  console.log('🔍 CHECKING ARTS UNIT FOREIGN KEY CONSTRAINTS\n');
  
  const ARTS_LRP_ID = 'cmebyc98v0009vjr16o3e7awo';
  
  try {
    // Get all Arts units
    const artsUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: ARTS_LRP_ID
      },
      select: {
        id: true,
        title: true
      }
    });
    
    console.log(`Found ${artsUnits.length} Arts units to check:`);
    artsUnits.forEach((unit, i) => {
      console.log(`  ${i + 1}. ${unit.id}: ${unit.title}`);
    });
    
    console.log('\\n📊 CHECKING RELATED RECORDS:');
    
    // Check all possible related records
    for (const unit of artsUnits) {
      console.log(`\\nUnit: ${unit.title} (${unit.id})`);
      
      // Check expectations
      const expectations = await prisma.unitPlanExpectation.count({
        where: { unitPlanId: unit.id }
      });
      console.log(`  - UnitPlanExpectation: ${expectations} records`);
      
      // Check resources
      const resources = await prisma.unitPlanResource.count({
        where: { unitPlanId: unit.id }
      });
      console.log(`  - UnitPlanResource: ${resources} records`);
      
      // Check transfer skills
      const transferSkills = await prisma.unitPlanTransferSkill.count({
        where: { unitPlanId: unit.id }
      });
      console.log(`  - UnitPlanTransferSkill: ${transferSkills} records`);
      
      // Check lesson plans
      const lessonPlans = await prisma.eTFOLessonPlan.count({
        where: { unitPlanId: unit.id }
      });
      console.log(`  - ETFOLessonPlan: ${lessonPlans} records`);
    }
    
    console.log('\\n🛠️  SOLUTION: Delete all related records first, then unit plans');
    
  } catch (error) {
    console.error('Error checking constraints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArtUnitConstraints();