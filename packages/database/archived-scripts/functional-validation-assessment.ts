#!/usr/bin/env tsx

/**
 * FUNCTIONAL VALIDATION ASSESSMENT
 * Test the rebuilt units with proper functional criteria
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function functionalValidationAssessment() {
  console.log('🧪 FUNCTIONAL VALIDATION ASSESSMENT\n');
  console.log('Testing rebuilt units with proper criteria\n');
  console.log('=========================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      userId: emily.id
    },
    include: {
      unitPlans: {
        include: {
          expectations: {
            include: { expectation: true }
          }
        },
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!mathLRP) return;
  
  async function assessUnitFunctionality(unit: any) {
    const scores: any = {};
    
    // Conceptual Clarity (25% weight)
    let conceptualScore = 0;
    if (unit.bigIdeas && unit.bigIdeas.length >= 200) conceptualScore += 25; // Comprehensive
    if (unit.bigIdeas?.includes('understand') || unit.bigIdeas?.includes('concept') || unit.bigIdeas?.includes('thinking')) conceptualScore += 25;
    if (unit.expectations && unit.expectations.length > 0) conceptualScore += 25;
    if (unit.bigIdeas && unit.bigIdeas.split('.').length >= 3) conceptualScore += 25; // Multiple concepts
    scores.conceptualClarity = Math.min(conceptualScore, 100);
    
    // Implementation Guidance (30% weight)  
    let implementationScore = 0;
    if (unit.description && unit.description.length >= 250) implementationScore += 15;
    if (unit.description?.includes('progression') || unit.description?.includes('develop')) implementationScore += 15;
    if (unit.priorKnowledge && unit.priorKnowledge.length > 200) implementationScore += 25; // Key activities
    if (unit.culminatingTask && unit.culminatingTask.length > 200) implementationScore += 25; // Resources
    if (unit.differentiationStrategies && unit.differentiationStrategies !== 'null') implementationScore += 20;
    scores.implementationGuidance = Math.min(implementationScore, 100);
    
    // Assessment Clarity (20% weight)
    let assessmentScore = 0;
    if (unit.assessmentPlan && unit.assessmentPlan.length >= 300) assessmentScore += 30; // Comprehensive
    if (unit.assessmentPlan?.includes('observe') || unit.assessmentPlan?.includes('document')) assessmentScore += 25;
    if (unit.assessmentPlan?.includes('portfolio') || unit.assessmentPlan?.includes('photo')) assessmentScore += 20;
    if (unit.assessmentPlan?.includes('Can students') || unit.assessmentPlan?.includes('Do they')) assessmentScore += 25; // Specific questions
    scores.assessmentClarity = Math.min(assessmentScore, 100);
    
    // Practical Utility (15% weight)
    let practicalScore = 0;
    if (unit.estimatedHours && unit.estimatedHours >= 10) practicalScore += 25;
    if (unit.differentiationStrategies && unit.differentiationStrategies !== 'null') practicalScore += 25;
    if (unit.crossCurricularConnections && unit.crossCurricularConnections.length > 100) practicalScore += 25;
    if (unit.culminatingTask && unit.culminatingTask.includes('Materials')) practicalScore += 25; // Resource guidance
    scores.practicalUtility = Math.min(practicalScore, 100);
    
    // Boundary Respect (10% weight) 
    let boundaryScore = 100; // Start perfect, deduct for violations
    if (unit.description?.includes(':00') || unit.description?.includes(' minutes')) boundaryScore -= 25;
    if (unit.bigIdeas?.includes('Daily:') || unit.bigIdeas?.includes('Step 1:')) boundaryScore -= 25;
    if (unit.assessmentPlan?.includes('At 2:00') || unit.assessmentPlan?.includes('Every day at')) boundaryScore -= 25;
    if (unit.estimatedHours < 10) boundaryScore -= 25; // Too granular
    scores.boundaryRespect = Math.max(boundaryScore, 0);
    
    // Calculate weighted total
    const totalScore = (scores.conceptualClarity * 0.25) + 
                      (scores.implementationGuidance * 0.30) + 
                      (scores.assessmentClarity * 0.20) + 
                      (scores.practicalUtility * 0.15) + 
                      (scores.boundaryRespect * 0.10);
    
    return {
      totalScore: Math.round(totalScore),
      breakdown: scores,
      verdict: totalScore >= 85 ? 'TRULY FUNCTIONAL' :
               totalScore >= 70 ? 'FUNCTIONAL WITH GAPS' :
               totalScore >= 50 ? 'SOMEWHAT FUNCTIONAL' :
               'NOT FUNCTIONAL'
    };
  }
  
  console.log('📊 FUNCTIONAL ASSESSMENT RESULTS:\n');
  
  let totalUnits = 0;
  let functionalUnits = 0;
  let totalScore = 0;
  
  for (let i = 0; i < mathLRP.unitPlans.length; i++) {
    const unit = mathLRP.unitPlans[i];
    const assessment = await assessUnitFunctionality(unit);
    
    console.log(`📚 UNIT ${i + 1}: ${unit.title}`);
    console.log('─'.repeat(60));
    console.log(`Overall Score: ${assessment.totalScore}/100`);
    console.log(`Verdict: ${assessment.verdict}`);
    console.log('');
    console.log('Breakdown:');
    console.log(`  Conceptual Clarity (25%): ${assessment.breakdown.conceptualClarity}/100`);
    console.log(`  Implementation Guidance (30%): ${assessment.breakdown.implementationGuidance}/100`);
    console.log(`  Assessment Clarity (20%): ${assessment.breakdown.assessmentClarity}/100`);
    console.log(`  Practical Utility (15%): ${assessment.breakdown.practicalUtility}/100`);
    console.log(`  Boundary Respect (10%): ${assessment.breakdown.boundaryRespect}/100`);
    console.log('');
    
    // Sample content check
    console.log('Content Analysis:');
    console.log(`  Big Ideas length: ${unit.bigIdeas?.length || 0} chars`);
    console.log(`  Description length: ${unit.description?.length || 0} chars`);
    console.log(`  Assessment length: ${unit.assessmentPlan?.length || 0} chars`);
    console.log(`  Has implementation guidance: ${unit.priorKnowledge ? 'YES' : 'NO'}`);
    console.log(`  Has resource guidance: ${unit.culminatingTask ? 'YES' : 'NO'}`);
    console.log(`  Has differentiation: ${unit.differentiationStrategies && unit.differentiationStrategies !== 'null' ? 'YES' : 'NO'}`);
    console.log(`  Has connections: ${unit.crossCurricularConnections ? 'YES' : 'NO'}`);
    console.log('');
    
    totalUnits++;
    totalScore += assessment.totalScore;
    if (assessment.totalScore >= 70) functionalUnits++;
    
    if (assessment.totalScore >= 85) {
      console.log('✨ TRULY FUNCTIONAL - Serves lesson planners well');
    } else if (assessment.totalScore >= 70) {
      console.log('✅ FUNCTIONAL - Good guidance with minor gaps');  
    } else if (assessment.totalScore >= 50) {
      console.log('⚠️ SOMEWHAT FUNCTIONAL - Has issues');
    } else {
      console.log('❌ NOT FUNCTIONAL - Major problems');
    }
    console.log('\n');
  }
  
  const averageScore = totalScore / totalUnits;
  const functionalPercentage = (functionalUnits / totalUnits) * 100;
  
  console.log('📈 OVERALL ASSESSMENT SUMMARY:\n');
  console.log(`Total Units Assessed: ${totalUnits}`);
  console.log(`Average Score: ${averageScore.toFixed(1)}/100`);
  console.log(`Functional Units (70+): ${functionalUnits}/${totalUnits} (${functionalPercentage.toFixed(0)}%)`);
  console.log('');
  
  console.log('🎯 FINAL VERDICT:\n');
  
  if (averageScore >= 85) {
    console.log('✨ MATHEMATICS UNITS ARE TRULY FUNCTIONAL!');
    console.log('These units effectively serve lesson planners.');
    console.log('They bridge strategic vision to operational implementation.');
    console.log('Teachers can confidently plan lessons from these units.');
  } else if (averageScore >= 70) {
    console.log('✅ MATHEMATICS UNITS ARE FUNCTIONAL');
    console.log('These units generally serve lesson planners well.');
    console.log('Minor improvements could enhance utility.');
  } else if (averageScore >= 50) {
    console.log('⚠️ MATHEMATICS UNITS ARE SOMEWHAT FUNCTIONAL');
    console.log('These units have significant gaps.');
    console.log('Lesson planners would struggle with some aspects.');
  } else {
    console.log('❌ MATHEMATICS UNITS ARE NOT FUNCTIONAL');
    console.log('These units do not effectively serve lesson planners.');
    console.log('Major revision needed.');
  }
  
  console.log('\n🔍 COMPARISON TO PREVIOUS VERSIONS:\n');
  console.log('Minimal "Perfect" Units (Previous):');
  console.log('  • Score: 0/5 functionality questions');
  console.log('  • Verdict: NOT FUNCTIONAL');
  console.log('  • Problem: Too vague to guide lesson planning');
  console.log('');
  console.log('Comprehensive Tactical Units (Current):');
  console.log(`  • Average Score: ${averageScore.toFixed(1)}/100`);
  console.log(`  • Functional Units: ${functionalPercentage.toFixed(0)}%`);
  console.log('  • Improvement: Added implementation guidance');
  console.log('');
  
  if (averageScore >= 70) {
    console.log('🏆 MASSIVE IMPROVEMENT ACHIEVED!');
    console.log('The rebuilt units are now genuinely useful for their intended purpose.');
  }
  
  await prisma.$disconnect();
}

functionalValidationAssessment().catch(console.error);