import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function balanceSeptemberFinal() {
  console.log('⚖️ Final balancing of September lessons...');

  // Get all September lessons
  const septemberLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      date: {
        gte: new Date('2025-09-01'),
        lt: new Date('2025-10-01')
      }
    },
    include: {
      unitPlan: {
        include: {
          longRangePlan: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Group by date
  const lessonsByDate: Record<string, any[]> = {};
  septemberLessons.forEach(lesson => {
    const dateStr = lesson.date.toISOString().split('T')[0];
    if (!lessonsByDate[dateStr]) {
      lessonsByDate[dateStr] = [];
    }
    lessonsByDate[dateStr].push(lesson);
  });

  // Find dates with 4 lessons and remove the least critical ones
  const lessonsToRemove: string[] = [];
  let removed = 0;
  const targetRemovals = 7;

  // Priority: Keep core subjects (French, Math, Science)
  const corePriority = ['Français langue première', 'Mathématiques', 'Sciences de la nature'];

  Object.entries(lessonsByDate).forEach(([date, lessons]) => {
    if (removed >= targetRemovals) return;
    
    if (lessons.length >= 3) {
      // Sort by priority (non-core subjects last)
      lessons.sort((a, b) => {
        const aSubject = a.unitPlan?.longRangePlan?.subject || '';
        const bSubject = b.unitPlan?.longRangePlan?.subject || '';
        const aIsCore = corePriority.includes(aSubject);
        const bIsCore = corePriority.includes(bSubject);
        
        if (aIsCore && !bIsCore) return -1;
        if (!aIsCore && bIsCore) return 1;
        return 0;
      });
      
      // Remove Arts or Music lessons from days with 3+ lessons
      for (const lesson of lessons) {
        if (removed >= targetRemovals) break;
        const subject = lesson.unitPlan?.longRangePlan?.subject || '';
        if (subject === 'Arts visuels' || subject === 'Music') {
          lessonsToRemove.push(lesson.id);
          console.log(`Removing from ${date}: ${lesson.title} (${subject})`);
          removed++;
        }
      }
    }
  });

  // If we still need to remove more, target days with 4 lessons
  if (removed < targetRemovals) {
    Object.entries(lessonsByDate).forEach(([date, lessons]) => {
      if (removed >= targetRemovals) return;
      
      if (lessons.length === 4) {
        // Remove the 4th lesson (already sorted by priority)
        const toRemove = lessons[lessons.length - 1];
        if (!lessonsToRemove.includes(toRemove.id)) {
          lessonsToRemove.push(toRemove.id);
          console.log(`Removing from ${date}: ${toRemove.title} (${toRemove.unitPlan?.longRangePlan?.subject})`);
          removed++;
        }
      }
    });
  }

  console.log(`\n🗑️ Removing ${lessonsToRemove.length} lessons...`);
  
  if (lessonsToRemove.length > 0) {
    const result = await prisma.eTFOLessonPlan.deleteMany({
      where: {
        id: {
          in: lessonsToRemove
        }
      }
    });
    
    console.log(`✅ Removed ${result.count} lessons`);
  }

  // Check final state
  const finalTotal = await prisma.eTFOLessonPlan.count();
  
  const bySubject = await prisma.eTFOLessonPlan.groupBy({
    by: ['subject'],
    _count: true
  });

  console.log('\n📊 FINAL SYSTEM STATUS:');
  console.log(`TOTAL LESSONS: ${finalTotal}`);
  console.log(`Target: 197 lessons`);
  
  if (finalTotal === 197) {
    console.log('✅ PERFECT! Exactly 197 lessons achieved!');
  } else if (finalTotal > 197) {
    console.log(`⚠️ Still ${finalTotal - 197} lessons over target`);
  } else {
    console.log(`⚠️ Need ${197 - finalTotal} more lessons`);
  }
  
  console.log('\nLessons by subject:');
  bySubject.forEach(s => {
    console.log(`  ${s.subject}: ${s._count} lessons`);
  });
}

balanceSeptemberFinal()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });