import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOctober() {
  // Get all October lessons
  const octoberLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      date: {
        gte: new Date('2025-10-01'),
        lt: new Date('2025-11-01')
      }
    },
    select: {
      title: true,
      date: true,
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
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Group by subject
  const bySubject: Record<string, number> = {};
  octoberLessons.forEach(lesson => {
    const subject = lesson.unitPlan?.longRangePlan?.subject || 'Unknown';
    bySubject[subject] = (bySubject[subject] || 0) + 1;
  });

  console.log('OCTOBER 2025 LESSON ANALYSIS:');
  console.log('================================\n');
  
  console.log('OCTOBER TOTALS BY SUBJECT:');
  Object.entries(bySubject).forEach(([subject, count]) => {
    console.log(`  ${subject}: ${count} lessons`);
  });

  console.log(`\nTOTAL OCTOBER LESSONS: ${octoberLessons.length}`);

  // Count unique dates
  const uniqueDates = new Set(octoberLessons.map(l => l.date.toISOString().split('T')[0]));
  console.log(`SCHOOL DAYS IN OCTOBER: ${uniqueDates.size}`);
  console.log(`AVERAGE LESSONS PER DAY: ${(octoberLessons.length / uniqueDates.size).toFixed(1)}`);
}

checkOctober()
  .then(() => prisma.$disconnect())
  .catch(console.error);