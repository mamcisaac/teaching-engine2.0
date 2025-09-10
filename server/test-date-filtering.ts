import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function testDateFiltering() {
  // First check if any lessons exist for user 23
  const anyLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
    },
    select: {
      id: true,
      title: true,
      date: true,
      userId: true,
    },
    take: 10,
  });
  
  console.log('Sample lessons for user 23:');
  anyLessons.forEach(lesson => {
    console.log(`  ${lesson.title}: ${lesson.date.toISOString()} (user ${lesson.userId})`);
  });
  
  // Test date range for the week
  const startDate = new Date('2025-09-08T03:00:00.000Z'); // Sunday midnight Atlantic (Monday 3 AM UTC)
  const endDate = new Date('2025-09-13T03:00:00.000Z'); // Friday midnight Atlantic (Saturday 3 AM UTC)
  
  console.log('\nTesting date range filtering:');
  console.log('Start Date:', startDate.toISOString());
  console.log('End Date:', endDate.toISOString());
  
  // First, let's see what dates are in the database for Friday
  const fridayLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      date: {
        gte: new Date('2025-09-12T00:00:00.000Z'),
        lt: new Date('2025-09-13T00:00:00.000Z'),
      }
    },
    select: {
      id: true,
      title: true,
      date: true,
    }
  });
  
  console.log('\nFriday lessons (Sep 12):');
  fridayLessons.forEach(lesson => {
    console.log(`  ${lesson.title}: ${lesson.date.toISOString()}`);
  });
  
  // Now test the actual query being used
  const weekLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      date: {
        gte: startDate,
        lte: endDate,
      }
    },
    select: {
      id: true,
      title: true,
      date: true,
    },
    orderBy: {
      date: 'asc'
    }
  });
  
  console.log(`\nWeek lessons (${startDate.toISOString()} to ${endDate.toISOString()}):`);
  console.log(`Total found: ${weekLessons.length}`);
  
  // Group by day
  const byDay: Record<string, any[]> = {};
  weekLessons.forEach(lesson => {
    const dayKey = lesson.date.toISOString().split('T')[0];
    if (!byDay[dayKey]) byDay[dayKey] = [];
    byDay[dayKey].push(lesson);
  });
  
  console.log('\nBreakdown by day:');
  Object.keys(byDay).sort().forEach(day => {
    console.log(`  ${day}: ${byDay[day].length} lessons`);
    byDay[day].forEach(lesson => {
      console.log(`    - ${lesson.title} at ${lesson.date.toISOString()}`);
    });
  });
  
  // Test with lt instead of lte
  const weekLessonsLt = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      date: {
        gte: startDate,
        lt: endDate,
      }
    },
    select: {
      id: true,
      title: true,
      date: true,
    },
    orderBy: {
      date: 'asc'
    }
  });
  
  console.log(`\nUsing lt instead of lte: ${weekLessonsLt.length} lessons found`);
  
  // Check if Friday 3PM UTC is less than Saturday 3AM UTC
  const fridayAt3PM = new Date('2025-09-12T15:00:00.000Z');
  console.log('\nDate comparison check:');
  console.log(`Friday 3PM UTC: ${fridayAt3PM.toISOString()}`);
  console.log(`Saturday 3AM UTC: ${endDate.toISOString()}`);
  console.log(`Is Friday 3PM < Saturday 3AM? ${fridayAt3PM < endDate}`);
  console.log(`Is Friday 3PM <= Saturday 3AM? ${fridayAt3PM <= endDate}`);
}

testDateFiltering()
  .catch(console.error)
  .finally(() => prisma.$disconnect());