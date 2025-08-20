#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualFPSUnitReview() {
  try {
    console.log('🔍 MANUAL CRITICAL REVIEW: FPS UNIT PLANS');
    console.log('==========================================\n');
    
    // Get Emily's FPS units
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }
    
    const fpsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        OR: [
          { title: { contains: 'Personal and Social Development' } },
          { title: { contains: 'Formation personnelle et sociale' } },
          { subject: 'Formation personnelle et sociale' }
        ]
      }
    });
    
    if (!fpsLRP) {
      console.log('❌ FPS LRP not found');
      return;
    }
    
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: fpsLRP.id
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`📋 FOUND ${units.length} FPS UNITS FOR CRITICAL REVIEW\n`);
    
    // Critical analysis of each unit
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      console.log(`\n🔍 UNIT ${i + 1}: ${unit.title || unit.titleFr}`);
      console.log('=' .repeat(60));
      
      // Check basic structure
      console.log('\n📊 BASIC STRUCTURE ANALYSIS:');
      console.log(`Start Date: ${unit.startDate.toLocaleDateString()}`);
      console.log(`End Date: ${unit.endDate.toLocaleDateString()}`);
      console.log(`Estimated Hours: ${unit.estimatedHours || 'NOT SET'}`);
      
      // Calculate actual duration
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      console.log(`Duration: ${daysDiff} days`);
      
      // Timing analysis for every-other-day model
      const potentialLessons = Math.floor(daysDiff / 2);
      console.log(`Potential lessons (every-other-day): ${potentialLessons}`);
      
      if (potentialLessons < 12 || potentialLessons > 16) {
        console.log(`⚠️  TIMING ISSUE: ${potentialLessons} lessons not in ETFO 12-16 range`);
      } else {
        console.log(`✅ Timing appropriate: ${potentialLessons} lessons in ETFO range`);
      }
      
      // Content depth analysis
      console.log('\n📝 CONTENT DEPTH ANALYSIS:');
      const descLength = unit.description?.length || 0;
      console.log(`Description length: ${descLength} characters`);
      
      if (descLength < 500) {
        console.log(`⚠️  CONTENT SHALLOW: Description too brief (${descLength} chars)`);
      } else if (descLength > 2000) {
        console.log(`✅ Rich content: Comprehensive description (${descLength} chars)`);
      } else {
        console.log(`✅ Adequate content: Good description length (${descLength} chars)`);
      }
      
      // Check for key components
      console.log('\n🔧 COMPONENT ANALYSIS:');
      console.log(`Big Ideas: ${unit.bigIdeas ? '✅ Present' : '❌ Missing'}`);
      console.log(`Essential Questions: ${unit.essentialQuestions ? '✅ Present' : '❌ Missing'}`);
      console.log(`Assessment Plan: ${unit.assessmentPlan ? '✅ Present' : '❌ Missing'}`);
      console.log(`Differentiation: ${unit.differentiationStrategies ? '✅ Present' : '❌ Missing'}`);
      console.log(`Cross-curricular: ${unit.crossCurricularConnections ? '✅ Present' : '❌ Missing'}`);
      console.log(`Indigenous Perspectives: ${unit.indigenousPerspectives ? '✅ Present' : '❌ Missing'}`);
      
      // French integration check
      console.log('\n🇫🇷 FRENCH INTEGRATION ANALYSIS:');
      console.log(`French Title: ${unit.titleFr || 'MISSING'}`);
      console.log(`French Description: ${unit.descriptionFr ? '✅ Present' : '❌ Missing'}`);
      console.log(`Key Vocabulary: ${unit.keyVocabulary ? '✅ Present' : '❌ Missing'}`);
      
      // Safety and appropriateness
      console.log('\n🛡️ SAFETY & APPROPRIATENESS:');
      const hasEmotionalSafety = unit.differentiationStrategies && 
        JSON.stringify(unit.differentiationStrategies).includes('emotional');
      console.log(`Emotional Safety Protocols: ${hasEmotionalSafety ? '✅ Present' : '❌ Missing'}`);
      
      // Grade 1 appropriateness check
      const grade1Appropriate = unit.description?.includes('Grade 1') || 
        unit.description?.includes('6-7') ||
        unit.description?.includes('concrete') ||
        unit.description?.includes('hands-on');
      console.log(`Grade 1 Appropriateness: ${grade1Appropriate ? '✅ Present' : '❌ Missing'}`);
      
      // Show first 200 chars of description for quality check
      if (unit.description) {
        console.log('\n📖 CONTENT SAMPLE:');
        console.log(`"${unit.description.substring(0, 200)}..."`);
      }
    }
    
    // Overall timing analysis for 98-lesson target
    console.log('\n\n🎯 OVERALL TIMING ANALYSIS FOR 98-LESSON TARGET:');
    console.log('================================================');
    
    let totalPotentialLessons = 0;
    let timingIssues = 0;
    
    units.forEach((unit, index) => {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const potentialLessons = Math.floor(daysDiff / 2);
      totalPotentialLessons += potentialLessons;
      
      if (potentialLessons < 12 || potentialLessons > 16) {
        timingIssues++;
      }
      
      console.log(`Unit ${index + 1}: ${potentialLessons} lessons`);
    });
    
    console.log(`\nTotal potential lessons: ${totalPotentialLessons}`);
    console.log(`Target lessons: 98`);
    console.log(`Difference: ${totalPotentialLessons - 98}`);
    
    if (totalPotentialLessons === 98) {
      console.log('✅ PERFECT: Exactly 98 lessons as required');
    } else if (Math.abs(totalPotentialLessons - 98) <= 2) {
      console.log('✅ ACCEPTABLE: Within 2 lessons of target');
    } else {
      console.log('⚠️  TIMING ISSUE: Significant deviation from 98-lesson target');
    }
    
    console.log(`Units with timing issues: ${timingIssues}/${units.length}`);
    
    // Final assessment
    console.log('\n\n🏆 FINAL CRITICAL ASSESSMENT:');
    console.log('==============================');
    
    const criticalIssues = [];
    
    if (totalPotentialLessons !== 98) {
      criticalIssues.push(`Total lessons (${totalPotentialLessons}) ≠ target (98)`);
    }
    
    if (timingIssues > 0) {
      criticalIssues.push(`${timingIssues} units outside ETFO 12-16 lesson range`);
    }
    
    units.forEach((unit, index) => {
      if (!unit.titleFr) criticalIssues.push(`Unit ${index + 1}: Missing French title`);
      if (!unit.descriptionFr) criticalIssues.push(`Unit ${index + 1}: Missing French description`);
      if (!unit.assessmentPlan) criticalIssues.push(`Unit ${index + 1}: Missing assessment plan`);
      if (!unit.differentiationStrategies) criticalIssues.push(`Unit ${index + 1}: Missing differentiation`);
      if (!unit.crossCurricularConnections) criticalIssues.push(`Unit ${index + 1}: Missing cross-curricular connections`);
    });
    
    if (criticalIssues.length === 0) {
      console.log('🎉 PERFECTION CONFIRMED: No critical issues found');
      console.log('✅ Units are ready for implementation');
    } else {
      console.log(`⚠️  CRITICAL ISSUES FOUND: ${criticalIssues.length} issues`);
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in manual review:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

manualFPSUnitReview()
  .then(() => {
    console.log('\n✅ Manual review completed');
  })
  .catch((error) => {
    console.error('❌ Manual review failed:', error);
    process.exit(1);
  });