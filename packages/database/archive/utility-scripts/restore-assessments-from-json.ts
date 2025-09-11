#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${path.resolve(process.cwd(), 'prisma/prisma/dev.db')}` } }
});

interface JsonLesson {
  lessonNumber: number;
  title: string;
  assessmentCriteria?: {
    observable?: string[];
    checkpoints?: string[];
  };
}

interface JsonUnit {
  unitTitle: string;
  subject: string;
  lessons: JsonLesson[];
}

// Map JSON subject names to database unit subjects
const subjectMap: Record<string, string> = {
  'Arts visuels': 'Arts visuels',
  'Français (Immersion)': 'Français (Immersion)',
  'Mathématiques': 'Mathématiques',
  'Sciences de la nature': 'Sciences de la nature',
  'Sciences humaines': 'Sciences humaines',
  'Formation personnelle et sociale': 'Formation personnelle et sociale'
};

// Map JSON unit titles to database unit titles (normalized)
const normalizeTitle = (title: string): string => {
  return title.toLowerCase()
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ç]/g, 'c')
    .replace(/[-\s]+/g, ' ')
    .trim();
};

async function restoreAssessments() {
  console.log('🔄 RESTORING ASSESSMENT DATA FROM JSON FILES\n');
  
  const generatedLessonsDir = path.resolve(process.cwd(), '../../generated-lessons');
  
  if (!fs.existsSync(generatedLessonsDir)) {
    console.error('❌ generated-lessons directory not found!');
    return;
  }
  
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  // Process each subject directory
  const subjects = fs.readdirSync(generatedLessonsDir);
  
  for (const subjectDir of subjects) {
    const subjectPath = path.join(generatedLessonsDir, subjectDir);
    
    if (!fs.statSync(subjectPath).isDirectory()) continue;
    
    console.log(`\n📂 Processing ${subjectDir}...`);
    
    // Find all *-full.json files
    const jsonFiles = fs.readdirSync(subjectPath)
      .filter(file => file.endsWith('-full.json'));
    
    for (const jsonFile of jsonFiles) {
      const filePath = path.join(subjectPath, jsonFile);
      
      try {
        const jsonData: JsonUnit = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Find matching unit in database
        const dbSubject = subjectMap[jsonData.subject];
        if (!dbSubject) {
          console.log(`  ⚠️ Unknown subject mapping: ${jsonData.subject}`);
          continue;
        }
        
        // Try to find unit by normalized title
        const normalizedJsonTitle = normalizeTitle(jsonData.unitTitle);
        
        const unit = await prisma.unitPlan.findFirst({
          where: {
            longRangePlan: {
              subject: dbSubject
            }
          },
          include: {
            longRangePlan: true
          }
        });
        
        // Find unit with closest matching title
        const units = await prisma.unitPlan.findMany({
          where: {
            longRangePlan: {
              subject: dbSubject
            }
          },
          include: {
            longRangePlan: true
          }
        });
        
        let matchedUnit = null;
        for (const u of units) {
          const normalizedDbTitle = normalizeTitle(u.title);
          if (normalizedDbTitle.includes(normalizedJsonTitle) || 
              normalizedJsonTitle.includes(normalizedDbTitle) ||
              normalizedDbTitle.split(' ').some(word => normalizedJsonTitle.includes(word))) {
            matchedUnit = u;
            break;
          }
        }
        
        if (!matchedUnit) {
          console.log(`  ⚠️ No unit match for: "${jsonData.unitTitle}" (${dbSubject})`);
          totalSkipped += jsonData.lessons.length;
          continue;
        }
        
        console.log(`  ✅ Matched unit: "${matchedUnit.title}"`);
        
        // Process each lesson in the JSON
        for (const jsonLesson of jsonData.lessons) {
          if (!jsonLesson.assessmentCriteria) {
            continue;
          }
          
          // Find lesson by unit and lesson number
          const dbLesson = await prisma.eTFOLessonPlan.findFirst({
            where: {
              unitPlanId: matchedUnit.id,
              lessonNumber: jsonLesson.lessonNumber
            }
          });
          
          if (!dbLesson) {
            console.log(`    ⚠️ No lesson #${jsonLesson.lessonNumber} in unit`);
            totalSkipped++;
            continue;
          }
          
          // Prepare assessment notes as JSON
          const assessmentNotes = JSON.stringify({
            observable: jsonLesson.assessmentCriteria.observable || [],
            checkpoints: jsonLesson.assessmentCriteria.checkpoints || []
          });
          
          // Update the lesson
          await prisma.eTFOLessonPlan.update({
            where: { id: dbLesson.id },
            data: {
              assessmentNotes,
              assessmentType: 'formative'
            }
          });
          
          totalUpdated++;
          
          if (totalUpdated % 50 === 0) {
            console.log(`    ✅ Updated ${totalUpdated} assessments...`);
          }
        }
        
      } catch (error: any) {
        console.error(`  ❌ Error processing ${jsonFile}: ${error.message}`);
        totalErrors++;
      }
    }
  }
  
  console.log('\n📊 RESTORATION COMPLETE:');
  console.log(`  ✅ Updated: ${totalUpdated} lessons`);
  console.log(`  ⚠️ Skipped: ${totalSkipped} lessons`);
  console.log(`  ❌ Errors: ${totalErrors} files`);
  
  // Verify the results
  console.log('\n🔍 VERIFICATION:');
  
  const detailedCount = await prisma.eTFOLessonPlan.count({
    where: {
      NOT: [
        { assessmentNotes: null },
        { assessmentNotes: '' },
        { assessmentNotes: 'Observation continue' }
      ]
    }
  });
  
  const genericCount = await prisma.eTFOLessonPlan.count({
    where: {
      assessmentNotes: 'Observation continue'
    }
  });
  
  const totalLessons = await prisma.eTFOLessonPlan.count();
  
  console.log(`  Detailed assessments: ${detailedCount}/${totalLessons} (${Math.round(detailedCount*100/totalLessons)}%)`);
  console.log(`  Generic assessments: ${genericCount}/${totalLessons}`);
  console.log(`  Empty/null: ${totalLessons - detailedCount - genericCount}/${totalLessons}`);
  
  await prisma.$disconnect();
}

restoreAssessments()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Restoration failed:', error);
    process.exit(1);
  });