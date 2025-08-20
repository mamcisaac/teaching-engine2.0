import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalManualReviewFinal() {
  try {
    console.log('🔍 CRITICAL MANUAL REVIEW - ULTRATHINK ANALYSIS\n');
    console.log('Examining actual unit content for real-world perfection...\n');
    
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

    console.log('📊 TIMING ANALYSIS:');
    let totalLessons = 0;
    units.forEach((unit, index) => {
      const lessons = Math.round((unit.estimatedHours || 0) * 60 / 45);
      const weeks = lessons / 5;
      totalLessons += lessons;
      
      console.log(`Unit ${index + 1}: ${unit.title}`);
      console.log(`  Duration: ${unit.estimatedHours}h = ${lessons} lessons = ${weeks.toFixed(1)} weeks`);
      console.log(`  Start: ${unit.startDate.toISOString().split('T')[0]}`);
      console.log(`  End: ${unit.endDate.toISOString().split('T')[0]}`);
    });
    console.log(`\nTOTAL: ${totalLessons} lessons (Target: 195)`);
    console.log(`Mathematical hours: ${totalLessons * 45 / 60} (Target: 146.25)`);

    console.log('\n📚 CURRICULUM EXPECTATION ANALYSIS:');
    const expectationDistribution = new Map();
    units.forEach((unit, unitIndex) => {
      console.log(`\nUnit ${unitIndex + 1}: ${unit.expectations.length} expectations`);
      unit.expectations.forEach(exp => {
        const count = expectationDistribution.get(exp.expectation.code) || 0;
        expectationDistribution.set(exp.expectation.code, count + 1);
        console.log(`  - ${exp.expectation.code}: ${exp.expectation.description.substring(0, 60)}...`);
      });
    });

    console.log('\n🔄 SPIRALING ANALYSIS:');
    Array.from(expectationDistribution.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([code, count]) => {
        const status = count >= 2 && count <= 4 ? '✅' : count < 2 ? '⚠️ UNDER' : '❌ OVER';
        console.log(`${status} ${code}: ${count} times`);
      });

    console.log('\n❓ ESSENTIAL QUESTIONS SAMPLE:');
    units.slice(0, 3).forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      if (unit.essentialQuestions && Array.isArray(unit.essentialQuestions)) {
        unit.essentialQuestions.forEach((q, i) => {
          console.log(`  Week ${i + 1}: ${q}`);
        });
      }
    });

    console.log('\n📋 ASSESSMENT COMPLEXITY SAMPLE:');
    units.slice(0, 2).forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      console.log(`Assessment: ${unit.assessmentPlan?.substring(0, 200)}...`);
    });

    console.log('\n🔧 FLEXIBILITY ANALYSIS:');
    units.slice(0, 2).forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      console.log(`Flexibility info: ${unit.priorKnowledge?.substring(0, 150)}...`);
    });

    console.log('\n🪶 INDIGENOUS PERSPECTIVES SAMPLE:');
    units.slice(0, 2).forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      console.log(`Mi'kmaq integration: ${unit.indigenousPerspectives?.substring(0, 150)}...`);
    });

    console.log('\n📝 VOCABULARY LOAD ANALYSIS:');
    units.forEach((unit, index) => {
      const vocab = unit.keyVocabulary;
      const count = Array.isArray(vocab) ? vocab.length : 0;
      console.log(`Unit ${index + 1}: ${count} vocabulary words ${count <= 20 ? '✅' : '⚠️'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criticalManualReviewFinal();