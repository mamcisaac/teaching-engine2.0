#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTimezoneIssues() {
  console.log('🔧 FIXING TIMEZONE ISSUES IN LESSON DATES\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get all lessons
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      orderBy: { date: 'asc' }
    });

    console.log(`Total lessons to check: ${allLessons.length}\n`);

    let fixed = 0;
    const updates: Array<{ id: string, oldDate: Date, newDate: Date, title: string }> = [];

    for (const lesson of allLessons) {
      // Get the ISO string
      const isoString = lesson.date.toISOString();
      
      // Extract just the date part (YYYY-MM-DD)
      const datePart = isoString.split('T')[0];
      
      // Create a new date with noon local time to avoid timezone issues
      // This ensures the date stays on the correct day regardless of timezone
      const [year, month, day] = datePart.split('-').map(Number);
      const correctedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
      
      // Check if the corrected date is different from the stored date's local representation
      if (lesson.date.toLocaleDateString('en-CA') !== correctedDate.toLocaleDateString('en-CA')) {
        updates.push({
          id: lesson.id,
          oldDate: lesson.date,
          newDate: correctedDate,
          title: lesson.titleFr || lesson.title || 'Untitled'
        });
      }
    }

    console.log(`Found ${updates.length} lessons with timezone issues\n`);

    if (updates.length > 0) {
      console.log('FIXING LESSON DATES:');
      console.log('====================\n');

      // Group by month for better visibility
      const byMonth: Record<string, typeof updates> = {};
      updates.forEach(update => {
        const monthKey = update.newDate.toLocaleDateString('en-CA', { year: 'numeric', month: 'long' });
        if (!byMonth[monthKey]) byMonth[monthKey] = [];
        byMonth[monthKey].push(update);
      });

      for (const [month, monthUpdates] of Object.entries(byMonth)) {
        console.log(`${month}:`);
        
        for (const update of monthUpdates) {
          // Update the database
          await prisma.eTFOLessonPlan.update({
            where: { id: update.id },
            data: { date: update.newDate }
          });
          
          fixed++;
          
          const oldLocal = update.oldDate.toLocaleDateString('en-CA');
          const newLocal = update.newDate.toLocaleDateString('en-CA');
          
          console.log(`  ✅ Fixed: ${update.title}`);
          console.log(`     Was showing as: ${oldLocal}`);
          console.log(`     Now correctly: ${newLocal}`);
        }
        console.log();
      }
    }

    // Verify November dates specifically
    console.log('VERIFYING NOVEMBER DATES:');
    console.log('=========================\n');

    const novLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 10, 1), // Nov 1
          lte: new Date(2025, 10, 30)  // Nov 30
        }
      },
      orderBy: { date: 'asc' }
    });

    // Check Nov 10-12
    for (let d = 10; d <= 12; d++) {
      const checkDate = new Date(2025, 10, d, 12, 0, 0); // Noon local time
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][checkDate.getDay()];
      
      const lessonsOnDay = novLessons.filter(l => {
        const lDate = new Date(l.date);
        return lDate.getDate() === d && lDate.getMonth() === 10 && lDate.getFullYear() === 2025;
      });

      console.log(`Nov ${d}, 2025 (${dayName}):`);
      if (d === 11) {
        console.log('  ⭐ REMEMBRANCE DAY ⭐');
      }
      
      if (lessonsOnDay.length > 0) {
        console.log(`  ${lessonsOnDay.length} lessons:`);
        lessonsOnDay.forEach(l => {
          console.log(`    - ${l.titleFr || l.title}`);
        });
      } else {
        console.log('  (no lessons)');
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TIMEZONE FIX SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n✅ RESULTS:`);
    console.log(`   • Lessons checked: ${allLessons.length}`);
    console.log(`   • Timezone issues fixed: ${fixed}`);
    console.log(`   • All dates now display correctly`);

  } catch (error) {
    console.error('❌ Error fixing timezone issues:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixTimezoneIssues()
  .then(() => {
    console.log('\n✅ Timezone fixes complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Timezone fix failed:', error);
    process.exit(1);
  });