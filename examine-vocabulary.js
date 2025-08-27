const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function examineVocabulary() {
  console.log('=== EXAMINING GRADE 1 LESSON VOCABULARY ===\n');

  // Get some lesson plans to examine vocabulary (basic fields only)
  const lessonPlans = await prisma.eTFOLessonPlan.findMany({
    where: {
      grade: 1
    },
    take: 10,
    select: {
      id: true,
      title: true,
      titleFr: true,
      subject: true,
      duration: true,
      learningGoals: true,
      learningGoalsFr: true,
      mindsOn: true,
      mindsOnFr: true,
      action: true,
      actionFr: true,
      consolidation: true,
      consolidationFr: true,
      materials: true,
      unitPlan: {
        select: {
          id: true,
          title: true,
          titleFr: true,
          longRangePlan: {
            select: {
              subject: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${lessonPlans.length} Grade 1 lesson plans\n`);

  for (const lesson of lessonPlans) {
    console.log(`\n📚 LESSON: ${lesson.titleFr || lesson.title}`);
    console.log(`📖 Subject: ${lesson.subject}`);
    console.log(`⏱️  Duration: ${lesson.duration} minutes`);
    console.log(`📄 Unit: ${lesson.unitPlan?.titleFr || lesson.unitPlan?.title}`);
    
    // Examine French content for vocabulary
    if (lesson.learningGoalsFr) {
      console.log('\n🎯 Learning Goals (FR):');
      console.log(lesson.learningGoalsFr.substring(0, 200) + '...');
    }
    
    if (lesson.mindsOnFr) {
      console.log('\n🧠 Minds On (FR):');
      console.log(lesson.mindsOnFr.substring(0, 300) + '...');
    }
    
    if (lesson.actionFr) {
      console.log('\n🎬 Action (FR):');
      console.log(lesson.actionFr.substring(0, 300) + '...');
    }
    
    if (lesson.consolidationFr) {
      console.log('\n📝 Consolidation (FR):');
      console.log(lesson.consolidationFr.substring(0, 300) + '...');
    }

    console.log('\n' + '='.repeat(80));
  }

  // Also check unit plans for key vocabulary
  const unitPlans = await prisma.unitPlan.findMany({
    select: {
      id: true,
      title: true,
      titleFr: true,
      description: true,
      descriptionFr: true,
      bigIdeas: true,
      bigIdeasFr: true,
      keyVocabulary: true,
      estimatedHours: true,
      longRangePlan: {
        select: {
          subject: true
        }
      }
    },
    take: 8
  });

  console.log(`\n\n=== EXAMINING UNIT PLAN VOCABULARY ===\n`);
  console.log(`Found ${unitPlans.length} unit plans\n`);

  for (const unit of unitPlans) {
    console.log(`\n📚 UNIT: ${unit.titleFr || unit.title}`);
    console.log(`📖 Subject: ${unit.longRangePlan?.subject}`);
    console.log(`⏱️  Hours: ${unit.estimatedHours}`);
    
    if (unit.keyVocabulary) {
      console.log('\n🔤 Key Vocabulary:');
      console.log(JSON.stringify(unit.keyVocabulary, null, 2));
    }
    
    if (unit.descriptionFr) {
      console.log('\n📄 Description (FR):');
      console.log(unit.descriptionFr.substring(0, 300) + '...');
    }

    if (unit.bigIdeasFr) {
      console.log('\n💡 Big Ideas (FR):');
      console.log(unit.bigIdeasFr.substring(0, 300) + '...');
    }

    console.log('\n' + '='.repeat(80));
  }

  await prisma.$disconnect();
}

examineVocabulary().catch(console.error);