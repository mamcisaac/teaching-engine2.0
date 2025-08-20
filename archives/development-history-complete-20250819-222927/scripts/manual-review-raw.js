const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function manualReview() {
  console.log('🧠 MANUAL HUMAN REVIEW - DIRECT DATABASE EXAMINATION');
  console.log('====================================================');
  
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
    include: {
      expectations: { include: { expectation: true } },
      lessonPlans: { 
        orderBy: { date: 'asc' },
        select: { id: true, title: true, date: true, duration: true, language: true }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  const lrp = await prisma.longRangePlan.findUnique({
    where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
    include: { expectations: { include: { expectation: true } } }
  });

  console.log('📚 LONG RANGE PLAN:');
  console.log(`Expected expectations: ${lrp.expectations.map(e => e.expectation.code).join(', ')}`);
  console.log('');

  let humanObservations = [];

  units.forEach((unit, i) => {
    const unitNum = i + 1;
    console.log(`📖 UNIT ${unitNum}: ${unit.title}`);
    console.log(`   Dates: ${unit.startDate} to ${unit.endDate}`);
    console.log(`   Lessons: ${unit.lessonPlans.length}, Hours: ${unit.estimatedHours}`);
    console.log(`   Expectations: ${unit.expectations.map(e => e.expectation.code).join(', ')}`);
    
    if (unit.lessonPlans.length > 0) {
      console.log(`   First lesson: ${unit.lessonPlans[0].date}`);
      console.log(`   Last lesson: ${unit.lessonPlans[unit.lessonPlans.length-1].date}`);
      
      // Check if lessons are within unit dates
      const unitStart = new Date(unit.startDate);
      const unitEnd = new Date(unit.endDate);
      const outsideLessons = unit.lessonPlans.filter(l => {
        const lessonDate = new Date(l.date);
        return lessonDate < unitStart || lessonDate > unitEnd;
      });
      
      if (outsideLessons.length > 0) {
        console.log(`   ❌ ${outsideLessons.length} lessons OUTSIDE unit dates`);
        humanObservations.push(`Unit ${unitNum}: ${outsideLessons.length} lessons outside boundaries`);
      }
      
      // Check Christmas break for Unit 3
      if (unitNum === 3) {
        const christmasLessons = unit.lessonPlans.filter(l => {
          const date = new Date(l.date);
          return date >= new Date('2025-12-19') && date <= new Date('2026-01-05');
        });
        if (christmasLessons.length > 0) {
          console.log(`   ❌ ${christmasLessons.length} lessons during Christmas break`);
          humanObservations.push(`Unit ${unitNum}: Christmas break violation`);
        }
      }
    }
    
    console.log('');
  });

  // Check totals
  const totalLessons = units.reduce((sum, unit) => sum + unit.lessonPlans.length, 0);
  const totalHours = units.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
  
  console.log(`📊 TOTALS: ${totalLessons} lessons, ${totalHours} hours`);
  
  // Check expectation coverage
  const coveredExpectations = {};
  units.forEach(unit => {
    unit.expectations.forEach(e => {
      const code = e.expectation.code;
      coveredExpectations[code] = (coveredExpectations[code] || 0) + 1;
    });
  });
  
  console.log('\n📚 EXPECTATION COVERAGE:');
  const expectedCodes = lrp.expectations.map(e => e.expectation.code);
  for (const code of expectedCodes) {
    const count = coveredExpectations[code] || 0;
    console.log(`   ${code}: covered ${count} times ${count === 1 ? '✅' : count === 0 ? '❌ MISSING' : '❌ DUPLICATE'}`);
    if (count !== 1) {
      humanObservations.push(`Expectation ${code}: covered ${count} times`);
    }
  }
  
  console.log('\n🚨 HUMAN OBSERVATIONS:');
  if (humanObservations.length === 0) {
    console.log('✅ No issues found in manual review');
  } else {
    humanObservations.forEach((obs, i) => {
      console.log(`${i+1}. ${obs}`);
    });
  }

  await prisma.$disconnect();
}

manualReview().catch(console.error);