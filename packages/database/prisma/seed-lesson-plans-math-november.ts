#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMathNovemberLessons() {
  console.log('➕ Seeding November Math Lessons - Patterns and Shapes...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get the Patterns and Shapes unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Patterns and Shapes',
        startDate: { lte: new Date('2025-11-30') },
        endDate: { gte: new Date('2025-11-01') }
      }
    });

    if (!unitPlan) {
      throw new Error('Patterns and Shapes unit plan not found for November');
    }

    // Get curriculum expectations for Math
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Mathématiques',
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

    // Week 1: November 3-7 - Introduction to Patterns
    lessons.push({
      title: 'Discovering Patterns Around Us',
      titleFr: 'Découvrir les régularités autour de nous',
      date: novDate(3), // Monday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Identifying patterns in our environment',
      learningGoals: 'Students will identify and describe patterns in their surroundings. Natural French connection: Pattern vocabulary (régularité, répéter, continuer).',
      vocabulary: ['pattern', 'repeat', 'continue', 'régularité', 'répéter'],
      mindsOn: 'Pattern hunt around classroom - find repeating patterns.',
      action: 'Create pattern collections from found objects. Sort and describe patterns.',
      consolidation: 'Share favorite pattern and explain the rule.',
      materials: 'Collection materials, pattern cards, sorting trays',
      groupingStrategies: 'Whole class hunt, partner collecting, individual sharing',
      differentiationStrategies: 'Various pattern complexities, visual supports',
      accommodations: 'Concrete materials, peer support',
      assessmentNotes: 'Observe pattern recognition and description abilities',
      assessmentType: 'diagnostic',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'AB and ABC Patterns',
      titleFr: 'Les régularités AB et ABC',
      date: novDate(4), // Tuesday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Creating and extending AB and ABC patterns',
      learningGoals: 'Students will create, extend, and describe AB and ABC patterns. Natural French connection: Use French color and shape words in patterns.',
      vocabulary: ['AB pattern', 'ABC pattern', 'rouge-bleu', 'cercle-carré-triangle'],
      mindsOn: 'Body pattern game - create AB patterns with movements.',
      action: 'Build patterns with manipulatives. Create pattern strips.',
      consolidation: 'Pattern museum - display and describe patterns.',
      materials: 'Pattern blocks, colored cubes, pattern strips',
      groupingStrategies: 'Whole class game, individual building, gallery walk',
      differentiationStrategies: 'Start with AB, progress to ABC, challenge with ABCD',
      accommodations: 'Large manipulatives, pattern starters provided',
      assessmentNotes: 'Track ability to create and extend different pattern types',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Growing Patterns',
      titleFr: 'Les régularités croissantes',
      date: novDate(6), // Thursday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Understanding patterns that grow',
      learningGoals: 'Students will recognize and create growing patterns. Natural French connection: Counting in French as patterns grow.',
      vocabulary: ['growing', 'increasing', 'croissant', 'augmenter', 'plus'],
      mindsOn: 'Staircase building - physical growing pattern.',
      action: 'Create growing patterns with blocks. Draw growing patterns.',
      consolidation: 'Predict next steps in growing patterns.',
      materials: 'Building blocks, grid paper, growth pattern cards',
      groupingStrategies: 'Whole class building, partner work, individual drawing',
      differentiationStrategies: 'Simple (+1) to complex (+2, +3) growth',
      accommodations: 'Concrete materials, number line support',
      assessmentNotes: 'Assess understanding of growth in patterns',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 2: November 10-14 - 2D Shapes Focus
    lessons.push({
      title: '2D Shapes Review',
      titleFr: 'Révision des formes 2D',
      date: novDate(10), // Monday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Identifying and describing 2D shapes',
      learningGoals: 'Students will identify and describe properties of 2D shapes. Natural French connection: Shape vocabulary (cercle, carré, triangle, rectangle).',
      vocabulary: ['circle', 'square', 'triangle', 'rectangle', 'sides', 'corners'],
      mindsOn: 'Shape detective game - find shapes in classroom.',
      action: 'Create shape portraits using cut-out shapes. Label with properties.',
      consolidation: 'Shape riddles - describe shapes for others to guess.',
      materials: 'Shape cutouts, glue, paper, shape attribute cards',
      groupingStrategies: 'Whole class game, individual art, partner riddles',
      differentiationStrategies: 'Basic to complex shapes, varied attribute focus',
      accommodations: 'Pre-cut shapes, attribute checklists',
      assessmentNotes: 'Observe shape identification and property description',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Composing with Shapes',
      titleFr: 'Composer avec des formes',
      date: novDate(12), // Wednesday (Nov 11 is holiday)
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Creating pictures and designs with 2D shapes',
      learningGoals: 'Students will compose pictures using 2D shapes. Natural French connection: Describe compositions in French.',
      vocabulary: ['compose', 'design', 'combiner', 'créer', 'ensemble'],
      mindsOn: 'Tangram puzzle introduction - make simple figures.',
      action: 'Create shape pictures (houses, animals). Count and record shapes used.',
      consolidation: 'Gallery walk - describe shape compositions.',
      materials: 'Tangrams, pattern blocks, recording sheets',
      groupingStrategies: 'Whole class demo, individual creation, partner sharing',
      differentiationStrategies: 'Templates available, open-ended creation option',
      accommodations: 'Larger manipulatives, picture guides',
      assessmentNotes: 'Assess spatial reasoning and shape composition skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Shape Patterns',
      titleFr: 'Les régularités de formes',
      date: novDate(13), // Thursday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Creating patterns with 2D shapes',
      learningGoals: 'Students will create and extend patterns using shapes. Natural French connection: Name shapes in French within patterns.',
      vocabulary: ['shape pattern', 'cercle-carré', 'répéter', 'continuer'],
      mindsOn: 'Human shape patterns - students form shapes with bodies.',
      action: 'Create shape pattern necklaces. Build shape pattern trains.',
      consolidation: 'Pattern swap - extend a partner\'s pattern.',
      materials: 'Shape beads, pattern cards, construction paper shapes',
      groupingStrategies: 'Whole class activity, individual creation, partner work',
      differentiationStrategies: 'Simple to complex patterns, choice of materials',
      accommodations: 'Pattern starters, visual pattern rules',
      assessmentNotes: 'Track pattern creation with shapes',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 3: November 17-21 - 3D Shapes Introduction
    lessons.push({
      title: '3D Shapes in Our World',
      titleFr: 'Les formes 3D dans notre monde',
      date: novDate(17), // Monday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Identifying 3D shapes in the environment',
      learningGoals: 'Students will identify and name 3D shapes around them. Natural French connection: 3D shape vocabulary (cube, sphère, cylindre).',
      vocabulary: ['cube', 'sphere', 'cylinder', 'cone', 'sphère', 'cylindre'],
      mindsOn: '3D shape hunt with mystery bag - feel and guess.',
      action: 'Sort real objects by 3D shape. Create shape charts.',
      consolidation: 'Share findings - which shape is most common?',
      materials: '3D objects, sorting bins, chart materials',
      groupingStrategies: 'Whole class game, small group sorting, class discussion',
      differentiationStrategies: 'Concrete to abstract, varied object complexity',
      accommodations: 'Real objects for manipulation, picture supports',
      assessmentNotes: 'Observe 3D shape recognition and vocabulary use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Building with 3D Shapes',
      titleFr: 'Construire avec des formes 3D',
      date: novDate(18), // Tuesday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Building structures with 3D shapes',
      learningGoals: 'Students will build and describe structures using 3D shapes. Natural French connection: Use position words in French (sur, sous, à côté).',
      vocabulary: ['build', 'stack', 'construire', 'sur', 'sous', 'à côté'],
      mindsOn: 'Block tower challenge - how high can you build?',
      action: 'Build specific structures from building cards. Create own structures.',
      consolidation: 'Structure show and tell - describe your building.',
      materials: 'Building blocks, structure cards, recording sheets',
      groupingStrategies: 'Individual challenge, partner building, whole class sharing',
      differentiationStrategies: 'Simple to complex structures, open-ended option',
      accommodations: 'Larger blocks available, step-by-step cards',
      assessmentNotes: 'Assess spatial reasoning and 3D shape use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Faces of 3D Shapes',
      titleFr: 'Les faces des formes 3D',
      date: novDate(20), // Thursday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Exploring faces on 3D shapes',
      learningGoals: 'Students will identify and count faces on 3D shapes. Natural French connection: Count faces in French.',
      vocabulary: ['face', 'flat', 'curved', 'face', 'plat', 'courbé'],
      mindsOn: 'Shape prints - dip 3D shapes in paint to see faces.',
      action: 'Count and record faces on different 3D shapes. Sort by number of faces.',
      consolidation: 'Face pattern art using shape prints.',
      materials: 'Paint, 3D shapes, paper, recording charts',
      groupingStrategies: 'Whole class demo, partner investigation, individual art',
      differentiationStrategies: 'Focus on basic shapes first, extend to complex',
      accommodations: 'Pre-made prints available, counting aids',
      assessmentNotes: 'Track understanding of faces on 3D shapes',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Week 4: November 24-28 - Combining Patterns and Shapes
    lessons.push({
      title: 'Shape Transformations',
      titleFr: 'Les transformations de formes',
      date: novDate(24), // Monday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Exploring how shapes can change',
      learningGoals: 'Students will explore shape transformations through flips and turns. Natural French connection: Movement vocabulary (tourner, retourner).',
      vocabulary: ['flip', 'turn', 'slide', 'tourner', 'retourner', 'glisser'],
      mindsOn: 'Shape dance - move shapes with your body.',
      action: 'Create transformation patterns with shape tiles. Record movements.',
      consolidation: 'Transformation challenge - copy partner\'s moves.',
      materials: 'Shape tiles, mirrors, movement cards',
      groupingStrategies: 'Whole class movement, individual exploration, partner work',
      differentiationStrategies: 'Simple to complex transformations',
      accommodations: 'Physical demonstrations, guided practice',
      assessmentNotes: 'Observe understanding of shape movements',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Symmetry in Shapes',
      titleFr: 'La symétrie dans les formes',
      date: novDate(25), // Tuesday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Discovering symmetry in shapes and patterns',
      learningGoals: 'Students will identify and create symmetrical shapes and patterns. Natural French connection: Symmetry vocabulary (symétrie, moitié, miroir).',
      vocabulary: ['symmetry', 'mirror', 'half', 'symétrie', 'moitié', 'miroir'],
      mindsOn: 'Mirror game - copy partner\'s movements for symmetry.',
      action: 'Create symmetrical pictures with paint folding. Find symmetry in shapes.',
      consolidation: 'Symmetry hunt - find symmetrical objects.',
      materials: 'Paint, paper, mirrors, shape cutouts',
      groupingStrategies: 'Partner game, individual art, group hunt',
      differentiationStrategies: 'Guided to independent symmetry creation',
      accommodations: 'Mirrors for checking, pre-folded papers',
      assessmentNotes: 'Assess symmetry understanding and creation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    lessons.push({
      title: 'Pattern and Shape Celebration',
      titleFr: 'Célébration des régularités et formes',
      date: novDate(27), // Thursday
      subject: 'Mathématiques',
      duration: 60,
      primaryFocus: 'Celebrating learning about patterns and shapes',
      learningGoals: 'Students will demonstrate their understanding of patterns and shapes through games and activities. Natural French connection: Celebrate in French with shape vocabulary.',
      vocabulary: ['celebrate', 'review', 'célébrer', 'réviser', 'ensemble'],
      mindsOn: 'Pattern and shape bingo in French.',
      action: 'Math carnival stations - pattern making, shape building, shape art.',
      consolidation: 'Share favorite pattern or shape learning.',
      materials: 'Bingo cards, station materials, celebration certificates',
      groupingStrategies: 'Whole class game, rotating stations, circle sharing',
      differentiationStrategies: 'Choice of stations, varied difficulty levels',
      accommodations: 'Partner support at stations, visual aids',
      assessmentNotes: 'Summative observation of pattern and shape understanding',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert all lessons
    console.log(`📝 Creating ${lessons.length} Math lessons for November...`);
    
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
          unitPlanId: unitPlan.id
        }
      });

      // Link geometry expectations to shape lessons
      const geometryExpectations = expectations.filter(e => 
        e.description.toLowerCase().includes('shape') || 
        e.description.toLowerCase().includes('pattern') ||
        e.description.toLowerCase().includes('géométr')
      );

      if (geometryExpectations.length > 0 && createdLessons.length > 0) {
        for (let i = 0; i < Math.min(3, createdLessons.length); i++) {
          await prisma.lessonExpectation.create({
            data: {
              lessonId: createdLessons[i].id,
              expectationId: geometryExpectations[0].id
            }
          });
        }
      }
    }

    console.log('\n✅ November Math lessons created successfully!');
    console.log(`📊 Total: ${lessons.length} lessons`);
    console.log('📅 Date range: November 3-27, 2025');
    console.log('🎯 Theme: Patterns and Shapes - Régularités et formes');

  } catch (error) {
    console.error('❌ Error seeding November Math lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMathNovemberLessons()
  .then(() => {
    console.log('✅ November Math lesson seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });