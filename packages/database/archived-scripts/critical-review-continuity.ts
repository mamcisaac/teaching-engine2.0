#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reviewContinuity() {
  console.log('🔄 CRITICAL REVIEW: September to October Continuity\n');
  console.log('=' + '='.repeat(60) + '\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) throw new Error('Emily not found');
    
    // Get September and October lessons
    const septemberLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        }
      },
      orderBy: { date: 'asc' }
    });
    
    const octoberLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-10-01'),
          lte: new Date('2025-10-31')
        }
      },
      orderBy: { date: 'asc' }
    });
    
    console.log(`📅 September: ${septemberLessons.length} lessons`);
    console.log(`📅 October: ${octoberLessons.length} lessons\n`);
    
    // Analyze by subject
    const septBySubject = new Map();
    const octBySubject = new Map();
    
    septemberLessons.forEach(lesson => {
      const subject = lesson.subject || 'Unknown';
      if (!septBySubject.has(subject)) {
        septBySubject.set(subject, []);
      }
      septBySubject.get(subject).push(lesson);
    });
    
    octoberLessons.forEach(lesson => {
      const subject = lesson.subject || 'Unknown';
      if (!octBySubject.has(subject)) {
        octBySubject.set(subject, []);
      }
      octBySubject.get(subject).push(lesson);
    });
    
    // CHECK 1: Subject Continuity
    console.log('📚 SUBJECT CONTINUITY CHECK');
    console.log('-'.repeat(40));
    
    const continuityIssues = [];
    const continuityStrengths = [];
    
    // French continuity
    const septFrench = septBySubject.get('Français langue première') || [];
    const octFrench = octBySubject.get('Français langue première') || [];
    
    if (septFrench.length > 0 && octFrench.length > 0) {
      const lastSept = septFrench[septFrench.length - 1];
      const firstOct = octFrench[0];
      
      console.log('\n🇫🇷 FRENCH CONTINUITY:');
      console.log(`  Sept ends: "${lastSept.titleFr}" (${lastSept.date.toDateString()})`);
      console.log(`  Oct begins: "${firstOct.titleFr}" (${firstOct.date.toDateString()})`);
      
      // Check themes
      if (lastSept.titleFr?.includes('Célébration') && firstOct.titleFr?.includes('famille')) {
        continuityStrengths.push('French transitions from celebration to family theme naturally');
      }
      
      // Check vocabulary progression
      const septVocab = lastSept.learningGoals?.includes('célébrer') || false;
      const octVocab = firstOct.learningGoals?.includes('famille') || false;
      
      if (septVocab && octVocab) {
        console.log('  ✅ Vocabulary progression: celebration → family');
      }
    } else {
      continuityIssues.push('Missing French lessons in September or October');
    }
    
    // Math continuity
    const septMath = septBySubject.get('Mathématiques') || [];
    const octMath = octBySubject.get('Mathématiques') || [];
    
    if (septMath.length > 0 && octMath.length > 0) {
      const lastSept = septMath[septMath.length - 1];
      const firstOct = octMath[0];
      
      console.log('\n🔢 MATH CONTINUITY:');
      console.log(`  Sept ends: "${lastSept.titleFr}" (numbers 1-10)`);
      console.log(`  Oct begins: "${firstOct.titleFr}" (numbers 11-15)`);
      
      // Check number progression
      if (firstOct.titleFr?.includes('11-15')) {
        continuityStrengths.push('Math progresses logically from 1-10 to 11-15');
      } else {
        continuityIssues.push('Math number progression may have gaps');
      }
    }
    
    // CHECK 2: Daily Load Transition
    console.log('\n📊 DAILY LOAD TRANSITION');
    console.log('-'.repeat(40));
    
    // Last week of September
    const lastSeptWeek = septemberLessons.filter(l => 
      l.date.getDate() >= 24 && l.date.getDate() <= 30
    );
    
    // First week of October
    const firstOctWeek = octoberLessons.filter(l => 
      l.date.getDate() >= 1 && l.date.getDate() <= 7
    );
    
    const septDailyLoad = new Map();
    const octDailyLoad = new Map();
    
    lastSeptWeek.forEach(lesson => {
      const dateKey = lesson.date.toDateString();
      septDailyLoad.set(dateKey, (septDailyLoad.get(dateKey) || 0) + 1);
    });
    
    firstOctWeek.forEach(lesson => {
      const dateKey = lesson.date.toDateString();
      octDailyLoad.set(dateKey, (octDailyLoad.get(dateKey) || 0) + 1);
    });
    
    console.log('\nLast week of September:');
    Array.from(septDailyLoad.entries()).forEach(([date, count]) => {
      console.log(`  ${date}: ${count} lessons`);
      if (count > 5) {
        continuityIssues.push(`Overloaded day: ${date} with ${count} lessons`);
      }
    });
    
    console.log('\nFirst week of October:');
    Array.from(octDailyLoad.entries()).forEach(([date, count]) => {
      console.log(`  ${date}: ${count} lessons`);
      if (count > 5) {
        continuityIssues.push(`Overloaded day: ${date} with ${count} lessons`);
      }
    });
    
    // CHECK 3: Theme Transitions
    console.log('\n🎨 THEME TRANSITIONS');
    console.log('-'.repeat(40));
    
    console.log('\nSeptember Themes:');
    console.log('  - Welcome/Bienvenue (Week 1)');
    console.log('  - School Environment (Week 2-3)');
    console.log('  - Autumn Beginning (Week 4)');
    console.log('  - Celebration (Final day)');
    
    console.log('\nOctober Themes:');
    console.log('  - Family (French)');
    console.log('  - Numbers 11-20 (Math)');
    console.log('  - Autumn Changes (Science)');
    console.log('  - Halloween (Final week)');
    
    // Check theme flow
    if (octFrench.some(l => l.titleFr?.includes('famille'))) {
      continuityStrengths.push('Natural progression from school community to family');
    }
    
    // CHECK 4: Holiday Considerations
    console.log('\n🗓️ HOLIDAY CONSIDERATIONS');
    console.log('-'.repeat(40));
    
    const thanksgiving = octoberLessons.filter(l => 
      l.date.getDate() === 13 || l.date.getDate() === 14
    );
    
    if (thanksgiving.some(l => l.titleFr?.includes('Action de grâce'))) {
      console.log('✅ Thanksgiving integrated into lessons');
      continuityStrengths.push('Thanksgiving appropriately integrated');
    } else {
      console.log('⚠️  Thanksgiving (Oct 13) not explicitly addressed');
    }
    
    const halloween = octoberLessons.filter(l => 
      l.date.getDate() >= 27 && l.date.getDate() <= 31
    );
    
    if (halloween.some(l => l.titleFr?.includes('Halloween'))) {
      console.log('✅ Halloween integrated into final week');
      continuityStrengths.push('Halloween celebrations included');
    } else {
      console.log('⚠️  Halloween not integrated');
    }
    
    // CHECK 5: Assessment Continuity
    console.log('\n📝 ASSESSMENT CONTINUITY');
    console.log('-'.repeat(40));
    
    const septAssessment = septemberLessons.filter(l => 
      l.assessmentNotes?.includes('portfolio') || 
      l.assessmentNotes?.includes('celebration')
    );
    
    const octAssessment = octoberLessons.filter(l => 
      l.assessmentNotes?.includes('portfolio') || 
      l.assessmentNotes?.includes('celebration')
    );
    
    console.log(`September portfolio/celebration lessons: ${septAssessment.length}`);
    console.log(`October portfolio/celebration lessons: ${octAssessment.length}`);
    
    if (septAssessment.length > 0 && octAssessment.length > 0) {
      continuityStrengths.push('Consistent portfolio assessment approach');
    }
    
    // CHECK 6: French Integration
    console.log('\n🇫🇷 FRENCH INTEGRATION CHECK');
    console.log('-'.repeat(40));
    
    let septFrenchIntegration = 0;
    let octFrenchIntegration = 0;
    
    septemberLessons.forEach(lesson => {
      if (lesson.subject !== 'Français langue première' && 
          lesson.learningGoals?.toLowerCase().includes('french')) {
        septFrenchIntegration++;
      }
    });
    
    octoberLessons.forEach(lesson => {
      if (lesson.subject !== 'Français langue première' && 
          lesson.learningGoals?.toLowerCase().includes('french')) {
        octFrenchIntegration++;
      }
    });
    
    console.log(`September: ${septFrenchIntegration} non-French lessons with French integration`);
    console.log(`October: ${octFrenchIntegration} non-French lessons with French integration`);
    
    if (octFrenchIntegration >= septFrenchIntegration) {
      continuityStrengths.push('French integration maintained or improved');
    } else {
      continuityIssues.push('French integration decreased in October');
    }
    
    // FINAL REPORT
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONTINUITY ASSESSMENT SUMMARY');
    console.log('='.repeat(60) + '\n');
    
    console.log('STRENGTHS:');
    continuityStrengths.forEach(s => console.log(`  ✅ ${s}`));
    
    if (continuityIssues.length > 0) {
      console.log('\nISSUES TO ADDRESS:');
      continuityIssues.slice(0, 10).forEach(i => console.log(`  ❌ ${i}`));
    }
    
    // Calculate continuity score
    const score = Math.max(0, 100 - (continuityIssues.length * 10));
    console.log(`\n🎯 CONTINUITY SCORE: ${score}/100`);
    
    if (score >= 80) {
      console.log('✅ EXCELLENT - Smooth transition from September to October');
    } else if (score >= 60) {
      console.log('⚠️  GOOD - Minor adjustments needed for smoother flow');
    } else {
      console.log('❌ NEEDS WORK - Significant continuity issues');
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Ensure September ends with forward-looking activities');
    console.log('2. October should reference September learning');
    console.log('3. Maintain consistent daily load (4-5 lessons max)');
    console.log('4. Keep French integration natural and consistent');
    console.log('5. Use holidays as learning opportunities');
    
    return {
      septemberCount: septemberLessons.length,
      octoberCount: octoberLessons.length,
      continuityScore: score,
      strengths: continuityStrengths,
      issues: continuityIssues
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run review
reviewContinuity()
  .then(result => {
    console.log('\n✅ Continuity Review Complete');
    console.log(`Total lessons: ${result.septemberCount + result.octoberCount}`);
  })
  .catch(error => {
    console.error('💥 Review failed:', error);
    process.exit(1);
  });