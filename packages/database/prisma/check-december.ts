import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDecember() {
  const decemberLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      date: {
        gte: new Date('2025-12-01'),
        lt: new Date('2026-01-01')
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
  decemberLessons.forEach(lesson => {
    const subject = lesson.unitPlan?.longRangePlan?.subject || 'Unknown';
    bySubject[subject] = (bySubject[subject] || 0) + 1;
  });

  console.log('DECEMBER 2025 LESSON ANALYSIS:');
  console.log('================================\n');
  
  console.log('DECEMBER TOTALS BY SUBJECT:');
  Object.entries(bySubject).forEach(([subject, count]) => {
    console.log(`  ${subject}: ${count} lessons`);
  });

  console.log(`\nTOTAL DECEMBER LESSONS: ${decemberLessons.length}`);

  const uniqueDates = new Set(decemberLessons.map(l => l.date.toISOString().split('T')[0]));
  console.log(`SCHOOL DAYS IN DECEMBER: ${uniqueDates.size}`);
  if (uniqueDates.size > 0) {
    console.log(`AVERAGE LESSONS PER DAY: ${(decemberLessons.length / uniqueDates.size).toFixed(1)}`);
  }
}

checkDecember()
  .then(() => prisma.$disconnect())
  .catch(console.error);