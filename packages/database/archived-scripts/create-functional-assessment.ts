#!/usr/bin/env tsx

/**
 * CREATE PROPER FUNCTIONAL ASSESSMENT FOR TACTICAL UNITS
 * Test what actually matters: Do they serve lesson planners?
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createFunctionalAssessment() {
  console.log('🎯 CREATING PROPER FUNCTIONAL ASSESSMENT FOR TACTICAL UNITS\n');
  console.log('Testing what actually matters: utility for lesson planners\n');
  console.log('=========================================================\n');
  
  console.log('📋 FUNCTIONAL ASSESSMENT FRAMEWORK:\n');
  
  const assessmentCriteria = {
    conceptualClarity: {
      name: 'Conceptual Clarity',
      weight: 25,
      questions: [
        'Are the mathematical concepts clearly articulated?',
        'Would lesson planners understand what students should learn?',
        'Are big ideas comprehensive enough to guide planning?',
        'Do concepts connect logically within the unit?'
      ],
      tests: [
        'Big ideas explain WHAT students will understand',
        'Mathematical focus is explicit and clear',
        'Concepts are grade-appropriate and specific',
        'Connections between ideas are evident'
      ]
    },
    
    implementationGuidance: {
      name: 'Implementation Guidance',
      weight: 30,
      questions: [
        'Do lesson planners know HOW to approach this unit?',
        'Is there enough detail to guide but not prescribe?',
        'Are materials and approaches suggested?',
        'Is the learning progression clear?'
      ],
      tests: [
        'Provides tactical "how" without operational "exact steps"',
        'Suggests materials categories/types',
        'Shows learning progression through unit',
        'Offers multiple approaches for different learners'
      ]
    },
    
    assessmentClarity: {
      name: 'Assessment Clarity', 
      weight: 20,
      questions: [
        'Do teachers know what evidence to look for?',
        'Are assessment approaches practical for Grade 1?',
        'Is there variety in assessment methods suggested?',
        'Do assessments align with big ideas?'
      ],
      tests: [
        'Specific examples of what to observe',
        'Age-appropriate assessment methods',
        'Multiple ways to document learning',
        'Clear connection to learning goals'
      ]
    },
    
    practicalUtility: {
      name: 'Practical Utility',
      weight: 15,
      questions: [
        'Would a teacher feel prepared to plan lessons?',
        'Does it answer common planning questions?',
        'Is differentiation guidance provided?',
        'Are time allocations realistic?'
      ],
      tests: [
        'Addresses "What do I teach?" and "How do I teach it?"',
        'Includes differentiation suggestions',
        'Time allocation matches content scope',
        'Connects to curriculum expectations clearly'
      ]
    },
    
    boundaryRespect: {
      name: 'Boundary Respect',
      weight: 10,
      questions: [
        'Does it avoid prescribing exact daily activities?',
        'Does it leave room for teacher judgment?',
        'Is it tactical level, not operational?',
        'Does it connect to strategic LRP vision?'
      ],
      tests: [
        'No minute-by-minute schedules',
        'No scripted activities or lessons',
        'Maintains professional teacher autonomy',
        'Bridges strategy to operations appropriately'
      ]
    }
  };
  
  console.log('📊 ASSESSMENT CRITERIA WITH WEIGHTS:\n');
  
  Object.entries(assessmentCriteria).forEach(([key, criterion]) => {
    console.log(`${criterion.name} (${criterion.weight}% weight):`);
    criterion.questions.forEach((q, i) => {
      console.log(`  ${i+1}. ${q}`);
    });
    console.log(`  Tests:`);
    criterion.tests.forEach((t, i) => {
      console.log(`    • ${t}`);
    });
    console.log();
  });
  
  console.log('🧪 ASSESSMENT FUNCTION:\n');
  
  // Create the assessment function
  const assessmentFunction = `
  async function assessUnitFunctionality(unit) {
    const scores = {};
    let totalScore = 0;
    
    // Conceptual Clarity (25%)
    let conceptualScore = 0;
    if (unit.bigIdeas && unit.bigIdeas.length > 100) conceptualScore += 25;
    if (unit.bigIdeas?.includes('understand') || unit.bigIdeas?.includes('concept')) conceptualScore += 25;
    if (unit.expectations && unit.expectations.length > 0) conceptualScore += 25;
    if (unit.bigIdeas?.split('.').length >= 3) conceptualScore += 25; // Multiple concepts
    scores.conceptualClarity = Math.min(conceptualScore, 100);
    
    // Implementation Guidance (30%)
    let implementationScore = 0;
    if (unit.description && unit.description.length > 200) implementationScore += 20;
    if (unit.description?.includes('materials') || unit.description?.includes('approach')) implementationScore += 20;
    if (unit.description?.includes('progression') || unit.description?.includes('develop')) implementationScore += 20;
    if (unit.description?.includes('concrete') || unit.description?.includes('manipulative')) implementationScore += 20;
    if (unit.priorKnowledge || unit.keyActivities) implementationScore += 20; // Has additional guidance
    scores.implementationGuidance = Math.min(implementationScore, 100);
    
    // Assessment Clarity (20%)
    let assessmentScore = 0;
    if (unit.assessmentPlan && unit.assessmentPlan.length > 150) assessmentScore += 25;
    if (unit.assessmentPlan?.includes('observe') || unit.assessmentPlan?.includes('document')) assessmentScore += 25;
    if (unit.assessmentPlan?.includes('portfolio') || unit.assessmentPlan?.includes('photo')) assessmentScore += 25;
    if (unit.assessmentPlan?.includes('example') || unit.assessmentPlan?.includes('evidence')) assessmentScore += 25;
    scores.assessmentClarity = Math.min(assessmentScore, 100);
    
    // Practical Utility (15%)
    let practicalScore = 0;
    if (unit.estimatedHours && unit.estimatedHours >= 10) practicalScore += 25;
    if (unit.differentiationStrategies) practicalScore += 25;
    if (unit.crossCurricularConnections) practicalScore += 25;
    if (unit.culminatingTask || unit.keyVocabulary) practicalScore += 25;
    scores.practicalUtility = Math.min(practicalScore, 100);
    
    // Boundary Respect (10%)
    let boundaryScore = 0;
    if (!unit.description?.includes(':00') && !unit.description?.includes('minutes')) boundaryScore += 25;
    if (!unit.bigIdeas?.includes('Daily:') && !unit.bigIdeas?.includes('Step 1:')) boundaryScore += 25;
    if (!unit.assessmentPlan?.includes('Every day') && !unit.assessmentPlan?.includes('At 2:00')) boundaryScore += 25;
    if (unit.estimatedHours >= 10) boundaryScore += 25; // Substantial unit, not daily
    scores.boundaryRespect = Math.min(boundaryScore, 100);
    
    // Calculate weighted total
    totalScore = (scores.conceptualClarity * 0.25) + 
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
  }`;
  
  console.log('💡 KEY DIFFERENCES FROM MY FLAWED ASSESSMENT:\n');
  console.log('OLD (Wrong) Assessment:');
  console.log('  ❌ Character limits (arbitrary)');
  console.log('  ❌ No bullet points (format obsession)');
  console.log('  ❌ No "Learning Journey" (actually useful)');
  console.log('  ❌ Minimal = perfect (wrong)');
  console.log('');
  console.log('NEW (Functional) Assessment:');
  console.log('  ✅ Tests utility for lesson planners');
  console.log('  ✅ Rewards comprehensive guidance');
  console.log('  ✅ Values implementation details');
  console.log('  ✅ Checks boundary respect without format rules');
  console.log('  ✅ Focuses on serving the intended audience\n');
  
  console.log('🎯 ASSESSMENT TARGETS:\n');
  console.log('Target Score: 85+ (Truly Functional)');
  console.log('Minimum Acceptable: 70+ (Functional with gaps)');
  console.log('Below 50: Not functional for lesson planners\n');
  
  console.log('🔧 WHAT THIS ASSESSMENT REWARDS:\n');
  console.log('• Comprehensive big ideas that guide planning');
  console.log('• Implementation details that help teachers');
  console.log('• Specific assessment examples');
  console.log('• Practical guidance for differentiation');
  console.log('• Enough detail to be truly useful');
  console.log('• Tactical level without operational prescriptions\n');
  
  await prisma.$disconnect();
}

createFunctionalAssessment().catch(console.error);