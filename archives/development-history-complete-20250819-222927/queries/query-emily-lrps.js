const { PrismaClient } = require('@prisma/client');

async function queryEmilyLRPs() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./packages/database/dev.db'
      }
    }
  });

  try {
    console.log('Querying Long Range Plans for Emily McIsaac (User ID: 23)...\n');
    
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: {
        userId: 23
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
            endDate: true
          }
        }
      },
      orderBy: {
        subject: 'asc'
      }
    });

    console.log(`Found ${longRangePlans.length} Long Range Plans for Emily McIsaac\n`);
    
    if (longRangePlans.length === 0) {
      console.log('No Long Range Plans found for User ID 23');
      return;
    }

    // Display summary first
    console.log('=== SUMMARY OF EMILY\'S LONG RANGE PLANS ===');
    longRangePlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.subject} - "${plan.title}"`);
      console.log(`   Grade: ${plan.grade}, Academic Year: ${plan.academicYear}`);
      console.log(`   Unit Plans: ${plan.unitPlans.length}`);
      console.log(`   Curriculum Expectations: ${plan.expectations.length}`);
      console.log(`   Created: ${plan.createdAt.toLocaleDateString()}`);
      console.log(`   Last Updated: ${plan.updatedAt.toLocaleDateString()}\n`);
    });

    // Now display detailed information for each plan
    console.log('\n=== DETAILED PLAN ANALYSIS ===\n');
    
    for (let i = 0; i < longRangePlans.length; i++) {
      const plan = longRangePlans[i];
      console.log(`\n${'='.repeat(80)}`);
      console.log(`LONG RANGE PLAN ${i + 1}: ${plan.subject.toUpperCase()}`);
      console.log(`${'='.repeat(80)}`);
      
      console.log(`\n📋 BASIC INFORMATION:`);
      console.log(`Title: ${plan.title}`);
      console.log(`Title (French): ${plan.titleFr || 'Not provided'}`);
      console.log(`Subject: ${plan.subject}`);
      console.log(`Grade: ${plan.grade}`);
      console.log(`Academic Year: ${plan.academicYear}`);
      console.log(`Term: ${plan.term || 'Not specified'}`);
      
      console.log(`\n📝 DESCRIPTIONS:`);
      console.log(`Description (English): ${plan.description || 'Not provided'}`);
      console.log(`Description (French): ${plan.descriptionFr || 'Not provided'}`);
      
      console.log(`\n🎯 GOALS & OBJECTIVES:`);
      console.log(`Goals (English): ${plan.goals || 'Not provided'}`);
      console.log(`Goals (French): ${plan.goalsFr || 'Not provided'}`);
      
      console.log(`\n❓ ESSENTIAL QUESTIONS:`);
      console.log(`Overarching Questions: ${plan.overarchingQuestions || 'Not provided'}`);
      console.log(`Yearly Essential Questions: ${plan.yearlyEssentialQuestions ? JSON.stringify(plan.yearlyEssentialQuestions, null, 2) : 'Not provided'}`);
      
      console.log(`\n📊 ASSESSMENT FRAMEWORK:`);
      console.log(`Assessment Overview: ${plan.assessmentOverview || 'Not provided'}`);
      console.log(`Assessment Strategy: ${plan.assessmentStrategy || 'Not provided'}`);
      console.log(`Formative Strategies: ${plan.formativeStrategies ? JSON.stringify(plan.formativeStrategies, null, 2) : 'Not provided'}`);
      console.log(`Summative Milestones: ${plan.summativeMilestones ? JSON.stringify(plan.summativeMilestones, null, 2) : 'Not provided'}`);
      
      console.log(`\n🔄 DIFFERENTIATION:`);
      console.log(`Differentiation Framework: ${plan.differentiationFramework || 'Not provided'}`);
      console.log(`Differentiation Plans: ${plan.differentiationPlans || 'Not provided'}`);
      
      console.log(`\n🌍 CULTURAL RESPONSIVENESS:`);
      console.log(`Cultural Celebration Integration: ${plan.culturalCelebrationIntegration ? JSON.stringify(plan.culturalCelebrationIntegration, null, 2) : 'Not provided'}`);
      console.log(`Indigenous Perspectives: ${plan.indigenousPerspectives || 'Not provided'}`);
      
      console.log(`\n📚 RESOURCES & IMPLEMENTATION:`);
      console.log(`Resource Needs: ${plan.resourceNeeds || 'Not provided'}`);
      console.log(`Resource Library: ${plan.resourceLibrary || 'Not provided'}`);
      console.log(`Implementation Feasibility Score: ${plan.implementationFeasibility || 'Not scored'}`);
      
      console.log(`\n👨‍🏫 PROFESSIONAL DEVELOPMENT:`);
      console.log(`Professional Goals: ${plan.professionalGoals || 'Not provided'}`);
      console.log(`Professional Development Plan: ${plan.professionalDevelopmentPlan ? JSON.stringify(plan.professionalDevelopmentPlan, null, 2) : 'Not provided'}`);
      
      console.log(`\n👨‍👩‍👧‍👦 FAMILY & COMMUNITY:`);
      console.log(`Family Engagement Plan: ${plan.familyEngagementPlan ? JSON.stringify(plan.familyEngagementPlan, null, 2) : 'Not provided'}`);
      console.log(`Parent Communication: ${plan.parentCommunication || 'Not provided'}`);
      
      console.log(`\n🔗 CROSS-CURRICULAR CONNECTIONS:`);
      console.log(`Cross-Curricular Connections: ${plan.crossCurricularConnections ? JSON.stringify(plan.crossCurricularConnections, null, 2) : 'Not provided'}`);
      console.log(`Thematic Connections: ${plan.thematicConnections ? JSON.stringify(plan.thematicConnections, null, 2) : 'Not provided'}`);
      
      console.log(`\n📈 QUALITY METRICS:`);
      console.log(`Optimization Score: ${plan.optimizationScore || 'Not scored'}`);
      console.log(`Pedagogical Certification: ${plan.pedagogicalCertification || 'Not certified'}`);
      console.log(`Research Compliance Score: ${plan.researchComplianceScore || 'Not scored'}`);
      console.log(`Last Optimized: ${plan.lastOptimized ? plan.lastOptimized.toLocaleDateString() : 'Never'}`);
      
      console.log(`\n📚 CURRICULUM EXPECTATIONS (${plan.expectations.length}):`);
      if (plan.expectations.length > 0) {
        plan.expectations.forEach((exp, idx) => {
          console.log(`${idx + 1}. ${exp.expectation.code}: ${exp.expectation.description.substring(0, 100)}...`);
          if (exp.plannedTerm) {
            console.log(`   Planned for: ${exp.plannedTerm}`);
          }
        });
      } else {
        console.log('No curriculum expectations linked');
      }
      
      console.log(`\n📖 UNIT PLANS (${plan.unitPlans.length}):`);
      if (plan.unitPlans.length > 0) {
        plan.unitPlans.forEach((unit, idx) => {
          console.log(`${idx + 1}. ${unit.title}`);
          console.log(`   Period: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
        });
      } else {
        console.log('No unit plans created yet');
      }
      
      console.log(`\n⏰ TIMESTAMPS:`);
      console.log(`Created: ${plan.createdAt}`);
      console.log(`Last Updated: ${plan.updatedAt}`);
      console.log(`Start Date: ${plan.startDate || 'Not set'}`);
      console.log(`End Date: ${plan.endDate || 'Not set'}`);
    }

  } catch (error) {
    console.error('Error querying Long Range Plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyLRPs();