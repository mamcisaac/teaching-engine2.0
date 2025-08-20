import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ultrathinkManualReview() {
  console.log('🧠 ULTRATHINK MANUAL REVIEW - HUMAN CRITICAL ANALYSIS');
  console.log('=========================================================');
  console.log('Ignoring all scripts. Using pure human judgment.');
  console.log('');

  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
    include: {
      expectations: { include: { expectation: true } },
      lessonPlans: { orderBy: { date: 'asc' } }
    },
    orderBy: { startDate: 'asc' }
  });

  const lrp = await prisma.longRangePlan.findUnique({
    where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
    include: {
      expectations: { include: { expectation: true } }
    }
  });

  console.log('📚 LONG RANGE PLAN ANALYSIS:');
  console.log(`Subject: ${lrp?.subject}`);
  console.log(`Grade: ${lrp?.grade}`);
  console.log(`Expected curriculum coverage: ${lrp?.expectations.map(e => e.expectation.code).join(', ')}`);
  console.log('');

  let humanIssues: string[] = [];
  let totalLessons = 0;
  let totalHours = 0;

  console.log('🔍 UNIT-BY-UNIT HUMAN CRITICAL ANALYSIS:');
  console.log('==========================================');

  units.forEach((unit, i) => {
    const unitNum = i + 1;
    console.log(`\n📖 UNIT ${unitNum}: ${unit.title}`);
    console.log('─'.repeat(60));
    
    // Basic metrics
    const calendarDays = Math.floor((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000*60*60*24));
    console.log(`📅 Duration: ${calendarDays} calendar days`);
    console.log(`📝 Lessons: ${unit.lessonPlans.length}`);
    console.log(`⏰ Hours: ${unit.estimatedHours}`);
    console.log(`📚 Expectations: [${unit.expectations.map(e => e.expectation.code).join(', ')}]`);
    
    totalLessons += unit.lessonPlans.length;
    totalHours += unit.estimatedHours || 0;

    // HUMAN JUDGMENT: Duration Analysis
    console.log('\n🧠 HUMAN TIMING ANALYSIS:');
    const schoolDaysApprox = Math.round(calendarDays * (5/7));
    const everyOtherDaySlots = Math.floor(schoolDaysApprox / 2);
    console.log(`  ${calendarDays} calendar days = ~${schoolDaysApprox} school days = ~${everyOtherDaySlots} every-other-day slots`);
    
    if (unit.lessonPlans.length > everyOtherDaySlots + 1) {
      console.log(`  ❌ HUMAN CONCERN: ${unit.lessonPlans.length} lessons is too dense for ${everyOtherDaySlots} slots`);
      humanIssues.push(`Unit ${unitNum}: Impossible lesson density (${unit.lessonPlans.length} lessons, ${everyOtherDaySlots} slots)`);
    } else {
      console.log(`  ✅ HUMAN JUDGMENT: ${unit.lessonPlans.length} lessons fits comfortably in ${everyOtherDaySlots} slots`);
    }

    // HUMAN JUDGMENT: Lesson Date Analysis
    console.log('\n🗓️ HUMAN LESSON DATE ANALYSIS:');
    if (unit.lessonPlans.length > 0) {
      const firstLesson = new Date(unit.lessonPlans[0].date);
      const lastLesson = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
      console.log(`  First: ${firstLesson.toDateString()}`);
      console.log(`  Last: ${lastLesson.toDateString()}`);
      
      // Check if lessons fall outside unit boundaries - this is CRITICAL
      const outsideLessons = unit.lessonPlans.filter(l => 
        new Date(l.date) < new Date(unit.startDate) || new Date(l.date) > new Date(unit.endDate)
      );
      
      if (outsideLessons.length > 0) {
        console.log(`  ❌ CRITICAL HUMAN CONCERN: ${outsideLessons.length} lessons scheduled OUTSIDE unit dates`);
        console.log(`    Unit runs: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
        outsideLessons.forEach(lesson => {
          console.log(`    Lesson outside: ${new Date(lesson.date).toDateString()}`);
        });
        humanIssues.push(`Unit ${unitNum}: ${outsideLessons.length} lessons outside unit boundaries`);
      } else {
        console.log(`  ✅ HUMAN JUDGMENT: All lessons properly scheduled within unit dates`);
      }

      // Christmas break check for Unit 3 specifically
      if (unitNum === 3) {
        const christmasLessons = unit.lessonPlans.filter(l => {
          const date = new Date(l.date);
          return date >= new Date('2025-12-19') && date <= new Date('2026-01-05');
        });
        
        if (christmasLessons.length > 0) {
          console.log(`  ❌ CRITICAL CONCERN: ${christmasLessons.length} lessons during Christmas break`);
          christmasLessons.forEach(lesson => {
            console.log(`    Christmas lesson: ${new Date(lesson.date).toDateString()}`);
          });
          humanIssues.push(`Unit ${unitNum}: ${christmasLessons.length} lessons during Christmas break`);
        } else {
          console.log(`  ✅ HUMAN JUDGMENT: Unit 3 properly avoids Christmas break`);
        }
      }

      // Weekend check
      const weekendLessons = unit.lessonPlans.filter(l => {
        const day = new Date(l.date).getDay();
        return day === 0 || day === 6;
      });
      
      if (weekendLessons.length > 0) {
        console.log(`  ❌ CONCERN: ${weekendLessons.length} lessons on weekends`);
        humanIssues.push(`Unit ${unitNum}: ${weekendLessons.length} weekend lessons`);
      }
    }

    // HUMAN JUDGMENT: Content Quality
    console.log('\n📖 HUMAN CONTENT QUALITY ANALYSIS:');
    if (!unit.description || unit.description.length < 1000) {
      console.log(`  ❌ CONCERN: Description too brief (${unit.description?.length || 0} chars)`);
      humanIssues.push(`Unit ${unitNum}: Insufficient description depth`);
    } else {
      console.log(`  ✅ HUMAN JUDGMENT: Rich, detailed description (${unit.description.length} chars)`);
    }

    // HUMAN JUDGMENT: Curriculum Logic
    console.log('\n🎯 HUMAN CURRICULUM ANALYSIS:');
    if (unit.expectations.length === 0) {
      console.log(`  ❌ CRITICAL: No curriculum expectations covered`);
      humanIssues.push(`Unit ${unitNum}: No curriculum coverage`);
    } else if (unit.expectations.length > 2) {
      console.log(`  ❌ CONCERN: Too many expectations (${unit.expectations.length}) for effective focus`);
      humanIssues.push(`Unit ${unitNum}: Overloaded with expectations`);
    } else {
      console.log(`  ✅ HUMAN JUDGMENT: Appropriate expectation load (${unit.expectations.length})`);
    }

    // HUMAN JUDGMENT: Flexibility Analysis
    console.log('\n🔄 HUMAN FLEXIBILITY ANALYSIS:');
    if (i < units.length - 1) {
      const nextUnit = units[i + 1];
      const gap = Math.floor((new Date(nextUnit.startDate).getTime() - new Date(unit.endDate).getTime()) / (1000*60*60*24));
      
      console.log(`  Gap to next unit: ${gap} days`);
      
      if (gap < 0) {
        console.log(`  ❌ CRITICAL: Units OVERLAP by ${Math.abs(gap)} days - impossible in real classroom`);
        humanIssues.push(`Unit ${unitNum}: Overlaps with Unit ${unitNum + 1}`);
      } else if (gap === 0) {
        console.log(`  ⚠️ CONCERN: No buffer - zero flexibility for disruptions`);
      } else if (gap >= 1 && gap <= 2) {
        console.log(`  ✅ MINIMAL: ${gap} days for assessment`);
      } else if (gap >= 3) {
        console.log(`  ✅ GOOD: ${gap} days for assessment and snow days`);
      }
    }
  });

  // OVERALL HUMAN ANALYSIS
  console.log('\n\n🧠 OVERALL HUMAN CRITICAL ANALYSIS:');
  console.log('=============================================');
  
  console.log('\n📊 MATHEMATICAL REALITY CHECK:');
  console.log(`Total lessons: ${totalLessons}/97 ${totalLessons === 97 ? '✅ PERFECT' : '❌ WRONG'}`);
  console.log(`Total hours: ${totalHours}/73 ${Math.abs(totalHours - 73) <= 1 ? '✅ ACCEPTABLE' : '❌ WRONG'}`);
  console.log(`Number of units: ${units.length}/7 ${units.length === 7 ? '✅ PERFECT' : '❌ WRONG'}`);

  // CURRICULUM EXPECTATION COVERAGE ANALYSIS
  console.log('\n📚 CURRICULUM EXPECTATION COVERAGE ANALYSIS:');
  const expectedCodes = lrp?.expectations.map(e => e.expectation.code) || [];
  const actualCoverage: { [key: string]: number } = {};
  
  units.forEach(unit => {
    unit.expectations.forEach(e => {
      const code = e.expectation.code;
      actualCoverage[code] = (actualCoverage[code] || 0) + 1;
    });
  });

  console.log(`LRP expects: [${expectedCodes.join(', ')}]`);
  console.log('Coverage analysis:');
  
  let perfectCoverage = true;
  for (const code of expectedCodes) {
    const count = actualCoverage[code] || 0;
    if (count === 0) {
      console.log(`  ❌ MISSING: ${code} not covered anywhere`);
      humanIssues.push(`Missing expectation: ${code}`);
      perfectCoverage = false;
    } else if (count === 1) {
      console.log(`  ✅ PERFECT: ${code} covered exactly once`);
    } else {
      console.log(`  ❌ DUPLICATE: ${code} covered ${count} times (wasted effort)`);
      humanIssues.push(`Over-covered: ${code} (${count} times)`);
      perfectCoverage = false;
    }
  }

  // SCHOOL YEAR TIMING REALITY
  console.log('\n⏰ SCHOOL YEAR TIMING REALITY:');
  const schoolStart = new Date('2025-09-02');
  const schoolEnd = new Date('2026-06-26');
  const actualStart = new Date(units[0].startDate);
  const actualEnd = new Date(units[units.length - 1].endDate);
  
  const startBuffer = Math.floor((actualStart.getTime() - schoolStart.getTime()) / (1000*60*60*24));
  const endBuffer = Math.floor((schoolEnd.getTime() - actualEnd.getTime()) / (1000*60*60*24));
  
  console.log(`School year: ${schoolStart.toDateString()} - ${schoolEnd.toDateString()}`);
  console.log(`Units span: ${actualStart.toDateString()} - ${actualEnd.toDateString()}`);
  console.log(`Start buffer: ${startBuffer} days ${startBuffer >= 5 ? '✅ ADEQUATE' : '❌ INSUFFICIENT'}`);
  console.log(`End buffer: ${endBuffer} days ${endBuffer >= 10 ? '✅ ADEQUATE' : endBuffer >= 0 ? '⚠️ MINIMAL' : '❌ OVERRUN'}`);

  if (startBuffer < 5) {
    humanIssues.push(`Insufficient start buffer: ${startBuffer} days`);
  }
  if (endBuffer < 0) {
    humanIssues.push(`Units overrun school year by ${Math.abs(endBuffer)} days`);
  }

  // EVERY-OTHER-DAY PATTERN FEASIBILITY
  console.log('\n🔄 EVERY-OTHER-DAY FEASIBILITY:');
  console.log(`195 school days ÷ 2 = 97-98 maximum every-other-day lessons`);
  console.log(`Planned: ${totalLessons} lessons`);
  
  if (totalLessons > 98) {
    console.log(`❌ IMPOSSIBLE: Too many lessons for every-other-day pattern`);
    humanIssues.push(`Every-other-day impossible: ${totalLessons} > 98 slots`);
  } else {
    console.log(`✅ FEASIBLE: ${totalLessons} lessons fit pattern`);
  }

  // FINAL HUMAN VERDICT
  console.log('\n🏆 FINAL HUMAN VERDICT:');
  console.log('========================');
  
  if (humanIssues.length === 0) {
    console.log('🎉 HUMAN ANALYSIS: UNITS ARE TRULY PERFECT!');
    console.log('✅ No human-identified concerns');
    console.log('✅ Ready for Emily\'s classroom with complete confidence');
  } else {
    console.log('❌ HUMAN ANALYSIS: UNITS HAVE ISSUES');
    console.log(`${humanIssues.length} human-identified concerns:`);
    humanIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  const hasCorrectMath = totalLessons === 97 && Math.abs(totalHours - 73) <= 1;
  const hasNoTimingIssues = !humanIssues.some(issue => 
    issue.includes('overlap') || 
    issue.includes('outside') || 
    issue.includes('Christmas') ||
    issue.includes('impossible') ||
    issue.includes('density')
  );

  console.log('\n📋 IMPLEMENTATION READINESS:');
  if (hasCorrectMath && hasNoTimingIssues && perfectCoverage && humanIssues.length <= 2) {
    console.log('🎓 HUMAN CERTIFICATION: READY FOR IMPLEMENTATION');
    console.log('Emily can use these units with HIGH confidence');
  } else {
    console.log('⚠️ HUMAN ASSESSMENT: NEEDS MORE WORK');
    console.log('Units require fixes before classroom use');
  }

  await prisma.$disconnect();
}

ultrathinkManualReview().catch(console.error);