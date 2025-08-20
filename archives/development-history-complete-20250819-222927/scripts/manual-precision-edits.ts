import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualPrecisionEdits() {
  try {
    console.log('🎯 MANUAL PRECISION EDITS - Achieving Exact 195 Lessons\n');

    // Get the Arts LRP
    const artsLRP = await prisma.longRangePlan.findFirst({
      where: {
        id: 'cmebyc98v0009vjr16o3e7awo',
        subject: 'Arts visuels'
      }
    });

    if (!artsLRP) {
      throw new Error('Arts visuels LRP not found');
    }

    // Get all units to identify them properly
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: artsLRP.id },
      orderBy: { startDate: 'asc' }
    });

    console.log('Current units:');
    units.forEach((unit, index) => {
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      console.log(`  ${index + 1}. ${unit.title} - ${unit.estimatedHours} hours (${lessons} lessons)`);
    });
    console.log();

    // MANUAL EDIT 1: Unit 2 (October) - L'Aventure des Lignes
    // From 15 to 15.75 hours (20→21 lessons)
    const unit2 = units.find(u => u.title === "L'Aventure des Lignes");
    if (unit2) {
      await prisma.unitPlan.update({
        where: { id: unit2.id },
        data: { estimatedHours: 15.75 }
      });
      console.log('✅ MANUAL EDIT 1: Unit 2 (October) updated from 15 to 15.75 hours (20→21 lessons)');
    }

    // MANUAL EDIT 2: Unit 4 (December) - Fêtes et Traditions Artistiques  
    // From 10 to 10.5 hours (13→14 lessons)
    const unit4 = units.find(u => u.title === "Fêtes et Traditions Artistiques");
    if (unit4) {
      await prisma.unitPlan.update({
        where: { id: unit4.id },
        data: { estimatedHours: 10.5 }
      });
      console.log('✅ MANUAL EDIT 2: Unit 4 (December) updated from 10 to 10.5 hours (13→14 lessons)');
    }

    // MANUAL EDIT 3: Unit 7 (March) - Exploration 3D
    // From 15 to 15.75 hours (20→21 lessons)  
    const unit7 = units.find(u => u.title === "Exploration 3D");
    if (unit7) {
      await prisma.unitPlan.update({
        where: { id: unit7.id },
        data: { estimatedHours: 15.75 }
      });
      console.log('✅ MANUAL EDIT 3: Unit 7 (March) updated from 15 to 15.75 hours (20→21 lessons)');
    }

    // MANUAL EDIT 4: Unit 9 (May) - Techniques Avancées
    // From 15 to 15.75 hours (20→21 lessons)
    const unit9 = units.find(u => u.title === "Techniques Avancées");
    if (unit9) {
      await prisma.unitPlan.update({
        where: { id: unit9.id },
        data: { estimatedHours: 15.75 }
      });
      console.log('✅ MANUAL EDIT 4: Unit 9 (May) updated from 15 to 15.75 hours (20→21 lessons)');
    }

    console.log('\n🧮 VERIFICATION AFTER MANUAL EDITS:\n');

    // Verify the changes
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: artsLRP.id },
      orderBy: { startDate: 'asc' }
    });

    let totalLessons = 0;
    let totalHours = 0;
    const months = ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const targetLessons = [19, 21, 20, 14, 20, 19, 21, 20, 21, 20]; // Required per month

    for (let i = 0; i < updatedUnits.length; i++) {
      const unit = updatedUnits[i];
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      totalLessons += lessons;
      totalHours += unit.estimatedHours!;
      
      const expected = targetLessons[i];
      const perfect = lessons === expected;
      
      console.log(`${months[i]}: ${unit.title}`);
      console.log(`  Lessons: ${lessons}/${expected} ${perfect ? '✅' : '❌'}`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      console.log();
    }

    console.log('═'.repeat(60));
    console.log('🎉 MANUAL PRECISION RESULTS:');
    console.log(`  Total Lessons: ${totalLessons}/195 (${((totalLessons/195)*100).toFixed(1)}%)`);
    console.log(`  Total Hours: ${totalHours}/146.25 (${((totalHours/146.25)*100).toFixed(1)}%)`);
    console.log(`  Mathematical Precision: ${totalLessons === 195 && Math.abs(totalHours - 146.25) < 0.01 ? 'PERFECT ✅' : 'NEEDS MORE WORK ❌'}`);

    if (totalLessons === 195 && Math.abs(totalHours - 146.25) < 0.01) {
      console.log('\n🚀 PHASE 1 COMPLETE: MATHEMATICAL PERFECTION ACHIEVED!');
      console.log('✅ Ready for Phase 2: Authentic French Pedagogy Rewrite');
    }

  } catch (error) {
    console.error('Error in manual precision edits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualPrecisionEdits();