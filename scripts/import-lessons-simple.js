#!/usr/bin/env node

/**
 * Simplified import for lesson plans to database
 * Maps our generated JSON structure to the actual database schema
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function importLessons() {
  console.log('📚 Importing Lessons to Database');
  console.log('=' + '='.repeat(40));
  
  try {
    // Read the improved lessons file
    const filePath = path.join(__dirname, '..', 'bienvenue-unit-IMPROVED.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Get user
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'emily.mcisaac@example.com' },
          { email: 'emilyangela.mcisaac@edu.pe.ca' }
        ]
      }
    });
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    // Get unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        userId: user.id,
        title: 'Bienvenue en français'
      }
    });
    
    if (!unitPlan) {
      console.error('❌ Unit plan not found');
      return;
    }
    
    console.log('Found unit:', unitPlan.title);
    console.log('User:', user.email);
    
    // Check for existing lessons
    const existingCount = await prisma.eTFOLessonPlan.count({
      where: { unitPlanId: unitPlan.id }
    });
    
    if (existingCount > 0) {
      console.log(`⚠️ Deleting ${existingCount} existing lessons first...`);
      await prisma.eTFOLessonPlan.deleteMany({
        where: { unitPlanId: unitPlan.id }
      });
    }
    
    // Import each lesson
    const lessons = data.lessons || [];
    console.log(`\nImporting ${lessons.length} lessons...`);
    
    let baseDate = new Date('2025-09-03'); // Unit start date
    
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      
      // Calculate date (skip weekends)
      const lessonDate = new Date(baseDate);
      lessonDate.setDate(baseDate.getDate() + Math.floor(i * 1.4)); // Roughly account for weekends
      
      // Format vocabulary for storage
      const vocabularyText = lesson.vocabulary 
        ? Object.entries(lesson.vocabulary).map(([word, pronunciation]) => 
            `${word} (${pronunciation})`
          ).join(', ')
        : '';
      
      // Format assessment as string
      const assessmentText = lesson.assessmentChecklist 
        ? lesson.assessmentChecklist.join('\n')
        : '';
      
      // Create the lesson
      const createdLesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: user.id,
          unitPlanId: unitPlan.id,
          title: lesson.title || `Lesson ${i + 1}`,
          date: lessonDate,
          duration: 45,
          
          // Three-part lesson as strings
          mindsOn: lesson.mindsOn 
            ? `${lesson.mindsOn.activity} (${lesson.mindsOn.duration || '~8 min'})`
            : `Opening (8 min): ${lesson.simpleActivities || 'Activation activity'}`,
          action: lesson.action
            ? lesson.action.activities.join('; ')
            : `Main Activity (27 min): ${lesson.simpleActivities || 'Core learning activity'}`,
          consolidation: lesson.consolidation
            ? `${lesson.consolidation.activity} - ${lesson.consolidation.assessmentChecklist?.join(', ') || 'Reflection'}`
            : `Closing (10 min): Reflection and assessment`,
          
          // Learning goals
          learningGoals: lesson.oneGoal || 'Students will engage with French language',
          
          // Materials as JSON
          materials: lesson.materials || ['Classroom materials'],
          
          // Grouping
          grouping: 'Flexible grouping based on student needs',
          
          // Assessment
          assessmentType: 'Formative',
          assessmentNotes: assessmentText,
          
          // Substitute friendly
          isSubFriendly: true,
          subNotes: lesson.emergencyBackup || 'Follow main plan with visual supports',
          
          // Additional fields
          grade: 1,
          language: 'French',
          subject: 'Français (Immersion)',
          
          // Differentiation as JSON
          accommodations: {
            pronunciation: vocabularyText,
            decisionPoints: lesson.threeDecisionPoints || {}
          },
          
          // Engagement hooks
          engagementHooks: {
            vocabulary: lesson.vocabulary || {}
          }
        }
      });
      
      process.stdout.write('.');
    }
    
    console.log('\n✅ Import complete!');
    
    // Verify
    const finalCount = await prisma.eTFOLessonPlan.count({
      where: { unitPlanId: unitPlan.id }
    });
    
    console.log(`\n📊 Results:`);
    console.log(`- Unit: ${unitPlan.title}`);
    console.log(`- Lessons imported: ${finalCount}`);
    console.log(`- Database now has lessons for this unit!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

importLessons().catch(console.error);