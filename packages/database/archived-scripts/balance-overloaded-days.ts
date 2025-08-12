#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function balanceOverloadedDays() {
  console.log('⚖️ BALANCING OVERLOADED DAYS FOR PERFECT DISTRIBUTION\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    let moved = 0;

    // === CHECK AND BALANCE SEPTEMBER FRIDAYS ===
    console.log('📅 ANALYZING OVERLOADED FRIDAYS:\n');

    // Check Sep 12 (Friday) - 8 lessons
    const sep12Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 8, 12, 0, 0, 0),
          lt: new Date(2025, 8, 13, 0, 0, 0)
        }
      },
      orderBy: { subject: 'asc' }
    });

    console.log(`Sep 12 (Friday) has ${sep12Lessons.length} lessons:`);
    sep12Lessons.forEach(l => console.log(`  - ${l.titleFr || l.title} (${l.subject})`));

    // Check Sep 11 (Thursday) load
    const sep11Count = await prisma.eTFOLessonPlan.count({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 8, 11, 0, 0, 0),
          lt: new Date(2025, 8, 12, 0, 0, 0)
        }
      }
    });

    console.log(`\nSep 11 (Thursday) has ${sep11Count} lessons`);

    // Move 2-3 lessons from Sep 12 to Sep 11 if Thursday has capacity
    if (sep12Lessons.length > 6 && sep11Count < 4) {
      const lessonsToMove = sep12Lessons.slice(6); // Move excess over 6
      
      for (const lesson of lessonsToMove) {
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date(2025, 8, 11, 12, 0, 0) }
        });
        moved++;
        console.log(`  ➡️ Moved to Sep 11: ${lesson.titleFr || lesson.title}`);
      }
    }

    // Check Sep 19 (Friday) - 8 lessons
    console.log('\n---');
    const sep19Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 8, 19, 0, 0, 0),
          lt: new Date(2025, 8, 20, 0, 0, 0)
        }
      },
      orderBy: { subject: 'asc' }
    });

    console.log(`Sep 19 (Friday) has ${sep19Lessons.length} lessons:`);
    sep19Lessons.forEach(l => console.log(`  - ${l.titleFr || l.title} (${l.subject})`));

    // Check Sep 18 (Thursday) load
    const sep18Count = await prisma.eTFOLessonPlan.count({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 8, 18, 0, 0, 0),
          lt: new Date(2025, 8, 19, 0, 0, 0)
        }
      }
    });

    console.log(`\nSep 18 (Thursday) has ${sep18Count} lessons`);

    // Move excess lessons from Sep 19 to Sep 18
    if (sep19Lessons.length > 6 && sep18Count < 4) {
      const lessonsToMove = sep19Lessons.slice(6); // Move excess over 6
      
      for (const lesson of lessonsToMove) {
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date(2025, 8, 18, 12, 0, 0) }
        });
        moved++;
        console.log(`  ➡️ Moved to Sep 18: ${lesson.titleFr || lesson.title}`);
      }
    }

    // Check Sep 26 (Friday) - 7 lessons
    console.log('\n---');
    const sep26Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 8, 26, 0, 0, 0),
          lt: new Date(2025, 8, 27, 0, 0, 0)
        }
      },
      orderBy: { subject: 'asc' }
    });

    console.log(`Sep 26 (Friday) has ${sep26Lessons.length} lessons:`);
    sep26Lessons.forEach(l => console.log(`  - ${l.titleFr || l.title} (${l.subject})`));

    // Check Sep 25 (Thursday) load
    const sep25Count = await prisma.eTFOLessonPlan.count({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 8, 25, 0, 0, 0),
          lt: new Date(2025, 8, 26, 0, 0, 0)
        }
      }
    });

    console.log(`\nSep 25 (Thursday) has ${sep25Count} lessons`);

    // Move 1 lesson from Sep 26 to Sep 25 if needed
    if (sep26Lessons.length > 6 && sep25Count < 5) {
      const lessonsToMove = sep26Lessons.slice(6); // Move excess over 6
      
      for (const lesson of lessonsToMove) {
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date(2025, 8, 25, 12, 0, 0) }
        });
        moved++;
        console.log(`  ➡️ Moved to Sep 25: ${lesson.titleFr || lesson.title}`);
      }
    }

    // === FINAL VERIFICATION ===
    console.log('\n' + '='.repeat(60));
    console.log('📊 LOAD BALANCING RESULTS');
    console.log('='.repeat(60) + '\n');

    // Get all September-December lessons
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date(2025, 8, 1),
          lte: new Date(2025, 11, 31)
        }
      }
    });

    // Group by date to check distribution
    const dailyLoads = new Map<string, number>();
    allLessons.forEach(lesson => {
      const dateStr = lesson.date.toDateString();
      dailyLoads.set(dateStr, (dailyLoads.get(dateStr) || 0) + 1);
    });

    // Find days with various load levels
    let distribution = { 
      light: 0,     // 1-2 lessons
      moderate: 0,  // 3-4 lessons
      full: 0,      // 5-6 lessons
      overloaded: 0 // 7+ lessons
    };

    const overloadedDays: string[] = [];
    
    dailyLoads.forEach((count, date) => {
      if (count <= 2) distribution.light++;
      else if (count <= 4) distribution.moderate++;
      else if (count <= 6) distribution.full++;
      else {
        distribution.overloaded++;
        overloadedDays.push(`${date}: ${count} lessons`);
      }
    });

    console.log('DAILY LOAD DISTRIBUTION:');
    console.log(`  Light (1-2 lessons): ${distribution.light} days`);
    console.log(`  Moderate (3-4 lessons): ${distribution.moderate} days`);
    console.log(`  Full (5-6 lessons): ${distribution.full} days`);
    console.log(`  Overloaded (7+ lessons): ${distribution.overloaded} days`);

    if (overloadedDays.length > 0) {
      console.log('\n⚠️ Remaining overloaded days:');
      overloadedDays.forEach(day => console.log(`  ${day}`));
    } else {
      console.log('\n✅ PERFECT! No overloaded days remain!');
    }

    console.log(`\n📈 BALANCING SUMMARY:`);
    console.log(`   • Lessons redistributed: ${moved}`);
    console.log(`   • Maximum daily load: ${Math.max(...Array.from(dailyLoads.values()))} lessons`);
    console.log(`   • Average daily load: ${(allLessons.length / dailyLoads.size).toFixed(2)} lessons`);

    const isPerfectlyBalanced = distribution.overloaded === 0;
    
    if (isPerfectlyBalanced) {
      console.log('\n🎉 PERFECT BALANCE ACHIEVED!');
      console.log('All days now have sustainable lesson loads (≤6 lessons)');
    }

    return isPerfectlyBalanced;

  } catch (error) {
    console.error('❌ Error balancing days:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

balanceOverloadedDays()
  .then((isPerfect) => {
    if (isPerfect) {
      console.log('\n✅ Load balancing complete - System is PERFECT!');
    } else {
      console.log('\n⚠️ Load balancing complete - Review remaining issues');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Balancing failed:', error);
    process.exit(1);
  });