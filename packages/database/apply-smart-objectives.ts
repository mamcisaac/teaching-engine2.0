#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const databaseUrl = `file:${path.resolve(process.cwd(), 'prisma/prisma/dev.db')}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

interface ObjectiveUpdate {
  id: string;
  objectives: string;
}

async function applySmartObjectives() {
  console.log('📝 APPLYING SMART LEARNING OBJECTIVES\n');
  
  // Read the objectives file
  const objectivesPath = path.join(process.cwd(), 'smart-objectives.json');
  if (!fs.existsSync(objectivesPath)) {
    throw new Error('smart-objectives.json not found. Run generate-smart-objectives.ts first.');
  }
  
  const updates: ObjectiveUpdate[] = JSON.parse(fs.readFileSync(objectivesPath, 'utf-8'));
  console.log(`📊 Found ${updates.length} objectives to apply\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches for efficiency
  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, Math.min(i + batchSize, updates.length));
    
    try {
      // Update each lesson in the batch
      await Promise.all(
        batch.map(update =>
          prisma.eTFOLessonPlan.update({
            where: { id: update.id },
            data: { learningGoals: update.objectives }
          })
        )
      );
      
      successCount += batch.length;
      console.log(`  ✅ Updated ${successCount}/${updates.length} lessons...`);
      
    } catch (error: any) {
      console.error(`  ❌ Error in batch ${i/batchSize + 1}: ${error.message}`);
      errorCount += batch.length;
    }
  }
  
  console.log('\n📊 UPDATE RESULTS:');
  console.log(`  ✅ Successfully updated: ${successCount} lessons`);
  console.log(`  ❌ Errors: ${errorCount} lessons`);
  
  // Verify the updates
  console.log('\n🔍 Verifying objectives quality...\n');
  
  // Check how many still have generic objectives
  const genericCount = await prisma.eTFOLessonPlan.count({
    where: {
      learningGoals: 'Développer les compétences'
    }
  });
  
  // Sample some updated objectives
  const samples = await prisma.eTFOLessonPlan.findMany({
    where: {
      learningGoals: {
        not: 'Développer les compétences'
      }
    },
    take: 5,
    select: {
      title: true,
      learningGoals: true
    }
  });
  
  console.log('📚 Sample of Updated Objectives:');
  for (const sample of samples) {
    console.log(`\n  "${sample.title}":`);
    const objectives = sample.learningGoals?.split('; ') || [];
    objectives.forEach((obj, idx) => {
      console.log(`    ${idx + 1}. ${obj}`);
    });
  }
  
  // Final statistics
  const totalLessons = await prisma.eTFOLessonPlan.count();
  const withObjectives = totalLessons - genericCount;
  const percentage = ((withObjectives / totalLessons) * 100).toFixed(1);
  
  console.log('\n📈 FINAL STATISTICS:');
  console.log(`  Total lessons: ${totalLessons}`);
  console.log(`  With specific objectives: ${withObjectives} (${percentage}%)`);
  console.log(`  Still generic: ${genericCount}`);
  
  if (genericCount === 0) {
    console.log('\n🎉 PERFECT! All lessons now have specific learning objectives!');
  }
  
  await prisma.$disconnect();
}

applySmartObjectives()
  .then(() => {
    console.log('\n✅ Application complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Application failed:', error);
    process.exit(1);
  });