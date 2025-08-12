#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveSystemReview() {
  console.log('🔍 COMPREHENSIVE TEACHING SYSTEM REVIEW');
  console.log('=' + '='.repeat(70) + '\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get all lessons
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id },
    include: {
      unitPlan: {
        include: {
          longRangePlan: true
        }
      }
    },
    orderBy: { date: 'asc' }
  });

  const septLessons = allLessons.filter(l => l.date.getMonth() === 8);
  const octLessons = allLessons.filter(l => l.date.getMonth() === 9);
  const novLessons = allLessons.filter(l => l.date.getMonth() === 10);

  console.log('📊 SYSTEM OVERVIEW');
  console.log(`Total lessons: ${allLessons.length}`);
  console.log(`September: ${septLessons.length} lessons`);
  console.log(`October: ${octLessons.length} lessons`);
  console.log(`November: ${novLessons.length} lessons`);

  // CRITICAL ANALYSIS 1: CURRICULUM COVERAGE
  console.log('\n🎯 CURRICULUM COVERAGE ANALYSIS');
  
  const expectations = await prisma.curriculumExpectation.count();
  
  // Use findMany instead of count/groupBy for lessonExpectation
  const allLessonExpectations = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id },
    select: {
      expectations: {
        select: {
          expectationId: true
        }
      }
    }
  });
  
  const linkedExpectations = allLessonExpectations.reduce((count, lesson) => {
    return count + lesson.expectations.length;
  }, 0);
  
  const uniqueExpectationIds = new Set();
  allLessonExpectations.forEach(lesson => {
    lesson.expectations.forEach(exp => {
      uniqueExpectationIds.add(exp.expectationId);
    });
  });
  
  const uniqueExpectations = Array.from(uniqueExpectationIds);
  
  console.log(`Total curriculum expectations: ${expectations}`);
  console.log(`Linked to lessons: ${linkedExpectations} connections`);
  console.log(`Unique expectations covered: ${uniqueExpectations.length}`);
  
  if (uniqueExpectations.length < 20) {
    console.log('❌ CRITICAL: Need more curriculum expectations linked');
  } else {
    console.log('✅ Good curriculum coverage');
  }

  // CRITICAL ANALYSIS 2: FRENCH IMMERSION INTEGRITY
  console.log('\n🇫🇷 FRENCH IMMERSION INTEGRITY');
  
  const frenchLessons = allLessons.filter(l => l.subject === 'Français langue première');
  const nonFrenchLessons = allLessons.filter(l => l.subject !== 'Français langue première');
  
  // Check French lesson quality
  let frenchQualityIssues: string[] = [];
  frenchLessons.forEach(l => {
    if (!l.titleFr) frenchQualityIssues.push(`Missing French title: ${l.title}`);
    if (!l.mindsOn || !l.action || !l.consolidation) {
      frenchQualityIssues.push(`Incomplete structure: ${l.titleFr}`);
    }
  });
  
  // Check French integration
  let frenchIntegrationIssues: string[] = [];
  nonFrenchLessons.forEach(l => {
    if (!l.learningGoals?.toLowerCase().includes('french') && 
        !l.learningGoals?.toLowerCase().includes('français')) {
      frenchIntegrationIssues.push(`No French: ${l.subject} - ${l.titleFr}`);
    }
  });
  
  const frenchPercent = Math.round((frenchLessons.length / allLessons.length) * 100);
  const integrationPercent = nonFrenchLessons.length > 0 ? 
    Math.round(((nonFrenchLessons.length - frenchIntegrationIssues.length) / nonFrenchLessons.length) * 100) : 0;
  
  console.log(`French lessons: ${frenchLessons.length}/${allLessons.length} (${frenchPercent}%)`);
  console.log(`French integration: ${integrationPercent}%`);
  
  if (frenchPercent < 25) {
    console.log('❌ CRITICAL: Need more French lessons (minimum 25%)');
  } else if (integrationPercent < 70) {
    console.log('❌ CRITICAL: Poor French integration in other subjects');
  } else {
    console.log('✅ Excellent French immersion implementation');
  }

  // CRITICAL ANALYSIS 3: PEDAGOGICAL STRUCTURE
  console.log('\n📚 PEDAGOGICAL STRUCTURE INTEGRITY');
  
  let structureIssues: string[] = [];
  allLessons.forEach(l => {
    if (!l.mindsOn || !l.action || !l.consolidation) {
      structureIssues.push(`Missing 3-part structure: ${l.titleFr}`);
    }
    if (!l.assessmentNotes || !l.assessmentType) {
      structureIssues.push(`Missing assessment: ${l.titleFr}`);
    }
    if (!l.accommodations || !l.differentiationStrategies) {
      structureIssues.push(`Missing differentiation: ${l.titleFr}`);
    }
    if (l.duration > 60) {
      structureIssues.push(`Too long for Grade 1: ${l.titleFr} (${l.duration}min)`);
    }
  });
  
  console.log(`Lessons with complete ETFO structure: ${allLessons.length - structureIssues.length}/${allLessons.length}`);
  
  if (structureIssues.length > 0) {
    console.log('Structure issues found:');
    structureIssues.slice(0, 5).forEach(i => console.log(`  ❌ ${i}`));
    if (structureIssues.length > 5) {
      console.log(`  ... and ${structureIssues.length - 5} more`);
    }
  } else {
    console.log('✅ All lessons follow ETFO best practices');
  }

  // CRITICAL ANALYSIS 4: TEACHER SUSTAINABILITY
  console.log('\n💪 TEACHER SUSTAINABILITY');
  
  const lessonsByDate = new Map<string, any[]>();
  allLessons.forEach(l => {
    const key = l.date.toDateString();
    if (!lessonsByDate.has(key)) lessonsByDate.set(key, []);
    lessonsByDate.get(key)!.push(l);
  });
  
  let overloadedDays = 0;
  let perfectDays = 0;
  lessonsByDate.forEach((lessons, date) => {
    if (lessons.length > 5) {
      overloadedDays++;
      console.log(`⚠️ Overloaded: ${date} has ${lessons.length} lessons`);
    } else if (lessons.length >= 3 && lessons.length <= 4) {
      perfectDays++;
    }
  });
  
  const subFriendlyCount = allLessons.filter(l => l.isSubFriendly).length;
  const subPercent = Math.round((subFriendlyCount / allLessons.length) * 100);
  
  console.log(`Perfect teaching days (3-4 lessons): ${perfectDays}`);
  console.log(`Overloaded days (>5 lessons): ${overloadedDays}`);
  console.log(`Sub-friendly lessons: ${subPercent}%`);
  
  if (overloadedDays > 0) {
    console.log('❌ CRITICAL: Some days are overloaded');
  } else if (subPercent < 100) {
    console.log('⚠️ WARNING: Some lessons not sub-friendly');
  } else {
    console.log('✅ Perfectly sustainable for teacher');
  }

  // CRITICAL ANALYSIS 5: THEMATIC PROGRESSION
  console.log('\n🎨 THEMATIC PROGRESSION COHERENCE');
  
  // Check theme progression
  const septThemes = septLessons.map(l => l.titleFr).filter(t => t?.toLowerCase().includes('bienvenue'));
  const octThemes = octLessons.map(l => l.titleFr).filter(t => t?.toLowerCase().includes('famille'));
  const novThemes = novLessons.map(l => l.titleFr).filter(t => 
    t?.toLowerCase().includes('célébr') || t?.toLowerCase().includes('lumière') || t?.toLowerCase().includes('gratitude'));
  
  console.log(`September theme presence: ${septThemes.length > 0 ? '✅ Welcome theme' : '❌ Missing welcome theme'}`);
  console.log(`October theme presence: ${octThemes.length > 0 ? '✅ Family theme' : '❌ Missing family theme'}`);
  console.log(`November theme presence: ${novThemes.length > 0 ? '✅ Celebration theme' : '❌ Missing celebration theme'}`);
  
  // Check vocabulary progression
  console.log('\nVocabulary progression analysis...');
  const hasBasicVocab = septLessons.some(l => l.learningGoals?.includes('bonjour') || l.learningGoals?.includes('merci'));
  const hasFamilyVocab = octLessons.some(l => l.learningGoals?.includes('famille') || l.learningGoals?.includes('maman'));
  const hasCelebrationVocab = novLessons.some(l => l.learningGoals?.includes('gratitude') || l.learningGoals?.includes('célébr'));
  
  if (hasBasicVocab && hasFamilyVocab && hasCelebrationVocab) {
    console.log('✅ Excellent vocabulary progression');
  } else {
    console.log('⚠️ Vocabulary progression could be stronger');
  }

  // CRITICAL ANALYSIS 6: DATA INTEGRITY
  console.log('\n🔒 DATA INTEGRITY CHECK');
  
  // Check for orphaned lessons
  const orphanedLessons = allLessons.filter(l => !l.unitPlan);
  
  // Check for weekend lessons
  const weekendLessons = allLessons.filter(l => {
    const day = l.date.getDay();
    return day === 0 || day === 6;
  });
  
  // Check for duplicates
  const duplicates = await prisma.$queryRaw`
    SELECT date, subject, COUNT(*) as count
    FROM ETFOLessonPlan
    WHERE userId = ${emily.id}
    GROUP BY date, subject
    HAVING COUNT(*) > 1
  ` as any[];
  
  console.log(`Orphaned lessons: ${orphanedLessons.length}`);
  console.log(`Weekend lessons: ${weekendLessons.length}`);
  console.log(`Duplicate dates: ${duplicates.length}`);
  
  if (orphanedLessons.length > 0 || weekendLessons.length > 0 || duplicates.length > 0) {
    console.log('❌ CRITICAL: Data integrity issues found');
  } else {
    console.log('✅ Perfect data integrity');
  }

  // OVERALL SYSTEM ASSESSMENT
  console.log('\n' + '='.repeat(70));
  console.log('🏆 OVERALL TEACHING SYSTEM ASSESSMENT');
  console.log('='.repeat(70));
  
  let totalScore = 100;
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const strengths: string[] = [];
  
  // Deduct for critical issues
  if (uniqueExpectations.length < 20) {
    totalScore -= 15;
    criticalIssues.push('Insufficient curriculum coverage');
  } else {
    strengths.push('Good curriculum coverage');
  }
  
  if (frenchPercent < 25 || integrationPercent < 70) {
    totalScore -= 20;
    criticalIssues.push('French immersion implementation issues');
  } else {
    strengths.push('Excellent French immersion');
  }
  
  if (structureIssues.length > 5) {
    totalScore -= 15;
    criticalIssues.push('Pedagogical structure problems');
  } else if (structureIssues.length > 0) {
    totalScore -= 5;
    warnings.push('Minor pedagogical structure issues');
  } else {
    strengths.push('Perfect pedagogical structure');
  }
  
  if (overloadedDays > 0) {
    totalScore -= 10;
    criticalIssues.push('Unsustainable daily loads');
  } else {
    strengths.push('Sustainable teaching loads');
  }
  
  if (orphanedLessons.length > 0 || weekendLessons.length > 0 || duplicates.length > 0) {
    totalScore -= 10;
    criticalIssues.push('Data integrity problems');
  } else {
    strengths.push('Perfect data integrity');
  }
  
  console.log(`FINAL SYSTEM SCORE: ${totalScore}%\n`);
  
  if (strengths.length > 0) {
    console.log('STRENGTHS:');
    strengths.forEach(s => console.log(`  ✅ ${s}`));
    console.log();
  }
  
  if (warnings.length > 0) {
    console.log('WARNINGS:');
    warnings.forEach(w => console.log(`  ⚠️ ${w}`));
    console.log();
  }
  
  if (criticalIssues.length > 0) {
    console.log('CRITICAL ISSUES:');
    criticalIssues.forEach(i => console.log(`  ❌ ${i}`));
    console.log();
  }
  
  // Final verdict
  console.log('FINAL VERDICT:');
  if (totalScore >= 95 && criticalIssues.length === 0) {
    console.log('🏆 EXCEPTIONAL - Ready for professional presentation!');
  } else if (totalScore >= 85 && criticalIssues.length <= 1) {
    console.log('✅ EXCELLENT - Production ready for classroom use!');
  } else if (totalScore >= 70) {
    console.log('⚠️ GOOD - Minor improvements recommended');
  } else {
    console.log('❌ NEEDS SIGNIFICANT WORK - Critical issues must be resolved');
  }

  await prisma.$disconnect();
  
  return {
    totalScore,
    totalLessons: allLessons.length,
    criticalIssues: criticalIssues.length,
    warnings: warnings.length,
    strengths: strengths.length
  };
}

comprehensiveSystemReview()
  .then((result) => {
    console.log('\n✅ Comprehensive system review complete');
    process.exit(result.criticalIssues === 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Review failed:', error);
    process.exit(1);
  });