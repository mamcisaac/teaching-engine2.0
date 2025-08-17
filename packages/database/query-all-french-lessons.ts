import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryAllFrenchLessons() {
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: { id: 23 }
    });

    if (!emily) {
      console.log('Emily (ID: 23) not found in database');
      return;
    }

    console.log(`Found Emily: ${emily.name} (ID: ${emily.id})`);

    // First, let's see all subjects in Emily's lessons
    const allSubjects = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      select: {
        subject: true
      },
      distinct: ['subject']
    });

    console.log('\nAll subjects in Emily\'s lessons:');
    allSubjects.forEach(s => console.log(`- ${s.subject}`));

    // Look for lessons with any French-related subjects
    const frenchLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        OR: [
          { subject: { contains: 'Français' } },
          { subject: { contains: 'français' } },
          { subject: { contains: 'French' } },
          { subject: { contains: 'french' } },
          { language: 'fr' },
          { language: 'French' }
        ]
      },
      select: {
        id: true,
        title: true,
        titleFr: true,
        subject: true,
        language: true,
        mindsOn: true,
        mindsOnFr: true,
        action: true,
        actionFr: true,
        consolidation: true,
        consolidationFr: true,
        learningGoals: true,
        learningGoalsFr: true
      }
    });

    console.log(`\nFound ${frenchLessons.length} French-related lessons`);

    if (frenchLessons.length > 0) {
      // Check for missing French content
      let missingFrenchContent = 0;
      let lessonsWithMissingFrench = [];

      frenchLessons.forEach((lesson, index) => {
        const hasFrenchTitle = !!lesson.titleFr;
        const hasFrenchMindsOn = !!lesson.mindsOnFr;
        const hasFrenchAction = !!lesson.actionFr;
        const hasFrenchConsolidation = !!lesson.consolidationFr;
        const hasFrenchLearningGoals = !!lesson.learningGoalsFr;

        const missingFields = [];
        if (!hasFrenchTitle) missingFields.push('titleFr');
        if (!hasFrenchMindsOn) missingFields.push('mindsOnFr');
        if (!hasFrenchAction) missingFields.push('actionFr');
        if (!hasFrenchConsolidation) missingFields.push('consolidationFr');
        if (!hasFrenchLearningGoals) missingFields.push('learningGoalsFr');

        if (missingFields.length > 0) {
          missingFrenchContent++;
          lessonsWithMissingFrench.push({
            id: lesson.id,
            title: lesson.title,
            subject: lesson.subject,
            language: lesson.language,
            missingFields
          });
        }
      });

      console.log(`Lessons missing French content: ${missingFrenchContent}`);
      if (missingFrenchContent > 0) {
        console.log('\nFirst 10 lessons with missing French content:');
        lessonsWithMissingFrench.slice(0, 10).forEach(lesson => {
          console.log(`- ${lesson.title} (Subject: ${lesson.subject}, Language: ${lesson.language})`);
          console.log(`  Missing: ${lesson.missingFields.join(', ')}`);
        });
      }

      // Show breakdown by subject
      const lessonsBySubject = frenchLessons.reduce((acc, lesson) => {
        const subject = lesson.subject || 'Unknown';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(lesson);
        return acc;
      }, {} as Record<string, any[]>);

      console.log('\nFrench lessons by subject:');
      Object.entries(lessonsBySubject).forEach(([subject, subjectLessons]) => {
        console.log(`- ${subject}: ${subjectLessons.length} lessons`);
      });
    }

    // Let's also check the total lesson count for Emily
    const totalLessons = await prisma.eTFOLessonPlan.count({
      where: { userId: emily.id }
    });

    console.log(`\nTotal lessons for Emily: ${totalLessons}`);

  } catch (error) {
    console.error('Error querying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryAllFrenchLessons();