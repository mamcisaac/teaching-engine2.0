import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalFix() {
  try {
    console.log('🎯 FINAL HOUR ADJUSTMENT: Getting exactly 195 lessons\n');
    
    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Add 1 hour to June to get exactly 195 lessons
    const juneLRP = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: 'Notre Parcours Artistique Français'
      }
    });

    if (juneLRP) {
      await prisma.unitPlan.update({
        where: { id: juneLRP.id },
        data: { estimatedHours: 16 } // Change from 15 to 16 hours = 21 lessons
      });
      
      console.log('✅ Adjusted June from 15h (20 lessons) to 16h (21 lessons)');
      
      // Verify final totals
      const allUnits = await prisma.unitPlan.findMany({
        where: { longRangePlanId: lrpId },
        orderBy: { startDate: 'asc' }
      });

      let totalLessons = 0;
      console.log('\nFINAL DISTRIBUTION:');
      allUnits.forEach((unit, i) => {
        const lessons = Math.round(((unit.estimatedHours || 0) * 60) / 45);
        totalLessons += lessons;
        const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        console.log(`  ${months[i]}: ${lessons} lessons (${unit.estimatedHours}h)`);
      });
      
      console.log(`\nTOTAL: ${totalLessons} lessons`);
      
      if (totalLessons === 195) {
        console.log('🎉 PERFECT! Exactly 195 lessons achieved!');
      } else {
        console.log(`❌ Still ${195 - totalLessons} lessons off target`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalFix();