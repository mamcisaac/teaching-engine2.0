import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSeptember() {
  // Get all September lessons
  const septemberLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      date: {
        gte: new Date('2025-09-01'),
        lt: new Date('2025-10-01')
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

  // Group by date
  const byDate: Record<string, any[]> = {};
  septemberLessons.forEach(lesson => {
    const dateStr = lesson.date.toISOString().split('T')[0];
    if (!byDate[dateStr]) byDate[dateStr] = [];
    byDate[dateStr].push({
      title: lesson.title,
      subject: lesson.unitPlan?.longRangePlan?.subject || 'Unknown'
    });
  });

  console.log('SEPTEMBER 2025 LESSON ANALYSIS:');
  console.log('================================\n');

  // Show lessons per day
  Object.entries(byDate).sort().forEach(([date, lessons]) => {
    console.log(`${date}: ${lessons.length} lessons`);
    const subjects = lessons.reduce((acc: Record<string, number>, l) => {
      acc[l.subject] = (acc[l.subject] || 0) + 1;
      return acc;
    }, {});
    console.log('  Subjects:', Object.entries(subjects).map(([s, c]) => `${s} (${c})`).join(', '));
  });

  // Group by subject
  const bySubject: Record<string, number> = {};
  septemberLessons.forEach(lesson => {
    const subject = lesson.unitPlan?.longRangePlan?.subject || 'Unknown';
    bySubject[subject] = (bySubject[subject] || 0) + 1;
  });

  console.log('\nSEPTEMBER TOTALS BY SUBJECT:');
  Object.entries(bySubject).forEach(([subject, count]) => {
    console.log(`  ${subject}: ${count} lessons`);
  });

  console.log(`\nTOTAL SEPTEMBER LESSONS: ${septemberLessons.length}`);
  
  // Check for potential duplicates
  const titles = septemberLessons.map(l => l.title);
  const uniqueTitles = new Set(titles);
  if (titles.length !== uniqueTitles.size) {
    console.log(`\n⚠️ POTENTIAL DUPLICATES: ${titles.length - uniqueTitles.size} lessons have duplicate titles`);
  }

  // Count school days
  const schoolDays = Object.keys(byDate).length;
  console.log(`\nSCHOOL DAYS IN SEPTEMBER: ${schoolDays}`);
  console.log(`AVERAGE LESSONS PER DAY: ${(septemberLessons.length / schoolDays).toFixed(1)}`);
}

checkSeptember()
  .then(() => prisma.$disconnect())
  .catch(console.error);