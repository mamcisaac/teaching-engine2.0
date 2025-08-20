import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualCriticalReviewPhase1() {
  try {
    console.log('🔍 MANUAL CRITICAL REVIEW: Are the Social Studies Units Actually Perfect?');
    console.log('===============================================================================');
    console.log('EXAMINING REALITY vs EXPECTATIONS - NO AUTOMATED VALIDATION');
    
    // Get the LRP and all units with complete data
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: { include: { expectation: true } }
      }
    });
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      include: {
        expectations: { include: { expectation: true } },
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n📋 LONG RANGE PLAN REQUIREMENTS:');
    console.log('- Subject: Social Studies (Sciences humaines)');
    console.log('- Expected: 97 lessons, 72.75 hours, 7 units');
    console.log('- Every-other-day alternating with Health/FPS');
    console.log('- Grade 1 French Immersion');
    console.log('- Must cover 8 curriculum expectations perfectly (1:1 mapping)');
    
    let totalLessons = 0;
    let totalHours = 0;
    let criticalIssues = [];
    
    console.log('\n🔎 MANUAL UNIT-BY-UNIT ANALYSIS:');
    console.log('===============================================================================');
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitNum = i + 1;
      
      console.log(`\n📚 UNIT ${unitNum}: ${unit.title}`);
      console.log(`Planned: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
      
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.estimatedHours || 0;
      
      // CRITICAL EXAMINATION: Does this unit timing make sense?
      const unitDurationDays = Math.floor((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const schoolDaysEstimate = unitDurationDays * (5/7); // Rough weekday estimate
      const lessonsPerSchoolDay = unit.lessonPlans.length / schoolDaysEstimate;
      
      console.log(`Duration: ${unitDurationDays} days (~${Math.round(schoolDaysEstimate)} school days)`);
      console.log(`Density: ${lessonsPerSchoolDay.toFixed(2)} lessons per school day`);
      
      // CRITICAL QUESTION: Is this realistic for every-other-day scheduling?
      if (lessonsPerSchoolDay > 0.6) {
        criticalIssues.push(`Unit ${unitNum}: Too dense - ${lessonsPerSchoolDay.toFixed(2)} lessons/day impossible for every-other-day schedule`);
        console.log(`🚨 DENSITY PROBLEM: Every-other-day = max 0.5 lessons/day, this needs ${lessonsPerSchoolDay.toFixed(2)}`);
      }
      
      // Check lesson dates for reality
      if (unit.lessonPlans.length > 0) {
        const firstLesson = new Date(unit.lessonPlans[0].date);
        const lastLesson = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
        console.log(`Actual lessons: ${firstLesson.toDateString()} - ${lastLesson.toDateString()}`);
        
        // CRITICAL: Check for weekend lessons
        unit.lessonPlans.forEach(lesson => {
          const date = new Date(lesson.date);
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            criticalIssues.push(`Unit ${unitNum}: Lesson on ${date.toDateString()} (${dayOfWeek === 0 ? 'Sunday' : 'Saturday'})`);
            console.log(`🚨 WEEKEND LESSON: ${date.toDateString()}`);
          }
        });
        
        // CRITICAL: Check Christmas break violations
        const christmasStart = new Date('2025-12-19');
        const christmasEnd = new Date('2026-01-05');
        const christmasViolations = unit.lessonPlans.filter(l => {
          const date = new Date(l.date);
          return date >= christmasStart && date <= christmasEnd;
        });
        
        if (christmasViolations.length > 0) {
          criticalIssues.push(`Unit ${unitNum}: ${christmasViolations.length} lessons during Christmas break`);
          console.log(`🚨 CHRISTMAS VIOLATION: ${christmasViolations.length} lessons during break`);
        }
      }
      
      // CRITICAL: Curriculum expectation analysis
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`Expectations: [${unitExpectations.join(', ')}]`);
      
      if (unitExpectations.length === 0) {
        criticalIssues.push(`Unit ${unitNum}: No curriculum expectations assigned`);
        console.log(`🚨 NO EXPECTATIONS: Unit has no curriculum coverage`);
      }
      
      if (unitExpectations.length > 2) {
        criticalIssues.push(`Unit ${unitNum}: Overloaded with ${unitExpectations.length} expectations`);
        console.log(`🚨 OVERLOADED: Too many expectations for one unit`);
      }
    }
    
    console.log('\n📊 MATHEMATICAL REALITY CHECK:');
    console.log('===============================================================================');
    console.log(`Units: ${units.length}/7 ${units.length === 7 ? '✅' : '❌'}`);
    console.log(`Total Lessons: ${totalLessons}/97 ${totalLessons === 97 ? '✅' : '❌'}`);
    console.log(`Total Hours: ${totalHours}/73 ${Math.abs(totalHours - 73) <= 1 ? '✅' : '❌'}`);
    
    if (totalLessons !== 97) {
      criticalIssues.push(`WRONG LESSON COUNT: Have ${totalLessons}, need 97 (shortage of ${97 - totalLessons})`);
    }
    
    console.log('\n🎯 CURRICULUM EXPECTATION COVERAGE ANALYSIS:');
    console.log('===============================================================================');
    
    const lrpExpectations = lrp.expectations.map(e => e.expectation.code);
    const expectationCoverage = {};
    
    units.forEach(unit => {
      unit.expectations.forEach(e => {
        const code = e.expectation.code;
        expectationCoverage[code] = (expectationCoverage[code] || 0) + 1;
      });
    });
    
    console.log('Expected 1:1 mapping for:', lrpExpectations.join(', '));
    console.log('\nActual coverage:');
    
    for (const code of lrpExpectations) {
      const count = expectationCoverage[code] || 0;
      if (count === 0) {
        criticalIssues.push(`MISSING EXPECTATION: ${code} not covered in any unit`);
        console.log(`❌ ${code}: NOT COVERED`);
      } else if (count === 1) {
        console.log(`✅ ${code}: Perfect (1 unit)`);
      } else {
        criticalIssues.push(`OVER-COVERAGE: ${code} appears in ${count} units`);
        console.log(`🚨 ${code}: OVER-COVERED (${count} units)`);
      }
    }
    
    console.log('\n⏰ TIMING FLEXIBILITY ANALYSIS:');
    console.log('===============================================================================');
    
    // Check buffer times
    const schoolYearStart = new Date('2025-09-02');
    const schoolYearEnd = new Date('2026-06-26');
    const firstUnitStart = new Date(units[0].startDate);
    const lastUnitEnd = new Date(units[units.length - 1].endDate);
    
    const startBuffer = Math.floor((firstUnitStart.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    const endBuffer = Math.floor((schoolYearEnd.getTime() - lastUnitEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`Start buffer: ${startBuffer} days (need 5+) ${startBuffer >= 5 ? '✅' : '❌'}`);
    console.log(`End buffer: ${endBuffer} days (need 10+) ${endBuffer >= 10 ? '✅' : '❌'}`);
    
    if (startBuffer < 5) {
      criticalIssues.push(`Insufficient start buffer: only ${startBuffer} days`);
    }
    if (endBuffer < 10) {
      criticalIssues.push(`Insufficient end buffer: only ${endBuffer} days`);
    }
    
    // Check for gaps between units
    for (let i = 1; i < units.length; i++) {
      const prevUnit = units[i - 1];
      const currentUnit = units[i];
      const gap = Math.floor((new Date(currentUnit.startDate).getTime() - new Date(prevUnit.endDate).getTime()) / (1000 * 60 * 60 * 24));
      
      if (gap > 25) { // Allowing for holidays/breaks
        criticalIssues.push(`Large gap between Unit ${i} and ${i + 1}: ${gap} days`);
        console.log(`⚠️ Gap between Unit ${i} and ${i + 1}: ${gap} days`);
      } else if (gap < 0) {
        criticalIssues.push(`OVERLAP between Unit ${i} and ${i + 1}: ${Math.abs(gap)} days`);
        console.log(`🚨 OVERLAP between Unit ${i} and ${i + 1}: ${Math.abs(gap)} days`);
      }
    }
    
    console.log('\n🔄 EVERY-OTHER-DAY ALTERNATING FEASIBILITY:');
    console.log('===============================================================================');
    
    // Check if the alternating pattern is realistic
    const totalSchoolDays = 195;
    const expectedSocialStudiesLessons = Math.floor(totalSchoolDays / 2); // Every other day
    
    console.log(`School days: ${totalSchoolDays}`);
    console.log(`Every-other-day lessons: ~${expectedSocialStudiesLessons}`);
    console.log(`Planned lessons: ${totalLessons}`);
    
    if (Math.abs(totalLessons - expectedSocialStudiesLessons) > 5) {
      criticalIssues.push(`Lesson count doesn't match every-other-day pattern: have ${totalLessons}, expect ~${expectedSocialStudiesLessons}`);
    }
    
    console.log('\n🏫 REAL-WORLD IMPLEMENTATION ANALYSIS:');
    console.log('===============================================================================');
    
    console.log('Checking for real-world feasibility issues:');
    
    // Snow days accommodation
    console.log('- Snow days: No explicit accommodation built in');
    if (startBuffer < 5 || endBuffer < 10) {
      criticalIssues.push('Insufficient buffer for snow days and unexpected closures');
    }
    
    // Assessment periods
    console.log('- Assessment periods: No dedicated time for unit assessments');
    
    // Professional development days
    console.log('- PD days: No consideration for district PD days that disrupt schedule');
    
    // Field trips
    console.log('- Field trips: Could disrupt every-other-day pattern if not planned');
    
    console.log('\n🚨 CRITICAL ISSUES SUMMARY:');
    console.log('===============================================================================');
    
    if (criticalIssues.length === 0) {
      console.log('🎉 NO CRITICAL ISSUES FOUND - UNITS ARE PERFECT!');
    } else {
      console.log(`❌ ${criticalIssues.length} CRITICAL ISSUES IDENTIFIED:`);
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n🏆 MANUAL REVIEW FINAL VERDICT:');
    console.log('===============================================================================');
    
    const hasCorrectCount = units.length === 7 && Math.abs(totalLessons - 97) <= 5 && Math.abs(totalHours - 73) <= 3;
    const hasNoCriticalIssues = criticalIssues.length === 0;
    const hasProperBuffers = startBuffer >= 5 && endBuffer >= 10;
    
    if (hasCorrectCount && hasNoCriticalIssues && hasProperBuffers) {
      console.log('🎉 UNITS ARE TRULY PERFECT! 🎉');
      console.log('✅ All timing issues resolved');
      console.log('✅ Curriculum expectations properly mapped');
      console.log('✅ Realistic implementation feasibility');
      console.log('✅ Adequate flexibility built in');
    } else {
      console.log('❌ UNITS ARE NOT PERFECT - WORK STILL NEEDED');
      console.log('\nMAJOR REMAINING ISSUES:');
      
      if (!hasCorrectCount) {
        console.log(`❌ Mathematical precision: ${units.length} units, ${totalLessons} lessons, ${totalHours} hours`);
      }
      
      if (!hasNoCriticalIssues) {
        console.log(`❌ ${criticalIssues.length} critical implementation issues remain`);
      }
      
      if (!hasProperBuffers) {
        console.log(`❌ Insufficient buffer time for real-world flexibility`);
      }
      
      console.log('\n🔧 REQUIRED ACTIONS:');
      console.log('- Complete Phase 2: Fix curriculum expectation over-coverage');
      console.log('- Complete Phase 3: Redesign unit boundaries for proper lesson distribution');
      console.log('- Add explicit snow day and assessment accommodations');
      console.log('- Verify every-other-day scheduling feasibility');
    }
    
  } catch (error) {
    console.error('❌ Error in manual critical review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualCriticalReviewPhase1();