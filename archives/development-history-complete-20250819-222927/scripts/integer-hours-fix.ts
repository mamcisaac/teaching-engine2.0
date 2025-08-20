import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function integerHoursFix() {
  try {
    console.log('🔧 INTEGER HOURS FIX - Working with database constraints\n');

    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    console.log('📋 UNDERSTANDING THE CONSTRAINT:');
    console.log('estimatedHours field is Int? (integer only)');
    console.log('Cannot store 15.75 hours - gets truncated to 15');
    console.log('Need to use integer values that give approximately correct lessons\n');

    console.log('🧮 LESSON CALCULATION:');
    console.log('21 lessons × 45 minutes = 945 minutes = 15.75 hours');
    console.log('Since we can only use integers:');
    console.log('  15 hours = 900 minutes ÷ 45 = 20 lessons');
    console.log('  16 hours = 960 minutes ÷ 45 = 21.33 lessons → rounds to 21 lessons ✅');
    console.log('  11 hours = 660 minutes ÷ 45 = 14.67 lessons → rounds to 15 lessons');
    console.log('  10 hours = 600 minutes ÷ 45 = 13.33 lessons → rounds to 13 lessons');
    console.log('  11 hours would give us 14.67 → 15 lessons, but we need 14');
    console.log('  Better approach: Accept that some months will have slightly different timing\n');

    // Strategy: Use 16 hours for units that need 21 lessons
    // This gives us 21.33 lessons which rounds to 21 lessons when calculated
    
    console.log('🎯 REVISED STRATEGY:');
    console.log('Use 16 hours for October, March, May (gives ~21 lessons each)');
    console.log('December stays at 10 hours (13 lessons) - accept this imperfection');
    console.log('Focus on getting close to 195 total lessons\n');

    // Update October unit
    const octUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "L'Aventure des Lignes"
      }
    });

    if (octUnit) {
      const updated1 = await prisma.unitPlan.update({
        where: { id: octUnit.id },
        data: { estimatedHours: 16 }
      });
      console.log(`✅ October updated: ${updated1.estimatedHours} hours`);
    }

    // Update March unit
    const marUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "Exploration 3D"
      }
    });

    if (marUnit) {
      const updated2 = await prisma.unitPlan.update({
        where: { id: marUnit.id },
        data: { estimatedHours: 16 }
      });
      console.log(`✅ March updated: ${updated2.estimatedHours} hours`);
    }

    // Update May unit  
    const mayUnit = await prisma.unitPlan.findFirst({
      where: { 
        longRangePlanId: lrpId,
        title: "Techniques Avancées"
      }
    });

    if (mayUnit) {
      const updated3 = await prisma.unitPlan.update({
        where: { id: mayUnit.id },
        data: { estimatedHours: 16 }
      });
      console.log(`✅ May updated: ${updated3.estimatedHours} hours`);
    }

    console.log('\n🔍 VERIFICATION AFTER INTEGER UPDATES:\n');

    // Fresh verification
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    let totalLessons = 0;
    let totalHours = 0;
    const months = ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const targetLessons = [19, 21, 20, 14, 20, 19, 21, 20, 21, 20];

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      totalLessons += lessons;
      totalHours += unit.estimatedHours!;
      
      const expected = targetLessons[i];
      const close = Math.abs(lessons - expected) <= 1; // Allow 1 lesson tolerance
      
      console.log(`${months[i]}: ${unit.title}`);
      console.log(`  ${unit.estimatedHours} hours → ${lessons} lessons (target: ${expected}) ${close ? '✅' : '❌'}`);
    }

    console.log('\n═'.repeat(70));
    console.log('🎯 INTEGER HOURS RESULTS:');
    console.log(`  Total Lessons: ${totalLessons}/195 (${((totalLessons/195)*100).toFixed(1)}%)`);
    console.log(`  Total Hours: ${totalHours}/146.25 (${((totalHours/146.25)*100).toFixed(1)}%)`);
    console.log(`  Gap: ${195 - totalLessons} lessons`);
    
    if (totalLessons >= 193) { // Allow small tolerance
      console.log('\n🎉 ACCEPTABLE PRECISION ACHIEVED!');
      console.log('✅ Very close to 195 lessons (within database constraints)');
      console.log('✅ Ready for Phase 2: French Pedagogy Rewrite');
    }

  } catch (error) {
    console.error('Error in integer hours fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

integerHoursFix();