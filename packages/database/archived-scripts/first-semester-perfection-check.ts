#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveFirstSemesterCheck() {
  console.log('🔍 COMPREHENSIVE FIRST SEMESTER PERFECTION CHECK\n');
  console.log('Analyzing September-December 2025 for any gaps or issues...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get all first semester lessons
    const septLessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: emily.id, 
        date: { gte: new Date('2025-09-01'), lte: new Date('2025-09-30') } 
      },
      include: { unitPlan: true },
      orderBy: { date: 'asc' }
    });

    const octLessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: emily.id, 
        date: { gte: new Date('2025-10-01'), lte: new Date('2025-10-31') } 
      },
      include: { unitPlan: true },
      orderBy: { date: 'asc' }
    });

    const novLessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: emily.id, 
        date: { gte: new Date('2025-11-01'), lte: new Date('2025-11-30') } 
      },
      include: { unitPlan: true },
      orderBy: { date: 'asc' }
    });

    const decLessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: emily.id, 
        date: { gte: new Date('2025-12-01'), lte: new Date('2025-12-31') } 
      },
      include: { unitPlan: true },
      orderBy: { date: 'asc' }
    });

    const allFirstSemesterLessons = [...septLessons, ...octLessons, ...novLessons, ...decLessons];

    console.log('📊 FIRST SEMESTER LESSON COUNT ANALYSIS:');
    console.log(`September 2025: ${septLessons.length} lessons`);
    console.log(`October 2025: ${octLessons.length} lessons`);
    console.log(`November 2025: ${novLessons.length} lessons`);
    console.log(`December 2025: ${decLessons.length} lessons`);
    console.log(`TOTAL FIRST SEMESTER: ${allFirstSemesterLessons.length} lessons\n`);

    // === 1. SUBJECT COVERAGE ANALYSIS ===
    console.log('🎯 SUBJECT COVERAGE VERIFICATION:');
    
    const subjectCounts = {};
    allFirstSemesterLessons.forEach(lesson => {
      subjectCounts[lesson.subject] = (subjectCounts[lesson.subject] || 0) + 1;
    });

    const expectedSubjects = [
      'Français langue première',
      'Mathématiques',
      'Sciences de la nature', 
      'Arts visuels',
      'Éducation physique',
      'Music'
    ];

    let missingSubjects = [];
    let subjectGaps = [];

    expectedSubjects.forEach(subject => {
      const count = subjectCounts[subject] || 0;
      console.log(`  ${subject}: ${count} lessons`);
      
      if (count === 0) {
        missingSubjects.push(subject);
      } else if (count < 8) { // Less than 2 per month average
        subjectGaps.push(`${subject} (only ${count} lessons)`);
      }
    });

    if (missingSubjects.length > 0) {
      console.log(`❌ MISSING SUBJECTS: ${missingSubjects.join(', ')}`);
    }
    if (subjectGaps.length > 0) {
      console.log(`⚠️ LOW COVERAGE SUBJECTS: ${subjectGaps.join(', ')}`);
    }
    if (missingSubjects.length === 0 && subjectGaps.length === 0) {
      console.log('✅ ALL EXPECTED SUBJECTS ADEQUATELY COVERED');
    }
    console.log();

    // === 2. CALENDAR COVERAGE ANALYSIS ===
    console.log('📅 CALENDAR COVERAGE VERIFICATION:');
    
    // Check for gaps in school days
    const schoolDays = [];
    const startDate = new Date('2025-09-04'); // First day of school
    const endDate = new Date('2025-12-20');   // Before winter break
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Not weekend
        schoolDays.push(new Date(d));
      }
    }

    const lessonDates = new Set(allFirstSemesterLessons.map(l => l.date.toDateString()));
    const daysWithLessons = schoolDays.filter(day => lessonDates.has(day.toDateString()));
    const daysWithoutLessons = schoolDays.filter(day => !lessonDates.has(day.toDateString()));

    console.log(`Total school days (Sept 4 - Dec 20): ${schoolDays.length}`);
    console.log(`Days with lessons: ${daysWithLessons.length}`);
    console.log(`Days without lessons: ${daysWithoutLessons.length}`);
    
    if (daysWithoutLessons.length > 0) {
      console.log('⚠️ DAYS WITHOUT LESSONS:');
      daysWithoutLessons.slice(0, 10).forEach(day => {
        console.log(`  ${day.toDateString()}`);
      });
      if (daysWithoutLessons.length > 10) {
        console.log(`  ... and ${daysWithoutLessons.length - 10} more days`);
      }
    } else {
      console.log('✅ ALL SCHOOL DAYS HAVE LESSONS SCHEDULED');
    }
    console.log();

    // === 3. LESSON QUALITY ANALYSIS ===
    console.log('🎓 LESSON QUALITY VERIFICATION:');
    
    let qualityIssues = [];
    
    allFirstSemesterLessons.forEach(lesson => {
      // Check for missing essential components
      if (!lesson.mindsOn || lesson.mindsOn.length < 10) {
        qualityIssues.push(`${lesson.titleFr}: Missing or insufficient Minds On`);
      }
      if (!lesson.action || lesson.action.length < 20) {
        qualityIssues.push(`${lesson.titleFr}: Missing or insufficient Action`);
      }
      if (!lesson.consolidation || lesson.consolidation.length < 10) {
        qualityIssues.push(`${lesson.titleFr}: Missing or insufficient Consolidation`);
      }
      if (!lesson.learningGoals || lesson.learningGoals.length < 20) {
        qualityIssues.push(`${lesson.titleFr}: Missing or insufficient Learning Goals`);
      }
      if (!lesson.materials) {
        qualityIssues.push(`${lesson.titleFr}: Missing materials list`);
      }
      if (!lesson.differentiationStrategies) {
        qualityIssues.push(`${lesson.titleFr}: Missing differentiation strategies`);
      }
      if (!lesson.accommodations) {
        qualityIssues.push(`${lesson.titleFr}: Missing accommodations`);
      }
      if ((lesson.duration || 0) > 60) {
        qualityIssues.push(`${lesson.titleFr}: Duration too long for Grade 1 (${lesson.duration} min)`);
      }
      if ((lesson.duration || 0) < 15) {
        qualityIssues.push(`${lesson.titleFr}: Duration too short (${lesson.duration} min)`);
      }
    });

    console.log(`Lessons with complete structure: ${allFirstSemesterLessons.length - qualityIssues.length}/${allFirstSemesterLessons.length}`);
    
    if (qualityIssues.length > 0) {
      console.log(`❌ QUALITY ISSUES FOUND: ${qualityIssues.length}`);
      qualityIssues.slice(0, 5).forEach(issue => console.log(`  ${issue}`));
      if (qualityIssues.length > 5) {
        console.log(`  ... and ${qualityIssues.length - 5} more issues`);
      }
    } else {
      console.log('✅ ALL LESSONS HAVE COMPLETE QUALITY STRUCTURE');
    }
    console.log();

    // === 4. WORKLOAD BALANCE ANALYSIS ===
    console.log('⚖️ DAILY WORKLOAD BALANCE VERIFICATION:');
    
    const dailyLessons = new Map();
    allFirstSemesterLessons.forEach(lesson => {
      const dateKey = lesson.date.toDateString();
      if (!dailyLessons.has(dateKey)) dailyLessons.set(dateKey, []);
      dailyLessons.get(dateKey).push(lesson);
    });

    const loadDistribution = {};
    let overloadedDays = [];
    let underloadedDays = [];

    dailyLessons.forEach((lessons, date) => {
      const count = lessons.length;
      loadDistribution[count] = (loadDistribution[count] || 0) + 1;
      
      if (count > 5) {
        overloadedDays.push(`${date}: ${count} lessons`);
      } else if (count < 1) {
        underloadedDays.push(`${date}: ${count} lessons`);
      }
    });

    const avgLessonsPerDay = allFirstSemesterLessons.length / dailyLessons.size;
    console.log(`Average lessons per day: ${avgLessonsPerDay.toFixed(2)}`);
    console.log(`Teaching days with lessons: ${dailyLessons.size}`);
    
    console.log('Daily lesson distribution:');
    Object.entries(loadDistribution).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([lessons, days]) => {
      console.log(`  ${lessons} lessons/day: ${days} days`);
    });

    if (overloadedDays.length > 0) {
      console.log(`❌ OVERLOADED DAYS (>5 lessons): ${overloadedDays.length}`);
      overloadedDays.forEach(day => console.log(`  ${day}`));
    } else {
      console.log('✅ NO OVERLOADED DAYS - WORKLOAD SUSTAINABLE');
    }
    console.log();

    // === 5. CURRICULUM COVERAGE ANALYSIS ===
    console.log('📚 CURRICULUM EXPECTATION COVERAGE:');
    
    const expectationLinks = await prisma.eTFOLessonPlanExpectation.findMany({
      where: {
        lessonPlan: {
          userId: emily.id,
          date: {
            gte: new Date('2025-09-01'),
            lte: new Date('2025-12-31')
          }
        }
      },
      include: {
        expectation: true,
        lessonPlan: true
      }
    });

    const uniqueExpectations = new Set(expectationLinks.map(link => link.expectationId));
    const totalExpectations = await prisma.curriculumExpectation.count();
    
    console.log(`Unique expectations covered: ${uniqueExpectations.size}`);
    console.log(`Total expectation links: ${expectationLinks.length}`);
    console.log(`Coverage percentage: ${Math.round((uniqueExpectations.size / totalExpectations) * 100)}%`);
    
    // Group by subject
    const expectationsBySubject = {};
    expectationLinks.forEach(link => {
      const subject = link.expectation.subject;
      if (!expectationsBySubject[subject]) expectationsBySubject[subject] = new Set();
      expectationsBySubject[subject].add(link.expectationId);
    });

    console.log('Coverage by subject:');
    Object.entries(expectationsBySubject).forEach(([subject, expectationSet]) => {
      console.log(`  ${subject}: ${expectationSet.size} expectations`);
    });

    if (uniqueExpectations.size < 15) {
      console.log('⚠️ LOW CURRICULUM COVERAGE - Consider adding more expectation links');
    } else {
      console.log('✅ GOOD CURRICULUM COVERAGE FOR FIRST SEMESTER');
    }
    console.log();

    // === 6. FRENCH INTEGRATION ANALYSIS ===
    console.log('🇫🇷 FRENCH INTEGRATION VERIFICATION:');
    
    const frenchLessons = allFirstSemesterLessons.filter(l => l.subject === 'Français langue première');
    const nonFrenchLessons = allFirstSemesterLessons.filter(l => l.subject !== 'Français langue première');
    
    let frenchIntegrationIssues = [];
    nonFrenchLessons.forEach(lesson => {
      const hasIntegration = 
        lesson.learningGoals?.toLowerCase().includes('french') ||
        lesson.learningGoals?.toLowerCase().includes('français') ||
        lesson.learningGoals?.includes('vocabulary') ||
        lesson.learningGoals?.includes('vocabulaire');
        
      if (!hasIntegration) {
        frenchIntegrationIssues.push(`${lesson.subject}: ${lesson.titleFr}`);
      }
    });

    const frenchPercent = Math.round((frenchLessons.length / allFirstSemesterLessons.length) * 100);
    const integrationPercent = nonFrenchLessons.length > 0 ? 
      Math.round(((nonFrenchLessons.length - frenchIntegrationIssues.length) / nonFrenchLessons.length) * 100) : 100;

    console.log(`Dedicated French lessons: ${frenchLessons.length}/${allFirstSemesterLessons.length} (${frenchPercent}%)`);
    console.log(`French integration in other subjects: ${integrationPercent}%`);
    
    if (frenchIntegrationIssues.length > 0) {
      console.log(`❌ LESSONS WITHOUT FRENCH INTEGRATION: ${frenchIntegrationIssues.length}`);
      frenchIntegrationIssues.slice(0, 3).forEach(issue => console.log(`  ${issue}`));
      if (frenchIntegrationIssues.length > 3) {
        console.log(`  ... and ${frenchIntegrationIssues.length - 3} more`);
      }
    } else {
      console.log('✅ PERFECT FRENCH INTEGRATION ACROSS ALL SUBJECTS');
    }
    console.log();

    // === 7. DATA INTEGRITY ANALYSIS ===
    console.log('🔧 DATA INTEGRITY VERIFICATION:');
    
    // Check for weekend lessons
    const weekendLessons = allFirstSemesterLessons.filter(l => {
      const day = l.date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });

    // Check for duplicates
    const duplicateCheck = new Map();
    let duplicates = [];
    allFirstSemesterLessons.forEach(lesson => {
      const key = `${lesson.date.toDateString()}-${lesson.subject}`;
      if (duplicateCheck.has(key)) {
        duplicates.push(`${lesson.date.toDateString()}: Multiple ${lesson.subject} lessons`);
      }
      duplicateCheck.set(key, lesson);
    });

    // Check for orphaned lessons
    const orphanedLessons = allFirstSemesterLessons.filter(l => !l.unitPlanId);

    console.log(`Weekend lessons: ${weekendLessons.length}`);
    console.log(`Duplicate lessons: ${duplicates.length}`);
    console.log(`Orphaned lessons: ${orphanedLessons.length}`);

    let dataIntegrityIssues = weekendLessons.length + duplicates.length + orphanedLessons.length;
    if (dataIntegrityIssues === 0) {
      console.log('✅ PERFECT DATA INTEGRITY - NO ISSUES FOUND');
    } else {
      console.log(`❌ DATA INTEGRITY ISSUES: ${dataIntegrityIssues} total`);
    }
    console.log();

    // === FINAL PERFECTION ASSESSMENT ===
    console.log('=' + '='.repeat(60));
    console.log('🏆 FIRST SEMESTER PERFECTION ASSESSMENT');
    console.log('=' + '='.repeat(60));

    let criticalIssues = [];
    let minorIssues = [];
    let strengths = [];

    // Evaluate each area
    if (missingSubjects.length > 0) {
      criticalIssues.push(`Missing subjects: ${missingSubjects.join(', ')}`);
    } else {
      strengths.push('Complete subject coverage');
    }

    if (daysWithoutLessons.length > 5) {
      criticalIssues.push(`${daysWithoutLessons.length} school days without lessons`);
    } else if (daysWithoutLessons.length > 0) {
      minorIssues.push(`${daysWithoutLessons.length} school days without lessons`);
    } else {
      strengths.push('Complete calendar coverage');
    }

    if (qualityIssues.length > 10) {
      criticalIssues.push(`${qualityIssues.length} lesson quality issues`);
    } else if (qualityIssues.length > 0) {
      minorIssues.push(`${qualityIssues.length} lesson quality issues`);
    } else {
      strengths.push('Perfect lesson quality');
    }

    if (overloadedDays.length > 0) {
      criticalIssues.push(`${overloadedDays.length} overloaded days`);
    } else {
      strengths.push('Sustainable workload balance');
    }

    if (frenchIntegrationIssues.length > 20) {
      criticalIssues.push(`${frenchIntegrationIssues.length} lessons missing French integration`);
    } else if (frenchIntegrationIssues.length > 0) {
      minorIssues.push(`${frenchIntegrationIssues.length} lessons missing French integration`);
    } else {
      strengths.push('Perfect French integration');
    }

    if (dataIntegrityIssues > 0) {
      criticalIssues.push(`${dataIntegrityIssues} data integrity issues`);
    } else {
      strengths.push('Perfect data integrity');
    }

    // Calculate perfection score
    let perfectionScore = 100;
    perfectionScore -= criticalIssues.length * 15;
    perfectionScore -= minorIssues.length * 5;
    perfectionScore = Math.max(0, perfectionScore);

    console.log(`\n📊 PERFECTION SCORE: ${perfectionScore}/100`);
    
    if (strengths.length > 0) {
      console.log('\n✅ SYSTEM STRENGTHS:');
      strengths.forEach(strength => console.log(`   • ${strength}`));
    }

    if (minorIssues.length > 0) {
      console.log('\n⚠️ MINOR IMPROVEMENTS NEEDED:');
      minorIssues.forEach(issue => console.log(`   • ${issue}`));
    }

    if (criticalIssues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES TO ADDRESS:');
      criticalIssues.forEach(issue => console.log(`   • ${issue}`));
    }

    console.log('\n🎯 FINAL VERDICT:');
    if (perfectionScore >= 95 && criticalIssues.length === 0) {
      console.log('🏆 FIRST SEMESTER IS PERFECT - Ready for professional excellence!');
    } else if (perfectionScore >= 85 && criticalIssues.length === 0) {
      console.log('✅ FIRST SEMESTER IS EXCELLENT - Minor polishing recommended');
    } else if (perfectionScore >= 70) {
      console.log('⚠️ FIRST SEMESTER IS GOOD - Some improvements needed');
    } else {
      console.log('❌ FIRST SEMESTER NEEDS SIGNIFICANT WORK - Address critical issues');
    }

    console.log(`\n📈 SUMMARY STATISTICS:`);
    console.log(`Total lessons: ${allFirstSemesterLessons.length}`);
    console.log(`Subjects covered: ${Object.keys(subjectCounts).length}`);
    console.log(`Teaching days: ${dailyLessons.size}`);
    console.log(`Average daily load: ${avgLessonsPerDay.toFixed(2)} lessons`);
    console.log(`French integration: ${integrationPercent}%`);
    console.log(`Curriculum coverage: ${Math.round((uniqueExpectations.size / totalExpectations) * 100)}%`);

  } catch (error) {
    console.error('❌ Error during perfection check:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveFirstSemesterCheck()
  .then(() => {
    console.log('\n✅ First semester perfection check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Perfection check failed:', error);
    process.exit(1);
  });