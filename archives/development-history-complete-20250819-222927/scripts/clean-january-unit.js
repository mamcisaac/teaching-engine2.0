#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function cleanJanuaryUnit() {
  console.log('🧹 CLEANING JANUARY WRITING PRACTICE UNIT');
  console.log('Deleting 24 misplaced lessons from wrong seasons');
  console.log('==============================================');

  // All 24 misplaced lesson IDs to delete
  const misplacedLessonIds = [
    // Family Theme Lessons (4)
    'cmeca1mwa0039vjta9tnt4lvz', // Family Photos (2025-09-30)
    'cmeca1mwb003bvjtatmy5o0by', // Family Stories (2025-10-03)
    'cmeca1mwc003dvjtascq8ilbs', // Describing Family (2025-10-07)
    'cmeca1mwd003fvjtalimb17b1', // Family Celebrations (2025-10-14)
    
    // Fall Celebrations Lessons (12)
    'cmeca1mwf003hvjta08ma5st7', // Fall Colors (2025-10-18)
    'cmeca1mwf003jvjtak7v2j5ys', // Autumn Leaves (2025-10-21)
    'cmeca1mwg003lvjtaqlfpk39s', // Harvest Time (2025-10-22)
    'cmeca1mwh003nvjtanroshyl7', // Thanksgiving (2025-10-25)
    'cmeca1mwi003pvjtapzq3bjf5', // Halloween Fun (2025-10-28)
    'cmeca1mwi003rvjtaib6wzebk', // Fall Weather (2025-10-29)
    'cmeca1mwj003tvjta47q0v7b1', // Autumn Animals (2025-11-01)
    'cmeca1mwk003vvjtah25shk5t', // Fall Foods (2025-11-04)
    'cmeca1mwl003xvjtanpiqnuqv', // Seasonal Changes (2025-11-05)
    'cmeca1mwl003zvjtaut0626yw', // Gratitude (2025-11-08)
    'cmeca1mwm0041vjtafarg2d16', // Fall Festivals (2025-11-11)
    'cmeca1mwn0043vjta0b5aofqm', // Preparing for Winter (2025-11-12)
    
    // Winter Theme Lessons (8)
    'cmeca1mwo0045vjta3up0dp8n', // Winter Weather (2025-12-03)
    'cmeca1mwp0047vjtafkxly66d', // Snow Activities (2025-12-06)
    'cmeca1mwq0049vjta763658gr', // Winter Animals (2025-12-10)
    'cmeca1mwr004bvjtazfwt599y', // Holiday Traditions (2025-12-16)
    'cmeca1mws004dvjtayca5w470', // Winter Clothing (2025-12-18)
    'cmeca1mws004fvjta00j3m7oe', // Cozy Winter Days (2025-12-23)
    'cmeca1mwt004hvjtaqh6m2dtr', // Winter Sports (2025-12-25)
    'cmeca1mwu004jvjtad5ok0l0n'  // Hot Chocolate Time (2025-12-30)
  ];

  console.log(`Found ${misplacedLessonIds.length} misplaced lessons to delete...`);
  
  let deletedCount = 0;
  let errorCount = 0;

  for (const lessonId of misplacedLessonIds) {
    try {
      // Delete related records first (due to foreign key constraints)
      await prisma.eTFOLessonPlanExpectation.deleteMany({
        where: {
          lessonPlanId: lessonId
        }
      });

      await prisma.eTFOLessonPlanResource.deleteMany({
        where: {
          lessonPlanId: lessonId
        }
      });

      await prisma.activityImport.deleteMany({
        where: {
          lessonPlanId: lessonId
        }
      });

      await prisma.daybookEntry.deleteMany({
        where: {
          lessonPlanId: lessonId
        }
      });

      // Now delete the lesson itself
      const deletedLesson = await prisma.eTFOLessonPlan.delete({
        where: {
          id: lessonId
        }
      });

      console.log(`✅ Deleted: ${deletedLesson.title} (${deletedLesson.date.toDateString()})`);
      deletedCount++;

    } catch (error) {
      console.log(`⚠️  Could not delete lesson ${lessonId}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('');
  console.log('🧹 CLEANUP SUMMARY:');
  console.log(`✅ Successfully deleted: ${deletedCount} misplaced lessons`);
  console.log(`⚠️  Errors encountered: ${errorCount} lessons`);
  console.log('');
  console.log('✅ January Writing Practice unit cleaned!');
  console.log('📝 Remaining: 3 correctly placed writing lessons');
  console.log('🔮 Next: Create additional January writing lessons for complete unit');
  
  await prisma.$disconnect();
}

cleanJanuaryUnit().catch(console.error);