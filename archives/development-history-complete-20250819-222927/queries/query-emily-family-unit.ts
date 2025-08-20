#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyFamilyUnit() {
  console.log('🔍 Searching for Emily\'s "Ma famille et moi" unit...\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get French Long Range Plan
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: { contains: 'Français' }
      }
    });

    if (!frenchLRP) {
      console.log('❌ No French Long Range Plan found');
      return;
    }

    console.log(`📋 Found French LRP: "${frenchLRP.title}"\n`);

    // Get all Unit Plans for this LRP
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: frenchLRP.id,
        userId: emily.id
      },
      orderBy: { startDate: 'asc' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          orderBy: { date: 'asc' }
        }
      }
    });

    console.log(`📚 Found ${unitPlans.length} French Unit Plans:\n`);
    
    let familyUnit = null;
    
    unitPlans.forEach((unit, index) => {
      const isFamilyUnit = unit.title.toLowerCase().includes('famille') || 
                          unit.title.toLowerCase().includes('family');
      
      console.log(`${index + 1}. "${unit.title}"`);
      console.log(`   Start: ${unit.startDate?.toISOString().split('T')[0]}`);
      console.log(`   End: ${unit.endDate?.toISOString().split('T')[0]}`);
      console.log(`   Lessons: ${unit.lessonPlans.length}`);
      console.log(`   Expectations: ${unit.expectations.length}`);
      
      if (isFamilyUnit) {
        console.log('   🎯 FAMILY UNIT FOUND!');
        familyUnit = unit;
      }
      console.log('');
    });

    if (familyUnit) {
      console.log('\n🎯 ANALYZING "MA FAMILLE ET MOI" UNIT:');
      console.log(`Title: ${familyUnit.title}`);
      console.log(`Period: ${familyUnit.startDate?.toISOString().split('T')[0]} to ${familyUnit.endDate?.toISOString().split('T')[0]}`);
      console.log(`Description: ${familyUnit.description || 'N/A'}`);
      console.log(`Big Ideas: ${familyUnit.bigIdeas || 'N/A'}`);
      
      if (familyUnit.essentialQuestions) {
        console.log('\n📝 Essential Questions:');
        const questions = Array.isArray(familyUnit.essentialQuestions) ? 
          familyUnit.essentialQuestions : [familyUnit.essentialQuestions];
        questions.forEach((q, i) => console.log(`${i + 1}. ${q}`));
      }
      
      if (familyUnit.keyVocabulary) {
        console.log('\n🔤 Key Vocabulary:');
        const vocab = Array.isArray(familyUnit.keyVocabulary) ? 
          familyUnit.keyVocabulary : [familyUnit.keyVocabulary];
        vocab.forEach((v, i) => console.log(`${i + 1}. ${v}`));
      }
      
      console.log(`\n🎯 Culminating Task: ${familyUnit.culminatingTask || 'N/A'}`);
      console.log(`📊 Assessment Plan: ${familyUnit.assessmentPlan || 'N/A'}`);
      
      if (familyUnit.differentiationStrategies) {
        console.log('\n🎯 Differentiation Strategies:');
        const strategies = Array.isArray(familyUnit.differentiationStrategies) ? 
          familyUnit.differentiationStrategies : [familyUnit.differentiationStrategies];
        strategies.forEach((s, i) => console.log(`${i + 1}. ${s}`));
      }
      
      console.log(`\n👨‍👩‍👧‍👦 Parent Communication: ${familyUnit.parentCommunicationPlan || 'N/A'}`);
      
      // Show lesson plans
      if (familyUnit.lessonPlans.length > 0) {
        console.log(`\n📅 LESSON PLANS (${familyUnit.lessonPlans.length} total):`);
        familyUnit.lessonPlans.forEach((lesson, i) => {
          console.log(`${i + 1}. ${lesson.title} - ${lesson.date.toISOString().split('T')[0]} (${lesson.duration}min)`);
        });
      }
      
      // Show curriculum expectations
      if (familyUnit.expectations.length > 0) {
        console.log(`\n📋 CURRICULUM EXPECTATIONS (${familyUnit.expectations.length} total):`);
        familyUnit.expectations.forEach((exp, i) => {
          const expectation = exp.expectation;
          console.log(`${i + 1}. ${expectation.code}: ${expectation.description}`);
        });
      }
    } else {
      console.log('\n❌ Family unit not found. Available units:');
      unitPlans.forEach((unit, i) => console.log(`${i + 1}. "${unit.title}"`));
    }

  } catch (error) {
    console.error('❌ Error querying family unit:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyFamilyUnit()
  .then(() => console.log('\n🎉 Query completed successfully!'))
  .catch((error) => {
    console.error('💥 Query failed:', error);
    process.exit(1);
  });