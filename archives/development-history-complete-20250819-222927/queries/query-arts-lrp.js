const { PrismaClient } = require('@prisma/client');

async function queryArtsLRP() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/teaching-engine.db'
      }
    }
  });

  try {
    console.log('Querying Arts visuels Long Range Plan for Emily McIsaac (User ID: 23)...\n');
    
    const artsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23,
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
            differentiationStrategies: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!artsLRP) {
      console.log('No Arts visuels Long Range Plan found for Emily McIsaac (User ID: 23)');
      return;
    }

    console.log('=== ARTS VISUELS LONG RANGE PLAN FOR EMILY MCISAAC ===\n');
    
    console.log('📋 BASIC INFORMATION:');
    console.log(`Title: ${artsLRP.title}`);
    console.log(`Title (French): ${artsLRP.titleFr || 'Not provided'}`);
    console.log(`Subject: ${artsLRP.subject}`);
    console.log(`Grade: ${artsLRP.grade}`);
    console.log(`Academic Year: ${artsLRP.academicYear}`);
    console.log(`Term: ${artsLRP.term || 'Not specified'}`);
    
    console.log('\n📝 DESCRIPTIONS:');
    console.log(`Description (English): ${artsLRP.description || 'Not provided'}`);
    console.log(`Description (French): ${artsLRP.descriptionFr || 'Not provided'}`);
    
    console.log('\n🎯 GOALS & OBJECTIVES:');
    console.log(`Goals (English): ${artsLRP.goals || 'Not provided'}`);
    console.log(`Goals (French): ${artsLRP.goalsFr || 'Not provided'}`);
    
    console.log('\n❓ ESSENTIAL QUESTIONS:');
    console.log(`Overarching Questions: ${artsLRP.overarchingQuestions || 'Not provided'}`);
    console.log(`Yearly Essential Questions: ${artsLRP.yearlyEssentialQuestions ? JSON.stringify(artsLRP.yearlyEssentialQuestions, null, 2) : 'Not provided'}`);
    
    console.log('\n📊 ASSESSMENT FRAMEWORK:');
    console.log(`Assessment Overview: ${artsLRP.assessmentOverview || 'Not provided'}`);
    console.log(`Assessment Strategy: ${artsLRP.assessmentStrategy || 'Not provided'}`);
    console.log(`Formative Strategies: ${artsLRP.formativeStrategies ? JSON.stringify(artsLRP.formativeStrategies, null, 2) : 'Not provided'}`);
    console.log(`Summative Milestones: ${artsLRP.summativeMilestones ? JSON.stringify(artsLRP.summativeMilestones, null, 2) : 'Not provided'}`);
    
    console.log('\n🔄 DIFFERENTIATION:');
    console.log(`Differentiation Framework: ${artsLRP.differentiationFramework || 'Not provided'}`);
    console.log(`Differentiation Plans: ${artsLRP.differentiationPlans || 'Not provided'}`);
    
    console.log('\n🌍 CULTURAL RESPONSIVENESS:');
    console.log(`Cultural Celebration Integration: ${artsLRP.culturalCelebrationIntegration ? JSON.stringify(artsLRP.culturalCelebrationIntegration, null, 2) : 'Not provided'}`);
    console.log(`Indigenous Perspectives: ${artsLRP.indigenousPerspectives || 'Not provided'}`);
    
    console.log('\n📚 RESOURCES & IMPLEMENTATION:');
    console.log(`Resource Needs: ${artsLRP.resourceNeeds || 'Not provided'}`);
    console.log(`Resource Library: ${artsLRP.resourceLibrary || 'Not provided'}`);
    console.log(`Implementation Feasibility Score: ${artsLRP.implementationFeasibility || 'Not scored'}`);
    
    console.log('\n👨‍🏫 PROFESSIONAL DEVELOPMENT:');
    console.log(`Professional Goals: ${artsLRP.professionalGoals || 'Not provided'}`);
    console.log(`Professional Development Plan: ${artsLRP.professionalDevelopmentPlan ? JSON.stringify(artsLRP.professionalDevelopmentPlan, null, 2) : 'Not provided'}`);
    
    console.log('\n👨‍👩‍👧‍👦 FAMILY & COMMUNITY:');
    console.log(`Family Engagement Plan: ${artsLRP.familyEngagementPlan ? JSON.stringify(artsLRP.familyEngagementPlan, null, 2) : 'Not provided'}`);
    console.log(`Parent Communication: ${artsLRP.parentCommunication || 'Not provided'}`);
    
    console.log('\n🔗 CROSS-CURRICULAR CONNECTIONS:');
    console.log(`Cross-Curricular Connections: ${artsLRP.crossCurricularConnections ? JSON.stringify(artsLRP.crossCurricularConnections, null, 2) : 'Not provided'}`);
    console.log(`Thematic Connections: ${artsLRP.thematicConnections ? JSON.stringify(artsLRP.thematicConnections, null, 2) : 'Not provided'}`);
    
    console.log('\n📈 QUALITY METRICS:');
    console.log(`Optimization Score: ${artsLRP.optimizationScore || 'Not scored'}`);
    console.log(`Pedagogical Certification: ${artsLRP.pedagogicalCertification || 'Not certified'}`);
    console.log(`Research Compliance Score: ${artsLRP.researchComplianceScore || 'Not scored'}`);
    console.log(`Last Optimized: ${artsLRP.lastOptimized ? artsLRP.lastOptimized.toLocaleDateString() : 'Never'}`);
    
    console.log(`\n📚 CURRICULUM EXPECTATIONS (${artsLRP.expectations.length}):`);
    if (artsLRP.expectations.length > 0) {
      artsLRP.expectations.forEach((exp, idx) => {
        console.log(`${idx + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
        if (exp.plannedTerm) {
          console.log(`   Planned for: ${exp.plannedTerm}`);
        }
      });
    } else {
      console.log('No curriculum expectations linked');
    }
    
    console.log(`\n📖 UNIT PLANS (${artsLRP.unitPlans.length}):`);
    if (artsLRP.unitPlans.length > 0) {
      artsLRP.unitPlans.forEach((unit, idx) => {
        console.log(`\n${idx + 1}. ${unit.title}`);
        console.log(`   Period: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
        console.log(`   Description: ${unit.description ? unit.description.substring(0, 200) + '...' : 'Not provided'}`);
        console.log(`   Big Ideas: ${unit.bigIdeas ? unit.bigIdeas.substring(0, 200) + '...' : 'Not provided'}`);
        console.log(`   Essential Questions: ${unit.essentialQuestions ? unit.essentialQuestions.substring(0, 200) + '...' : 'Not provided'}`);
        if (unit.assessmentPlan) {
          console.log(`   Assessment Plan: ${unit.assessmentPlan.substring(0, 100)}...`);
        }
        if (unit.culminatingTask) {
          console.log(`   Culminating Task: ${unit.culminatingTask.substring(0, 100)}...`);
        }
        if (unit.keyVocabulary) {
          console.log(`   Key Vocabulary: ${unit.keyVocabulary.substring(0, 100)}...`);
        }
        if (unit.differentiationStrategies) {
          console.log(`   Differentiation: ${JSON.stringify(unit.differentiationStrategies).substring(0, 100)}...`);
        }
      });
    } else {
      console.log('No unit plans created yet');
    }
    
    console.log('\n⏰ TIMESTAMPS:');
    console.log(`Created: ${artsLRP.createdAt}`);
    console.log(`Last Updated: ${artsLRP.updatedAt}`);
    console.log(`Start Date: ${artsLRP.startDate || 'Not set'}`);
    console.log(`End Date: ${artsLRP.endDate || 'Not set'}`);

  } catch (error) {
    console.error('Error querying Arts visuels LRP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryArtsLRP();