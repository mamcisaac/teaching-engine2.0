import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixHourPrecision() {
  console.log('🔧 ADJUSTING HOURS FOR PERFECT 146.25 TARGET\n');
  
  try {
    // Get current units
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: 'cmebyc98k0003vjr1svziz0in'
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log('Current hours:', units.map(u => u.estimatedHours).join(', '));
    console.log('Current total:', units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0));
    console.log('Target: 146.25');
    console.log('Need to add: 2.25 hours\n');
    
    // Since we're using integer hours, let's adjust to get 146 hours (close to 146.25)
    // Change 3 units from 18 to 19 hours to get 144 + 3 = 147 hours
    const unitsToAdjust = [
      units[0].id, // Unit 1
      units[2].id, // Unit 3 
      units[7].id, // Unit 8
    ];
    
    for (const unitId of unitsToAdjust) {
      await prisma.unitPlan.update({
        where: { id: unitId },
        data: { estimatedHours: 19 }
      });
      console.log(`✅ Adjusted unit to 19 hours`);
    }
    
    // Verify new total
    const updatedUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: 'cmebyc98k0003vjr1svziz0in'
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    const newTotal = updatedUnits.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    console.log(`\n✅ NEW TOTAL: ${newTotal} hours`);
    console.log(`Target: 146.25 hours`);
    console.log(`Difference: ${newTotal - 146.25} hours`);
    console.log(`Status: ${Math.abs(newTotal - 146.25) <= 1 ? 'ACCEPTABLE' : 'NEEDS FURTHER ADJUSTMENT'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixHourPrecision();