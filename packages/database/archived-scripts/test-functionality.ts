#!/usr/bin/env tsx

/**
 * TEST CURRENT "PERFECT" UNITS WITH FUNCTIONALITY CRITERIA
 * Are they actually useful for lesson planners?
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testFunctionality() {
  console.log('🧪 TESTING CURRENT "PERFECT" UNITS WITH FUNCTIONALITY CRITERIA\n');
  console.log('Are they actually useful for their intended audience?\n');
  console.log('=========================================================\n');
  
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
  
  console.log('🎯 TESTING SAMPLE UNIT WITH FUNCTIONALITY CRITERIA:\n');
  
  const sampleUnit = mathLRP.unitPlans[0]; // First unit
  
  console.log(`UNIT: ${sampleUnit.title}\n`);
  
  console.log('BIG IDEAS:');
  console.log(`"${sampleUnit.bigIdeas}"`);
  console.log(`(${sampleUnit.bigIdeas?.length} characters)\n`);
  
  console.log('DESCRIPTION:');
  console.log(`"${sampleUnit.description}"`);
  console.log(`(${sampleUnit.description?.length} characters)\n`);
  
  console.log('ASSESSMENT:');
  console.log(`"${sampleUnit.assessmentPlan}"`);
  console.log(`(${sampleUnit.assessmentPlan?.length} characters)\n`);
  
  console.log('🔍 FUNCTIONALITY TEST QUESTIONS:\n');
  
  const questions = [
    {
      question: "Does this help lesson planners create meaningful lessons?",
      test: "Would a teacher know what math concepts to focus on?",
      current: sampleUnit.bigIdeas || '',
      assessment: ''
    },
    {
      question: "Is there enough detail to guide implementation?", 
      test: "Can teachers understand HOW to approach this unit?",
      current: sampleUnit.description || '',
      assessment: ''
    },
    {
      question: "Are the mathematical concepts clear?",
      test: "Would lesson planners understand the learning goals?",
      current: sampleUnit.bigIdeas || '',
      assessment: ''
    },
    {
      question: "Is the progression of learning evident?",
      test: "Can teachers see how understanding develops?",
      current: sampleUnit.description || '',
      assessment: ''
    },
    {
      question: "Can teachers understand what to assess?",
      test: "Would they know what evidence to look for?",
      current: sampleUnit.assessmentPlan || '',
      assessment: ''
    }
  ];
  
  let functionalityScore = 0;
  const maxScore = questions.length;
  
  questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.question}`);
    console.log(`   Test: ${q.test}`);
    console.log(`   Current content: "${q.current}"`);
    
    // Assess functionality
    let useful = false;
    let assessment = '';
    
    if (i === 0) { // Big ideas help with lessons?
      if (q.current.includes('counting') && q.current.includes('mathematical thinking')) {
        useful = true;
        assessment = 'Some conceptual guidance provided';
      } else {
        assessment = 'Too vague to guide lesson planning';
      }
    } else if (i === 1) { // Detail for implementation?
      if (q.current.includes('September') && q.current.includes('community')) {
        useful = false; // Still quite general
        assessment = 'General overview but lacks implementation guidance';
      } else {
        assessment = 'Insufficient implementation detail';
      }
    } else if (i === 2) { // Mathematical concepts clear?
      if (q.current.includes('counting') && q.current.includes('numerals')) {
        useful = true;
        assessment = 'Basic concepts identifiable';
      } else {
        assessment = 'Mathematical focus unclear';
      }
    } else if (i === 3) { // Learning progression evident?
      if (q.current.includes('establishing') || q.current.includes('foundational')) {
        useful = false; // Too general
        assessment = 'General progression but lacks specificity';
      } else {
        assessment = 'No clear progression shown';
      }
    } else if (i === 4) { // Assessment guidance?
      if (q.current.includes('observe') || q.current.includes('document')) {
        useful = true;
        assessment = 'Basic assessment approaches mentioned';
      } else {
        assessment = 'Insufficient assessment guidance';
      }
    }
    
    console.log(`   Assessment: ${assessment}`);
    console.log(`   Useful for lesson planners? ${useful ? 'YES ✓' : 'NO ❌'}\n`);
    
    if (useful) functionalityScore++;
  });
  
  const functionalityPercentage = (functionalityScore / maxScore) * 100;
  console.log(`FUNCTIONALITY SCORE: ${functionalityScore}/${maxScore} (${functionalityPercentage}%)\n`);
  
  console.log('💭 LESSON PLANNER PERSPECTIVE:\n');
  console.log('If I were a teacher trying to plan lessons from this unit:\n');
  
  const teacherConcerns = [
    'What specific counting activities should I plan?',
    'How do I "establish mathematical community"?',
    'What materials support "foundational counting"?',
    'How do I observe "counting behaviors"?',
    'What does "comfort with materials" look like?',
    'How do I document "mathematical thinking"?',
    'What progression should I follow through September?',
    'How do I differentiate for different counting levels?'
  ];
  
  console.log('QUESTIONS MY UNIT DOESN\'T ANSWER:');
  teacherConcerns.forEach((concern, i) => {
    console.log(`${i + 1}. ${concern}`);
  });
  
  console.log('\n🚨 BRUTAL TRUTH ABOUT MY "PERFECT" UNITS:\n');
  
  if (functionalityPercentage >= 80) {
    console.log('✅ Actually functional for lesson planners');
  } else if (functionalityPercentage >= 60) {
    console.log('⚠️ Somewhat useful but missing key guidance');
  } else if (functionalityPercentage >= 40) {
    console.log('❌ Limited usefulness - too vague for practical use');
  } else {
    console.log('💀 NOT FUNCTIONAL - lesson planners would struggle');
  }
  
  console.log('\nMy units are probably:');
  console.log('• Too MINIMAL to guide implementation');
  console.log('• Too VAGUE for practical planning');
  console.log('• Too CONCEPTUAL without tactical guidance');
  console.log('• Missing the BRIDGE between strategy and operations\n');
  
  console.log('🎯 WHAT TRULY TACTICAL UNITS NEED:\n');
  console.log('More implementation guidance:');
  console.log('• Specific material categories (not exact items)');
  console.log('• Assessment examples (not procedures)');
  console.log('• Learning progression details (not daily plans)');
  console.log('• Differentiation suggestions (not scripts)');
  console.log('• Connection opportunities (not requirements)\n');
  
  console.log('⚖️ THE BALANCE:');
  console.log('Strategic LRP: High-level vision ✓ (appropriate level)');
  console.log('Tactical Units: Implementation guidance ❌ (too minimal currently)');
  console.log('Operational Lessons: Daily procedures → (to be developed)\n');
  
  console.log('💡 RECOMMENDATION:');
  console.log('ADD BACK some of the "operational" content I removed.');
  console.log('It wasn\'t operational - it was tactical guidance.');
  console.log('My assessment script was WRONG about what to remove.\n');
  
  await prisma.$disconnect();
}

testFunctionality().catch(console.error);