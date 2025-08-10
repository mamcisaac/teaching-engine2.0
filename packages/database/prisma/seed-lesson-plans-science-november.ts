#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedScienceNovemberLessons() {
  console.log('🔬 Seeding November Science Lessons - Fall Changes & Energy...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get both Science unit plans for November
    const fallChangesUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Fall Changes',
        endDate: { gte: new Date('2025-11-01') }
      }
    });

    const energyUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Energy in Our Lives',
        startDate: { lte: new Date('2025-11-30') }
      }
    });

    if (!fallChangesUnit || !energyUnit) {
      throw new Error('Science unit plans not found for November');
    }

    // Get curriculum expectations for Science
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Sciences de la nature',
        grade: 1
      }
    });

    const lessons: any[] = [];

    // Helper to get November weekday dates
    const novDate = (day: number) => {
      const date = new Date(2025, 10, day);
      // Skip weekends
      if (date.getDay() === 0) return new Date(2025, 10, day + 1);
      if (date.getDay() === 6) return new Date(2025, 10, day + 2);
      return date;
    };

    // Week 1: November 3-7 - Fall Changes (continuation)
    lessons.push({
      title: 'Trees Preparing for Winter',
      titleFr: 'Les arbres se préparent pour l\'hiver',
      date: novDate(4), // Tuesday
      subject: 'Sciences de la nature',
      duration: 60,
      primaryFocus: 'Observing how trees change in late fall',
      learningGoals: 'Students will observe and document tree changes as winter approaches. Natural French connection: Tree vocabulary (arbre, feuille, branche, écorce).',
      vocabulary: ['dormant', 'bare', 'evergreen', 'deciduous', 'nu', 'persistant'],
      mindsOn: 'Tree observation walk - what changes do we see?',
      action: 'Create tree journals documenting changes. Compare evergreen vs deciduous.',
      consolidation: 'Share observations using scientific vocabulary.',
      materials: 'Observation journals, pencils, tree identification cards',
      groupingStrategies: 'Whole class walk, individual journaling, partner sharing',
      differentiationStrategies: 'Drawing or writing options, guided observations',
      accommodations: 'Scribing support, picture cards for vocabulary',
      assessmentNotes: 'Assess observation skills and vocabulary use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: fallChangesUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Animal Winter Preparations',
      titleFr: 'Les préparations hivernales des animaux',
      date: novDate(6), // Thursday
      subject: 'Sciences de la nature',
      duration: 60,
      primaryFocus: 'Understanding how animals prepare for winter',
      learningGoals: 'Students will explore different ways animals prepare for winter. Natural French connection: Animal behavior vocabulary (hiberner, migrer, stocker).',
      vocabulary: ['hibernate', 'migrate', 'store', 'hiberner', 'migrer', 'stocker'],
      mindsOn: 'Animal movement game - act out winter preparations.',
      action: 'Sort animals by winter strategy. Create winter preparation books.',
      consolidation: 'Present favorite animal\'s winter strategy.',
      materials: 'Animal cards, sorting mats, book-making materials',
      groupingStrategies: 'Whole class game, small group sorting, individual books',
      differentiationStrategies: 'Varied complexity in animal examples',
      accommodations: 'Picture supports, partner assistance',
      assessmentNotes: 'Track understanding of animal adaptations',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: fallChangesUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 2: November 10-14 - Fall Changes conclusion
    lessons.push({
      title: 'Weather Patterns in Fall',
      titleFr: 'Les modèles météorologiques en automne',
      date: novDate(13), // Thursday (after Remembrance Day)
      subject: 'Sciences de la nature',
      duration: 60,
      primaryFocus: 'Tracking and recording fall weather patterns',
      learningGoals: 'Students will observe and record weather patterns in late fall. Natural French connection: Weather vocabulary (température, nuage, pluie, vent).',
      vocabulary: ['temperature', 'precipitation', 'cloud', 'température', 'précipitation', 'nuage'],
      mindsOn: 'Weather station tour - explore weather tools.',
      action: 'Create class weather chart. Make weather measurement tools.',
      consolidation: 'Analyze weather data from the week.',
      materials: 'Thermometer, rain gauge materials, weather chart',
      groupingStrategies: 'Whole class tour, small groups for tools, class analysis',
      differentiationStrategies: 'Simple to complex measurements',
      accommodations: 'Visual weather symbols, guided recording',
      assessmentNotes: 'Assess data collection and pattern recognition',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: fallChangesUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 3: November 17-21 - Energy in Our Lives begins
    lessons.push({
      title: 'What is Energy?',
      titleFr: 'Qu\'est-ce que l\'énergie?',
      date: novDate(18), // Tuesday
      subject: 'Sciences de la nature',
      duration: 60,
      primaryFocus: 'Introduction to the concept of energy',
      learningGoals: 'Students will explore what energy is and identify energy in their daily lives. Natural French connection: Energy vocabulary (énergie, mouvement, chaleur).',
      vocabulary: ['energy', 'movement', 'heat', 'énergie', 'mouvement', 'chaleur'],
      mindsOn: 'Energy scavenger hunt - find things that use energy.',
      action: 'Create energy collages showing different types of energy.',
      consolidation: 'Energy circle - share one way you used energy today.',
      materials: 'Magazines, glue, paper, energy picture cards',
      groupingStrategies: 'Whole class hunt, individual collages, circle sharing',
      differentiationStrategies: 'Concrete to abstract energy examples',
      accommodations: 'Pre-cut pictures available, word walls',
      assessmentNotes: 'Assess initial understanding of energy concept',
      assessmentType: 'diagnostic',
      isSubFriendly: true,
      unitPlanId: energyUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Light Energy',
      titleFr: 'L\'énergie lumineuse',
      date: novDate(20), // Thursday
      subject: 'Sciences de la nature',
      duration: 60,
      primaryFocus: 'Exploring light as a form of energy',
      learningGoals: 'Students will investigate light energy and its sources. Natural French connection: Light vocabulary (lumière, soleil, lampe, ombre).',
      vocabulary: ['light', 'source', 'shadow', 'lumière', 'source', 'ombre'],
      mindsOn: 'Shadow puppet show - explore light and shadows.',
      action: 'Light source investigation. Create shadow tracings throughout the day.',
      consolidation: 'Share discoveries about how shadows change.',
      materials: 'Flashlights, shadow screens, tracing paper',
      groupingStrategies: 'Whole class show, partner investigations, individual tracing',
      differentiationStrategies: 'Guided to independent exploration',
      accommodations: 'Hands-on materials, partner support',
      assessmentNotes: 'Observe understanding of light and shadow relationships',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: energyUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 4: November 24-28 - More Energy Types
    lessons.push({
      title: 'Sound Energy',
      titleFr: 'L\'énergie sonore',
      date: novDate(25), // Tuesday
      subject: 'Sciences de la nature',
      duration: 60,
      primaryFocus: 'Exploring sound as a form of energy',
      learningGoals: 'Students will investigate how sound is created and travels. Natural French connection: Sound vocabulary (son, bruit, vibration, écouter).',
      vocabulary: ['sound', 'vibration', 'loud', 'soft', 'son', 'vibration'],
      mindsOn: 'Sound walk - identify and categorize sounds.',
      action: 'Make simple musical instruments. Explore vibrations.',
      consolidation: 'Sound orchestra - create a rhythm pattern together.',
      materials: 'Craft materials for instruments, tuning forks',
      groupingStrategies: 'Whole class walk, individual instrument making, group orchestra',
      differentiationStrategies: 'Various instrument complexities',
      accommodations: 'Visual vibration demonstrations, choice in instruments',
      assessmentNotes: 'Assess understanding of sound as vibration',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: energyUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Heat Energy',
      titleFr: 'L\'énergie thermique',
      date: novDate(27), // Thursday
      subject: 'Sciences de la nature',
      duration: 60,
      primaryFocus: 'Understanding heat as a form of energy',
      learningGoals: 'Students will explore sources of heat and how heat moves. Natural French connection: Temperature vocabulary (chaud, froid, tiède, température).',
      vocabulary: ['heat', 'warm', 'cool', 'temperature', 'chaud', 'froid'],
      mindsOn: 'Temperature sorting game - order items from cold to hot.',
      action: 'Heat source investigation. Test materials for keeping things warm.',
      consolidation: 'Design the best winter mitten - what keeps heat in?',
      materials: 'Thermometers, fabric samples, ice cubes, warm water',
      groupingStrategies: 'Whole class game, partner testing, individual design',
      differentiationStrategies: 'Guided to independent investigation',
      accommodations: 'Safety considerations, adult supervision for heat sources',
      assessmentNotes: 'Observe understanding of heat and insulation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: energyUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert all lessons
    console.log(`📝 Creating ${lessons.length} Science lessons for November...`);
    
    for (const lesson of lessons) {
      await prisma.eTFOLessonPlan.create({
        data: lesson
      });
      console.log(`✅ Created: ${lesson.titleFr} - ${lesson.date.toDateString()}`);
    }

    // Link some expectations
    if (expectations.length > 0) {
      console.log('\n🔗 Linking curriculum expectations...');
      const createdLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: emily.id,
          unitPlanId: {
            in: [fallChangesUnit.id, energyUnit.id]
          }
        }
      });

      // Link energy and matter expectations
      const energyExpectations = expectations.filter(e => 
        e.description.toLowerCase().includes('energy') || 
        e.description.toLowerCase().includes('matter') ||
        e.description.toLowerCase().includes('énergie')
      );

      if (energyExpectations.length > 0 && createdLessons.length > 0) {
        for (let i = 0; i < Math.min(3, createdLessons.length); i++) {
          await prisma.lessonExpectation.create({
            data: {
              lessonId: createdLessons[i].id,
              expectationId: energyExpectations[0].id
            }
          });
        }
      }
    }

    console.log('\n✅ November Science lessons created successfully!');
    console.log(`📊 Total: ${lessons.length} lessons`);
    console.log('📅 Date range: November 4-27, 2025');
    console.log('🎯 Themes: Fall Changes & Energy in Our Lives');

  } catch (error) {
    console.error('❌ Error seeding November Science lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedScienceNovemberLessons()
  .then(() => {
    console.log('✅ November Science lesson seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });