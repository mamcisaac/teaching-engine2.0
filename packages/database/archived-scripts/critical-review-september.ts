#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalReviewSeptember() {
  console.log('🔍 CRITICAL REVIEW: September 2025 Lessons\n');
  console.log('Primary Objectives Check:\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) throw new Error('Emily not found');
    
    // Get all September lessons
    const septemberLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        }
      },
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
    
    console.log(`Total Lessons: ${septemberLessons.length}\n`);
    
    // Analyze by subject
    const subjectAnalysis = new Map();
    const issues = [];
    const strengths = [];
    
    septemberLessons.forEach(lesson => {
      const subject = lesson.subject || 'Unknown';
      
      if (!subjectAnalysis.has(subject)) {
        subjectAnalysis.set(subject, {
          count: 0,
          hasThreePartStructure: 0,
          hasDifferentiation: 0,
          hasFrenchIntegration: 0,
          isSubFriendly: 0,
          totalDuration: 0
        });
      }
      
      const analysis = subjectAnalysis.get(subject);
      analysis.count++;
      analysis.totalDuration += lesson.duration || 0;
      
      // Check three-part structure
      if (lesson.mindsOn && lesson.action && lesson.consolidation) {
        analysis.hasThreePartStructure++;
      } else {
        issues.push(`${subject} lesson "${lesson.titleFr}" missing three-part structure`);
      }
      
      // Check differentiation
      if (lesson.differentiationStrategies || lesson.accommodations) {
        analysis.hasDifferentiation++;
      } else {
        issues.push(`${subject} lesson "${lesson.titleFr}" missing differentiation`);
      }
      
      // Check French integration (for non-French subjects)
      if (subject !== 'Français langue première') {
        if (lesson.learningGoals?.includes('French') || 
            lesson.learningGoals?.includes('français')) {
          analysis.hasFrenchIntegration++;
        }
      }
      
      // Check sub-friendly
      if (lesson.isSubFriendly) {
        analysis.isSubFriendly++;
      }
    });
    
    // PRIMARY OBJECTIVE 1: French Immersion Focus
    console.log('📚 PRIMARY OBJECTIVE 1: French Immersion Focus');
    console.log('================================================');
    
    const frenchLessons = subjectAnalysis.get('Français langue première');
    if (frenchLessons) {
      const frenchPercent = (frenchLessons.count / septemberLessons.length * 100).toFixed(1);
      console.log(`✅ French lessons: ${frenchLessons.count} (${frenchPercent}% of total)`);
      
      if (frenchLessons.count >= 19) {
        strengths.push('Strong French presence with 19+ lessons');
      } else {
        issues.push(`Only ${frenchLessons.count} French lessons (should be 19-20)`);
      }
    } else {
      issues.push('CRITICAL: No French lessons found!');
    }
    
    // Check French integration in other subjects
    let totalIntegration = 0;
    let totalNonFrench = 0;
    
    subjectAnalysis.forEach((analysis, subject) => {
      if (subject !== 'Français langue première') {
        totalNonFrench += analysis.count;
        totalIntegration += analysis.hasFrenchIntegration;
      }
    });
    
    const integrationPercent = totalNonFrench > 0 ? 
      (totalIntegration / totalNonFrench * 100).toFixed(1) : 0;
    
    console.log(`✅ French integration in other subjects: ${totalIntegration}/${totalNonFrench} (${integrationPercent}%)`);
    
    if (Number(integrationPercent) > 80) {
      strengths.push('Excellent French integration across subjects');
    } else if (Number(integrationPercent) < 50) {
      issues.push('Insufficient French integration in other subjects');
    }
    
    // PRIMARY OBJECTIVE 2: Age-Appropriate for Grade 1
    console.log('\n👶 PRIMARY OBJECTIVE 2: Age-Appropriate for Grade 1');
    console.log('====================================================');
    
    let totalMinutes = 0;
    let lessonsOver60Min = 0;
    
    septemberLessons.forEach(lesson => {
      totalMinutes += lesson.duration || 0;
      if ((lesson.duration || 0) > 60) {
        lessonsOver60Min++;
      }
    });
    
    const avgDuration = Math.round(totalMinutes / septemberLessons.length);
    console.log(`✅ Average lesson duration: ${avgDuration} minutes`);
    
    if (avgDuration <= 60) {
      strengths.push('Age-appropriate lesson durations');
    } else {
      issues.push(`Lessons too long for Grade 1 (avg ${avgDuration} min)`);
    }
    
    if (lessonsOver60Min > 0) {
      console.log(`⚠️  ${lessonsOver60Min} lessons exceed 60 minutes`);
      issues.push(`${lessonsOver60Min} lessons too long for Grade 1 attention span`);
    }
    
    // PRIMARY OBJECTIVE 3: Pedagogical Quality
    console.log('\n🎓 PRIMARY OBJECTIVE 3: Pedagogical Quality');
    console.log('============================================');
    
    let totalThreePart = 0;
    let totalDifferentiated = 0;
    let totalSubFriendly = 0;
    
    subjectAnalysis.forEach(analysis => {
      totalThreePart += analysis.hasThreePartStructure;
      totalDifferentiated += analysis.hasDifferentiation;
      totalSubFriendly += analysis.isSubFriendly;
    });
    
    const threePartPercent = (totalThreePart / septemberLessons.length * 100).toFixed(1);
    const diffPercent = (totalDifferentiated / septemberLessons.length * 100).toFixed(1);
    const subPercent = (totalSubFriendly / septemberLessons.length * 100).toFixed(1);
    
    console.log(`✅ Three-part structure: ${totalThreePart}/${septemberLessons.length} (${threePartPercent}%)`);
    console.log(`✅ Differentiation included: ${totalDifferentiated}/${septemberLessons.length} (${diffPercent}%)`);
    console.log(`✅ Sub-friendly: ${totalSubFriendly}/${septemberLessons.length} (${subPercent}%)`);
    
    if (Number(threePartPercent) === 100) {
      strengths.push('Perfect three-part lesson structure throughout');
    } else if (Number(threePartPercent) < 80) {
      issues.push('Missing three-part structure in some lessons');
    }
    
    // PRIMARY OBJECTIVE 4: Curriculum Coverage
    console.log('\n📋 PRIMARY OBJECTIVE 4: Curriculum Coverage');
    console.log('===========================================');
    
    const expectationsCovered = new Set();
    septemberLessons.forEach(lesson => {
      lesson.expectations.forEach(exp => {
        expectationsCovered.add(exp.expectation.code);
      });
    });
    
    console.log(`✅ Curriculum expectations covered: ${expectationsCovered.size}`);
    console.log(`   Codes: ${Array.from(expectationsCovered).sort().join(', ')}`);
    
    if (expectationsCovered.size >= 15) {
      strengths.push(`Strong curriculum coverage with ${expectationsCovered.size} expectations`);
    } else if (expectationsCovered.size < 10) {
      issues.push(`Weak curriculum coverage - only ${expectationsCovered.size} expectations`);
    }
    
    // PRIMARY OBJECTIVE 5: Teacher Sustainability
    console.log('\n💪 PRIMARY OBJECTIVE 5: Teacher Sustainability');
    console.log('==============================================');
    
    // Check daily load
    const lessonsByDate = new Map();
    septemberLessons.forEach(lesson => {
      const dateKey = lesson.date.toISOString().split('T')[0];
      if (!lessonsByDate.has(dateKey)) {
        lessonsByDate.set(dateKey, []);
      }
      lessonsByDate.get(dateKey).push(lesson);
    });
    
    let overloadedDays = 0;
    let maxLessonsPerDay = 0;
    
    lessonsByDate.forEach((lessons, date) => {
      if (lessons.length > 5) {
        overloadedDays++;
      }
      maxLessonsPerDay = Math.max(maxLessonsPerDay, lessons.length);
    });
    
    console.log(`✅ Max lessons per day: ${maxLessonsPerDay}`);
    console.log(`✅ Days with 5+ lessons: ${overloadedDays}`);
    
    if (maxLessonsPerDay <= 5) {
      strengths.push('Manageable daily teaching load');
    } else {
      issues.push(`Overloaded days with ${maxLessonsPerDay} lessons`);
    }
    
    // CRITICAL ISSUES CHECK
    console.log('\n⚠️  CRITICAL ISSUES CHECK');
    console.log('==========================');
    
    // Check for weekend lessons
    let weekendLessons = 0;
    septemberLessons.forEach(lesson => {
      const day = lesson.date.getDay();
      if (day === 0 || day === 6) {
        weekendLessons++;
        issues.push(`Lesson on weekend: ${lesson.titleFr} on ${lesson.date.toDateString()}`);
      }
    });
    
    if (weekendLessons === 0) {
      console.log('✅ No weekend lessons');
    } else {
      console.log(`❌ ${weekendLessons} lessons scheduled on weekends!`);
    }
    
    // FINAL ASSESSMENT
    console.log('\n🏆 FINAL ASSESSMENT');
    console.log('===================');
    
    console.log('\nSTRENGTHS:');
    strengths.forEach(s => console.log(`  ✅ ${s}`));
    
    if (issues.length > 0) {
      console.log('\nISSUES TO FIX:');
      issues.slice(0, 10).forEach(i => console.log(`  ❌ ${i}`));
      if (issues.length > 10) {
        console.log(`  ... and ${issues.length - 10} more issues`);
      }
    }
    
    // Overall rating
    const score = Math.max(0, 100 - (issues.length * 5));
    console.log(`\n📊 QUALITY SCORE: ${score}/100`);
    
    if (score >= 90) {
      console.log('✅ EXCELLENT - Ready for use!');
    } else if (score >= 70) {
      console.log('⚠️  GOOD - Minor improvements needed');
    } else {
      console.log('❌ NEEDS WORK - Critical issues to address');
    }
    
    // Check transition readiness
    console.log('\n🔄 OCTOBER READINESS CHECK');
    console.log('==========================');
    
    const lastSeptLesson = septemberLessons[septemberLessons.length - 1];
    if (lastSeptLesson?.date.getDate() === 30) {
      console.log('✅ September ends properly on the 30th');
      console.log(`   Final lesson: ${lastSeptLesson.titleFr}`);
    } else {
      console.log('⚠️  September schedule may need adjustment');
    }
    
    return {
      totalLessons: septemberLessons.length,
      score,
      strengths,
      issues: issues.slice(0, 10),
      readyForOctober: score >= 70
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run review
criticalReviewSeptember()
  .then(result => {
    console.log('\n📋 Review Complete');
    console.log(`Ready for October: ${result.readyForOctober ? 'YES' : 'NO'}`);
  })
  .catch(error => {
    console.error('💥 Review failed:', error);
    process.exit(1);
  });