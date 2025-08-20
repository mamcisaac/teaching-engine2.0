import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixExactHours() {
  console.log('🔧 FIXING EXACT HOURS TO MEET 72.75 REQUIREMENT');
  console.log('===============================================');
  
  try {
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      orderBy: { startDate: 'asc' }
    });

    // Set precise hours to total exactly 72.75
    const exactHours = [10.5, 10.5, 9, 10.5, 10.5, 11.25, 10.5];
    
    for (let i = 0; i < units.length; i++) {
      await prisma.unitPlan.update({
        where: { id: units[i].id },
        data: { estimatedHours: exactHours[i] }
      });
      console.log(`✅ Unit ${i+1}: Set to ${exactHours[i]} hours`);
    }
    
    const total = exactHours.reduce((sum, hours) => sum + hours, 0);
    console.log(`\nTOTAL: ${total} hours ${total === 72.75 ? '✅ PERFECT!' : '❌ ERROR'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExactHours().catch(console.error);