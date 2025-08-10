#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  count?: number;
  issues?: string[];
}

async function completeSystemAudit() {
  console.log('🔍 COMPLETE SYSTEM AUDIT - Teaching Engine 2.0\n');
  console.log('=' + '='.repeat(60) + '\n');
  
  const results: AuditResult[] = [];
  
  try {
    // 1. USER CHECK
    console.log('👤 Checking User Account...');
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (emily) {
      results.push({
        component: 'User Account',
        status: 'PASS',
        details: 'Emily\'s account exists and is active'
      });
    } else {
      results.push({
        component: 'User Account',
        status: 'FAIL',
        details: 'Emily\'s account not found',
        issues: ['Run seed scripts to create user']
      });
      throw new Error('Cannot continue without user account');
    }
    
    // 2. CURRICULUM EXPECTATIONS
    console.log('📚 Checking Curriculum Expectations...');
    const expectations = await prisma.curriculumExpectation.count();
    const expectationsBySubject = await prisma.curriculumExpectation.groupBy({
      by: ['subject'],
      _count: { id: true }
    });
    
    results.push({
      component: 'Curriculum Expectations',
      status: expectations >= 60 ? 'PASS' : 'WARNING',
      details: `${expectations} total expectations loaded`,
      count: expectations,
      issues: expectations < 60 ? ['May need more curriculum expectations'] : undefined
    });
    
    // 3. LONG RANGE PLANS
    console.log('📅 Checking Long Range Plans...');
    const lrps = await prisma.longRangePlan.findMany({
      where: { userId: emily.id }
    });
    
    const requiredSubjects = [
      'Français langue première',
      'Mathématiques', 
      'Sciences de la nature',
      'Arts'
    ];
    
    const missingSubjects = requiredSubjects.filter(subj => 
      !lrps.some(lrp => lrp.subject === subj)
    );
    
    results.push({
      component: 'Long Range Plans',
      status: missingSubjects.length === 0 ? 'PASS' : 'WARNING',
      details: `${lrps.length} LRPs created`,
      count: lrps.length,
      issues: missingSubjects.length > 0 ? [`Missing: ${missingSubjects.join(', ')}`] : undefined
    });
    
    // 4. UNIT PLANS
    console.log('📖 Checking Unit Plans...');
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true
      }
    });
    
    const unitsBySubject = new Map();
    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!unitsBySubject.has(subject)) {
        unitsBySubject.set(subject, []);
      }
      unitsBySubject.get(subject).push(unit);
    });
    
    results.push({
      component: 'Unit Plans',
      status: unitPlans.length >= 20 ? 'PASS' : 'WARNING',
      details: `${unitPlans.length} units across ${unitsBySubject.size} subjects`,
      count: unitPlans.length,
      issues: unitPlans.length < 20 ? ['Consider adding more unit plans'] : undefined
    });
    
    // 5. LESSON PLANS - SEPTEMBER
    console.log('📝 Checking September Lesson Plans...');
    const septLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-09-01'),
          lte: new Date('2025-09-30')
        }
      }
    });
    
    const septBySubject = new Map();
    const septIssues = [];
    
    septLessons.forEach(lesson => {
      const subject = lesson.subject || 'Unknown';
      septBySubject.set(subject, (septBySubject.get(subject) || 0) + 1);
      
      // Check for weekend lessons
      if (lesson.date.getDay() === 0 || lesson.date.getDay() === 6) {
        septIssues.push(`Weekend lesson: ${lesson.titleFr} on ${lesson.date.toDateString()}`);
      }
      
      // Check for missing components
      if (!lesson.mindsOn || !lesson.action || !lesson.consolidation) {
        septIssues.push(`Incomplete structure: ${lesson.titleFr}`);
      }
    });
    
    results.push({
      component: 'September Lessons',
      status: septLessons.length >= 60 && septIssues.length === 0 ? 'PASS' : 
              septLessons.length >= 40 ? 'WARNING' : 'FAIL',
      details: `${septLessons.length} lessons across ${septBySubject.size} subjects`,
      count: septLessons.length,
      issues: septIssues.slice(0, 5)
    });
    
    // 6. LESSON PLANS - OCTOBER
    console.log('📝 Checking October Lesson Plans...');
    const octLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        date: {
          gte: new Date('2025-10-01'),
          lte: new Date('2025-10-31')
        }
      }
    });
    
    const octBySubject = new Map();
    const octIssues = [];
    
    octLessons.forEach(lesson => {
      const subject = lesson.subject || 'Unknown';
      octBySubject.set(subject, (octBySubject.get(subject) || 0) + 1);
      
      if (lesson.date.getDay() === 0 || lesson.date.getDay() === 6) {
        octIssues.push(`Weekend lesson: ${lesson.titleFr} on ${lesson.date.toDateString()}`);
      }
    });
    
    results.push({
      component: 'October Lessons',
      status: octLessons.length >= 40 && octIssues.length === 0 ? 'PASS' : 
              octLessons.length >= 20 ? 'WARNING' : 'FAIL',
      details: `${octLessons.length} lessons across ${octBySubject.size} subjects`,
      count: octLessons.length,
      issues: octIssues.slice(0, 5)
    });
    
    // 7. DAILY LOAD CHECK
    console.log('⚖️ Checking Daily Teaching Loads...');
    const allLessons = [...septLessons, ...octLessons];
    const lessonsByDate = new Map();
    const overloadedDays = [];
    
    allLessons.forEach(lesson => {
      const dateKey = lesson.date.toDateString();
      lessonsByDate.set(dateKey, (lessonsByDate.get(dateKey) || 0) + 1);
    });
    
    lessonsByDate.forEach((count, date) => {
      if (count > 5) {
        overloadedDays.push(`${date}: ${count} lessons`);
      }
    });
    
    results.push({
      component: 'Daily Load Balance',
      status: overloadedDays.length === 0 ? 'PASS' : 
              overloadedDays.length <= 2 ? 'WARNING' : 'FAIL',
      details: `${overloadedDays.length} days with >5 lessons`,
      issues: overloadedDays
    });
    
    // 8. FRENCH INTEGRATION CHECK
    console.log('🇫🇷 Checking French Integration...');
    let frenchIntegrated = 0;
    let totalNonFrench = 0;
    
    allLessons.forEach(lesson => {
      if (lesson.subject !== 'Français langue première') {
        totalNonFrench++;
        if (lesson.learningGoals?.toLowerCase().includes('french') || 
            lesson.learningGoals?.toLowerCase().includes('français')) {
          frenchIntegrated++;
        }
      }
    });
    
    const integrationPercent = totalNonFrench > 0 ? 
      Math.round((frenchIntegrated / totalNonFrench) * 100) : 0;
    
    results.push({
      component: 'French Integration',
      status: integrationPercent >= 70 ? 'PASS' : 
              integrationPercent >= 50 ? 'WARNING' : 'FAIL',
      details: `${integrationPercent}% of non-French lessons have French integration`,
      count: frenchIntegrated
    });
    
    // 9. ASSESSMENT STRATEGY CHECK
    console.log('📊 Checking Assessment Strategies...');
    let hasAssessment = 0;
    let isSubFriendly = 0;
    
    allLessons.forEach(lesson => {
      if (lesson.assessmentNotes && lesson.assessmentType) {
        hasAssessment++;
      }
      if (lesson.isSubFriendly) {
        isSubFriendly++;
      }
    });
    
    const assessmentPercent = allLessons.length > 0 ? 
      Math.round((hasAssessment / allLessons.length) * 100) : 0;
    const subPercent = allLessons.length > 0 ? 
      Math.round((isSubFriendly / allLessons.length) * 100) : 0;
    
    results.push({
      component: 'Assessment & Sub-Friendly',
      status: assessmentPercent >= 90 && subPercent >= 90 ? 'PASS' : 'WARNING',
      details: `${assessmentPercent}% with assessment, ${subPercent}% sub-friendly`,
      issues: assessmentPercent < 90 ? ['Some lessons missing assessment strategy'] : undefined
    });
    
    // 10. DATA INTEGRITY CHECK
    console.log('🔐 Checking Data Integrity...');
    // Check for lessons without unit plans - requires different approach
    const allLessonsWithUnits = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id
      },
      select: {
        id: true,
        titleFr: true,
        unitPlanId: true
      }
    });
    
    const orphanedLessons = allLessonsWithUnits.filter(l => !l.unitPlanId);
    
    const duplicateDates = await prisma.$queryRaw`
      SELECT date, subject, COUNT(*) as count
      FROM ETFOLessonPlan
      WHERE userId = ${emily.id}
      GROUP BY date, subject
      HAVING COUNT(*) > 1
    ` as any[];
    
    results.push({
      component: 'Data Integrity',
      status: orphanedLessons.length === 0 && duplicateDates.length === 0 ? 'PASS' : 'WARNING',
      details: `${orphanedLessons.length} orphaned lessons, ${duplicateDates.length} duplicate dates`,
      issues: duplicateDates.length > 0 ? ['Some subjects have multiple lessons on same day'] : undefined
    });
    
    // FINAL REPORT
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUDIT RESULTS SUMMARY');
    console.log('='.repeat(60) + '\n');
    
    const passCount = results.filter(r => r.status === 'PASS').length;
    const warnCount = results.filter(r => r.status === 'WARNING').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;
    
    results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : 
                   result.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${icon} ${result.component}`);
      console.log(`   ${result.details}`);
      if (result.issues && result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      console.log('');
    });
    
    // OVERALL SCORE
    const score = Math.round((passCount / results.length) * 100);
    console.log('='.repeat(60));
    console.log(`🎯 OVERALL SYSTEM SCORE: ${score}%`);
    console.log(`   ✅ Passed: ${passCount}`);
    console.log(`   ⚠️  Warnings: ${warnCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    
    // RECOMMENDATIONS
    console.log('\n💡 CRITICAL ACTIONS NEEDED:');
    if (failCount > 0) {
      console.log('1. Address all FAILED components immediately');
    }
    if (warnCount > 0) {
      console.log('2. Review WARNING components for improvements');
    }
    if (overloadedDays.length > 0) {
      console.log('3. Redistribute lessons on overloaded days');
    }
    if (octBySubject.size < 4) {
      console.log('4. Add missing subject lessons for October');
    }
    
    // SYSTEM STATUS
    console.log('\n🚦 SYSTEM STATUS:');
    if (score >= 90 && failCount === 0) {
      console.log('✅ PRODUCTION READY - System is excellent!');
    } else if (score >= 70 && failCount <= 1) {
      console.log('⚠️  NEARLY READY - Minor fixes needed');
    } else {
      console.log('❌ NOT READY - Critical issues must be resolved');
    }
    
    return {
      score,
      results,
      totalLessons: allLessons.length,
      septemberLessons: septLessons.length,
      octoberLessons: octLessons.length,
      overloadedDays: overloadedDays.length,
      ready: score >= 90 && failCount === 0
    };
    
  } catch (error) {
    console.error('❌ Audit Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run audit
completeSystemAudit()
  .then(result => {
    console.log('\n✅ Audit Complete');
    console.log(`System Ready: ${result.ready ? 'YES' : 'NO'}`);
    process.exit(result.ready ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Audit failed:', error);
    process.exit(1);
  });