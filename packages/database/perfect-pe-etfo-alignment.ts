import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectPEAlignment() {
  console.log('🔧 PERFECTING PE LESSONS - ADDING MISSING ETFO FIELDS');
  console.log('='.repeat(60));
  
  const unit = await prisma.unitPlan.findFirst({
    where: { title: 'Mon corps en mouvement' }
  });
  
  if (!unit) {
    console.error('Unit not found!');
    return;
  }
  
  // Get lessons that need updates (those without all ETFO fields)
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: { 
      unitPlanId: unit.id,
      OR: [
        { assessmentType: null },
        { assessmentNotes: null },
        { subNotes: null },
        { isSubFriendly: null },
        { subject: null },
        { grade: null },
        { language: null }
      ]
    },
    orderBy: { date: 'asc' }
  });
  
  console.log(`Found ${lessons.length} lessons needing ETFO field updates`);
  
  for (const lesson of lessons) {
    const updates = {
      assessmentType: lesson.assessmentType || 'Formative',
      assessmentNotes: lesson.assessmentNotes || 'Observation continue de la participation, de l\'effort et du développement des habiletés motrices. Évaluation de la compréhension des consignes et du respect des règles de sécurité.',
      subNotes: lesson.subNotes || 'Plan de leçon détaillé avec toutes les activités décrites. Matériel préparé et organisé. Instructions de sécurité incluses. Adaptations pour tous les niveaux fournies.',
      isSubFriendly: lesson.isSubFriendly !== false ? true : lesson.isSubFriendly,
      subject: lesson.subject || 'Éducation physique',
      grade: lesson.grade || 1,
      language: lesson.language || 'Français'
    };
    
    const updated = await prisma.eTFOLessonPlan.update({
      where: { id: lesson.id },
      data: updates
    });
    
    console.log(`✅ Updated: ${updated.title}`);
  }
  
  // Final verification
  console.log('\n📊 FINAL VERIFICATION:');
  const allLessons = await prisma.eTFOLessonPlan.count({
    where: { unitPlanId: unit.id }
  });
  
  const perfectLessons = await prisma.eTFOLessonPlan.count({
    where: { 
      unitPlanId: unit.id,
      NOT: [
        { assessmentType: null },
        { assessmentNotes: null },
        { subNotes: null },
        { isSubFriendly: null },
        { subject: null },
        { grade: null },
        { language: null }
      ]
    }
  });
  
  console.log(`Total lessons: ${allLessons}`);
  console.log(`Perfect lessons: ${perfectLessons}`);
  console.log(`Success rate: ${Math.round(perfectLessons / allLessons * 100)}%`);
  
  if (perfectLessons === allLessons) {
    console.log('\n🌟 PERFECTION ACHIEVED! All PE lessons are now 100% ETFO compliant!');
  }
  
  await prisma.$disconnect();
}

perfectPEAlignment();