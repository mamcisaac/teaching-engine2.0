const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseState() {
  console.log('🔍 CHECKING CURRENT DATABASE STATE');
  console.log('==================================');
  
  // Check all LRPs
  const lrps = await prisma.longRangePlan.findMany({
    include: { 
      expectations: { include: { expectation: true } },
      unitPlans: { 
        include: { 
          expectations: { include: { expectation: true } },
          lessonPlans: true
        }
      }
    }
  });

  console.log(`Found ${lrps.length} Long Range Plans:`);
  
  lrps.forEach((lrp, i) => {
    console.log(`\nLRP ${i+1}: ${lrp.id}`);
    console.log(`  Title: ${lrp.title}`);
    console.log(`  Subject: ${lrp.subject}`);
    console.log(`  Grade: ${lrp.grade}`);
    console.log(`  Units: ${lrp.unitPlans.length}`);
    console.log(`  Expectations: ${lrp.expectations.length}`);
    
    if (lrp.subject === 'Sciences humaines' && lrp.grade === 1) {
      console.log('\n  📚 THIS IS THE SOCIAL STUDIES LRP:');
      lrp.unitPlans.forEach((unit, j) => {
        console.log(`    Unit ${j+1}: ${unit.title}`);
        console.log(`      Lessons: ${unit.lessonPlans.length}`);
        console.log(`      Hours: ${unit.estimatedHours}`);
        console.log(`      Expectations: ${unit.expectations.map(e => e.expectation.code).join(', ')}`);
      });
    }
  });

  await prisma.$disconnect();
}

checkDatabaseState().catch(console.error);