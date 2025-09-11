import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyFPSLessons() {
  try {
    console.log('🔍 Querying Emily McIsaac\'s Formation personnelle et sociale lessons...\n');

    // Find Emily's user ID (should be 23)
    const emily = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Emily McIsaac'
        }
      }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Find all Formation personnelle et sociale unit plans for Emily
    const fpsUnitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Formation personnelle et sociale'
        }
      },
      include: {
        longRangePlan: {
          select: {
            title: true,
            subject: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            title: true,
            duration: true,
            date: true,
            mindsOn: true,
            action: true,
            consolidation: true,
            differentiationStrategies: true,
            indigenousPerspectives: true,
            assessmentNotes: true
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    console.log(`📊 Found ${fpsUnitPlans.length} Formation personnelle et sociale unit plans:\n`);

    let totalLessons = 0;
    const unitData: Array<{
      title: string;
      lessonCount: number;
      lessons60min: number;
      needsTimingUpdate: number;
      needsDifferentiationUpdate: number;
      needsIndigenousUpdate: number;
      needsAssessmentUpdate: number;
    }> = [];

    for (const unit of fpsUnitPlans) {
      const lessonCount = unit.lessonPlans.length;
      totalLessons += lessonCount;

      // Count lessons that need updates
      const lessons60min = unit.lessonPlans.filter(l => l.duration === 60).length;
      const needsTimingUpdate = unit.lessonPlans.filter(l => 
        !l.mindsOn?.startsWith('(8 minutes)') || 
        !l.action?.startsWith('(27 minutes)') || 
        !l.consolidation?.startsWith('(10 minutes)')
      ).length;
      const needsDifferentiationUpdate = unit.lessonPlans.filter(l => 
        !l.differentiationStrategies || 
        typeof l.differentiationStrategies !== 'object' ||
        !('forStruggling' in l.differentiationStrategies)
      ).length;
      const needsIndigenousUpdate = unit.lessonPlans.filter(l => 
        !l.indigenousPerspectives || 
        l.indigenousPerspectives.length < 100
      ).length;
      const needsAssessmentUpdate = unit.lessonPlans.filter(l => 
        !l.assessmentNotes?.includes('☐')
      ).length;

      unitData.push({
        title: unit.title,
        lessonCount,
        lessons60min,
        needsTimingUpdate,
        needsDifferentiationUpdate,
        needsIndigenousUpdate,
        needsAssessmentUpdate
      });

      console.log(`📚 Unit: ${unit.title}`);
      console.log(`   📝 Lessons: ${lessonCount}`);
      console.log(`   🕐 60min lessons: ${lessons60min}`);
      console.log(`   ⏱️  Need timing update: ${needsTimingUpdate}`);
      console.log(`   🔀 Need differentiation update: ${needsDifferentiationUpdate}`);
      console.log(`   🏛️  Need indigenous perspective update: ${needsIndigenousUpdate}`);
      console.log(`   📋 Need assessment update: ${needsAssessmentUpdate}`);
      console.log('');
    }

    console.log(`🎯 SUMMARY:`);
    console.log(`   Total FPS lessons: ${totalLessons}`);
    console.log(`   Expected: 96 lessons`);
    console.log(`   Units found: ${fpsUnitPlans.length}`);
    console.log('\n📋 Unit breakdown:');
    unitData.forEach(unit => {
      console.log(`   • ${unit.title}: ${unit.lessonCount} lessons`);
    });

    // Check for specific unit names
    const expectedUnits = [
      'Me, Myself, and I',
      'Healthy Me', 
      'Safe and Sound',
      'Friends and Feelings',
      'Growing and Learning',
      'Our Wonderful World'
    ];

    console.log('\n🎯 Expected units check:');
    expectedUnits.forEach(expectedUnit => {
      const found = fpsUnitPlans.find(unit => unit.title.includes(expectedUnit));
      if (found) {
        console.log(`   ✅ ${expectedUnit}: ${found.lessonPlans.length} lessons`);
      } else {
        console.log(`   ❌ ${expectedUnit}: NOT FOUND`);
      }
    });

    return {
      totalLessons,
      unitPlans: fpsUnitPlans,
      unitData
    };

  } catch (error) {
    console.error('❌ Error querying Emily\'s FPS lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyFPSLessons();