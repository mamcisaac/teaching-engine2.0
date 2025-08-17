import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAllFPSLessons() {
  try {
    console.log('📋 Getting all FPS lessons for Emily McIsaac...\n');

    // Find Emily's user ID
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

    // Get all FPS lessons with full details
    const fpsLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          longRangePlan: {
            subject: 'Formation personnelle et sociale'
          }
        }
      },
      include: {
        unitPlan: {
          select: {
            title: true,
            startDate: true
          }
        }
      },
      orderBy: [
        {
          unitPlan: {
            startDate: 'asc'
          }
        },
        {
          date: 'asc'
        }
      ]
    });

    console.log(`📊 Found ${fpsLessons.length} total FPS lessons\n`);

    // Group by unit
    const lessonsByUnit = fpsLessons.reduce((acc, lesson) => {
      const unitTitle = lesson.unitPlan.title;
      if (!acc[unitTitle]) {
        acc[unitTitle] = [];
      }
      acc[unitTitle].push(lesson);
      return acc;
    }, {} as Record<string, typeof fpsLessons>);

    // Print all lessons organized by unit
    for (const [unitTitle, lessons] of Object.entries(lessonsByUnit)) {
      console.log(`\n📚 UNIT: ${unitTitle} (${lessons.length} lessons)\n`);
      
      lessons.forEach((lesson, index) => {
        console.log(`${index + 1}. ${lesson.title}`);
        console.log(`   ID: ${lesson.id}`);
        console.log(`   Learning Goals: ${lesson.learningGoals?.substring(0, 100)}...`);
        console.log(`   Date: ${lesson.date?.toDateString()}`);
        console.log('');
      });
    }

    return {
      totalLessons: fpsLessons.length,
      lessonsByUnit,
      allLessons: fpsLessons
    };

  } catch (error) {
    console.error('❌ Error getting FPS lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAllFPSLessons();