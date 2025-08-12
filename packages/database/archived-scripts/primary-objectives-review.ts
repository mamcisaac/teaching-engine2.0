#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reviewPrimaryObjectives() {
  console.log('🎯 PRIMARY OBJECTIVES CRITICAL REVIEW\n');
  console.log('=' + '='.repeat(60) + '\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) throw new Error('Emily not found');
    
    // Get all lessons for analysis
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });
    
    const issues = [];
    const strengths = [];
    
    // PRIMARY OBJECTIVE 1: FRENCH IMMERSION EXCELLENCE
    console.log('🇫🇷 OBJECTIVE 1: French Immersion Excellence');
    console.log('-'.repeat(50));
    
    const frenchLessons = allLessons.filter(l => l.subject === 'Français langue première');
    const nonFrenchLessons = allLessons.filter(l => l.subject !== 'Français langue première');
    
    // Check French lesson quality
    let frenchQualityScore = 0;
    frenchLessons.forEach(lesson => {
      if (lesson.mindsOn && lesson.action && lesson.consolidation) frenchQualityScore++;
      if (!lesson.titleFr) issues.push(`French lesson missing French title: ${lesson.title}`);
    });
    
    // Check French integration in other subjects
    let integratedLessons = 0;
    nonFrenchLessons.forEach(lesson => {
      if (lesson.learningGoals?.toLowerCase().includes('french') || 
          lesson.learningGoals?.toLowerCase().includes('français')) {
        integratedLessons++;
      } else {
        issues.push(`No French integration: ${lesson.subject} - ${lesson.titleFr || lesson.title}`);
      }
    });
    
    const frenchPercent = Math.round((frenchLessons.length / allLessons.length) * 100);
    const integrationPercent = nonFrenchLessons.length > 0 ? 
      Math.round((integratedLessons / nonFrenchLessons.length) * 100) : 0;
    
    console.log(`✅ French lessons: ${frenchLessons.length}/${allLessons.length} (${frenchPercent}%)`);
    console.log(`✅ French integration: ${integratedLessons}/${nonFrenchLessons.length} (${integrationPercent}%)`);
    
    if (frenchPercent >= 25 && integrationPercent >= 70) {
      strengths.push('French immersion objectives met');
    } else {
      issues.push('French immersion needs strengthening');
    }
    
    // PRIMARY OBJECTIVE 2: GRADE 1 DEVELOPMENTAL APPROPRIATENESS
    console.log('\n👶 OBJECTIVE 2: Grade 1 Developmental Appropriateness');
    console.log('-'.repeat(50));
    
    let tooLongLessons = 0;
    let missingDifferentiation = 0;
    let complexityIssues = 0;
    
    allLessons.forEach(lesson => {
      // Check duration
      if ((lesson.duration || 0) > 60) {
        tooLongLessons++;
        issues.push(`Lesson too long: ${lesson.titleFr} (${lesson.duration} min)`);
      }
      
      // Check differentiation
      if (!lesson.differentiationStrategies && !lesson.accommodations) {
        missingDifferentiation++;
      }
      
      // Check three-part structure
      if (!lesson.mindsOn || !lesson.action || !lesson.consolidation) {
        complexityIssues++;
      }
    });
    
    console.log(`✅ Appropriate duration: ${allLessons.length - tooLongLessons}/${allLessons.length}`);
    console.log(`✅ Has differentiation: ${allLessons.length - missingDifferentiation}/${allLessons.length}`);
    console.log(`✅ Three-part structure: ${allLessons.length - complexityIssues}/${allLessons.length}`);
    
    if (tooLongLessons === 0 && missingDifferentiation === 0) {
      strengths.push('Perfectly age-appropriate for Grade 1');
    }
    
    // PRIMARY OBJECTIVE 3: CURRICULUM ALIGNMENT
    console.log('\n📚 OBJECTIVE 3: Curriculum Alignment');
    console.log('-'.repeat(50));
    
    const expectationsCovered = new Set();
    const subjectsWithExpectations = new Set();
    
    allLessons.forEach(lesson => {
      lesson.expectations.forEach(exp => {
        expectationsCovered.add(exp.expectation.code);
        subjectsWithExpectations.add(exp.expectation.subject);
      });
    });
    
    console.log(`✅ Expectations covered: ${expectationsCovered.size}`);
    console.log(`✅ Subjects with expectations: ${subjectsWithExpectations.size}`);
    console.log(`   Codes: ${Array.from(expectationsCovered).sort().join(', ')}`);
    
    if (expectationsCovered.size < 10) {
      issues.push('Limited curriculum coverage - need more expectations linked');
    } else {
      strengths.push('Good curriculum coverage');
    }
    
    // PRIMARY OBJECTIVE 4: TEACHER WORKLOAD SUSTAINABILITY
    console.log('\n💪 OBJECTIVE 4: Teacher Workload Sustainability');
    console.log('-'.repeat(50));
    
    const lessonsByDate = new Map();
    allLessons.forEach(lesson => {
      const dateKey = lesson.date.toDateString();
      lessonsByDate.set(dateKey, (lessonsByDate.get(dateKey) || 0) + 1);
    });
    
    let overloadedDays = 0;
    let perfectDays = 0;
    
    lessonsByDate.forEach((count, date) => {
      if (count > 5) {
        overloadedDays++;
        issues.push(`Overloaded: ${date} has ${count} lessons`);
      } else if (count >= 3 && count <= 4) {
        perfectDays++;
      }
    });
    
    const subFriendlyCount = allLessons.filter(l => l.isSubFriendly).length;
    const subPercent = Math.round((subFriendlyCount / allLessons.length) * 100);
    
    console.log(`✅ Perfect days (3-4 lessons): ${perfectDays}`);
    console.log(`✅ Overloaded days: ${overloadedDays}`);
    console.log(`✅ Sub-friendly: ${subFriendlyCount}/${allLessons.length} (${subPercent}%)`);
    
    if (overloadedDays === 0 && subPercent === 100) {
      strengths.push('Teacher workload perfectly sustainable');
    }
    
    // PRIMARY OBJECTIVE 5: SEAMLESS INTEGRATION
    console.log('\n🔗 OBJECTIVE 5: Seamless Integration');
    console.log('-'.repeat(50));
    
    // Check monthly transitions
    const septLessons = allLessons.filter(l => l.date.getMonth() === 8); // September
    const octLessons = allLessons.filter(l => l.date.getMonth() === 9);  // October
    
    console.log(`✅ September lessons: ${septLessons.length}`);
    console.log(`✅ October lessons: ${octLessons.length}`);
    
    // Check theme progression
    const hasWelcomeTheme = septLessons.some(l => l.titleFr?.toLowerCase().includes('bienvenue'));
    const hasFamilyTheme = octLessons.some(l => l.titleFr?.toLowerCase().includes('famille'));
    const hasCelebrations = allLessons.some(l => l.titleFr?.toLowerCase().includes('célébration'));
    
    if (hasWelcomeTheme && hasFamilyTheme && hasCelebrations) {
      strengths.push('Excellent thematic progression');
    } else {
      issues.push('Theme progression could be stronger');
    }
    
    // CRITICAL ISSUES ANALYSIS
    console.log('\n⚠️  CRITICAL ISSUES ANALYSIS');
    console.log('=' + '='.repeat(60));
    
    // Check for weekend lessons
    const weekendLessons = allLessons.filter(l => {
      const day = l.date.getDay();
      return day === 0 || day === 6;
    });
    
    if (weekendLessons.length > 0) {
      console.log(`❌ CRITICAL: ${weekendLessons.length} weekend lessons found!`);
      weekendLessons.forEach(l => {
        issues.push(`Weekend lesson: ${l.titleFr} on ${l.date.toDateString()}`);
      });
    } else {
      console.log('✅ No weekend lessons');
    }
    
    // Check for missing November
    const novLessons = allLessons.filter(l => l.date.getMonth() === 10); // November
    if (novLessons.length === 0) {
      console.log('⚠️  No November lessons created yet');
    }
    
    // FINAL ASSESSMENT
    console.log('\n' + '='.repeat(60));
    console.log('🏆 PRIMARY OBJECTIVES ASSESSMENT');
    console.log('='.repeat(60) + '\n');
    
    const objectives = [
      { name: 'French Immersion Excellence', score: integrationPercent },
      { name: 'Grade 1 Appropriateness', score: tooLongLessons === 0 ? 100 : 70 },
      { name: 'Curriculum Alignment', score: expectationsCovered.size >= 10 ? 90 : 60 },
      { name: 'Teacher Sustainability', score: overloadedDays === 0 ? 100 : 70 },
      { name: 'Seamless Integration', score: hasWelcomeTheme && hasFamilyTheme ? 95 : 70 }
    ];
    
    objectives.forEach(obj => {
      const status = obj.score >= 90 ? '✅' : obj.score >= 70 ? '⚠️' : '❌';
      console.log(`${status} ${obj.name}: ${obj.score}%`);
    });
    
    const avgScore = Math.round(objectives.reduce((sum, obj) => sum + obj.score, 0) / objectives.length);
    
    console.log(`\n📊 OVERALL SCORE: ${avgScore}%`);
    
    console.log('\nSTRENGTHS:');
    strengths.forEach(s => console.log(`  ✅ ${s}`));
    
    if (issues.length > 0) {
      console.log('\nISSUES TO ADDRESS:');
      issues.slice(0, 10).forEach(i => console.log(`  ❌ ${i}`));
      if (issues.length > 10) {
        console.log(`  ... and ${issues.length - 10} more issues`);
      }
    }
    
    // RECOMMENDATIONS
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Create November lesson plans to continue the progression');
    console.log('2. Ensure all lessons have French vocabulary integration');
    console.log('3. Link more curriculum expectations to lessons');
    console.log('4. Maintain 3-4 lessons per day maximum');
    console.log('5. Continue monthly celebration pattern');
    
    return {
      score: avgScore,
      strengths,
      issues: issues.slice(0, 20),
      readyForNovember: avgScore >= 85,
      frenchIntegration: integrationPercent,
      lessonsCount: allLessons.length
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run review
reviewPrimaryObjectives()
  .then(result => {
    console.log('\n✅ Primary Objectives Review Complete');
    console.log(`Ready for November: ${result.readyForNovember ? 'YES' : 'NO'}`);
    process.exit(result.readyForNovember ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Review failed:', error);
    process.exit(1);
  });