const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./packages/database/prisma/dev.db"
    }
  }
});

async function ultraCriticalReview() {
  console.log('🔍 ULTRA-CRITICAL REALITY CHECK');
  console.log('=================================\n');
  
  try {
    // Check what was actually created vs what verification script assumes
    
    // 1. Check actual lesson plans created
    const lessonPlans = await prisma.lessonPlan.findMany({
      where: {
        subjectArea: 'Formation personnelle et sociale'
      }
    });
    
    console.log('📚 ACTUAL LESSON PLAN REALITY:');
    console.log(`Lesson plans created: ${lessonPlans.length}`);
    console.log(`Verification claimed: 98 lessons`);
    console.log(`DISCREPANCY: ${lessonPlans.length === 0 ? '❌ MAJOR - No actual lessons exist!' : '✅ Verified'}\n`);
    
    // 2. Check unit plan details
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log('📋 UNIT PLAN DEEP ANALYSIS:');
    console.log(`Units created: ${units.length}`);
    
    let totalActualHours = 0;
    let unitsWithEmptyContent = 0;
    let unitsWithoutDifferentiation = 0;
    let unitsWithoutAssessment = 0;
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      totalActualHours += unit.estimatedHours || 0;
      
      // Check for empty or placeholder content
      const hasRealContent = unit.description && unit.description.length > 50;
      const hasDifferentiation = unit.differentiationStrategies && unit.differentiationStrategies.length > 50;
      const hasAssessment = unit.assessmentPlan && unit.assessmentPlan.length > 50;
      
      if (!hasRealContent) unitsWithEmptyContent++;
      if (!hasDifferentiation) unitsWithoutDifferentiation++;
      if (!hasAssessment) unitsWithoutAssessment++;
      
      console.log(`\nUnit ${i + 1}: ${unit.titleFr}`);
      console.log(`  Content Quality: ${hasRealContent ? '✅' : '❌ Shallow'}`);
      console.log(`  Differentiation: ${hasDifferentiation ? '✅' : '❌ Limited'}`);
      console.log(`  Assessment Plan: ${hasAssessment ? '✅' : '❌ Weak'}`);
      console.log(`  Hours: ${unit.estimatedHours || 'Not set'}`);
      console.log(`  Expectations: ${unit.expectations.length || 0} assigned`);
    }
    
    console.log('\n🎯 CONTENT QUALITY ASSESSMENT:');
    console.log(`Units with substantial content: ${units.length - unitsWithEmptyContent}/${units.length}`);
    console.log(`Units with detailed differentiation: ${units.length - unitsWithoutDifferentiation}/${units.length}`);
    console.log(`Units with comprehensive assessment: ${units.length - unitsWithoutAssessment}/${units.length}`);
    console.log(`Total actual hours: ${totalActualHours} (Target: 72.75)`);
    
    // 3. Check for Grade 1 appropriateness in actual content
    console.log('\n👶 GRADE 1 APPROPRIATENESS CHECK:');
    let grade1Issues = [];
    
    for (const unit of units) {
      // Check for age-inappropriate content
      const description = unit.description || '';
      const learningOutcomes = unit.learningOutcomes || '';
      
      if (description.includes('abstract') || learningOutcomes.includes('abstract')) {
        grade1Issues.push(`${unit.titleFr}: Contains abstract concepts`);
      }
      if (description.includes('complex') && !description.includes('simple')) {
        grade1Issues.push(`${unit.titleFr}: May be too complex`);
      }
      if (!description.includes('concret') && !description.includes('hands-on') && !description.includes('manipul')) {
        grade1Issues.push(`${unit.titleFr}: Lacks concrete activities`);
      }
    }
    
    console.log(`Grade 1 appropriateness issues: ${grade1Issues.length}`);
    for (const issue of grade1Issues) {
      console.log(`  ⚠️ ${issue}`);
    }
    
    // 4. Check emotional safety protocols depth
    console.log('\n🛡️ EMOTIONAL SAFETY PROTOCOL DEPTH:');
    let emotionalSafetyDetails = 0;
    
    for (const unit of units) {
      const diff = unit.differentiationStrategies || '';
      const assessment = unit.assessmentPlan || '';
      
      if (diff.includes('choix') || diff.includes('choice') || 
          diff.includes('privé') || diff.includes('private') ||
          assessment.includes('portfolio') || assessment.includes('observation')) {
        emotionalSafetyDetails++;
      }
    }
    
    console.log(`Units with emotional safety details: ${emotionalSafetyDetails}/${units.length}`);
    
    // 5. Check French immersion vocabulary development
    console.log('\n🇫🇷 FRENCH VOCABULARY DEVELOPMENT CHECK:');
    let vocabularyQuality = 0;
    
    for (const unit of units) {
      const description = unit.description || '';
      const outcomes = unit.learningOutcomes || '';
      
      if (description.includes('vocabulaire') || outcomes.includes('vocabulary') ||
          description.includes('français') || outcomes.includes('French')) {
        vocabularyQuality++;
      }
    }
    
    console.log(`Units with French vocabulary focus: ${vocabularyQuality}/${units.length}`);
    
    // 6. ETFO Structure Implementation Check
    console.log('\n📚 ETFO IMPLEMENTATION READINESS:');
    let etfoReady = 0;
    
    for (const unit of units) {
      const description = unit.description || '';
      
      if (description.includes('Minds On') || description.includes('Action') || description.includes('Consolidation') ||
          description.includes('trois parties') || description.includes('three-part')) {
        etfoReady++;
      }
    }
    
    console.log(`Units with ETFO structure details: ${etfoReady}/${units.length}`);
    
    // FINAL CRITICAL ASSESSMENT
    console.log('\n🏆 ULTRA-CRITICAL FINAL ASSESSMENT:');
    console.log('=====================================');
    
    const criticalIssues = [];
    const minorIssues = [];
    
    // Critical Issues (make it not perfect)
    if (lessonPlans.length === 0) {
      criticalIssues.push('NO ACTUAL LESSON PLANS CREATED - Only unit frameworks exist');
    }
    if (unitsWithEmptyContent > 2) {
      criticalIssues.push('Multiple units have insufficient content depth');
    }
    if (unitsWithoutDifferentiation > 3) {
      criticalIssues.push('Majority of units lack detailed differentiation strategies');
    }
    if (grade1Issues.length > 3) {
      criticalIssues.push('Multiple Grade 1 appropriateness concerns identified');
    }
    
    // Minor Issues (areas for improvement)
    if (unitsWithoutAssessment > 1) {
      minorIssues.push('Some units need more comprehensive assessment plans');
    }
    if (vocabularyQuality < 6) {
      minorIssues.push('French vocabulary development could be more explicit');
    }
    if (etfoReady < 5) {
      minorIssues.push('ETFO implementation details could be more specific');
    }
    
    console.log(`\n❌ CRITICAL ISSUES (${criticalIssues.length}):`);
    for (const issue of criticalIssues) {
      console.log(`  • ${issue}`);
    }
    
    console.log(`\n⚠️ MINOR ISSUES (${minorIssues.length}):`);
    for (const issue of minorIssues) {
      console.log(`  • ${issue}`);
    }
    
    // PERFECTION VERDICT
    const isPerfect = criticalIssues.length === 0 && minorIssues.length <= 2;
    
    console.log('\n🎯 PERFECTION VERDICT:');
    console.log('======================');
    
    if (isPerfect) {
      console.log('✅ APPROACHING PERFECTION');
      console.log('The work represents excellent pedagogical planning with minimal issues.');
    } else if (criticalIssues.length === 0) {
      console.log('🟡 HIGH QUALITY WITH ROOM FOR IMPROVEMENT');
      console.log('Solid foundation but some areas need enhancement.');
    } else {
      console.log('❌ NOT PERFECT - CRITICAL GAPS IDENTIFIED');
      console.log('Significant issues prevent certification as perfect.');
    }
    
    console.log(`\nOverall Score: ${Math.max(0, 100 - (criticalIssues.length * 25) - (minorIssues.length * 5))}/100`);
    
  } catch (error) {
    console.error('Error in ultra-critical review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ultraCriticalReview();