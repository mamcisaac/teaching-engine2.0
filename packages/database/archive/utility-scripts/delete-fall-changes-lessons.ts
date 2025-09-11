import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteFallChangesLessons() {
  console.log('🗑️  DELETING "Fall Changes" Science Lessons - Complete Reconstruction Required');
  console.log('===============================================================================');
  console.log('These 24 lessons are fundamentally flawed with 0.0% quality across all metrics.\n');

  // First, get all lessons to be deleted for logging
  const lessonsToDelete = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        title: 'Fall Changes',
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

  console.log(`\n🚨 CRITICAL ISSUES WITH CURRENT LESSONS:`);
  console.log(`- 0% ETFO compliance (all 60 minutes, no timing structure)`);
  console.log(`- 0% Science inquiry (no hands-on activities or vocabulary)`);
  console.log(`- 0% Curriculum coverage (no expectations linked)`);
  console.log(`- 0% Indigenous perspectives and differentiation`);
  console.log(`- 0% Observable assessment strategies`);
  console.log(`- Many duplicate titles and generic content`);
  console.log(`- No pedagogical progression or skill building`);

  // Delete all lessons
  const deleteResult = await prisma.eTFOLessonPlan.deleteMany({
    where: {
      userId: 23,
      unitPlan: {
        title: 'Fall Changes',
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    }
  });

  console.log(`\n✅ Successfully deleted ${deleteResult.count} lessons`);
  console.log(`\n🎯 READY FOR PERFECT LESSON CREATION (24 lessons):`);
  console.log(`- Curriculum Expectation: 1.3.2 (Seasonal/daily changes affecting living things)`);
  console.log(`- ETFO-compliant structure (45 min, 8/27/10 timing)`);
  console.log(`- Hands-on fall investigations and observations`);
  console.log(`- French immersion vocabulary development`);
  console.log(`- Mi'kmaq seasonal knowledge and perspectives`);
  console.log(`- Observable assessment with checkboxes`);
  console.log(`- Science-specific differentiation strategies`);
  console.log(`- Logical progression: observation → investigation → analysis → application`);

  // Verify deletion
  const remainingLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        title: 'Fall Changes',
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    }
  });

  console.log(`\n🔍 VERIFICATION: ${remainingLessons.length} lessons remain (should be 0)`);
  
  if (remainingLessons.length === 0) {
    console.log(`✅ Clean slate achieved! Ready to create 24 perfect fall science lessons.`);
    console.log(`\n📋 PROVEN METHODOLOGY TO APPLY:`);
    console.log(`1. Create 24 inquiry-based lessons with proper curriculum coverage`);
    console.log(`2. Ensure 70%+ hands-on activities per lesson`);
    console.log(`3. Integrate French scientific vocabulary throughout`);
    console.log(`4. Include Mi'kmaq seasonal knowledge in every lesson`);
    console.log(`5. Apply science-specific differentiation strategies`);
    console.log(`6. Use observable assessment with practical checkboxes`);
    console.log(`7. Achieve 95%+ overall pedagogical quality like Unit 1`);
  } else {
    console.log(`❌ Some lessons still exist - deletion may have failed.`);
  }
}

// Run the deletion
deleteFallChangesLessons()
  .catch((error) => {
    console.error('❌ Error deleting lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });