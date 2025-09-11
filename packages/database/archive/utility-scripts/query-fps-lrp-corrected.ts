import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryFPSLRP() {
  try {
    console.log('🔍 Querying Formation personnelle et sociale Long Range Plan for Emily McIsaac (User ID: 23)...\n');
    
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
            bigIdeas: true,
            essentialQuestions: true,
            description: true,
            assessmentPlan: true,
            culminatingTask: true,
            differentiationStrategies: true,
            keyVocabulary: true,
            priorKnowledge: true,
            communityConnections: true,
            lessonPlans: {
              select: {
                id: true,
                title: true,
                date: true,
                duration: true,
                mindsOn: true,
                action: true,
                consolidation: true,
                differentiation: true,
                assessmentNotes: true
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
      return null;
    }

    console.log('✅ Found Formation personnelle et sociale Long Range Plan!\n');
    console.log('🎯 FORMATION PERSONNELLE ET SOCIALE - LONG RANGE PLAN ANALYSIS');
    console.log('='.repeat(80));
    
    console.log(`\n📋 BASIC INFORMATION:`);
    console.log(`Title: ${fpsLRP.title}`);
    console.log(`Subject: ${fpsLRP.subject}`);
    console.log(`Grade: ${fpsLRP.grade}`);
    console.log(`Academic Year: ${fpsLRP.academicYear}`);
    
    console.log(`\n📝 DESCRIPTIONS & GOALS:`);
    console.log(`Description: ${fpsLRP.description || 'Not provided'}`);
    console.log(`Learning Goals: ${fpsLRP.learningGoals || 'Not provided'}`);
    
    console.log(`\n❓ ESSENTIAL QUESTIONS:`);
    console.log(`Overarching Questions: ${fpsLRP.overarchingQuestions || 'Not provided'}`);
    
    console.log(`\n📅 MONTHLY THEMES:`);
    if (fpsLRP.monthlyThemes) {
      console.log(JSON.stringify(fpsLRP.monthlyThemes, null, 2));
    } else {
      console.log('Not provided');
    }
    
    console.log(`\n📊 ASSESSMENT FRAMEWORK:`);
    console.log(`Assessment Overview: ${fpsLRP.assessmentOverview || 'Not provided'}`);
    
    console.log(`\n🌍 CULTURAL RESPONSIVENESS:`);
    console.log(`Indigenous Perspectives: ${fpsLRP.indigenousPerspectives || 'Not provided'}`);
    
    console.log(`\n📚 RESOURCES & COMMUNICATION:`);
    console.log(`Resource Needs: ${fpsLRP.resourceNeeds || 'Not provided'}`);
    console.log(`Parent Communication: ${fpsLRP.parentCommunication || 'Not provided'}`);
    
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
    
    console.log(`\n📖 UNIT PLANS ANALYSIS (${fpsLRP.unitPlans.length}):`);
    let totalLessons = 0;
    
    if (fpsLRP.unitPlans.length > 0) {
      fpsLRP.unitPlans.forEach((unit, idx) => {
        const lessonCount = unit.lessonPlans.length;
        totalLessons += lessonCount;
        console.log(`\n${idx + 1}. "${unit.title}" (${lessonCount} lessons)`);
        console.log(`   Period: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
        console.log(`   Big Ideas: ${unit.bigIdeas || 'Not provided'}`);
        
        if (unit.essentialQuestions) {
          console.log(`   Essential Questions: ${JSON.stringify(unit.essentialQuestions)}`);
        }
        
        console.log(`   Description: ${unit.description || 'Not provided'}`);
        console.log(`   Assessment Plan: ${unit.assessmentPlan || 'Not provided'}`);
        console.log(`   Culminating Task: ${unit.culminatingTask || 'Not provided'}`);
        
        if (unit.differentiationStrategies) {
          console.log(`   Differentiation: ${JSON.stringify(unit.differentiationStrategies)}`);
        }
        
        if (unit.keyVocabulary) {
          console.log(`   Key Vocabulary: ${JSON.stringify(unit.keyVocabulary)}`);
        }
        
        console.log(`   Prior Knowledge: ${unit.priorKnowledge || 'Not provided'}`);
        console.log(`   Community Connections: ${unit.communityConnections || 'Not provided'}`);
      });
      
      console.log(`\n🎯 LESSON TOTALS:`);
      console.log(`Total lessons across all units: ${totalLessons}`);
      console.log(`Expected for rotation subject: 96 lessons`);
      
      if (totalLessons === 96) {
        console.log(`✅ Perfect match! Exactly 96 lessons as required.`);
      } else if (totalLessons < 96) {
        console.log(`⚠️  Shortfall: ${96 - totalLessons} lessons needed`);
      } else {
        console.log(`⚠️  Overage: ${totalLessons - 96} lessons beyond requirement`);
      }
      
    } else {
      console.log('No unit plans created yet');
    }
    
    console.log(`\n⏰ TIMESTAMPS:`);
    console.log(`Created: ${fpsLRP.createdAt}`);
    console.log(`Last Updated: ${fpsLRP.updatedAt}`);

    return fpsLRP;

  } catch (error) {
    console.error('❌ Error querying Formation personnelle et sociale LRP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryFPSLRP();