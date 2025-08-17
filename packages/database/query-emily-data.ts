import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyData() {
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'emily' } },
          { name: { contains: 'Emily' } }
        ]
      }
    });

    if (!emily) {
      console.log('Emily not found in database');
      return;
    }

    console.log(`Found Emily: ${emily.name} (ID: ${emily.id})`);

    // Query Français lessons
    const francaisLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        subject: 'Français langue première'
      },
      select: {
        id: true,
        title: true,
        titleFr: true,
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

    console.log(`\nFound ${francaisLessons.length} Français lessons`);

    // Check for missing French content
    let missingFrenchContent = 0;
    let lessonsWithMissingFrench = [];

    francaisLessons.forEach((lesson, index) => {
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
          missingFields
        });
      }
    });

    console.log(`Lessons missing French content: ${missingFrenchContent}`);
    if (missingFrenchContent > 0) {
      console.log('\nFirst 5 lessons with missing French content:');
      lessonsWithMissingFrench.slice(0, 5).forEach(lesson => {
        console.log(`- ${lesson.title} (ID: ${lesson.id})`);
        console.log(`  Missing: ${lesson.missingFields.join(', ')}`);
      });
    }

    // Query all units for Emily
    const units = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id
      },
      select: {
        id: true,
        title: true,
        essentialQuestions: true,
        culminatingTask: true,
        bigIdeas: true,
        bigIdeasFr: true,
        longRangePlan: {
          select: {
            subject: true
          }
        }
      }
    });

    console.log(`\nFound ${units.length} total units`);

    // Group units by subject
    const unitsBySubject = units.reduce((acc, unit) => {
      const subject = unit.longRangePlan.subject;
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(unit);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('\nUnits by subject:');
    Object.entries(unitsBySubject).forEach(([subject, subjectUnits]) => {
      console.log(`- ${subject}: ${subjectUnits.length} units`);
    });

    // Check units missing essential questions or culminating tasks
    let unitsNeedingEssentialQuestions = 0;
    let unitsNeedingCulminatingTasks = 0;
    let unitsNeedingBigIdeasEnhancement = 0;

    units.forEach(unit => {
      if (!unit.essentialQuestions || (Array.isArray(unit.essentialQuestions) && unit.essentialQuestions.length === 0)) {
        unitsNeedingEssentialQuestions++;
      }
      if (!unit.culminatingTask) {
        unitsNeedingCulminatingTasks++;
      }
      if (!unit.bigIdeas || unit.bigIdeas.length < 50) { // Assuming good big ideas should be substantial
        unitsNeedingBigIdeasEnhancement++;
      }
    });

    console.log(`\nUnits needing enhancement:`);
    console.log(`- Need essential questions: ${unitsNeedingEssentialQuestions}`);
    console.log(`- Need culminating tasks: ${unitsNeedingCulminatingTasks}`);
    console.log(`- Need big ideas enhancement: ${unitsNeedingBigIdeasEnhancement}`);

  } catch (error) {
    console.error('Error querying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyData();