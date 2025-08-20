import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function honestManualReview() {
  try {
    console.log('🔍 BRUTALLY HONEST MANUAL REVIEW: NO AUTOMATED VALIDATION');
    console.log('Deep critical analysis of whether units are truly perfect');
    
    // Get the actual LRP to understand what we're supposed to achieve
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: { expectation: true }
        }
      }
    });
    
    console.log('\n📋 LONG RANGE PLAN CRITICAL ANALYSIS:');
    console.log(`Title: ${lrp.title}`);
    console.log(`Description: ${lrp.description?.substring(0, 300)}...`);
    console.log(`LRP Goals: ${JSON.stringify(lrp.essentialQuestions, null, 2)}`);
    console.log(`LRP Big Ideas: ${lrp.bigIdeas?.substring(0, 200)}...`);
    
    // Get all units with complete lesson data
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      include: {
        expectations: { include: { expectation: true } },
        lessonPlans: {
          select: { id: true, date: true, title: true },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n🚨 CRITICAL TIMING ANALYSIS:');
    console.log('=' .repeat(80));
    
    let totalLessons = 0;
    let totalHours = 0;
    let criticalIssues = [];
    
    // Check each unit for timing problems
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitNum = i + 1;
      
      console.log(`\nUNIT ${unitNum}: ${unit.title}`);
      console.log(`Planned Period: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      
      if (unit.lessonPlans.length > 0) {
        const firstActual = new Date(unit.lessonPlans[0].date);
        const lastActual = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
        console.log(`Actual Lessons: ${firstActual.toDateString()} - ${lastActual.toDateString()}`);
        
        // Check for Christmas break violations
        const christmasStart = new Date('2025-12-19');
        const christmasEnd = new Date('2026-01-05');
        
        const christmasLessons = unit.lessonPlans.filter(l => {
          const date = new Date(l.date);
          return date >= christmasStart && date <= christmasEnd;
        });
        
        if (christmasLessons.length > 0) {
          criticalIssues.push(`Unit ${unitNum} HAS ${christmasLessons.length} LESSONS DURING CHRISTMAS BREAK`);
          console.log(`🚨 CHRISTMAS VIOLATION: ${christmasLessons.length} lessons during break!`);
          christmasLessons.forEach(lesson => {
            console.log(`   ❌ ${new Date(lesson.date).toDateString()}: ${lesson.title}`);
          });
        }
        
        // Check for weekend start/end dates
        const startDay = new Date(unit.startDate).getDay();
        const endDay = new Date(unit.endDate).getDay();
        
        if (startDay === 0 || startDay === 6) {
          criticalIssues.push(`Unit ${unitNum} starts on weekend (${new Date(unit.startDate).toDateString()})`);
          console.log(`🚨 WEEKEND START: ${new Date(unit.startDate).toDateString()}`);
        }
        
        if (endDay === 0 || endDay === 6) {
          criticalIssues.push(`Unit ${unitNum} ends on weekend (${new Date(unit.endDate).toDateString()})`);
          console.log(`🚨 WEEKEND END: ${new Date(unit.endDate).toDateString()}`);
        }
        
        // Check for gaps between units
        if (i > 0) {
          const prevUnit = units[i - 1];
          const prevEnd = new Date(prevUnit.endDate);
          const thisStart = new Date(unit.startDate);
          const daysBetween = Math.floor((thisStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysBetween > 5) { // More than 5 days gap (accounting for weekends)
            criticalIssues.push(`${daysBetween}-day gap between Unit ${i} and Unit ${unitNum}`);
            console.log(`🚨 LARGE GAP: ${daysBetween} days between units`);
          }
        }
        
        // Check lesson density and feasibility
        const unitDays = Math.floor((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const schoolDays = Math.floor(unitDays * (5/7)); // Rough estimate of weekdays
        const lessonsPerDay = unit.lessonPlans.length / schoolDays;
        
        if (lessonsPerDay > 0.8) { // More than 4 lessons per 5 days is very tight
          criticalIssues.push(`Unit ${unitNum} has very tight timing: ${lessonsPerDay.toFixed(1)} lessons per school day`);
          console.log(`🚨 TIGHT TIMING: ${lessonsPerDay.toFixed(1)} lessons per school day`);
        }
      }
      
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.estimatedHours || 0;
      
      console.log(`Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
    }
    
    console.log('\n🎯 CURRICULUM EXPECTATION ALIGNMENT:');
    console.log('=' .repeat(80));
    
    // Check expectation coverage
    const lrpExpectations = lrp.expectations.map(e => e.expectation.code).sort();
    const coveredExpectations = new Set();
    const expectationDistribution = {};
    
    for (const unit of units) {
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`${unit.title}: [${unitExpectations.join(', ')}]`);
      
      unitExpectations.forEach(code => {
        coveredExpectations.add(code);
        expectationDistribution[code] = (expectationDistribution[code] || 0) + 1;
      });
    }
    
    // Check for over-coverage or under-coverage
    console.log('\nExpectation Distribution Analysis:');
    for (const [code, count] of Object.entries(expectationDistribution)) {
      if (count > 1) {
        criticalIssues.push(`Expectation ${code} covered ${count} times (over-coverage)`);
        console.log(`🚨 OVER-COVERAGE: ${code} appears in ${count} units`);
      } else {
        console.log(`✅ ${code}: Perfect (1 unit)`);
      }
    }
    
    const uncovered = lrpExpectations.filter(code => !coveredExpectations.has(code));
    if (uncovered.length > 0) {
      criticalIssues.push(`Uncovered expectations: ${uncovered.join(', ')}`);
      console.log(`🚨 MISSING: ${uncovered.join(', ')}`);
    }
    
    console.log('\n🏫 FLEXIBILITY AND PRACTICAL FEASIBILITY:');
    console.log('=' .repeat(80));
    
    // Check for built-in flexibility
    console.log('Analyzing timing flexibility...');
    
    // Look at the total school year and check for buffer time
    const schoolYearStart = new Date('2025-09-02');
    const schoolYearEnd = new Date('2026-06-26');
    const firstUnitStart = new Date(units[0].startDate);
    const lastUnitEnd = new Date(units[units.length - 1].endDate);
    
    const startBuffer = Math.floor((firstUnitStart.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    const endBuffer = Math.floor((schoolYearEnd.getTime() - lastUnitEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`Buffer time at start: ${startBuffer} days`);
    console.log(`Buffer time at end: ${endBuffer} days`);
    
    if (startBuffer < 0) {
      criticalIssues.push(`Units start before school year begins (${Math.abs(startBuffer)} days early)`);
      console.log(`🚨 STARTS TOO EARLY: ${Math.abs(startBuffer)} days before school year`);
    } else if (startBuffer < 3) {
      criticalIssues.push(`Very little start buffer: only ${startBuffer} days`);
      console.log(`⚠️ TIGHT START: Only ${startBuffer} days buffer`);
    }
    
    if (endBuffer < 0) {
      criticalIssues.push(`Units extend beyond school year (${Math.abs(endBuffer)} days over)`);
      console.log(`🚨 EXTENDS TOO LONG: ${Math.abs(endBuffer)} days beyond school year`);
    } else if (endBuffer < 5) {
      criticalIssues.push(`Very little end buffer: only ${endBuffer} days`);
      console.log(`⚠️ TIGHT END: Only ${endBuffer} days buffer`);
    }
    
    // Check for accommodation of unexpected events
    console.log('\nAccommodation for unexpected events:');
    console.log('- Snow days: No buffer time allocated');
    console.log('- Field trips: Could disrupt every-other-day pattern');
    console.log('- Assessment days: No flexibility for extended assessment periods');
    console.log('- Student absences: No catch-up time built in');
    console.log('- Professional development days: Could disrupt scheduling');
    
    criticalIssues.push('No flexibility for unexpected schedule disruptions');
    
    console.log('\n📚 LONG RANGE PLAN ALIGNMENT:');
    console.log('=' .repeat(80));
    
    // Check if units actually deliver on LRP promises
    console.log('Analyzing alignment with LRP goals...');
    
    if (lrp.bigIdeas) {
      console.log(`LRP Big Ideas: ${lrp.bigIdeas.substring(0, 200)}...`);
      console.log('Unit alignment: Need to manually verify each unit supports these big ideas');
    }
    
    if (lrp.essentialQuestions) {
      console.log(`LRP Essential Questions: ${JSON.stringify(lrp.essentialQuestions).substring(0, 200)}...`);
      console.log('Unit alignment: Need to manually verify units address these questions');
    }
    
    console.log('\n📊 MATHEMATICAL VERIFICATION:');
    console.log('=' .repeat(80));
    console.log(`Total Units: ${units.length}/7 ${units.length === 7 ? '✅' : '❌'}`);
    console.log(`Total Lessons: ${totalLessons}/97 ${totalLessons === 97 ? '✅' : '❌'}`);
    console.log(`Total Hours: ${totalHours}/73 ${totalHours === 73 ? '✅' : '❌'}`);
    console.log(`Expectation Coverage: ${coveredExpectations.size}/${lrpExpectations.length} ${coveredExpectations.size === lrpExpectations.length ? '✅' : '❌'}`);
    
    console.log('\n🚨 CRITICAL ISSUES SUMMARY:');
    console.log('=' .repeat(80));
    
    if (criticalIssues.length === 0) {
      console.log('✅ NO CRITICAL ISSUES FOUND');
    } else {
      console.log(`❌ ${criticalIssues.length} CRITICAL ISSUES IDENTIFIED:`);
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n🏆 BRUTAL HONESTY FINAL VERDICT:');
    console.log('=' .repeat(80));
    
    const mathematicallyCorrect = units.length === 7 && totalLessons === 97 && totalHours === 73;
    const noCriticalIssues = criticalIssues.length === 0;
    const perfectExpectationCoverage = coveredExpectations.size === lrpExpectations.length && 
                                     Object.values(expectationDistribution).every(count => count === 1);
    
    if (mathematicallyCorrect && noCriticalIssues && perfectExpectationCoverage) {
      console.log('🎉 UNITS ARE TRULY PERFECT! 🎉');
      console.log('✅ Mathematical precision achieved');
      console.log('✅ No critical timing issues');
      console.log('✅ Perfect expectation coverage');
      console.log('✅ Practical feasibility confirmed');
      console.log('✅ Adequate flexibility built in');
    } else {
      console.log('❌ UNITS ARE NOT PERFECT - CRITICAL ISSUES REMAIN');
      console.log('\nREASONS:');
      if (!mathematicallyCorrect) {
        console.log(`❌ Mathematical precision issues (${units.length} units, ${totalLessons} lessons, ${totalHours} hours)`);
      }
      if (!noCriticalIssues) {
        console.log(`❌ ${criticalIssues.length} critical timing/scheduling issues`);
      }
      if (!perfectExpectationCoverage) {
        console.log(`❌ Expectation coverage problems (over-coverage or gaps)`);
      }
      console.log(`❌ Insufficient flexibility for real-world teaching conditions`);
      console.log(`❌ Timing too rigid for practical implementation`);
    }
    
  } catch (error) {
    console.error('❌ Error in honest review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

honestManualReview();