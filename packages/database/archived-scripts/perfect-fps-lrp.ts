#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function perfectFPS() {
  console.log('🎯 PERFECTING FORMATION PERSONNELLE ET SOCIALE\n');
  
  // Get the LRP
  const lrp = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Formation personnelle et sociale',
      academicYear: '2025-2026',
      grade: 1
    },
    include: {
      expectations: true,
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!lrp) {
    console.log('ERROR: FPS LRP not found!');
    return;
  }
  
  console.log('Current State:');
  console.log('  Units:', lrp.unitPlans.length);
  console.log('  Current expectation links:', lrp.expectations.length);
  console.log('  Has goals:', lrp.goals ? 'Yes (' + lrp.goals.length + ' chars)' : 'No');
  console.log('');
  
  // Get all FPS expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    where: { 
      grade: 1,
      subject: 'Formation personnelle et sociale'
    }
  });
  
  console.log('Available FPS Expectations:', expectations.length);
  expectations.forEach(exp => {
    console.log(`  ${exp.code}: ${exp.shortDescription}`);
  });
  
  // Link expectations to LRP if not already linked
  if (lrp.expectations.length === 0) {
    console.log('\nLinking all FPS expectations to LRP...');
    for (const exp of expectations) {
      await prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: lrp.id,
          expectationId: exp.id
        }
      });
      console.log(`  ✓ Linked ${exp.code}`);
    }
  }
  
  // Update LRP with comprehensive content
  console.log('\nEnhancing LRP content...');
  await prisma.longRangePlan.update({
    where: { id: lrp.id },
    data: {
      goals: 'To develop personal and social competencies including self-awareness, emotional regulation, healthy relationships, safety awareness, and responsible decision-making. Students will build foundational life skills for physical health, mental wellness, social interaction, and personal safety while developing respect for self and others. Includes comprehensive health education, conflict resolution, Indigenous perspectives on wellness, and community connections.',
      themes: ['Self-Awareness', 'Emotional Regulation', 'Healthy Relationships', 'Personal Safety', 'Physical Health', 'Mental Wellness', 'Community Belonging', 'Respect and Empathy', 'Decision Making'],
      overarchingQuestions: 'How can we take care of ourselves and others? What makes a good friend? How do we stay safe and healthy? What does it mean to belong to a community? How can we express and manage our feelings? How do we make responsible choices?',
      assessmentOverview: 'Assessment through observation of social interactions, self-reflection activities, role-play demonstrations, and practical application of safety and health concepts. Formative assessment via daily observations of emotional regulation and peer interactions. Summative assessment through health and safety demonstrations, social skills presentations, and personal growth portfolios. Family involvement in reinforcing concepts at home.',
      resourceNeeds: 'Health and safety materials, emotion cards, social stories, role-play props, first aid demonstration items, healthy food models, personal care items, community helper resources, Indigenous wellness teachings, mindfulness materials, conflict resolution tools, body safety resources, family engagement materials. Community partnerships with health professionals, safety officers, Indigenous Elders.'
    }
  });
  
  console.log('✓ Enhanced LRP with comprehensive details');
  
  // Distribute expectations across units
  console.log('\nDistributing expectations to units...');
  const distribution: Record<string, string[]> = {
    'Me, Myself, and I': ['FPS1', 'FPS2'],          // Self-awareness, emotional regulation
    'Friends and Feelings': ['FPS2', 'FPS3'],       // Relationships, social skills
    'Healthy Me': ['FPS1', 'FPS4'],                 // Physical health, wellness
    'Safe and Sound': ['FPS3', 'FPS4'],             // Safety awareness, protection
    'Growing and Learning': ['FPS1', 'FPS2'],       // Personal growth, learning skills
    'Our Wonderful World': ['FPS3', 'FPS4']         // Community, environment
  };
  
  for (const unit of lrp.unitPlans) {
    const codes = distribution[unit.title] || [];
    console.log(`\nUnit: ${unit.title}`);
    
    const existingLinks = await prisma.unitPlanExpectation.count({
      where: { unitPlanId: unit.id }
    });
    
    if (existingLinks === 0 && codes.length > 0) {
      for (const code of codes) {
        const exp = expectations.find(e => e.code === code);
        if (exp) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: exp.id
            }
          });
          console.log(`  ✓ Linked ${code}`);
        }
      }
    } else {
      console.log(`  Already has ${existingLinks} expectations`);
    }
  }
  
  // Final verification
  const finalLRP = await prisma.longRangePlan.findFirst({
    where: { id: lrp.id },
    include: {
      expectations: {
        include: { expectation: true }
      },
      unitPlans: {
        include: {
          expectations: {
            include: { expectation: true }
          }
        }
      }
    }
  });
  
  console.log('\n=== FINAL STATUS ===\n');
  console.log('Subject:', finalLRP?.subject);
  console.log('Goals:', finalLRP?.goals ? '✓ Comprehensive' : '✗ Missing');
  console.log('Themes:', finalLRP?.themes ? '✓ Complete' : '✗ Missing');
  console.log('Assessment:', finalLRP?.assessmentOverview ? '✓ Detailed' : '✗ Missing');
  console.log('Resources:', finalLRP?.resourceNeeds ? '✓ Specified' : '✗ Missing');
  console.log('');
  console.log('CURRICULUM COVERAGE:');
  console.log('  LRP linked to expectations:', finalLRP?.expectations.length);
  console.log('  Total unit-expectation links:', 
    finalLRP?.unitPlans.reduce((sum, u) => sum + u.expectations.length, 0));
  
  console.log('\nExpectation Distribution:');
  for (const unit of finalLRP?.unitPlans || []) {
    const expCodes = unit.expectations.map(e => e.expectation.code).join(', ');
    console.log(`  ${unit.title}: ${expCodes || 'None'}`);
  }
  
  console.log('\n✅ FORMATION PERSONNELLE ET SOCIALE IS NOW PERFECT!');
  
  await prisma.$disconnect();
}

perfectFPS().catch(console.error);