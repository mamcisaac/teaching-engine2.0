import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: 'file:./packages/database/dev.db'
});

async function queryUnit() {
  try {
    // Find the unit plan
    const unit = await prisma.unitPlan.findUnique({
      where: {
        id: 'cmectx0p2000pvj4pyw3hgsbz'
      },
      include: {
        lessonPlans: {
          include: {
            curriculumExpectations: true
          }
        },
        curriculumExpectations: true,
        user: true
      }
    });

    if (!unit) {
      console.log('Unit not found with ID: cmectx0p2000pvj4pyw3hgsbz');
      return;
    }

    console.log('=== UNIT DETAILS ===');
    console.log(`Title: ${unit.title}`);
    console.log(`Subject: ${unit.subject}`);
    console.log(`Duration: ${unit.durationWeeks} weeks`);
    console.log(`Grade: ${unit.grade}`);
    console.log(`Created: ${unit.createdAt}`);
    console.log(`User: ${unit.user?.name || 'Unknown'} (ID: ${unit.userId})`);
    console.log(`\n=== BASIC INFO ===`);
    console.log(`Big Ideas: ${unit.bigIdeas?.slice(0, 200)}...`);
    console.log(`Essential Questions: ${unit.essentialQuestions?.slice(0, 200)}...`);
    console.log(`Indigenous Perspectives: ${unit.indigenousPerspectives?.slice(0, 200)}...`);
    
    console.log(`\n=== LESSON COUNT ===`);
    console.log(`Total Lessons: ${unit.lessonPlans.length}`);
    
    console.log(`\n=== CURRICULUM EXPECTATIONS ===`);
    console.log(`Linked Expectations: ${unit.curriculumExpectations.length}`);

    // Show first few lessons with details for quality assessment
    console.log(`\n=== SAMPLE LESSONS (First 3) ===`);
    for (let i = 0; i < Math.min(3, unit.lessonPlans.length); i++) {
      const lesson = unit.lessonPlans[i];
      console.log(`\n--- Lesson ${i + 1}: ${lesson.title} ---`);
      console.log(`Duration: ${lesson.duration} minutes`);
      console.log(`Minds On: ${lesson.mindsOn?.slice(0, 100)}...`);
      console.log(`Action: ${lesson.action?.slice(0, 100)}...`);
      console.log(`Consolidation: ${lesson.consolidation?.slice(0, 100)}...`);
      console.log(`Assessment: ${lesson.assessment?.slice(0, 100)}...`);
      console.log(`Differentiation: ${lesson.differentiationStrategies?.slice(0, 100)}...`);
      console.log(`Materials: ${lesson.materials?.slice(0, 100)}...`);
      console.log(`Vocabulary: ${lesson.vocabulary?.slice(0, 100)}...`);
      console.log(`Linked Curriculum: ${lesson.curriculumExpectations.length} expectations`);
    }

  } catch (error) {
    console.error('Error querying unit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryUnit();