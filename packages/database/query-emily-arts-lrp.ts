#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyArtsLRP() {
  try {
    console.log('🎨 EMILY ARTS VISUELS LONG RANGE PLAN - CRITICAL REVIEW QUERY...\n');
    
    // Query Emily's Arts visuels Long Range Plan
    const artsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23, // Emily McIsaac
        subject: 'Arts visuels'
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        unitPlans: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            description: true,
            bigIdeas: true,
            essentialQuestions: true,
            assessmentPlan: true,
            culminatingTask: true,
            keyVocabulary: true,
            priorKnowledge: true,
            differentiationStrategies: true
          }
        }
      }
    });

    if (!artsLRP) {
      console.log('❌ No Arts visuels Long Range Plan found for Emily McIsaac');
      return;
    }

    console.log('🎨 EMILY MCISAAC - ARTS VISUELS LONG RANGE PLAN');
    console.log('='.repeat(60));
    
    console.log('\n📋 BASIC INFORMATION:');
    console.log(`📚 Title: ${artsLRP.title}`);
    console.log(`📝 Subject: ${artsLRP.subject}`);
    console.log(`🎓 Grade: ${artsLRP.grade}`);
    console.log(`📅 Academic Year: ${artsLRP.academicYear}`);
    console.log(`📆 Term: ${artsLRP.term || 'Full Year'}`);
    
    console.log('\n🎯 GOALS & OBJECTIVES:');
    console.log(`Goals: ${artsLRP.goals || 'Not specified'}`);
    
    console.log('\n❓ ESSENTIAL QUESTIONS:');
    console.log(`Overarching Questions: ${artsLRP.overarchingQuestions || 'Not specified'}`);
    if (artsLRP.yearlyEssentialQuestions) {
      console.log('Yearly Essential Questions:', JSON.stringify(artsLRP.yearlyEssentialQuestions, null, 2));
    }
    
    console.log('\n📊 ASSESSMENT FRAMEWORK:');
    console.log(`Assessment Overview: ${artsLRP.assessmentOverview || 'Not specified'}`);
    console.log(`Assessment Strategy: ${artsLRP.assessmentStrategy || 'Not specified'}`);
    if (artsLRP.formativeStrategies) {
      console.log('Formative Strategies:', JSON.stringify(artsLRP.formativeStrategies, null, 2));
    }
    if (artsLRP.summativeMilestones) {
      console.log('Summative Milestones:', JSON.stringify(artsLRP.summativeMilestones, null, 2));
    }
    
    console.log('\n🔄 DIFFERENTIATION:');
    console.log(`Differentiation Framework: ${artsLRP.differentiationFramework || 'Not specified'}`);
    
    console.log('\n🌍 CULTURAL RESPONSIVENESS:');
    console.log(`Indigenous Perspectives: ${artsLRP.indigenousPerspectives || 'Not specified'}`);
    if (artsLRP.culturalCelebrationIntegration) {
      console.log('Cultural Celebration Integration:', JSON.stringify(artsLRP.culturalCelebrationIntegration, null, 2));
    }
    
    console.log('\n📚 RESOURCES & IMPLEMENTATION:');
    console.log(`Resource Needs: ${artsLRP.resourceNeeds || 'Not specified'}`);
    console.log(`Implementation Feasibility Score: ${artsLRP.implementationFeasibility || 'Not scored'}`);
    
    console.log('\n👨‍🏫 PROFESSIONAL DEVELOPMENT:');
    console.log(`Professional Goals: ${artsLRP.professionalGoals || 'Not specified'}`);
    if (artsLRP.professionalDevelopmentPlan) {
      console.log('Professional Development Plan:', JSON.stringify(artsLRP.professionalDevelopmentPlan, null, 2));
    }
    
    console.log('\n👨‍👩‍👧‍👦 FAMILY & COMMUNITY:');
    if (artsLRP.familyEngagementPlan) {
      console.log('Family Engagement Plan:', JSON.stringify(artsLRP.familyEngagementPlan, null, 2));
    }
    console.log(`Parent Communication: ${artsLRP.parentCommunication || 'Not specified'}`);
    
    console.log('\n🔗 CROSS-CURRICULAR CONNECTIONS:');
    if (artsLRP.crossCurricularConnections) {
      console.log('Cross-Curricular Connections:', JSON.stringify(artsLRP.crossCurricularConnections, null, 2));
    }
    
    console.log(`\n📚 CURRICULUM EXPECTATIONS (${artsLRP.expectations.length}):`);
    artsLRP.expectations.forEach((exp, idx) => {
      console.log(`${idx + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
    });
    
    console.log(`\n📖 UNIT PLANS OVERVIEW (${artsLRP.unitPlans.length} units):`);
    artsLRP.unitPlans.forEach((unit, idx) => {
      console.log(`\n${idx + 1}. 📚 ${unit.title}`);
      console.log(`   📅 ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
      console.log(`   💡 Big Ideas: ${unit.bigIdeas || 'Not specified'}`);
      console.log(`   ❓ Essential Questions: ${unit.essentialQuestions || 'Not specified'}`);
      console.log(`   📊 Assessment: ${unit.assessmentPlan || 'Not specified'}`);
      console.log(`   🏆 Culminating Task: ${unit.culminatingTask || 'Not specified'}`);
      console.log(`   📝 Key Vocabulary: ${unit.keyVocabulary || 'Not specified'}`);
      if (unit.differentiationStrategies) {
        console.log(`   🔄 Differentiation: ${JSON.stringify(unit.differentiationStrategies)}`);
      }
    });
    
    console.log('\n✅ Query completed successfully');

  } catch (error) {
    console.error('❌ Error querying Arts visuels LRP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyArtsLRP();