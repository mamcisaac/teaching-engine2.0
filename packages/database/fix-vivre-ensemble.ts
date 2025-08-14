import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixVivreEnsemble() {
  console.log('🔧 FIXING "VIVRE ENSEMBLE" LESSONS');
  console.log('='.repeat(60));
  
  // Get all lessons from this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: { 
      unitPlan: { title: 'Vivre ensemble' }
    }
  });
  
  console.log(`Total lessons in unit: ${lessons.length}`);
  
  let fixedCount = 0;
  
  for (const lesson of lessons) {
    const updateData: any = {};
    
    // Check if extensions is missing and add appropriate content
    if (!lesson.extensions) {
      // Context-appropriate extensions for social skills and collaboration
      updateData.extensions = "Créer un guide d'amitié illustré; Organiser une activité de groupe; Enseigner une stratégie sociale aux plus jeunes";
    }
    
    // Check if grouping is missing and add appropriate structure
    if (!lesson.grouping) {
      // Varied grouping for social skill development
      updateData.grouping = "Activités en grand groupe, pratique en pairs, réflexion individuelle";
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
  
  console.log(`\n✨ Fixed ${fixedCount} lessons in "Vivre ensemble"`);
  
  // Verify compliance
  const updatedLessons = await prisma.eTFOLessonPlan.findMany({
    where: { 
      unitPlan: { title: 'Vivre ensemble' }
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

fixVivreEnsemble().catch(console.error);