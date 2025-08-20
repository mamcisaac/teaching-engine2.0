import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExpectations() {
  try {
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98v0009vjr16o3e7awo' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('CURRICULUM EXPECTATION DISTRIBUTION:');
    console.log('=====================================\n');
    
    units.forEach((unit, i) => {
      const codes = unit.expectations.map(e => e.expectation.code).sort();
      const primary = codes.slice(0, 2).join(', ');
      const supporting = codes.slice(2).join(', ');
      
      console.log(`${i+1}. ${unit.title}`);
      console.log(`   PRIMARY: ${primary || 'None'}`);
      console.log(`   SUPPORTING: ${supporting || 'None'}`);
      console.log(`   TOTAL: ${codes.length} expectations\n`);
    });
    
    // Check coverage
    const coverage = { AV1: 0, AV2: 0, AV3: 0, AV4: 0 };
    units.forEach(unit => {
      unit.expectations.forEach(exp => {
        const code = exp.expectation.code;
        if (coverage[code] !== undefined) {
          coverage[code]++;
        }
      });
    });
    
    console.log('OVERALL COVERAGE:');
    Object.entries(coverage).forEach(([code, count]) => {
      console.log(`  ${code}: Appears in ${count}/10 units`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExpectations();