import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMaFamille() {
  console.log('🔧 FIXING "MA FAMILLE ET MA COMMUNAUTÉ" LESSONS');
  console.log('='.repeat(60));
  
  // Get all lessons from this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: { 
      unitPlan: { title: 'Ma famille et ma communauté' }
    }
  });
  
  console.log(`Total lessons in unit: ${lessons.length}`);
  
  let fixedCount = 0;
  
  for (const lesson of lessons) {
    const updateData: any = {};
    
    // Check if extensions is missing and add appropriate content
    if (!lesson.extensions) {
      // Context-appropriate extensions for family and community
      updateData.extensions = "Créer un arbre généalogique détaillé; Interviewer un membre de la communauté; Organiser une présentation familiale";
    }
    
    // Check if grouping is missing and add appropriate structure
    if (!lesson.grouping) {
      // Varied grouping for community building
      updateData.grouping = "Cercle de partage collectif, activités en pairs, projet individuel";
    }
    
    // Only update if there are fields to fix
    if (Object.keys(updateData).length > 0) {
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: updateData
      });
      fixedCount++;
      console.log(`✅ Fixed: ${lesson.title}`);
    }
  }
  
  console.log(`\n✨ Fixed ${fixedCount} lessons in "Ma famille et ma communauté"`);
  
  // Verify compliance
  const updatedLessons = await prisma.eTFOLessonPlan.findMany({
    where: { 
      unitPlan: { title: 'Ma famille et ma communauté' }
    }
  });
  
  let compliantCount = 0;
  updatedLessons.forEach(lesson => {
    if (lesson.mindsOn && lesson.action && lesson.consolidation && 
        lesson.accommodations && lesson.modifications && lesson.extensions &&
        lesson.assessmentType && lesson.assessmentNotes && lesson.learningGoals &&
        lesson.materials && lesson.grouping && lesson.isSubFriendly !== null && lesson.subNotes) {
      compliantCount++;
    }
  });
  
  console.log(`\n📊 Unit Compliance: ${compliantCount}/${updatedLessons.length} lessons are now ETFO compliant`);
  console.log(`Compliance Rate: ${Math.round(compliantCount/updatedLessons.length * 100)}%`);
  
  if (compliantCount === updatedLessons.length) {
    console.log('🎉 UNIT IS NOW 100% ETFO COMPLIANT!');
  }
  
  await prisma.$disconnect();
}

fixMaFamille().catch(console.error);