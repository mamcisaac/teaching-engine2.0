const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getLRPDetails() {
  console.log('📚 LONG RANGE PLAN & CURRICULUM EXPECTATIONS ANALYSIS');
  console.log('====================================================');
  
  const lrp = await prisma.longRangePlan.findUnique({
    where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
    include: { 
      expectations: { 
        include: { expectation: true }
      }
    }
  });

  console.log('LONG RANGE PLAN DETAILS:');
  console.log(`Title: ${lrp.title}`);
  console.log(`Subject: ${lrp.subject}`);
  console.log(`Grade: ${lrp.grade}`);
  console.log(`School Year: ${lrp.schoolYear}`);
  console.log('');

  console.log('CURRICULUM EXPECTATIONS TO COVER:');
  console.log('=================================');
  lrp.expectations.forEach(exp => {
    console.log(`${exp.expectation.code}: ${exp.expectation.description}`);
    console.log(`  Subject: ${exp.expectation.subject}`);
    console.log(`  Grade: ${exp.expectation.grade}`);
    console.log('');
  });

  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: lrp.id },
    include: {
      expectations: { include: { expectation: true } },
      lessonPlans: { orderBy: { date: 'asc' } }
    },
    orderBy: { startDate: 'asc' }
  });

  console.log('CURRENT UNIT COVERAGE:');
  console.log('=====================');
  units.forEach((unit, i) => {
    console.log(`Unit ${i+1}: ${unit.title}`);
    console.log(`  Expectations: ${unit.expectations.map(e => e.expectation.code).join(', ')}`);
    console.log(`  Lessons: ${unit.lessonPlans.length}`);
    console.log(`  Hours: ${unit.estimatedHours}`);
    console.log(`  Dates: ${unit.startDate} to ${unit.endDate}`);
    console.log('');
  });

  await prisma.$disconnect();
}

getLRPDetails().catch(console.error);