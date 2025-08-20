import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleFPSQuery() {
  try {
    console.log('🔍 Simple Formation personnelle et sociale query...\n');
    
    // First, just find the LRP with minimal fields
    const fpsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23,
        subject: 'Formation personnelle et sociale'
      }
    });

    if (!fpsLRP) {
      console.log('❌ No Formation personnelle et sociale Long Range Plan found');
      return;
    }

    console.log('✅ Found FPS LRP!');
    console.log('Basic Info:');
    console.log(`  - ID: ${fpsLRP.id}`);
    console.log(`  - Title: ${fpsLRP.title}`);
    console.log(`  - Subject: ${fpsLRP.subject}`);
    console.log(`  - Grade: ${fpsLRP.grade}`);
    console.log(`  - Academic Year: ${fpsLRP.academicYear}`);
    console.log(`  - Description: ${fpsLRP.description || 'Not provided'}`);
    console.log(`  - Overarching Questions: ${fpsLRP.overarchingQuestions || 'Not provided'}`);
    console.log(`  - Assessment Overview: ${fpsLRP.assessmentOverview || 'Not provided'}`);
    console.log(`  - Indigenous Perspectives: ${fpsLRP.indigenousPerspectives || 'Not provided'}`);
    console.log(`  - Resource Needs: ${fpsLRP.resourceNeeds || 'Not provided'}`);
    console.log(`  - Parent Communication: ${fpsLRP.parentCommunication || 'Not provided'}`);

    // Now get unit plans with minimal fields
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: fpsLRP.id
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        bigIdeas: true,
        description: true,
        lessonPlans: {
          select: {
            id: true,
            title: true,
            date: true,
            duration: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    console.log(`\n📖 Unit Plans (${unitPlans.length}):`);
    let totalLessons = 0;
    
    unitPlans.forEach((unit, idx) => {
      const lessonCount = unit.lessonPlans.length;
      totalLessons += lessonCount;
      console.log(`${idx + 1}. "${unit.title}" (${lessonCount} lessons)`);
      console.log(`   Period: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
      console.log(`   Big Ideas: ${unit.bigIdeas || 'Not provided'}`);
      console.log(`   Description: ${(unit.description || 'Not provided').substring(0, 100)}...`);
    });

    console.log(`\n🎯 Totals:`);
    console.log(`  - Units: ${unitPlans.length}`);
    console.log(`  - Total Lessons: ${totalLessons}`);
    console.log(`  - Expected: 96 lessons`);
    console.log(`  - Status: ${totalLessons === 96 ? '✅ Perfect' : totalLessons < 96 ? `⚠️ Need ${96 - totalLessons} more` : `⚠️ ${totalLessons - 96} over`}`);

    return { lrp: fpsLRP, units: unitPlans, totalLessons };

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleFPSQuery();