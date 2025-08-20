import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentMathState() {
  try {
    console.log('🔍 CHECKING CURRENT MATH UNITS STATE\n');
    
    const mathUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: 'cmebyc98k0003vjr1svziz0in'
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`Found ${mathUnits.length} Math units\n`);
    
    let totalHours = 0;
    mathUnits.forEach((unit, index) => {
      console.log(`Unit ${index + 1}: ${unit.title}`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      console.log(`  Expectations: ${unit.expectations.length}`);
      console.log(`  Dates: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      totalHours += unit.estimatedHours || 0;
    });
    
    console.log(`\nTotal Hours: ${totalHours}`);
    console.log(`Target Hours: 146.25`);
    console.log(`Issue: ${totalHours === 146 ? 'Hours are correct' : `Hours need correction (currently ${totalHours})`}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentMathState();