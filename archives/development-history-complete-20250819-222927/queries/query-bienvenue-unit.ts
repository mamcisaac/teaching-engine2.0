import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBienvenueUnit() {
  try {
    // Find the "Bienvenue à l'école!" unit for user ID 23
    const unit = await prisma.unitPlan.findFirst({
      where: {
        userId: 23,
        title: "Bienvenue à l'école!"
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          orderBy: {
            date: 'asc'
          }
        }
      }
    });

    if (unit) {
      console.log('UNIT FOUND:');
      console.log('Title:', unit.title);
      console.log('Description:', unit.description);
      console.log('Big Ideas:', unit.bigIdeas);
      console.log('Essential Questions:', JSON.stringify(unit.essentialQuestions, null, 2));
      console.log('Start Date:', unit.startDate);
      console.log('End Date:', unit.endDate);
      console.log('Assessment Plan:', unit.assessmentPlan);
      console.log('Differentiation Strategies:', JSON.stringify(unit.differentiationStrategies, null, 2));
      console.log('Key Vocabulary:', JSON.stringify(unit.keyVocabulary, null, 2));
      console.log('Culminating Task:', unit.culminatingTask);
      console.log('Number of Lessons:', unit.lessonPlans.length);
      console.log('Curriculum Expectations:', unit.expectations.length);
      
      console.log('\nCURRICULUM EXPECTATIONS:');
      unit.expectations.forEach((exp, index) => {
        console.log(`${index + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
      });

      console.log('\nLESSON PLANS:');
      unit.lessonPlans.forEach((lesson, index) => {
        console.log(`${index + 1}. ${lesson.title} (${lesson.date.toISOString().split('T')[0]})`);
      });
    } else {
      console.log('Unit "Bienvenue à l\'école!" not found for user ID 23');
    }
  } catch (error) {
    console.error('Error querying unit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getBienvenueUnit();