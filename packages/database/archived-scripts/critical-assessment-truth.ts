#!/usr/bin/env tsx

/**
 * CRITICAL ASSESSMENT: ARE THESE TRULY HIGH-LEVEL LRPS?
 * Honest evaluation of current state
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function criticalAssessment() {
  console.log('💀 BRUTAL HONESTY: CRITICAL ASSESSMENT OF "PERFECT" LRPS\n');
  console.log('=====================================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  const subjects = ['Mathématiques', 'Français langue première', 'Sciences de la nature'];
  
  for (const subject of subjects) {
    const lrp = await prisma.longRangePlan.findFirst({
      where: { 
        subject,
        academicYear: '2025-2026',
        userId: emily.id
      }
    });
    
    if (!lrp) continue;
    
    console.log(`\n📚 ${subject.toUpperCase()}:`);
    console.log('─'.repeat(50));
    
    // Critical assessment
    const problems: string[] = [];
    const good: string[] = [];
    
    // Check if it's actually high-level
    if (lrp.goals?.includes('8:30-8:35') || lrp.goals?.includes('10:45-10:50')) {
      problems.push('❌ Contains minute-by-minute schedules (NOT high-level!)');
    }
    
    if (lrp.goals?.includes('Days 1-5:') || lrp.goals?.includes('Days 6-10:')) {
      problems.push('❌ Too specific about daily progression');
    }
    
    if (lrp.goals?.includes('20 buttons per child')) {
      problems.push('❌ Materials too specific (that\'s for unit plans!)');
    }
    
    if (lrp.goals?.includes('SEPTEMBER') && lrp.goals?.includes('JUNE')) {
      good.push('✓ Has monthly progression');
    }
    
    if (lrp.goals?.length && lrp.goals.length > 2000) {
      problems.push('❌ Too detailed (over 2000 chars) - not high-level');
    }
    
    if (lrp.assessmentOverview?.includes('2 minutes per child')) {
      problems.push('❌ Assessment too prescriptive');
    }
    
    console.log('\nWhat\'s Good:');
    good.forEach(g => console.log(`  ${g}`));
    
    console.log('\nWhat\'s Wrong:');
    problems.forEach(p => console.log(`  ${p}`));
    
    const score = good.length / (good.length + problems.length) * 100;
    console.log(`\nHigh-Level Score: ${score.toFixed(0)}%`);
    
    if (score < 50) {
      console.log('VERDICT: This is NOT a high-level LRP!');
      console.log('It\'s trying to be a unit plan or even lesson plan.');
    }
  }
  
  console.log('\n\n🎯 THE TRUTH ABOUT "HIGHEST TRUTH":\n');
  console.log('A TRUE high-level LRP should:');
  console.log('  1. Map expectations to terms/months');
  console.log('  2. Identify major themes and connections');
  console.log('  3. Suggest assessment approaches (not specifics)');
  console.log('  4. Outline resource categories (not exact items)');
  console.log('  5. Provide philosophical approach');
  console.log('  6. Leave details for unit planners');
  
  console.log('\nWhat I\'ve been creating:');
  console.log('  ❌ Quasi-unit plans with too much detail');
  console.log('  ❌ Daily schedules that belong in day plans');
  console.log('  ❌ Specific materials that unit planners should choose');
  console.log('  ❌ Minute-by-minute timing');
  
  console.log('\n💡 WHAT NEEDS TO CHANGE:');
  console.log('  → Remove all time-of-day references');
  console.log('  → Remove specific material quantities');
  console.log('  → Keep monthly themes but not daily details');
  console.log('  → Focus on big ideas and approaches');
  console.log('  → Trust unit planners to develop specifics\n');
  
  await prisma.$disconnect();
}

criticalAssessment().catch(console.error);