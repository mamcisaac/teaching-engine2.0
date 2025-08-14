import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixHolidayLessons() {
  console.log('🎄 FIXING LESSONS ON PEI HOLIDAYS & PROFESSIONAL DAYS');
  console.log('='.repeat(70));
  
  // PEI holidays and PD days for 2025-2026
  const holidayReplacements = new Map([
    // October PD day - move to October 14
    ['2025-10-10', '2025-10-14'],
    // November PD day - move to November 10
    ['2025-11-07', '2025-11-10'],
    // February PD day - move to March 2
    ['2026-02-27', '2026-03-02'],
    // May PD day - move to May 4
    ['2026-05-01', '2026-05-04'],
    // Easter Monday - move to April 14
    ['2026-04-13', '2026-04-14'],
  ]);
  
  // December break dates - need to redistribute before break
  const decemberBreakDates = getDatesInRange('2025-12-20', '2026-01-04');
  const marchBreakDates = getDatesInRange('2026-03-09', '2026-03-13');
  
  let totalFixed = 0;
  
  // Fix specific holiday replacements
  for (const [holiday, replacement] of holidayReplacements) {
    const lessonsOnHoliday = await prisma.eTFOLessonPlan.findMany({
      where: {
        date: new Date(holiday + 'T00:00:00Z')
      }
    });
    
    if (lessonsOnHoliday.length > 0) {
      console.log(`\n📅 Moving ${lessonsOnHoliday.length} lessons from ${holiday} to ${replacement}`);
      
      for (const lesson of lessonsOnHoliday) {
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date(replacement + 'T00:00:00Z') }
        });
        console.log(`   ✅ Moved: ${lesson.title}`);
        totalFixed++;
      }
    }
  }
  
  // Fix December break lessons - redistribute to early December
  console.log('\n🎄 Fixing December Break Lessons');
  for (const dateStr of decemberBreakDates) {
    const lessonsOnBreak = await prisma.eTFOLessonPlan.findMany({
      where: {
        date: new Date(dateStr + 'T00:00:00Z')
      }
    });
    
    if (lessonsOnBreak.length > 0) {
      // Redistribute to December 9-13 (week before break)
      const redistributionDates = [
        '2025-12-09', '2025-12-10', '2025-12-11', '2025-12-12', '2025-12-13'
      ];
      
      console.log(`\n   Moving ${lessonsOnBreak.length} lessons from ${dateStr}`);
      
      for (let i = 0; i < lessonsOnBreak.length; i++) {
        const newDate = redistributionDates[i % redistributionDates.length];
        await prisma.eTFOLessonPlan.update({
          where: { id: lessonsOnBreak[i].id },
          data: { date: new Date(newDate + 'T00:00:00Z') }
        });
        console.log(`   ✅ Moved to ${newDate}: ${lessonsOnBreak[i].title}`);
        totalFixed++;
      }
    }
  }
  
  // Fix March break lessons - redistribute to late February
  console.log('\n🌸 Fixing March Break Lessons');
  for (const dateStr of marchBreakDates) {
    const lessonsOnBreak = await prisma.eTFOLessonPlan.findMany({
      where: {
        date: new Date(dateStr + 'T00:00:00Z')
      }
    });
    
    if (lessonsOnBreak.length > 0) {
      // Redistribute to February 23-27
      const redistributionDates = [
        '2026-02-23', '2026-02-24', '2026-02-25', '2026-02-26', '2026-03-03'
      ];
      
      console.log(`\n   Moving ${lessonsOnBreak.length} lessons from ${dateStr}`);
      
      for (let i = 0; i < lessonsOnBreak.length; i++) {
        const newDate = redistributionDates[i % redistributionDates.length];
        await prisma.eTFOLessonPlan.update({
          where: { id: lessonsOnBreak[i].id },
          data: { date: new Date(newDate + 'T00:00:00Z') }
        });
        console.log(`   ✅ Moved to ${newDate}: ${lessonsOnBreak[i].title}`);
        totalFixed++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`✨ TOTAL LESSONS FIXED: ${totalFixed}`);
  console.log('✅ All lessons moved off holidays and PD days!');
  
  await prisma.$disconnect();
}

function getDatesInRange(start: string, end: string): string[] {
  const dates = [];
  const current = new Date(start);
  const endDate = new Date(end);
  
  while (current <= endDate) {
    dates.push(current.toISOString().substring(0, 10));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

fixHolidayLessons().catch(console.error);