import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(__dirname, 'packages/database/prisma/dev.db')}`
    }
  }
});

async function getAutumnUnitDetails() {
  try {
    console.log('🍂 Getting full details for Emily\'s "Les couleurs d\'automne" unit...\n');

    const autumnUnit = await prisma.unitPlan.findUnique({
      where: {
        id: 'cmeh61upk0005vjjpbo92ott9'
      },
      include: {
        user: true,
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          include: {
            expectations: {
              include: {
                expectation: true
              }
            }
          },
          orderBy: {
            date: 'asc'
          }
        },
        resources: true,
        transferSkills: {
          include: {
            transferSkill: true
          }
        }
      }
    });

    if (!autumnUnit) {
      console.log('❌ Unit not found!');
      return;
    }

    console.log(`📚 UNIT DETAILS:`);
    console.log(`Title: ${autumnUnit.title}`);
    console.log(`Title (FR): ${autumnUnit.titleFr || 'Not set'}`);
    console.log(`Teacher: ${autumnUnit.user.name}`);
    console.log(`Subject: ${autumnUnit.longRangePlan.subject}`);
    console.log(`Start Date: ${autumnUnit.startDate?.toISOString().split('T')[0]}`);
    console.log(`End Date: ${autumnUnit.endDate?.toISOString().split('T')[0]}`);
    console.log(`Estimated Hours: ${autumnUnit.estimatedHours || 'Not set'}`);
    
    console.log(`\n📝 DESCRIPTION:`);
    console.log(autumnUnit.description || 'Not set');
    
    console.log(`\n📝 DESCRIPTION (FR):`);
    console.log(autumnUnit.descriptionFr || 'Not set');
    
    console.log(`\n💡 BIG IDEAS:`);
    console.log(autumnUnit.bigIdeas || 'Not set');
    
    console.log(`\n💡 BIG IDEAS (FR):`);
    console.log(autumnUnit.bigIdeasFr || 'Not set');
    
    console.log(`\n❓ ESSENTIAL QUESTIONS:`);
    console.log(JSON.stringify(autumnUnit.essentialQuestions, null, 2) || 'Not set');
    
    console.log(`\n📚 KEY VOCABULARY:`);
    console.log(JSON.stringify(autumnUnit.keyVocabulary, null, 2) || 'Not set');
    
    console.log(`\n🎯 CULMINATING TASK:`);
    console.log(autumnUnit.culminatingTask || 'Not set');
    
    console.log(`\n🔄 DIFFERENTIATION STRATEGIES:`);
    console.log(JSON.stringify(autumnUnit.differentiationStrategies, null, 2) || 'Not set');
    
    console.log(`\n📊 ASSESSMENT PLAN:`);
    console.log(autumnUnit.assessmentPlan || 'Not set');
    
    console.log(`\n🌍 INDIGENOUS PERSPECTIVES:`);
    console.log(autumnUnit.indigenousPerspectives || 'Not set');
    
    console.log(`\n👨‍👩‍👧‍👦 PARENT COMMUNICATION PLAN:`);
    console.log(autumnUnit.parentCommunicationPlan || 'Not set');
    
    console.log(`\n🎓 CURRICULUM EXPECTATIONS (${autumnUnit.expectations.length}):`);
    autumnUnit.expectations.forEach((exp, index) => {
      console.log(`${index + 1}. [${exp.expectation.code}] ${exp.expectation.description}`);
      if (exp.expectation.descriptionFr) {
        console.log(`   FR: ${exp.expectation.descriptionFr}`);
      }
    });
    
    console.log(`\n📖 LESSON PLANS (${autumnUnit.lessonPlans.length}):`);
    autumnUnit.lessonPlans.forEach((lesson, index) => {
      console.log(`${index + 1}. "${lesson.title}" - ${lesson.date?.toISOString().split('T')[0]} (${lesson.duration} min)`);
      if (lesson.titleFr) {
        console.log(`   FR: "${lesson.titleFr}"`);
      }
      console.log(`   Learning Goals: ${lesson.learningGoals || 'Not set'}`);
      console.log(`   Minds On: ${lesson.mindsOn ? lesson.mindsOn.substring(0, 100) + '...' : 'Not set'}`);
      console.log('');
    });
    
    console.log(`\n🔧 RESOURCES (${autumnUnit.resources.length}):`);
    autumnUnit.resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title} (${resource.type})`);
      if (resource.url) console.log(`   URL: ${resource.url}`);
      if (resource.notes) console.log(`   Notes: ${resource.notes}`);
    });
    
    console.log(`\n🎯 TRANSFER SKILLS (${autumnUnit.transferSkills.length}):`);
    autumnUnit.transferSkills.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.transferSkill.skillName} (${skill.emphasis})`);
      console.log(`   Description: ${skill.transferSkill.description}`);
    });

  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAutumnUnitDetails();