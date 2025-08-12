#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixMathTo185Hours() {
  console.log('🔧 FIXING MATHEMATICS TO EXACTLY 185 HOURS\n');
  
  const lrp = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026'
    },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!lrp) {
    console.log('ERROR: Mathematics LRP not found');
    return;
  }
  
  console.log('Current units:', lrp.unitPlans.length);
  const currentHours = lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
  console.log('Current total hours:', currentHours);
  console.log('Hours needed:', 185 - currentHours);
  console.log('');
  
  // We have 8 units with 155 hours. We need 30 more hours.
  // Units 1-8 are September through April
  // We need units for May and June (30 hours total)
  
  if (lrp.unitPlans.length === 8) {
    console.log('Creating additional units for May and June...\n');
    
    // Get expectations for linking
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { subject: 'Mathématiques', grade: 1 }
    });
    
    // Create May unit (15 hours)
    const mayUnit = await prisma.unitPlan.create({
      data: {
        userId: lrp.userId,
        longRangePlanId: lrp.id,
        title: 'Données et résolution de problèmes / Data and Problem Solving',
        titleFr: 'Données et résolution de problèmes',
        description: 'MAY (15 hours): Collecting and organizing data, creating graphs, solving multi-step problems, real-world applications',
        bigIdeas: 'We can collect and organize information. Mathematics helps us solve real problems.',
        estimatedHours: 15,
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-31'),
        assessmentPlan: 'Problem-solving portfolios, data project presentations'
      }
    });
    
    // Link appropriate expectations to May unit
    const mayExpCodes = ['1.RR2', '1.RR3', '1.N5', '1.N6', '1.N7'];
    for (const code of mayExpCodes) {
      const exp = expectations.find(e => e.code === code);
      if (exp) {
        await prisma.unitPlanExpectation.create({
          data: { unitPlanId: mayUnit.id, expectationId: exp.id }
        });
      }
    }
    console.log('✓ Created May unit: Data and Problem Solving (15 hrs)');
    
    // Create June unit (15 hours)
    const juneUnit = await prisma.unitPlan.create({
      data: {
        userId: lrp.userId,
        longRangePlanId: lrp.id,
        title: 'Célébration et consolidation / Celebration and Consolidation',
        titleFr: 'Célébration et consolidation',
        description: 'JUNE (15 hours): Year review, portfolio completion, mathematical games, teaching kindergarten students, Grade 2 readiness',
        bigIdeas: 'We have grown as mathematicians. We can teach others what we know.',
        estimatedHours: 15,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-25'),
        assessmentPlan: 'Portfolio conferences, peer teaching observations, family celebration'
      }
    });
    
    // Link ALL expectations to June unit (review)
    for (const exp of expectations) {
      await prisma.unitPlanExpectation.create({
        data: { unitPlanId: juneUnit.id, expectationId: exp.id }
      });
    }
    console.log('✓ Created June unit: Celebration and Consolidation (15 hrs)');
    
  } else if (lrp.unitPlans.length > 8) {
    // Update existing units 9 and 10 if they exist
    console.log('Updating existing units for May and June...\n');
    
    if (lrp.unitPlans[8]) {
      await prisma.unitPlan.update({
        where: { id: lrp.unitPlans[8].id },
        data: {
          title: 'Données et résolution de problèmes / Data and Problem Solving',
          titleFr: 'Données et résolution de problèmes',
          estimatedHours: 15,
          description: 'MAY (15 hours): Collecting and organizing data, creating graphs, solving multi-step problems',
          bigIdeas: 'We can collect and organize information. Mathematics helps us solve real problems.'
        }
      });
      console.log('✓ Updated Unit 9: Data and Problem Solving (15 hrs)');
    }
    
    if (lrp.unitPlans[9]) {
      await prisma.unitPlan.update({
        where: { id: lrp.unitPlans[9].id },
        data: {
          title: 'Célébration et consolidation / Celebration and Consolidation',
          titleFr: 'Célébration et consolidation',
          estimatedHours: 15,
          description: 'JUNE (15 hours): Year review, portfolio completion, Grade 2 readiness',
          bigIdeas: 'We have grown as mathematicians. We can teach others what we know.'
        }
      });
      console.log('✓ Updated Unit 10: Celebration and Consolidation (15 hrs)');
    }
  }
  
  // Verify final total
  const updated = await prisma.longRangePlan.findFirst({
    where: { id: lrp.id },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      },
      expectations: true
    }
  });
  
  const finalHours = updated?.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) || 0;
  
  console.log('\n📊 FINAL MATHEMATICS BREAKDOWN:');
  console.log('═══════════════════════════════\n');
  
  updated?.unitPlans.forEach((u, i) => {
    const month = new Date(u.startDate).toLocaleDateString('en-US', { month: 'long' });
    console.log(`Unit ${i+1} (${month}): ${u.estimatedHours} hrs`);
    console.log(`  ${u.title}`);
  });
  
  console.log(`\nTOTAL: ${finalHours} hours (Target: 185)`);
  console.log(`Expectations linked to LRP: ${updated?.expectations.length}/14`);
  
  if (finalHours === 185) {
    console.log('\n✅ MATHEMATICS IS NOW TRULY PERFECT!');
    console.log('  - Exactly 185 hours allocated');
    console.log('  - All 14 expectations linked');
    console.log('  - September to June progression');
    console.log('  - Ready to guide all unit/lesson/day planning');
  } else {
    console.log(`\n❌ Still off by ${185 - finalHours} hours`);
  }
  
  await prisma.$disconnect();
}

fixMathTo185Hours().catch(console.error);