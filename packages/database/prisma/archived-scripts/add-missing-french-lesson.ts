import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingFrenchLesson() {
  console.log('🇫🇷 Adding missing French lesson to Unit 4...');

  // Get Emily's account
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) {
    console.error('❌ Emily not found');
    return;
  }

  // Get the French unit 4 (Magical Winter)
  const frenchUnit = await prisma.unitPlan.findFirst({
    where: {
      title: 'Magical Winter',
      longRangePlan: {
        subject: 'Français langue première',
        userId: emily.id
      }
    },
    include: {
      _count: {
        select: {
          lessonPlans: true
        }
      }
    }
  });

  if (!frenchUnit) {
    console.error('❌ French unit "Magical Winter" not found');
    return;
  }

  console.log(`Found unit: ${frenchUnit.title} (currently has ${frenchUnit._count.lessonPlans} lessons)`);

  // Add one lesson to December for Unit 4
  const newLesson = await prisma.eTFOLessonPlan.create({
    data: {
      title: 'Vocabulaire d\'hiver',
      date: new Date('2025-12-18T09:00:00'),
      duration: 45,
      subject: 'Français langue première',
      mindsOn: 'Discussion: Quels mots d\'hiver connaissez-vous?',
      action: 'Créer un dictionnaire illustré des mots d\'hiver. Utiliser les nouveaux mots dans des phrases.',
      consolidation: 'Partager nos mots d\'hiver préférés. Jeu de vocabulaire.',
      materials: ['Papier', 'Crayons', 'Images d\'hiver', 'Cartes de vocabulaire'],
      accommodations: ['Support visuel', 'Travail en paires', 'Temps supplémentaire'],
      differentiationStrategies: ['Choix du niveau de difficulté', 'Support par les pairs'],
      assessmentType: 'Formative',
      assessmentNotes: 'Observation du vocabulaire utilisé et de la participation',
      unitPlanId: frenchUnit.id,
      userId: emily.id
    }
  });

  console.log(`✅ Created French lesson: ${newLesson.title}`);

  // Check final totals
  const frenchTotal = await prisma.eTFOLessonPlan.count({
    where: {
      subject: 'Français langue première'
    }
  });

  const overallTotal = await prisma.eTFOLessonPlan.count();

  console.log('\n📊 FINAL STATUS:');
  console.log(`French lessons: ${frenchTotal} (target: 63)`);
  console.log(`Total lessons: ${overallTotal} (target: 197-198)`);
  
  if (frenchTotal === 63) {
    console.log('✅ French lessons perfect!');
  }
}

addMissingFrenchLesson()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });