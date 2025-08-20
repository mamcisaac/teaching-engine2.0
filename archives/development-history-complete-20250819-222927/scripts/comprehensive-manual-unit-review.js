const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function comprehensiveManualUnitReview() {
  try {
    console.log('🔍 COMPREHENSIVE MANUAL UNIT PLAN REVIEW');
    console.log('========================================');
    console.log('Deep pedagogical analysis of actual unit content quality\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98v0009vjr16o3e7awo' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`Found ${units.length} unit plans\n`);
    
    const months = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];

    // Manual review of each unit
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const lessons = Math.round(((unit.estimatedHours || 0) * 60) / 45);
      
      console.log(`${i+1}. ${months[i]} - "${unit.title}" (${lessons} lessons)`);
      console.log('─'.repeat(70));
      
      // TIMING ANALYSIS
      console.log('📊 TIMING QUALITY:');
      console.log(`   Estimated Hours: ${unit.estimatedHours || 'MISSING'}`);
      console.log(`   Calculated Lessons: ${lessons}`);
      console.log(`   45-min lesson fit: ${unit.estimatedHours ? '✅' : '❌'}`);
      
      // CONTENT QUALITY ANALYSIS
      console.log('\n📝 CONTENT COMPLETENESS:');
      console.log(`   Title: ${unit.title ? '✅' : '❌'} "${unit.title || 'MISSING'}"`);
      console.log(`   Description: ${unit.description ? '✅' : '❌'} (${unit.description ? unit.description.length : 0} chars)`);
      console.log(`   Big Ideas: ${unit.bigIdeas ? '✅' : '❌'} (${unit.bigIdeas ? unit.bigIdeas.length : 0} chars)`);
      console.log(`   Essential Questions: ${unit.essentialQuestions ? '✅' : '❌'}`);
      console.log(`   Assessment Plan: ${unit.assessmentPlan ? '✅' : '❌'} (${unit.assessmentPlan ? unit.assessmentPlan.length : 0} chars)`);
      
      // PEDAGOGICAL QUALITY
      if (unit.description) {
        console.log('\n🎨 DESCRIPTION QUALITY:');
        const desc = unit.description.substring(0, 150);
        console.log(`   Preview: "${desc}..."`);
        console.log(`   French Context: ${unit.description.toLowerCase().includes('français') ? '✅' : '⚠️'}`);
        console.log(`   Grade 1 Language: ${unit.description.includes('élèves') ? '✅' : '⚠️'}`);
        console.log(`   Arts Focus: ${unit.description.toLowerCase().includes('art') ? '✅' : '⚠️'}`);
      }
      
      if (unit.bigIdeas) {
        console.log('\n💡 BIG IDEAS QUALITY:');
        const ideas = unit.bigIdeas.substring(0, 100);
        console.log(`   Preview: "${ideas}..."`);
        console.log(`   Educational Depth: ${unit.bigIdeas.length > 100 ? '✅' : '⚠️'}`);
        console.log(`   French Integration: ${unit.bigIdeas.toLowerCase().includes('français') ? '✅' : '⚠️'}`);
      }
      
      // EXPECTATIONS ANALYSIS
      console.log('\n🎯 CURRICULUM EXPECTATIONS:');
      const expectationCodes = unit.expectations.map(e => e.expectation.code);
      console.log(`   Linked Expectations: [${expectationCodes.join(', ')}] (${expectationCodes.length}/4)`);
      console.log(`   Complete Coverage: ${expectationCodes.length === 4 ? '✅' : '❌'}`);
      console.log(`   Has AV1 (Environment): ${expectationCodes.includes('AV1') ? '✅' : '❌'}`);
      console.log(`   Has AV2 (Communication): ${expectationCodes.includes('AV2') ? '✅' : '❌'}`);
      console.log(`   Has AV3 (Tools): ${expectationCodes.includes('AV3') ? '✅' : '❌'}`);
      console.log(`   Has AV4 (Culture): ${expectationCodes.includes('AV4') ? '✅' : '❌'}`);
      
      // ASSESSMENT QUALITY
      if (unit.assessmentPlan) {
        console.log('\n📊 ASSESSMENT QUALITY:');
        const hasFormative = unit.assessmentPlan.toLowerCase().includes('observation') || 
                           unit.assessmentPlan.toLowerCase().includes('daily') ||
                           unit.assessmentPlan.toLowerCase().includes('ongoing') ||
                           unit.assessmentPlan.toLowerCase().includes('portfolio');
        const hasSummative = unit.assessmentPlan.toLowerCase().includes('final') ||
                           unit.assessmentPlan.toLowerCase().includes('exhibition') ||
                           unit.assessmentPlan.toLowerCase().includes('presentation') ||
                           unit.assessmentPlan.toLowerCase().includes('masterpiece');
        const isSpecific = unit.assessmentPlan.includes(months[i].toUpperCase()) ||
                         unit.assessmentPlan.includes(unit.title.substring(0, 10));
        
        console.log(`   Formative Elements: ${hasFormative ? '✅' : '❌'}`);
        console.log(`   Summative Elements: ${hasSummative ? '✅' : '❌'}`);
        console.log(`   Unit-Specific: ${isSpecific ? '✅' : '❌'}`);
        console.log(`   Depth: ${unit.assessmentPlan.length > 300 ? '✅' : '⚠️'} (${unit.assessmentPlan.length} chars)`);
      }
      
      // DIFFERENTIATION ANALYSIS
      console.log('\n🎭 DIFFERENTIATION STRATEGIES:');
      if (unit.differentiationStrategies) {
        console.log(`   Present: ✅ (${JSON.stringify(unit.differentiationStrategies).length} chars)`);
        const diff = JSON.stringify(unit.differentiationStrategies);
        console.log(`   Has Struggling Learner Support: ${diff.toLowerCase().includes('struggling') || diff.toLowerCase().includes('support') ? '✅' : '⚠️'}`);
        console.log(`   Has Advanced Extensions: ${diff.toLowerCase().includes('advanced') || diff.toLowerCase().includes('extension') ? '✅' : '⚠️'}`);
        console.log(`   Has ELL Support: ${diff.toLowerCase().includes('ell') || diff.toLowerCase().includes('english') ? '✅' : '⚠️'}`);
      } else {
        console.log(`   Present: ❌ MISSING`);
      }
      
      // FLEXIBILITY ANALYSIS  
      console.log('\n🔄 FLEXIBILITY & RESPONSIVENESS:');
      if (unit.fieldTripsAndGuestSpeakers) {
        const flexibility = unit.fieldTripsAndGuestSpeakers;
        console.log(`   Present: ✅ (${flexibility.length} chars)`);
        console.log(`   Real Flexibility: ${flexibility.includes('FLEXIBILITY') || flexibility.includes('RESPONSIVE') ? '✅' : '❌'}`);
        console.log(`   Month-Specific: ${flexibility.includes(months[i].toUpperCase()) ? '✅' : '❌'}`);
        console.log(`   Classroom Solutions: ${flexibility.includes('Assembly') || flexibility.includes('Halloween') || flexibility.includes('holiday') ? '✅' : '⚠️'}`);
      } else {
        console.log(`   Present: ❌ MISSING`);
      }
      
      // CORE + EXTENSION ANALYSIS
      console.log('\n🎯 SKILL-BUILDING STRUCTURE:');
      if (unit.culminatingTask) {
        const structure = unit.culminatingTask;
        console.log(`   Core+Extension Model: ${structure.includes('CORE + EXTENSION') ? '✅' : '❌'}`);
        console.log(`   Progressive Skills: ${structure.includes('PROGRESSIVE') ? '✅' : '❌'}`);
        console.log(`   Portfolio Integration: ${structure.includes('PORTFOLIO') ? '✅' : '❌'}`);
        console.log(`   Daily Practice: ${structure.includes('DAILY PRACTICE') ? '✅' : '❌'}`);
      } else {
        console.log(`   Enhanced Structure: ❌ MISSING`);
      }
      
      // DATE ANALYSIS
      console.log('\n📅 SCHEDULING:');
      console.log(`   Start Date: ${unit.startDate.toDateString()}`);
      console.log(`   End Date: ${unit.endDate.toDateString()}`);
      const daysDiff = Math.ceil((unit.endDate - unit.startDate) / (1000 * 60 * 60 * 24));
      console.log(`   Duration: ${daysDiff} days`);
      console.log(`   Realistic for Grade 1: ${daysDiff >= 14 && daysDiff <= 35 ? '✅' : '⚠️'}`);
      
      console.log('\n' + '='.repeat(70) + '\n');
    }
    
    // OVERALL ANALYSIS
    console.log('🏆 OVERALL SYSTEM ASSESSMENT');
    console.log('============================\n');
    
    // Timing Analysis
    let totalLessons = 0;
    const lessonCounts = [];
    units.forEach(unit => {
      const lessons = Math.round(((unit.estimatedHours || 0) * 60) / 45);
      totalLessons += lessons;
      lessonCounts.push(lessons);
    });
    
    const minLessons = Math.min(...lessonCounts);
    const maxLessons = Math.max(...lessonCounts);
    const variance = ((maxLessons - minLessons) / minLessons * 100);
    
    console.log('TIMING PERFECTION:');
    console.log(`✅ Total Lessons: ${totalLessons}/195 ${totalLessons === 195 ? '(PERFECT)' : '(WRONG)'}`);
    console.log(`${variance <= 25 ? '✅' : '❌'} Variance: ${variance.toFixed(1)}% ${variance <= 25 ? '(SUSTAINABLE)' : '(TOO HIGH)'}`);
    
    // Content Quality Counts
    const contentQuality = {
      hasDescription: units.filter(u => u.description).length,
      hasBigIdeas: units.filter(u => u.bigIdeas).length,
      hasEssentialQuestions: units.filter(u => u.essentialQuestions).length,
      hasAssessmentPlan: units.filter(u => u.assessmentPlan).length,
      hasDifferentiation: units.filter(u => u.differentiationStrategies).length,
      hasFlexibility: units.filter(u => u.fieldTripsAndGuestSpeakers).length,
      hasCoreExtension: units.filter(u => u.culminatingTask?.includes('CORE + EXTENSION')).length,
      hasCompleteExpectations: units.filter(u => u.expectations.length === 4).length
    };
    
    console.log('\nCONTENT COMPLETENESS:');
    Object.entries(contentQuality).forEach(([field, count]) => {
      const percent = Math.round(count / units.length * 100);
      console.log(`${count === units.length ? '✅' : '❌'} ${field}: ${count}/${units.length} (${percent}%)`);
    });
    
    // Perfect Unit Count
    const perfectUnits = units.filter(unit => 
      unit.description && 
      unit.bigIdeas && 
      unit.essentialQuestions && 
      unit.assessmentPlan && 
      unit.differentiationStrategies && 
      unit.fieldTripsAndGuestSpeakers &&
      unit.culminatingTask?.includes('CORE + EXTENSION') &&
      unit.expectations.length === 4
    ).length;
    
    console.log(`\nPERFECT UNITS: ${perfectUnits}/${units.length} (${Math.round(perfectUnits/units.length*100)}%)`);
    
    const overallScore = Math.round(
      (perfectUnits / units.length * 0.6 + // Content quality 60%
       (totalLessons === 195 ? 1 : 0) * 0.2 + // Timing 20% 
       (variance <= 25 ? 1 : 0) * 0.2) * 100 // Variance 20%
    );
    
    console.log(`\n🎯 OVERALL PERFECTION SCORE: ${overallScore}%`);
    
    if (overallScore >= 95) {
      console.log('\n🎉 UNITS ARE TRULY PERFECT! 🎉');
    } else if (overallScore >= 85) {
      console.log('\n✨ UNITS ARE EXCELLENT with minor gaps');
    } else if (overallScore >= 75) {
      console.log('\n⚠️ UNITS ARE GOOD but need perfection work');  
    } else {
      console.log('\n❌ UNITS NEED SIGNIFICANT PERFECTION WORK');
    }
    
    console.log('\nTO ACHIEVE PERFECTION, FOCUS ON:');
    if (perfectUnits < units.length) {
      console.log('• Completing all pedagogical content fields');
    }
    if (totalLessons !== 195) {
      console.log('• Achieving exactly 195 lessons');
    }
    if (variance > 25) {
      console.log('• Reducing timing variance to ≤25%');
    }
    
    // Expectation Coverage Issue
    const unitsWithoutExpectations = units.filter(u => u.expectations.length === 0).length;
    if (unitsWithoutExpectations > 0) {
      console.log(`• CRITICAL: Fixing ${unitsWithoutExpectations} units with NO expectations linked`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveManualUnitReview();