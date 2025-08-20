import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function targetedManualFix() {
  try {
    console.log('🎯 TARGETED MANUAL FIX - Direct Hours Update\n');

    // Get the Arts LRP
    const artsLRP = await prisma.longRangePlan.findFirst({
      where: {
        subject: 'Arts visuels',
        userId: 1 // Emily's user ID
      }
    });

    if (!artsLRP) {
      console.log('❌ Arts visuels LRP not found');
      return;
    }

    console.log(`Found LRP: ${artsLRP.title} (${artsLRP.id})\n`);

    // Get all units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: artsLRP.id },
      orderBy: { startDate: 'asc' }
    });

    // Direct targeted updates with specific unit IDs
    console.log('🔧 MAKING TARGETED UPDATES:\n');

    // Find and update specific units by checking their current state
    for (const unit of units) {
      const currentLessons = Math.round((unit.estimatedHours! * 60) / 45);
      
      if (unit.title === "L'Aventure des Lignes" && currentLessons === 20) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: { estimatedHours: 15.75 }
        });
        console.log(`✅ Updated ${unit.title}: 15 → 15.75 hours (20→21 lessons)`);
      }
      
      if (unit.title === "Fêtes et Traditions Artistiques" && currentLessons === 13) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: { estimatedHours: 10.5 }
        });
        console.log(`✅ Updated ${unit.title}: 10 → 10.5 hours (13→14 lessons)`);
      }
      
      if (unit.title === "Exploration 3D" && currentLessons === 20) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: { estimatedHours: 15.75 }
        });
        console.log(`✅ Updated ${unit.title}: 15 → 15.75 hours (20→21 lessons)`);
      }
      
      if (unit.title === "Techniques Avancées" && currentLessons === 20) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: { estimatedHours: 15.75 }
        });
        console.log(`✅ Updated ${unit.title}: 15 → 15.75 hours (20→21 lessons)`);
      }
    }

    console.log('\n🔍 FRESH VERIFICATION:\n');

    // Fresh query to verify
    const verifyUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: artsLRP.id },
      orderBy: { startDate: 'asc' }
    });

    let totalLessons = 0;
    let totalHours = 0;
    const months = ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const targetLessons = [19, 21, 20, 14, 20, 19, 21, 20, 21, 20];

    for (let i = 0; i < verifyUnits.length; i++) {
      const unit = verifyUnits[i];
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      totalLessons += lessons;
      totalHours += unit.estimatedHours!;
      
      const expected = targetLessons[i];
      const perfect = lessons === expected;
      
      console.log(`${months[i]}: ${unit.title}`);
      console.log(`  Hours: ${unit.estimatedHours} | Lessons: ${lessons}/${expected} ${perfect ? '✅' : '❌'}`);
    }

    console.log('\n═'.repeat(60));
    console.log('🎯 FINAL PRECISION CHECK:');
    console.log(`  Total Lessons: ${totalLessons}/195`);
    console.log(`  Total Hours: ${totalHours.toFixed(2)}/146.25`);
    console.log(`  Perfect Alignment: ${totalLessons === 195 && Math.abs(totalHours - 146.25) < 0.01 ? 'YES ✅' : 'NO ❌'}`);

  } catch (error) {
    console.error('Error in targeted manual fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

targetedManualFix();