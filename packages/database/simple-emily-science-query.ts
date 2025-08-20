import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleEmilyScienceQuery() {
  console.log('🔬 SIMPLE QUERY: Emily McIsaac Sciences de la nature (Basic Fields Only)');
  console.log('=======================================================================\n');

  try {
    // First, find Emily McIsaac
    const emily = await prisma.user.findUnique({
      where: { id: 23 }
    });

    if (!emily) {
      console.log('❌ User ID 23 not found');
      return;
    }

    console.log(`✅ Found user: ${emily.name} (${emily.email})\n`);

    // Get her Long Range Plans with minimal fields
    const lrps = await prisma.longRangePlan.findMany({
      where: { userId: 23 },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        academicYear: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`📋 Found ${lrps.length} Long Range Plans for Emily:\n`);

    lrps.forEach((lrp, index) => {
      console.log(`${index + 1}. ${lrp.subject} - "${lrp.title}"`);
      console.log(`   Grade: ${lrp.grade}, Year: ${lrp.academicYear}`);
      console.log(`   Created: ${lrp.createdAt.toISOString().split('T')[0]}`);
      console.log(`   ID: ${lrp.id}\n`);
    });

    // Find the Sciences de la nature LRP
    const scienceLRP = lrps.find(lrp => lrp.subject === 'Sciences de la nature');

    if (!scienceLRP) {
      console.log('❌ No Sciences de la nature LRP found');
      return;
    }

    console.log('✅ SCIENCES DE LA NATURE LRP FOUND:\n');
    console.log(`Title: ${scienceLRP.title}`);
    console.log(`Description: ${scienceLRP.description || 'No description'}`);
    console.log(`Grade: ${scienceLRP.grade}`);
    console.log(`Academic Year: ${scienceLRP.academicYear}\n`);

    // Get Unit Plans for this LRP
    const unitPlans = await prisma.unitPlan.findMany({
      where: { longRangePlanId: scienceLRP.id },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        description: true,
        bigIdeas: true,
        assessmentPlan: true,
        culminatingTask: true,
        priorKnowledge: true,
        communityConnections: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`📖 Found ${unitPlans.length} Unit Plans:\n`);

    let totalDays = 0;
    
    unitPlans.forEach((unit, index) => {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += durationDays;

      console.log(`${index + 1}. "${unit.title}"`);
      console.log(`   📅 ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]} (${durationDays} days)`);
      console.log(`   📝 ${unit.description?.substring(0, 100) || 'No description'}...`);
      console.log(`   💡 Big Ideas: ${unit.bigIdeas?.substring(0, 80) || 'Not specified'}...`);
      console.log(`   📊 Assessment: ${unit.assessmentPlan?.substring(0, 80) || 'Not specified'}...`);
      console.log('');
    });

    // Get lesson count for each unit
    console.log('📚 LESSON ANALYSIS BY UNIT:\n');
    
    let totalLessons = 0;
    
    for (const unit of unitPlans) {
      const lessonCount = await prisma.eTFOLessonPlan.count({
        where: { unitPlanId: unit.id }
      });
      
      totalLessons += lessonCount;
      console.log(`"${unit.title}": ${lessonCount} lessons`);
    }

    console.log(`\n📊 OVERALL SUMMARY:`);
    console.log(`===================`);
    console.log(`Total Unit Plans: ${unitPlans.length}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Total Duration: ${totalDays} days`);
    console.log(`Average per Unit: ${Math.round(totalDays / unitPlans.length)} days`);
    console.log(`Target for Rotation: 90 lessons (Current: ${totalLessons})`);
    
    if (totalLessons > 90) {
      console.log(`❌ OVER-PLANNED: ${totalLessons - 90} lessons need to be removed`);
    } else if (totalLessons < 90) {
      console.log(`⚠️  UNDER-PLANNED: ${90 - totalLessons} more lessons needed`);
    } else {
      console.log(`✅ PERFECT: Exactly 90 lessons for rotation schedule`);
    }

    // Get curriculum expectations count
    const expectationCount = await prisma.longRangePlanExpectation.count({
      where: { longRangePlanId: scienceLRP.id }
    });

    console.log(`\n📚 CURRICULUM EXPECTATIONS: ${expectationCount} linked to LRP`);

    return {
      scienceLRP,
      unitPlans,
      totalLessons,
      totalDays,
      expectationCount
    };

  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error;
  }
}

// Run the query
simpleEmilyScienceQuery()
  .then((result) => {
    if (result) {
      console.log('\n✅ BASIC QUERY COMPLETED - Ready for detailed pedagogical analysis');
    }
  })
  .catch((error) => {
    console.error('❌ FATAL ERROR:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });