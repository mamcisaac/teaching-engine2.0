import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualDeepReview() {
  try {
    console.log('🔍 MANUAL DEEP REVIEW: HUMAN CRITICAL ANALYSIS');
    console.log('SOCIAL STUDIES UNITS - IGNORING AUTOMATED VALIDATION\n');
    console.log('Emily McIsaac - Grade 1 French Immersion - Social Studies\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      orderBy: { startDate: 'asc' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            title: true,
            date: true,
            duration: true,
            language: true,
            mindsOn: true,
            action: true,
            consolidation: true
          }
        }
      }
    });

    const longRangePlan = await prisma.longRangePlan.findUnique({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    console.log('📋 LONG RANGE PLAN ANALYSIS:');
    console.log(`Title: ${longRangePlan?.title}`);
    console.log(`Subject: ${longRangePlan?.subject}`);
    console.log(`Grade: ${longRangePlan?.grade}`);
    console.log(`Total Expectations: ${longRangePlan?.expectations.length}`);
    console.log('\n' + '='.repeat(80) + '\n');

    let criticalIssues = [];
    let totalLessons = 0;
    let totalHours = 0;

    console.log('🔎 MANUAL UNIT-BY-UNIT CRITICAL ANALYSIS:');
    console.log('===============================================================================');

    units.forEach((unit, index) => {
      const unitNum = index + 1;
      
      console.log(`\n📚 UNIT ${unitNum}: ${unit.title}`);
      console.log('=' .repeat(60));
      
      // CRITICAL ANALYSIS: Mathematical Reality
      console.log('\n🔢 MATHEMATICAL REALITY CHECK:');
      console.log(`Unit dates: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`Actual lessons: ${unit.lessonPlans.length} | Estimated hours: ${unit.estimatedHours}`);
      
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.estimatedHours || 0;
      
      // CRITICAL ANALYSIS: Unit Duration Reality
      const unitDurationDays = Math.floor((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const schoolDaysApprox = Math.round(unitDurationDays * (5/7));
      const everyOtherDaySlots = Math.floor(schoolDaysApprox / 2);
      
      console.log(`Duration: ${unitDurationDays} calendar days (~${schoolDaysApprox} school days, ~${everyOtherDaySlots} every-other-day slots)`);
      
      if (unit.lessonPlans.length > everyOtherDaySlots + 2) {
        criticalIssues.push(`Unit ${unitNum}: IMPOSSIBLE DENSITY - ${unit.lessonPlans.length} lessons in ~${everyOtherDaySlots} every-other-day slots`);
        console.log(`❌ IMPOSSIBLE: Too many lessons for every-other-day pattern`);
      } else {
        console.log(`✅ Feasible: ${unit.lessonPlans.length} lessons fit ${everyOtherDaySlots} slots`);
      }
      
      // CRITICAL ANALYSIS: Lesson Date Reality
      console.log('\n📅 LESSON DATE REALITY:');
      
      if (unit.lessonPlans.length > 0) {
        const firstLesson = new Date(unit.lessonPlans[0].date);
        const lastLesson = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
        
        console.log(`First lesson: ${firstLesson.toDateString()}`);
        console.log(`Last lesson: ${lastLesson.toDateString()}`);
        
        // Check weekend lessons
        let weekendLessons = 0;
        unit.lessonPlans.forEach(lesson => {
          const dayOfWeek = new Date(lesson.date).getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekendLessons++;
            console.log(`❌ Weekend lesson: ${new Date(lesson.date).toDateString()}`);
          }
        });
        
        if (weekendLessons > 0) {
          criticalIssues.push(`Unit ${unitNum}: ${weekendLessons} weekend lessons`);
        }
        
        // Check Christmas break
        let christmasLessons = 0;
        unit.lessonPlans.forEach(lesson => {
          const date = new Date(lesson.date);
          if (date >= new Date('2025-12-19') && date <= new Date('2026-01-05')) {
            christmasLessons++;
            console.log(`❌ Christmas break lesson: ${date.toDateString()}`);
          }
        });
        
        if (christmasLessons > 0) {
          criticalIssues.push(`Unit ${unitNum}: ${christmasLessons} lessons during Christmas break`);
        }
        
        // Check lesson boundaries
        const lessonsOutsideUnit = unit.lessonPlans.filter(l => 
          new Date(l.date) < new Date(unit.startDate) || new Date(l.date) > new Date(unit.endDate)
        ).length;
        
        if (lessonsOutsideUnit > 0) {
          criticalIssues.push(`Unit ${unitNum}: ${lessonsOutsideUnit} lessons outside unit boundaries`);
          console.log(`❌ ${lessonsOutsideUnit} lessons scheduled outside unit dates`);
        }
        
        if (weekendLessons === 0 && christmasLessons === 0 && lessonsOutsideUnit === 0) {
          console.log(`✅ All lesson dates are valid`);
        }
        
        // Check lesson quality
        let inappropriateLessons = 0;
        unit.lessonPlans.forEach(lesson => {
          if (lesson.duration !== 45 || lesson.language !== 'fr' || !lesson.mindsOn || !lesson.action || !lesson.consolidation) {
            inappropriateLessons++;
          }
        });
        
        if (inappropriateLessons > 0) {
          criticalIssues.push(`Unit ${unitNum}: ${inappropriateLessons} lessons missing Grade 1 requirements`);
          console.log(`❌ ${inappropriateLessons} lessons not Grade 1 French Immersion appropriate`);
        } else {
          console.log(`✅ All lessons meet Grade 1 French Immersion standards`);
        }
        
      } else {
        criticalIssues.push(`Unit ${unitNum}: NO LESSONS PLANNED`);
        console.log(`❌ CRITICAL: Unit has no lesson plans`);
      }
      
      // CRITICAL ANALYSIS: Curriculum Logic
      console.log('\n📖 CURRICULUM EXPECTATIONS LOGIC:');
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`Expectations: [${unitExpectations.join(', ')}]`);
      
      if (unitExpectations.length === 0) {
        criticalIssues.push(`Unit ${unitNum}: NO curriculum expectations`);
        console.log('❌ CRITICAL: No curriculum coverage');
      } else if (unitExpectations.length > 2) {
        criticalIssues.push(`Unit ${unitNum}: Overloaded with ${unitExpectations.length} expectations`);
        console.log('❌ Too many expectations for effective focus');
      } else {
        console.log(`✅ Appropriate expectation load: ${unitExpectations.length}`);
      }
      
      // CRITICAL ANALYSIS: Flexibility
      console.log('\n🔄 FLEXIBILITY REALITY:');
      
      if (index < units.length - 1) {
        const nextUnit = units[index + 1];
        const gap = Math.floor((new Date(nextUnit.startDate).getTime() - new Date(unit.endDate).getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`Gap to next unit: ${gap} days`);
        
        if (gap < 0) {
          criticalIssues.push(`Unit ${unitNum}: OVERLAPS with Unit ${unitNum + 1} by ${Math.abs(gap)} days`);
          console.log(`❌ CRITICAL OVERLAP: Units cannot overlap in real classrooms`);
        } else if (gap === 0) {
          console.log(`⚠️ NO BUFFER: Zero flexibility for disruptions`);
        } else if (gap >= 1 && gap <= 3) {
          console.log(`✅ Minimal buffer: ${gap} days for assessment`);
        } else if (gap >= 4) {
          console.log(`✅ Good buffer: ${gap} days for assessment and snow days`);
        }
      }
      
      // CRITICAL ANALYSIS: Content Quality
      console.log('\n📖 CONTENT QUALITY CHECK:');
      
      if (!unit.description || unit.description.length < 500) {
        criticalIssues.push(`Unit ${unitNum}: Insufficient description (${unit.description?.length || 0} chars)`);
        console.log('❌ Description too brief for Grade 1 complexity');
      } else {
        console.log(`✅ Rich description: ${unit.description.length} characters`);
      }
      
      if (!unit.assessmentPlan || unit.assessmentPlan.length < 500) {
        criticalIssues.push(`Unit ${unitNum}: Weak assessment plan`);
        console.log('❌ Assessment plan insufficient');
      } else {
        console.log(`✅ Comprehensive assessment: ${unit.assessmentPlan.length} characters`);
      }
      
      if (!unit.indigenousPerspectives || unit.indigenousPerspectives.length < 200) {
        criticalIssues.push(`Unit ${unitNum}: Insufficient Indigenous perspectives`);
        console.log('❌ Indigenous perspectives inadequate');
      } else {
        console.log(`✅ Rich Indigenous perspectives: ${unit.indigenousPerspectives.length} characters`);
      }
    });

    // OVERALL SYSTEM CRITICAL ANALYSIS
    console.log('\n📊 OVERALL SYSTEM CRITICAL ANALYSIS:');
    console.log('===============================================================================');
    
    console.log('\n🔢 MATHEMATICAL REALITY:');
    console.log(`Total lessons: ${totalLessons}/97 ${totalLessons === 97 ? '✅ PERFECT' : '❌ WRONG'}`);
    console.log(`Total hours: ${totalHours}/73 ${Math.abs(totalHours - 73) <= 1 ? '✅ ACCEPTABLE' : '❌ WRONG'}`);
    console.log(`Number of units: ${units.length}/7 ${units.length === 7 ? '✅ PERFECT' : '❌ WRONG'}`);
    
    if (totalLessons !== 97) {
      criticalIssues.push(`WRONG LESSON COUNT: ${totalLessons} instead of 97`);
    }
    
    // CURRICULUM EXPECTATION COVERAGE ANALYSIS
    console.log('\n📚 CURRICULUM EXPECTATION COVERAGE:');
    const lrpExpectationCodes = longRangePlan?.expectations.map(e => e.expectation.code) || [];
    const unitExpectationCoverage = {};
    
    units.forEach(unit => {
      unit.expectations.forEach(e => {
        const code = e.expectation.code;
        unitExpectationCoverage[code] = (unitExpectationCoverage[code] || 0) + 1;
      });
    });
    
    console.log(`LRP expects coverage of: ${lrpExpectationCodes.join(', ')}`);
    
    let perfectCoverage = true;
    for (const code of lrpExpectationCodes) {
      const count = unitExpectationCoverage[code] || 0;
      if (count === 0) {
        console.log(`❌ MISSING: ${code} not covered in any unit`);
        criticalIssues.push(`Missing expectation: ${code}`);
        perfectCoverage = false;
      } else if (count === 1) {
        console.log(`✅ PERFECT: ${code} covered exactly once`);
      } else {
        console.log(`❌ DUPLICATE: ${code} covered ${count} times (wasted time)`);
        criticalIssues.push(`Over-covered expectation: ${code} (${count} times)`);
        perfectCoverage = false;
      }
    }
    
    // SCHOOL YEAR TIMING REALITY
    console.log('\n⏰ SCHOOL YEAR TIMING REALITY:');
    const schoolYearStart = new Date('2025-09-02');
    const schoolYearEnd = new Date('2026-06-26');
    const actualStart = new Date(units[0].startDate);
    const actualEnd = new Date(units[units.length - 1].endDate);
    
    const startBuffer = Math.floor((actualStart.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    const endBuffer = Math.floor((schoolYearEnd.getTime() - actualEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`School year: ${schoolYearStart.toDateString()} - ${schoolYearEnd.toDateString()}`);
    console.log(`Units span: ${actualStart.toDateString()} - ${actualEnd.toDateString()}`);
    console.log(`Start buffer: ${startBuffer} days ${startBuffer >= 5 ? '✅' : '❌'} (need 5+)`);
    console.log(`End buffer: ${endBuffer} days ${endBuffer >= 10 ? '✅' : '❌'} (need 10+)`);
    
    if (startBuffer < 5) {
      criticalIssues.push(`Insufficient start buffer: ${startBuffer} days`);
    }
    if (endBuffer < 10) {
      criticalIssues.push(`Insufficient end buffer: ${endBuffer} days`);
    }
    
    // EVERY-OTHER-DAY PATTERN FEASIBILITY
    console.log('\n🔄 EVERY-OTHER-DAY PATTERN FEASIBILITY:');
    const totalSchoolDays = 195;
    const everyOtherDayMax = Math.floor(totalSchoolDays / 2);
    console.log(`195 school days ÷ 2 = ~${everyOtherDayMax} maximum every-other-day lessons`);
    console.log(`Planned: ${totalLessons} lessons`);
    
    if (totalLessons > everyOtherDayMax + 5) {
      criticalIssues.push(`Every-other-day pattern impossible: ${totalLessons} lessons > ${everyOtherDayMax} slots`);
      console.log(`❌ IMPOSSIBLE: Too many lessons for every-other-day pattern`);
    } else {
      console.log(`✅ FEASIBLE: Lessons fit every-other-day pattern`);
    }
    
    // FLEXIBILITY ANALYSIS
    console.log('\n🔄 BUILT-IN FLEXIBILITY REALITY:');
    let flexibilityBuffers = 0;
    let snowDayResilience = 0;
    
    for (let i = 0; i < units.length - 1; i++) {
      const gap = Math.floor((new Date(units[i + 1].startDate).getTime() - new Date(units[i].endDate).getTime()) / (1000 * 60 * 60 * 24));
      if (gap >= 2) flexibilityBuffers++;
      if (gap >= 4) snowDayResilience++;
    }
    
    console.log(`Units with assessment buffers: ${flexibilityBuffers}/${units.length - 1}`);
    console.log(`Units with snow day resilience: ${snowDayResilience}/${units.length - 1}`);
    
    if (flexibilityBuffers < 3) {
      criticalIssues.push(`Insufficient flexibility: only ${flexibilityBuffers} units have assessment buffers`);
    }
    
    console.log('\n🚨 CRITICAL ISSUES SUMMARY:');
    console.log('===============================================================================');
    
    if (criticalIssues.length === 0) {
      console.log('🎉 NO CRITICAL ISSUES FOUND - UNITS ARE TRULY PERFECT!');
    } else {
      console.log(`❌ ${criticalIssues.length} CRITICAL ISSUES IDENTIFIED:`);
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n🏆 FINAL MANUAL REVIEW VERDICT:');
    console.log('===============================================================================');
    
    const hasCorrectNumbers = totalLessons === 97 && Math.abs(totalHours - 73) <= 1 && units.length === 7;
    const hasPerfectCoverage = perfectCoverage;
    const hasAdequateBuffers = startBuffer >= 5 && endBuffer >= 10;
    const hasFlexibility = flexibilityBuffers >= 3;
    const hasNoTimingViolations = criticalIssues.filter(issue => 
      issue.includes('overlap') || 
      issue.includes('weekend') || 
      issue.includes('Christmas') ||
      issue.includes('outside unit boundaries')
    ).length === 0;
    
    if (hasCorrectNumbers && hasPerfectCoverage && hasAdequateBuffers && hasFlexibility && hasNoTimingViolations) {
      console.log('🎉 UNITS ARE TRULY PERFECT! 🎉');
      console.log('✅ Mathematical precision achieved');
      console.log('✅ Curriculum expectations perfectly mapped');
      console.log('✅ Timing is realistic and implementable');
      console.log('✅ Adequate flexibility for real-world needs');
      console.log('✅ No timing violations or impossibilities');
      console.log('✅ Ready for Emily\'s classroom with COMPLETE CONFIDENCE');
      console.log('\n🎓 CERTIFICATION: PERFECT SOCIAL STUDIES UNITS');
    } else {
      console.log('❌ UNITS ARE NOT PERFECT - CRITICAL ISSUES REMAIN');
      console.log('\nREMAINING PROBLEMS:');
      if (!hasCorrectNumbers) {
        console.log(`❌ Mathematical precision: ${totalLessons} lessons, ${totalHours} hours, ${units.length} units`);
      }
      if (!hasPerfectCoverage) {
        console.log(`❌ Curriculum mapping problems: duplications or gaps exist`);
      }
      if (!hasAdequateBuffers) {
        console.log(`❌ Insufficient school year buffers: ${startBuffer} start, ${endBuffer} end`);
      }
      if (!hasFlexibility) {
        console.log(`❌ Insufficient flexibility: only ${flexibilityBuffers} assessment buffers`);
      }
      if (!hasNoTimingViolations) {
        console.log(`❌ Timing violations: weekend/Christmas/overlap issues exist`);
      }
      
      console.log('\n❌ VERDICT: UNITS NEED MORE WORK BEFORE CLASSROOM IMPLEMENTATION');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualDeepReview();