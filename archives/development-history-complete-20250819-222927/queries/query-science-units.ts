import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryScience() {
  try {
    // Get the Science LRP
    const scienceLRP = await prisma.longRangePlan.findUnique({
      where: { id: 'cmebyc98q0005vjr19wxzdygh' },
      include: {
        unitPlans: {
          orderBy: { startDate: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            estimatedHours: true,
            startDate: true,
            endDate: true,
            bigIdeas: true,
            essentialQuestions: true,
            assessmentPlan: true,
            differentiationStrategies: true,
            crossCurricularConnections: true,
            indigenousPerspectives: true,
            environmentalEducation: true,
            communityConnections: true,
            parentCommunicationPlan: true,
            successCriteria: true
          }
        }
      }
    });
    
    if (!scienceLRP) {
      console.log('Science LRP not found');
      return;
    }
    
    console.log('Sciences de la nature Long Range Plan');
    console.log('=====================================');
    console.log('Subject:', scienceLRP.subject);
    console.log('Grade:', scienceLRP.gradeLevel);
    console.log('Total Hours:', scienceLRP.totalHours);
    console.log('Units:', scienceLRP.unitPlans.length);
    console.log('');
    
    let totalHours = 0;
    scienceLRP.unitPlans.forEach((unit, index) => {
      console.log(`Unit ${index + 1}: ${unit.title}`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      console.log(`  Description: ${unit.description?.substring(0, 100)}...`);
      console.log(`  Big Ideas: ${unit.bigIdeas ? 'Yes' : 'No'}`);
      console.log(`  Essential Questions: ${unit.essentialQuestions?.length || 0} items`);
      console.log(`  Assessment Plan: ${unit.assessmentPlan ? 'Yes' : 'No'}`);
      console.log(`  Cross-Curricular: ${unit.crossCurricularConnections ? 'Yes' : 'No'}`);
      console.log('');
      totalHours += unit.estimatedHours || 0;
    });
    
    console.log('Total Hours Across Units:', totalHours);
    console.log('Required Hours:', 73.5);
    console.log('Deficit:', 73.5 - totalHours, 'hours');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryScience();