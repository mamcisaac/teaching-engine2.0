import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicateSeptemberLessons() {
  console.log('🔍 Analyzing September lessons for duplicates...');

  // Get all September lessons with details
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

  // Group by date and subject to find duplicates
  const lessonsByDateAndSubject: Record<string, any[]> = {};
  
  septemberLessons.forEach(lesson => {
    const dateStr = lesson.date.toISOString().split('T')[0];
    const subject = lesson.unitPlan?.longRangePlan?.subject || 'Unknown';
    const key = `${dateStr}_${subject}`;
    
    if (!lessonsByDateAndSubject[key]) {
      lessonsByDateAndSubject[key] = [];
    }
    lessonsByDateAndSubject[key].push(lesson);
  });

  // Find duplicates (multiple lessons for same subject on same day)
  const duplicatesToRemove: string[] = [];
  
  Object.entries(lessonsByDateAndSubject).forEach(([key, lessons]) => {
    if (lessons.length > 1) {
      console.log(`\n⚠️ Found ${lessons.length} ${lessons[0].unitPlan?.longRangePlan?.subject} lessons on ${lessons[0].date.toLocaleDateString()}:`);
      lessons.forEach((lesson, index) => {
        console.log(`  ${index + 1}. ${lesson.title}`);
        // Keep the first one, mark others for removal
        if (index > 0) {
          duplicatesToRemove.push(lesson.id);
        }
      });
    }
  });

  // Also check daily totals to identify overloaded days
  const lessonsByDate: Record<string, any[]> = {};
  septemberLessons.forEach(lesson => {
    const dateStr = lesson.date.toISOString().split('T')[0];
    if (!lessonsByDate[dateStr]) {
      lessonsByDate[dateStr] = [];
    }
    lessonsByDate[dateStr].push(lesson);
  });

  // Remove excess lessons from days with more than 4 lessons
  const targetDailyMax = 4;
  Object.entries(lessonsByDate).forEach(([date, lessons]) => {
    if (lessons.length > targetDailyMax) {
      console.log(`\n📅 ${date} has ${lessons.length} lessons (max should be ${targetDailyMax})`);
      
      // Sort by subject priority (keep core subjects first)
      const corePriority = ['Français langue première', 'Mathématiques', 'Sciences de la nature'];
      lessons.sort((a, b) => {
        const aSubject = a.unitPlan?.longRangePlan?.subject || '';
        const bSubject = b.unitPlan?.longRangePlan?.subject || '';
        const aPriority = corePriority.indexOf(aSubject);
        const bPriority = corePriority.indexOf(bSubject);
        
        if (aPriority === -1 && bPriority === -1) return 0;
        if (aPriority === -1) return 1;
        if (bPriority === -1) return -1;
        return aPriority - bPriority;
      });
      
      // Mark excess lessons for removal
      for (let i = targetDailyMax; i < lessons.length; i++) {
        if (!duplicatesToRemove.includes(lessons[i].id)) {
          duplicatesToRemove.push(lessons[i].id);
          console.log(`  Removing: ${lessons[i].title} (${lessons[i].unitPlan?.longRangePlan?.subject})`);
        }
      }
    }
  });

  console.log(`\n🗑️ Total lessons to remove: ${duplicatesToRemove.length}`);
  
  if (duplicatesToRemove.length > 0) {
    // Remove the duplicate/excess lessons
    const result = await prisma.eTFOLessonPlan.deleteMany({
      where: {
        id: {
          in: duplicatesToRemove
        }
      }
    });
    
    console.log(`✅ Removed ${result.count} duplicate/excess September lessons`);
  } else {
    console.log('✅ No duplicates found');
  }

  // Check final state
  const finalSeptCount = await prisma.eTFOLessonPlan.count({
    where: {
      date: {
        gte: new Date('2025-09-01'),
        lt: new Date('2025-10-01')
      }
    }
  });
  
  const finalTotal = await prisma.eTFOLessonPlan.count();
  
  console.log('\n📊 FINAL STATUS:');
  console.log(`September lessons: ${finalSeptCount}`);
  console.log(`Total lessons: ${finalTotal}`);
  console.log(`Target: 197 lessons`);
  
  if (finalTotal > 197) {
    console.log(`⚠️ Still ${finalTotal - 197} lessons over target`);
  } else if (finalTotal < 197) {
    console.log(`⚠️ Need ${197 - finalTotal} more lessons`);
  } else {
    console.log('✅ Perfect! Exactly 197 lessons');
  }
}

removeDuplicateSeptemberLessons()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });