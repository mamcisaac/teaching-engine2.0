const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function queryData() {
  try {
    // Get curriculum expectations for mathematics grade 1
    console.log('=== Mathematics Grade 1 Curriculum Expectations ===');
    const mathExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
        grade: 1
      },
      select: {
        id: true,
        code: true,
        description: true,
        strand: true,
        substrand: true
      }
    });
    
    console.log(`Found ${mathExpectations.length} mathematics expectations`);
    mathExpectations.forEach(exp => {
      console.log(`${exp.code}: ${exp.strand} - ${exp.substrand || 'N/A'}`);
      console.log(`  ${exp.description.slice(0, 100)}...`);
    });

    // Look for geometry specifically
    console.log('\n=== Geometry-related expectations ===');
    const geometryExpectations = mathExpectations.filter(exp => 
      exp.description.toLowerCase().includes('forme') ||
      exp.description.toLowerCase().includes('géom') ||
      exp.description.toLowerCase().includes('spatial') ||
      exp.description.toLowerCase().includes('shape') ||
      exp.strand.toLowerCase().includes('géom') ||
      exp.substrand?.toLowerCase().includes('géom')
    );
    
    geometryExpectations.forEach(exp => {
      console.log(`${exp.code}: ${exp.description}`);
    });

    // Get existing long-range plans for user ID 1
    console.log('\n=== Long Range Plans for User 1 ===');
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: {
        userId: 1
      },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        academicYear: true
      }
    });
    
    longRangePlans.forEach(plan => {
      console.log(`${plan.id}: ${plan.title} - ${plan.subject} Grade ${plan.grade} (${plan.academicYear})`);
    });

    // Get existing unit plans for user ID 1
    console.log('\n=== Unit Plans for User 1 ===');
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: 1
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        longRangePlanId: true
      }
    });
    
    unitPlans.forEach(plan => {
      console.log(`${plan.id}: ${plan.title} (${plan.startDate.toISOString().split('T')[0]} to ${plan.endDate.toISOString().split('T')[0]})`);
    });

  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryData();