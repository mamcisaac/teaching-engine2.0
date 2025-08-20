import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyScienceUnits() {
  console.log('🔬 QUERYING: Emily McIsaac Sciences de la nature Units');
  console.log('=================================================\n');

  try {
    // 1. Get Long Range Plan (basic info only)
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23,
        subject: 'Sciences de la nature'
      },
      select: {
        id: true,
        title: true,
        subject: true,
        description: true
      }
    });

    if (!lrp) {
      console.log('❌ No Long Range Plan found for Sciences de la nature');
      return;
    }

    console.log('📅 LONG RANGE PLAN:');
    console.log(`   Title: ${lrp.title}`);
    console.log(`   Subject: ${lrp.subject}`);
    console.log(`   Description: ${lrp.description?.substring(0, 100)}...`);

    // 2. Get Unit Plans
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: lrp.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        assessmentPlan: true,
        keyVocabulary: true,
        priorKnowledge: true
      },
      orderBy: { title: 'asc' }
    });

    console.log(`\n📚 UNIT PLANS (${unitPlans.length} total):`);
    unitPlans.forEach((unit, index) => {
      console.log(`\n   ${index + 1}. "${unit.title}"`);
      console.log(`      Description: ${unit.description?.length || 0} characters`);
      console.log(`      Assessment Plan: ${unit.assessmentPlan?.length || 0} characters`);
      console.log(`      Key Vocabulary: ${unit.keyVocabulary?.length || 0} characters`);
      console.log(`      Prior Knowledge: ${unit.priorKnowledge?.length || 0} characters`);
    });

    // 3. Get lesson counts per unit
    console.log(`\n📝 LESSON COUNTS BY UNIT:`);
    let totalLessons = 0;
    
    for (const unit of unitPlans) {
      const lessonCount = await prisma.eTFOLessonPlan.count({
        where: {
          userId: 23,
          unitPlanId: unit.id
        }
      });
      
      console.log(`   "${unit.title}": ${lessonCount} lessons`);
      totalLessons += lessonCount;
    }

    console.log(`\n📊 TOTAL: ${totalLessons} Science lessons`);
    console.log(`📊 TARGET: 90 Science lessons (rotation blocks)`);
    console.log(`📊 EXCESS: ${totalLessons - 90} lessons need reduction`);

    // 4. Get sample lesson from each unit for quality assessment
    console.log(`\n🔍 SAMPLE LESSONS FOR QUALITY REVIEW:`);
    
    for (const unit of unitPlans) {
      const sampleLesson = await prisma.eTFOLessonPlan.findFirst({
        where: {
          userId: 23,
          unitPlanId: unit.id
        },
        select: {
          title: true,
          duration: true,
          mindsOn: true,
          action: true,
          consolidation: true,
          materials: true,
          learningGoals: true,
          differentiation: true
        }
      });
      
      if (sampleLesson) {
        console.log(`\n   Unit: "${unit.title}"`);
        console.log(`   Sample: "${sampleLesson.title}"`);
        console.log(`   Duration: ${sampleLesson.duration} minutes`);
        console.log(`   Materials: ${sampleLesson.materials?.substring(0, 80)}...`);
        console.log(`   Learning Goals: ${sampleLesson.learningGoals?.length || 0} characters`);
        console.log(`   Differentiation: ${sampleLesson.differentiation ? 'Present' : 'Missing'}`);
        console.log(`   Minds On: ${sampleLesson.mindsOn ? 'Present' : 'Missing'}`);
        console.log(`   Action: ${sampleLesson.action ? 'Present' : 'Missing'}`);
        console.log(`   Consolidation: ${sampleLesson.consolidation ? 'Present' : 'Missing'}`);
      }
    }

    return {
      lrp,
      unitPlans,
      totalLessons
    };

  } catch (error) {
    console.error('❌ Error querying science units:', error);
    throw error;
  }
}

// Run the query
queryEmilyScienceUnits()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });