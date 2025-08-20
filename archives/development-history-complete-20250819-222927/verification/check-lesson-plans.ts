import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLessonPlans() {
  console.log('🔍 LESSON PLAN EXISTENCE CHECK');
  console.log('===============================\n');

  // Count total lesson plans
  const totalLessonPlans = await prisma.eTFOLessonPlan.count();
  console.log(`Total lesson plans in database: ${totalLessonPlans}`);
  
  if (totalLessonPlans > 0) {
    // Get sample lesson plans
    const samplePlans = await prisma.eTFOLessonPlan.findMany({
      take: 5,
      include: {
        unitPlan: {
          select: {
            title: true,
            longRangePlan: {
              select: {
                subject: true
              }
            }
          }
        }
      }
    });

    console.log('\nSample lesson plans found:');
    samplePlans.forEach((plan, i) => {
      console.log(`${i + 1}. "${plan.title}" (${plan.unitPlan?.longRangePlan?.subject} - ${plan.unitPlan?.title})`);
    });
  }

  // Check lesson plans by subject
  const subjects = [
    { name: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh' },
    { name: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in' },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh' },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5' },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo' },
    { name: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw' }
  ];

  console.log('\nLesson plans by subject:');
  for (const subject of subjects) {
    const count = await prisma.eTFOLessonPlan.count({
      where: {
        unitPlan: {
          longRangePlanId: subject.lrpId
        }
      }
    });
    console.log(`${subject.name}: ${count} lesson plans`);
  }

  console.log(`\nRequired total: 975 lesson plans`);
  console.log(`Actual total: ${totalLessonPlans} lesson plans`);
  console.log(`Gap: ${975 - totalLessonPlans} lesson plans missing`);

  if (totalLessonPlans === 0) {
    console.log('\n❌ CRITICAL: ZERO LESSON PLANS EXIST');
    console.log('Emily cannot teach without lesson plans.');
    console.log('Unit plans are just frameworks - need actual daily lessons.');
  }

  await prisma.$disconnect();
}

checkLessonPlans().catch(console.error);