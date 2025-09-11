import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restructureScienceLessons() {
  console.log('🔬 RESTRUCTURING SCIENCE FROM 180 TO 90 LESSONS');
  console.log('================================================\n');

  // Define the target lesson counts for each unit
  const targetLessonCounts = {
    'Our School Environment': { current: 12, target: 10, keep: [0, 1, 2, 3, 4, 5, 6, 8, 10, 11] },
    'Fall Changes': { current: 48, target: 20, keep: 'every_other_plus_key' },
    'Energy in Our Lives': { current: 24, target: 10, keep: 'safety_focused' },
    'Winter Wonders': { current: 24, target: 10, keep: 'safety_focused' },
    'Growing and Changing': { current: 24, target: 10, keep: 'core_concepts' },
    'Spring Awakening': { current: 24, target: 15, keep: 'balanced' },
    'Our Impact on Nature': { current: 24, target: 15, keep: 'balanced' }
  };

  const userId = 23;
  let totalRemoved = 0;
  let totalKept = 0;

  for (const [unitTitle, config] of Object.entries(targetLessonCounts)) {
    console.log(`\n📚 Processing: ${unitTitle}`);
    console.log(`   Current: ${config.current} lessons → Target: ${config.target} lessons`);

    // Get the unit
    const unit = await prisma.unitPlan.findFirst({
      where: {
        title: unitTitle,
        longRangePlan: {
          userId: userId,
          subject: 'Sciences de la nature'
        }
      }
    });

    if (!unit) {
      console.log(`   ❌ Unit not found: ${unitTitle}`);
      continue;
    }

    // Get all lessons for this unit
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: { unitPlanId: unit.id },
      orderBy: { date: 'asc' }
    });

    console.log(`   Found ${lessons.length} lessons`);

    // Determine which lessons to keep based on strategy
    let lessonsToKeep: any[] = [];
    let lessonsToRemove: any[] = [];

    if (unitTitle === 'Our School Environment') {
      // Keep specific indexed lessons (most important concepts)
      const keepIndices = [0, 1, 2, 3, 4, 5, 6, 8, 10, 11];
      lessonsToKeep = lessons.filter((_, index) => keepIndices.includes(index));
      lessonsToRemove = lessons.filter((_, index) => !keepIndices.includes(index));
    } 
    else if (unitTitle === 'Fall Changes') {
      // Keep key seasonal observations - reduce from 48 to 20
      // Keep first 2, last 2, and evenly distributed middle lessons
      const keepIndices = [
        0, 1, // Introduction
        4, 5, // Early fall
        8, 9, // Temperature changes
        12, 13, // Leaf changes
        16, 17, // Animal preparation
        20, 21, // Mid-fall
        24, 25, // Weather patterns
        28, 29, // Late fall
        32, 33, // Harvest time
        36, 37, // Getting ready for winter
        46, 47  // Conclusion
      ];
      lessonsToKeep = lessons.filter((_, index) => keepIndices.includes(index));
      lessonsToRemove = lessons.filter((_, index) => !keepIndices.includes(index));
    }
    else if (unitTitle === 'Energy in Our Lives') {
      // Keep safety-critical energy lessons
      const keepIndices = [0, 1, 2, 4, 6, 8, 12, 16, 20, 23]; // Safety-focused selections
      lessonsToKeep = lessons.filter((_, index) => keepIndices.includes(index));
      lessonsToRemove = lessons.filter((_, index) => !keepIndices.includes(index));
    }
    else if (unitTitle === 'Winter Wonders') {
      // Keep cold-weather safety lessons
      const keepIndices = [0, 1, 3, 5, 7, 9, 12, 15, 18, 23]; // Winter safety focus
      lessonsToKeep = lessons.filter((_, index) => keepIndices.includes(index));
      lessonsToRemove = lessons.filter((_, index) => !keepIndices.includes(index));
    }
    else if (unitTitle === 'Growing and Changing') {
      // Keep core growth concepts and safety
      const keepIndices = [0, 1, 2, 4, 7, 10, 13, 16, 19, 23]; // Plant safety, allergies
      lessonsToKeep = lessons.filter((_, index) => keepIndices.includes(index));
      lessonsToRemove = lessons.filter((_, index) => !keepIndices.includes(index));
    }
    else if (unitTitle === 'Spring Awakening') {
      // Keep 15 balanced lessons
      const keepIndices = [0, 1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 20, 22, 23];
      lessonsToKeep = lessons.filter((_, index) => keepIndices.includes(index));
      lessonsToRemove = lessons.filter((_, index) => !keepIndices.includes(index));
    }
    else if (unitTitle === 'Our Impact on Nature') {
      // Keep 15 environmental lessons
      const keepIndices = [0, 1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 20, 22, 23];
      lessonsToKeep = lessons.filter((_, index) => keepIndices.includes(index));
      lessonsToRemove = lessons.filter((_, index) => !keepIndices.includes(index));
    }

    console.log(`   Keeping ${lessonsToKeep.length} lessons`);
    console.log(`   Removing ${lessonsToRemove.length} lessons`);

    // Delete the lessons we're removing
    if (lessonsToRemove.length > 0) {
      const deleteResult = await prisma.eTFOLessonPlan.deleteMany({
        where: {
          id: { in: lessonsToRemove.map(l => l.id) }
        }
      });
      console.log(`   ✅ Removed ${deleteResult.count} lessons`);
      totalRemoved += deleteResult.count;
    }

    totalKept += lessonsToKeep.length;

    // Update the dates of remaining lessons to be sequential
    let currentDate = lessonsToKeep[0]?.date;
    for (let i = 0; i < lessonsToKeep.length; i++) {
      if (i > 0) {
        // Add days based on scheduling (Science 2-3 times per week)
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + (i % 3 === 0 ? 3 : 2)); // Varies between 2-3 days
        currentDate = currentDate.getTime();
      }
      
      await prisma.eTFOLessonPlan.update({
        where: { id: lessonsToKeep[i].id },
        data: { date: new Date(currentDate) }
      });
    }
  }

  console.log('\n📊 SCIENCE RESTRUCTURING COMPLETE!');
  console.log('===================================');
  console.log(`✅ Total lessons kept: ${totalKept}`);
  console.log(`🗑️ Total lessons removed: ${totalRemoved}`);
  console.log(`📚 New total: ${totalKept} lessons (target was 90)`);

  // Verify the new counts
  const newCounts = await prisma.eTFOLessonPlan.groupBy({
    by: ['unitPlanId'],
    where: {
      unitPlan: {
        longRangePlan: {
          userId: userId,
          subject: 'Sciences de la nature'
        }
      }
    },
    _count: true
  });

  console.log('\n📈 VERIFICATION:');
  for (const count of newCounts) {
    const unit = await prisma.unitPlan.findUnique({
      where: { id: count.unitPlanId }
    });
    console.log(`   ${unit?.title}: ${count._count} lessons`);
  }
}

// Run the restructuring
restructureScienceLessons()
  .catch((error) => {
    console.error('❌ Error restructuring Science lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });