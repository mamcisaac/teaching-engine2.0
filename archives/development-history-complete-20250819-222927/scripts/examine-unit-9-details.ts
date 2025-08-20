#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function examineUnit9Details() {
  console.log('🔍 Examining Unit 9 "Nouvelle année" in Detail...\n');
  
  try {
    // Get Unit 9 with full details
    const unit9 = await prisma.unitPlan.findUnique({
      where: {
        id: 'cmeh61upp000hvjjpf5lq0lo6'
      },
      include: {
        longRangePlan: {
          select: {
            id: true,
            title: true,
            subject: true,
            grade: true
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            title: true,
            date: true,
            duration: true,
            learningGoals: true,
            mindsOn: true,
            action: true,
            consolidation: true
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!unit9) {
      console.log('❌ Unit 9 not found');
      return;
    }

    console.log(`📋 UNIT 9 COMPLETE DETAILS:`);
    console.log(`Title: "${unit9.title}"`);
    console.log(`Description: "${unit9.description}"`);
    console.log(`Period: ${unit9.startDate.toISOString().split('T')[0]} to ${unit9.endDate.toISOString().split('T')[0]}`);
    console.log(`Grade: ${unit9.longRangePlan.grade}`);
    console.log(`Subject: ${unit9.longRangePlan.subject}\n`);

    console.log(`📝 CURRENT CONTENT:`);
    console.log(`Big Ideas: "${unit9.bigIdeas}"`);
    console.log(`Essential Questions: ${JSON.stringify(unit9.essentialQuestions, null, 2)}`);
    console.log(`Key Vocabulary: ${JSON.stringify(unit9.keyVocabulary, null, 2)}`);
    console.log(`Differentiation Strategies: ${JSON.stringify(unit9.differentiationStrategies, null, 2)}`);
    console.log(`Culminating Task: "${unit9.culminatingTask}"`);
    console.log(`Assessment Plan: "${unit9.assessmentPlan}"`);
    console.log(`Parent Communication: "${unit9.parentCommunication}"`);
    console.log(`Community Connections: "${unit9.communityConnections}"`);
    console.log(`Indigenous Perspectives: "${unit9.indigenousPerspectives}"`);

    console.log(`\n📚 CURRICULUM EXPECTATIONS (${unit9.expectations.length}):`);
    unit9.expectations.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
    });

    console.log(`\n📖 LESSON PLANS (${unit9.lessonPlans.length}):`);
    unit9.lessonPlans.forEach((lesson, index) => {
      console.log(`\n${index + 1}. "${lesson.title}"`);
      console.log(`   Date: ${lesson.date?.toISOString().split('T')[0] || 'No date'}`);
      console.log(`   Duration: ${lesson.duration} minutes`);
      console.log(`   Learning Goals: ${lesson.learningGoals?.length || 0} chars`);
      console.log(`   Minds On: ${lesson.mindsOn?.length || 0} chars`);
      console.log(`   Action: ${lesson.action?.length || 0} chars`);
      console.log(`   Consolidation: ${lesson.consolidation?.length || 0} chars`);
    });

    return unit9;

  } catch (error) {
    console.error('❌ Error examining Unit 9:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  examineUnit9Details()
    .then((result) => {
      console.log('\n🎉 Unit 9 examination completed!');
    })
    .catch((error) => {
      console.error('💥 Examination failed:', error);
      process.exit(1);
    });
}