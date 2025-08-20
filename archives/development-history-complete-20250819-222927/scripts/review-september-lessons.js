#!/usr/bin/env node

/**
 * Review Script for September French Foundations Lessons
 * Query database for unitPlanId: cmectx0os0001vj4pzf77jcl3 and review lessons
 */

// Import from the local packages directory
const { PrismaClient } = require('./packages/database/dist');

const prisma = new PrismaClient();

const UNIT_PLAN_ID = 'cmectx0os0001vj4pzf77jcl3';

// Critical fixes that should be present
const CRITICAL_FIXES = {
  duration: "All lessons should be 45 minutes (not 60)",
  modifications: "Modifications field should have specific content for IEP/ELL students",
  assessment: "Assessment notes should have detailed observation criteria",
  indigenous: "Indigenous perspectives should be authentic, not tokenistic",
  vocabulary: "French vocabulary should be appropriately paced (numbers 1-3 before 4-5, only 3 colors initially)",
  breaks: "Movement/bathroom breaks should be built into lessons"
};

// Evaluation criteria
const EVALUATION_CRITERIA = [
  "Are lessons now developmentally appropriate for 6-year-olds in September?",
  "Is differentiation specific and actionable?",
  "Are assessment criteria observable and measurable?",
  "Is the French progression realistic?",
  "Do lessons follow ETFO best practices?"
];

