#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as path from 'path';

// Database paths
const currentDbPath = path.resolve(process.cwd(), 'prisma/prisma/dev.db');
const backupDbPath = path.resolve(process.cwd(), 'backup-before-overhaul-20250815-095010/database-backup.db');

// Initialize Prisma clients
const currentDb = new PrismaClient({
  datasources: { db: { url: `file:${currentDbPath}` } }
});

const backupDb = new PrismaClient({
  datasources: { db: { url: `file:${backupDbPath}` } }
});

async function restoreAssessmentNotes() {
  console.log('🔄 RESTORING ASSESSMENT NOTES FROM BACKUP\n');
  
  // Get all lessons with detailed assessment notes from backup
  const backupLessons = await backupDb.eTFOLessonPlan.findMany({
    where: {
      NOT: [
        { assessmentNotes: null },
        { assessmentNotes: '' },
        { assessmentNotes: 'Observation continue' }
      ]
    },
    select: {
      id: true,
      title: true,
      assessmentNotes: true,
      assessmentType: true
    }
  });
  
  console.log(`📊 Found ${backupLessons.length} lessons with detailed assessment notes in backup\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches
  const batchSize = 50;
  for (let i = 0; i < backupLessons.length; i += batchSize) {
    const batch = backupLessons.slice(i, Math.min(i + batchSize, backupLessons.length));
    
    try {
      await Promise.all(
        batch.map(async (lesson) => {
          // Check if lesson exists in current DB
          const exists = await currentDb.eTFOLessonPlan.findUnique({
            where: { id: lesson.id }
          });
          
          if (exists) {
            // Update with assessment data from backup
            await currentDb.eTFOLessonPlan.update({
              where: { id: lesson.id },
              data: {
                assessmentNotes: lesson.assessmentNotes,
                assessmentType: lesson.assessmentType || 'formative'
              }
            });
          }
        })
      );
      
      successCount += batch.length;
      console.log(`  ✅ Restored ${successCount}/${backupLessons.length} assessments...`);
      
    } catch (error: any) {
      console.error(`  ❌ Error in batch: ${error.message}`);
      errorCount += batch.length;
    }
  }
  
  // Verify the restoration
  console.log('\n🔍 VERIFICATION:\n');
  
  const updatedStats = await currentDb.eTFOLessonPlan.groupBy({
    by: ['assessmentType'],
    _count: true
  });
  
  console.log('Assessment Type Distribution:');
  updatedStats.forEach(stat => {
    console.log(`  ${stat.assessmentType || 'null'}: ${stat._count} lessons`);
  });
  
  // Check assessment notes quality
  const detailedCount = await currentDb.eTFOLessonPlan.count({
    where: {
      NOT: [
        { assessmentNotes: null },
        { assessmentNotes: '' },
        { assessmentNotes: 'Observation continue' }
      ]
    }
  });
  
  const genericCount = await currentDb.eTFOLessonPlan.count({
    where: {
      assessmentNotes: 'Observation continue'
    }
  });
  
  console.log('\nAssessment Notes Quality:');
  console.log(`  Detailed: ${detailedCount} lessons`);
  console.log(`  Generic: ${genericCount} lessons`);
  console.log(`  Total: ${detailedCount + genericCount} lessons`);
  
  // Sample some restored assessments
  const samples = await currentDb.eTFOLessonPlan.findMany({
    where: {
      NOT: [
        { assessmentNotes: null },
        { assessmentNotes: '' },
        { assessmentNotes: 'Observation continue' }
      ]
    },
    take: 3,
    select: {
      title: true,
      assessmentNotes: true
    }
  });
  
  console.log('\n📚 Sample Restored Assessments:');
  samples.forEach(sample => {
    console.log(`\n  "${sample.title}":`);
    console.log(`    ${sample.assessmentNotes?.substring(0, 150)}...`);
  });
  
  console.log('\n✅ RESTORATION COMPLETE!');
  console.log(`  Successfully restored: ${successCount} assessments`);
  console.log(`  Errors: ${errorCount}`);
  
  await currentDb.$disconnect();
  await backupDb.$disconnect();
}

restoreAssessmentNotes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Restoration failed:', error);
    process.exit(1);
  });