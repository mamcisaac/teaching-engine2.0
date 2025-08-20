const { PrismaClient } = require('@prisma/client');

async function queryEmilyFPSLRP() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./packages/database/dev.db'
      }
    }
  });

  try {
    console.log('Querying Formation personnelle et sociale Long Range Plan for Emily McIsaac (User ID: 23)...\n');
    
    const fpsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23,
        subject: 'Formation personnelle et sociale'
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
            lessonPlans: {
              select: {
                id: true,
                title: true,
                date: true,
                duration: true
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    });

    if (!fpsLRP) {
      console.log('❌ No Formation personnelle et sociale Long Range Plan found for User ID 23');
      return;
    }

    console.log('✅ Found Formation personnelle et sociale Long Range Plan!\n');
    console.log('🎯 FORMATION PERSONNELLE ET SOCIALE - LONG RANGE PLAN ANALYSIS');
    console.log('='.repeat(80));
    
    console.log(`\n📋 BASIC INFORMATION:`);
    console.log(`Title: ${fpsLRP.title}`);
    console.log(`Title (French): ${fpsLRP.titleFr || 'Not provided'}`);
    console.log(`Subject: ${fpsLRP.subject}`);
    console.log(`Grade: ${fpsLRP.grade}`);
    console.log(`Academic Year: ${fpsLRP.academicYear}`);
    console.log(`Term: ${fpsLRP.term || 'Not specified'}`);
    
    console.log(`\n📝 DESCRIPTIONS:`);
    console.log(`Description (English): ${fpsLRP.description || 'Not provided'}`);
    console.log(`Description (French): ${fpsLRP.descriptionFr || 'Not provided'}`);
    
    console.log(`\n🎯 GOALS & OBJECTIVES:`);
    console.log(`Goals (English): ${fpsLRP.goals || 'Not provided'}`);
    console.log(`Goals (French): ${fpsLRP.goalsFr || 'Not provided'}`);
    
    console.log(`\n❓ ESSENTIAL QUESTIONS:`);
    console.log(`Overarching Questions: ${fpsLRP.overarchingQuestions || 'Not provided'}`);
    if (fpsLRP.yearlyEssentialQuestions) {
      console.log(`Yearly Essential Questions:`);
      console.log(JSON.stringify(fpsLRP.yearlyEssentialQuestions, null, 2));
    } else {
      console.log(`Yearly Essential Questions: Not provided`);
    }
    
    console.log(`\n📊 ASSESSMENT FRAMEWORK:`);
    console.log(`Assessment Overview: ${fpsLRP.assessmentOverview || 'Not provided'}`);
    console.log(`Assessment Strategy: ${fpsLRP.assessmentStrategy || 'Not provided'}`);
    if (fpsLRP.formativeStrategies) {
      console.log(`Formative Strategies:`);
      console.log(JSON.stringify(fpsLRP.formativeStrategies, null, 2));
    } else {
      console.log(`Formative Strategies: Not provided`);
    }
    if (fpsLRP.summativeMilestones) {
      console.log(`Summative Milestones:`);
      console.log(JSON.stringify(fpsLRP.summativeMilestones, null, 2));
    } else {
      console.log(`Summative Milestones: Not provided`);
    }
    
    console.log(`\n🔄 DIFFERENTIATION:`);
    console.log(`Differentiation Framework: ${fpsLRP.differentiationFramework || 'Not provided'}`);
    console.log(`Differentiation Plans: ${fpsLRP.differentiationPlans || 'Not provided'}`);
    
    console.log(`\n🌍 CULTURAL RESPONSIVENESS:`);
    if (fpsLRP.culturalCelebrationIntegration) {
      console.log(`Cultural Celebration Integration:`);
      console.log(JSON.stringify(fpsLRP.culturalCelebrationIntegration, null, 2));
    } else {
      console.log(`Cultural Celebration Integration: Not provided`);
    }
    console.log(`Indigenous Perspectives: ${fpsLRP.indigenousPerspectives || 'Not provided'}`);
    
    console.log(`\n📚 RESOURCES & IMPLEMENTATION:`);
    console.log(`Resource Needs: ${fpsLRP.resourceNeeds || 'Not provided'}`);
    console.log(`Resource Library: ${fpsLRP.resourceLibrary || 'Not provided'}`);
    console.log(`Implementation Feasibility Score: ${fpsLRP.implementationFeasibility || 'Not scored'}`);
    
    console.log(`\n👨‍🏫 PROFESSIONAL DEVELOPMENT:`);
    console.log(`Professional Goals: ${fpsLRP.professionalGoals || 'Not provided'}`);
    if (fpsLRP.professionalDevelopmentPlan) {
      console.log(`Professional Development Plan:`);
      console.log(JSON.stringify(fpsLRP.professionalDevelopmentPlan, null, 2));
    } else {
      console.log(`Professional Development Plan: Not provided`);
    }
    
    console.log(`\n👨‍👩‍👧‍👦 FAMILY & COMMUNITY:`);
    if (fpsLRP.familyEngagementPlan) {
      console.log(`Family Engagement Plan:`);
      console.log(JSON.stringify(fpsLRP.familyEngagementPlan, null, 2));
    } else {
      console.log(`Family Engagement Plan: Not provided`);
    }
    console.log(`Parent Communication: ${fpsLRP.parentCommunication || 'Not provided'}`);
    
    console.log(`\n🔗 CROSS-CURRICULAR CONNECTIONS:`);
    if (fpsLRP.crossCurricularConnections) {
      console.log(`Cross-Curricular Connections:`);
      console.log(JSON.stringify(fpsLRP.crossCurricularConnections, null, 2));
    } else {
      console.log(`Cross-Curricular Connections: Not provided`);
    }
    if (fpsLRP.thematicConnections) {
      console.log(`Thematic Connections:`);
      console.log(JSON.stringify(fpsLRP.thematicConnections, null, 2));
    } else {
      console.log(`Thematic Connections: Not provided`);
    }
    
    console.log(`\n📈 QUALITY METRICS:`);
    console.log(`Optimization Score: ${fpsLRP.optimizationScore || 'Not scored'}`);
    console.log(`Pedagogical Certification: ${fpsLRP.pedagogicalCertification || 'Not certified'}`);
    console.log(`Research Compliance Score: ${fpsLRP.researchComplianceScore || 'Not scored'}`);
    console.log(`Last Optimized: ${fpsLRP.lastOptimized ? fpsLRP.lastOptimized.toLocaleDateString() : 'Never'}`);
    
    console.log(`\n📚 CURRICULUM EXPECTATIONS (${fpsLRP.expectations.length}):`);
    if (fpsLRP.expectations.length > 0) {
      fpsLRP.expectations.forEach((exp, idx) => {
        console.log(`${idx + 1}. ${exp.expectation.code}: ${exp.expectation.description}`);
        if (exp.plannedTerm) {
          console.log(`   Planned for: ${exp.plannedTerm}`);
        }
      });
    } else {
      console.log('No curriculum expectations linked');
    }
    
    console.log(`\n📖 UNIT PLANS (${fpsLRP.unitPlans.length}):`);
    let totalLessons = 0;
    if (fpsLRP.unitPlans.length > 0) {
      fpsLRP.unitPlans.forEach((unit, idx) => {
        const lessonCount = unit.lessonPlans.length;
        totalLessons += lessonCount;
        console.log(`${idx + 1}. ${unit.title} (${lessonCount} lessons)`);
        console.log(`   Period: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
      });
      console.log(`\nTotal lessons across all units: ${totalLessons}`);
    } else {
      console.log('No unit plans created yet');
    }
    
    console.log(`\n⏰ TIMESTAMPS:`);
    console.log(`Created: ${fpsLRP.createdAt}`);
    console.log(`Last Updated: ${fpsLRP.updatedAt}`);
    console.log(`Start Date: ${fpsLRP.startDate || 'Not set'}`);
    console.log(`End Date: ${fpsLRP.endDate || 'Not set'}`);

    return fpsLRP;

  } catch (error) {
    console.error('Error querying Formation personnelle et sociale LRP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyFPSLRP();