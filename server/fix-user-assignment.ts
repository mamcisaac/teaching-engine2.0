import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function fixUserAssignment() {
  console.log('Updating all ETFOLessonPlan records to belong to user 23 (Emily)...');
  
  const result = await prisma.eTFOLessonPlan.updateMany({
    where: {
      userId: 1,
    },
    data: {
      userId: 23,
    }
  });
  
  console.log(`Updated ${result.count} lessons to user 23`);
  
  // Verify the update
  const lessonCounts = await prisma.eTFOLessonPlan.groupBy({
    by: ['userId'],
    _count: {
      id: true,
    }
  });
  
  console.log('\nNew lesson counts by user:');
  lessonCounts.forEach(count => {
    console.log(`  User ${count.userId}: ${count._count.id} lessons`);
  });
  
  // Check September week specifically
  const weekLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      date: {
        gte: new Date('2025-09-08T03:00:00.000Z'),
        lte: new Date('2025-09-13T03:00:00.000Z'),
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
  
  console.log(`\nWeek of Sep 8-13, 2025: ${weekLessons.length} lessons found for user 23`);
  
  // Group by day
  const byDay: Record<string, any[]> = {};
  weekLessons.forEach(lesson => {
    const dayKey = lesson.date.toISOString().split('T')[0];
    if (!byDay[dayKey]) byDay[dayKey] = [];
    byDay[dayKey].push(lesson);
  });
  
  console.log('Breakdown by day:');
  Object.keys(byDay).sort().forEach(day => {
    console.log(`  ${day}: ${byDay[day].length} lessons`);
  });
}

fixUserAssignment()
  .catch(console.error)
  .finally(() => prisma.$disconnect());