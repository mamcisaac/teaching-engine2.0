import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function brutalHonestManualReview() {
  try {
    console.log('🔍 BRUTAL HONEST MANUAL REVIEW - ULTRATHINK ANALYSIS\n');
    console.log('Examining actual units with critical pedagogical lens...\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98h0001vjr1cvh4knsh' },
      orderBy: { startDate: 'asc' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    const longRangePlan = await prisma.longRangePlan.findUnique({
      where: { id: 'cmebyc98h0001vjr1cvh4knsh' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    console.log('📊 TIMING REALITY CHECK:');
    let totalLessons = 0;
    units.forEach((unit, index) => {
      const lessons = Math.round((unit.estimatedHours || 0) * 60 / 45);
      const weeks = lessons / 5;
      totalLessons += lessons;
      
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const actualDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const schoolDays = Math.round(actualDays * 0.71);
      
      console.log(`Unit ${index + 1}: ${unit.title}`);
      console.log(`  Planned: ${lessons} lessons (${weeks.toFixed(1)} weeks)`);
      console.log(`  Calendar: ${schoolDays} school days available`);
      console.log(`  Buffer: ${schoolDays - lessons} days`);
      
      if (schoolDays < lessons) {
        console.log(`  ⚠️ PROBLEM: Not enough calendar days for planned lessons!`);
      }
    });
    
    console.log(`\nTOTAL LESSONS: ${totalLessons} (Target: 195)`);
    if (totalLessons !== 195) {
      console.log(`❌ MATHEMATICAL ERROR: ${totalLessons - 195} lesson difference from target`);
    }

    console.log('\n📚 CURRICULUM EXPECTATION ANALYSIS:');
    const expectationCounts = new Map();
    let totalCovered = 0;
    
    units.forEach((unit, unitIndex) => {
      console.log(`\nUnit ${unitIndex + 1}: ${unit.expectations?.length || 0} expectations`);
      if (unit.expectations) {
        unit.expectations.forEach(exp => {
          const code = exp.expectation.code;
          const count = expectationCounts.get(code) || 0;
          expectationCounts.set(code, count + 1);
          totalCovered++;
          console.log(`  - ${code}: ${exp.expectation.description.substring(0, 50)}...`);
        });
      }
    });

    console.log('\n🔄 SPIRALING QUALITY CHECK:');
    if (expectationCounts.size === 0) {
      console.log('❌ CRITICAL ERROR: NO CURRICULUM EXPECTATIONS FOUND!');
      console.log('This means curriculum coverage is 0% - completely broken!');
    } else {
      Array.from(expectationCounts.entries()).forEach(([code, count]) => {
        const status = count >= 2 && count <= 4 ? '✅' : count < 2 ? '⚠️ UNDER' : '❌ OVER';
        console.log(`${status} ${code}: ${count} times`);
      });
    }

    console.log('\n❓ ESSENTIAL QUESTIONS QUALITY:');
    units.slice(0, 3).forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      if (unit.essentialQuestions && Array.isArray(unit.essentialQuestions)) {
        unit.essentialQuestions.forEach((q, i) => {
          console.log(`  Week ${i + 1}: ${q}`);
          // Check if questions are actually appropriate for Grade 1
          if (q.includes('documenter') || q.includes('analyser') || q.includes('évaluer')) {
            console.log(`    ⚠️ WARNING: Too complex for Grade 1`);
          }
        });
      } else {
        console.log('  ❌ ERROR: No essential questions found or wrong format');
      }
    });

    console.log('\n📋 ASSESSMENT REALITY CHECK:');
    units.slice(0, 2).forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      const assessment = unit.assessmentPlan;
      if (assessment) {
        console.log(`Assessment length: ${assessment.length} characters`);
        if (assessment.length > 500) {
          console.log('⚠️ WARNING: Assessment plan too complex (>500 characters)');
        }
        if (assessment.includes('WEEKLY OBSERVATIONS') || assessment.includes('DAILY')) {
          console.log('⚠️ WARNING: Still contains frequent tracking despite simplification claims');
        }
        if (assessment.includes('rubric') || assessment.includes('detailed')) {
          console.log('⚠️ WARNING: Contains complex assessment terminology');
        }
      } else {
        console.log('❌ ERROR: No assessment plan found');
      }
    });

    console.log('\n🔧 FLEXIBILITY IMPLEMENTATION CHECK:');
    units.slice(0, 2).forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      
      // Check if flexibility is actually implemented
      const flexibility = unit.differentiationStrategies;
      if (flexibility && typeof flexibility === 'object') {
        console.log('✅ Flexibility protocols found in differentiationStrategies field');
        if (flexibility.flexibilityProtocols) {
          console.log('✅ Compression/extension protocols specified');
        }
      } else {
        console.log('❌ ERROR: No flexibility protocols found');
      }
      
      // Check substitute instructions
      const subInstructions = unit.socialJusticeConnections;
      if (subInstructions && subInstructions.includes('SUBSTITUTE TEACHER')) {
        console.log('✅ Substitute teacher instructions found');
      } else {
        console.log('❌ ERROR: No substitute teacher instructions found');
      }
    });

    console.log('\n🪶 INDIGENOUS PERSPECTIVES QUALITY:');
    units.slice(0, 2).forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      const indigenous = unit.indigenousPerspectives;
      if (indigenous) {
        if (indigenous.includes('Mi\'kmaq') && indigenous.includes('respectful')) {
          console.log('✅ Contains authentic Mi\'kmaq perspectives');
        } else {
          console.log('⚠️ WARNING: Indigenous content may be superficial');
        }
        if (indigenous.length > 800) {
          console.log('⚠️ WARNING: Indigenous content too lengthy for practical use');
        }
      } else {
        console.log('❌ ERROR: No Indigenous perspectives found');
      }
    });

    console.log('\n📝 VOCABULARY APPROPRIATENESS:');
    units.forEach((unit, index) => {
      const vocab = unit.keyVocabulary;
      if (Array.isArray(vocab)) {
        const count = vocab.length;
        console.log(`Unit ${index + 1}: ${count} words ${count <= 15 ? '✅' : count <= 20 ? '⚠️' : '❌'}`);
        if (count > 15) {
          console.log(`  WARNING: ${count} words may be too many for Grade 1`);
        }
      } else {
        console.log(`Unit ${index + 1}: ❌ ERROR: Vocabulary not in array format or missing`);
      }
    });

    console.log('\n⏰ BUFFER TIME REALITY:');
    let previousEndDate = null;
    units.forEach((unit, index) => {
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      
      if (previousEndDate) {
        const bufferDays = Math.ceil((startDate.getTime() - previousEndDate.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`Unit ${index + 1}: ${bufferDays} buffer days before start`);
        if (bufferDays < 1) {
          console.log(`  ❌ ERROR: No buffer time - units run back-to-back`);
        } else if (bufferDays >= 3) {
          console.log(`  ✅ Good buffer time`);
        } else {
          console.log(`  ⚠️ WARNING: Minimal buffer (${bufferDays} days)`);
        }
      }
      previousEndDate = endDate;
    });

  } catch (error) {
    console.error('Error in manual review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

brutalHonestManualReview();