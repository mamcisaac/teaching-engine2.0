const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function manualUnitReview() {
  console.log('🧠 MANUAL UNIT REVIEW AGAINST BEST PRACTICES');
  console.log('============================================');
  console.log('');
  
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
    include: {
      expectations: { include: { expectation: true } },
      lessonPlans: { orderBy: { date: 'asc' } }
    },
    orderBy: { startDate: 'asc' }
  });

  const lrp = await prisma.longRangePlan.findUnique({
    where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
    include: { expectations: { include: { expectation: true } } }
  });

  console.log('📚 DOCUMENTED REQUIREMENTS:');
  console.log('• Total: 97 lessons, 72.75 hours');
  console.log('• Units: 6-8 content units');
  console.log('• Per unit: 12-16 lessons, 9.1-12.1 hours');
  console.log('• Every-other-day with Health/FPS');
  console.log('• 100% French instruction');
  console.log('• Daily integration (not rotation)');
  console.log('');

  console.log('📋 CURRENT STATE ANALYSIS:');
  console.log('==========================');
  
  let totalLessons = 0;
  let totalHours = 0;
  
  units.forEach((unit, i) => {
    const unitNum = i + 1;
    console.log(`\nUNIT ${unitNum}: ${unit.title}`);
    console.log(`Dates: ${unit.startDate} to ${unit.endDate}`);
    console.log(`Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
    console.log(`Expectations: ${unit.expectations.map(e => e.expectation.code).join(', ')}`);
    
    totalLessons += unit.lessonPlans.length;
    totalHours += unit.estimatedHours || 0;
    
    // Check if description has core/extension structure
    const hasCore = unit.description?.includes('CORE LESSONS') || false;
    const hasExtension = unit.description?.includes('EXTENSION LESSONS') || false;
    const hasBigIdeas = unit.description?.includes('Big Ideas') || unit.description?.includes('BIG IDEAS') || false;
    const hasEssentialQuestions = unit.description?.includes('Essential Questions') || unit.description?.includes('ESSENTIAL QUESTIONS') || false;
    const hasAssessment = unit.assessmentPlan && unit.assessmentPlan.length > 200;
    const hasDifferentiation = unit.differentiationStrategies && typeof unit.differentiationStrategies === 'object';
    const hasIndigenous = unit.indigenousPerspectives && unit.indigenousPerspectives.length > 100;
    
    console.log('QUALITY CHECK:');
    console.log(`• Core/Extension Structure: ${hasCore && hasExtension ? '✅' : '❌'}`);
    console.log(`• Big Ideas: ${hasBigIdeas ? '✅' : '❌'}`);
    console.log(`• Essential Questions: ${hasEssentialQuestions ? '✅' : '❌'}`);
    console.log(`• Assessment Plan: ${hasAssessment ? '✅' : '❌'}`);
    console.log(`• Differentiation: ${hasDifferentiation ? '✅' : '❌'}`);
    console.log(`• Indigenous Perspectives: ${hasIndigenous ? '✅' : '❌'}`);
  });
  
  console.log('\n📊 TOTALS:');
  console.log(`Lessons: ${totalLessons}/97 ${totalLessons === 97 ? '✅' : '❌'}`);
  console.log(`Hours: ${totalHours}/72.75 ${Math.abs(totalHours - 72.75) <= 1 ? '✅' : '❌'}`);
  console.log(`Units: ${units.length} (recommended 6-8) ${units.length >= 6 && units.length <= 8 ? '✅' : '❌'}`);
  
  console.log('\n🎯 CURRICULUM EXPECTATIONS:');
  const expectedCodes = lrp.expectations.map(e => e.expectation.code);
  const coveredCodes = {};
  units.forEach(unit => {
    unit.expectations.forEach(e => {
      coveredCodes[e.expectation.code] = (coveredCodes[e.expectation.code] || 0) + 1;
    });
  });
  
  expectedCodes.forEach(code => {
    const count = coveredCodes[code] || 0;
    console.log(`${code}: ${count === 1 ? '✅ Perfect' : count === 0 ? '❌ Missing' : `❌ Duplicate (${count})`}`);
  });
  
  await prisma.$disconnect();
}

manualUnitReview().catch(console.error);