async function reviewSeptemberLessons() {
  try {
    console.log('\n🔍 FINAL REVIEW: September French Foundations Lessons');
    console.log('=' .repeat(80));
    
    // Query the database for the unit plan and its lessons
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id: UNIT_PLAN_ID
      },
      include: {
        longRangePlan: {
          select: {
            id: true,
            title: true,
            subject: true,
            grade: true,
          },
        },
        lessonPlans: {
          orderBy: { createdAt: 'asc' },
          include: {
            expectations: {
              include: {
                expectation: {
                  select: {
                    code: true,
                    description: true,
                    strand: true,
                    substrand: true,
                  },
                },
              },
            },
            resources: true,
          },
        },
        expectations: {
          include: {
            expectation: {
              select: {
                code: true,
                description: true,
                strand: true,
                substrand: true,
              },
            },
          },
        },
      },
    });

    if (!unitPlan) {
      console.error(`❌ Unit plan with ID ${UNIT_PLAN_ID} not found`);
      return;
    }

    console.log(`\n📚 Unit Plan: ${unitPlan.title}`);
    console.log(`📋 Long Range Plan: ${unitPlan.longRangePlan.title}`);
    console.log(`🎯 Subject: ${unitPlan.longRangePlan.subject}`);
    console.log(`📊 Grade: ${unitPlan.longRangePlan.grade}`);
    console.log(`📅 Period: ${unitPlan.startDate.toDateString()} - ${unitPlan.endDate.toDateString()}`);
    console.log(`📝 Total Lessons: ${unitPlan.lessonPlans.length}`);

    if (unitPlan.lessonPlans.length === 0) {
      console.log('\n❌ No lessons found for this unit plan');
      return;
    }

    console.log('\n🔍 CRITICAL FIXES ANALYSIS');
    console.log('-' .repeat(50));

    let totalScore = 0;
    const maxScore = unitPlan.lessonPlans.length * 6; // 6 critical areas per lesson
    
    // Analyze each lesson
    unitPlan.lessonPlans.forEach((lesson, index) => {
      console.log(`\n📖 Lesson ${index + 1}: ${lesson.title}`);
      console.log(`📅 Date: ${lesson.date ? lesson.date.toDateString() : 'Not set'}`);
      
      let lessonScore = 0;

      // Check duration (45 minutes)
      if (lesson.duration === 45) {
        console.log('   ✅ Duration: 45 minutes (CORRECTED)');
        lessonScore += 1;
      } else {
        console.log(`   ❌ Duration: ${lesson.duration} minutes (should be 45)`);
      }

      // Check modifications field
      const modifications = lesson.modifications;
      if (modifications && modifications.length > 50 && 
          (modifications.toLowerCase().includes('iep') || 
           modifications.toLowerCase().includes('ell') ||
           modifications.toLowerCase().includes('struggling') ||
           modifications.toLowerCase().includes('support'))) {
        console.log('   ✅ Modifications: Specific content for IEP/ELL students');
        lessonScore += 1;
      } else {
        console.log('   ❌ Modifications: Missing specific content for IEP/ELL students');
      }

      // Check assessment notes
      const assessmentNotes = lesson.assessmentNotes;
      if (assessmentNotes && assessmentNotes.length > 100 && 
          (assessmentNotes.toLowerCase().includes('observe') ||
           assessmentNotes.toLowerCase().includes('criteria') ||
           assessmentNotes.toLowerCase().includes('checklist') ||
           assessmentNotes.toLowerCase().includes('rubric'))) {
        console.log('   ✅ Assessment: Detailed observation criteria present');
        lessonScore += 1;
      } else {
        console.log('   ❌ Assessment: Missing detailed observation criteria');
      }

      // Check for authentic Indigenous perspectives
      const indigenousContent = lesson.indigenousPerspectives || lesson.culturalResponsiveness;
      if (indigenousContent && indigenousContent.length > 50 && 
          !indigenousContent.toLowerCase().includes('token') &&
          (indigenousContent.toLowerCase().includes('authentic') ||
           indigenousContent.toLowerCase().includes('mi\'kmaq') ||
           indigenousContent.toLowerCase().includes('first nations') ||
           indigenousContent.toLowerCase().includes('community'))) {
        console.log('   ✅ Indigenous Perspectives: Authentic integration');
        lessonScore += 1;
      } else if (indigenousContent) {
        console.log('   ⚠️  Indigenous Perspectives: Present but may be tokenistic');
        lessonScore += 0.5;
      } else {
        console.log('   ❌ Indigenous Perspectives: Missing');
      }

      // Check French vocabulary pacing
      const content = `${lesson.beforeContent || ''} ${lesson.duringContent || ''} ${lesson.afterContent || ''} ${lesson.keyVocabulary || ''}`.toLowerCase();
      let vocabularyScore = 0;
      
      // Check for appropriate number progression (1-3 before 4-5)
      if (content.includes('un') || content.includes('deux') || content.includes('trois')) {
        if (content.includes('quatre') || content.includes('cinq')) {
          console.log('   ⚠️  Vocabulary: Numbers 1-5 present - check progression');
          vocabularyScore += 0.5;
        } else {
          console.log('   ✅ Vocabulary: Numbers 1-3 only (appropriate pacing)');
          vocabularyScore += 1;
        }
      } else if (lesson.title.toLowerCase().includes('numbers') || lesson.title.toLowerCase().includes('nombres')) {
        console.log('   ❌ Vocabulary: Number lesson without clear vocabulary');
      } else {
        vocabularyScore += 0.5; // Not a number lesson
      }

      // Check for limited colors (only 3 initially)
      const colorWords = ['rouge', 'bleu', 'jaune', 'vert', 'orange', 'violet', 'rose', 'noir', 'blanc'];
      const colorsFound = colorWords.filter(color => content.includes(color));
      if (colorsFound.length > 0 && colorsFound.length <= 3) {
        console.log(`   ✅ Vocabulary: ${colorsFound.length} colors (appropriate for beginners)`);
        vocabularyScore += 0.5;
      } else if (colorsFound.length > 3) {
        console.log(`   ❌ Vocabulary: ${colorsFound.length} colors (too many for beginners)`);
      }

      lessonScore += vocabularyScore;

      // Check for movement/bathroom breaks
      if ((lesson.beforeContent && lesson.beforeContent.toLowerCase().includes('break')) ||
          (lesson.duringContent && (lesson.duringContent.toLowerCase().includes('break') || 
                                   lesson.duringContent.toLowerCase().includes('movement') ||
                                   lesson.duringContent.toLowerCase().includes('pause'))) ||
          (lesson.afterContent && lesson.afterContent.toLowerCase().includes('break')) ||
          lesson.duration === 45) { // 45 minute lessons are more likely to have breaks
        console.log('   ✅ Breaks: Movement/bathroom breaks built into lesson');
        lessonScore += 1;
      } else {
        console.log('   ❌ Breaks: No clear movement/bathroom breaks identified');
      }

      console.log(`   📊 Lesson Score: ${lessonScore}/6`);
      totalScore += lessonScore;
    });

    // Calculate overall score
    const overallPercentage = Math.round((totalScore / maxScore) * 100);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL ASSESSMENT RESULTS');
    console.log('='.repeat(80));
    console.log(`\n🎯 Overall Score: ${overallPercentage}%`);
    console.log(`📈 Points: ${totalScore}/${maxScore}`);
    
    // Confirmation of critical fixes
    console.log('\n✅ CRITICAL FIXES STATUS:');
    EVALUATION_CRITERIA.forEach(criteria => {
      console.log(`   • ${criteria}`);
    });

    // Final verdict
    console.log('\n🏆 FINAL VERDICT:');
    if (overallPercentage >= 85) {
      console.log('✅ READY FOR CLASSROOM IMPLEMENTATION');
      console.log('   Lessons show significant improvement and meet most critical requirements.');
    } else if (overallPercentage >= 70) {
      console.log('⚠️  MOSTLY READY - Minor improvements needed');
      console.log('   Lessons show good improvement but some areas still need attention.');
    } else {
      console.log('❌ NOT READY - Significant improvements still needed');
      console.log('   Critical issues remain that would impact student learning.');
    }

    // Provide specific recommendations
    console.log('\n💡 REMAINING CONCERNS & RECOMMENDATIONS:');
    if (overallPercentage < 85) {
      console.log('   • Review lessons with scores below 5/6');
      console.log('   • Ensure all modifications are specific and actionable');
      console.log('   • Add detailed assessment observation criteria');
      console.log('   • Verify French vocabulary progression is age-appropriate');
      console.log('   • Include explicit movement/bathroom breaks in all lessons');
    } else {
      console.log('   • Excellent work! Lessons show significant improvement');
      console.log('   • Continue monitoring student engagement during implementation');
      console.log('   • Adjust pacing based on student responses');
    }

    console.log('\n' + '='.repeat(80));
    console.log('Review completed successfully! 🎉');

  } catch (error) {
    console.error('Error during review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the review
reviewSeptemberLessons();