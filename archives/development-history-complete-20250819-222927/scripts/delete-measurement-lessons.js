#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function deleteMeasurementLessons() {
  console.log('🗑️  DELETING POOR QUALITY MEASUREMENT EXPLORATION LESSONS');
  console.log('Removing 26 lessons scoring 50% quality');
  console.log('Critical issues: Wrong ETFO structure, missing differentiation, poor assessment');
  console.log('==========================================================');

  const unitPlanId = 'cmectx0p2000pvj4pyw3hgsbz';
  
  try {
    // Get all lessons for this unit
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unitPlanId
      },
      select: {
        id: true,
        title: true,
        date: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${lessons.length} lessons to delete`);
    console.log('');

    let deletedCount = 0;
    
    for (const lesson of lessons) {
      try {
        // Delete related records first
        await prisma.eTFOLessonPlanExpectation.deleteMany({
          where: { lessonPlanId: lesson.id }
        });
        
        await prisma.eTFOLessonPlanResource.deleteMany({
          where: { lessonPlanId: lesson.id }
        });
        
        await prisma.activityImport.deleteMany({
          where: { lessonPlanId: lesson.id }
        });
        
        await prisma.daybookEntry.deleteMany({
          where: { lessonPlanId: lesson.id }
        });
        
        // Now delete the lesson
        await prisma.eTFOLessonPlan.delete({
          where: { id: lesson.id }
        });
        
        console.log(`✅ Deleted: ${lesson.title} (${lesson.date.toDateString()})`);
        deletedCount++;
        
      } catch (error) {
        console.log(`⚠️  Could not delete: ${lesson.title} - ${error.message}`);
      }
    }
    
    console.log('');
    console.log('🧹 CLEANUP COMPLETE');
    console.log(`✅ Successfully deleted: ${deletedCount} lessons`);
    console.log(`❌ Failed to delete: ${lessons.length - deletedCount} lessons`);
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('1. Create perfect Measurement Exploration lessons');
    console.log('2. Target: 20 lessons over 4 weeks (January)');
    console.log('3. Focus: Length, mass, capacity, time, temperature');
    console.log('4. All lessons must score 95%+ on review');
    
  } catch (error) {
    console.error('❌ Error during deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteMeasurementLessons().catch(console.error);