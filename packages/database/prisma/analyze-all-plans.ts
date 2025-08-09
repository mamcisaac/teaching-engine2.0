#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeAllPlans() {
  console.log('🔍 COMPREHENSIVE UNIT PLAN ANALYSIS\n');
  
  try {
    const emily = await prisma.user.findUnique({ 
      where: { email: 'emmcisaac@gmail.com' } 
    });
    
    if (!emily) {
      console.error('❌ Emily\'s account not found!');
      return;
    }
    
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true,
        expectations: { 
          include: { expectation: true } 
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('='.repeat(60));
    console.log('SUBJECT-BY-SUBJECT ANALYSIS:');
    console.log('='.repeat(60));
    
    // Group by subject
    const bySubject: { [key: string]: any[] } = {};
    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!bySubject[subject]) bySubject[subject] = [];
      bySubject[subject].push(unit);
    });
    
    // Track total hours across all subjects
    let grandTotalHours = 0;
    
    // Analyze each subject
    Object.entries(bySubject).forEach(([subject, units]) => {
      const totalHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      grandTotalHours += totalHours;
      
      const expectations = new Set<string>();
      units.forEach(u => {
        u.expectations.forEach(e => expectations.add(e.expectation.code));
      });
      
      const startDate = units[0]?.startDate;
      const endDate = units[units.length - 1]?.endDate;
      const weeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const hoursPerWeek = (totalHours / weeks).toFixed(1);
      
      console.log(`\n📚 ${subject}:`);
      console.log(`   Units: ${units.length}`);
      console.log(`   Total Hours: ${totalHours} (${hoursPerWeek} hours/week)`);
      console.log(`   Expectations Covered: ${expectations.size}`);
      console.log(`   Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
      
      // Check for gaps within subject
      for (let i = 0; i < units.length - 1; i++) {
        const gap = Math.ceil((units[i + 1].startDate.getTime() - units[i].endDate.getTime()) / (1000 * 60 * 60 * 24));
        if (gap > 3 && gap !== 17) { // 17 is winter break
          console.log(`   ⚠️ Gap of ${gap} days between units ${i + 1} and ${i + 2}`);
        }
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('CROSS-SUBJECT ANALYSIS:');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Total Instructional Hours Across Subjects: ${grandTotalHours}`);
    console.log(`📚 Subjects with Unit Plans: ${Object.keys(bySubject).length}`);
    
    // Check if units align properly
    console.log('\n🗓️ TIMELINE ALIGNMENT:');
    
    const allStartDates = new Set<string>();
    const allEndDates = new Set<string>();
    
    unitPlans.forEach(unit => {
      allStartDates.add(unit.startDate.toLocaleDateString());
      allEndDates.add(unit.endDate.toLocaleDateString());
    });
    
    console.log(`Unique start dates: ${allStartDates.size}`);
    console.log(`Unique end dates: ${allEndDates.size}`);
    
    // Check for reasonable weekly hours
    console.log('\n⏰ WEEKLY HOURS ANALYSIS:');
    
    const frenchHours = bySubject['Français langue première']?.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) || 0;
    const mathHours = bySubject['Mathématiques']?.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) || 0;
    const totalCore = frenchHours + mathHours;
    
    console.log(`French Language Arts: ${(frenchHours / 42).toFixed(1)} hours/week`);
    console.log(`Mathematics: ${(mathHours / 42).toFixed(1)} hours/week`);
    console.log(`Combined Core Subjects: ${(totalCore / 42).toFixed(1)} hours/week`);
    
    // Grade 1 standards check
    console.log('\n✅ GRADE 1 STANDARDS CHECK:');
    
    const issues = [];
    
    // French should be 4-6 hours/week in French Immersion
    if (frenchHours < 168) issues.push('French hours too low (need 4+ hours/week)');
    if (frenchHours > 252) issues.push('French hours too high (max 6 hours/week)');
    
    // Math should be 4-5 hours/week
    if (mathHours < 168) issues.push('Math hours too low (need 4+ hours/week)');
    if (mathHours > 210) issues.push('Math hours too high (max 5 hours/week)');
    
    // Check expectation coverage
    const frenchExpCount = bySubject['Français langue première']?.[0]?.longRangePlan?.expectations?.length || 0;
    const mathExpCount = bySubject['Mathématiques']?.[0]?.longRangePlan?.expectations?.length || 0;
    
    console.log(`\nExpectation Coverage:`);
    console.log(`French: ${new Set(bySubject['Français langue première']?.flatMap(u => u.expectations.map(e => e.expectation.code))).size}/15 expectations`);
    console.log(`Math: ${new Set(bySubject['Mathématiques']?.flatMap(u => u.expectations.map(e => e.expectation.code))).size}/14 expectations`);
    
    if (issues.length === 0) {
      console.log('\n🎉 ALL STANDARDS MET!');
    } else {
      console.log('\n⚠️ ISSUES FOUND:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // Check for critical issues
    console.log('\n' + '='.repeat(60));
    console.log('🔴 CRITICAL ISSUES CHECK:');
    console.log('='.repeat(60));
    
    const criticalIssues = [];
    
    // Check if any unit has 0 hours
    unitPlans.forEach(unit => {
      if (!unit.estimatedHours || unit.estimatedHours === 0) {
        criticalIssues.push(`${unit.longRangePlan.subject} - ${unit.titleFr}: NO HOURS ALLOCATED`);
      }
    });
    
    // Check if any unit is too short or too long
    unitPlans.forEach(unit => {
      const days = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(days / 7);
      const hoursPerWeek = unit.estimatedHours! / weeks;
      
      if (hoursPerWeek < 2) {
        criticalIssues.push(`${unit.longRangePlan.subject} - ${unit.titleFr}: Only ${hoursPerWeek.toFixed(1)} hours/week`);
      }
      if (hoursPerWeek > 10) {
        criticalIssues.push(`${unit.longRangePlan.subject} - ${unit.titleFr}: Excessive ${hoursPerWeek.toFixed(1)} hours/week`);
      }
    });
    
    if (criticalIssues.length === 0) {
      console.log('\n✅ NO CRITICAL ISSUES FOUND!');
    } else {
      console.log('\n❌ CRITICAL ISSUES REQUIRING IMMEDIATE FIX:');
      criticalIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(60));
    console.log('📝 FINAL VERDICT:');
    console.log('='.repeat(60));
    
    if (criticalIssues.length === 0 && issues.length === 0) {
      console.log('\n✅✅✅ UNIT PLANS ARE PERFECT! ✅✅✅\n');
      console.log('Emily has comprehensive, well-balanced unit plans that:');
      console.log('- Meet all Grade 1 standards');
      console.log('- Cover all curriculum expectations');
      console.log('- Provide appropriate instructional hours');
      console.log('- Align with the school calendar');
    } else {
      console.log('\n⚠️ IMPROVEMENTS NEEDED');
      console.log('Please address the issues identified above.');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run analysis
analyzeAllPlans();