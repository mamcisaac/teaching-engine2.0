import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFrenchFixes() {
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: { id: 23 }
    });

    console.log(`Verifying French content fixes for Emily: ${emily?.name} (ID: ${emily?.id})`);

    // Check the 172 Français lessons specifically
    const francaisLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: 23,
        subject: 'Français (Immersion)'
      },
      select: {
        id: true,
        title: true,
        titleFr: true,
        learningGoals: true,
        learningGoalsFr: true
      }
    });

    console.log(`\nTotal Français (Immersion) lessons: ${francaisLessons.length}`);

    // Count lessons with French content
    let lessonsWithFrenchTitle = 0;
    let lessonsWithFrenchLearningGoals = 0;

    francaisLessons.forEach(lesson => {
      if (lesson.titleFr) lessonsWithFrenchTitle++;
      if (lesson.learningGoalsFr) lessonsWithFrenchLearningGoals++;
    });

    console.log(`Lessons with French titles: ${lessonsWithFrenchTitle}/${francaisLessons.length}`);
    console.log(`Lessons with French learning goals: ${lessonsWithFrenchLearningGoals}/${francaisLessons.length}`);

    // Show examples of fixed content
    console.log('\nExamples of lessons with French content:');
    francaisLessons.slice(0, 3).forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
      if (lesson.titleFr) console.log(`   Title (FR): ${lesson.titleFr}`);
      if (lesson.learningGoalsFr) console.log(`   Learning Goals (FR): ${lesson.learningGoalsFr.substring(0, 100)}...`);
      console.log('');
    });

    // Check all French-related lessons across subjects
    const allFrenchLessons = await prisma.eTFOLessonPlan.count({
      where: {
        userId: 23,
        OR: [
          { subject: { contains: 'Français' } },
          { language: 'fr' }
        ]
      }
    });

    console.log(`Total French-related lessons across all subjects: ${allFrenchLessons}`);

  } catch (error) {
    console.error('Error verifying French fixes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFrenchFixes();