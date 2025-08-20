import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function adjustScienceHours() {
  try {
    console.log('🔧 Adjusting Science hours to reach exactly 73.5...\n');
    
    // Get Science units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98q0005vjr19wxzdygh' },
      orderBy: { startDate: 'asc' }
    });
    
    // Current: 69 hours, Target: 73.5 hours
    // Since database stores integers, aim for 74 hours (close to 73.5)
    // Add 1 hour to 5 units: 69 + 5 = 74 hours
    const adjustments = [
      { index: 1, newHours: 9 },     // Fall Discoveries: 8 → 9 (+1)
      { index: 2, newHours: 8 },     // Energy Around Us: 7 → 8 (+1)  
      { index: 3, newHours: 6 },     // Winter Wonders: 5 → 6 (+1)
      { index: 4, newHours: 8 },     // Indoor Investigations: 7 → 8 (+1)
      { index: 6, newHours: 9 }      // Spring Growth: 8 → 9 (+1)
    ];
    
    for (const adjustment of adjustments) {
      const unit = units[adjustment.index];
      if (unit) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: { estimatedHours: adjustment.newHours }
        });
        console.log(`✅ Updated ${unit.title}: ${adjustment.newHours} hours`);
      }
    }
    
    // Verify final totals
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98q0005vjr19wxzdygh' },
      include: { lessonPlans: true },
      orderBy: { startDate: 'asc' }
    });
    
    let totalHours = 0;
    let totalLessons = 0;
    
    console.log('\n📊 FINAL TOTALS:');
    updatedUnits.forEach((unit, i) => {
      totalHours += unit.estimatedHours || 0;
      totalLessons += unit.lessonPlans.length;
      console.log(`${i + 1}. ${unit.title}: ${unit.lessonPlans.length} lessons, ${unit.estimatedHours} hours`);
    });
    
    console.log(`\nSUMMARY:`);
    console.log(`Total Units: ${updatedUnits.length}`);
    console.log(`Total Lessons: ${totalLessons} (target: 98) ${totalLessons === 98 ? '✅' : '❌'}`);
    console.log(`Total Hours: ${totalHours} (target: 73.5) ${totalHours >= 73 && totalHours <= 74 ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

adjustScienceHours();