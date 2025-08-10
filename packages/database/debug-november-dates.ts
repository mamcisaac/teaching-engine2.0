#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugNovemberDates() {
  console.log('🔍 DEBUGGING NOVEMBER DATES AROUND REMEMBRANCE DAY\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get all November lessons
    const novLessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: emily.id,
        date: {
          gte: new Date('2025-11-01'),
          lte: new Date('2025-11-30')
        }
      },
      orderBy: { date: 'asc' }
    });

    // Group by date
    const byDate: Record<string, any[]> = {};
    novLessons.forEach(l => {
      const dateStr = l.date.toISOString().split('T')[0]; // Use ISO date for consistency
      if (!byDate[dateStr]) {
        byDate[dateStr] = [];
      }
      byDate[dateStr].push({
        title: l.titleFr || l.title,
        subject: l.subject,
        dateObj: l.date
      });
    });

    console.log('NOVEMBER 10-12, 2025 LESSON DETAILS:');
    console.log('=====================================\n');

    // Check specific dates
    for (let d = 10; d <= 12; d++) {
      const checkDate = new Date(`2025-11-${d.toString().padStart(2, '0')}`);
      const isoDate = checkDate.toISOString().split('T')[0];
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][checkDate.getDay()];
      
      console.log(`${checkDate.toDateString()} (${dayName}):`);
      if (d === 11) {
        console.log('  ⭐ REMEMBRANCE DAY (Official Holiday) ⭐');
      }
      
      if (byDate[isoDate]) {
        console.log(`  Found ${byDate[isoDate].length} lessons:`);
        byDate[isoDate].forEach(lesson => {
          console.log(`    - ${lesson.title} (${lesson.subject})`);
          console.log(`      Date stored: ${lesson.dateObj.toISOString()}`);
        });
      } else {
        console.log('  (no lessons)');
      }
      console.log();
    }

    // Also check if any lessons have time zone issues
    console.log('CHECKING FOR TIMEZONE ISSUES:');
    console.log('==============================\n');
    
    const problematicLessons = novLessons.filter(l => {
      const localDate = l.date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const isoDate = l.date.toISOString().split('T')[0];
      return localDate !== isoDate;
    });

    if (problematicLessons.length > 0) {
      console.log(`Found ${problematicLessons.length} lessons with potential timezone issues:`);
      problematicLessons.slice(0, 5).forEach(l => {
        console.log(`  - ${l.titleFr || l.title}`);
        console.log(`    ISO: ${l.date.toISOString()}`);
        console.log(`    Local: ${l.date.toLocaleDateString('en-CA')}`);
      });
    } else {
      console.log('✅ No timezone issues detected');
    }

  } catch (error) {
    console.error('❌ Error debugging dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

debugNovemberDates()
  .then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });