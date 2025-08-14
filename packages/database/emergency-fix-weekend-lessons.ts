import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function emergencyFixWeekendLessons() {
  console.log('🚨 EMERGENCY FIX: REMOVING WEEKEND LESSONS');
  console.log('='.repeat(70));
  
  // Get all lessons
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true },
    orderBy: { date: 'asc' }
  });
  
  // Identify weekend lessons
  const weekendLessons = lessons.filter(l => {
    const day = l.date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  });
  
  console.log(`\n❌ Found ${weekendLessons.length} lessons scheduled on weekends`);
  console.log('This represents ' + ((weekendLessons.length / lessons.length) * 100).toFixed(1) + '% of all lessons!');
  
  // Group by month to understand distribution
  const byMonth = new Map();
  weekendLessons.forEach(l => {
    const month = l.date.toISOString().substring(0, 7);
    if (!byMonth.has(month)) {
      byMonth.set(month, []);
    }
    byMonth.get(month).push(l);
  });
  
  console.log('\n📅 Weekend lessons by month:');
  Array.from(byMonth.entries()).sort().forEach(([month, monthLessons]) => {
    console.log(`  ${month}: ${monthLessons.length} lessons`);
  });
  
  // Strategy: Move weekend lessons to nearest weekday
  console.log('\n🔧 FIXING STRATEGY:');
  console.log('  - Sunday lessons → Following Monday');
  console.log('  - Saturday lessons → Previous Friday');
  console.log('  - Check for conflicts and redistribute if needed');
  
  let fixedCount = 0;
  const dateConflicts = new Map();
  
  // First, count existing lessons per date to avoid overloading
  lessons.forEach(lesson => {
    const dateStr = lesson.date.toISOString().substring(0, 10);
    dateConflicts.set(dateStr, (dateConflicts.get(dateStr) || 0) + 1);
  });
  
  console.log('\n📝 Processing weekend lessons...');
  
  for (const lesson of weekendLessons) {
    const originalDate = new Date(lesson.date);
    const dayOfWeek = originalDate.getDay();
    let newDate = new Date(originalDate);
    
    if (dayOfWeek === 0) { // Sunday
      // Move to Monday
      newDate.setDate(originalDate.getDate() + 1);
    } else if (dayOfWeek === 6) { // Saturday
      // Move to Friday
      newDate.setDate(originalDate.getDate() - 1);
    }
    
    // Check if new date is overloaded (>5 lessons)
    let attempts = 0;
    let dateStr = newDate.toISOString().substring(0, 10);
    
    while (dateConflicts.get(dateStr) >= 5 && attempts < 10) {
      // Try next available weekday
      newDate.setDate(newDate.getDate() + 1);
      
      // Skip weekends
      if (newDate.getDay() === 0) {
        newDate.setDate(newDate.getDate() + 1);
      } else if (newDate.getDay() === 6) {
        newDate.setDate(newDate.getDate() + 2);
      }
      
      dateStr = newDate.toISOString().substring(0, 10);
      attempts++;
    }
    
    // Update the lesson
    await prisma.eTFOLessonPlan.update({
      where: { id: lesson.id },
      data: { date: newDate }
    });
    
    // Update conflict tracking
    const oldDateStr = originalDate.toISOString().substring(0, 10);
    dateConflicts.set(oldDateStr, (dateConflicts.get(oldDateStr) || 1) - 1);
    dateConflicts.set(dateStr, (dateConflicts.get(dateStr) || 0) + 1);
    
    fixedCount++;
    
    // Log progress every 20 lessons
    if (fixedCount % 20 === 0) {
      console.log(`  ✅ Fixed ${fixedCount}/${weekendLessons.length} lessons...`);
    }
  }
  
  console.log(`\n✅ Successfully fixed ${fixedCount} weekend lessons!`);
  
  // Verify no weekend lessons remain
  console.log('\n🔍 Verifying fix...');
  const remainingWeekendLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      OR: [
        { date: { equals: new Date('2025-09-07') } }, // Sample Sunday check
        { date: { equals: new Date('2025-09-06') } }, // Sample Saturday check
      ]
    }
  });
  
  // Do a full check
  const allLessonsAfterFix = await prisma.eTFOLessonPlan.findMany();
  const stillOnWeekends = allLessonsAfterFix.filter(l => {
    const day = l.date.getDay();
    return day === 0 || day === 6;
  });
  
  if (stillOnWeekends.length === 0) {
    console.log('✅ SUCCESS: No lessons remain on weekends!');
  } else {
    console.log(`⚠️ WARNING: ${stillOnWeekends.length} lessons still on weekends`);
    stillOnWeekends.slice(0, 5).forEach(l => {
      console.log(`  - ${l.date.toISOString().substring(0, 10)}: ${l.title}`);
    });
  }
  
  // Check for overloaded days after fix
  console.log('\n📊 Checking daily load distribution...');
  const lessonsByDateAfter = new Map();
  allLessonsAfterFix.forEach(lesson => {
    const dateStr = lesson.date.toISOString().substring(0, 10);
    if (!lessonsByDateAfter.has(dateStr)) {
      lessonsByDateAfter.set(dateStr, []);
    }
    lessonsByDateAfter.get(dateStr).push(lesson);
  });
  
  let overloadedDays = 0;
  lessonsByDateAfter.forEach((dayLessons, date) => {
    if (dayLessons.length > 5) {
      overloadedDays++;
    }
  });
  
  console.log(`Days with >5 lessons: ${overloadedDays}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 EMERGENCY FIX COMPLETE!');
  console.log(`  - Fixed: ${fixedCount} weekend lessons`);
  console.log(`  - Remaining issues: ${stillOnWeekends.length} weekend lessons`);
  console.log(`  - Overloaded days: ${overloadedDays}`);
  
  await prisma.$disconnect();
}

emergencyFixWeekendLessons().catch(console.error);