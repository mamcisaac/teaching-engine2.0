#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Emily's user ID
const EMILY_USER_ID = 23;
// UnitPlan ID for impression motifs
const UNIT_PLAN_ID = 'cmf43u3s8004pvj9tvo44st5a';

interface Lesson {
  lessonNumber: number;
  lessonType: string;
  title: string;
  oneGoal: string;
  duration: number;
  keyVocabulary: any[];
  opening: {
    duration: number;
    activity: string;
    materials: string[];
    visualSupports: string;
    decisionPoints: any[];
    movementBreaks: any[];
  };
  main: {
    duration: number;
    activity: string;
    materials: any[];
    visualSupports: string;
    decisionPoints: any[];
    movementBreaks: any[];
  };
  closing: {
    duration: number;
    activity: string;
    materials: any[];
    visualSupports: string;
    decisionPoints: any[];
    movementBreaks: any[];
  };
  differentiation: {
    pourDifficultés: string[];
    pourAvancés: any[];
    pourLangue: any[];
    pourPEI: any[];
  };
  assessmentCriteria: {
    observable: string[];
    checkpoints: string[];
  };
}

interface LessonData {
  unitTitle: string;
  subject: string;
  grade: string;
  totalLessons: number;
  coreCount: number;
  extensionCount: number;
  lessons: Lesson[];
}

async function main() {
  console.log('🎨 Starting import of missing impression motifs lessons...');

  // Load the lesson data
  const lessonFilePath = join(__dirname, '../../generated-lessons/arts-visuels/impression-motifs-full.json');
  const lessonData: LessonData = JSON.parse(readFileSync(lessonFilePath, 'utf-8'));

  console.log(`📚 Found ${lessonData.lessons.length} lessons in source file`);

  // Check current lessons in database
  const existingLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      unitPlanId: UNIT_PLAN_ID,
      userId: EMILY_USER_ID
    },
    select: {
      id: true,
      title: true,
      titleFr: true
    }
  });

  console.log(`🔍 Found ${existingLessons.length} existing lessons in database`);
  existingLessons.forEach(lesson => {
    console.log(`  - ${lesson.titleFr || lesson.title}`);
  });

  // Determine which lessons need to be imported (skip lesson 1 as it already exists)
  const lessonsToImport = lessonData.lessons.slice(1); // Skip first lesson (index 0)
  
  console.log(`📝 Need to import ${lessonsToImport.length} lessons (lessons 2-14)`);

  // Base date for scheduling (we'll use a temporary date, proper scheduling comes later)
  const baseDate = new Date('2025-01-15'); // Temporary date

  // Import each missing lesson
  for (let i = 0; i < lessonsToImport.length; i++) {
    const lesson = lessonsToImport[i];
    const lessonDate = new Date(baseDate);
    lessonDate.setDate(baseDate.getDate() + i); // Spread lessons across consecutive days temporarily

    console.log(`📖 Importing lesson ${lesson.lessonNumber}: ${lesson.title}`);

    try {
      const newLesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: EMILY_USER_ID,
          title: lesson.title,
          titleFr: lesson.title, // French title same as regular title in this case
          unitPlanId: UNIT_PLAN_ID,
          date: lessonDate,
          slotNumber: 4, // Arts is typically slot 4 in Emily's schedule
          duration: lesson.duration,
          learningGoals: lesson.oneGoal,
          learningGoalsFr: lesson.oneGoal,
          mindsOn: lesson.opening.activity,
          mindsOnFr: lesson.opening.activity,
          action: lesson.main.activity,
          actionFr: lesson.main.activity,
          consolidation: lesson.closing.activity,
          consolidationFr: lesson.closing.activity,
          materials: {
            opening: lesson.opening.materials,
            main: lesson.main.materials || [],
            closing: lesson.closing.materials || []
          },
          accommodations: {
            pourDifficultés: lesson.differentiation.pourDifficultés,
            pourAvancés: lesson.differentiation.pourAvancés,
            pourLangue: lesson.differentiation.pourLangue,
            pourPEI: lesson.differentiation.pourPEI
          },
          assessmentType: 'formative',
          assessmentNotes: JSON.stringify({
            observable: lesson.assessmentCriteria.observable,
            checkpoints: lesson.assessmentCriteria.checkpoints
          }),
          grade: 1,
          subject: 'Arts visuels',
          language: 'fr',
          isSubFriendly: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Created lesson ${lesson.lessonNumber}: ${newLesson.id}`);

    } catch (error) {
      console.error(`❌ Failed to import lesson ${lesson.lessonNumber}:`, error);
    }
  }

  // Verify the import
  const finalCount = await prisma.eTFOLessonPlan.count({
    where: {
      unitPlanId: UNIT_PLAN_ID,
      userId: EMILY_USER_ID
    }
  });

  console.log(`🎯 Import complete! Total lessons in unit: ${finalCount}/14`);
  
  if (finalCount === 14) {
    console.log('✅ All lessons successfully imported!');
  } else {
    console.log(`⚠️  Expected 14 lessons, found ${finalCount}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);