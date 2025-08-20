import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfect195Fix() {
  try {
    console.log('🎯 FINAL ADJUSTMENT: Exactly 195 lessons\n');
    
    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Adjust to get exactly 195 lessons (reduce Apr and Nov by 1 each)
    const adjustments = [
      { title: 'Premiers Pas Artistiques', hours: 14 }, // 19 lessons
      { title: 'La Magie des Couleurs', hours: 14 },     // 19 lessons (-1)
      { title: 'Motifs et Impression', hours: 14 },      // 19 lessons  
      { title: 'Art Environnemental', hours: 14 }        // 19 lessons (-1)
    ];

    for (const adj of adjustments) {
      const unit = await prisma.unitPlan.findFirst({
        where: {
          longRangePlanId: lrpId,
          title: adj.title
        }
      });
      
      if (unit) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: { estimatedHours: adj.hours }
        });
        console.log(`✅ Adjusted ${adj.title} to ${adj.hours} hours`);
      }
    }
    
    // Verify
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    let total = 0;
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    console.log('\nFINAL DISTRIBUTION:');
    units.forEach((unit, i) => {
      const lessons = Math.round(((unit.estimatedHours || 0) * 60) / 45);
      total += lessons;
      console.log(`  ${months[i]}: ${lessons} lessons`);
    });
    
    console.log(`\nTOTAL: ${total} lessons`);
    if (total === 195) {
      console.log('✅ PERFECT! Exactly 195 lessons achieved!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfect195Fix();