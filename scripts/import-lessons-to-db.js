#!/usr/bin/env node

/**
 * Import JSON lesson plans into database
 * Handles all version-controlled lesson files and future additions
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

/**
 * Maps JSON lesson structure to database schema
 */
function mapLessonToDBSchema(lesson, unitPlanId, userId, lessonNumber) {
  // Extract materials list
  const materials = Array.isArray(lesson.materials) 
    ? lesson.materials 
    : lesson.simpleActivities?.materials || ['Classroom materials'];

  // Extract assessment from checklist
  const assessmentMethods = lesson.assessmentChecklist 
    ? { formative: lesson.assessmentChecklist }
    : { formative: ['Observation', 'Participation check'] };

  // Map decision points to differentiation
  const differentiation = {
    forStruggling: [],
    forAdvanced: [],
    forELL: [],
    forIEP: []
  };

  if (lesson.threeDecisionPoints) {
    // Extract differentiation from decision points
    if (lesson.threeDecisionPoints.comprehension) {
      const comp = lesson.threeDecisionPoints.comprehension;
      if (comp.includes('If confused')) {
        differentiation.forStruggling.push('Additional visual support and repetition');
      }
      if (comp.includes('If understanding')) {
        differentiation.forAdvanced.push('Extended vocabulary and complex tasks');
      }
    }
    if (lesson.threeDecisionPoints.problems) {
      differentiation.forIEP.push('Flexible participation options');
    }
    // All lessons support ELL through pronunciation guides
    differentiation.forELL.push('Pronunciation guides provided');
  }

  // Create success criteria from assessment checklist
  const successCriteria = lesson.assessmentChecklist || [
    'Students can recognize key vocabulary',
    'Students can participate in activities',
    'Students show engagement with content'
  ];

  // Build the lesson plan object
  return {
    unitPlanId,
    userId,
    lessonNumber: lessonNumber || lesson.lessonNumber || 1,
    title: lesson.title || `Lesson ${lessonNumber}`,
    date: new Date(), // Required field - will be updated later with actual schedule
    duration: 45, // Standard 45-minute lessons
    
    // Learning goals
    learningGoals: lesson.oneGoal || lesson.learningGoals || 'Students will engage with French language',
    successCriteria,
    
    // Three-part lesson structure
    mindsOn: {
      duration: 8,
      description: lesson.simpleActivities?.opening || 'Opening activity to activate prior knowledge',
      materials: materials.slice(0, 2),
      differentiation: {
        energy: lesson.threeDecisionPoints?.energy || 'Adapt to student energy levels'
      }
    },
    
    action: {
      duration: 27,
      activities: [
        {
          description: lesson.simpleActivities?.main || lesson.simpleActivities || 'Main learning activity',
          materials: materials,
          grouping: 'Flexible grouping based on needs'
        }
      ],
      differentiation
    },
    
    consolidation: {
      duration: 10,
      description: lesson.simpleActivities?.closing || 'Consolidation and reflection',
      assessmentMethods,
      nextSteps: lesson.progression || 'Continue building on learned concepts'
    },
    
    // Additional fields
    vocabulary: lesson.vocabulary || {},
    crossCurricularConnections: [],
    resources: materials,
    accommodationsModifications: {
      IEP: differentiation.forIEP,
      ELL: differentiation.forELL
    },
    reflectionNotes: '',
    
    // Emergency backup for substitutes
    substitutePlan: lesson.emergencyBackup || 'Follow main lesson plan with visual supports'
  };
}

/**
 * Import lessons from a JSON file
 */
