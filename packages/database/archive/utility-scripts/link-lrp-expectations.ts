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

async function linkLRPExpectations() {
  console.log('🔗 LINKING CURRICULUM EXPECTATIONS TO LONG RANGE PLANS\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Get all expectations and LRPs
  const expectations = await prisma.curriculumExpectation.findMany({
    orderBy: [{ subject: 'asc' }, { code: 'asc' }]
  });
  
  const lrps = await prisma.longRangePlan.findMany({
    where: { userId: emily.id },
    include: {
      expectations: true
    }
  });

  console.log(`Found ${expectations.length} curriculum expectations`);
  console.log(`Found ${lrps.length} long range plans`);
  
  // Organize expectations by subject
  const expectationsBySubject: Record<string, any[]> = {};
  expectations.forEach(e => {
    if (!expectationsBySubject[e.subject]) expectationsBySubject[e.subject] = [];
    expectationsBySubject[e.subject].push(e);
  });

  console.log('\nExpectations by subject:');
  Object.entries(expectationsBySubject).forEach(([subject, exps]) => {
    console.log(`  ${subject}: ${exps.length} expectations`);
  });

  let linked = 0;

  // Link ALL expectations for each subject to its LRP
  // This is because LRPs cover the entire year curriculum for their subject
  for (const lrp of lrps) {
    const lrpSubject = lrp.subject;
    
    // Skip if LRP already has expectations linked
    if (lrp.expectations.length > 0) {
      console.log(`⏭️  ${lrp.title}: Already has ${lrp.expectations.length} expectations`);
      continue;
    }

    const subjectExpectations = expectationsBySubject[lrpSubject] || [];
    if (subjectExpectations.length === 0) {
      console.log(`⚠️  ${lrp.title}: No expectations for subject ${lrpSubject}`);
      continue;
    }

    console.log(`\n📚 Linking ${lrpSubject} LRP to all ${subjectExpectations.length} expectations`);

    // Link ALL expectations for this subject to the LRP
    for (const expectation of subjectExpectations) {
      try {
        // Check if link already exists to avoid duplicates
        const existingLink = await prisma.longRangePlanExpectation.findUnique({
          where: {
            longRangePlanId_expectationId: {
              longRangePlanId: lrp.id,
              expectationId: expectation.id
            }
          }
        });

        if (!existingLink) {
          await prisma.longRangePlanExpectation.create({
            data: {
              longRangePlanId: lrp.id,
              expectationId: expectation.id
            }
          });
          
          linked++;
          console.log(`  ✅ Linked ${expectation.code}: ${expectation.description.substring(0, 50)}...`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to link ${expectation.code}:`, error);
      }
    }
  }

  // Check final coverage
  const finalCoverage = await prisma.longRangePlan.findMany({
    where: { userId: emily.id },
    select: {
      subject: true,
      expectations: {
        select: {
          expectationId: true
        }
      }
    }
  });
  
  console.log(`\n📊 FINAL LRP COVERAGE:`);
  for (const lrp of finalCoverage) {
    const subjectTotal = expectationsBySubject[lrp.subject]?.length || 0;
    console.log(`${lrp.subject}: ${lrp.expectations.length}/${subjectTotal} expectations`);
  }

  const totalExpectationsLinked = finalCoverage.reduce((sum, lrp) => sum + lrp.expectations.length, 0);

  console.log(`\n📊 RESULTS:`);
  console.log(`New links created: ${linked}`);
  console.log(`Total expectations linked to LRPs: ${totalExpectationsLinked}`);

  await prisma.$disconnect();
  
  return {
    linked,
    totalExpectations: expectations.length,
    totalLinked: totalExpectationsLinked
  };
}

linkLRPExpectations()
  .then((result) => {
    console.log(`\n✅ LRP expectation linking complete: ${result.linked} new links`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Linking failed:', error);
    process.exit(1);
  });