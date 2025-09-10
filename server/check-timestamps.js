const { PrismaClient } = require('@teaching-engine/database');
const prisma = new PrismaClient();

(async () => {
  // Get all lessons for the week
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      date: {
        gte: new Date('2025-09-08T03:00:00.000Z'),
        lt: new Date('2025-09-15T02:59:59.999Z')
      }
    },
    select: {
      id: true,
      date: true,
      title: true
    },
    orderBy: { date: 'asc' }
  });
  
  console.log('Total lessons found:', lessons.length);
  
  // Group by exact date value
  const byDate = {};
  lessons.forEach(l => {
    const d = new Date(l.date);
    const key = d.toISOString();
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(l.title);
  });
  
  console.log('\nUnique timestamps and their lessons:');
  Object.keys(byDate).sort().forEach(timestamp => {
    const d = new Date(timestamp);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const dateStr = d.toISOString().split('T')[0];
    console.log(`\n${dateStr} (${dayName}) - ${timestamp}:`);
    byDate[timestamp].forEach(title => console.log(`  - ${title}`));
  });
  
  // Check Friday specifically
  console.log('\n=== FRIDAY CHECK ===');
  const fridayStart = new Date('2025-09-12T00:00:00.000Z');
  const fridayEnd = new Date('2025-09-13T00:00:00.000Z');
  const fridayLessons = lessons.filter(l => {
    const d = new Date(l.date);
    return d >= fridayStart && d < fridayEnd;
  });
  console.log('Friday lessons:', fridayLessons.length);
  fridayLessons.forEach(l => {
    console.log(`  ${l.date} - ${l.title}`);
  });
  
  await prisma.$disconnect();
})();