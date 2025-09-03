import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSlotNumbers() {
  console.log('Adding slot numbers to lessons...');
  
  // Get all lessons grouped by date
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: {
      unitPlan: {
        include: {
          longRangePlan: true
        }
      }
    },
    orderBy: [
      { date: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  // Group lessons by date
  const lessonsByDate = new Map<string, typeof lessons>();
  
  for (const lesson of lessons) {
    const dateKey = lesson.date.toISOString().split('T')[0];
    if (!lessonsByDate.has(dateKey)) {
      lessonsByDate.set(dateKey, []);
    }
    lessonsByDate.get(dateKey)!.push(lesson);
  }

  // Assign slot numbers based on the order for each day
  let updateCount = 0;
  
  for (const [date, dayLessons] of lessonsByDate) {
    console.log(`Processing ${date}: ${dayLessons.length} lessons`);
    
    // Sort lessons by subject priority for initial assignment
    const subjectOrder = [
      'Français (Immersion)',
      'Mathématiques', 
      'Sciences de la nature',
      'Arts visuels',
      'Sciences humaines',
      'Formation personnelle et sociale'
    ];
    
    dayLessons.sort((a, b) => {
      const aSubject = a.unitPlan?.longRangePlan?.subject || '';
      const bSubject = b.unitPlan?.longRangePlan?.subject || '';
      const aIndex = subjectOrder.indexOf(aSubject);
      const bIndex = subjectOrder.indexOf(bSubject);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    
    // Assign slot numbers (1-5)
    for (let i = 0; i < dayLessons.length && i < 5; i++) {
      const lesson = dayLessons[i];
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: { slotNumber: i + 1 }
      });
      updateCount++;
    }
    
    // If there are more than 5 lessons in a day, assign them to slot 5
    for (let i = 5; i < dayLessons.length; i++) {
      const lesson = dayLessons[i];
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: { slotNumber: 5 }
      });
      updateCount++;
    }
  }

  console.log(`✅ Updated ${updateCount} lessons with slot numbers`);
}

addSlotNumbers()
  .catch((e) => {
    console.error('Error adding slot numbers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });