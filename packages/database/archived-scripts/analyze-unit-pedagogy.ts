#!/usr/bin/env tsx

/**
 * ANALYZE PEDAGOGICAL QUALITY OF UNITS
 * Checks if units build on each other, meet expectations, and have proper progression
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeUnitPedagogy() {
  console.log('🎓 ANALYZING PEDAGOGICAL QUALITY OF UNITS\n');
  console.log('='.repeat(70));
  
  const issues: string[] = [];
  const strengths: string[] = [];
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // Get all units with their relationships
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    // Get all long range plans
    const lrps = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });
    
    // Group units by subject
    const unitsBySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!unitsBySubject[s]) unitsBySubject[s] = [];
      unitsBySubject[s].push(u);
    });
    
    console.log('📚 CHECKING EACH SUBJECT\'S PROGRESSION:\n');
    
    // Analyze each subject
    for (const [subject, subjectUnits] of Object.entries(unitsBySubject)) {
      console.log(`\n${subject} (${subjectUnits.length} units):`);
      console.log('-'.repeat(50));
      
      const lrp = lrps.find(l => l.subject === subject);
      
      // CHECK 1: Do units have clear progression?
      console.log('\n1. PROGRESSION CHECK:');
      
      // Check for developmental sequence in unit titles/descriptions
      const hasProgression = checkProgression(subjectUnits);
      if (hasProgression) {
        strengths.push(`✅ ${subject} shows clear progression`);
        console.log('  ✅ Clear developmental sequence detected');
      } else {
        issues.push(`❌ ${subject} lacks clear progression`);
        console.log('  ❌ No clear progression found');
      }
      
      // CHECK 2: Do units meet LRP expectations?
      console.log('\n2. EXPECTATIONS COVERAGE:');
      
      const lrpExpectations = lrp?.expectations.map(e => e.expectation.code) || [];
      const unitExpectations = new Set<string>();
      subjectUnits.forEach(u => {
        u.expectations.forEach((e: any) => {
          unitExpectations.add(e.expectation.code);
        });
      });
      
      console.log(`  LRP has ${lrpExpectations.length} expectations`);
      console.log(`  Units cover ${unitExpectations.size} expectations`);
      
      if (unitExpectations.size === 0 && lrpExpectations.length > 0) {
        issues.push(`❌ ${subject} units have NO expectations linked`);
        console.log('  ❌ No expectations linked to units!');
      } else if (unitExpectations.size < lrpExpectations.length) {
        issues.push(`⚠️ ${subject} only covers ${unitExpectations.size}/${lrpExpectations.length} expectations`);
        console.log('  ⚠️ Incomplete coverage');
      } else {
        console.log('  ✅ Good coverage');
      }
      
      // CHECK 3: Timing appropriateness
      console.log('\n3. TIMING CHECK:');
      
      subjectUnits.forEach(unit => {
        const weeks = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const complexity = assessComplexity(unit.title, unit.description);
        
        if (complexity === 'foundational' && weeks > 4) {
          console.log(`  ⚠️ "${unit.title}" (foundational) spans ${weeks} weeks - may be too long`);
        } else if (complexity === 'complex' && weeks < 3) {
          console.log(`  ⚠️ "${unit.title}" (complex) only ${weeks} weeks - may be too short`);
        } else {
          console.log(`  ✅ "${unit.title}" - ${weeks} weeks (appropriate)`);
        }
      });
      
      // CHECK 4: Cross-curricular connections
      console.log('\n4. CROSS-CURRICULAR CONNECTIONS:');
      
      let connectionsFound = 0;
      subjectUnits.forEach(unit => {
        if (unit.crossCurricularConnections && unit.crossCurricularConnections.length > 10) {
          connectionsFound++;
        }
      });
      
      if (connectionsFound === 0) {
        issues.push(`❌ ${subject} has no cross-curricular connections noted`);
        console.log('  ❌ No connections documented');
      } else if (connectionsFound < subjectUnits.length / 2) {
        console.log(`  ⚠️ Only ${connectionsFound}/${subjectUnits.length} units have connections`);
      } else {
        strengths.push(`✅ ${subject} has good cross-curricular integration`);
        console.log(`  ✅ ${connectionsFound}/${subjectUnits.length} units have connections`);
      }
      
      // CHECK 5: Building on prior knowledge
      console.log('\n5. SCAFFOLDING CHECK:');
      
      for (let i = 1; i < subjectUnits.length; i++) {
        const prev = subjectUnits[i - 1];
        const curr = subjectUnits[i];
        
        const builds = checkIfBuildsOn(prev, curr);
        if (builds) {
          console.log(`  ✅ "${curr.title}" builds on "${prev.title}"`);
        } else {
          console.log(`  ⚠️ "${curr.title}" may not connect to "${prev.title}"`);
        }
      }
    }
    
    // SPECIAL CHECKS
    console.log('\n\n🔍 SPECIAL PEDAGOGICAL CHECKS:\n');
    
    // Check French-Math integration (important for immersion)
    const frenchUnits = unitsBySubject['Français langue première'] || [];
    const mathUnits = unitsBySubject['Mathématiques'] || [];
    
    console.log('French-Math Integration:');
    let integrationFound = false;
    frenchUnits.forEach((fu: any) => {
      mathUnits.forEach((mu: any) => {
        if (Math.abs(fu.startDate.getTime() - mu.startDate.getTime()) < 7 * 24 * 60 * 60 * 1000) {
          // Units start within a week of each other
          if (hasThematicConnection(fu.title, mu.title)) {
            console.log(`  ✅ "${fu.title}" + "${mu.title}" - potential integration`);
            integrationFound = true;
          }
        }
      });
    });
    
    if (!integrationFound) {
      issues.push('❌ No clear French-Math thematic integration found');
      console.log('  ❌ No integration opportunities identified');
    }
    
    // Check seasonal alignment
    console.log('\nSeasonal Alignment:');
    
    const seasonalUnits = units.filter(u => 
      u.title.toLowerCase().includes('fall') ||
      u.title.toLowerCase().includes('winter') ||
      u.title.toLowerCase().includes('spring') ||
      u.title.toLowerCase().includes('summer')
    );
    
    seasonalUnits.forEach(unit => {
      const month = unit.startDate.getMonth();
      const title = unit.title.toLowerCase();
      
      if (title.includes('fall') && (month < 8 || month > 10)) {
        issues.push(`❌ "${unit.title}" not aligned with fall season`);
        console.log(`  ❌ "${unit.title}" starts in month ${month + 1}`);
      } else if (title.includes('winter') && (month < 11 && month > 1)) {
        issues.push(`❌ "${unit.title}" not aligned with winter season`);
        console.log(`  ❌ "${unit.title}" starts in month ${month + 1}`);
      } else if (title.includes('spring') && (month < 2 || month > 4)) {
        issues.push(`❌ "${unit.title}" not aligned with spring season`);
        console.log(`  ❌ "${unit.title}" starts in month ${month + 1}`);
      } else {
        console.log(`  ✅ "${unit.title}" properly aligned`);
      }
    });
    
    // Check for assessment variety
    console.log('\nAssessment Strategies:');
    
    let assessmentVariety = 0;
    units.forEach(u => {
      if (u.assessmentPlan && u.assessmentPlan.length > 20) {
        assessmentVariety++;
      }
    });
    
    console.log(`  ${assessmentVariety}/${units.length} units have detailed assessment plans`);
    
    if (assessmentVariety < units.length / 2) {
      issues.push('❌ Many units lack detailed assessment plans');
    }
    
    // FINAL REPORT
    console.log('\n' + '='.repeat(70));
    console.log('📊 PEDAGOGICAL ANALYSIS RESULTS\n');
    
    if (strengths.length > 0) {
      console.log('💪 STRENGTHS:');
      strengths.forEach(s => console.log(`  ${s}`));
    }
    
    if (issues.length > 0) {
      console.log('\n🔴 ISSUES TO ADDRESS:');
      issues.forEach(i => console.log(`  ${i}`));
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('  1. Add explicit learning progressions to each unit');
    console.log('  2. Link all curriculum expectations to units');
    console.log('  3. Document cross-curricular connections');
    console.log('  4. Ensure thematic alignment across subjects');
    console.log('  5. Add detailed assessment strategies');
    console.log('  6. Include differentiation for diverse learners');
    console.log('  7. Note resource sharing opportunities');
    
    const score = Math.max(0, 100 - (issues.length * 5));
    console.log(`\n📈 PEDAGOGICAL QUALITY SCORE: ${score}/100`);
    
    if (score >= 90) {
      console.log('✨ Excellent pedagogical structure!');
    } else if (score >= 70) {
      console.log('👍 Good foundation, needs some improvements');
    } else {
      console.log('⚠️ Significant pedagogical improvements needed');
    }
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function checkProgression(units: any[]): boolean {
  // Look for developmental keywords
  const progressionKeywords = [
    ['introduction', 'introducing', 'discovering', 'exploring'],
    ['developing', 'building', 'expanding', 'growing'],
    ['applying', 'creating', 'mastering', 'celebrating']
  ];
  
  let foundEarly = false;
  let foundMid = false;
  let foundLate = false;
  
  units.forEach((unit, index) => {
    const position = index / units.length;
    const text = (unit.title + ' ' + unit.description).toLowerCase();
    
    if (position < 0.33) {
      foundEarly = foundEarly || progressionKeywords[0].some(k => text.includes(k));
    } else if (position < 0.66) {
      foundMid = foundMid || progressionKeywords[1].some(k => text.includes(k));
    } else {
      foundLate = foundLate || progressionKeywords[2].some(k => text.includes(k));
    }
  });
  
  return foundEarly || foundMid || foundLate;
}

function assessComplexity(title: string, description: string | null): string {
  const text = (title + ' ' + (description || '')).toLowerCase();
  
  if (text.includes('introduction') || text.includes('basic') || text.includes('simple')) {
    return 'foundational';
  } else if (text.includes('advanced') || text.includes('complex') || text.includes('synthesis')) {
    return 'complex';
  }
  
  return 'standard';
}

function checkIfBuildsOn(prev: any, curr: any): boolean {
  // Simple check for conceptual building
  const prevConcepts = extractConcepts(prev.title + ' ' + prev.description);
  const currConcepts = extractConcepts(curr.title + ' ' + curr.description);
  
  // Check if current unit references previous concepts
  return prevConcepts.some(pc => currConcepts.includes(pc));
}

function extractConcepts(text: string): string[] {
  const concepts = text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4)
    .filter(word => !['their', 'these', 'those', 'where', 'which'].includes(word));
  
  return [...new Set(concepts)];
}

function hasThematicConnection(title1: string, title2: string): boolean {
  const themes = ['family', 'community', 'season', 'celebration', 'nature', 'friends'];
  
  const t1 = title1.toLowerCase();
  const t2 = title2.toLowerCase();
  
  return themes.some(theme => t1.includes(theme) && t2.includes(theme));
}

// Run analysis
analyzeUnitPedagogy().catch(console.error);