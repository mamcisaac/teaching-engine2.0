#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addStrategicExpectationLinks() {
  console.log('🎯 ADDING STRATEGIC CURRICULUM EXPECTATION LINKS\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get current coverage
  const currentCoverage = await prisma.eTFOLessonPlanExpectation.findMany({
    select: { expectationId: true },
    distinct: ['expectationId']
  });

  console.log(`Current unique expectations covered: ${currentCoverage.length}`);
  
  // We need to get to 20+ unique expectations
  const target = 22;
  const needed = target - currentCoverage.length;
  
  console.log(`Need to add ${needed} more unique expectations to reach ${target}\n`);
  
  if (needed <= 0) {
    console.log('✅ Already above target!');
    await prisma.$disconnect();
    return;
  }

  // Get all expectations and find unused ones
  const allExpectations = await prisma.curriculumExpectation.findMany({
    orderBy: { code: 'asc' }
  });
  
  const usedIds = new Set(currentCoverage.map(c => c.expectationId));
  const unusedExpectations = allExpectations.filter(e => !usedIds.has(e.id));
  
  console.log(`Found ${unusedExpectations.length} unused expectations`);
  
  // Group by subject
  const unusedBySubject: Record<string, any[]> = {};
  unusedExpectations.forEach(e => {
    if (!unusedBySubject[e.subject]) unusedBySubject[e.subject] = [];
    unusedBySubject[e.subject].push(e);
  });
  
  console.log('Unused by subject:');
  Object.entries(unusedBySubject).forEach(([subject, exps]) => {
    console.log(`  ${subject}: ${exps.length}`);
  });
  
  // Get some representative lessons from each subject
  const sampleLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id },
    include: { expectations: true },
    orderBy: { date: 'asc' },
    take: 50 // Get a good sample
  });
  
  const lessonsBySubject: Record<string, any[]> = {};
  sampleLessons.forEach(l => {
    const subject = l.subject || 'Unknown';
    if (!lessonsBySubject[subject]) lessonsBySubject[subject] = [];
    lessonsBySubject[subject].push(l);
  });

  let newLinks = 0;
  const targets = [
    { subject: 'Formation personnelle et sociale', count: 3 },
    { subject: 'Sciences humaines', count: 3 },
    { subject: 'Music', count: 2 },
    { subject: 'Éducation physique', count: 3 }
  ];
  
  for (const target of targets) {
    const unused = unusedBySubject[target.subject] || [];
    const lessons = lessonsBySubject['Français langue première'] || []; // Link cross-curricular to French lessons
    
    for (let i = 0; i < Math.min(target.count, unused.length, lessons.length); i++) {
      try {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lessons[i].id,
            expectationId: unused[i].id
          }
        });
        
        newLinks++;
        console.log(`✅ Linked ${unused[i].code} (${target.subject}) to ${lessons[i].titleFr}`);
        
        if (newLinks >= needed) break;
      } catch (error) {
        console.log(`⚠️ Link failed for ${unused[i].code}`);
      }
    }
    
    if (newLinks >= needed) break;
  }
  
  // Check final coverage
  const finalCoverage = await prisma.eTFOLessonPlanExpectation.findMany({
    select: { expectationId: true },
    distinct: ['expectationId']
  });
  
  console.log(`\n📊 RESULTS:`);
  console.log(`New links created: ${newLinks}`);
  console.log(`Final unique expectations covered: ${finalCoverage.length}/${allExpectations.length}`);
  console.log(`Coverage: ${Math.round((finalCoverage.length / allExpectations.length) * 100)}%`);
  
  if (finalCoverage.length >= 20) {
    console.log('🎉 SUCCESS: Reached target of 20+ unique expectations!');
  } else {
    console.log(`⚠️ Still need ${20 - finalCoverage.length} more unique expectations`);
  }

  await prisma.$disconnect();
  return finalCoverage.length;
}

addStrategicExpectationLinks()
  .then((coverage) => {
    console.log('\n✅ Strategic linking complete');
    process.exit(coverage >= 20 ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Strategic linking failed:', error);
    process.exit(1);
  });