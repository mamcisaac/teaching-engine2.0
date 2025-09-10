#!/usr/bin/env npx tsx
/**
 * Fix Lesson Timestamp Migration
 * 
 * This script updates all lesson timestamps from 3 AM UTC (midnight Atlantic) 
 * to 3 PM UTC (noon Atlantic) to prevent timezone display issues.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLessonTimestamps() {
  console.log('🔧 Starting lesson timestamp fix...');
  
  try {
    // Get all lessons
    const lessons = await prisma.eTFOLessonPlan.findMany({
      select: {
        id: true,
        title: true,
        date: true
      }
    });
    
    console.log(`📚 Found ${lessons.length} lessons to update`);
    
    let updatedCount = 0;
    const batchSize = 50;
    
    // Process in batches for better performance
    for (let i = 0; i < lessons.length; i += batchSize) {
      const batch = lessons.slice(i, i + batchSize);
      
      // Update each lesson in the batch
      const updates = batch.map(lesson => {
        // Convert the stored timestamp (milliseconds) to a Date
        const currentDate = new Date(Number(lesson.date));
        
        // Set the time to 15:00:00 UTC (3 PM UTC = noon Atlantic)
        currentDate.setUTCHours(15, 0, 0, 0);
        
        // Convert back to BigInt for storage
        const newTimestamp = BigInt(currentDate.getTime());
        
        return prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: newTimestamp }
        });
      });
      
      // Execute all updates in the batch
      await Promise.all(updates);
      
      updatedCount += batch.length;
      console.log(`✅ Updated ${updatedCount}/${lessons.length} lessons`);
    }
    
    // Verify the fix with a sample
    const sampleLessons = await prisma.eTFOLessonPlan.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        date: true
      }
    });
    
    console.log('\n📋 Sample of updated lessons:');
    sampleLessons.forEach(lesson => {
      const date = new Date(Number(lesson.date));
      console.log(`  - ${lesson.title}: ${date.toISOString()} (UTC ${date.getUTCHours()}:00)`);
    });
    
    console.log('\n✨ Timestamp fix complete! All lessons now set to noon Atlantic time.');
    
  } catch (error) {
    console.error('❌ Error fixing timestamps:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixLessonTimestamps().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});