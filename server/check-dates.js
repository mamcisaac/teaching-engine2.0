const { PrismaClient } = require('@teaching-engine/database');
const prisma = new PrismaClient();

async function checkDates() {
  // Check all lessons for Emily
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: 23 },
    select: { date: true, title: true },
    orderBy: { date: 'asc' }
  });
  
  console.log('Total lessons for Emily:', lessons.length);
  
  if (lessons.length > 0) {
    const firstDate = new Date(lessons[0].date);
    const lastDate = new Date(lessons[lessons.length - 1].date);
    console.log('First lesson:', firstDate.toISOString());
    console.log('Last lesson:', lastDate.toISOString());
    
    // Check September 2024 specifically
    const sept2024 = lessons.filter(l => {
      const d = new Date(l.date);
      return d >= new Date('2024-09-01') && d < new Date('2024-10-01');
    });
    console.log('\nSeptember 2024 lessons:', sept2024.length);
    if (sept2024.length > 0) {
      // Group by day
      const byDay = {};
      sept2024.forEach(l => {
        const d = new Date(l.date);
        const day = d.toISOString().split('T')[0];
        if (!byDay[day]) byDay[day] = 0;
        byDay[day]++;
      });
      console.log('By day:', byDay);
    }
    
    // Check September 2025 specifically  
    const sept2025 = lessons.filter(l => {
      const d = new Date(l.date);
      return d >= new Date('2025-09-01') && d < new Date('2025-10-01');
    });
    console.log('\nSeptember 2025 lessons:', sept2025.length);
    if (sept2025.length > 0) {
      // Group by day
      const byDay = {};
      sept2025.forEach(l => {
        const d = new Date(l.date);
        const day = d.toISOString().split('T')[0];
        if (!byDay[day]) byDay[day] = 0;
        byDay[day]++;
      });
      console.log('By day:', byDay);
    }
    
    // Check for Friday Sept 12, 2025
    const friday = new Date('2025-09-12T00:00:00.000Z');
    const saturday = new Date('2025-09-13T00:00:00.000Z');
    const fridayLessons = lessons.filter(l => {
      const d = new Date(l.date);
      return d >= friday && d < saturday;
    });
    console.log('\nFriday Sept 12, 2025 lessons:', fridayLessons.length);
    if (fridayLessons.length > 0) {
      fridayLessons.forEach(l => {
        console.log(' -', new Date(l.date).toISOString(), l.title);
      });
    }
  }
  
  await prisma.$disconnect();
}

checkDates().catch(console.error);