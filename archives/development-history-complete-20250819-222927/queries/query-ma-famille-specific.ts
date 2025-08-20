#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryMaFamilleUnit() {
  console.log('🎯 Analyzing Emily\'s specific "Ma famille et moi" unit...\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    // Get the specific "Ma famille et moi" unit (Sept 19-Oct 3)
    const familyUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: { contains: 'Ma famille et moi' },
        startDate: {
          gte: new Date('2025-09-15'),  // Around Sept 19
          lte: new Date('2025-09-25')   // Around Sept 19
        }
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          orderBy: { date: 'asc' }
        },
        longRangePlan: true
      }
    });

    if (!familyUnit) {
      console.log('❌ "Ma famille et moi" unit not found');
      return;
    }

    console.log('🎯 EMILY\'S "MA FAMILLE ET MOI" UNIT ANALYSIS');
    console.log('===============================================\n');
    
    console.log(`📅 UNIT OVERVIEW:`);
    console.log(`Title: ${familyUnit.title}`);
    console.log(`Period: ${familyUnit.startDate?.toISOString().split('T')[0]} to ${familyUnit.endDate?.toISOString().split('T')[0]}`);
    console.log(`Duration: 2 weeks (September 19 - October 3, 2025)`);
    console.log(`Total Lessons: ${familyUnit.lessonPlans.length}`);
    console.log(`Connected Expectations: ${familyUnit.expectations.length}`);
    console.log(`Subject Context: ${familyUnit.longRangePlan.subject}\n`);

    console.log(`📖 DESCRIPTION:`);
    console.log(`${familyUnit.description || 'No description available'}\n`);

    console.log(`💡 BIG IDEAS:`);
    console.log(`${familyUnit.bigIdeas || 'No big ideas defined'}\n`);

    console.log(`❓ ESSENTIAL QUESTIONS:`);
    if (familyUnit.essentialQuestions) {
      const questions = Array.isArray(familyUnit.essentialQuestions) ? 
        familyUnit.essentialQuestions : [familyUnit.essentialQuestions];
      questions.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    } else {
      console.log('No essential questions defined');
    }
    console.log('');

    console.log(`📚 KEY VOCABULARY:`);
    if (familyUnit.keyVocabulary) {
      const vocab = Array.isArray(familyUnit.keyVocabulary) ? 
        familyUnit.keyVocabulary : [familyUnit.keyVocabulary];
      vocab.forEach((v, i) => console.log(`${i + 1}. ${v}`));
    } else {
      console.log('No vocabulary defined');
    }
    console.log('');

    console.log(`🎯 CULMINATING TASK:`);
    console.log(`${familyUnit.culminatingTask || 'No culminating task defined'}\n`);

    console.log(`📊 ASSESSMENT PLAN:`);
    console.log(`${familyUnit.assessmentPlan || 'No assessment plan defined'}\n`);

    console.log(`🎨 DIFFERENTIATION STRATEGIES:`);
    if (familyUnit.differentiationStrategies) {
      const strategies = Array.isArray(familyUnit.differentiationStrategies) ? 
        familyUnit.differentiationStrategies : [familyUnit.differentiationStrategies];
      strategies.forEach((s, i) => console.log(`${i + 1}. ${s}`));
    } else {
      console.log('No differentiation strategies defined');
    }
    console.log('');

    console.log(`👨‍👩‍👧‍👦 PARENT COMMUNICATION PLAN:`);
    console.log(`${familyUnit.parentCommunicationPlan || 'No parent communication plan defined'}\n`);

    console.log(`🔗 COMMUNITY CONNECTIONS:`);
    console.log(`${familyUnit.communityConnections || 'No community connections defined'}\n`);

    console.log(`🏛️ INDIGENOUS PERSPECTIVES:`);
    console.log(`${familyUnit.indigenousPerspectives || 'No indigenous perspectives defined'}\n`);

    // Show lesson plans overview
    console.log(`📅 LESSON PLANS OVERVIEW (${familyUnit.lessonPlans.length} total):`);
    if (familyUnit.lessonPlans.length > 0) {
      familyUnit.lessonPlans.forEach((lesson, i) => {
        console.log(`${i + 1}. ${lesson.title}`);
        console.log(`   Date: ${lesson.date.toISOString().split('T')[0]}`);
        console.log(`   Duration: ${lesson.duration} minutes`);
      });
    } else {
      console.log('No lesson plans found');
    }
    console.log('');

    // Show curriculum expectations
    console.log(`📋 CURRICULUM EXPECTATIONS (${familyUnit.expectations.length} total):`);
    if (familyUnit.expectations.length > 0) {
      familyUnit.expectations.forEach((exp, i) => {
        const expectation = exp.expectation;
        console.log(`${i + 1}. CODE: ${expectation.code}`);
        console.log(`   DESCRIPTION: ${expectation.description}`);
        console.log(`   STRAND: ${expectation.strand}`);
        if (expectation.substrand) {
          console.log(`   SUBSTRAND: ${expectation.substrand}`);
        }
        console.log('');
      });
    } else {
      console.log('No curriculum expectations found');
    }

    // Analysis for perfection needs
    console.log('\n🔍 PERFECTION ANALYSIS NEEDED:');
    console.log('=====================================\n');
    
    console.log('✅ STRENGTHS IDENTIFIED:');
    if (familyUnit.assessmentPlan) console.log('• Has assessment plan');
    if (familyUnit.culminatingTask) console.log('• Has culminating task');
    if (familyUnit.bigIdeas) console.log('• Has big ideas');
    if (familyUnit.essentialQuestions) console.log('• Has essential questions');
    
    console.log('\n🎯 AREAS NEEDING ETFO PERFECTION:');
    if (!familyUnit.keyVocabulary || (Array.isArray(familyUnit.keyVocabulary) && familyUnit.keyVocabulary.length < 12)) {
      console.log('• Vocabulary needs enhancement (should have 12-15 family words)');
    }
    if (!familyUnit.differentiationStrategies) {
      console.log('• Differentiation strategies need to be added');
    }
    if (!familyUnit.parentCommunicationPlan) {
      console.log('• Parent communication plan needs to be developed');
    }
    if (!familyUnit.communityConnections) {
      console.log('• Community connections need to be added');
    }
    if (!familyUnit.indigenousPerspectives) {
      console.log('• Indigenous perspectives need to be integrated');
    }

    console.log('\n🌟 UNIT READY FOR MANUAL PERFECTION!');
    
  } catch (error) {
    console.error('❌ Error analyzing Ma famille unit:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

queryMaFamilleUnit()
  .then(() => console.log('\n🎉 Analysis completed successfully!'))
  .catch((error) => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });