import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmilyMathStatus() {
  try {
    // Check lesson count
    const lessonCount = await prisma.lessonPlan.count({
      where: {
        subject: 'Mathématiques',
        teacherId: 'emily'
      }
    });

    // Check date range
    const lessons = await prisma.lessonPlan.findMany({
      where: {
        subject: 'Mathématiques',
        teacherId: 'emily'
      },
      select: {
        date: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Check LRP status
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        subject: 'Mathématiques',
        userId: 23 // Emily's user ID based on the backup data
      },
      select: {
        title: true,
        goals: true,
        themes: true,
        assessmentOverview: true,
        indigenousPerspectives: true,
        parentCommunication: true
      }
    });

    console.log('=== EMILY\'S MATHÉMATIQUES STATUS ===');
    console.log(`Total Lessons: ${lessonCount} (Target: 186)`);
    console.log(`Gap: ${186 - lessonCount} lessons needed`);
    
    if (lessons.length > 0) {
      console.log(`Date Range: ${lessons[0].date} to ${lessons[lessons.length - 1].date}`);
    }

    console.log('\n=== LRP COMPONENTS ===');
    console.log(`Goals Present: ${lrp?.goals ? 'Yes' : 'No'}`);
    console.log(`Themes Present: ${lrp?.themes ? 'Yes' : 'No'}`);
    console.log(`Assessment Overview: ${lrp?.assessmentOverview ? 'Yes' : 'No'}`);
    console.log(`Indigenous Perspectives: ${lrp?.indigenousPerspectives ? 'Yes' : 'No'}`);
    console.log(`Parent Communication: ${lrp?.parentCommunication ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('Error checking Emily math status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmilyMathStatus();