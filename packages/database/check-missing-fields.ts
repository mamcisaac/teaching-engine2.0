import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMissingFields() {
  // Get lessons from problematic units
  const problemUnits = ['Citoyens responsables', 'Vivre ensemble', 'Notre monde en cartes', 'Ma famille et ma communauté'];
  
  for (const unitTitle of problemUnits) {
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        unitPlan: { title: unitTitle }
      },
      take: 2 // Just check 2 from each
    });
    
    console.log(`\n📚 Unit: ${unitTitle}`);
    console.log('='.repeat(50));
    
    lessons.forEach(lesson => {
      console.log(`\nLesson: ${lesson.title}`);
      const missingFields = [];
      
      if (!lesson.mindsOn) missingFields.push('mindsOn');
      if (!lesson.action) missingFields.push('action');
      if (!lesson.consolidation) missingFields.push('consolidation');
      if (!lesson.accommodations) missingFields.push('accommodations');
      if (!lesson.modifications) missingFields.push('modifications');
      if (!lesson.extensions) missingFields.push('extensions');
      if (!lesson.assessmentType) missingFields.push('assessmentType');
      if (!lesson.assessmentNotes) missingFields.push('assessmentNotes');
      if (!lesson.learningGoals) missingFields.push('learningGoals');
      if (!lesson.materials) missingFields.push('materials');
      if (!lesson.grouping) missingFields.push('grouping');
      if (lesson.isSubFriendly === null || lesson.isSubFriendly === undefined) missingFields.push('isSubFriendly');
      if (!lesson.subNotes) missingFields.push('subNotes');
      
      if (missingFields.length > 0) {
        console.log('Missing fields:', missingFields.join(', '));
      } else {
        console.log('✅ All fields present');
      }
    });
  }
  
  await prisma.$disconnect();
}

checkMissingFields().catch(console.error);