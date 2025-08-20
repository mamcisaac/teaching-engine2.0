#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reviewEmilyFrenchComplete() {
  console.log('🔍 CRITICAL REVIEW: Emily McIsaac\'s COMPLETE Français (Immersion) System...\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get Long Range Plan for Français (Immersion)
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });

    console.log('=' .repeat(80));
    console.log('📋 LONG RANGE PLAN REVIEW');
    console.log('=' .repeat(80));
    
    if (!lrp) {
      console.log('❌ CRITICAL ISSUE: No Français (Immersion) Long Range Plan found');
      return;
    }

    console.log(`✅ Found LRP: "${lrp.title}"`);
    console.log(`   Academic Year: ${lrp.academicYear}, Grade: ${lrp.grade}`);
    
    // LRP Critical Analysis
    const lrpIssues = [];
    
    if (!lrp.description || lrp.description.length < 200) {
      lrpIssues.push(`Insufficient description (${lrp.description?.length || 0} chars, needs 200+)`);
    }
    
    if (!lrp.goals || lrp.goals.length < 300) {
      lrpIssues.push(`Insufficient yearly goals (${lrp.goals?.length || 0} chars, needs 300+)`);
    }
    
    if (!lrp.assessmentOverview || lrp.assessmentOverview.length < 200) {
      lrpIssues.push(`Missing/insufficient assessment overview (${lrp.assessmentOverview?.length || 0} chars)`);
    }
    
    // Check for oral language emphasis in LRP
    const lrpContent = `${lrp.description || ''} ${lrp.goals || ''} ${lrp.assessmentOverview || ''}`.toLowerCase();
    const hasOralLanguageFocus = lrpContent.includes('oral') || lrpContent.includes('speaking') || 
                                lrpContent.includes('listening') || lrpContent.includes('conversation') ||
                                lrpContent.includes('parler') || lrpContent.includes('écouter');
    
    if (!hasOralLanguageFocus) {
      lrpIssues.push('Missing explicit oral language development focus in LRP');
    }
    
    console.log(`\n🚨 LRP ISSUES FOUND (${lrpIssues.length}):`);
    lrpIssues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));

    // Get all Unit Plans
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français (Immersion)'
        }
      },
      include: {
        longRangePlan: true,
        lessonPlans: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('\n' + '=' .repeat(80));
    console.log(`📚 UNIT PLANS REVIEW (${unitPlans.length} total)`);
    console.log('=' .repeat(80));

    const unitIssues = [];
    
    if (unitPlans.length !== 8) {
      unitIssues.push(`Expected 8 units, found ${unitPlans.length}`);
    }

    unitPlans.forEach((unit, index) => {
      console.log(`\n${index + 1}. "${unit.title}"`);
      console.log(`   Period: ${unit.startDate.toDateString()} to ${unit.endDate.toDateString()}`);
      console.log(`   Lessons: ${unit.lessonPlans.length}`);
      
      // Check unit duration and progression
      const startMonth = unit.startDate.getMonth();
      const endMonth = unit.endDate.getMonth();
      const durationWeeks = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (durationWeeks < 3 || durationWeeks > 6) {
        unitIssues.push(`Unit ${index + 1} "${unit.title}": Improper duration (${durationWeeks} weeks, should be 3-6)`);
      }
      
      // Check for essential components
      if (!unit.description || unit.description.length < 100) {
        unitIssues.push(`Unit ${index + 1} "${unit.title}": Missing/insufficient description`);
      }
      
      if (!unit.bigIdeas || unit.bigIdeas.length < 50) {
        unitIssues.push(`Unit ${index + 1} "${unit.title}": Missing/insufficient big ideas`);
      }
      
      if (!unit.assessmentPlan || unit.assessmentPlan.length < 100) {
        unitIssues.push(`Unit ${index + 1} "${unit.title}": Missing/insufficient assessment plan`);
      }
      
      if (!unit.differentiationStrategies || Object.keys(unit.differentiationStrategies as any || {}).length === 0) {
        unitIssues.push(`Unit ${index + 1} "${unit.title}": Missing differentiation strategies`);
      }
      
      if (!unit.indigenousPerspectives || unit.indigenousPerspectives.length < 50) {
        unitIssues.push(`Unit ${index + 1} "${unit.title}": Missing/insufficient Indigenous perspectives`);
      }
      
      // Check for French immersion cultural content
      const unitContent = `${unit.description || ''} ${unit.bigIdeas || ''}`.toLowerCase();
      const hasFrenchCulture = unitContent.includes('français') || unitContent.includes('francophone') || 
                              unitContent.includes('culture') || unitContent.includes('tradition');
      
      if (!hasFrenchCulture && index > 0) { // Allow first unit to be orientation
        unitIssues.push(`Unit ${index + 1} "${unit.title}": Missing francophone cultural content`);
      }
    });

    console.log(`\n🚨 UNIT PLANS ISSUES FOUND (${unitIssues.length}):`);
    unitIssues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));

    // Get ALL lesson plans
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)'
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    console.log('\n' + '=' .repeat(80));
    console.log(`📝 LESSON PLANS REVIEW (${allLessons.length} total)`);
    console.log('=' .repeat(80));

    const lessonIssues = [];
    
    if (allLessons.length !== 172) {
      lessonIssues.push(`Expected 172 lessons, found ${allLessons.length}`);
    }

    // ETFO Structure Analysis
    const missingMindsOn = allLessons.filter(l => !l.mindsOn || l.mindsOn.trim().length === 0);
    const missingAction = allLessons.filter(l => !l.action || l.action.trim().length === 0);
    const missingConsolidation = allLessons.filter(l => !l.consolidation || l.consolidation.trim().length === 0);
    const wrongTiming = allLessons.filter(l => l.duration !== 45);
    const missingLearningGoals = allLessons.filter(l => !l.learningGoals || l.learningGoals.trim().length === 0);

    if (missingMindsOn.length > 0) {
      lessonIssues.push(`${missingMindsOn.length} lessons missing Minds On component`);
    }
    if (missingAction.length > 0) {
      lessonIssues.push(`${missingAction.length} lessons missing Action component`);
    }
    if (missingConsolidation.length > 0) {
      lessonIssues.push(`${missingConsolidation.length} lessons missing Consolidation component`);
    }
    if (wrongTiming.length > 0) {
      lessonIssues.push(`${wrongTiming.length} lessons not 45 minutes (ETFO requirement)`);
    }
    if (missingLearningGoals.length > 0) {
      lessonIssues.push(`${missingLearningGoals.length} lessons missing learning goals`);
    }

    // Language Development Analysis
    const oralLanguageLessons = allLessons.filter(lesson => {
      const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
      return content.includes('oral') || content.includes('speaking') || content.includes('listening') ||
             content.includes('conversation') || content.includes('discussion') || content.includes('parler') ||
             content.includes('écouter') || content.includes('discuter');
    });

    const readingLessons = allLessons.filter(lesson => {
      const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
      return content.includes('reading') || content.includes('phonics') || content.includes('letters') ||
             content.includes('sounds') || content.includes('lecture') || content.includes('lire') ||
             content.includes('lettres') || content.includes('sons');
    });

    const writingLessons = allLessons.filter(lesson => {
      const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
      return content.includes('writing') || content.includes('journal') || content.includes('drawing') ||
             content.includes('écriture') || content.includes('écrire') || content.includes('dessiner');
    });

    // Grade 1 French Immersion should be 70% oral, 20% reading, 10% writing
    const oralPercentage = Math.round((oralLanguageLessons.length / allLessons.length) * 100);
    const readingPercentage = Math.round((readingLessons.length / allLessons.length) * 100);
    const writingPercentage = Math.round((writingLessons.length / allLessons.length) * 100);

    if (oralPercentage < 60) {
      lessonIssues.push(`Insufficient oral language focus: ${oralPercentage}% (should be 70%+)`);
    }
    if (readingPercentage < 15) {
      lessonIssues.push(`Insufficient reading readiness: ${readingPercentage}% (should be 20%+)`);
    }

    // Differentiation Analysis
    const differentiatedLessons = allLessons.filter(l => 
      l.differentiationStrategies || l.accommodations || l.modifications || l.extensions
    );
    const differentiationPercentage = Math.round((differentiatedLessons.length / allLessons.length) * 100);
    
    if (differentiationPercentage < 80) {
      lessonIssues.push(`Insufficient differentiation: ${differentiationPercentage}% of lessons (should be 80%+)`);
    }

    // Assessment Analysis
    const assessmentLessons = allLessons.filter(l => 
      l.assessmentType || l.assessmentNotes || l.formativeCheckpoints
    );
    const assessmentPercentage = Math.round((assessmentLessons.length / allLessons.length) * 100);
    
    if (assessmentPercentage < 70) {
      lessonIssues.push(`Insufficient assessment strategies: ${assessmentPercentage}% of lessons (should be 70%+)`);
    }

    // French Content Analysis
    const frenchContentLessons = allLessons.filter(l => 
      l.titleFr || l.mindsOnFr || l.actionFr || l.consolidationFr || l.learningGoalsFr
    );
    const frenchContentPercentage = Math.round((frenchContentLessons.length / allLessons.length) * 100);
    
    if (frenchContentPercentage < 90) {
      lessonIssues.push(`Insufficient French language content: ${frenchContentPercentage}% of lessons (should be 90%+)`);
    }

    // Indigenous Perspectives Analysis
    const indigenousLessons = allLessons.filter(l => 
      l.indigenousPerspectives && l.indigenousPerspectives.length > 0
    );
    const indigenousPercentage = Math.round((indigenousLessons.length / allLessons.length) * 100);
    
    if (indigenousPercentage < 20) {
      lessonIssues.push(`Insufficient Indigenous perspectives: ${indigenousPercentage}% of lessons (should be 20%+)`);
    }

    console.log('\n📊 LESSON ANALYSIS SUMMARY:');
    console.log(`   Total Lessons: ${allLessons.length}/172 expected`);
    console.log(`   ETFO Structure Complete: ${allLessons.length - Math.max(missingMindsOn.length, missingAction.length, missingConsolidation.length)}/${allLessons.length} (${Math.round(((allLessons.length - Math.max(missingMindsOn.length, missingAction.length, missingConsolidation.length)) / allLessons.length) * 100)}%)`);
    console.log(`   Proper Timing (45 min): ${allLessons.length - wrongTiming.length}/${allLessons.length} (${Math.round(((allLessons.length - wrongTiming.length) / allLessons.length) * 100)}%)`);
    console.log(`   Oral Language Focus: ${oralLanguageLessons.length}/${allLessons.length} (${oralPercentage}%) - Target: 70%`);
    console.log(`   Reading Readiness: ${readingLessons.length}/${allLessons.length} (${readingPercentage}%) - Target: 20%`);
    console.log(`   Early Writing: ${writingLessons.length}/${allLessons.length} (${writingPercentage}%) - Target: 10%`);
    console.log(`   Differentiation: ${differentiatedLessons.length}/${allLessons.length} (${differentiationPercentage}%) - Target: 80%`);
    console.log(`   Assessment: ${assessmentLessons.length}/${allLessons.length} (${assessmentPercentage}%) - Target: 70%`);
    console.log(`   French Content: ${frenchContentLessons.length}/${allLessons.length} (${frenchContentPercentage}%) - Target: 90%`);
    console.log(`   Indigenous Perspectives: ${indigenousLessons.length}/${allLessons.length} (${indigenousPercentage}%) - Target: 20%`);

    console.log(`\n🚨 LESSON PLANS ISSUES FOUND (${lessonIssues.length}):`);
    lessonIssues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));

    // Sample problematic lessons for detailed analysis
    console.log('\n📋 DETAILED ISSUE EXAMPLES:');
    
    if (missingMindsOn.length > 0) {
      const sample = missingMindsOn[0];
      console.log(`\n❌ Missing Minds On Example:`);
      console.log(`   Lesson: "${sample.title}" (${sample.date.toDateString()})`);
      console.log(`   Unit: "${sample.unitPlan.title}"`);
    }

    if (wrongTiming.length > 0) {
      const sample = wrongTiming[0];
      console.log(`\n❌ Wrong Timing Example:`);
      console.log(`   Lesson: "${sample.title}" (${sample.date.toDateString()})`);
      console.log(`   Duration: ${sample.duration} minutes (should be 45)`);
    }

    if (differentiatedLessons.length < allLessons.length) {
      const sample = allLessons.find(l => !l.differentiationStrategies && !l.accommodations);
      if (sample) {
        console.log(`\n❌ Missing Differentiation Example:`);
        console.log(`   Lesson: "${sample.title}" (${sample.date.toDateString()})`);
        console.log(`   No differentiation strategies provided`);
      }
    }

    // Overall System Assessment
    const totalIssues = lrpIssues.length + unitIssues.length + lessonIssues.length;
    
    console.log('\n' + '=' .repeat(80));
    console.log('🏆 OVERALL SYSTEM ASSESSMENT');
    console.log('=' .repeat(80));
    
    console.log(`📊 SYSTEM COMPLETENESS:`);
    console.log(`   Long Range Plan: ${lrp ? '✅' : '❌'}`);
    console.log(`   Unit Plans: ${unitPlans.length}/8 (${Math.round((unitPlans.length/8)*100)}%)`);
    console.log(`   Lesson Plans: ${allLessons.length}/172 (${Math.round((allLessons.length/172)*100)}%)`);
    
    const completenessScore = Math.round(((lrp ? 1 : 0) + (unitPlans.length/8) + (allLessons.length/172)) / 3 * 100);
    console.log(`   Overall Completeness: ${completenessScore}%`);

    console.log(`\n🚨 TOTAL CRITICAL ISSUES: ${totalIssues}`);
    console.log(`   LRP Issues: ${lrpIssues.length}`);
    console.log(`   Unit Plan Issues: ${unitIssues.length}`);
    console.log(`   Lesson Plan Issues: ${lessonIssues.length}`);

    let qualityRating = 'EXCELLENT';
    if (totalIssues > 50) qualityRating = 'FAILING';
    else if (totalIssues > 30) qualityRating = 'POOR';
    else if (totalIssues > 15) qualityRating = 'NEEDS IMPROVEMENT';
    else if (totalIssues > 5) qualityRating = 'GOOD';

    console.log(`\n🎯 FINAL QUALITY RATING: ${qualityRating}`);

    if (qualityRating !== 'EXCELLENT') {
      console.log('\n🔧 PRIORITY RECOMMENDATIONS:');
      console.log('   1. Increase oral language emphasis to 70% of lessons');
      console.log('   2. Ensure all lessons have complete ETFO structure (Minds On/Action/Consolidation)');
      console.log('   3. Add differentiation strategies to all lessons');
      console.log('   4. Include more francophone cultural content');
      console.log('   5. Strengthen Indigenous perspectives integration');
      console.log('   6. Ensure all lessons are exactly 45 minutes');
      console.log('   7. Add comprehensive assessment strategies');
    }

    console.log('\n✅ Emily\'s Français (Immersion) CRITICAL REVIEW complete!');

  } catch (error) {
    console.error('❌ Error in critical review:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

reviewEmilyFrenchComplete()
  .then(() => console.log('🎉 Critical review completed successfully!'))
  .catch((error) => {
    console.error('💥 Critical review failed:', error);
    process.exit(1);
  });