async function importLessonFile(filePath, unitTitle) {
  try {
    console.log(`\nImporting: ${path.basename(filePath)}`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Get user (Emily)
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'emily.mcisaac@example.com' },
          { email: 'emilyangela.mcisaac@edu.pe.ca' }
        ]
      }
    });
    
    if (!user) {
      console.error('❌ User not found. Please ensure Emily\'s user account exists.');
      return 0;
    }
    
    // Find the unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        userId: user.id,
        title: unitTitle || 'Bienvenue en français'
      }
    });
    
    if (!unitPlan) {
      console.error(`❌ Unit plan "${unitTitle}" not found for user.`);
      return 0;
    }
    
    // Extract lessons array from different possible structures
    let lessons = [];
    if (Array.isArray(data)) {
      lessons = data;
    } else if (data.lessons && Array.isArray(data.lessons)) {
      lessons = data.lessons;
    } else if (data.unitLessons && Array.isArray(data.unitLessons)) {
      lessons = data.unitLessons;
    } else {
      // Single lesson object
      lessons = [data];
    }
    
    console.log(`  Found ${lessons.length} lessons to import`);
    
    // Check for existing lessons in this unit
    const existingCount = await prisma.eTFOLessonPlan.count({
      where: {
        unitPlanId: unitPlan.id
      }
    });
    
    if (existingCount > 0) {
      console.log(`  ⚠️  Unit already has ${existingCount} lessons. Skipping to avoid duplicates.`);
      return 0;
    }
    
    // Import each lesson
    let importedCount = 0;
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const lessonData = mapLessonToDBSchema(
        lesson, 
        unitPlan.id, 
        user.id, 
        i + 1
      );
      
      try {
        await prisma.eTFOLessonPlan.create({
          data: lessonData
        });
        importedCount++;
        process.stdout.write('.');
      } catch (error) {
        console.error(`\n  ❌ Failed to import lesson ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\n  ✅ Imported ${importedCount} lessons to database`);
    return importedCount;
    
  } catch (error) {
    console.error(`❌ Error importing ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Find all lesson JSON files in the repository
 */
async function findLessonFiles() {
  const lessonFiles = [];
  const rootDir = path.join(__dirname, '..');
  
  // Known lesson file patterns
  const patterns = [
    'bienvenue-unit-IMPROVED.json',
    'bienvenue-unit-lessons.json',
    '*-unit-lessons.json',
    '*-lessons.json',
    'lessons/*.json'
  ];
  
  // Check root directory
  const rootFiles = await fs.readdir(rootDir);
  for (const file of rootFiles) {
    if (file.includes('unit') && file.endsWith('.json') && 
        !file.includes('progression-map')) {
      lessonFiles.push({
        path: path.join(rootDir, file),
        unitTitle: extractUnitTitle(file)
      });
    }
  }
  
  // Check lessons directory if it exists
  const lessonsDir = path.join(rootDir, 'lessons');
  try {
    const lessonDirFiles = await fs.readdir(lessonsDir);
    for (const file of lessonDirFiles) {
      if (file.endsWith('.json')) {
        lessonFiles.push({
          path: path.join(lessonsDir, file),
          unitTitle: extractUnitTitle(file)
        });
      }
    }
  } catch (error) {
    // Lessons directory doesn't exist yet
  }
  
  return lessonFiles;
}

/**
 * Extract unit title from filename
 */
function extractUnitTitle(filename) {
  // Handle different naming patterns
  if (filename.includes('bienvenue')) {
    return 'Bienvenue en français';
  }
  if (filename.includes('math') || filename.includes('nombres')) {
    return 'Fondations des nombres';
  }
  if (filename.includes('science') || filename.includes('scientifiques')) {
    return 'Petits scientifiques sécuritaires';
  }
  // Default to extracting from filename
  const match = filename.match(/(.+)-unit/);
  return match ? match[1].replace(/-/g, ' ') : 'Bienvenue en français';
}

/**
 * Main import function
 */
async function main() {
  console.log('📚 LESSON IMPORT TOOL');
  console.log('=' + '='.repeat(40));
  
  try {
    // Find all lesson files
    const lessonFiles = await findLessonFiles();
    
    if (lessonFiles.length === 0) {
      console.log('No lesson files found to import.');
      return;
    }
    
    console.log(`Found ${lessonFiles.length} lesson file(s) to process:`);
    lessonFiles.forEach(f => console.log(`  - ${path.basename(f.path)}`));
    
    // Import each file
    let totalImported = 0;
    for (const file of lessonFiles) {
      const imported = await importLessonFile(file.path, file.unitTitle);
      totalImported += imported;
    }
    
    // Summary
    console.log('\n' + '='.repeat(41));
    console.log(`✅ IMPORT COMPLETE: ${totalImported} lessons added to database`);
    
    // Verify in database
    const user = await prisma.user.findFirst();
    if (user) {
      const dbLessonCount = await prisma.eTFOLessonPlan.count({
        where: { userId: user.id }
      });
      console.log(`📊 Total lessons in database: ${dbLessonCount}`);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { importLessonFile, findLessonFiles };