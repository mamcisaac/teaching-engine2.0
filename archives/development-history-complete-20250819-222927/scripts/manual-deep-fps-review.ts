#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualDeepFPSReview() {
  try {
    console.log('🔍 MANUAL DEEP REVIEW: FPS UNITS\n');
    console.log('=' .repeat(80));
    
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }
    
    // Get the FPS LRP to see what it promises
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
    
    console.log('📚 LONG RANGE PLAN DETAILS:');
    console.log('Title:', fpsLRP.title);
    console.log('Subject:', fpsLRP.subject);
    console.log('Grade:', fpsLRP.grade);
    console.log('Academic Year:', fpsLRP.academicYear);
    console.log('\nLRP Description:');
    console.log(fpsLRP.description?.substring(0, 500));
    console.log('\nLRP Goals:');
    console.log(fpsLRP.goals?.substring(0, 500));
    
    // Get FPS curriculum expectations
    const fpsExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Formation personnelle et sociale',
        grade: 1
      }
    });
    
    console.log('\n📋 FPS CURRICULUM EXPECTATIONS:');
    console.log(`Found ${fpsExpectations.length} expectations`);
    fpsExpectations.forEach((exp, index) => {
      console.log(`${index + 1}. [${exp.code}] ${exp.description}`);
    });
    
    // Get the actual units
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: fpsLRP.id
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log(`\n📊 FOUND ${units.length} UNITS IN FPS LRP\n`);
    console.log('=' .repeat(80));
    
    // Deep analysis of each unit
    units.forEach((unit, index) => {
      console.log(`\n\n🔍 UNIT ${index + 1}: ${unit.titleFr || unit.title}`);
      console.log('-' .repeat(60));
      
      // Basic info
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const schoolDays = Math.floor(daysDiff * 5/7); // Roughly remove weekends
      const potentialLessons = Math.floor(schoolDays / 2); // Every other day
      
      console.log(`\n📅 TIMING:`);
      console.log(`Start: ${startDate.toISOString().split('T')[0]}`);
      console.log(`End: ${endDate.toISOString().split('T')[0]}`);
      console.log(`Duration: ${daysDiff} calendar days`);
      console.log(`School days (approx): ${schoolDays}`);
      console.log(`Potential FPS lessons (every-other-day): ${potentialLessons}`);
      console.log(`Estimated Hours: ${unit.estimatedHours}`);
      
      // Content analysis
      console.log(`\n📝 CONTENT DEPTH:`);
      console.log(`Description length: ${unit.description?.length || 0} chars`);
      console.log(`Has Big Ideas: ${unit.bigIdeas ? 'YES' : 'NO'}`);
      console.log(`Has Essential Questions: ${unit.essentialQuestions ? 'YES' : 'NO'}`);
      console.log(`Has Assessment Plan: ${unit.assessmentPlan ? 'YES' : 'NO'}`);
      
      // Curriculum coverage
      console.log(`\n🎯 CURRICULUM EXPECTATIONS LINKED:`);
      if (unit.expectations.length > 0) {
        unit.expectations.forEach(exp => {
          console.log(`  - [${exp.expectation.code}] ${exp.expectation.description}`);
        });
      } else {
        console.log(`  ⚠️ NO EXPECTATIONS LINKED!`);
      }
      
      // Differentiation analysis
      const diff = unit.differentiationStrategies as any;
      console.log(`\n🔧 DIFFERENTIATION & SAFETY:`);
      if (diff) {
        console.log(`Has 4 learning levels: ${diff.forStruggling && diff.forOnLevel && diff.forAdvanced && diff.forELL ? 'YES' : 'NO'}`);
        console.log(`Has Emotional Safety: ${diff.emotionalSafety ? 'YES' : 'NO'}`);
        if (diff.emotionalSafety) {
          console.log(`  - Trauma Informed: ${diff.emotionalSafety.traumaInformed}`);
          console.log(`  - Protocols: ${diff.emotionalSafety.protocols?.length || 0}`);
        }
        console.log(`Has Grade 1 Appropriateness: ${diff.grade1Appropriate ? 'YES' : 'NO'}`);
        if (diff.grade1Appropriate) {
          console.log(`  - Dev Level: ${diff.grade1Appropriate.developmentalLevel}`);
          console.log(`  - Attention Span: ${diff.grade1Appropriate.attentionSpan}`);
        }
      } else {
        console.log(`⚠️ NO DIFFERENTIATION STRATEGIES!`);
      }
      
      // Cross-curricular
      console.log(`\n🔗 INTEGRATION:`);
      console.log(`Cross-curricular connections: ${unit.crossCurricularConnections ? 'YES' : 'NO'}`);
      console.log(`Indigenous perspectives: ${unit.indigenousPerspectives ? 'YES' : 'NO'}`);
      console.log(`Community connections: ${unit.communityConnections ? 'YES' : 'NO'}`);
      
      // Show sample of description
      if (unit.description) {
        console.log(`\n📖 DESCRIPTION SAMPLE:`);
        console.log(`"${unit.description.substring(0, 200)}..."`);
      }
    });
    
    // Overall assessment
    console.log('\n\n' + '=' .repeat(80));
    console.log('📊 OVERALL ASSESSMENT:\n');
    
    // Check timing totals
    let totalPotentialLessons = 0;
    let unitsWithNoExpectations = 0;
    let unitsOutsideETFO = 0;
    
    units.forEach(unit => {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const schoolDays = Math.floor(daysDiff * 5/7);
      const potentialLessons = Math.floor(schoolDays / 2);
      totalPotentialLessons += potentialLessons;
      
      if (unit.expectations.length === 0) unitsWithNoExpectations++;
      if (potentialLessons < 12 || potentialLessons > 16) unitsOutsideETFO++;
    });
    
    console.log(`Total potential lessons: ${totalPotentialLessons} (target: 98)`);
    console.log(`Units with no curriculum expectations: ${unitsWithNoExpectations}/${units.length}`);
    console.log(`Units outside ETFO 12-16 range: ${unitsOutsideETFO}/${units.length}`);
    
    // Check if all FPS expectations are covered
    const coveredExpectationCodes = new Set<string>();
    units.forEach(unit => {
      unit.expectations.forEach(exp => {
        coveredExpectationCodes.add(exp.expectation.code);
      });
    });
    
    console.log(`\n🎯 CURRICULUM COVERAGE:`);
    console.log(`Total FPS expectations: ${fpsExpectations.length}`);
    console.log(`Expectations covered in units: ${coveredExpectationCodes.size}`);
    
    if (coveredExpectationCodes.size < fpsExpectations.length) {
      console.log(`\n⚠️ MISSING EXPECTATIONS:`);
      fpsExpectations.forEach(exp => {
        if (!coveredExpectationCodes.has(exp.code)) {
          console.log(`  - [${exp.code}] ${exp.description}`);
        }
      });
    }
    
    // Check LRP alignment
    console.log(`\n📚 LRP ALIGNMENT CHECK:`);
    console.log(`LRP promises ${fpsLRP.grade} grade level: ${units.every(u => true) ? 'YES' : 'NO'}`);
    console.log(`LRP is for ${fpsLRP.academicYear}: Units span Sept-June: ${
      units[0]?.startDate && units[units.length-1]?.endDate ? 'YES' : 'NO'
    }`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

manualDeepFPSReview()
  .then(() => {
    console.log('\n✅ Manual deep review completed');
  })
  .catch((error) => {
    console.error('❌ Manual deep review failed:', error);
    process.exit(1);
  });