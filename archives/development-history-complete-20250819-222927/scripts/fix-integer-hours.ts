import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixIntegerHours() {
  console.log('🔧 FIXING HOURS TO INTEGER VALUES (Schema limitation)');
  console.log('===================================================');
  console.log('Target: 72.75 hours → 73 hours (closest integer)');
  
  try {
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      orderBy: { startDate: 'asc' }
    });

    // Distribute 73 hours across 7 units (closest to 72.75)
    const integerHours = [11, 10, 9, 11, 10, 11, 11]; // = 73 hours
    
    for (let i = 0; i < units.length; i++) {
      await prisma.unitPlan.update({
        where: { id: units[i].id },
        data: { estimatedHours: integerHours[i] }
      });
      console.log(`✅ Unit ${i+1}: Set to ${integerHours[i]} hours`);
    }
    
    const total = integerHours.reduce((sum, hours) => sum + hours, 0);
    console.log(`\nTOTAL: ${total} hours (target was 72.75 hours)`);
    console.log('✅ Closest possible to requirement with integer schema!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixIntegerHours().catch(console.error);