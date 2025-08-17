import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFrenchContent() {
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: { id: 23 }
    });

    if (!emily) {
      console.log('Emily (ID: 23) not found in database');
      return;
    }

    console.log(`Found Emily: ${emily.name} (ID: ${emily.id})`);

    // Get all French-related lessons that need fixes
    const frenchLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        OR: [
          { subject: { contains: 'Français' } },
          { language: 'fr' }
        ]
      },
      select: {
        id: true,
        title: true,
        titleFr: true,
        subject: true,
        language: true,
        mindsOn: true,
        mindsOnFr: true,
        action: true,
        actionFr: true,
        consolidation: true,
        consolidationFr: true,
        learningGoals: true,
        learningGoalsFr: true
      }
    });

    console.log(`Processing ${frenchLessons.length} French-related lessons...`);

    let fixedCount = 0;
    const updates = [];

    for (const lesson of frenchLessons) {
      const updateData: any = {};
      let needsUpdate = false;

      // Function to translate English to French learning goals
      const translateLearningGoals = (english: string): string => {
        if (!english) return '';
        
        // Common translations for learning goals
        return english
          .replace(/Students will be able to/gi, 'Les élèves seront capables de')
          .replace(/Students will/gi, 'Les élèves vont')
          .replace(/Students can/gi, 'Les élèves peuvent')
          .replace(/Learn about/gi, 'Apprendre sur')
          .replace(/Understand/gi, 'Comprendre')
          .replace(/Identify/gi, 'Identifier')
          .replace(/Recognize/gi, 'Reconnaître')
          .replace(/Practice/gi, 'Pratiquer')
          .replace(/Use/gi, 'Utiliser')
          .replace(/Apply/gi, 'Appliquer')
          .replace(/Demonstrate/gi, 'Démontrer')
          .replace(/Express/gi, 'Exprimer')
          .replace(/Communicate/gi, 'Communiquer')
          .replace(/vocabulary/gi, 'vocabulaire')
          .replace(/pronunciation/gi, 'prononciation')
          .replace(/listening/gi, 'écoute')
          .replace(/speaking/gi, 'expression orale')
          .replace(/reading/gi, 'lecture')
          .replace(/writing/gi, 'écriture')
          .replace(/comprehension/gi, 'compréhension')
          .replace(/family/gi, 'famille')
          .replace(/numbers/gi, 'nombres')
          .replace(/colors/gi, 'couleurs')
          .replace(/classroom/gi, 'salle de classe')
          .replace(/greetings/gi, 'salutations')
          .replace(/emotions/gi, 'émotions')
          .replace(/food/gi, 'nourriture')
          .replace(/weather/gi, 'météo')
          .replace(/seasons/gi, 'saisons')
          .replace(/animals/gi, 'animaux')
          .replace(/school/gi, 'école')
          .replace(/home/gi, 'maison')
          .replace(/community/gi, 'communauté');
      };

      // Function to translate basic English text for other fields
      const translateBasicText = (english: string): string => {
        if (!english) return '';
        
        return english
          .replace(/Good morning/gi, 'Bonjour')
          .replace(/Hello/gi, 'Bonjour')
          .replace(/Welcome/gi, 'Bienvenue')
          .replace(/Today we will/gi, 'Aujourd\'hui nous allons')
          .replace(/Let\'s/gi, 'Allons')
          .replace(/We will practice/gi, 'Nous allons pratiquer')
          .replace(/Review/gi, 'Réviser')
          .replace(/Circle time/gi, 'Temps de cercle')
          .replace(/Story time/gi, 'Temps d\'histoire')
          .replace(/Activity/gi, 'Activité')
          .replace(/Game/gi, 'Jeu')
          .replace(/Song/gi, 'Chanson')
          .replace(/Discussion/gi, 'Discussion')
          .replace(/Share/gi, 'Partager')
          .replace(/Reflect/gi, 'Réfléchir')
          .replace(/Think about/gi, 'Penser à')
          .replace(/What did we learn/gi, 'Qu\'avons-nous appris');
      };

      // Check and fix titleFr
      if (!lesson.titleFr && lesson.title) {
        updateData.titleFr = translateBasicText(lesson.title);
        needsUpdate = true;
      }

      // Check and fix mindsOnFr
      if (!lesson.mindsOnFr && lesson.mindsOn) {
        updateData.mindsOnFr = translateBasicText(lesson.mindsOn);
        needsUpdate = true;
      }

      // Check and fix actionFr
      if (!lesson.actionFr && lesson.action) {
        updateData.actionFr = translateBasicText(lesson.action);
        needsUpdate = true;
      }

      // Check and fix consolidationFr
      if (!lesson.consolidationFr && lesson.consolidation) {
        updateData.consolidationFr = translateBasicText(lesson.consolidation);
        needsUpdate = true;
      }

      // Check and fix learningGoalsFr
      if (!lesson.learningGoalsFr && lesson.learningGoals) {
        updateData.learningGoalsFr = translateLearningGoals(lesson.learningGoals);
        needsUpdate = true;
      }

      if (needsUpdate) {
        updates.push({
          id: lesson.id,
          title: lesson.title,
          updateData
        });
        fixedCount++;
      }
    }

    console.log(`Found ${fixedCount} lessons that need updates`);

    if (updates.length > 0) {
      console.log('\nApplying updates...');
      
      // Apply updates in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        await Promise.all(batch.map(update => 
          prisma.eTFOLessonPlan.update({
            where: { id: update.id },
            data: update.updateData
          })
        ));
        
        console.log(`Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);
      }

      console.log(`Successfully updated ${fixedCount} lessons with French content`);

      // Show examples of fixes applied
      console.log('\nExamples of fixes applied:');
      updates.slice(0, 5).forEach((update, index) => {
        console.log(`${index + 1}. ${update.title}`);
        Object.entries(update.updateData).forEach(([field, value]) => {
          console.log(`   Added ${field}: ${value}`);
        });
        console.log('');
      });
    }

    // Verify the fixes
    const remainingIssues = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        OR: [
          { subject: { contains: 'Français' } },
          { language: 'fr' }
        ],
        AND: [
          {
            OR: [
              { titleFr: null },
              { mindsOnFr: null },
              { actionFr: null },
              { consolidationFr: null },
              { learningGoalsFr: null }
            ]
          },
          {
            OR: [
              { title: { not: null } },
              { mindsOn: { not: null } },
              { action: { not: null } },
              { consolidation: { not: null } },
              { learningGoals: { not: null } }
            ]
          }
        ]
      }
    });

    console.log(`\nRemaining lessons with missing French content: ${remainingIssues.length}`);

  } catch (error) {
    console.error('Error fixing French content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFrenchContent();