const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSampleLesson() {
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    // Get one sample lesson from first French unit
    const sampleLesson = await prisma.eTFOLessonPlan.findFirst({
      where: { userId: emily.id },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      }
    });

    if (sampleLesson) {
      console.log('SAMPLE LESSON STRUCTURE:');
      console.log('=======================');
      console.log(`Title: ${sampleLesson.title}`);
      console.log(`Unit: ${sampleLesson.unitPlan.title}`);
      console.log(`Date: ${sampleLesson.date.toISOString().split('T')[0]}`);
      console.log(`Duration: ${sampleLesson.duration} minutes`);
      console.log('');
      
      console.log('LESSON COMPONENTS:');
      console.log(`Learning Goals: ${sampleLesson.learningGoals ? 'YES' : 'NO'}`);
      console.log(`Minds On: ${sampleLesson.mindsOn ? 'YES (' + sampleLesson.mindsOn.length + ' chars)' : 'NO'}`);
      console.log(`Action: ${sampleLesson.action ? 'YES (' + sampleLesson.action.length + ' chars)' : 'NO'}`);
      console.log(`Consolidation: ${sampleLesson.consolidation ? 'YES (' + sampleLesson.consolidation.length + ' chars)' : 'NO'}`);
      console.log(`Materials: ${sampleLesson.materials ? 'YES' : 'NO'}`);
      console.log(`Assessment: ${sampleLesson.assessmentNotes ? 'YES' : 'NO'}`);
      console.log(`Accommodations: ${sampleLesson.accommodations ? 'YES' : 'NO'}`);
      console.log('');

      if (sampleLesson.mindsOn) {
        console.log('MINDS ON SAMPLE:');
        console.log(sampleLesson.mindsOn.substring(0, 200) + '...');
        console.log('');
      }
    } else {
      console.log('No lessons found');
    }

    // Check a sample unit
    const sampleUnit = await prisma.unitPlan.findFirst({
      where: { userId: emily.id },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    if (sampleUnit) {
      console.log('SAMPLE UNIT STRUCTURE:');
      console.log('======================');
      console.log(`Title: ${sampleUnit.title}`);
      console.log(`Big Ideas: ${sampleUnit.bigIdeas ? 'YES (' + sampleUnit.bigIdeas.length + ' chars)' : 'NO'}`);
      console.log(`Essential Questions: ${sampleUnit.essentialQuestions ? sampleUnit.essentialQuestions.length : 0} questions`);
      console.log(`Assessment Plan: ${sampleUnit.assessmentPlan ? 'YES (' + sampleUnit.assessmentPlan.length + ' chars)' : 'NO'}`);
      console.log(`Culminating Task: ${sampleUnit.culminatingTask ? 'YES' : 'NO'}`);
      console.log(`Curriculum Expectations: ${sampleUnit.expectations.length}`);
      console.log('');

      if (sampleUnit.essentialQuestions && sampleUnit.essentialQuestions.length > 0) {
        console.log('ESSENTIAL QUESTIONS:');
        sampleUnit.essentialQuestions.forEach((q, i) => {
          console.log(`${i + 1}. ${q}`);
        });
        console.log('');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSampleLesson();