import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function redistributeOverloadedDays() {
  console.log('⚖️ REDISTRIBUTING OVERLOADED TEACHING DAYS');
  console.log('='.repeat(70));
  
  const lessons = await prisma.eTFOLessonPlan.findMany({
    orderBy: { date: 'asc' }
  });
  
  // Group lessons by date
  const lessonsByDate = new Map();
  lessons.forEach(lesson => {
    const dateStr = lesson.date.toISOString().substring(0, 10);
    if (!lessonsByDate.has(dateStr)) {
      lessonsByDate.set(dateStr, []);
    }
    lessonsByDate.get(dateStr).push(lesson);
  });
  
  // Find overloaded days (>5 lessons or >250 minutes for Grade 1)
  const overloadedDays = [];
  lessonsByDate.forEach((dayLessons, date) => {
    const totalMinutes = dayLessons.reduce((sum, l) => sum + l.duration, 0);
    if (dayLessons.length > 5 || totalMinutes > 250) {
      overloadedDays.push({
        date,
        lessons: dayLessons,
        count: dayLessons.length,
        minutes: totalMinutes
      });
    }
  });
  
  console.log(`Found ${overloadedDays.length} overloaded days to fix\n`);
  
  // Sort by most overloaded first
  overloadedDays.sort((a, b) => b.count - a.count);
  
  let totalRedistributed = 0;
  
  // Process each overloaded day
  for (const day of overloadedDays.slice(0, 20)) { // Fix top 20 worst days
    console.log(`\n📅 ${day.date}: ${day.count} lessons (${day.minutes} minutes)`);
    
    // Calculate how many lessons to move
    const excessLessons = day.count - 5;
    const lessonsToMove = Math.max(excessLessons, Math.ceil((day.minutes - 250) / 50));
    
    if (lessonsToMove <= 0) continue;
    
    // Find nearby days with capacity (within same week)
    const nearbyDates = findNearbyAvailableDates(day.date, lessonsByDate);
    
    // Move excess lessons
    const movedLessons = day.lessons.slice(-lessonsToMove); // Move the last lessons
    
    for (let i = 0; i < movedLessons.length && i < nearbyDates.length; i++) {
      const lesson = movedLessons[i];
      const newDate = nearbyDates[i];
      
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: { date: new Date(newDate + 'T00:00:00Z') }
      });
      
      console.log(`   ✅ Moved to ${newDate}: ${lesson.title}`);
      
      // Update the tracking map
      const oldDateLessons = lessonsByDate.get(day.date);
      const index = oldDateLessons.findIndex(l => l.id === lesson.id);
      if (index > -1) {
        oldDateLessons.splice(index, 1);
      }
      
      if (!lessonsByDate.has(newDate)) {
        lessonsByDate.set(newDate, []);
      }
      lessonsByDate.get(newDate).push(lesson);
      
      totalRedistributed++;
    }
  }
  
  // Final check for balance
  console.log('\n' + '='.repeat(70));
  console.log('📊 REDISTRIBUTION SUMMARY');
  console.log(`✅ Redistributed ${totalRedistributed} lessons`);
  
  // Check remaining overloaded days
  let remainingOverloaded = 0;
  lessonsByDate.forEach((dayLessons, date) => {
    const totalMinutes = dayLessons.reduce((sum, l) => sum + l.duration, 0);
    if (dayLessons.length > 5 || totalMinutes > 250) {
      remainingOverloaded++;
    }
  });
  
  console.log(`📈 Overloaded days reduced from ${overloadedDays.length} to ${remainingOverloaded}`);
  
  if (remainingOverloaded === 0) {
    console.log('🎉 ALL DAYS NOW HAVE BALANCED TEACHING LOADS!');
  } else {
    console.log(`⚠️  ${remainingOverloaded} days still need adjustment (run again if needed)`);
  }
  
  await prisma.$disconnect();
}

function findNearbyAvailableDates(targetDate: string, lessonsByDate: Map<string, any[]>): string[] {
  const availableDates = [];
  const target = new Date(targetDate);
  const weekStart = new Date(target);
  weekStart.setDate(target.getDate() - target.getDay()); // Start of week
  
  // Check dates within the same week and next week
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(weekStart);
    checkDate.setDate(weekStart.getDate() + i);
    
    // Skip weekends
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue;
    
    const dateStr = checkDate.toISOString().substring(0, 10);
    
    // Skip the original date
    if (dateStr === targetDate) continue;
    
    // Check if this date has capacity
    const existingLessons = lessonsByDate.get(dateStr) || [];
    const existingMinutes = existingLessons.reduce((sum, l) => sum + l.duration, 0);
    
    // If under 5 lessons and under 200 minutes, it has capacity
    if (existingLessons.length < 5 && existingMinutes < 200) {
      availableDates.push(dateStr);
    }
  }
  
  return availableDates;
}

redistributeOverloadedDays().catch(console.error);