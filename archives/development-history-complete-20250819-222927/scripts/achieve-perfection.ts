import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function achievePerfection() {
  try {
    console.log('🎯 ACHIEVING PERFECT 195 LESSONS\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Get current units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    console.log('📊 CURRENT STATE:');
    let currentTotal = 0;
    for (const unit of units) {
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      currentTotal += lessons;
      console.log(`  ${unit.title}: ${unit.estimatedHours}h → ${lessons} lessons`);
    }
    console.log(`Total: ${currentTotal} lessons\n`);

    // UPDATE 1: December (Fêtes et Traditions Artistiques) 10 → 11 hours
    const decUnit = units.find(u => u.title === "Fêtes et Traditions Artistiques");
    if (decUnit) {
      console.log('🔧 UPDATE 1: December Unit');
      console.log(`  Current: ${decUnit.estimatedHours} hours`);
      
      await prisma.unitPlan.update({
        where: { id: decUnit.id },
        data: { estimatedHours: 11 }
      });
      
      console.log('  ✅ Updated to: 11 hours (15 lessons)\n');
    }

    // UPDATE 2: June (Notre Parcours Artistique Français) 15 → 14 hours
    const junUnit = units.find(u => u.title === "Notre Parcours Artistique Français");
    if (junUnit) {
      console.log('🔧 UPDATE 2: June Unit');
      console.log(`  Current: ${junUnit.estimatedHours} hours`);
      
      await prisma.unitPlan.update({
        where: { id: junUnit.id },
        data: { estimatedHours: 14 }
      });
      
      console.log('  ✅ Updated to: 14 hours (19 lessons)\n');
    }

    // VERIFICATION
    console.log('🔍 FINAL VERIFICATION:\n');
    
    const finalUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    const months = ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const targetLessons = [19, 21, 20, 14, 20, 19, 21, 20, 21, 20];
    
    let totalLessons = 0;
    let totalHours = 0;

    for (let i = 0; i < finalUnits.length; i++) {
      const unit = finalUnits[i];
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      totalLessons += lessons;
      totalHours += unit.estimatedHours!;
      
      const target = targetLessons[i];
      const status = lessons >= target - 1 && lessons <= target + 1 ? '✅' : '❌';
      
      console.log(`${months[i]}: ${unit.title}`);
      console.log(`  ${unit.estimatedHours}h → ${lessons} lessons (target: ${target}) ${status}`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🎉 PERFECTION ACHIEVEMENT RESULTS:\n');
    console.log(`  Total Lessons: ${totalLessons}/195`);
    console.log(`  Total Hours: ${totalHours}/146.25`);
    
    if (totalLessons === 195) {
      console.log('\n🚀 MATHEMATICAL PERFECTION ACHIEVED!');
      console.log('✅ Exactly 195 lessons for daily Arts instruction');
      console.log('✅ December now has adequate coverage (15 lessons)');
      console.log('✅ June maintains strong portfolio celebration (19 lessons)');
      console.log('✅ TRUE daily integration model achieved!');
      console.log('\n🎨 Emily\'s Arts Program is now MATHEMATICALLY PERFECT!');
    } else {
      console.log(`\n⚠️  Still need adjustment: ${195 - totalLessons} lessons gap`);
    }

  } catch (error) {
    console.error('Error achieving perfection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

achievePerfection();