#!/usr/bin/env node

/**
 * Import missing impression motifs lessons
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./packages/database/prisma/teaching-engine.db'
    }
  }
});

async function main() {
  console.log('🎨 Importing missing impression motifs lessons...');
  
  try {
    // Load the impression motifs unit
    const unitPath = path.join(__dirname, 'generated-lessons/arts-visuels/impression-motifs-full.json');
    const unitData = JSON.parse(fs.readFileSync(unitPath, 'utf8'));
    
    console.log(`📖 Found unit: ${unitData.unitTitle} with ${unitData.totalLessons} lessons`);
    
    // Find Emily's user account
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily not found in database!');
    }
    
    console.log(`✅ Found Emily: ${emily.name} (ID: ${emily.id})`);
    
    // Find the Arts visuels unit plan
    const artUnit = await prisma.unitPlan.findFirst({
      where: {
        title: {
          contains: 'Impression'
        },
        longRangePlan: {
          subject: 'Arts visuels'
        }
      },
      include: {
        longRangePlan: true
      }
    });
    
    if (!artUnit) {
      throw new Error('Arts visuels Impression unit not found in database!');
    }
    
    console.log(`✅ Found unit plan: ${artUnit.title}`);
    
    // Check existing lessons
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: artUnit.id,
        userId: emily.id
      }
    });
    
    console.log(`📊 Found ${existingLessons.length} existing lessons, need ${unitData.totalLessons} total`);
    
    if (existingLessons.length >= unitData.totalLessons) {
      console.log('✅ All lessons already imported!');
      return;
    }
    
    // Import missing lessons
    let importedCount = 0;
    
    for (const lesson of unitData.lessons) {
      // Check if lesson already exists
      const existing = existingLessons.find(l => 
        l.titleFr === lesson.title || l.title === lesson.title
      );
      
      if (existing) {
        console.log(`⏭️  Skipping existing lesson: ${lesson.title}`);
        continue;
      }
      
      // Create the lesson
      const newLesson = await prisma.eTFOLessonPlan.create({
        data: {
          title: lesson.title,
          titleFr: lesson.title,
          learningGoals: lesson.oneGoal,
          learningGoalsFr: lesson.oneGoal,
          mindsOn: lesson.opening.activity,
          mindsOnFr: lesson.opening.activity,
          action: lesson.main.activity,
          actionFr: lesson.main.activity,
          consolidation: lesson.closing.activity,
          consolidationFr: lesson.closing.activity,
          materials: lesson.opening.materials || [],
          forStruggling: lesson.differentiation?.pourDifficultés?.join('; ') || null,
          forAdvanced: lesson.differentiation?.pourAvancés?.join('; ') || null,
          assessmentStrategies: lesson.assessmentCriteria?.observable?.join('; ') || null,
          successCriteria: lesson.assessmentCriteria?.checkpoints || [],
          duration: lesson.duration || 45,
          date: new Date('2024-09-03'), // Default date, will be scheduled later
          slotNumber: 1, // Default slot
          userId: emily.id,
          unitPlanId: artUnit.id,
          isSystem: false
        }
      });
      
      console.log(`✅ Created lesson ${lesson.lessonNumber}: ${lesson.title}`);
      importedCount++;
    }
    
    console.log(`🎉 Successfully imported ${importedCount} missing lessons!`);
    
  } catch (error) {
    console.error('❌ Error importing lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();