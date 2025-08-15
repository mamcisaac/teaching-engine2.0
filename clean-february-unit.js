#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function cleanFebruaryUnit() {
  console.log('🧹 CLEANING FEBRUARY SPEAKING FOCUS UNIT');
  console.log('Deleting 27 poor quality lessons for perfect recreation');
  console.log('==================================================');

  // All 27 lesson IDs to delete
  const lessonIds = [
    // Magical Winter Theme (4 lessons)
    'cmeca1mwu004lvjtaw7e124t7', // Magical Winter: Winter Stories (Jan 2)
    'cmeca1mwv004nvjtac54e01b0', // Magical Winter: New Year Wishes (Jan 6)
    'cmeca1mww004pvjtal8uzbwun', // Magical Winter: Winter Safety (Jan 9)
    'cmeca1mwx004rvjtaivy3j3mq', // Magical Winter: Magical Winter (Jan 13)
    
    // Animal Friends Theme (11 lessons)
    'cmeca1mwy004tvjtaaqaqthfc', // Animal Friends: Farm Animals (Jan 20)
    'cmeca1mwz004vvjtae63jmkl5', // Animal Friends: Wild Animals (Jan 22)
    'cmeca1mx0004xvjta4widczwx', // Animal Friends: Pet Care (Jan 27)
    'cmeca1mx1004zvjta5w57xt1t', // Animal Friends: Animal Sounds (Jan 28)
    'cmeca1mx10051vjta1uxhqsig', // Animal Friends: Animal Homes (Jan 30)
    'cmecu2o7u000pvjji9s1fczjp', // French Conversation Practice (Feb 1)
    'cmecu2o7v000rvjji1rl44a5e', // French Pronunciation Games (Feb 1)
    'cmecu2o7v000tvjjiv2wwbz0m', // French Show and Tell (Feb 1)
    'cmeca1mx20053vjtay7n63awp', // Animal Friends: Baby Animals (Feb 3)
    'cmeca1mx30055vjtazqliu4kl', // Animal Friends: Animal Movements (Feb 5)
    'cmeca1mx40057vjtacce1ze0q', // Animal Friends: Animal Foods (Feb 7)
    'cmeca1mx50059vjtaqmnk0vvn', // Animal Friends: Helping Animals (Feb 10)
    'cmeca1mx5005bvjtalkhobubg', // Animal Friends: Zoo Animals (Feb 13)
    'cmeca1mx6005dvjtahzabp7rd', // Animal Friends: Ocean Animals (Feb 17)
    'cmeca1mx7005fvjtavtfcphjn', // Animal Friends: Forest Friends (Feb 18)
    
    // My Community Theme (8 lessons)
    'cmeca1mx8005hvjta0zkmu9ni', // My Community: Our Neighborhood (Feb 24)
    'cmeca1mx9005jvjtanujnd94v', // My Community: Community Helpers (Feb 26)
    'cmeca1mxa005lvjtadwz0dmfi', // My Community: Local Businesses (Mar 3)
    'cmeca1mxb005nvjta4xa41gii', // My Community: Parks and Places (Mar 4)
    'cmeca1mxb005pvjta2he0gb0t', // My Community: Getting Around (Mar 6)
    'cmeca1mxc005rvjta6zkmiy5w', // My Community: Community Events (Mar 9)
    'cmeca1mxd005tvjtaz93zaylk', // My Community: Helping Our Community (Mar 11)
    'cmeca1mxd005vvjta4ykendwa'  // My Community: Special Places (Mar 13)
  ];

  console.log(`Found ${lessonIds.length} lessons to delete...`);
  
  let deletedCount = 0;
  let errorCount = 0;

  for (const lessonId of lessonIds) {
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
  console.log('🧹 FEBRUARY CLEANUP SUMMARY:');
  console.log(`✅ Successfully deleted: ${deletedCount} poor quality lessons`);
  console.log(`⚠️  Errors encountered: ${errorCount} lessons`);
  console.log('');
  
  if (deletedCount >= 25) {
    console.log('✅ February Speaking Focus unit cleaned!');
    console.log('📝 Ready for: Perfect lesson creation with speaking focus');
    console.log('🎯 Target: 20 perfect lessons (Feb 1-28) with 100% quality');
    console.log('🗣️  Focus: Authentic French speaking practice and oral communication');
  } else {
    console.log('⚠️  Some lessons may need manual attention before proceeding');
  }
  
  await prisma.$disconnect();
}

cleanFebruaryUnit().catch(console.error);