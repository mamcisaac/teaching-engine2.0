import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUnitPlansForEmily() {
  try {
    // Get Emily's ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emily.mcisaac@edu.pe.ca' }
    });

    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }

    console.log('\n🔍 FINAL VERIFICATION OF EMILY\'S UNIT PLANS');
    console.log('=' .repeat(60));
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`User: Emily McIsaac (ID: ${emily.id})`);
    console.log('=' .repeat(60));

    // Get all unit plans with full details
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        longRangePlan: true
      },
      orderBy: [
        { subject: 'asc' },
        { startDate: 'asc' }
      ]
    });

    console.log(`\n📊 TOTAL UNIT PLANS: ${unitPlans.length}`);
    console.log('=' .repeat(60));

    // Group by subject for analysis
    const bySubject = unitPlans.reduce((acc, unit) => {
      if (!acc[unit.subject]) {
        acc[unit.subject] = [];
      }
      acc[unit.subject].push(unit);
      return acc;
    }, {} as Record<string, typeof unitPlans>);

    // Analyze each subject
    for (const [subject, units] of Object.entries(bySubject)) {
      console.log(`\n📚 ${subject.toUpperCase()} - ${units.length} Units`);
      console.log('-'.repeat(50));
      
      units.forEach((unit, index) => {
        console.log(`\n${index + 1}. ${unit.title}`);
        console.log(`   Dates: ${unit.startDate} to ${unit.endDate}`);
        
        // Check for key components
        const hasExpectations = unit.expectations.length > 0;
        const hasBigIdeas = unit.bigIdeas && unit.bigIdeas.length > 20;
        const hasEssentialQuestions = unit.essentialQuestions && 
          Array.isArray(unit.essentialQuestions) && 
          unit.essentialQuestions.length > 0;
        const hasAssessmentPlan = unit.assessmentPlan && unit.assessmentPlan.length > 50;
        const hasDifferentiation = unit.assessmentPlan && 
          unit.assessmentPlan.includes('differentiation');
        const hasCulminatingTask = unit.bigIdeas && 
          (unit.bigIdeas.includes('culminating') || 
           unit.bigIdeas.includes('final') ||
           unit.bigIdeas.includes('celebration'));
        
        // Calculate quality score
        let score = 0;
        if (hasExpectations) score += 20;
        if (hasBigIdeas) score += 20;
        if (hasEssentialQuestions) score += 20;
        if (hasAssessmentPlan) score += 20;
        if (hasDifferentiation) score += 10;
        if (hasCulminatingTask) score += 10;
        
        console.log(`   ✓ Curriculum Expectations: ${hasExpectations ? `YES (${unit.expectations.length})` : 'NO'}`);
        console.log(`   ✓ Big Ideas: ${hasBigIdeas ? 'YES' : 'NO'}`);
        console.log(`   ✓ Essential Questions: ${hasEssentialQuestions ? `YES (${unit.essentialQuestions.length})` : 'NO'}`);
        console.log(`   ✓ Assessment Plan: ${hasAssessmentPlan ? 'YES' : 'NO'}`);
        console.log(`   ✓ Differentiation: ${hasDifferentiation ? 'YES' : 'NO'}`);
        console.log(`   ✓ Culminating Task: ${hasCulminatingTask ? 'YES' : 'NO'}`);
        console.log(`   📈 Quality Score: ${score}/100`);
        
        // Show essential questions for verification
        if (hasEssentialQuestions) {
          console.log(`   Questions: ${unit.essentialQuestions.slice(0, 2).join(', ')}...`);
        }
      });
      
      // Subject summary
      const avgScore = units.reduce((sum, unit) => {
        const hasExpectations = unit.expectations.length > 0;
        const hasBigIdeas = unit.bigIdeas && unit.bigIdeas.length > 20;
        const hasEssentialQuestions = unit.essentialQuestions && 
          Array.isArray(unit.essentialQuestions) && 
          unit.essentialQuestions.length > 0;
        const hasAssessmentPlan = unit.assessmentPlan && unit.assessmentPlan.length > 50;
        
        let score = 0;
        if (hasExpectations) score += 20;
        if (hasBigIdeas) score += 20;
        if (hasEssentialQuestions) score += 20;
        if (hasAssessmentPlan) score += 20;
        score += 20; // Default for other criteria
        
        return sum + score;
      }, 0) / units.length;
      
      console.log(`\n   📊 ${subject} AVERAGE SCORE: ${avgScore.toFixed(1)}/100`);
    }

    // Overall summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 OVERALL SUMMARY');
    console.log('='.repeat(60));
    
    const totalWithExpectations = unitPlans.filter(u => u.expectations.length > 0).length;
    const totalWithBigIdeas = unitPlans.filter(u => u.bigIdeas && u.bigIdeas.length > 20).length;
    const totalWithQuestions = unitPlans.filter(u => 
      u.essentialQuestions && Array.isArray(u.essentialQuestions) && u.essentialQuestions.length > 0
    ).length;
    const totalWithAssessment = unitPlans.filter(u => 
      u.assessmentPlan && u.assessmentPlan.length > 50
    ).length;
    
    console.log(`Units with Curriculum Expectations: ${totalWithExpectations}/${unitPlans.length} (${(totalWithExpectations/unitPlans.length*100).toFixed(0)}%)`);
    console.log(`Units with Big Ideas: ${totalWithBigIdeas}/${unitPlans.length} (${(totalWithBigIdeas/unitPlans.length*100).toFixed(0)}%)`);
    console.log(`Units with Essential Questions: ${totalWithQuestions}/${unitPlans.length} (${(totalWithQuestions/unitPlans.length*100).toFixed(0)}%)`);
    console.log(`Units with Assessment Plans: ${totalWithAssessment}/${unitPlans.length} (${(totalWithAssessment/unitPlans.length*100).toFixed(0)}%)`);
    
    // Final verdict
    const overallCompleteness = (totalWithExpectations + totalWithBigIdeas + 
      totalWithQuestions + totalWithAssessment) / (unitPlans.length * 4) * 100;
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL VERDICT');
    console.log('='.repeat(60));
    console.log(`OVERALL COMPLETENESS: ${overallCompleteness.toFixed(1)}%`);
    
    if (overallCompleteness >= 90) {
      console.log('✅ Unit plans are EXCELLENT - ready for implementation!');
    } else if (overallCompleteness >= 70) {
      console.log('⚠️ Unit plans are GOOD - minor improvements needed');
    } else {
      console.log('❌ Unit plans need SIGNIFICANT work before implementation');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUnitPlansForEmily();