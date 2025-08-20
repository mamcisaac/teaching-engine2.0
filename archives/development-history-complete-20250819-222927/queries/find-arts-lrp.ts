import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findArtsLRP() {
  try {
    console.log('🔍 FINDING ARTS LRP\n');

    // Find all LRPs
    const allLRPs = await prisma.longRangePlan.findMany({
      orderBy: { subject: 'asc' }
    });

    console.log('All LRPs in database:');
    for (const lrp of allLRPs) {
      console.log(`  ${lrp.id} | ${lrp.subject} | ${lrp.title} | User: ${lrp.userId}`);
    }
    console.log();

    // Find Arts specifically
    const artsLRPs = await prisma.longRangePlan.findMany({
      where: {
        OR: [
          { subject: { contains: 'Arts' } },
          { subject: { contains: 'arts' } },
          { subject: { contains: 'visuels' } },
          { title: { contains: 'Arts' } },
          { title: { contains: 'Visual' } }
        ]
      }
    });

    console.log('Arts-related LRPs:');
    for (const lrp of artsLRPs) {
      console.log(`  ${lrp.id} | ${lrp.subject} | ${lrp.title} | User: ${lrp.userId}`);
      
      // Get units for this LRP
      const units = await prisma.unitPlan.findMany({
        where: { longRangePlanId: lrp.id },
        orderBy: { startDate: 'asc' }
      });
      
      console.log(`    Units: ${units.length}`);
      units.forEach((unit, i) => {
        const lessons = Math.round((unit.estimatedHours! * 60) / 45);
        console.log(`      ${i+1}. ${unit.title} - ${unit.estimatedHours}h (${lessons} lessons)`);
      });
      console.log();
    }

  } catch (error) {
    console.error('Error finding Arts LRP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findArtsLRP();