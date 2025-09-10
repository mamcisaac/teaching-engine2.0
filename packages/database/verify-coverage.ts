#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as path from 'path';

// Use the correct database path
const databaseUrl = `file:${path.resolve(process.cwd(), 'prisma/prisma/dev.db')}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function verifyCurriculumCoverage() {
  console.log('📊 VERIFYING CURRICULUM COVERAGE\n');
  console.log('='.repeat(80));
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get all expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    orderBy: [{ subject: 'asc' }, { code: 'asc' }]
  });

  console.log(`\n📚 TOTAL CURRICULUM EXPECTATIONS: ${expectations.length}`);
  console.log('='.repeat(80));

  // Get coverage by lessons
  const lessonCoverage = await prisma.eTFOLessonPlanExpectation.findMany({
    select: { expectationId: true },
    distinct: ['expectationId']
  });
  const lessonExpectationIds = new Set(lessonCoverage.map(e => e.expectationId));

  // Get coverage by units
  const unitCoverage = await prisma.unitPlanExpectation.findMany({
    select: { expectationId: true },
    distinct: ['expectationId']
  });
  const unitExpectationIds = new Set(unitCoverage.map(e => e.expectationId));

  // Get coverage by LRPs
  const lrpCoverage = await prisma.longRangePlanExpectation.findMany({
    select: { expectationId: true },
    distinct: ['expectationId']
  });
  const lrpExpectationIds = new Set(lrpCoverage.map(e => e.expectationId));

  // Combined coverage
  const allCoveredIds = new Set([...lessonExpectationIds, ...unitExpectationIds, ...lrpExpectationIds]);

  console.log('\n📈 COVERAGE BY ENTITY TYPE:');
  console.log('-'.repeat(40));
  console.log(`Lessons:     ${lessonExpectationIds.size}/${expectations.length} (${Math.round((lessonExpectationIds.size / expectations.length) * 100)}%)`);
  console.log(`Units:       ${unitExpectationIds.size}/${expectations.length} (${Math.round((unitExpectationIds.size / expectations.length) * 100)}%)`);
  console.log(`LRPs:        ${lrpExpectationIds.size}/${expectations.length} (${Math.round((lrpExpectationIds.size / expectations.length) * 100)}%)`);
  console.log(`COMBINED:    ${allCoveredIds.size}/${expectations.length} (${Math.round((allCoveredIds.size / expectations.length) * 100)}%)`);

  // Break down by subject
  console.log('\n📖 COVERAGE BY SUBJECT:');
  console.log('-'.repeat(40));
  
  const subjects = [...new Set(expectations.map(e => e.subject))];
  
  for (const subject of subjects) {
    const subjectExpectations = expectations.filter(e => e.subject === subject);
    const subjectIds = new Set(subjectExpectations.map(e => e.id));
    
    const coveredInLessons = [...lessonExpectationIds].filter(id => subjectIds.has(id)).length;
    const coveredInUnits = [...unitExpectationIds].filter(id => subjectIds.has(id)).length;
    const coveredInLRPs = [...lrpExpectationIds].filter(id => subjectIds.has(id)).length;
    const coveredTotal = [...allCoveredIds].filter(id => subjectIds.has(id)).length;
    
    console.log(`\n${subject}:`);
    console.log(`  Total expectations: ${subjectExpectations.length}`);
    console.log(`  Covered in lessons: ${coveredInLessons} (${Math.round((coveredInLessons / subjectExpectations.length) * 100)}%)`);
    console.log(`  Covered in units:   ${coveredInUnits} (${Math.round((coveredInUnits / subjectExpectations.length) * 100)}%)`);
    console.log(`  Covered in LRPs:    ${coveredInLRPs} (${Math.round((coveredInLRPs / subjectExpectations.length) * 100)}%)`);
    console.log(`  Overall coverage:   ${coveredTotal} (${Math.round((coveredTotal / subjectExpectations.length) * 100)}%)`);
  }

  // Find uncovered expectations
  const uncoveredExpectations = expectations.filter(e => !allCoveredIds.has(e.id));
  
  if (uncoveredExpectations.length > 0) {
    console.log('\n⚠️ UNCOVERED EXPECTATIONS:');
    console.log('-'.repeat(40));
    uncoveredExpectations.forEach(exp => {
      console.log(`${exp.code} (${exp.subject}): ${exp.description.substring(0, 60)}...`);
    });
  } else {
    console.log('\n✅ ALL EXPECTATIONS ARE COVERED!');
  }

  // Entity counts
  const lessonCount = await prisma.eTFOLessonPlan.count({ where: { userId: emily.id } });
  const unitCount = await prisma.unitPlan.count({ where: { userId: emily.id } });
  const lrpCount = await prisma.longRangePlan.count({ where: { userId: emily.id } });
  
  const lessonLinks = await prisma.eTFOLessonPlanExpectation.count();
  const unitLinks = await prisma.unitPlanExpectation.count();
  const lrpLinks = await prisma.longRangePlanExpectation.count();

  console.log('\n📊 ENTITY STATISTICS:');
  console.log('-'.repeat(40));
  console.log(`Lesson Plans:  ${lessonCount} (${lessonLinks} expectation links)`);
  console.log(`Unit Plans:    ${unitCount} (${unitLinks} expectation links)`);
  console.log(`LRPs:          ${lrpCount} (${lrpLinks} expectation links)`);
  console.log(`Total Links:   ${lessonLinks + unitLinks + lrpLinks}`);

  await prisma.$disconnect();
  
  return {
    totalExpectations: expectations.length,
    coveredExpectations: allCoveredIds.size,
    coveragePercent: Math.round((allCoveredIds.size / expectations.length) * 100)
  };
}

verifyCurriculumCoverage()
  .then((result) => {
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 FINAL VERDICT: ${result.coveredExpectations}/${result.totalExpectations} expectations covered (${result.coveragePercent}%)`);
    console.log('='.repeat(80));
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });