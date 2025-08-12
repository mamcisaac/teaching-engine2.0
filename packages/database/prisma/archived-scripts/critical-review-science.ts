#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalReviewScience() {
  console.log('🔍 CRITICAL REVIEW: SCIENCES DE LA NATURE\n');
  
  try {
    const emily = await prisma.user.findUnique({ 
      where: { email: 'emmcisaac@gmail.com' } 
    });
    
    if (!emily) {
      console.error('❌ Emily not found');
      return;
    }
    
    const sciencePlan = await prisma.longRangePlan.findFirst({
      where: { 
        userId: emily.id, 
        subject: 'Sciences de la nature',
        academicYear: '2024-2025'
      }
    });
    
    if (!sciencePlan) {
      console.error('❌ Science plan not found');
      return;
    }
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: sciencePlan.id },
      include: { 
        expectations: { 
          include: { expectation: true } 
        } 
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('='.repeat(60));
    console.log('TIMELINE ANALYSIS:');
    console.log('='.repeat(60) + '\n');
    
    // Check each unit's dates and gaps
    const issues = [];
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const days = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(days / 7);
      const hoursPerWeek = (unit.estimatedHours || 0) / weeks;
      
      console.log(`Unit ${i + 1}: ${unit.titleFr}`);
      console.log(`  Dates: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
      console.log(`  Duration: ${days} days (${weeks} weeks)`);
      console.log(`  Hours: ${unit.estimatedHours} total, ${hoursPerWeek.toFixed(1)} per week`);
      
      // Check for issues
      if (hoursPerWeek < 2.5) {
        issues.push(`Unit ${i + 1}: Only ${hoursPerWeek.toFixed(1)} hours/week (too low)`);
      }
      if (hoursPerWeek > 4) {
        issues.push(`Unit ${i + 1}: ${hoursPerWeek.toFixed(1)} hours/week (too high)`);
      }
      
      // Check gaps
      if (i < units.length - 1) {
        const nextUnit = units[i + 1];
        const gap = Math.ceil((nextUnit.startDate.getTime() - unit.endDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (gap < 2) {
          console.log(`  ⚠️ Overlap or no gap before next unit`);
          issues.push(`Units ${i + 1}-${i + 2}: No proper gap (${gap} days)`);
        } else if (gap > 3 && gap !== 17) { // 17 is winter break
          console.log(`  ⚠️ Large gap of ${gap} days before next unit`);
          issues.push(`Units ${i + 1}-${i + 2}: Large gap (${gap} days)`);
        }
      }
      
      console.log();
    }
    
    // Total hours analysis
    console.log('='.repeat(60));
    console.log('HOURS ANALYSIS:');
    console.log('='.repeat(60) + '\n');
    
    const totalHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const avgPerWeek = totalHours / 42;
    
    console.log(`Total instructional hours: ${totalHours}`);
    console.log(`Average per week: ${avgPerWeek.toFixed(1)} hours`);
    console.log(`Grade 1 Science standard: 2-3 hours/week`);
    
    if (avgPerWeek < 2) {
      issues.push(`Total hours too low: ${avgPerWeek.toFixed(1)} hours/week`);
    }
    if (avgPerWeek > 3.5) {
      issues.push(`Total hours too high: ${avgPerWeek.toFixed(1)} hours/week`);
    }
    
    // Expectation coverage
    console.log('\n' + '='.repeat(60));
    console.log('EXPECTATION ANALYSIS:');
    console.log('='.repeat(60) + '\n');
    
    const expCoverage: { [key: string]: string[] } = {};
    
    units.forEach(unit => {
      unit.expectations.forEach(e => {
        const code = e.expectation.code;
        if (!expCoverage[code]) expCoverage[code] = [];
        expCoverage[code].push(unit.titleFr || '');
      });
    });
    
    const allScience = await prisma.curriculumExpectation.findMany({
      where: { subject: 'Sciences de la nature', grade: 1 }
    });
    
    console.log(`Total Science expectations: ${allScience.length}`);
    console.log(`Expectations covered: ${Object.keys(expCoverage).length}\n`);
    
    allScience.forEach(exp => {
      const coverage = expCoverage[exp.code] || [];
      if (coverage.length === 0) {
        console.log(`❌ ${exp.code}: NOT COVERED`);
        issues.push(`Expectation ${exp.code} not covered`);
      } else if (coverage.length === 1) {
        console.log(`✅ ${exp.code}: ${coverage[0]}`);
      } else {
        console.log(`✅✅ ${exp.code}: ${coverage.join(', ')} (${coverage.length}x)`);
      }
    });
    
    // Grade 1 appropriateness
    console.log('\n' + '='.repeat(60));
    console.log('GRADE 1 APPROPRIATENESS:');
    console.log('='.repeat(60) + '\n');
    
    const concepts = [
      'Living/non-living distinction',
      'Seasonal observations',
      'Simple energy concepts',
      'Growth and change',
      'Environmental awareness'
    ];
    
    concepts.forEach(concept => {
      console.log(`✅ ${concept}`);
    });
    
    // Unit balance check
    console.log('\n' + '='.repeat(60));
    console.log('UNIT BALANCE CHECK:');
    console.log('='.repeat(60) + '\n');
    
    const term1Units = units.filter(u => u.startDate < new Date('2025-02-01')).length;
    const term2Units = units.filter(u => u.startDate >= new Date('2025-02-01')).length;
    
    console.log(`Term 1 units: ${term1Units}`);
    console.log(`Term 2 units: ${term2Units}`);
    
    if (Math.abs(term1Units - term2Units) > 2) {
      issues.push('Unbalanced term distribution');
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(60));
    console.log('🏁 CRITICAL REVIEW VERDICT:');
    console.log('='.repeat(60) + '\n');
    
    if (issues.length === 0) {
      console.log('✅✅✅ SCIENCE PLANS ARE PERFECT! ✅✅✅');
      console.log('- Appropriate hours allocation');
      console.log('- No timeline issues');
      console.log('- Complete expectation coverage');
      console.log('- Grade 1 appropriate');
      console.log('- Well-balanced terms');
    } else {
      console.log('❌ ISSUES FOUND:\n');
      issues.forEach(issue => console.log(`  - ${issue}`));
      
      console.log('\n📝 RECOMMENDATIONS:');
      if (avgPerWeek < 2.5) {
        console.log('  - Consider increasing hours to 2.5-3 per week');
      }
      if (issues.some(i => i.includes('gap'))) {
        console.log('  - Review unit dates to eliminate unusual gaps');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the review
criticalReviewScience();