#!/usr/bin/env tsx

/**
 * BRUTAL CRITICAL ASSESSMENT OF MATHEMATICS UNITS
 * Are they actually perfect or am I just claiming they are?
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function brutalCriticalAssessment() {
  console.log('💀 BRUTAL CRITICAL ASSESSMENT OF MATHEMATICS UNITS\n');
  console.log('Am I just calling them perfect or are they actually perfect?\n');
  console.log('====================================================\n');
  
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
  
  console.log('🔍 EXAMINING EACH UNIT FOR REAL PROBLEMS:\n');
  
  let totalProblems = 0;
  let totalGood = 0;
  
  for (let i = 0; i < mathLRP.unitPlans.length; i++) {
    const unit = mathLRP.unitPlans[i];
    console.log(`📚 UNIT ${i + 1}: ${unit.title}`);
    console.log('─'.repeat(60));
    
    const problems: string[] = [];
    const good: string[] = [];
    
    // Check big ideas quality
    if (unit.bigIdeas) {
      if (unit.bigIdeas.includes('Learning Journey:') || unit.bigIdeas.includes('•')) {
        problems.push('❌ Big Ideas contain operational details/bullet points');
      }
      if (unit.bigIdeas.length > 500) {
        problems.push('❌ Big Ideas too long (over 500 chars) - should be conceptual');
      }
      if (unit.bigIdeas.includes('September focus:') || unit.bigIdeas.includes('October focus:')) {
        problems.push('❌ Big Ideas contain monthly specifics (too operational)');
      }
      if (unit.bigIdeas.split('\n').length > 6) {
        problems.push('❌ Big Ideas too detailed (over 6 lines)');
      }
      
      // Check if actually conceptual
      const hasKeyUnderstandings = unit.bigIdeas.includes('Key Understandings:');
      const hasBulletPoints = unit.bigIdeas.includes('•');
      if (hasKeyUnderstandings && hasBulletPoints) {
        // This might be too detailed
        if (unit.bigIdeas.split('•').length > 4) {
          problems.push('❌ Too many bullet points in big ideas (over 3)');
        }
      }
    } else {
      problems.push('❌ No big ideas at all');
    }
    
    // Check description quality
    if (unit.description) {
      if (unit.description.includes('Learning Journey:')) {
        problems.push('❌ Description has Learning Journey section (too operational)');
      }
      if (unit.description.includes('•') && unit.description.split('•').length > 6) {
        problems.push('❌ Description has too many operational bullet points');
      }
      if (unit.description.includes('Introduction to math materials and exploration')) {
        problems.push('❌ Description too specific about activities');
      }
      if (unit.description.length > 800) {
        problems.push('❌ Description too long (over 800 chars) - should be overview');
      }
    } else {
      problems.push('❌ No description');
    }
    
    // Check assessment plan quality
    if (unit.assessmentPlan) {
      if (unit.assessmentPlan.includes('Formative:') && unit.assessmentPlan.includes('Summative:')) {
        if (unit.assessmentPlan.includes('•') && unit.assessmentPlan.split('•').length > 8) {
          problems.push('❌ Assessment plan too detailed (over 8 bullet points)');
        }
      }
      if (unit.assessmentPlan.includes('Counting interview (1-10)')) {
        problems.push('❌ Assessment plan too specific (interview details)');
      }
      if (unit.assessmentPlan.includes('Photo evidence')) {
        problems.push('❌ Assessment plan prescribes specific methods');
      }
      if (unit.assessmentPlan.length > 600) {
        problems.push('❌ Assessment plan too long (over 600 chars)');
      }
    } else {
      problems.push('❌ No assessment plan');
    }
    
    // Check expectations
    if (unit.expectations.length === 0) {
      problems.push('❌ No expectations linked');
    } else if (unit.expectations.length > 3) {
      problems.push('❌ Too many expectations (over 3) - hard to focus');
    } else {
      good.push(`✓ Has ${unit.expectations.length} expectation(s)`);
    }
    
    // Check hours
    if (unit.estimatedHours && unit.estimatedHours > 0) {
      good.push(`✓ ${unit.estimatedHours} hours allocated`);
    } else {
      problems.push('❌ No hours specified');
    }
    
    // Check if it's actually tactical level
    let tacticalScore = 0;
    let maxTacticalScore = 5;
    
    // Does it bridge strategic to operational?
    if (unit.bigIdeas && !unit.bigIdeas.includes('8:30') && !unit.bigIdeas.includes('minutes')) {
      tacticalScore++;
    }
    if (unit.description && !unit.description.includes('Daily:') && !unit.description.includes('time:')) {
      tacticalScore++;
    }
    if (unit.assessmentPlan && !unit.assessmentPlan.includes('2 minutes') && !unit.assessmentPlan.includes('every day')) {
      tacticalScore++;
    }
    if (unit.title && unit.title.length < 50 && !unit.title.includes('Week')) {
      tacticalScore++;
    }
    if (unit.estimatedHours && unit.estimatedHours >= 10) { // Substantial unit, not daily
      tacticalScore++;
    }
    
    const tacticalPercentage = (tacticalScore / maxTacticalScore) * 100;
    
    if (tacticalPercentage < 80) {
      problems.push(`❌ Not tactical enough (${tacticalPercentage.toFixed(0)}% tactical)`);
    } else {
      good.push(`✓ Proper tactical level (${tacticalPercentage.toFixed(0)}%)`);
    }
    
    console.log('\nGOOD:');
    good.forEach(g => console.log(`  ${g}`));
    
    console.log('\nPROBLEMS:');
    if (problems.length === 0) {
      console.log('  ✨ NO PROBLEMS FOUND - ACTUALLY PERFECT!');
    } else {
      problems.forEach(p => console.log(`  ${p}`));
    }
    
    const score = good.length / (good.length + problems.length) * 100;
    console.log(`\nSCORE: ${score.toFixed(0)}%`);
    
    if (score >= 90) {
      console.log('VERDICT: ✨ TRULY PERFECT');
    } else if (score >= 70) {
      console.log('VERDICT: ⚠️ GOOD BUT NEEDS IMPROVEMENT');
    } else {
      console.log('VERDICT: ❌ NOT PERFECT YET');
    }
    
    totalProblems += problems.length;
    totalGood += good.length;
    
    console.log('\n');
  }
  
  console.log('📊 OVERALL ASSESSMENT:\n');
  console.log(`Total Good Things: ${totalGood}`);
  console.log(`Total Problems: ${totalProblems}`);
  
  const overallScore = (totalGood / (totalGood + totalProblems)) * 100;
  console.log(`Overall Score: ${overallScore.toFixed(0)}%\n`);
  
  console.log('💭 THE BRUTAL TRUTH:\n');
  
  if (overallScore >= 95) {
    console.log('✨ These units are ACTUALLY PERFECT!');
    console.log('They are true tactical documents.');
    console.log('No significant problems found.');
  } else if (overallScore >= 80) {
    console.log('⚠️ These units are GOOD but not perfect.');
    console.log('They have some issues that need fixing.');
    console.log('Close to tactical level but need refinement.');
  } else if (overallScore >= 60) {
    console.log('❌ These units are NOT PERFECT.');
    console.log('They have significant problems.');
    console.log('Still too operational or missing key elements.');
  } else {
    console.log('💀 These units are SERIOUSLY FLAWED.');
    console.log('Major problems throughout.');
    console.log('Need complete rework.');
  }
  
  console.log('\n🎯 WHAT TRUE TACTICAL PERFECTION LOOKS LIKE:\n');
  console.log('Big Ideas:');
  console.log('  • 2-3 conceptual understandings (not operational details)');
  console.log('  • Under 300 characters');
  console.log('  • No bullet points about activities');
  console.log('');
  console.log('Description:');
  console.log('  • Overview of mathematical focus');
  console.log('  • Under 400 characters');
  console.log('  • No specific activities or materials');
  console.log('');
  console.log('Assessment Plan:');
  console.log('  • General approaches, not specific tools');
  console.log('  • Under 300 characters');
  console.log('  • No procedural details');
  
  await prisma.$disconnect();
}

brutalCriticalAssessment().catch(console.error);