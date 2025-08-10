#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArtsNovemberLessons() {
  console.log('🎨 Seeding November Arts Lessons - Colors & Celebrations...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get both Arts unit plans for November
    const colorsUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Colors and Feelings',
        endDate: { gte: new Date('2025-11-01') }
      }
    });

    const celebrationsUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Winter Celebrations Through Art',
        startDate: { lte: new Date('2025-11-30') }
      }
    });

    if (!colorsUnit || !celebrationsUnit) {
      throw new Error('Arts unit plans not found for November');
    }

    // Get curriculum expectations for Arts
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Arts',
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

    // Week 1: November 3-7 - Colors and Feelings continuation
    lessons.push({
      title: 'Warm and Cool Colors',
      titleFr: 'Les couleurs chaudes et froides',
      date: novDate(5), // Wednesday
      subject: 'Arts',
      duration: 60,
      primaryFocus: 'Exploring warm and cool color families',
      learningGoals: 'Students will identify and use warm and cool colors to express feelings. Natural French connection: Color vocabulary (chaud, froid, rouge, bleu).',
      vocabulary: ['warm colors', 'cool colors', 'couleurs chaudes', 'couleurs froides'],
      mindsOn: 'Color sorting game - warm vs cool colors.',
      action: 'Create two paintings: one warm (fire/sun), one cool (water/ice).',
      consolidation: 'Gallery walk - how do the colors make you feel?',
      materials: 'Paint, brushes, paper, color wheels',
      groupingStrategies: 'Whole class sorting, individual painting, partner sharing',
      differentiationStrategies: 'Color mixing optional, templates available',
      accommodations: 'Large brushes, color cards for reference',
      assessmentNotes: 'Observe color choice and emotional expression',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Mood in Art',
      titleFr: 'L\'humeur dans l\'art',
      date: novDate(7), // Friday
      subject: 'Arts',
      duration: 60,
      primaryFocus: 'Using art to express different moods',
      learningGoals: 'Students will create art that expresses different moods and emotions. Natural French connection: Emotion vocabulary (heureux, triste, calme, excité).',
      vocabulary: ['mood', 'emotion', 'humeur', 'émotion', 'sentiment'],
      mindsOn: 'Emotion charades with music - act out feelings.',
      action: 'Create mood wheels using colors, lines, and shapes.',
      consolidation: 'Mood museum - guess the emotion in each artwork.',
      materials: 'Paper plates, markers, crayons, mood cards',
      groupingStrategies: 'Whole class game, individual creation, group guessing',
      differentiationStrategies: 'Various media choices, emotion complexity',
      accommodations: 'Emotion picture cards, partner support',
      assessmentNotes: 'Assess ability to express emotion through art',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 2: November 10-14 - Colors and Feelings
    lessons.push({
      title: 'Remembrance Day Poppies',
      titleFr: 'Les coquelicots du jour du Souvenir',
      date: novDate(10), // Monday
      subject: 'Arts',
      duration: 60,
      primaryFocus: 'Creating Remembrance Day poppy art',
      learningGoals: 'Students will create poppy art to honor Remembrance Day. Natural French connection: Remembrance vocabulary (coquelicot, souvenir, paix).',
      vocabulary: ['poppy', 'remembrance', 'coquelicot', 'souvenir', 'rouge'],
      mindsOn: 'Look at poppy photographs - observe shapes and colors.',
      action: 'Create mixed-media poppies using paint, tissue paper, and pastels.',
      consolidation: 'Display poppies with messages of peace.',
      materials: 'Red tissue paper, black paint, green paper, glue',
      groupingStrategies: 'Whole class observation, individual creation, group display',
      differentiationStrategies: 'Various techniques offered, choice in materials',
      accommodations: 'Pre-cut shapes available, adapted tools',
      assessmentNotes: 'Observe technique and symbolic understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Texture in Art',
      titleFr: 'La texture dans l\'art',
      date: novDate(14), // Friday
      subject: 'Arts',
      duration: 60,
      primaryFocus: 'Exploring texture through rubbing and printing',
      learningGoals: 'Students will explore and create different textures in their artwork. Natural French connection: Texture vocabulary (lisse, rugueux, doux, dur).',
      vocabulary: ['texture', 'rough', 'smooth', 'rugueux', 'lisse', 'doux'],
      mindsOn: 'Texture hunt - find and feel different textures.',
      action: 'Create texture collages using rubbings and found materials.',
      consolidation: 'Texture guessing game - identify textures by touch.',
      materials: 'Paper, crayons, textured materials, glue',
      groupingStrategies: 'Partner hunt, individual collage, group game',
      differentiationStrategies: 'Varied texture complexity',
      accommodations: 'Large crayons, pre-collected materials',
      assessmentNotes: 'Track texture vocabulary and technique use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 3: November 17-21 - Transition week
    lessons.push({
      title: 'Autumn Color Study',
      titleFr: 'Étude des couleurs d\'automne',
      date: novDate(19), // Wednesday
      subject: 'Arts',
      duration: 60,
      primaryFocus: 'Capturing autumn colors in art',
      learningGoals: 'Students will observe and recreate autumn colors in their artwork. Natural French connection: Autumn color vocabulary (orange, brun, jaune, rouge).',
      vocabulary: ['autumn', 'fall colors', 'automne', 'orange', 'brun'],
      mindsOn: 'Leaf color matching - match paints to real leaves.',
      action: 'Create autumn landscapes using warm colors.',
      consolidation: 'Autumn art exhibition - describe color choices.',
      materials: 'Leaves, paint, sponges, paper',
      groupingStrategies: 'Whole class matching, individual painting, gallery walk',
      differentiationStrategies: 'Sponge painting or brush option',
      accommodations: 'Color mixing support, templates available',
      assessmentNotes: 'Assess color observation and application skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Movement in Art',
      titleFr: 'Le mouvement dans l\'art',
      date: novDate(21), // Friday
      subject: 'Arts',
      duration: 60,
      primaryFocus: 'Creating art that shows movement',
      learningGoals: 'Students will create art that suggests movement and energy. Natural French connection: Movement vocabulary (bouger, danser, sauter, courir).',
      vocabulary: ['movement', 'flow', 'mouvement', 'ligne', 'énergie'],
      mindsOn: 'Dance with ribbons - observe movement patterns.',
      action: 'Create movement paintings using flowing lines and colors.',
      consolidation: 'Movement gallery - act out the movements in artworks.',
      materials: 'Large paper, paint, ribbons, music',
      groupingStrategies: 'Whole class movement, individual painting, partner acting',
      differentiationStrategies: 'Various painting techniques offered',
      accommodations: 'Large paper, adapted brushes',
      assessmentNotes: 'Observe ability to represent movement visually',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 4: November 24-28 - Winter Celebrations Through Art begins
    lessons.push({
      title: 'Celebration Symbols',
      titleFr: 'Les symboles de célébration',
      date: novDate(26), // Wednesday
      subject: 'Arts',
      duration: 60,
      primaryFocus: 'Exploring symbols used in different celebrations',
      learningGoals: 'Students will identify and create symbols from various celebrations. Natural French connection: Celebration vocabulary (fête, symbole, lumière, étoile).',
      vocabulary: ['symbol', 'celebration', 'symbole', 'fête', 'tradition'],
      mindsOn: 'Symbol matching - match symbols to celebrations.',
      action: 'Design personal celebration symbols using various materials.',
      consolidation: 'Symbol parade - share and explain symbols.',
      materials: 'Construction paper, foil, glitter, glue',
      groupingStrategies: 'Whole class game, individual design, parade sharing',
      differentiationStrategies: 'Simple to complex symbols',
      accommodations: 'Symbol templates, visual examples',
      assessmentNotes: 'Assess cultural awareness and symbol creation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: celebrationsUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Light and Shadow Art',
      titleFr: 'L\'art de lumière et d\'ombre',
      date: novDate(28), // Friday
      subject: 'Arts',
      duration: 60,
      primaryFocus: 'Creating art with light and shadow',
      learningGoals: 'Students will explore light and shadow in artistic creation. Natural French connection: Light vocabulary (lumière, ombre, briller, éclairer).',
      vocabulary: ['light', 'shadow', 'contrast', 'lumière', 'ombre'],
      mindsOn: 'Shadow play with flashlights - create shadow shapes.',
      action: 'Create luminaries and shadow boxes for celebrations.',
      consolidation: 'Light festival - display illuminated artworks.',
      materials: 'Paper bags, tissue paper, LED lights, boxes',
      groupingStrategies: 'Partner play, individual creation, group display',
      differentiationStrategies: 'Various luminary designs offered',
      accommodations: 'Pre-cut designs, safety scissors',
      assessmentNotes: 'Observe understanding of light and shadow in art',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: celebrationsUnit.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert all lessons
    console.log(`📝 Creating ${lessons.length} Arts lessons for November...`);
    
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
            in: [colorsUnit.id, celebrationsUnit.id]
          }
        }
      });

      // Link visual arts expectations
      const visualArtsExpectations = expectations.filter(e => 
        e.description.toLowerCase().includes('create') || 
        e.description.toLowerCase().includes('express') ||
        e.description.toLowerCase().includes('art')
      );

      if (visualArtsExpectations.length > 0 && createdLessons.length > 0) {
        for (let i = 0; i < Math.min(3, createdLessons.length); i++) {
          await prisma.lessonExpectation.create({
            data: {
              lessonId: createdLessons[i].id,
              expectationId: visualArtsExpectations[0].id
            }
          });
        }
      }
    }

    console.log('\n✅ November Arts lessons created successfully!');
    console.log(`📊 Total: ${lessons.length} lessons`);
    console.log('📅 Date range: November 5-28, 2025');
    console.log('🎯 Themes: Colors & Feelings, Winter Celebrations Through Art');

  } catch (error) {
    console.error('❌ Error seeding November Arts lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedArtsNovemberLessons()
  .then(() => {
    console.log('✅ November Arts lesson seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });