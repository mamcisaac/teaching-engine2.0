#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryArtsLessons() {
  try {
    // Query Arts lessons for Emily (User ID 23)
    const artsLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlan: {
          longRangePlan: {
            userId: 23,
            subject: 'Arts visuels'
          }
        }
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      },
      orderBy: [
        { unitPlan: { title: 'asc' } },
        { date: 'asc' }
      ]
    });

    console.log('=== ARTS VISUELS LESSONS FOR EMILY (User ID 23) ===');
    console.log('Total lessons found:', artsLessons.length);
    console.log('');

    // Group by unit
    const unitGroups = artsLessons.reduce((acc: any, lesson: any) => {
      const unitTitle = lesson.unitPlan.title;
      if (!acc[unitTitle]) {
        acc[unitTitle] = [];
      }
      acc[unitTitle].push(lesson);
      return acc;
    }, {});

    console.log('=== UNITS BREAKDOWN ===');
    Object.entries(unitGroups).forEach(([unitTitle, lessons]: [string, any]) => {
      console.log(`\nUnit: ${unitTitle}`);
      console.log(`Lessons: ${lessons.length}`);
      console.log('Unit ID:', lessons[0]?.unitPlan?.id);
      console.log('Unit Description:', lessons[0]?.unitPlan?.description?.substring(0, 100) + '...');
      
      console.log('\nFirst 5 lessons:');
      lessons.slice(0, 5).forEach((lesson: any, index: number) => {
        console.log(`  ${index + 1}. ${lesson.title} (${lesson.titleFr})`);
        console.log(`     Date: ${lesson.date?.toDateString()}`);
        console.log(`     MindsOn: ${lesson.mindsOn?.substring(0, 80)}...`);
        console.log(`     Materials: ${lesson.materials ? JSON.stringify(lesson.materials).substring(0, 100) : 'Not specified'}`);
        console.log(`     Assessment: ${lesson.assessmentNotes || 'Not specified'}`);
        console.log(`     Duration: ${lesson.duration} mins`);
        console.log('');
      });
    });

    // Show detailed sample of one lesson
    if (artsLessons.length > 0) {
      console.log('\n=== DETAILED SAMPLE LESSON ===');
      const sampleLesson = artsLessons[0];
      console.log(`Title: ${sampleLesson.title}`);
      console.log(`French Title: ${sampleLesson.titleFr}`);
      console.log(`MindsOn: ${sampleLesson.mindsOn}`);
      console.log(`Action: ${sampleLesson.action}`);
      console.log(`Consolidation: ${sampleLesson.consolidation}`);
      console.log(`Materials: ${sampleLesson.materials ? JSON.stringify(sampleLesson.materials, null, 2) : 'Not specified'}`);
      console.log(`Assessment Notes: ${sampleLesson.assessmentNotes || 'Not specified'}`);
      console.log(`Assessment Type: ${sampleLesson.assessmentType || 'Not specified'}`);
      console.log(`Differentiation Strategies: ${sampleLesson.differentiationStrategies ? JSON.stringify(sampleLesson.differentiationStrategies, null, 2) : 'Not specified'}`);
      console.log(`Learning Goals: ${sampleLesson.learningGoals || 'Not specified'}`);
    }

    // Check if content is template-based
    console.log('\n=== TEMPLATE ANALYSIS ===');
    const templatePatterns = artsLessons.filter(lesson => 
      !lesson.materials || 
      Object.keys(lesson.materials).length === 0 ||
      !lesson.assessmentNotes ||
      lesson.assessmentNotes === 'Not specified' ||
      JSON.stringify(lesson.materials)?.includes('Various art supplies') ||
      lesson.assessmentNotes?.includes('Observation') ||
      !lesson.differentiationStrategies ||
      Object.keys(lesson.differentiationStrategies || {}).length === 0
    );
    
    console.log(`Lessons with template/generic content: ${templatePatterns.length} out of ${artsLessons.length}`);
    if (templatePatterns.length > 0) {
      console.log('These lessons need individualization:');
      templatePatterns.slice(0, 10).forEach(lesson => {
        console.log(`  - ${lesson.title} (Unit: ${lesson.unitPlan.title})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryArtsLessons();