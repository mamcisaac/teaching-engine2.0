const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  try {
    // Get Emily's ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('Emily not found');
      return;
    }

    // Get all unit plans
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        expectations: true
      }
    });

    console.log('\n=================================');
    console.log('UNIT PLAN DATABASE VERIFICATION');
    console.log('=================================');
    console.log('Date:', new Date().toISOString());
    console.log('Total Units:', unitPlans.length);
    console.log('=================================\n');

    // Group by subject from LRP
    const lrpIds = [...new Set(unitPlans.map(u => u.longRangePlanId))];
    const lrps = await prisma.longRangePlan.findMany({
      where: { id: { in: lrpIds } }
    });

    const lrpMap = {};
    lrps.forEach(lrp => {
      lrpMap[lrp.id] = lrp.subject;
    });

    // Count units by subject
    const bySubject = {};
    unitPlans.forEach(unit => {
      const subject = lrpMap[unit.longRangePlanId] || 'Unknown';
      if (!bySubject[subject]) {
        bySubject[subject] = [];
      }
      bySubject[subject].push(unit);
    });

    // Analyze each subject
    for (const [subject, units] of Object.entries(bySubject)) {
      console.log(`\n${subject}: ${units.length} units`);
      console.log('-'.repeat(40));
      
      units.forEach((unit, index) => {
        const hasExpectations = unit.expectations.length > 0;
        const hasBigIdeas = unit.bigIdeas && unit.bigIdeas.length > 20;
        const hasQuestions = unit.essentialQuestions && 
          unit.essentialQuestions.length > 2;
        const hasAssessment = unit.assessmentPlan && 
          unit.assessmentPlan.length > 50;
        
        console.log(`${index + 1}. ${unit.title}`);
        console.log(`   - Expectations: ${hasExpectations ? 'YES (' + unit.expectations.length + ')' : 'NO'}`);
        console.log(`   - Big Ideas: ${hasBigIdeas ? 'YES' : 'NO'}`);
        console.log(`   - Questions: ${hasQuestions ? 'YES' : 'NO'}`);
        console.log(`   - Assessment: ${hasAssessment ? 'YES' : 'NO'}`);
      });
    }

    // Overall stats
    const withExpectations = unitPlans.filter(u => u.expectations.length > 0).length;
    const withBigIdeas = unitPlans.filter(u => u.bigIdeas && u.bigIdeas.length > 20).length;
    const withQuestions = unitPlans.filter(u => u.essentialQuestions && u.essentialQuestions.length > 2).length;
    const withAssessment = unitPlans.filter(u => u.assessmentPlan && u.assessmentPlan.length > 50).length;

    console.log('\n=================================');
    console.log('OVERALL STATISTICS');
    console.log('=================================');
    console.log(`Units with Expectations: ${withExpectations}/${unitPlans.length} (${Math.round(withExpectations/unitPlans.length*100)}%)`);
    console.log(`Units with Big Ideas: ${withBigIdeas}/${unitPlans.length} (${Math.round(withBigIdeas/unitPlans.length*100)}%)`);
    console.log(`Units with Questions: ${withQuestions}/${unitPlans.length} (${Math.round(withQuestions/unitPlans.length*100)}%)`);
    console.log(`Units with Assessment: ${withAssessment}/${unitPlans.length} (${Math.round(withAssessment/unitPlans.length*100)}%)`);
    
    const avgCompleteness = (withExpectations + withBigIdeas + withQuestions + withAssessment) / (unitPlans.length * 4) * 100;
    console.log(`\nOVERALL COMPLETENESS: ${avgCompleteness.toFixed(1)}%`);

    if (avgCompleteness >= 90) {
      console.log('STATUS: EXCELLENT - Unit plans are ready!');
    } else if (avgCompleteness >= 70) {
      console.log('STATUS: GOOD - Minor improvements needed');
    } else {
      console.log('STATUS: NEEDS WORK - Significant improvements required');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();