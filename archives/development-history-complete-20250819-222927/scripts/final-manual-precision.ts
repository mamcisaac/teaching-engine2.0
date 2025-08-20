import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalManualPrecision() {
  try {
    console.log('🎯 FINAL MANUAL PRECISION - Exact 195 Lessons\n');

    // Use the exact LRP ID we found
    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    console.log(`Targeting LRP: ${lrpId}\n`);

    // Get all units for this specific LRP
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    console.log('Current state before manual edits:');
    let currentTotal = 0;
    for (const unit of units) {
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      currentTotal += lessons;
      console.log(`  ${unit.title}: ${unit.estimatedHours}h (${lessons} lessons)`);
    }
    console.log(`Total: ${currentTotal} lessons\n`);

    // MANUAL EDIT 1: L'Aventure des Lignes (October) 15→15.75 hours
    const unit2 = units.find(u => u.title === "L'Aventure des Lignes");
    if (unit2) {
      await prisma.unitPlan.update({
        where: { id: unit2.id },
        data: { estimatedHours: 15.75 }
      });
      console.log(`✅ Manual Edit 1: ${unit2.title} updated to 15.75 hours`);
    }

    // MANUAL EDIT 2: Fêtes et Traditions Artistiques (December) 10→10.5 hours  
    const unit4 = units.find(u => u.title === "Fêtes et Traditions Artistiques");
    if (unit4) {
      await prisma.unitPlan.update({
        where: { id: unit4.id },
        data: { estimatedHours: 10.5 }
      });
      console.log(`✅ Manual Edit 2: ${unit4.title} updated to 10.5 hours`);
    }

    // MANUAL EDIT 3: Exploration 3D (March) 15→15.75 hours
    const unit7 = units.find(u => u.title === "Exploration 3D");
    if (unit7) {
      await prisma.unitPlan.update({
        where: { id: unit7.id },
        data: { estimatedHours: 15.75 }
      });
      console.log(`✅ Manual Edit 3: ${unit7.title} updated to 15.75 hours`);
    }

    // MANUAL EDIT 4: Techniques Avancées (May) 15→15.75 hours
    const unit9 = units.find(u => u.title === "Techniques Avancées");
    if (unit9) {
      await prisma.unitPlan.update({
        where: { id: unit9.id },
        data: { estimatedHours: 15.75 }
      });
      console.log(`✅ Manual Edit 4: ${unit9.title} updated to 15.75 hours`);
    }

    console.log('\n🔍 POST-EDIT VERIFICATION:\n');

    // Fresh verification query
    const verifiedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      orderBy: { startDate: 'asc' }
    });

    let totalLessons = 0;
    let totalHours = 0;
    const months = ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const targetLessons = [19, 21, 20, 14, 20, 19, 21, 20, 21, 20];

    for (let i = 0; i < verifiedUnits.length; i++) {
      const unit = verifiedUnits[i];
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      totalLessons += lessons;
      totalHours += unit.estimatedHours!;
      
      const expected = targetLessons[i];
      const perfect = lessons === expected;
      
      console.log(`${months[i]}: ${unit.title}`);
      console.log(`  ${unit.estimatedHours} hours → ${lessons} lessons (target: ${expected}) ${perfect ? '✅' : '❌'}`);
    }

    console.log('\n═'.repeat(70));
    console.log('🎉 MANUAL PRECISION RESULTS:');
    console.log(`  Total Lessons: ${totalLessons}/195 (${((totalLessons/195)*100).toFixed(1)}%)`);
    console.log(`  Total Hours: ${totalHours.toFixed(2)}/146.25 (${((totalHours/146.25)*100).toFixed(1)}%)`);
    
    const perfectMath = totalLessons === 195 && Math.abs(totalHours - 146.25) < 0.01;
    console.log(`  Mathematical Precision: ${perfectMath ? 'PERFECT ✅' : 'INCOMPLETE ❌'}`);

    if (perfectMath) {
      console.log('\n🚀 PHASE 1 COMPLETE: MATHEMATICAL PERFECTION ACHIEVED!');
      console.log('✅ Exactly 195 lessons for daily instruction');
      console.log('✅ Exactly 146.25 hours total');
      console.log('✅ Ready for Phase 2: French Pedagogy Rewrite');
    } else {
      console.log('\n⚠️  Mathematical precision still needs work');
      console.log(`Gap: ${195 - totalLessons} lessons, ${(146.25 - totalHours).toFixed(2)} hours`);
    }

  } catch (error) {
    console.error('Error in final manual precision:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalManualPrecision();