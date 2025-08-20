#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getFrenchUnitDetails() {
  console.log('🔍 Getting detailed French unit content for critical review...\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    // Get Unit Plans for Français (Immersion) with full content
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français (Immersion)'
        }
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        bigIdeas: true,
        essentialQuestions: true,
        description: true,
        assessmentPlan: true,
        culminatingTask: true,
        differentiationStrategies: true,
        keyVocabulary: true,
        priorKnowledge: true,
        communityConnections: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`📚 DETAILED FRENCH UNIT ANALYSIS (${unitPlans.length} units):\n`);

    for (let i = 0; i < unitPlans.length; i++) {
      const unit = unitPlans[i];
      console.log(`${'='.repeat(60)}`);
      console.log(`UNIT ${i + 1}: "${unit.title}"`);
      console.log(`Period: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`${'='.repeat(60)}\n`);

      console.log('📖 BIG IDEAS:');
      console.log(unit.bigIdeas || 'Not provided');
      console.log('');

      console.log('❓ ESSENTIAL QUESTIONS:');
      if (Array.isArray(unit.essentialQuestions) && unit.essentialQuestions.length > 0) {
        unit.essentialQuestions.forEach((q, idx) => {
          console.log(`${idx + 1}. ${q}`);
        });
      } else {
        console.log('Not provided');
      }
      console.log('');

      console.log('📝 DESCRIPTION:');
      console.log(unit.description || 'Not provided');
      console.log('');

      console.log('📊 ASSESSMENT PLAN:');
      console.log(unit.assessmentPlan || 'Not provided');
      console.log('');

      console.log('🎯 CULMINATING TASK:');
      console.log(unit.culminatingTask || 'Not provided');
      console.log('');

      console.log('🔄 DIFFERENTIATION STRATEGIES:');
      if (Array.isArray(unit.differentiationStrategies) && unit.differentiationStrategies.length > 0) {
        unit.differentiationStrategies.forEach((strategy, idx) => {
          console.log(`${idx + 1}. ${strategy}`);
        });
      } else {
        console.log('Not provided');
      }
      console.log('');

      console.log('📚 KEY VOCABULARY:');
      if (Array.isArray(unit.keyVocabulary) && unit.keyVocabulary.length > 0) {
        console.log(unit.keyVocabulary.join(', '));
      } else {
        console.log('Not provided');
      }
      console.log('');

      console.log('🧠 PRIOR KNOWLEDGE:');
      console.log(unit.priorKnowledge || 'Not provided');
      console.log('');

      console.log('🌍 COMMUNITY CONNECTIONS:');
      console.log(unit.communityConnections || 'Not provided');
      console.log('\n');
    }

    return unitPlans;

  } catch (error) {
    console.error('❌ Error getting French unit details:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { getFrenchUnitDetails };

// Run if called directly
if (require.main === module) {
  getFrenchUnitDetails()
    .then(() => {
      console.log('🎉 French unit details retrieved successfully!');
    })
    .catch((error) => {
      console.error('💥 Failed to get unit details:', error);
      process.exit(1);
    });
}