#!/usr/bin/env tsx

/**
 * ASSESS LONG RANGE AND UNIT PLAN QUALITY
 * Focused assessment of just the planning documents themselves
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assessLRPUnitQuality() {
  console.log('🎯 ASSESSING LONG RANGE & UNIT PLAN QUALITY\n');
  console.log('='.repeat(70));
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // Get all LRPs with their units and expectations
    const lrps = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      include: {
        unitPlans: {
          orderBy: { startDate: 'asc' },
          include: {
            expectations: {
              include: { expectation: true }
            }
          }
        },
        expectations: {
          include: { expectation: true }
        }
      }
    });
    
    console.log('📚 LONG RANGE PLAN QUALITY\n');
    
    // Assess each LRP
    lrps.forEach(lrp => {
      console.log(`\n${lrp.subject}:`);
      console.log('-'.repeat(40));
      
      // Check LRP completeness
      const hasGoals = lrp.goals && lrp.goals.length > 20;
      const hasThemes = lrp.themes && Array.isArray(lrp.themes) && lrp.themes.length > 0;
      const hasAssessment = lrp.assessmentOverview && lrp.assessmentOverview.length > 20;
      const hasResources = lrp.resourceNeeds && lrp.resourceNeeds.length > 20;
      
      console.log(`  ✓ Goals: ${hasGoals ? 'Yes' : 'No'}`);
      console.log(`  ✓ Themes: ${hasThemes ? 'Yes' : 'No'}`);
      console.log(`  ✓ Assessment: ${hasAssessment ? 'Yes' : 'No'}`);
      console.log(`  ✓ Resources: ${hasResources ? 'Yes' : 'No'}`);
      console.log(`  ✓ Units: ${lrp.unitPlans.length}`);
      console.log(`  ✓ Expectations: ${lrp.expectations.length}`);
      
      if (hasGoals && hasThemes && hasAssessment) {
        strengths.push(`✅ ${lrp.subject} LRP is complete`);
      } else {
        weaknesses.push(`❌ ${lrp.subject} LRP missing key components`);
      }
    });
    
    console.log('\n\n📋 UNIT PLAN ANALYSIS\n');
    
    // Analyze each subject's units
    for (const lrp of lrps) {
      console.log(`\n${lrp.subject} Units (${lrp.unitPlans.length}):`);
      console.log('='.repeat(50));
      
      // CHECK 1: Do units build on each other?
      console.log('\n1. PROGRESSION:');
      let hasProgression = true;
      
      for (let i = 1; i < lrp.unitPlans.length; i++) {
        const prev = lrp.unitPlans[i - 1];
        const curr = lrp.unitPlans[i];
        
        // Check conceptual building
        const prevConcepts = extractConcepts(prev.title + ' ' + (prev.description || ''));
        const currConcepts = extractConcepts(curr.title + ' ' + (curr.description || ''));
        const builds = prevConcepts.some(pc => currConcepts.includes(pc));
        
        if (builds) {
          console.log(`  ✅ "${curr.title}" builds on "${prev.title}"`);
        } else {
          console.log(`  ⚠️ "${curr.title}" may not connect to "${prev.title}"`);
          hasProgression = false;
        }
      }
      
      if (hasProgression) {
        strengths.push(`✅ ${lrp.subject} has clear progression`);
      } else {
        weaknesses.push(`⚠️ ${lrp.subject} progression could be stronger`);
      }
      
      // CHECK 2: Do units meet LRP expectations?
      console.log('\n2. EXPECTATIONS COVERAGE:');
      
      const lrpExpectationIds = new Set(lrp.expectations.map(e => e.expectationId));
      const unitExpectationIds = new Set<string>();
      
      lrp.unitPlans.forEach(unit => {
        unit.expectations.forEach(ue => {
          unitExpectationIds.add(ue.expectationId);
        });
      });
      
      const coverage = unitExpectationIds.size / (lrpExpectationIds.size || 1);
      console.log(`  LRP expectations: ${lrpExpectationIds.size}`);
      console.log(`  Covered in units: ${unitExpectationIds.size}`);
      console.log(`  Coverage: ${(coverage * 100).toFixed(0)}%`);
      
      if (coverage === 1) {
        strengths.push(`✅ ${lrp.subject} covers all expectations`);
      } else if (coverage > 0.8) {
        weaknesses.push(`⚠️ ${lrp.subject} covers ${(coverage * 100).toFixed(0)}% of expectations`);
      } else {
        weaknesses.push(`❌ ${lrp.subject} poor expectation coverage`);
      }
      
      // CHECK 3: Timing appropriateness
      console.log('\n3. TIMING:');
      
      const totalHours = lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      const avgHoursPerUnit = totalHours / lrp.unitPlans.length;
      
      console.log(`  Total hours: ${totalHours}`);
      console.log(`  Average per unit: ${avgHoursPerUnit.toFixed(1)} hours`);
      
      // Check individual unit timing
      let timingIssues = 0;
      lrp.unitPlans.forEach(unit => {
        const weeks = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const hours = unit.estimatedHours || 0;
        const hoursPerWeek = hours / weeks;
        
        // Expected hours per week based on subject
        let expectedHoursPerWeek = 0;
        if (lrp.subject === 'Français langue première') expectedHoursPerWeek = 5;
        else if (lrp.subject === 'Mathématiques') expectedHoursPerWeek = 5;
        else if (lrp.subject === 'Sciences de la nature') expectedHoursPerWeek = 2.5;
        else expectedHoursPerWeek = 1.5;
        
        if (Math.abs(hoursPerWeek - expectedHoursPerWeek) > 1) {
          console.log(`  ⚠️ "${unit.title}": ${hoursPerWeek.toFixed(1)} hrs/week (expected ~${expectedHoursPerWeek})`);
          timingIssues++;
        }
      });
      
      if (timingIssues === 0) {
        strengths.push(`✅ ${lrp.subject} timing is appropriate`);
      } else {
        weaknesses.push(`⚠️ ${lrp.subject} has ${timingIssues} units with timing issues`);
      }
      
      // CHECK 4: Cross-curricular connections
      console.log('\n4. CROSS-CURRICULAR:');
      
      let crossCurricularCount = 0;
      lrp.unitPlans.forEach(unit => {
        if (unit.crossCurricularConnections && unit.crossCurricularConnections.length > 30) {
          crossCurricularCount++;
        }
      });
      
      console.log(`  Units with connections: ${crossCurricularCount}/${lrp.unitPlans.length}`);
      
      if (crossCurricularCount === lrp.unitPlans.length) {
        strengths.push(`✅ ${lrp.subject} has rich cross-curricular connections`);
      } else if (crossCurricularCount > lrp.unitPlans.length / 2) {
        weaknesses.push(`⚠️ ${lrp.subject} needs more cross-curricular connections`);
      } else {
        weaknesses.push(`❌ ${lrp.subject} lacks cross-curricular integration`);
      }
    }
    
    // OVERALL ASSESSMENT
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 OVERALL QUALITY ASSESSMENT\n');
    
    // Calculate scores
    const totalChecks = lrps.length * 6; // 6 quality checks per subject
    const passedChecks = strengths.length;
    const qualityScore = Math.round((passedChecks / totalChecks) * 100);
    
    console.log('💪 STRENGTHS:');
    strengths.forEach(s => console.log(`  ${s}`));
    
    if (weaknesses.length > 0) {
      console.log('\n⚠️ AREAS FOR IMPROVEMENT:');
      weaknesses.forEach(w => console.log(`  ${w}`));
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 FINAL ASSESSMENT\n');
    
    console.log(`Quality Score: ${qualityScore}/100\n`);
    
    // Specific answers to the questions
    console.log('YOUR SPECIFIC QUESTIONS ANSWERED:\n');
    
    console.log('1. Are the LRPs and unit plans perfect?');
    if (qualityScore >= 90) {
      console.log('   ✅ YES - Excellent quality overall');
    } else if (qualityScore >= 70) {
      console.log('   ⚠️ MOSTLY - Good with some improvements needed');
    } else {
      console.log('   ❌ NO - Significant improvements needed');
    }
    
    console.log('\n2. Do units build on each other?');
    const progressionCount = strengths.filter(s => s.includes('progression')).length;
    if (progressionCount >= 7) {
      console.log('   ✅ YES - Clear progression in most subjects');
    } else if (progressionCount >= 4) {
      console.log('   ⚠️ PARTIALLY - Some subjects have clear progression');
    } else {
      console.log('   ❌ NO - Progression needs work');
    }
    
    console.log('\n3. Do they meet LRP expectations?');
    const coverageCount = strengths.filter(s => s.includes('expectations')).length;
    if (coverageCount >= 7) {
      console.log('   ✅ YES - All expectations covered');
    } else if (coverageCount >= 4) {
      console.log('   ⚠️ MOSTLY - Most expectations covered');
    } else {
      console.log('   ❌ NO - Expectation coverage incomplete');
    }
    
    console.log('\n4. Are timings appropriate?');
    const timingCount = strengths.filter(s => s.includes('timing')).length;
    if (timingCount >= 7) {
      console.log('   ✅ YES - Timing well-calibrated');
    } else if (timingCount >= 4) {
      console.log('   ⚠️ MOSTLY - Some timing adjustments needed');
    } else {
      console.log('   ❌ NO - Timing needs recalibration');
    }
    
    console.log('\n5. Are cross-curricular opportunities noted?');
    const crossCount = strengths.filter(s => s.includes('cross-curricular')).length;
    if (crossCount >= 7) {
      console.log('   ✅ YES - Rich integration throughout');
    } else if (crossCount >= 4) {
      console.log('   ⚠️ PARTIALLY - Some integration present');
    } else {
      console.log('   ❌ NO - More integration needed');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✨ SUMMARY\n');
    
    if (qualityScore >= 85) {
      console.log('The long range and unit plans are HIGH QUALITY.');
      console.log('They provide an excellent framework for curriculum delivery.');
    } else if (qualityScore >= 70) {
      console.log('The long range and unit plans are GOOD QUALITY.');
      console.log('With some refinements, they will be excellent.');
    } else {
      console.log('The long range and unit plans need SIGNIFICANT IMPROVEMENT.');
      console.log('Focus on progression, expectations, and integration.');
    }
    
  } catch (error) {
    console.error('❌ Assessment error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function extractConcepts(text: string): string[] {
  return text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4)
    .filter(word => !['their', 'these', 'those', 'where', 'which', 'through', 'about'].includes(word));
}

// Run assessment
assessLRPUnitQuality().catch(console.error);