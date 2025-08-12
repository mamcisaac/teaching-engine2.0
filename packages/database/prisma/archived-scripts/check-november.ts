import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNovember() {
  const novemberLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      date: {
        gte: new Date('2025-11-01'),
        lt: new Date('2025-12-01')
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

  const bySubject: Record<string, number> = {};
  novemberLessons.forEach(lesson => {
    const subject = lesson.unitPlan?.longRangePlan?.subject || 'Unknown';
    bySubject[subject] = (bySubject[subject] || 0) + 1;
  });

  console.log('NOVEMBER 2025 LESSON ANALYSIS:');
  console.log('================================\n');
  
  console.log('NOVEMBER TOTALS BY SUBJECT:');
  Object.entries(bySubject).forEach(([subject, count]) => {
    console.log(`  ${subject}: ${count} lessons`);
  });

  console.log(`\nTOTAL NOVEMBER LESSONS: ${novemberLessons.length}`);

  const uniqueDates = new Set(novemberLessons.map(l => l.date.toISOString().split('T')[0]));
  console.log(`SCHOOL DAYS IN NOVEMBER: ${uniqueDates.size}`);
  console.log(`AVERAGE LESSONS PER DAY: ${(novemberLessons.length / uniqueDates.size).toFixed(1)}`);
}

checkNovember()
  .then(() => prisma.$disconnect())
  .catch(console.error);