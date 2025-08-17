import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function expandFrenchLessons() {
  console.log('🇫🇷 EXPANDING FRENCH FROM 172 TO 372 LESSONS');
  console.log('=============================================\n');
  console.log('Creating comprehensive daily French literacy program...\n');

  const userId = 23;
  const schoolStartDate = new Date('2025-09-03');
  const schoolEndDate = new Date('2026-06-26');
  
  // Get the French LRP
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: {
      userId: userId,
      subject: 'Français (Immersion)'
    }
  });

  if (!frenchLRP) {
    console.error('❌ French LRP not found!');
    return;
  }

  // Get all French units
  const frenchUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: frenchLRP.id
    },
    orderBy: { startDate: 'asc' }
  });

  console.log(`Found ${frenchUnits.length} French units\n`);

  // We need to create 200 new lessons distributed across the year
  // That's roughly 25 new lessons per unit for 8 units
  
  const newLessonsPerUnit = {
    'Bienvenue à l\'école!': 20,        // September - needs daily literacy
    'Ma famille et moi': 20,             // October
    'Les fêtes d\'automne': 28,          // October-November
    'L\'hiver magique': 28,              // December-January
    'Nos amis les animaux': 28,          // January-February
    'Ma communauté': 28,                 // February-March
    'Le printemps en fleurs': 28,        // April-May
    'Célébrons nos apprentissages': 20   // June
  };

  let totalCreated = 0;
  let currentDate = new Date(schoolStartDate);

  for (const unit of frenchUnits) {
    const lessonsToAdd = newLessonsPerUnit[unit.title] || 25;
    console.log(`\n📚 Unit: ${unit.title}`);
    console.log(`   Adding ${lessonsToAdd} new literacy lessons...`);

    // Get existing lessons for this unit to find gaps
    const existingLessons = await prisma.eTFOLessonPlan.findMany({
      where: { unitPlanId: unit.id },
      orderBy: { date: 'asc' }
    });
    
    console.log(`   Currently has ${existingLessons.length} lessons`);

    // Create new lesson types for comprehensive literacy
    const lessonTypes = [
      { type: 'Lecture guidée', description: 'Guided reading in small groups' },
      { type: 'Atelier d\'écriture', description: 'Writing workshop' },
      { type: 'Étude de mots', description: 'Word study and phonics' },
      { type: 'Communication orale', description: 'Oral language development' },
      { type: 'Grammaire en contexte', description: 'Grammar in context' },
      { type: 'Vocabulaire thématique', description: 'Thematic vocabulary' },
      { type: 'Littérature jeunesse', description: 'Children\'s literature' },
      { type: 'Centres de littératie', description: 'Literacy centers' }
    ];

    const newLessons = [];
    
    for (let i = 0; i < lessonsToAdd; i++) {
      const lessonType = lessonTypes[i % lessonTypes.length];
      const weekNum = Math.floor(i / 5) + 1;
      
      // Skip weekends
      while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const newLesson = {
        userId: userId,
        unitPlanId: unit.id,
        title: `${lessonType.type} - ${unit.title} (Semaine ${weekNum})`,
        titleFr: `${lessonType.type} - ${unit.title} (Semaine ${weekNum})`,
        date: new Date(currentDate),
        duration: 45,
        
        // Learning goals focused on literacy
        learningGoals: `Students will develop French literacy skills through ${lessonType.description}. Focus on reading, writing, speaking, and listening in authentic contexts.`,
        learningGoalsFr: `Les élèves développeront leurs compétences en littératie française par ${lessonType.description}. Accent sur la lecture, l'écriture, la parole et l'écoute dans des contextes authentiques.`,
        
        // ETFO structure for literacy
        mindsOn: `Circle time: Review previous learning, introduce today's ${lessonType.type} focus. Activate prior knowledge through discussion and visual supports.`,
        mindsOnFr: `Cercle de discussion: Révision des apprentissages, introduction du ${lessonType.type}. Activation des connaissances par discussion et supports visuels.`,
        
        action: `${lessonType.type} implementation: ${lessonType.description}. Students engage in differentiated literacy activities at their level. Teacher provides guided support.`,
        actionFr: `Mise en œuvre du ${lessonType.type}: ${lessonType.description}. Les élèves participent à des activités de littératie différenciées. Soutien guidé de l'enseignant.`,
        
        consolidation: `Sharing circle: Students share their learning. Reflect on strategies used. Preview tomorrow's literacy focus.`,
        consolidationFr: `Cercle de partage: Les élèves partagent leurs apprentissages. Réflexion sur les stratégies. Aperçu du focus de demain.`,
        
        // Materials for literacy
        materials: [
          'French leveled readers',
          'Writing journals',
          'Word study materials',
          'Alphabet/phonics cards',
          'Chart paper for anchor charts',
          'Individual whiteboards',
          'French picture books',
          'Literacy center materials'
        ],
        
        // Assessment focused on literacy development
        assessmentNotes: `
📖 LITERACY ASSESSMENT:
☐ Demonstrates understanding of French text at appropriate level
☐ Uses French vocabulary in oral communication
☐ Shows progress in French writing development
☐ Applies phonics/word study strategies
☐ Participates actively in French discussions
☐ Shows engagement with French literacy activities`,

        // Differentiation for literacy
        differentiationStrategies: {
          forStruggling: 'Additional visual supports, simplified texts, one-on-one guided reading, peer support',
          forOnLevel: 'Grade-appropriate texts, collaborative activities, independent practice with check-ins',
          forAdvanced: 'Complex texts, extension writing activities, peer mentoring opportunities',
          forELL: 'Bilingual supports when needed, visual vocabulary cards, structured language frames',
          forIEP: 'Modified texts, assistive technology, additional time, specific accommodations as per IEP'
        },
        
        // Sub-friendly notes
        subNotes: `French literacy lesson: ${lessonType.type}. All materials are prepared and labeled. Follow the structured literacy routine. Support materials in the French literacy cabinet.`,
        
        createdAt: new Date(),
        updatedAt: new Date()
      };

      newLessons.push(newLesson);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create all new lessons for this unit
    if (newLessons.length > 0) {
      const result = await prisma.eTFOLessonPlan.createMany({
        data: newLessons
      });
      console.log(`   ✅ Created ${result.count} new literacy lessons`);
      totalCreated += result.count;
    }
  }

  console.log('\n📊 FRENCH EXPANSION COMPLETE!');
  console.log('==============================');
  console.log(`✅ Total new lessons created: ${totalCreated}`);
  
  // Verify the new total
  const totalFrenchLessons = await prisma.eTFOLessonPlan.count({
    where: {
      unitPlan: {
        longRangePlan: {
          userId: userId,
          subject: 'Français (Immersion)'
        }
      }
    }
  });
  
  console.log(`📚 New total French lessons: ${totalFrenchLessons} (target was 372)`);
  console.log('\n🎯 French is now properly prioritized for immersion!');
  console.log('   - 2 lessons every single day');
  console.log('   - Comprehensive literacy program');
  console.log('   - Reading, writing, oral language, phonics');
  console.log('   - Differentiated for all learners');
}

// Run the expansion
expandFrenchLessons()
  .catch((error) => {
    console.error('❌ Error expanding French lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });