const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function queryArtsLessons() {
  try {
    // Query Arts lessons for Emily (User ID 23)
    const artsLessons = await prisma.lessonPlan.findMany({
      where: {
        unitPlan: {
          longRangePlan: {
            userId: 23,
            subject: 'Arts visuels'
          }
        }
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      },
      orderBy: [
        { unitPlan: { longRangePlan: { subject: 'asc' } } },
        { unitPlan: { title: 'asc' } },
        { lessonNumber: 'asc' }
      ]
    });

    console.log('=== ARTS VISUELS LESSONS FOR EMILY (User ID 23) ===');
    console.log('Total lessons found:', artsLessons.length);
    console.log('');

    // Group by unit
    const unitGroups = artsLessons.reduce((acc, lesson) => {
      const unitTitle = lesson.unitPlan.title;
      if (!acc[unitTitle]) {
        acc[unitTitle] = [];
      }
      acc[unitTitle].push(lesson);
      return acc;
    }, {});

    Object.entries(unitGroups).forEach(([unitTitle, lessons]) => {
      console.log(`Unit: ${unitTitle}`);
      console.log(`Lessons: ${lessons.length}`);
      lessons.slice(0, 3).forEach(lesson => {
        console.log(`  - Lesson ${lesson.lessonNumber}: ${lesson.title}`);
        console.log(`    Activities: ${lesson.activities?.substring(0, 100)}...`);
        if (lesson.materials) {
          console.log(`    Materials: ${lesson.materials.substring(0, 80)}...`);
        }
      });
      console.log('');
    });

    // Show sample of template content
    if (artsLessons.length > 0) {
      console.log('=== SAMPLE LESSON CONTENT ===');
      const sampleLesson = artsLessons[0];
      console.log(`Title: ${sampleLesson.title}`);
      console.log(`Activities:\n${sampleLesson.activities}`);
      console.log(`Materials:\n${sampleLesson.materials}`);
      console.log(`Assessment:\n${sampleLesson.assessment}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryArtsLessons();