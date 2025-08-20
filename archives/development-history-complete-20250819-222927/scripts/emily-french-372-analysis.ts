#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeAll372FrenchLessons() {
  console.log('🔍 CRITICAL REVIEW: Emily McIsaac\'s 372 French Lessons for Grade 1\n');
  console.log('================================================================\n');
  console.log('⚠️  BRUTAL HONESTY MODE: Identifying garbage vs quality content\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get ALL French lessons from units (this gets us the full 372)
    const frenchUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français (Immersion)'
        }
      },
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' }
        },
        longRangePlan: true
      }
    });

    // Flatten all lessons from all units
    const allFrenchLessons = frenchUnits.flatMap(unit => 
      unit.lessonPlans.map(lesson => ({
        ...lesson,
        unitTitle: unit.title,
        unitStartDate: unit.startDate,
        unitEndDate: unit.endDate
      }))
    );

    console.log(`📊 TOTAL FRENCH LESSONS FOUND: ${allFrenchLessons.length} (Target: 372)`);
    console.log(`📚 FRENCH UNITS: ${frenchUnits.length} units`);

    if (allFrenchLessons.length !== 372) {
      console.log(`⚠️  Discrepancy: Expected 372, found ${allFrenchLessons.length}`);
    }

    // Unit breakdown
    console.log('\n📋 LESSONS BY UNIT:');
    frenchUnits.forEach((unit, index) => {
      console.log(`   ${index + 1}. "${unit.title}": ${unit.lessonPlans.length} lessons`);
      console.log(`      Period: ${unit.startDate.toDateString()} to ${unit.endDate.toDateString()}`);
    });

    // Check for auto-generated patterns and duplicates
    console.log('\n🤖 AUTO-GENERATED PATTERN ANALYSIS:');
    console.log('===================================');

    const lectureGuidePattern = allFrenchLessons.filter(lesson => 
      lesson.title?.match(/Lecture guidée.*\(Semaine \d+\)/) ||
      lesson.title?.match(/lecture guidée.*\(semaine \d+\)/) ||
      lesson.title?.match(/Guided Reading.*Week \d+/)
    );

    const atelierEcriturePattern = allFrenchLessons.filter(lesson => 
      lesson.title?.match(/Atelier d'écriture.*\(Semaine \d+\)/) ||
      lesson.title?.match(/atelier d'écriture.*\(semaine \d+\)/) ||
      lesson.title?.match(/Writing Workshop.*Week \d+/)
    );

    const weekNumberPattern = allFrenchLessons.filter(lesson => 
      lesson.title?.match(/.*\(Semaine \d+\)/) ||
      lesson.title?.match(/.*\(Week \d+\)/) ||
      lesson.title?.match(/.*Semaine \d+.*/) ||
      lesson.title?.match(/.*Week \d+.*/)
    );

    console.log(`   "Lecture guidée - [Unit] (Semaine X)" patterns: ${lectureGuidePattern.length}`);
    console.log(`   "Atelier d'écriture - [Unit] (Semaine X)" patterns: ${atelierEcriturePattern.length}`);
    console.log(`   General week number patterns: ${weekNumberPattern.length}`);

    // Show examples of auto-generated patterns
    if (lectureGuidePattern.length > 0) {
      console.log('\n   📋 Sample Lecture guidée patterns:');
      lectureGuidePattern.slice(0, 5).forEach(lesson => {
        console.log(`      "${lesson.title}"`);
      });
    }

    if (atelierEcriturePattern.length > 0) {
      console.log('\n   📋 Sample Atelier d\'écriture patterns:');
      atelierEcriturePattern.slice(0, 5).forEach(lesson => {
        console.log(`      "${lesson.title}"`);
      });
    }

    // Check for identical duplicates
    const titleGroups = allFrenchLessons.reduce((acc, lesson) => {
      const title = lesson.title;
      if (!acc[title]) acc[title] = [];
      acc[title].push(lesson);
      return acc;
    }, {} as Record<string, any[]>);

    const duplicateTitles = Object.entries(titleGroups).filter(([title, lessons]) => lessons.length > 1);
    const totalDuplicates = duplicateTitles.reduce((sum, [title, lessons]) => sum + lessons.length - 1, 0);

    console.log(`\n🔄 DUPLICATE ANALYSIS:`);
    console.log(`   Duplicate title groups: ${duplicateTitles.length}`);
    console.log(`   Total duplicate lessons: ${totalDuplicates}`);
    console.log(`   Unique lessons: ${allFrenchLessons.length - totalDuplicates}`);

    if (duplicateTitles.length > 0) {
      console.log('\n   📋 Top 10 Duplicate Titles:');
      duplicateTitles
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 10)
        .forEach(([title, lessons]) => {
          console.log(`      "${title}": ${lessons.length} identical copies`);
        });
    }

    // Deep content analysis of random sample
    console.log('\n📝 DEEP CONTENT ANALYSIS (Sample of 20 Lessons):');
    console.log('================================================');

    const sampleLessons = [];
    // Get samples from different parts of the year
    for (let i = 0; i < 20 && i < allFrenchLessons.length; i++) {
      const index = Math.floor((i / 20) * allFrenchLessons.length);
      sampleLessons.push(allFrenchLessons[index]);
    }

    let qualityCount = 0;
    let genericCount = 0;
    let garbageCount = 0;

    for (let i = 0; i < sampleLessons.length; i++) {
      const lesson = sampleLessons[i];
      console.log(`\n${i + 1}. "${lesson.title}"`);
      console.log(`   Date: ${lesson.date.toDateString()}`);
      console.log(`   Unit: "${lesson.unitTitle}"`);
      console.log(`   Duration: ${lesson.duration} minutes`);

      // ETFO Structure Analysis
      const hasMindsOn = lesson.mindsOn && lesson.mindsOn.length > 50;
      const hasAction = lesson.action && lesson.action.length > 100;
      const hasConsolidation = lesson.consolidation && lesson.consolidation.length > 30;
      
      console.log(`   ETFO Structure: ${hasMindsOn ? '✅' : '❌'} Minds On, ${hasAction ? '✅' : '❌'} Action, ${hasConsolidation ? '✅' : '❌'} Consolidation`);

      if (!hasMindsOn || !hasAction || !hasConsolidation) {
        console.log(`      🚨 CRITICAL: Incomplete ETFO structure`);
      }

      // Content quality analysis
      const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`;
      const contentLength = content.length;

      // Check for generic template language
      const genericIndicators = [
        'Students will',
        'Teacher will',
        'The teacher',
        'The students',
        'Students are',
        'Teacher is'
      ];

      const genericCount_local = genericIndicators.filter(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      ).length;

      // Check for specific French immersion content
      const frenchIndicators = [
        'français',
        'parler',
        'écouter',
        'vocabulaire',
        'phonème',
        'syllabe',
        'francophone',
        'culture',
        'oral',
        'chanter',
        'réciter'
      ];

      const frenchCount = frenchIndicators.filter(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      ).length;

      // Check for actual Grade 1 appropriate activities
      const gradeOneIndicators = [
        'story',
        'picture',
        'drawing',
        'sing',
        'movement',
        'game',
        'puppet',
        'show and tell',
        'circle time'
      ];

      const gradeOneCount = gradeOneIndicators.filter(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      ).length;

      console.log(`   Content Length: ${contentLength} characters`);
      console.log(`   Generic Indicators: ${genericCount_local} (fewer is better)`);
      console.log(`   French Indicators: ${frenchCount} (more is better)`);
      console.log(`   Grade 1 Appropriate: ${gradeOneCount} (more is better)`);

      // Learning Goals Analysis
      const hasLearningGoals = lesson.learningGoals && lesson.learningGoals.length > 20;
      console.log(`   Learning Goals: ${hasLearningGoals ? '✅' : '❌'}`);

      if (hasLearningGoals) {
        const goalsGeneric = lesson.learningGoals?.toLowerCase().includes('students will be able to') ||
                            lesson.learningGoals?.toLowerCase().includes('students will learn');
        console.log(`      Goals are generic: ${goalsGeneric ? '❌' : '✅'}`);
      }

      // Materials Analysis
      const hasMaterials = lesson.materials && Object.keys(lesson.materials as any).length > 0;
      console.log(`   Materials Listed: ${hasMaterials ? '✅' : '❌'}`);

      // Differentiation Analysis
      const hasDifferentiation = lesson.differentiationStrategies && 
                                Object.keys(lesson.differentiationStrategies as any).length > 0;
      console.log(`   Differentiation: ${hasDifferentiation ? '✅' : '❌'}`);

      // Assessment Analysis
      const hasAssessment = lesson.assessmentType || lesson.assessmentNotes;
      console.log(`   Assessment: ${hasAssessment ? '✅' : '❌'}`);

      // French Content Analysis
      const hasFrenchTitle = lesson.titleFr && lesson.titleFr.length > 0;
      const hasFrenchContent = lesson.mindsOnFr || lesson.actionFr || lesson.consolidationFr;
      console.log(`   French Title: ${hasFrenchTitle ? '✅' : '❌'}`);
      console.log(`   French Content: ${hasFrenchContent ? '✅' : '❌'}`);

      // Overall Quality Rating
      let qualityScore = 0;
      if (hasMindsOn && hasAction && hasConsolidation) qualityScore += 2;
      if (hasLearningGoals) qualityScore += 1;
      if (hasMaterials) qualityScore += 1;
      if (hasDifferentiation) qualityScore += 1;
      if (hasAssessment) qualityScore += 1;
      if (frenchCount >= 3) qualityScore += 2;
      if (gradeOneCount >= 2) qualityScore += 1;
      if (contentLength > 500) qualityScore += 1;
      if (genericCount_local <= 3) qualityScore += 1;

      if (qualityScore >= 8) {
        console.log(`   📊 QUALITY RATING: ✅ HIGH QUALITY (${qualityScore}/11)`);
        qualityCount++;
      } else if (qualityScore >= 5) {
        console.log(`   📊 QUALITY RATING: ⚠️  GENERIC TEMPLATE (${qualityScore}/11)`);
        genericCount++;
      } else {
        console.log(`   📊 QUALITY RATING: ❌ GARBAGE - NEEDS EMERGENCY FIX (${qualityScore}/11)`);
        garbageCount++;
      }

      console.log('   ' + '-'.repeat(70));
    }

    // Overall Statistics
    console.log('\n📊 OVERALL SYSTEM ANALYSIS:');
    console.log('============================');

    const totalLessons = allFrenchLessons.length;
    
    // Calculate full metrics
    const etfoCompleteCount = allFrenchLessons.filter(lesson => 
      lesson.mindsOn && lesson.action && lesson.consolidation &&
      lesson.mindsOn.length > 50 && lesson.action.length > 100 && lesson.consolidation.length > 30
    ).length;

    const learningGoalsCount = allFrenchLessons.filter(lesson => 
      lesson.learningGoals && lesson.learningGoals.length > 20
    ).length;

    const frenchContentCount = allFrenchLessons.filter(lesson => 
      lesson.titleFr || lesson.mindsOnFr || lesson.actionFr || lesson.consolidationFr
    ).length;

    const materialsCount = allFrenchLessons.filter(lesson => 
      lesson.materials && Object.keys(lesson.materials as any).length > 0
    ).length;

    const differentiationCount = allFrenchLessons.filter(lesson => 
      lesson.differentiationStrategies && Object.keys(lesson.differentiationStrategies as any).length > 0
    ).length;

    const assessmentCount = allFrenchLessons.filter(lesson => 
      lesson.assessmentType || lesson.assessmentNotes
    ).length;

    const proper45MinCount = allFrenchLessons.filter(lesson => lesson.duration === 45).length;

    console.log(`   Total French Lessons: ${totalLessons}`);
    console.log(`   Complete ETFO Structure: ${etfoCompleteCount}/${totalLessons} (${Math.round(etfoCompleteCount/totalLessons*100)}%)`);
    console.log(`   Learning Goals Present: ${learningGoalsCount}/${totalLessons} (${Math.round(learningGoalsCount/totalLessons*100)}%)`);
    console.log(`   French Content Present: ${frenchContentCount}/${totalLessons} (${Math.round(frenchContentCount/totalLessons*100)}%)`);
    console.log(`   Materials Listed: ${materialsCount}/${totalLessons} (${Math.round(materialsCount/totalLessons*100)}%)`);
    console.log(`   Differentiation Present: ${differentiationCount}/${totalLessons} (${Math.round(differentiationCount/totalLessons*100)}%)`);
    console.log(`   Assessment Present: ${assessmentCount}/${totalLessons} (${Math.round(assessmentCount/totalLessons*100)}%)`);
    console.log(`   Proper 45min Duration: ${proper45MinCount}/${totalLessons} (${Math.round(proper45MinCount/totalLessons*100)}%)`);

    // Sample-based quality extrapolation
    const sampleSize = sampleLessons.length;
    const estimatedQuality = Math.round((qualityCount / sampleSize) * totalLessons);
    const estimatedGeneric = Math.round((genericCount / sampleSize) * totalLessons);
    const estimatedGarbage = Math.round((garbageCount / sampleSize) * totalLessons);

    console.log('\n🎯 QUALITY BREAKDOWN (Sample-based estimate):');
    console.log(`   High Quality Lessons: ~${estimatedQuality} (${Math.round(qualityCount/sampleSize*100)}%)`);
    console.log(`   Generic Template Lessons: ~${estimatedGeneric} (${Math.round(genericCount/sampleSize*100)}%)`);
    console.log(`   Garbage Lessons (Emergency Fix): ~${estimatedGarbage} (${Math.round(garbageCount/sampleSize*100)}%)`);

    // Auto-generated pattern analysis
    const autoGeneratedTotal = lectureGuidePattern.length + atelierEcriturePattern.length;
    console.log(`\n🤖 AUTO-GENERATED CONTENT:`)
    console.log(`   Auto-generated patterns: ${autoGeneratedTotal}/${totalLessons} (${Math.round(autoGeneratedTotal/totalLessons*100)}%)`);
    console.log(`   Duplicate lessons: ${totalDuplicates}/${totalLessons} (${Math.round(totalDuplicates/totalLessons*100)}%)`);

    // Final verdict
    console.log('\n🚨 FINAL VERDICT:');
    console.log('=================');

    const qualityPercentage = qualityCount / sampleSize;
    const garbagePercentage = garbageCount / sampleSize;

    if (garbagePercentage > 0.3) {
      console.log('❌ SYSTEM STATUS: EMERGENCY - MAJORITY OF LESSONS ARE GARBAGE');
      console.log('   IMMEDIATE ACTION REQUIRED');
      console.log(`   Estimated repair time: 80-120 hours`);
      console.log('   Recommendation: Complete system overhaul needed');
    } else if (qualityPercentage < 0.5) {
      console.log('⚠️  SYSTEM STATUS: CRITICAL - NEEDS MAJOR FIXES');
      console.log('   URGENT IMPROVEMENTS NEEDED');
      console.log(`   Estimated repair time: 40-60 hours`);
      console.log('   Recommendation: Systematic lesson quality improvement');
    } else if (qualityPercentage < 0.8) {
      console.log('⚠️  SYSTEM STATUS: NEEDS IMPROVEMENT');
      console.log('   MODERATE FIXES REQUIRED');
      console.log(`   Estimated repair time: 20-30 hours`);
      console.log('   Recommendation: Focus on template standardization');
    } else {
      console.log('✅ SYSTEM STATUS: GOOD QUALITY');
      console.log('   Minor improvements needed');
      console.log(`   Estimated repair time: 5-10 hours`);
    }

    console.log('\n🎯 SPECIFIC EMERGENCY FIXES NEEDED:');
    if (autoGeneratedTotal > totalLessons * 0.3) {
      console.log('   🔥 CRITICAL: Reduce auto-generated repetitive patterns');
    }
    if (totalDuplicates > totalLessons * 0.1) {
      console.log('   🔥 CRITICAL: Eliminate duplicate lessons');
    }
    if (etfoCompleteCount < totalLessons * 0.8) {
      console.log('   🔥 CRITICAL: Fix ETFO structure compliance');
    }
    if (frenchContentCount < totalLessons * 0.9) {
      console.log('   🔥 CRITICAL: Add proper French immersion content');
    }
    if (differentiationCount < totalLessons * 0.7) {
      console.log('   🔥 CRITICAL: Add differentiation strategies');
    }

    console.log('\n✅ 372 French lessons analysis complete!');

  } catch (error) {
    console.error('❌ Error analyzing French lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

analyzeAll372FrenchLessons()
  .then(() => console.log('🎉 Analysis completed successfully!'))
  .catch((error) => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });