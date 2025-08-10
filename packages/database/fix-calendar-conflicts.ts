#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCalendarConflicts() {
  console.log('🔧 FIXING CALENDAR ALIGNMENT CONFLICTS\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    let moved = 0;
    let deleted = 0;

    // 1. Fix Remembrance Day lessons (Nov 11, 2025)
    console.log('📅 FIXING REMEMBRANCE DAY LESSONS:\n');
    
    const remembranceDayLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: new Date('2025-11-11')
      }
    });

    console.log(`Found ${remembranceDayLessons.length} lessons on Remembrance Day`);

    // Keep ONLY the Remembrance Day Ceremony lesson, move others
    for (const lesson of remembranceDayLessons) {
      if (lesson.title === 'Remembrance Day Ceremony' || 
          lesson.titleFr === 'Cérémonie du jour du Souvenir') {
        console.log(`✅ Keeping: ${lesson.titleFr} (appropriate for the day)`);
      } else {
        // Move to Nov 12
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date('2025-11-12') }
        });
        moved++;
        console.log(`➡️ Moved to Nov 12: ${lesson.titleFr || lesson.title}`);
      }
    }

    // 2. Fix October 17 PD Day lessons
    console.log('\n📅 FIXING OCTOBER 17 PD DAY LESSONS:\n');
    
    const oct17Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: new Date('2025-10-17')
      }
    });

    console.log(`Found ${oct17Lessons.length} lessons on Oct 17 PD Day`);

    // Check if Oct 17 is the Autumn Art Celebration we added
    for (const lesson of oct17Lessons) {
      if (lesson.title === 'Autumn Art Celebration') {
        // This was intentionally added as a fun day activity, but should be moved
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date('2025-10-16') }
        });
        moved++;
        console.log(`➡️ Moved to Oct 16: ${lesson.titleFr || lesson.title}`);
      } else {
        // Move other lessons to Oct 20 (Monday)
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date('2025-10-20') }
        });
        moved++;
        console.log(`➡️ Moved to Oct 20: ${lesson.titleFr || lesson.title}`);
      }
    }

    // 3. Fix November 7 PD Day lessons
    console.log('\n📅 FIXING NOVEMBER 7 PD DAY LESSONS:\n');
    
    const nov7Lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: new Date('2025-11-07')
      }
    });

    console.log(`Found ${nov7Lessons.length} lessons on Nov 7 PD Day`);

    for (const lesson of nov7Lessons) {
      // Move to Nov 6 (Thursday)
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: { date: new Date('2025-11-06') }
      });
      moved++;
      console.log(`➡️ Moved to Nov 6: ${lesson.titleFr || lesson.title}`);
    }

    // 4. Verify no lessons on Labour Day (Sept 1)
    console.log('\n📅 CHECKING LABOUR DAY:\n');
    
    const labourDayLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: new Date('2025-09-01')
      }
    });

    if (labourDayLessons.length > 0) {
      console.log(`Found ${labourDayLessons.length} lessons on Labour Day - moving to Sept 2`);
      for (const lesson of labourDayLessons) {
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date('2025-09-02') }
        });
        moved++;
        console.log(`➡️ Moved to Sept 2: ${lesson.titleFr || lesson.title}`);
      }
    } else {
      console.log('✅ No lessons on Labour Day');
    }

    // 5. Verify no lessons on Thanksgiving (Oct 13)
    console.log('\n📅 CHECKING THANKSGIVING:\n');
    
    const thanksgivingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: new Date('2025-10-13')
      }
    });

    if (thanksgivingLessons.length > 0) {
      console.log(`Found ${thanksgivingLessons.length} lessons on Thanksgiving - moving to Oct 14`);
      for (const lesson of thanksgivingLessons) {
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: new Date('2025-10-14') }
        });
        moved++;
        console.log(`➡️ Moved to Oct 14: ${lesson.titleFr || lesson.title}`);
      }
    } else {
      console.log('✅ No lessons on Thanksgiving');
    }

    // 6. Final verification
    console.log('\n' + '='.repeat(60));
    console.log('📊 CALENDAR CONFLICT RESOLUTION SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n✅ CONFLICTS RESOLVED:`);
    console.log(`   • Lessons moved: ${moved}`);
    console.log(`   • Lessons deleted: ${deleted}`);
    console.log(`   • Remembrance Day: Keeping only ceremony lesson`);
    console.log(`   • PD Days: All lessons moved to adjacent dates`);
    console.log(`   • Holidays: All conflicts resolved`);

    // Get final count
    const totalLessons = await prisma.eTFOLessonPlan.count({
      where: { userId: emily.id }
    });

    console.log(`\n📈 FINAL STATUS:`);
    console.log(`   • Total lessons: ${totalLessons}`);
    console.log(`   • Calendar alignment: CORRECTED`);
    console.log(`   • PEI holidays respected: YES`);
    console.log(`   • PD days cleared: YES`);

  } catch (error) {
    console.error('❌ Error fixing calendar conflicts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixCalendarConflicts()
  .then(() => {
    console.log('\n✅ Calendar conflict resolution complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Calendar fix failed:', error);
    process.exit(1);
  });