#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkCurriculumExpectations() {
  console.log('🔗 LINKING CURRICULUM EXPECTATIONS TO LESSONS\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get all expectations and lessons
  const expectations = await prisma.curriculumExpectation.findMany({
    orderBy: [{ subject: 'asc' }, { code: 'asc' }]
  });
  
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id },
    include: {
      expectations: true
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${expectations.length} curriculum expectations`);
  console.log(`Found ${lessons.length} lessons`);
  
  // Organize expectations by subject
  const expectationsBySubject: Record<string, any[]> = {};
  expectations.forEach(e => {
    if (!expectationsBySubject[e.subject]) expectationsBySubject[e.subject] = [];
    expectationsBySubject[e.subject].push(e);
  });

  console.log('\nExpectations by subject:');
  Object.entries(expectationsBySubject).forEach(([subject, exps]) => {
    console.log(`  ${subject}: ${exps.length} expectations`);
  });

  let linked = 0;
  const linkingRules = {
    'Français langue première': [
      // Communication expectations
      { keywords: ['speaking', 'oral', 'communication', 'parler', 'écouter'], priority: 1 },
      { keywords: ['reading', 'lecture', 'lire'], priority: 2 },
      { keywords: ['writing', 'écriture', 'écrire'], priority: 3 },
      { keywords: ['vocabulary', 'vocabulaire', 'mots'], priority: 1 }
    ],
    'Mathématiques': [
      // Number and operations
      { keywords: ['number', 'nombre', 'count', 'compter', 'addition'], priority: 1 },
      { keywords: ['pattern', 'régularité', 'suite'], priority: 2 },
      { keywords: ['geometry', 'géométrie', 'shape', 'forme'], priority: 2 },
      { keywords: ['measurement', 'mesure'], priority: 3 }
    ],
    'Sciences de la nature': [
      // Science processes
      { keywords: ['observe', 'observer', 'investigation', 'explore'], priority: 1 },
      { keywords: ['living', 'vivant', 'animal', 'plant'], priority: 2 },
      { keywords: ['energy', 'énergie', 'force', 'movement'], priority: 2 },
      { keywords: ['matter', 'matière', 'material'], priority: 3 }
    ],
    'Arts': [
      { keywords: ['create', 'créer', 'expression', 'visual'], priority: 1 },
      { keywords: ['technique', 'skill', 'habileté'], priority: 2 },
      { keywords: ['communicate', 'communiquer', 'share'], priority: 2 }
    ]
  };

  // Link expectations to lessons based on content matching
  for (const lesson of lessons) {
    if (!lesson.subject) continue;
    
    // Skip if lesson already has expectations linked
    if (lesson.expectations.length > 0) {
      console.log(`⏭️  ${lesson.titleFr}: Already has ${lesson.expectations.length} expectations`);
      continue;
    }

    const subjectExpectations = expectationsBySubject[lesson.subject] || [];
    if (subjectExpectations.length === 0) {
      console.log(`⚠️  ${lesson.titleFr}: No expectations for subject ${lesson.subject}`);
      continue;
    }

    // Find matching expectations based on lesson content
    const matchingExpectations: Array<{expectation: any, score: number}> = [];
    
    for (const expectation of subjectExpectations) {
      let score = 0;
      const lessonContent = `${lesson.title} ${lesson.titleFr} ${lesson.learningGoals || ''} ${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
      
      // Check against linking rules
      const rules = linkingRules[lesson.subject] || [];
      for (const rule of rules) {
        for (const keyword of rule.keywords) {
          if (lessonContent.includes(keyword.toLowerCase()) || 
              expectation.description.toLowerCase().includes(keyword.toLowerCase())) {
            score += rule.priority;
          }
        }
      }
      
      // Additional scoring based on description matching
      const expectationWords = expectation.description.toLowerCase().split(' ');
      const lessonWords = lessonContent.split(' ');
      
      for (const word of expectationWords) {
        if (word.length > 4 && lessonWords.includes(word)) {
          score += 1;
        }
      }
      
      if (score > 0) {
        matchingExpectations.push({ expectation, score });
      }
    }

    // Sort by score and take top matches
    matchingExpectations.sort((a, b) => b.score - a.score);
    const topMatches = matchingExpectations.slice(0, 2); // Link up to 2 expectations per lesson

    // If no matches found, link a general expectation for the subject
    if (topMatches.length === 0 && subjectExpectations.length > 0) {
      topMatches.push({ 
        expectation: subjectExpectations[0], // Use first available expectation
        score: 0 
      });
    }

    // Create the links
    for (const match of topMatches) {
      try {
        // Check if link already exists to avoid duplicates
        const existingLink = await prisma.eTFOLessonPlanExpectation.findUnique({
          where: {
            lessonPlanId_expectationId: {
              lessonPlanId: lesson.id,
              expectationId: match.expectation.id
            }
          }
        });

        if (!existingLink) {
          await prisma.eTFOLessonPlanExpectation.create({
            data: {
              lessonPlanId: lesson.id,
              expectationId: match.expectation.id
            }
          });
          
          linked++;
          console.log(`✅ Linked ${lesson.titleFr}: ${match.expectation.code} (score: ${match.score})`);
        }
      } catch (error) {
        console.error(`❌ Failed to link ${lesson.titleFr} to ${match.expectation.code}:`, error);
      }
    }
  }

  // Check final coverage
  const finalCoverage = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id },
    select: {
      expectations: {
        select: {
          expectationId: true
        }
      }
    }
  });
  
  const uniqueExpectationIds = new Set();
  finalCoverage.forEach(lesson => {
    lesson.expectations.forEach(exp => {
      uniqueExpectationIds.add(exp.expectationId);
    });
  });

  console.log(`\n📊 RESULTS:`);
  console.log(`New links created: ${linked}`);
  console.log(`Total unique expectations now covered: ${uniqueExpectationIds.size}/${expectations.length}`);
  console.log(`Coverage: ${Math.round((uniqueExpectationIds.size / expectations.length) * 100)}%`);

  await prisma.$disconnect();
  
  return {
    linked,
    totalExpectations: expectations.length,
    uniqueCoverage: uniqueExpectationIds.size
  };
}

linkCurriculumExpectations()
  .then((result) => {
    console.log(`\n✅ Curriculum linking complete: ${result.linked} new links`);
    process.exit(result.uniqueCoverage >= 20 ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Linking failed:', error);
    process.exit(1);
  });