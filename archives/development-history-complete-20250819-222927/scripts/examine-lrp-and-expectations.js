const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function examineLRPAndExpectations() {
  try {
    console.log('🔍 EXAMINING LONG RANGE PLAN & CURRICULUM EXPECTATIONS');
    console.log('======================================================\n');
    
    // Get the Arts visuels Long Range Plan
    const lrp = await prisma.longRangePlan.findUnique({
      where: { id: 'cmebyc98v0009vjr16o3e7awo' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        unitPlans: {
          include: {
            expectations: {
              include: {
                expectation: true
              }
            }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!lrp) {
      console.log('❌ Long Range Plan not found!');
      return;
    }

    console.log('📋 LONG RANGE PLAN ANALYSIS');
    console.log('===========================\n');
    
    console.log(`Subject: ${lrp.subject}`);
    console.log(`Grade: ${lrp.grade}`);
    console.log(`School Year: ${lrp.schoolYear}`);
    console.log(`Target Hours: ${lrp.targetHours}`);
    console.log(`Created: ${lrp.createdAt.toDateString()}`);
    console.log(`User ID: ${lrp.userId}`);
    
    console.log('\n📚 CURRICULUM EXPECTATIONS IN LRP');
    console.log('==================================\n');
    
    const lrpExpectations = lrp.expectations.map(e => e.expectation);
    console.log(`Total Expectations in LRP: ${lrpExpectations.length}`);
    
    lrpExpectations.forEach((exp, i) => {
      console.log(`${i+1}. ${exp.code}: ${exp.title_fr || exp.title}`);
      console.log(`   Subject: ${exp.subject} | Grade: ${exp.grade}`);
      console.log(`   Description: ${(exp.description_fr || exp.description || '').substring(0, 100)}...`);
      console.log('');
    });
    
    // Verify this matches documented expectation count
    console.log('EXPECTATION COUNT VERIFICATION:');
    console.log(`From CLAUDE.md: Arts should have 10 expectations`);
    console.log(`Actual in LRP: ${lrpExpectations.length} expectations`);
    console.log(`Match: ${lrpExpectations.length === 10 ? '✅ PERFECT' : '❌ MISMATCH'}\n`);

    console.log('📊 HOURS ALIGNMENT WITH EMILY\'S MODEL');
    console.log('=====================================\n');
    
    console.log(`LRP Target Hours: ${lrp.targetHours}`);
    console.log(`Emily's Model: 195 lessons × 45 min = 146.25 hours`);
    console.log(`Alignment: ${Math.abs(lrp.targetHours - 146.25) <= 2 ? '✅ PERFECT' : '❌ MISMATCH'}`);
    
    // Calculate actual unit hours
    const actualUnitHours = lrp.unitPlans.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    console.log(`Actual Unit Hours: ${actualUnitHours}`);
    console.log(`Unit Hours vs LRP: ${Math.abs(actualUnitHours - lrp.targetHours) <= 2 ? '✅ ALIGNED' : '❌ MISMATCH'}`);
    
    console.log('\n🎯 UNIT PLANS COVERAGE OF LRP EXPECTATIONS');
    console.log('==========================================\n');
    
    // Check if all LRP expectations are covered by unit plans
    const unitExpectationCodes = [...new Set(lrp.unitPlans.flatMap(unit => 
      unit.expectations.map(e => e.expectation.code)
    ))].sort();
    
    const lrpExpectationCodes = lrpExpectations.map(e => e.code).sort();
    
    console.log(`LRP Expectations: [${lrpExpectationCodes.join(', ')}]`);
    console.log(`Unit Expectations: [${unitExpectationCodes.join(', ')}]`);
    console.log(`Perfect Coverage: ${JSON.stringify(lrpExpectationCodes) === JSON.stringify(unitExpectationCodes) ? '✅ YES' : '❌ NO'}`);
    
    // Check for missing or extra expectations
    const missingFromUnits = lrpExpectationCodes.filter(code => !unitExpectationCodes.includes(code));
    const extraInUnits = unitExpectationCodes.filter(code => !lrpExpectationCodes.includes(code));
    
    if (missingFromUnits.length > 0) {
      console.log(`❌ Missing from Units: [${missingFromUnits.join(', ')}]`);
    }
    if (extraInUnits.length > 0) {
      console.log(`⚠️ Extra in Units: [${extraInUnits.join(', ')}]`);
    }
    
    console.log('\n📅 UNIT PLAN TIMING ANALYSIS');
    console.log('============================\n');
    
    let totalLessons = 0;
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    console.log('Unit Timing Distribution:');
    lrp.unitPlans.forEach((unit, i) => {
      const lessons = Math.round(((unit.estimatedHours || 0) * 60) / 45);
      totalLessons += lessons;
      console.log(`${months[i] || i+1}: ${lessons} lessons (${unit.estimatedHours}h) - ${unit.title}`);
    });
    
    console.log(`\nTotal Lessons: ${totalLessons}`);
    console.log(`Emily's Target: 195 lessons`);
    console.log(`Perfect Match: ${totalLessons === 195 ? '✅ YES' : '❌ NO'}`);
    
    // Calculate variance
    const lessonCounts = lrp.unitPlans.map(unit => Math.round(((unit.estimatedHours || 0) * 60) / 45));
    const minLessons = Math.min(...lessonCounts);
    const maxLessons = Math.max(...lessonCounts);
    const variance = ((maxLessons - minLessons) / minLessons * 100);
    
    console.log(`Variance: ${variance.toFixed(1)}% (Range: ${minLessons}-${maxLessons})`);
    console.log(`Sustainable: ${variance <= 25 ? '✅ YES' : '❌ TOO HIGH'}`);
    
    console.log('\n🎭 DETAILED EXPECTATION ANALYSIS');
    console.log('=================================\n');
    
    // Get all Arts visuels expectations from database
    const allArtsExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts visuels',
        grade: 1
      }
    });
    
    console.log(`Total Arts visuels Grade 1 expectations in database: ${allArtsExpectations.length}`);
    
    allArtsExpectations.forEach((exp, i) => {
      const inLRP = lrpExpectationCodes.includes(exp.code);
      console.log(`${i+1}. ${exp.code}: ${exp.title_fr || exp.title}`);
      console.log(`   In LRP: ${inLRP ? '✅' : '❌'}`);
      console.log(`   Description: ${(exp.description_fr || exp.description || '').substring(0, 80)}...`);
      console.log('');
    });
    
    console.log('\n🏆 LRP PERFECTION ASSESSMENT');
    console.log('============================\n');
    
    const lrpCriteria = [
      { name: 'Correct Subject (Arts visuels)', met: lrp.subject === 'Arts visuels' },
      { name: 'Correct Grade (1)', met: lrp.grade === 1 },
      { name: 'Correct Target Hours (146.25)', met: Math.abs(lrp.targetHours - 146.25) <= 2 },
      { name: 'Complete Expectation Coverage', met: lrpExpectations.length === allArtsExpectations.length },
      { name: 'Unit Plans Created', met: lrp.unitPlans.length === 10 },
      { name: 'Units Total 195 Lessons', met: totalLessons === 195 },
      { name: 'Sustainable Variance', met: variance <= 25 },
      { name: 'All Expectations in Units', met: JSON.stringify(lrpExpectationCodes) === JSON.stringify(unitExpectationCodes) }
    ];
    
    const metCriteria = lrpCriteria.filter(c => c.met).length;
    const totalCriteria = lrpCriteria.length;
    
    console.log('LRP PERFECTION CHECKLIST:');
    lrpCriteria.forEach(criterion => {
      console.log(`${criterion.met ? '✅' : '❌'} ${criterion.name}`);
    });
    
    console.log(`\nLRP SCORE: ${metCriteria}/${totalCriteria} (${Math.round(metCriteria/totalCriteria*100)}%)`);
    
    if (metCriteria === totalCriteria) {
      console.log('\n🎉 LONG RANGE PLAN IS PERFECT! 🎉');
      console.log('LRP meets all requirements and aligns with Emily\'s daily teaching model.');
    } else {
      console.log(`\n⚠️ LRP needs attention (${totalCriteria - metCriteria} issues)`);
      lrpCriteria.filter(c => !c.met).forEach(criterion => {
        console.log(`   • ${criterion.name}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

examineLRPAndExpectations();