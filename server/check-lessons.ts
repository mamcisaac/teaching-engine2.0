import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function checkLessons() {
  // Count lessons by user
  const lessonCounts = await prisma.eTFOLessonPlan.groupBy({
    by: ['userId'],
    _count: {
      id: true,
    }
  });
  
  console.log('Lesson counts by user:');
  lessonCounts.forEach(count => {
    console.log(`  User ${count.userId}: ${count._count.id} lessons`);
  });
  
  // Get a sample of lessons
  const sampleLessons = await prisma.eTFOLessonPlan.findMany({
    select: {
      id: true,
      title: true,
      date: true,
      userId: true,
    },
    take: 5,
  });
  
  console.log('\nSample lessons:');
  sampleLessons.forEach(lesson => {
    console.log(`  ${lesson.title}: ${lesson.date.toISOString()} (user ${lesson.userId})`);
  });
  
  // Check specifically for September 2025 lessons
  const septemberLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      date: {
        gte: new Date('2025-09-01T00:00:00.000Z'),
        lt: new Date('2025-10-01T00:00:00.000Z'),
      }
    },
    select: {
      id: true,
      title: true,
      date: true,
      userId: true,
    },
    orderBy: {
      date: 'asc'
    },
    take: 10,
  });
  
  console.log('\nSeptember 2025 lessons:');
  septemberLessons.forEach(lesson => {
    console.log(`  ${lesson.title}: ${lesson.date.toISOString()} (user ${lesson.userId})`);
  });
}

checkLessons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());