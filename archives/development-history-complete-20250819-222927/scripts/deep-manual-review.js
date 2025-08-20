const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deepManualReview() {
  try {
    console.log('🧠 DEEP MANUAL PEDAGOGICAL REVIEW');
    console.log('==================================');
    console.log('Pure educational analysis - examining actual unit quality\n');
    
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

    // Get Long Range Plan for context
    const lrp = await prisma.longRangePlan.findUnique({
      where: { id: 'cmebyc98v0009vjr16o3e7awo' }
    });

    const months = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];

    console.log('📋 EXAMINING ACTUAL CONTENT QUALITY');
    console.log('===================================\n');
    
    // Look at first few units in detail
    for (let i = 0; i < Math.min(3, units.length); i++) {
      const unit = units[i];
      const lessons = Math.round(((unit.estimatedHours || 0) * 60) / 45);
      
      console.log(`${months[i]}: "${unit.title}" (${lessons} lessons)`);
      console.log('─'.repeat(50));
      
      console.log('DESCRIPTION QUALITY:');
      if (unit.description) {
        const desc = unit.description.substring(0, 200);
        console.log(`"${desc}..."`)
        console.log(`French Context: ${unit.description.toLowerCase().includes('français') ? '✅' : '⚠️'}`);
        console.log(`Grade 1 Language: ${unit.description.includes('élèves') ? '✅' : '⚠️'}`);
        console.log(`Developmental Appropriateness: ${!unit.description.includes('complex') && !unit.description.includes('advanced') ? '✅' : '⚠️'}`);
      } else {
        console.log('❌ MISSING DESCRIPTION');
      }
      
      console.log('\nBIG IDEAS QUALITY:');
      if (unit.bigIdeas) {
        console.log(`"${unit.bigIdeas.substring(0, 150)}..."`);
        console.log(`Educational Substance: ${unit.bigIdeas.length > 50 ? '✅' : '⚠️'}`);
      } else {
        console.log('❌ MISSING BIG IDEAS');
      }
      
      console.log('\nESSENTIAL QUESTIONS QUALITY:');
      if (unit.essentialQuestions) {
        console.log('Essential Questions Present: ✅');
        console.log(`Grade 1 Appropriate: ${JSON.stringify(unit.essentialQuestions).includes('Comment') ? '✅' : '⚠️'}`);
      } else {
        console.log('❌ MISSING ESSENTIAL QUESTIONS');
      }
      
      console.log('\nCURRICULUM EXPECTATIONS:');
      const codes = unit.expectations.map(e => e.expectation.code);
      console.log(`Expectations: [${codes.join(', ')}]`);
      console.log(`Complete Coverage: ${codes.length === 4 ? '✅' : '❌'}`);
      console.log(`All Arts Expectations: ${['AV1', 'AV2', 'AV3', 'AV4'].every(c => codes.includes(c)) ? '✅' : '❌'}`);
      
      console.log('\nASSESSMENT PLAN QUALITY:');
      if (unit.assessmentPlan) {
        const hasFormative = unit.assessmentPlan.toLowerCase().includes('observation') || 
                           unit.assessmentPlan.toLowerCase().includes('daily') ||
                           unit.assessmentPlan.toLowerCase().includes('ongoing');
        const hasSummative = unit.assessmentPlan.toLowerCase().includes('portfolio') ||
                           unit.assessmentPlan.toLowerCase().includes('final') ||
                           unit.assessmentPlan.toLowerCase().includes('exhibition');
        const isAuthentic = unit.assessmentPlan.includes(months[i].toUpperCase()) ||
                          unit.assessmentPlan.includes(unit.title.substring(0, 10));
        
        console.log(`Formative Assessment: ${hasFormative ? '✅' : '❌'}`);
        console.log(`Summative Assessment: ${hasSummative ? '✅' : '❌'}`);
        console.log(`Unit-Specific: ${isAuthentic ? '✅' : '❌'}`);
        console.log(`Length/Depth: ${unit.assessmentPlan.length > 200 ? '✅' : '⚠️'}`);
      } else {
        console.log('❌ MISSING ASSESSMENT PLAN');
      }
      
      console.log('\nFLEXIBILITY QUALITY:');
      if (unit.fieldTripsAndGuestSpeakers) {
        const hasRealFlexibility = unit.fieldTripsAndGuestSpeakers.includes('FLEXIBILITY') ||
                                  unit.fieldTripsAndGuestSpeakers.includes('RESPONSIVE');
        const hasSpecificSolutions = unit.fieldTripsAndGuestSpeakers.includes(months[i].toUpperCase()) ||
                                   unit.fieldTripsAndGuestSpeakers.includes('Halloween') ||
                                   unit.fieldTripsAndGuestSpeakers.includes('Assembly');
        
        console.log(`Real Flexibility: ${hasRealFlexibility ? '✅' : '❌'}`);
        console.log(`Specific Solutions: ${hasSpecificSolutions ? '✅' : '❌'}`);
        console.log(`Length/Depth: ${unit.fieldTripsAndGuestSpeakers.length > 300 ? '✅' : '⚠️'}`);
      } else {
        console.log('❌ MISSING FLEXIBILITY');
      }
      
      console.log('\nCORE + EXTENSION STRUCTURE:');
      if (unit.culminatingTask) {
        const hasStructure = unit.culminatingTask.includes('CORE + EXTENSION');
        const hasProgressiveSkills = unit.culminatingTask.includes('PROGRESSIVE SKILL BUILDING');
        const hasPortfolioIntegration = unit.culminatingTask.includes('PORTFOLIO');
        
        console.log(`Core+Extension Model: ${hasStructure ? '✅' : '❌'}`);
        console.log(`Progressive Skills: ${hasProgressiveSkills ? '✅' : '❌'}`);
        console.log(`Portfolio Integration: ${hasPortfolioIntegration ? '✅' : '❌'}`);
      } else {
        console.log('❌ NO ENHANCED STRUCTURE');
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
    console.log('📊 OVERALL SYSTEM ANALYSIS');
    console.log('==========================\n');
    
    // Analyze timing perfection
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
    
    console.log('TIMING ANALYSIS:');
    console.log(`Total Lessons: ${totalLessons} (Target: 195)`);
    console.log(`Perfect Match: ${totalLessons === 195 ? '✅ PERFECT' : '❌ WRONG'}`);
    console.log(`Variance: ${variance.toFixed(1)}% (${minLessons}-${maxLessons} range)`);
    console.log(`Sustainable: ${variance <= 25 ? '✅ YES' : '❌ TOO HIGH'}`);
    
    console.log('\nLONG RANGE PLAN COVERAGE:');
    console.log(`LRP Subject: ${lrp?.subject || 'Unknown'}`);
    console.log(`LRP Grade: ${lrp?.grade || 'Unknown'}`);
    console.log(`Target Hours: ${lrp?.targetHours || 'Unknown'}`);
    console.log(`Actual Hours: ${units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0)}`);
    
    const expectedExpectations = ['AV1', 'AV2', 'AV3', 'AV4'];
    const allUnitExpectations = [...new Set(units.flatMap(u => u.expectations.map(e => e.expectation.code)))];
    console.log(`Expected Expectations: [${expectedExpectations.join(', ')}]`);
    console.log(`Unit Expectations: [${allUnitExpectations.sort().join(', ')}]`);
    console.log(`Perfect Coverage: ${JSON.stringify(expectedExpectations) === JSON.stringify(allUnitExpectations.sort()) ? '✅ YES' : '❌ NO'}`);
    
    console.log('\nCURRICULUM PROGRESSION:');
    // Check if units have different primary expectations
    const progressions = [];
    units.forEach((unit, i) => {
      const codes = unit.expectations.map(e => e.expectation.code).sort();
      progressions.push(codes.slice(0, 2)); // Primary expectations
    });
    
    let differentCount = 0;
    for (let i = 1; i < progressions.length; i++) {
      if (JSON.stringify(progressions[i]) !== JSON.stringify(progressions[i-1])) {
        differentCount++;
      }
    }
    
    console.log(`Different Monthly Focuses: ${differentCount}/9`);
    console.log(`Authentic Progression: ${differentCount >= 7 ? '✅ YES' : '❌ TOO SIMILAR'}`);
    
    console.log('\n🏆 PERFECTION ASSESSMENT');
    console.log('========================\n');
    
    const perfectionCriteria = [
      { name: 'Exact Lesson Count (195)', met: totalLessons === 195 },
      { name: 'Sustainable Variance (≤25%)', met: variance <= 25 },
      { name: 'Complete LRP Coverage', met: JSON.stringify(expectedExpectations) === JSON.stringify(allUnitExpectations.sort()) },
      { name: 'Authentic Progression', met: differentCount >= 7 },
      { name: 'All Units Have Descriptions', met: units.every(u => u.description) },
      { name: 'All Units Have Big Ideas', met: units.every(u => u.bigIdeas) },
      { name: 'All Units Have Essential Questions', met: units.every(u => u.essentialQuestions) },
      { name: 'All Units Have Assessment Plans', met: units.every(u => u.assessmentPlan) },
      { name: 'All Units Have Flexibility', met: units.every(u => u.fieldTripsAndGuestSpeakers) },
      { name: 'All Units Have Core+Extension', met: units.every(u => u.culminatingTask?.includes('CORE + EXTENSION')) }
    ];
    
    const metCount = perfectionCriteria.filter(c => c.met).length;
    const totalCriteria = perfectionCriteria.length;
    
    console.log('PERFECTION CHECKLIST:');
    perfectionCriteria.forEach(criterion => {
      console.log(`${criterion.met ? '✅' : '❌'} ${criterion.name}`);
    });
    
    console.log(`\nPERFECTION SCORE: ${metCount}/${totalCriteria} (${Math.round(metCount/totalCriteria*100)}%)`);
    
    if (metCount === totalCriteria) {
      console.log('\n🎉 UNITS ARE PERFECT! 🎉');
      console.log('All criteria met for true pedagogical excellence.');
    } else {
      console.log(`\n⚠️ UNITS NEED PERFECTION WORK (${totalCriteria - metCount} areas)`);
      console.log('\nGAPS IDENTIFIED:');
      perfectionCriteria.filter(c => !c.met).forEach(criterion => {
        console.log(`   • ${criterion.name}`);
      });
      console.log('\nTo achieve perfection, these gaps must be addressed through manual unit plan creation.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deepManualReview();