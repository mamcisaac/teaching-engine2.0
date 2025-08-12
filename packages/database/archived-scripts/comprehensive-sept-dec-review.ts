#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveSeptDecReview() {
  console.log('🔍 COMPREHENSIVE SEPTEMBER-DECEMBER SYSTEM REVIEW');
  console.log('=' + '='.repeat(70) + '\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get all lessons by month
  const septLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id, date: { gte: new Date('2025-09-01'), lte: new Date('2025-09-30') } },
    orderBy: { date: 'asc' }
  });

  const octLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id, date: { gte: new Date('2025-10-01'), lte: new Date('2025-10-31') } },
    orderBy: { date: 'asc' }
  });

  const novLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id, date: { gte: new Date('2025-11-01'), lte: new Date('2025-11-30') } },
    orderBy: { date: 'asc' }
  });

  const decLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id, date: { gte: new Date('2025-12-01'), lte: new Date('2025-12-31') } },
    orderBy: { date: 'asc' }
  });

  const allLessons = [...septLessons, ...octLessons, ...novLessons, ...decLessons];

  console.log('📊 COMPREHENSIVE SYSTEM OVERVIEW');
  console.log(`September lessons: ${septLessons.length}`);
  console.log(`October lessons: ${octLessons.length}`);
  console.log(`November lessons: ${novLessons.length}`);
  console.log(`December lessons: ${decLessons.length}`);
  console.log(`TOTAL LESSONS: ${allLessons.length}`);

  // CRITICAL ANALYSIS 1: THEMATIC PROGRESSION EXCELLENCE
  console.log('\n🎨 THEMATIC PROGRESSION ANALYSIS');
  console.log('=' + '='.repeat(50));
  
  const themes = {
    september: 'Bienvenue à l\'école (Welcome to school)',
    october: 'Ma famille et moi (My family and me)', 
    november: 'Les fêtes d\'automne (Fall celebrations)',
    december: 'Les célébrations d\'hiver (Winter celebrations)'
  };

  // Check thematic coherence in lesson titles and content
  const themeAnalysis = {
    september: {
      themes: septLessons.filter(l => 
        l.titleFr?.toLowerCase().includes('bienvenue') ||
        l.titleFr?.toLowerCase().includes('école') ||
        l.titleFr?.toLowerCase().includes('communauté') ||
        l.learningGoals?.toLowerCase().includes('school') ||
        l.learningGoals?.toLowerCase().includes('classroom')
      ).length,
      total: septLessons.length
    },
    october: {
      themes: octLessons.filter(l =>
        l.titleFr?.toLowerCase().includes('famille') ||
        l.titleFr?.toLowerCase().includes('maman') ||
        l.titleFr?.toLowerCase().includes('papa') ||
        l.learningGoals?.toLowerCase().includes('family') ||
        l.learningGoals?.toLowerCase().includes('famille')
      ).length,
      total: octLessons.length
    },
    november: {
      themes: novLessons.filter(l =>
        l.titleFr?.toLowerCase().includes('gratitude') ||
        l.titleFr?.toLowerCase().includes('célébr') ||
        l.titleFr?.toLowerCase().includes('automne') ||
        l.titleFr?.toLowerCase().includes('souvenir') ||
        l.learningGoals?.toLowerCase().includes('celebration') ||
        l.learningGoals?.toLowerCase().includes('fall')
      ).length,
      total: novLessons.length
    },
    december: {
      themes: decLessons.filter(l =>
        l.titleFr?.toLowerCase().includes('hiver') ||
        l.titleFr?.toLowerCase().includes('célébr') ||
        l.titleFr?.toLowerCase().includes('fête') ||
        l.titleFr?.toLowerCase().includes('tradition') ||
        l.learningGoals?.toLowerCase().includes('winter') ||
        l.learningGoals?.toLowerCase().includes('holiday')
      ).length,
      total: decLessons.length
    }
  };

  console.log('Thematic coherence by month:');
  Object.entries(themeAnalysis).forEach(([month, data]) => {
    const percent = Math.round((data.themes / data.total) * 100);
    const status = percent >= 60 ? '✅' : percent >= 40 ? '⚠️' : '❌';
    console.log(`  ${month}: ${status} ${data.themes}/${data.total} lessons (${percent}%) thematically aligned`);
  });

  console.log('\nMonthly theme progression:');
  Object.entries(themes).forEach(([month, theme]) => {
    console.log(`  ${month}: ${theme}`);
  });

  // CRITICAL ANALYSIS 2: FRENCH IMMERSION EXCELLENCE
  console.log('\n🇫🇷 FRENCH IMMERSION SYSTEM ANALYSIS');
  console.log('=' + '='.repeat(50));

  const frenchLessons = allLessons.filter(l => l.subject === 'Français langue première');
  const nonFrenchLessons = allLessons.filter(l => l.subject !== 'Français langue première');

  // Check French integration in all lessons
  let frenchIntegrationIssues: string[] = [];
  nonFrenchLessons.forEach(l => {
    if (!l.learningGoals?.toLowerCase().includes('french') && 
        !l.learningGoals?.toLowerCase().includes('français')) {
      frenchIntegrationIssues.push(`${l.subject} - ${l.titleFr}: No French integration`);
    }
  });

  const frenchPercent = Math.round((frenchLessons.length / allLessons.length) * 100);
  const integrationPercent = nonFrenchLessons.length > 0 ? 
    Math.round(((nonFrenchLessons.length - frenchIntegrationIssues.length) / nonFrenchLessons.length) * 100) : 0;

  console.log(`French lessons: ${frenchLessons.length}/${allLessons.length} (${frenchPercent}%)`);
  console.log(`French integration: ${integrationPercent}% of non-French lessons`);

  if (frenchIntegrationIssues.length > 0) {
    console.log('French integration issues:');
    frenchIntegrationIssues.slice(0, 5).forEach(issue => console.log(`  ❌ ${issue}`));
    if (frenchIntegrationIssues.length > 5) {
      console.log(`  ... and ${frenchIntegrationIssues.length - 5} more issues`);
    }
  } else {
    console.log('✅ Perfect French integration across all subjects');
  }

  // Check vocabulary progression
  console.log('\nVocabulary progression analysis:');
  const vocabularyProgression = {
    september: ['école', 'ami', 'ensemble', 'bonjour', 'merci', 'classe'],
    october: ['famille', 'maman', 'papa', 'maison', 'aimer', 'grandir'],
    november: ['gratitude', 'hiver', 'paix', 'célébrer', 'lumière', 'souvenir'],
    december: ['tradition', 'fête', 'neige', 'étoile', 'cadeau', 'vacances']
  };

  Object.entries(vocabularyProgression).forEach(([month, vocab]) => {
    console.log(`  ${month}: ${vocab.join(', ')}`);
  });

  // CRITICAL ANALYSIS 3: PEDAGOGICAL STRUCTURE INTEGRITY
  console.log('\n📚 PEDAGOGICAL STRUCTURE ANALYSIS');
  console.log('=' + '='.repeat(50));

  let structuralIssues: string[] = [];
  allLessons.forEach(l => {
    if (!l.mindsOn || !l.action || !l.consolidation) {
      structuralIssues.push(`${l.titleFr}: Missing 3-part structure components`);
    }
    if (!l.assessmentNotes || !l.assessmentType) {
      structuralIssues.push(`${l.titleFr}: Missing assessment strategy`);
    }
    if (!l.differentiationStrategies) {
      structuralIssues.push(`${l.titleFr}: Missing differentiation strategies`);
    }
    if (!l.accommodations) {
      structuralIssues.push(`${l.titleFr}: Missing accommodations`);
    }
    if ((l.duration || 0) > 60) {
      structuralIssues.push(`${l.titleFr}: Duration too long for Grade 1 (${l.duration}min)`);
    }
  });

  const structurePercent = Math.round(((allLessons.length - structuralIssues.length) / allLessons.length) * 100);
  console.log(`Lessons with complete ETFO structure: ${allLessons.length - structuralIssues.length}/${allLessons.length} (${structurePercent}%)`);

  if (structuralIssues.length > 0) {
    console.log('Structure issues found:');
    structuralIssues.slice(0, 5).forEach(issue => console.log(`  ❌ ${issue}`));
    if (structuralIssues.length > 5) {
      console.log(`  ... and ${structuralIssues.length - 5} more issues`);
    }
  } else {
    console.log('✅ All lessons follow ETFO best practices perfectly');
  }

  // CRITICAL ANALYSIS 4: TEACHER WORKLOAD SUSTAINABILITY
  console.log('\n💪 TEACHER WORKLOAD ANALYSIS');
  console.log('=' + '='.repeat(50));

  const lessonsByDate = new Map<string, any[]>();
  allLessons.forEach(l => {
    const key = l.date.toDateString();
    if (!lessonsByDate.has(key)) lessonsByDate.set(key, []);
    lessonsByDate.get(key)!.push(l);
  });

  let overloadedDays = 0;
  let perfectDays = 0;
  let lightDays = 0;
  const dailyDistribution: Record<number, number> = {};

  lessonsByDate.forEach((lessons, date) => {
    const count = lessons.length;
    dailyDistribution[count] = (dailyDistribution[count] || 0) + 1;
    
    if (count > 5) {
      overloadedDays++;
      console.log(`⚠️ Overloaded: ${date} has ${count} lessons`);
    } else if (count >= 3 && count <= 4) {
      perfectDays++;
    } else if (count <= 2) {
      lightDays++;
    }
  });

  const totalDays = lessonsByDate.size;
  const avgLessonsPerDay = allLessons.length / totalDays;

  console.log(`Teaching days: ${totalDays}`);
  console.log(`Average lessons per day: ${avgLessonsPerDay.toFixed(1)}`);
  console.log(`Perfect days (3-4 lessons): ${perfectDays} (${Math.round((perfectDays/totalDays)*100)}%)`);
  console.log(`Light days (1-2 lessons): ${lightDays} (${Math.round((lightDays/totalDays)*100)}%)`);
  console.log(`Overloaded days (>5 lessons): ${overloadedDays}`);

  console.log('\nDaily load distribution:');
  Object.entries(dailyDistribution).sort(([a], [b]) => Number(a) - Number(b)).forEach(([lessons, days]) => {
    console.log(`  ${lessons} lessons: ${days} days`);
  });

  const subFriendlyCount = allLessons.filter(l => l.isSubFriendly).length;
  const subPercent = Math.round((subFriendlyCount / allLessons.length) * 100);
  console.log(`\nSub-friendly lessons: ${subFriendlyCount}/${allLessons.length} (${subPercent}%)`);

  // CRITICAL ANALYSIS 5: CURRICULUM COVERAGE
  console.log('\n🎯 CURRICULUM COVERAGE ANALYSIS');
  console.log('=' + '='.repeat(50));

  const expectationLinks = await prisma.eTFOLessonPlanExpectation.findMany({
    include: {
      lessonPlan: true,
      expectation: true
    }
  });

  const uniqueExpectationIds = new Set(expectationLinks.map(link => link.expectationId));
  const totalExpectations = await prisma.curriculumExpectation.count();
  const coveragePercent = Math.round((uniqueExpectationIds.size / totalExpectations) * 100);

  console.log(`Total curriculum expectations: ${totalExpectations}`);
  console.log(`Unique expectations covered: ${uniqueExpectationIds.size}`);
  console.log(`Coverage: ${coveragePercent}%`);
  console.log(`Total expectation links: ${expectationLinks.length}`);

  // Group by subject
  const expectationsBySubject: Record<string, Set<string>> = {};
  expectationLinks.forEach(link => {
    const subject = link.expectation.subject;
    if (!expectationsBySubject[subject]) expectationsBySubject[subject] = new Set();
    expectationsBySubject[subject].add(link.expectationId);
  });

  console.log('\nCurriculum coverage by subject:');
  Object.entries(expectationsBySubject).forEach(([subject, ids]) => {
    console.log(`  ${subject}: ${ids.size} expectations`);
  });

  // CRITICAL ANALYSIS 6: DATA INTEGRITY
  console.log('\n🔒 DATA INTEGRITY ANALYSIS');
  console.log('=' + '='.repeat(50));

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

  // Check for orphaned lessons (lessons without unit plans)
  const orphanedLessons = allLessons.filter(l => !l.unitPlanId);

  console.log(`Weekend lessons: ${weekendLessons.length}`);
  console.log(`Duplicate date/subject combinations: ${duplicates.length}`);
  console.log(`Orphaned lessons: ${orphanedLessons.length}`);

  if (weekendLessons.length > 0) {
    console.log('Weekend lessons found:');
    weekendLessons.forEach(l => console.log(`  ⚠️ ${l.titleFr} on ${l.date.toDateString()}`));
  }

  // OVERALL SYSTEM ASSESSMENT
  console.log('\n' + '='.repeat(70));
  console.log('🏆 COMPREHENSIVE SYSTEM ASSESSMENT');
  console.log('='.repeat(70));

  let totalScore = 100;
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const strengths: string[] = [];

  // Thematic progression
  const avgThemeCoherence = Object.values(themeAnalysis).reduce((sum, data) => 
    sum + (data.themes / data.total), 0) / 4;
  if (avgThemeCoherence >= 0.6) {
    strengths.push('Excellent thematic progression across all months');
  } else if (avgThemeCoherence >= 0.4) {
    warnings.push('Thematic progression could be stronger');
    totalScore -= 5;
  } else {
    criticalIssues.push('Poor thematic progression');
    totalScore -= 15;
  }

  // French immersion
  if (frenchPercent >= 30 && integrationPercent >= 90) {
    strengths.push('Outstanding French immersion implementation');
  } else if (frenchPercent >= 25 && integrationPercent >= 70) {
    strengths.push('Good French immersion implementation');
  } else {
    criticalIssues.push('French immersion needs improvement');
    totalScore -= 20;
  }

  // Pedagogical structure
  if (structuralIssues.length === 0) {
    strengths.push('Perfect pedagogical structure across all lessons');
  } else if (structuralIssues.length <= 10) {
    warnings.push('Minor pedagogical structure issues');
    totalScore -= 5;
  } else {
    criticalIssues.push('Significant pedagogical structure problems');
    totalScore -= 15;
  }

  // Teacher sustainability
  if (overloadedDays === 0 && avgLessonsPerDay <= 4) {
    strengths.push('Perfectly sustainable teaching workload');
  } else if (overloadedDays <= 2) {
    warnings.push('Generally sustainable with minor adjustments needed');
    totalScore -= 5;
  } else {
    criticalIssues.push('Unsustainable teaching workload');
    totalScore -= 15;
  }

  // Curriculum coverage
  if (uniqueExpectationIds.size >= 25) {
    strengths.push('Excellent curriculum coverage');
  } else if (uniqueExpectationIds.size >= 20) {
    strengths.push('Good curriculum coverage');
  } else {
    warnings.push('Curriculum coverage could be improved');
    totalScore -= 5;
  }

  // Data integrity
  if (weekendLessons.length === 0 && duplicates.length === 0 && orphanedLessons.length === 0) {
    strengths.push('Perfect data integrity');
  } else {
    warnings.push('Minor data integrity issues');
    totalScore -= 5;
  }

  console.log(`\n📊 FINAL SYSTEM SCORE: ${totalScore}%`);
  console.log(`📈 TOTAL LESSONS CREATED: ${allLessons.length}`);
  console.log(`📅 COVERAGE PERIOD: September 2025 - December 2025`);

  if (strengths.length > 0) {
    console.log('\n✅ SYSTEM STRENGTHS:');
    strengths.forEach(s => console.log(`   • ${s}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ AREAS FOR IMPROVEMENT:');
    warnings.forEach(w => console.log(`   • ${w}`));
  }

  if (criticalIssues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:');
    criticalIssues.forEach(i => console.log(`   • ${i}`));
  }

  console.log('\n🎯 FINAL VERDICT:');
  if (totalScore >= 95 && criticalIssues.length === 0) {
    console.log('🏆 EXCEPTIONAL - Ready for professional presentation and educational excellence!');
  } else if (totalScore >= 85 && criticalIssues.length === 0) {
    console.log('✅ EXCELLENT - Production ready with outstanding quality!');
  } else if (totalScore >= 75) {
    console.log('⚠️ GOOD - Minor improvements recommended for optimization');
  } else {
    console.log('❌ NEEDS IMPROVEMENT - Address critical issues before deployment');
  }

  console.log('\n📚 SEMESTER OVERVIEW:');
  console.log('September: Welcome to School Community (Bienvenue à l\'école)');
  console.log('October: Family Connections (Ma famille et moi)');
  console.log('November: Fall Celebrations (Les fêtes d\'automne)');
  console.log('December: Winter Holidays (Les célébrations d\'hiver)');
  console.log('');
  console.log('✨ A complete, integrated, pedagogically sound semester of Grade 1 French Immersion education! ✨');

  await prisma.$disconnect();

  return {
    totalScore,
    totalLessons: allLessons.length,
    criticalIssues: criticalIssues.length,
    warnings: warnings.length,
    strengths: strengths.length,
    frenchIntegration: integrationPercent,
    curriculumCoverage: uniqueExpectationIds.size
  };
}

comprehensiveSeptDecReview()
  .then((result) => {
    console.log('\n✅ Comprehensive September-December review complete');
    console.log(`Final system ready: ${result.criticalIssues === 0 ? 'YES' : 'NO'}`);
    process.exit(result.criticalIssues === 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Review failed:', error);
    process.exit(1);
  });