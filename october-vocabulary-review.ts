#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

interface ReviewCriteria {
  duration: boolean;
  modifications: boolean;
  assessmentNotes: boolean;
  indigenousPerspectives: boolean;
  vocabularyProgression: boolean;
  ageAppropriateness: boolean;
  etfoCompliance: boolean;
  octoberThemes: boolean;
}

interface LessonReview {
  lessonId: string;
  title: string;
  date: string;
  duration: number;
  criteria: ReviewCriteria;
  issues: string[];
  strengths: string[];
  score: number;
}

interface UnitReview {
  unitPlanId: string;
  unitTitle: string;
  lessonCount: number;
  lessons: LessonReview[];
  overallScore: number;
  majorIssues: string[];
  strengths: string[];
  readyForClassroom: boolean;
}

async function reviewOctoberVocabularyUnit(): Promise<UnitReview> {
  console.log('🔍 CRITICAL REVIEW: October Vocabulary Building Unit');
  console.log('=' .repeat(60));

  const unitPlanId = 'cmectx0ou0003vj4pp3dnticq';
  
  try {
    // Query the unit plan
    const unitPlan = await prisma.unitPlan.findUnique({
      where: {
        id: unitPlanId
      },
      include: {
        lessonPlans: {
          orderBy: {
            date: 'asc'
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        },
        longRangePlan: true
      }
    });

    if (!unitPlan) {
      throw new Error(`Unit plan with ID ${unitPlanId} not found`);
    }

    console.log(`📋 Unit: ${unitPlan.title || unitPlan.titleFr}`);
    console.log(`📅 Period: ${unitPlan.startDate.toDateString()} - ${unitPlan.endDate.toDateString()}`);
    console.log(`📚 Lessons found: ${unitPlan.lessonPlans.length}`);
    console.log('');

    if (unitPlan.lessonPlans.length !== 22) {
      console.log(`⚠️  WARNING: Expected 22 lessons, found ${unitPlan.lessonPlans.length}`);
      console.log('');
    }

    // Review each lesson
    const lessonReviews: LessonReview[] = [];
    
    for (const lesson of unitPlan.lessonPlans) {
      const review = await reviewLesson(lesson);
      lessonReviews.push(review);
    }

    // Calculate overall unit score
    const overallScore = calculateOverallScore(lessonReviews);
    const majorIssues = identifyMajorIssues(lessonReviews);
    const strengths = identifyStrengths(lessonReviews);

    const unitReview: UnitReview = {
      unitPlanId: unitPlan.id,
      unitTitle: unitPlan.title || unitPlan.titleFr || 'October Vocabulary Unit',
      lessonCount: unitPlan.lessonPlans.length,
      lessons: lessonReviews,
      overallScore,
      majorIssues,
      strengths,
      readyForClassroom: overallScore >= 90
    };

    return unitReview;

  } catch (error) {
    console.error('❌ Error during review:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function reviewLesson(lesson: any): Promise<LessonReview> {
  const criteria: ReviewCriteria = {
    duration: lesson.duration === 45,
    modifications: hasProperModifications(lesson),
    assessmentNotes: hasDetailedAssessmentNotes(lesson),
    indigenousPerspectives: hasAuthenticIndigenousPerspectives(lesson),
    vocabularyProgression: hasSystematicVocabularyProgression(lesson),
    ageAppropriateness: isAgeAppropriate(lesson),
    etfoCompliance: hasETFOCompliance(lesson),
    octoberThemes: hasOctoberThemes(lesson)
  };

  const issues: string[] = [];
  const strengths: string[] = [];

  // Check duration
  if (!criteria.duration) {
    issues.push(`Duration is ${lesson.duration} minutes, must be exactly 45 minutes`);
  } else {
    strengths.push('Correct 45-minute duration');
  }

  // Check modifications
  if (!criteria.modifications) {
    issues.push('Missing specific differentiation strategies for struggling/IEP/ELL/advanced learners');
  } else {
    strengths.push('Comprehensive differentiation strategies provided');
  }

  // Check assessment notes
  if (!criteria.assessmentNotes) {
    issues.push('Assessment notes lack observable criteria, rubrics, or checklists');
  } else {
    strengths.push('Detailed, observable assessment criteria');
  }

  // Check indigenous perspectives
  if (!criteria.indigenousPerspectives) {
    issues.push('Indigenous perspectives missing or tokenistic');
  } else {
    strengths.push('Authentic, meaningful Indigenous perspectives');
  }

  // Check vocabulary progression
  if (!criteria.vocabularyProgression) {
    issues.push('Vocabulary load too heavy or not building systematically from September');
  } else {
    strengths.push('Systematic vocabulary progression from September');
  }

  // Check age appropriateness
  if (!criteria.ageAppropriateness) {
    issues.push('Activities or expectations not appropriate for Grade 1 in October');
  } else {
    strengths.push('Age-appropriate for Grade 1 October');
  }

  // Check ETFO compliance
  if (!criteria.etfoCompliance) {
    issues.push('Missing clear three-part structure with timing');
  } else {
    strengths.push('Clear ETFO three-part structure');
  }

  // Check October themes
  if (!criteria.octoberThemes) {
    issues.push('Missing appropriate October themes (autumn, Halloween, Thanksgiving)');
  } else {
    strengths.push('Appropriate October themes included');
  }

  // Calculate lesson score
  const score = calculateLessonScore(criteria);

  return {
    lessonId: lesson.id,
    title: lesson.title || lesson.titleFr || 'Unnamed Lesson',
    date: lesson.date.toDateString(),
    duration: lesson.duration,
    criteria,
    issues,
    strengths,
    score
  };
}

function hasProperModifications(lesson: any): boolean {
  const modifications = lesson.modifications;
  const accommodations = lesson.accommodations;
  const extensions = lesson.extensions;
  
  if (!modifications && !accommodations && !extensions) return false;
  
  // Check for specific learner types
  const modContent = JSON.stringify([modifications, accommodations, extensions]).toLowerCase();
  
  const hasStruggling = modContent.includes('struggl') || modContent.includes('iep') || modContent.includes('support');
  const hasELL = modContent.includes('ell') || modContent.includes('english') || modContent.includes('language');
  const hasAdvanced = modContent.includes('advanc') || modContent.includes('extend') || modContent.includes('challenge');
  
  return hasStruggling && hasELL && hasAdvanced;
}

function hasDetailedAssessmentNotes(lesson: any): boolean {
  const assessmentNotes = lesson.assessmentNotes;
  const assessmentType = lesson.assessmentType;
  
  if (!assessmentNotes || assessmentNotes.length < 50) return false;
  
  const content = assessmentNotes.toLowerCase();
  const hasObservableElements = content.includes('observ') || content.includes('checklist') || content.includes('rubric') || content.includes('criteri');
  const hasSpecificBehaviors = content.includes('can') || content.includes('will') || content.includes('demonstrate');
  
  return hasObservableElements && hasSpecificBehaviors;
}

function hasAuthenticIndigenousPerspectives(lesson: any): boolean {
  const indigenous = lesson.indigenousPerspectives;
  
  if (!indigenous || indigenous.length < 30) return false;
  
  const content = indigenous.toLowerCase();
  
  // Check for authenticity indicators
  const hasSpecificElements = content.includes('story') || content.includes('tradition') || content.includes('perspective') || content.includes('knowledge');
  const avoidsTokenism = !content.includes('just') && !content.includes('simply') && !content.includes('briefly');
  
  return hasSpecificElements && avoidsTokenism;
}

function hasSystematicVocabularyProgression(lesson: any): boolean {
  const materials = lesson.materials;
  const mindsOn = lesson.mindsOn;
  const action = lesson.action;
  
  const allContent = JSON.stringify([materials, mindsOn, action]).toLowerCase();
  
  // Check for vocabulary elements
  const hasVocabulary = allContent.includes('vocabul') || allContent.includes('mots') || allContent.includes('word');
  const hasProgression = allContent.includes('build') || allContent.includes('review') || allContent.includes('previous');
  const hasReasonableLoad = (allContent.match(/\b(new|nouveau)\b/g) || []).length <= 5; // Max 5 new words per lesson
  
  return hasVocabulary && hasProgression && hasReasonableLoad;
}

function isAgeAppropriate(lesson: any): boolean {
  const mindsOn = lesson.mindsOn;
  const action = lesson.action;
  const consolidation = lesson.consolidation;
  
  const allContent = JSON.stringify([mindsOn, action, consolidation]).toLowerCase();
  
  // Check for age-inappropriate elements
  const hasComplexTasks = allContent.includes('analyz') || allContent.includes('synthesiz') || allContent.includes('evaluat');
  const hasLongText = (allContent.match(/read\s+\w+(\s+\w+){20,}/g) || []).length > 0; // Reading passages too long
  const hasAbstractConcepts = allContent.includes('abstract') || allContent.includes('theoretical');
  
  // Check for appropriate elements
  const hasPlay = allContent.includes('play') || allContent.includes('game') || allContent.includes('fun');
  const hasMovement = allContent.includes('move') || allContent.includes('action') || allContent.includes('gesture');
  const hasVisuals = allContent.includes('picture') || allContent.includes('image') || allContent.includes('visual');
  
  return !hasComplexTasks && !hasLongText && !hasAbstractConcepts && (hasPlay || hasMovement || hasVisuals);
}

function hasETFOCompliance(lesson: any): boolean {
  const mindsOn = lesson.mindsOn;
  const action = lesson.action;
  const consolidation = lesson.consolidation;
  
  if (!mindsOn || !action || !consolidation) return false;
  
  // Each section should have reasonable length
  const mindsOnLength = mindsOn.length;
  const actionLength = action.length;
  const consolidationLength = consolidation.length;
  
  return mindsOnLength >= 100 && actionLength >= 200 && consolidationLength >= 100;
}

function hasOctoberThemes(lesson: any): boolean {
  const allContent = JSON.stringify([
    lesson.title,
    lesson.titleFr,
    lesson.mindsOn,
    lesson.action,
    lesson.consolidation,
    lesson.materials
  ]).toLowerCase();
  
  const autumnThemes = allContent.includes('autumn') || allContent.includes('automne') || allContent.includes('fall') || allContent.includes('leaves') || allContent.includes('feuilles');
  const halloweenThemes = allContent.includes('halloween') || allContent.includes('pumpkin') || allContent.includes('citrouille') || allContent.includes('costume');
  const thanksgivingThemes = allContent.includes('thanksgiving') || allContent.includes('gratitude') || allContent.includes('thankful') || allContent.includes('harvest');
  
  return autumnThemes || halloweenThemes || thanksgivingThemes;
}

function calculateLessonScore(criteria: ReviewCriteria): number {
  const weights = {
    duration: 10,
    modifications: 20,
    assessmentNotes: 15,
    indigenousPerspectives: 10,
    vocabularyProgression: 15,
    ageAppropriateness: 15,
    etfoCompliance: 10,
    octoberThemes: 5
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.entries(criteria).forEach(([key, passed]) => {
    const weight = weights[key as keyof typeof weights];
    totalWeight += weight;
    if (passed) {
      totalScore += weight;
    }
  });
  
  return Math.round((totalScore / totalWeight) * 100);
}

function calculateOverallScore(lessons: LessonReview[]): number {
  if (lessons.length === 0) return 0;
  
  const totalScore = lessons.reduce((sum, lesson) => sum + lesson.score, 0);
  return Math.round(totalScore / lessons.length);
}

function identifyMajorIssues(lessons: LessonReview[]): string[] {
  const issues: string[] = [];
  
  // Count common issues
  const issueCount: Record<string, number> = {};
  lessons.forEach(lesson => {
    lesson.issues.forEach(issue => {
      const key = issue.split(' ')[0]; // Group similar issues
      issueCount[key] = (issueCount[key] || 0) + 1;
    });
  });
  
  // Identify issues affecting 25% or more of lessons
  const threshold = Math.ceil(lessons.length * 0.25);
  Object.entries(issueCount).forEach(([issueType, count]) => {
    if (count >= threshold) {
      issues.push(`${issueType} issues in ${count}/${lessons.length} lessons`);
    }
  });
  
  return issues;
}

function identifyStrengths(lessons: LessonReview[]): string[] {
  const strengths: string[] = [];
  
  // Count common strengths
  const strengthCount: Record<string, number> = {};
  lessons.forEach(lesson => {
    lesson.strengths.forEach(strength => {
      strengthCount[strength] = (strengthCount[strength] || 0) + 1;
    });
  });
  
  // Identify strengths in 75% or more of lessons
  const threshold = Math.ceil(lessons.length * 0.75);
  Object.entries(strengthCount).forEach(([strength, count]) => {
    if (count >= threshold) {
      strengths.push(`${strength} (${count}/${lessons.length} lessons)`);
    }
  });
  
  return strengths;
}

function printDetailedReport(review: UnitReview): void {
  console.log('\n📊 CRITICAL REVIEW RESULTS');
  console.log('=' .repeat(60));
  
  console.log(`\n🎯 OVERALL SCORE: ${review.overallScore}%`);
  console.log(`📋 Unit: ${review.unitTitle}`);
  console.log(`📚 Lessons Reviewed: ${review.lessonCount}/22 expected`);
  console.log(`✅ Ready for Emily's Classroom: ${review.readyForClassroom ? 'YES' : 'NO'}`);
  
  console.log('\n🔴 MAJOR ISSUES IDENTIFIED:');
  if (review.majorIssues.length === 0) {
    console.log('   • No major systemic issues found');
  } else {
    review.majorIssues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }
  
  console.log('\n✅ SYSTEMIC STRENGTHS:');
  if (review.strengths.length === 0) {
    console.log('   • No systemic strengths identified');
  } else {
    review.strengths.forEach(strength => {
      console.log(`   • ${strength}`);
    });
  }
  
  console.log('\n📋 LESSON-BY-LESSON BREAKDOWN:');
  review.lessons.forEach((lesson, index) => {
    console.log(`\n${index + 1}. ${lesson.title} (${lesson.date}) - ${lesson.score}%`);
    console.log(`   Duration: ${lesson.duration} minutes`);
    
    if (lesson.issues.length > 0) {
      console.log('   🔴 Issues:');
      lesson.issues.forEach(issue => {
        console.log(`      • ${issue}`);
      });
    }
    
    if (lesson.strengths.length > 0) {
      console.log('   ✅ Strengths:');
      lesson.strengths.forEach(strength => {
        console.log(`      • ${strength}`);
      });
    }
  });
  
  console.log('\n🏆 FINAL VERDICT:');
  if (review.overallScore >= 98) {
    console.log('   EXCEPTIONAL - Exceeds all expectations');
  } else if (review.overallScore >= 90) {
    console.log('   EXCELLENT - Ready for classroom implementation');
  } else if (review.overallScore >= 75) {
    console.log('   GOOD - Minor improvements needed');
  } else if (review.overallScore >= 60) {
    console.log('   NEEDS WORK - Significant improvements required');
  } else {
    console.log('   CRITICAL ISSUES - Major overhaul needed');
  }
  
  console.log('\n📝 COMPARISON TO SEPTEMBER:');
  console.log('   Previous September lessons scored 98% after fixes.');
  if (review.overallScore >= 98) {
    console.log('   ✅ October maintains September\'s high standard');
  } else {
    console.log(`   ⚠️  October scores ${98 - review.overallScore}% lower than September`);
  }
}

// Execute the review
reviewOctoberVocabularyUnit()
  .then(review => {
    printDetailedReport(review);
    process.exit(review.readyForClassroom ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 CRITICAL ERROR:', error);
    process.exit(1);
  });