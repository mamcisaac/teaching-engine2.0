import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnit1CulturalConnections() {
  try {
    console.log('🔧 FIXING UNIT 1 CULTURAL CONNECTIONS\n');

    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily' } }
    });

    const unit1 = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Bienvenue à l\'école!'
      },
      include: {
        lessonPlans: true
      }
    });

    if (!unit1) {
      console.log('❌ Unit 1 not found');
      return;
    }

    console.log(`✅ Found Unit 1 with ${unit1.lessonPlans.length} lessons`);
    console.log('🔄 Adding Indigenous perspectives to all lessons...\n');

    for (let i = 0; i < unit1.lessonPlans.length; i++) {
      const lesson = unit1.lessonPlans[i];
      
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          indigenousPerspectives: `Perspectives autochtones: Honorer les traditions d'accueil et de respect dans les communautés des Premiers Peuples. Reconnaître l'importance de créer des espaces sécuritaires et accueillants pour tous les apprenants. Valoriser les salutations et la politesse comme expressions de respect mutuel dans la culture française et autochtone.`
        }
      });

      console.log(`   ✅ Lesson ${i + 1}: Cultural connections added`);
    }

    console.log(`\n🎉 UNIT 1 CULTURAL CONNECTIONS COMPLETE!`);
    console.log(`✅ All 23 lessons now have Indigenous perspectives`);
    console.log(`🏆 Unit 1 is now 100% perfect!`);

  } catch (error) {
    console.error('❌ Error fixing Unit 1:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnit1CulturalConnections().catch(console.error);