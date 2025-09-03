#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { LessonSchedulerService } from '../server/src/services/lessonScheduler';
import { schoolCalendar } from '../server/src/services/schoolCalendar';

const prisma = new PrismaClient();
const schedulerService = new LessonSchedulerService(prisma);

// Emily's user ID
const EMILY_USER_ID = 23;

async function testSchedulingSystem() {
  console.log('🧪 Testing intelligent scheduling system with Emily\'s actual data...\n');

  try {
    // Test 1: Get current scheduling statistics
    console.log('📊 Test 1: Getting current scheduling statistics...');
    const initialStats = await schedulerService.getSchedulingStats(EMILY_USER_ID);
    console.log('Initial Stats:', {
      total: initialStats.total,
      scheduled: initialStats.scheduled,
      unscheduled: initialStats.unscheduled,
      completionPercentage: initialStats.completionPercentage
    });
    console.log('By Subject:', initialStats.bySubject.map(s => `${s.subject}: ${s._count.id}`));

    // Test 2: Get school calendar summary
    console.log('\n📅 Test 2: Getting school calendar summary...');
    const calendarSummary = schoolCalendar.getSchoolYearSummary();
    console.log('Calendar Summary:', {
      totalTeachingDays: calendarSummary.totalTeachingDays,
      dateRange: calendarSummary.dateRange,
      lessonsPerSubject: calendarSummary.lessonsPerSubject
    });

    // Test 3: Test start next unit for Arts visuels (we know this has lessons)
    console.log('\n🎨 Test 3: Starting next unit for Arts visuels...');
    try {
      const artsResult = await schedulerService.scheduleNextUnit('Arts visuels', EMILY_USER_ID);
      console.log('Arts Unit Result:', {
        unitTitle: artsResult.unitTitle,
        subject: artsResult.subject,
        lessonsScheduled: artsResult.lessonsScheduled,
        dateRange: artsResult.dateRange,
        sampleUpdates: artsResult.updates.slice(0, 3) // Show first 3 updates
      });
    } catch (error) {
      console.log('Arts scheduling result:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Get unit and lesson counts by subject
    console.log('\n📚 Test 4: Getting unit and lesson counts by subject...');
    const subjects = [
      'Français (Immersion)',
      'Mathématiques', 
      'Sciences de la nature',
      'Arts visuels',
      'Sciences humaines',
      'Formation personnelle et sociale'
    ];

    for (const subject of subjects) {
      const units = await prisma.unitPlan.count({
        where: {
          userId: EMILY_USER_ID,
          longRangePlan: {
            subject
          }
        }
      });

      const lessons = await prisma.eTFOLessonPlan.count({
        where: {
          userId: EMILY_USER_ID,
          subject
        }
      });

      const scheduledLessons = await prisma.eTFOLessonPlan.count({
        where: {
          userId: EMILY_USER_ID,
          subject,
          date: {
            not: null
          }
        }
      });

      console.log(`${subject}: ${units} units, ${lessons} lessons (${scheduledLessons} scheduled)`);
    }

    // Test 5: Test comprehensive scheduling (only if there are many unscheduled lessons)
    if (initialStats.unscheduled > 100) {
      console.log('\n🌟 Test 5: Testing comprehensive lesson scheduling...');
      console.log('WARNING: This will schedule ALL unscheduled lessons. Proceeding in 3 seconds...');
      
      // Wait 3 seconds to allow cancellation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const comprehensiveResult = await schedulerService.scheduleAllLessons(EMILY_USER_ID);
      console.log('Comprehensive Scheduling Result:', {
        totalLessonsScheduled: comprehensiveResult.totalLessonsScheduled,
        unitsProcessed: comprehensiveResult.unitResults.length,
        summary: comprehensiveResult.summary
      });
    } else {
      console.log('\n🌟 Test 5: Skipping comprehensive scheduling (not many unscheduled lessons)');
    }

    // Test 6: Final statistics
    console.log('\n📊 Test 6: Final scheduling statistics...');
    const finalStats = await schedulerService.getSchedulingStats(EMILY_USER_ID);
    console.log('Final Stats:', {
      total: finalStats.total,
      scheduled: finalStats.scheduled,
      unscheduled: finalStats.unscheduled,
      completionPercentage: finalStats.completionPercentage
    });

    console.log('\n✅ Scheduling system test completed successfully!');

  } catch (error) {
    console.error('\n❌ Scheduling system test failed:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSchedulingSystem();