const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function queryEnergyUnitLessons() {
  try {
    // Query all lessons for the Energy in Our Lives unit
    const energyLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: 'cmebyc9nh0005vjrmch1x7vfb' // Energy in Our Lives unit ID
      },
      select: {
        id: true,
        title: true,
        titleFr: true,
        date: true,
        subject: true,
        learningGoals: true,
        learningGoalsFr: true,
        materials: true,
        action: true,
        actionFr: true,
        mindsOn: true,
        mindsOnFr: true,
        consolidation: true,
        consolidationFr: true,
        assessmentType: true,
        unitPlanId: true,
        differentiationStrategies: true,
        engagementHooks: true,
        formativeCheckpoints: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${energyLessons.length} lessons in the Energy in Our Lives unit:`);
    console.log('='.repeat(80));

    energyLessons.forEach((lesson, index) => {
      console.log(`\n${index + 1}. Lesson ID: ${lesson.id}`);
      console.log(`   Title: ${lesson.title || 'NULL'}`);
      console.log(`   Title FR: ${lesson.titleFr || 'NULL'}`);
      console.log(`   Date: ${lesson.date ? lesson.date.toISOString().split('T')[0] : 'NULL'}`);
      console.log(`   Subject: ${lesson.subject || 'NULL'}`);
      console.log(`   Learning Goals: ${lesson.learningGoals || 'EMPTY - NEEDS FIXING'}`);
      console.log(`   Learning Goals FR: ${lesson.learningGoalsFr || 'EMPTY - NEEDS FIXING'}`);
      console.log(`   Materials: ${lesson.materials ? JSON.stringify(lesson.materials, null, 2) : 'EMPTY - NEEDS FIXING'}`);
      console.log(`   Minds On: ${lesson.mindsOn ? lesson.mindsOn.substring(0, 100) + '...' : 'EMPTY - NEEDS FIXING'}`);
      console.log(`   Action: ${lesson.action ? lesson.action.substring(0, 100) + '...' : 'EMPTY - NEEDS FIXING'}`);
      console.log(`   Consolidation: ${lesson.consolidation ? lesson.consolidation.substring(0, 100) + '...' : 'EMPTY - NEEDS FIXING'}`);
      console.log(`   Assessment Type: ${lesson.assessmentType || 'EMPTY - NEEDS FIXING'}`);
      console.log(`   Differentiation: ${lesson.differentiationStrategies || 'EMPTY - NEEDS FIXING'}`);
      console.log('   ' + '-'.repeat(75));
    });

    console.log(`\n\nSUMMARY:`);
    console.log(`Total lessons found: ${energyLessons.length}`);
    
    const lessonsWithoutGoals = energyLessons.filter(lesson => !lesson.learningGoals).length;
    const lessonsWithoutMaterials = energyLessons.filter(lesson => !lesson.materials || Object.keys(lesson.materials).length === 0).length;
    const lessonsWithoutMindsOn = energyLessons.filter(lesson => !lesson.mindsOn).length;
    const lessonsWithoutAction = energyLessons.filter(lesson => !lesson.action).length;
    const lessonsWithoutConsolidation = energyLessons.filter(lesson => !lesson.consolidation).length;
    const lessonsWithoutAssessment = energyLessons.filter(lesson => !lesson.assessmentType).length;
    const lessonsWithoutDifferentiation = energyLessons.filter(lesson => !lesson.differentiationStrategies).length;

    console.log(`Lessons missing learning goals: ${lessonsWithoutGoals}`);
    console.log(`Lessons missing materials: ${lessonsWithoutMaterials}`);
    console.log(`Lessons missing minds on: ${lessonsWithoutMindsOn}`);
    console.log(`Lessons missing action: ${lessonsWithoutAction}`);
    console.log(`Lessons missing consolidation: ${lessonsWithoutConsolidation}`);
    console.log(`Lessons missing assessment: ${lessonsWithoutAssessment}`);
    console.log(`Lessons missing differentiation: ${lessonsWithoutDifferentiation} - CRITICAL FOR SAFETY`);

    // Check for potential electrical hazards in existing content
    console.log(`\n\nELECTRICAL HAZARD ANALYSIS:`);
    console.log('='.repeat(50));
    
    energyLessons.forEach((lesson, index) => {
      const content = `${lesson.title} ${lesson.titleFr} ${lesson.action}`.toLowerCase();
      const potentialHazards = [];
      
      if (content.includes('electrical') || content.includes('électri')) potentialHazards.push('electrical');
      if (content.includes('outlet') || content.includes('prise')) potentialHazards.push('outlet');
      if (content.includes('wire') || content.includes('fil')) potentialHazards.push('wire');
      if (content.includes('plug') || content.includes('branche')) potentialHazards.push('plug');
      if (content.includes('battery') || content.includes('pile')) potentialHazards.push('battery');
      if (content.includes('power') || content.includes('pouvoir')) potentialHazards.push('power');
      
      if (potentialHazards.length > 0) {
        console.log(`⚠️  Lesson ${index + 1} (${lesson.id}): ${lesson.title}`);
        console.log(`    Potential hazards: ${potentialHazards.join(', ')}`);
      }
    });

    return energyLessons;

  } catch (error) {
    console.error('Error querying energy unit lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEnergyUnitLessons();