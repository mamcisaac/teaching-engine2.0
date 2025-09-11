import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteOurSchoolEnvironmentLessons() {
  console.log('🗑️  DELETING "Our School Environment" Science Lessons');
  console.log('=====================================================');
  console.log('These lessons are fundamentally flawed and need complete rebuilding.\n');

  // First, get all lessons to be deleted for logging
  const lessonsToDelete = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        title: 'Our School Environment',
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    },
    include: {
      unitPlan: {
        select: {
          title: true
        }
      }
    },
    orderBy: [
      { date: 'asc' },
      { title: 'asc' }
    ]
  });

  console.log(`📊 Found ${lessonsToDelete.length} lessons to delete:\n`);

  lessonsToDelete.forEach((lesson, index) => {
    console.log(`${index + 1}. ${lesson.title} (${lesson.date.toDateString()})`);
  });

  console.log(`\n🚨 ISSUES WITH CURRENT LESSONS:`);
  console.log(`- 6 lessons are exact duplicates`);
  console.log(`- 0% curriculum coverage (no expectations linked)`);
  console.log(`- Generic template content doesn't match titles`);
  console.log(`- No ETFO compliance (timing, differentiation, indigenous)`);
  console.log(`- No logical progression or inquiry-based learning`);

  // Delete all lessons
  const deleteResult = await prisma.eTFOLessonPlan.deleteMany({
    where: {
      userId: 23,
      unitPlan: {
        title: 'Our School Environment',
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    }
  });

  console.log(`\n✅ Successfully deleted ${deleteResult.count} lessons`);
  console.log(`\n🎯 READY FOR PERFECT LESSON CREATION:`);
  console.log(`- 12 inquiry-based Science lessons`);
  console.log(`- Full curriculum expectation coverage`);
  console.log(`- ETFO-compliant structure and timing`);
  console.log(`- Hands-on investigations and safety protocols`);
  console.log(`- Science journals and authentic assessment`);
  console.log(`- Indigenous perspectives and differentiation`);

  // Verify deletion
  const remainingLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        title: 'Our School Environment',
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    }
  });

  console.log(`\n🔍 VERIFICATION: ${remainingLessons.length} lessons remain (should be 0)`);
  
  if (remainingLessons.length === 0) {
    console.log(`✅ Clean slate achieved! Ready to create perfect lessons.`);
  } else {
    console.log(`❌ Some lessons still exist - deletion may have failed.`);
  }
}

// Run the deletion
deleteOurSchoolEnvironmentLessons()
  .catch((error) => {
    console.error('❌ Error deleting lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });