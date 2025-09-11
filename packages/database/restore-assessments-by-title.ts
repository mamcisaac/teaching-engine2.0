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

async function restoreAssessmentsByTitle() {
  console.log('🔄 RESTORING ASSESSMENT NOTES BY MATCHING TITLES\n');
  
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
      title: true,
      assessmentNotes: true,
      assessmentType: true
    }
  });
  
  console.log(`📊 Found ${backupLessons.length} lessons with detailed assessment notes in backup\n`);
  
  // Get all current lessons
  const currentLessons = await currentDb.eTFOLessonPlan.findMany({
    select: {
      id: true,
      title: true
    }
  });
  
  // Create title to ID map for current database
  const titleToId = new Map<string, string>();
  currentLessons.forEach(lesson => {
    titleToId.set(lesson.title, lesson.id);
  });
  
  let matchedCount = 0;
  let unmatchedCount = 0;
  let updateCount = 0;
  
  // Process each backup lesson
  for (const backupLesson of backupLessons) {
    const currentId = titleToId.get(backupLesson.title);
    
    if (currentId) {
      matchedCount++;
      
      try {
        await currentDb.eTFOLessonPlan.update({
          where: { id: currentId },
          data: {
            assessmentNotes: backupLesson.assessmentNotes,
            assessmentType: backupLesson.assessmentType || 'formative'
          }
        });
        updateCount++;
        
        if (updateCount % 50 === 0) {
          console.log(`  ✅ Updated ${updateCount} assessments...`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to update "${backupLesson.title}": ${error}`);
      }
    } else {
      unmatchedCount++;
      console.log(`  ⚠️ No match for: "${backupLesson.title}"`);
    }
  }
  
  console.log(`\n📊 MATCHING RESULTS:`);
  console.log(`  Matched by title: ${matchedCount}`);
  console.log(`  Unmatched: ${unmatchedCount}`);
  console.log(`  Successfully updated: ${updateCount}`);
  
  // Verify the restoration
  console.log('\n🔍 FINAL VERIFICATION:\n');
  
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
  
  console.log('Assessment Notes Quality:');
  console.log(`  Detailed: ${detailedCount} lessons`);
  console.log(`  Generic: ${genericCount} lessons`);
  console.log(`  Empty/null: ${970 - detailedCount - genericCount} lessons`);
  
  // Show breakdown by subject
  const subjectStats = await currentDb.$queryRaw<Array<{subject: string, count: bigint}>>`
    SELECT l.subject, COUNT(*) as count
    FROM ETFOLessonPlan e
    JOIN UnitPlan u ON e.unitPlanId = u.id
    JOIN LongRangePlan l ON u.longRangePlanId = l.id
    WHERE e.assessmentNotes IS NOT NULL 
    AND e.assessmentNotes != '' 
    AND e.assessmentNotes != 'Observation continue'
    GROUP BY l.subject
  `;
  
  console.log('\nDetailed Assessments by Subject:');
  subjectStats.forEach(stat => {
    console.log(`  ${stat.subject}: ${stat.count} lessons`);
  });
  
  console.log('\n✅ RESTORATION COMPLETE!');
  
  await currentDb.$disconnect();
  await backupDb.$disconnect();
}

restoreAssessmentsByTitle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Restoration failed:', error);
    process.exit(1);
  });