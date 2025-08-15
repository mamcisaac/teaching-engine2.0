#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function cleanSpringUnit() {
  console.log('🌸 CLEANING SPRING LANGUAGE ARTS UNIT');
  console.log('Deleting 27 basic quality lessons for perfect recreation');
  console.log('===================================================');

  // All 27 lesson IDs to delete
  const lessonIds = [
    'cmecu2o7w000vvjjie29vcgj6', // Spring Vocabulary Review
    'cmecu2o7x000xvjjidb3rnm5e', // French Poetry Introduction
    'cmecu2o7x000zvjji7hun7yk8', // French Reading Fluency
    'cmeca1mxe005xvjtaxt6mlist', // My Community: Community Rules
    'cmeca1mxf005zvjta9rdz3ask', // My Community: Neighbors
    'cmeca1mxf0061vjtahxvqsdyc', // My Community: Community Safety
    'cmeca1mxg0063vjta788o84tg', // My Community: Making a Difference
    'cmeca1mxi0065vjtaqvqvn5ek', // Spring Blooms: Spring Flowers
    'cmeca1mxj0067vjtadgtlfsr3', // Spring Blooms: Growing Gardens
    'cmeca1mxj0069vjta6vgfgehk', // Spring Blooms: Baby Animals
    'cmeca1mxk006bvjtaj7jajw8f', // Spring Blooms: Spring Weather
    'cmeca1mxl006dvjta5g7g1ffj', // Spring Blooms: Easter Fun
    'cmeca1mxm006fvjtareulfd02', // Spring Blooms: Planting Seeds
    'cmeca1mxm006hvjtam7c6f3y8', // Spring Blooms: Spring Cleaning
    'cmeca1mxn006jvjta001zmcim', // Spring Blooms: Outdoor Adventures
    'cmeca1mxo006lvjtas82tjpb0', // Spring Blooms: Spring Colors
    'cmeca1mxo006nvjta09rylfa9', // Spring Blooms: New Beginnings
    'cmeca1mxp006pvjtadf2pcfhd', // Spring Blooms: Earth Day
    'cmeca1mxq006rvjtaninduakl', // Spring Blooms: Spring Celebrations
    'cmeca1mxr006tvjta4ib8xqda', // Celebrating Learning: Our Growth
    'cmeca1mxs006vvjtafmepgmnt', // Celebrating Learning: Learning Journey
    'cmeca1mxt006xvjta8qw8hhkg', // Celebrating Learning: Favorite Memories
    'cmeca1mxt006zvjtarrp88g32', // Celebrating Learning: New Skills
    'cmeca1mxu0071vjtaooylw6ro', // Celebrating Learning: Friendship Celebrations
    'cmeca1mxv0073vjta671qlcd1', // Celebrating Learning: Year-End Reflection
    'cmeca1mxw0075vjtaxew2no92', // Celebrating Learning: Summer Plans
    'cmeca1mxw0077vjta1sg0m3nr'  // Celebrating Learning: Graduation Prep
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
  console.log('🌸 SPRING CLEANUP SUMMARY:');
  console.log(`✅ Successfully deleted: ${deletedCount} basic quality lessons`);
  console.log(`⚠️  Errors encountered: ${errorCount} lessons`);
  console.log('');
  
  if (deletedCount >= 25) {
    console.log('✅ Spring Language Arts unit cleaned!');
    console.log('📝 Ready for: Perfect lesson creation with integrated language arts');
    console.log('🎯 Target: ~30-35 perfect lessons (March-April) with 100% quality');
    console.log('🌱 Focus: Spring themes, language arts integration, progressive skills');
    console.log('🔄 Following proven pattern: Delete → Create Perfect → Review → Commit');
  } else {
    console.log('⚠️  Some lessons may need manual attention before proceeding');
  }
  
  await prisma.$disconnect();
}

cleanSpringUnit().catch(console.error);