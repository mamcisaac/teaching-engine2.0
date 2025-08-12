#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function assessLRPState() {
  console.log('🔴 CRITICAL ASSESSMENT OF LONG RANGE PLANS\n');
  console.log('=====================================\n');
  
  const lrps = await prisma.longRangePlan.findMany({
    where: { academicYear: '2025-2026', grade: 1 },
    include: {
      expectations: true,
      unitPlans: {
        include: {
          expectations: true
        }
      }
    },
    orderBy: { subject: 'asc' }
  });
  
  let totalScore = 0;
  let perfectCount = 0;
  const criticalIssues: string[] = [];
  
  console.log('SUBJECT-BY-SUBJECT REALITY CHECK:\n');
  
  for (const lrp of lrps) {
    const hasExpectations = lrp.expectations.length > 0;
    const hasGoals = lrp.goals && lrp.goals.length > 100;
    const hasThemes = lrp.themes && Array.isArray(lrp.themes);
    const hasAssessment = lrp.assessmentOverview && lrp.assessmentOverview.length > 100;
    const hasResources = lrp.resourceNeeds && lrp.resourceNeeds.length > 100;
    const hasQuestions = lrp.overarchingQuestions && lrp.overarchingQuestions.length > 50;
    const unitsWithExpectations = lrp.unitPlans.filter(u => u.expectations.length > 0).length;
    const allUnitsLinked = unitsWithExpectations === lrp.unitPlans.length;
    
    const score = (
      (hasExpectations ? 25 : 0) +
      (hasGoals ? 15 : 0) +
      (hasThemes ? 10 : 0) +
      (hasAssessment ? 15 : 0) +
      (hasResources ? 10 : 0) +
      (hasQuestions ? 10 : 0) +
      (allUnitsLinked ? 15 : unitsWithExpectations > 0 ? 7 : 0)
    );
    
    totalScore += score;
    if (score >= 90) perfectCount++;
    
    const status = score >= 90 ? '✅ PERFECT' : score >= 70 ? '⚠️ GOOD' : '❌ FLAWED';
    
    console.log(`${lrp.subject}:`);
    console.log(`  Score: ${score}/100 ${status}`);
    console.log(`  Expectations linked to LRP: ${hasExpectations ? '✓' : '✗'} (${lrp.expectations.length} linked)`);
    console.log(`  Unit expectations: ${unitsWithExpectations}/${lrp.unitPlans.length} units have expectations`);
    console.log(`  Comprehensive goals: ${hasGoals ? '✓' : '✗'}`);
    console.log(`  Themes defined: ${hasThemes ? '✓' : '✗'}`);
    console.log(`  Assessment overview: ${hasAssessment ? '✓' : '✗'}`);
    console.log(`  Resources specified: ${hasResources ? '✓' : '✗'}`);
    console.log(`  Overarching questions: ${hasQuestions ? '✓' : '✗'}`);
    
    if (!hasExpectations) {
      criticalIssues.push(`${lrp.subject}: NO CURRICULUM EXPECTATIONS LINKED!`);
    } else if (!allUnitsLinked) {
      criticalIssues.push(`${lrp.subject}: Only ${unitsWithExpectations}/${lrp.unitPlans.length} units have expectations`);
    }
    if (!hasGoals) {
      criticalIssues.push(`${lrp.subject}: Missing comprehensive goals`);
    }
    
    console.log('');
  }
  
  const avgScore = Math.round(totalScore / lrps.length);
  
  console.log('\n🎯 OVERALL ASSESSMENT:\n');
  console.log(`Total LRPs: ${lrps.length}`);
  console.log(`Perfect LRPs (90+): ${perfectCount}/${lrps.length}`);
  console.log(`Average Score: ${avgScore}/100`);
  console.log(`\nSTATUS: ${avgScore >= 90 ? 'PERFECT!' : avgScore >= 70 ? 'GOOD BUT NOT PERFECT' : 'CRITICALLY FLAWED'}`);
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE FIX:\n');
    criticalIssues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  // Check curriculum expectations availability
  console.log('\n📚 CURRICULUM EXPECTATIONS AVAILABILITY:\n');
  const subjects = [...new Set(lrps.map(l => l.subject))];
  for (const subject of subjects) {
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { subject, grade: 1 }
    });
    const lrp = lrps.find(l => l.subject === subject);
    const linked = lrp?.expectations.length || 0;
    console.log(`${subject}: ${expectations.length} available, ${linked} linked to LRP`);
    if (expectations.length > 0 && linked === 0) {
      console.log(`  ⚠️ EXPECTATIONS EXIST BUT NOT LINKED!`);
    }
  }
  
  // Final verdict
  console.log('\n\n💀 BRUTAL TRUTH:\n');
  if (avgScore < 90) {
    console.log(`The LRPs are ${avgScore}% complete. NOT PERFECT.`);
    console.log(`${9 - perfectCount} subjects need immediate perfection work.`);
    console.log(`Estimated time to perfection: ${(9 - perfectCount) * 2} hours`);
  } else {
    console.log('ALL LRPS ARE PERFECT! 🎉');
  }
  
  await prisma.$disconnect();
}

assessLRPState().catch(console.error);