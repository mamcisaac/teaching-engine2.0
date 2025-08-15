#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAllNovemberLessons() {
  console.log('📚 Seeding ALL November 2025 Lessons...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get all November unit plans
    const frenchUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Fall Celebrations',
        startDate: { lte: new Date('2025-11-30') },
        endDate: { gte: new Date('2025-11-01') }
      }
    });

    const mathUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Patterns and Shapes',
        startDate: { lte: new Date('2025-11-30') },
        endDate: { gte: new Date('2025-11-01') }
      }
    });

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

    if (!frenchUnit || !mathUnit || !fallChangesUnit || !energyUnit || !colorsUnit || !celebrationsUnit) {
      throw new Error('Missing required unit plans for November');
    }

    const lessons: any[] = [];

    // Helper to get November weekday dates
    const novDate = (day: number) => {
      const date = new Date(2025, 10, day);
      // Skip weekends
      if (date.getDay() === 0) return new Date(2025, 10, day + 1);
      if (date.getDay() === 6) return new Date(2025, 10, day + 2);
      return date;
    };

    // === FRENCH LESSONS ===
    // Week 1: November 3-7
    lessons.push({
      title: 'Sharing Our Gratitude',
      titleFr: 'Partager notre gratitude',
      date: novDate(3),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will express gratitude in French using vocabulary: merci, reconnaissance, gratitude. Natural French focus on thankfulness expressions.',
      mindsOn: 'Circle time: "Pour quoi êtes-vous reconnaissants?" Share gratitude in French.',
      action: 'Create gratitude cards with French messages. Practice "Je suis reconnaissant(e) pour..."',
      consolidation: 'Gratitude gallery walk - present cards to classmates.',
      materials: JSON.stringify(['Card stock', 'markers', 'gratitude word wall', 'vocabulary: merci, gratitude, reconnaissance, remercier, content, heureux']),
      grouping: 'Whole class discussion, individual creation, partner sharing',
      accommodations: JSON.stringify(['Picture cards for vocabulary', 'scribing support']),
      differentiationStrategies: JSON.stringify({
        support: 'Sentence starters, visual supports, peer helpers',
        extension: 'Complex gratitude expressions, help others with vocabulary'
      }),
      assessmentNotes: 'Observe French vocabulary use in expressions of gratitude',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Autumn Harvest Vocabulary',
      titleFr: 'Le vocabulaire de la récolte d\'automne',
      date: novDate(5),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will identify and use autumn harvest vocabulary in French: récolte, citrouille, pomme, maïs, feuille, arbre.',
      mindsOn: 'Harvest basket mystery: Guess items by French descriptions.',
      action: 'Harvest sorting game with French labels. Create autumn vocabulary booklets.',
      consolidation: 'Harvest bingo with French vocabulary.',
      materials: JSON.stringify(['Harvest items/pictures', 'vocabulary cards', 'booklet materials', 'vocabulary: récolte, citrouille, pomme, maïs, feuille, arbre']),
      grouping: 'Whole class, small groups, pairs',
      accommodations: JSON.stringify(['Real objects for tactile learners', 'peer support']),
      differentiationStrategies: JSON.stringify({
        support: 'Visual supports, hands-on materials',
        extension: 'Create sentences with harvest vocabulary'
      }),
      assessmentNotes: 'Track vocabulary acquisition through games and activities',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Weather in November',
      titleFr: 'La météo en novembre',
      date: novDate(7),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will describe daily weather using French weather vocabulary: froid, nuageux, venteux, pluvieux, brumeux, température.',
      mindsOn: 'Weather reporter role-play: "Quel temps fait-il aujourd\'hui?"',
      action: 'Create weather wheels in French. Practice weather conversations.',
      consolidation: 'Present weather forecast to class in French.',
      materials: JSON.stringify(['Weather wheels', 'weather cards', 'forecast templates', 'vocabulary: froid, nuageux, venteux, pluvieux, brumeux']),
      grouping: 'Whole class, partners, individual work',
      accommodations: JSON.stringify(['Weather picture cards', 'simplified vocabulary options']),
      differentiationStrategies: JSON.stringify({
        support: 'Visual weather symbols, sentence frames',
        extension: 'Create extended weather reports'
      }),
      assessmentNotes: 'Assess weather vocabulary use and sentence formation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    // Week 2: November 10-14 (Remembrance Day)
    lessons.push({
      title: 'Remembrance Day Introduction',
      titleFr: 'Introduction au jour du Souvenir',
      date: novDate(10),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will understand Remembrance Day significance and learn French vocabulary: souvenir, paix, coquelicot, remercier, héros, courage.',
      mindsOn: 'Show poppy: "Qu\'est-ce que c\'est?" Introduce Remembrance Day.',
      action: 'Create paper poppies with French peace messages. Learn "Nous nous souvenons".',
      consolidation: 'Share poppies and peace messages in French.',
      materials: JSON.stringify(['Red paper', 'poppy templates', 'peace vocabulary cards', 'vocabulary: souvenir, paix, coquelicot, héros']),
      grouping: 'Whole class discussion, individual creation, sharing circle',
      accommodations: JSON.stringify(['Scribing support', 'visual vocabulary aids']),
      differentiationStrategies: JSON.stringify({
        support: 'Pre-cut templates, vocabulary supports',
        extension: 'Write longer peace messages'
      }),
      assessmentNotes: 'Observe understanding of Remembrance Day vocabulary',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Peace and Kindness',
      titleFr: 'La paix et la gentillesse',
      date: novDate(12),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will express ideas about peace and kindness using French vocabulary: paix, gentillesse, amitié, partager, aider, ensemble.',
      mindsOn: 'Peace circle: "Comment pouvons-nous montrer la gentillesse?"',
      action: 'Create kindness chains with French actions. Practice kind phrases.',
      consolidation: 'Kindness pledge in French as a class.',
      materials: JSON.stringify(['Paper strips', 'kindness vocabulary', 'pledge poster', 'vocabulary: paix, gentillesse, amitié, partager, aider']),
      grouping: 'Circle time, small groups, whole class',
      accommodations: JSON.stringify(['Visual cues', 'sentence starters', 'partner support']),
      differentiationStrategies: JSON.stringify({
        support: 'Picture supports, peer helpers',
        extension: 'Create kindness book'
      }),
      assessmentNotes: 'Track use of kindness vocabulary and phrases',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Community Helpers',
      titleFr: 'Les aidants de la communauté',
      date: novDate(14),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will identify community helpers and describe their roles in French: pompier, policier, médecin, enseignant, infirmier.',
      mindsOn: 'Community helper charades with French vocabulary.',
      action: 'Create community helper cards with French descriptions. Role-play scenarios.',
      consolidation: 'Thank you cards to community helpers in French.',
      materials: JSON.stringify(['Helper pictures', 'role-play props', 'card materials', 'vocabulary: pompier, policier, médecin, enseignant']),
      grouping: 'Whole class game, partners, individual work',
      accommodations: JSON.stringify(['Picture vocabulary cards', 'peer support for role-play']),
      differentiationStrategies: JSON.stringify({
        support: 'Visual supports, simplified roles',
        extension: 'Create helper stories'
      }),
      assessmentNotes: 'Assess vocabulary retention and usage in context',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    // Week 3: November 17-21
    lessons.push({
      title: 'Winter is Coming',
      titleFr: 'L\'hiver arrive',
      date: novDate(17),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will discuss winter preparations using French winter vocabulary: hiver, neige, froid, manteau, mitaines, écharpe.',
      mindsOn: 'Winter clothing relay: Name items in French.',
      action: 'Design winter wardrobes with French labels. Practice "J\'ai besoin de..."',
      consolidation: 'Fashion show describing winter clothes in French.',
      materials: JSON.stringify(['Winter clothing items/pictures', 'labels', 'vocabulary: hiver, neige, froid, manteau, mitaines, écharpe']),
      grouping: 'Teams for relay, individual design, whole class show',
      accommodations: JSON.stringify(['Visual vocabulary supports', 'peer helpers']),
      differentiationStrategies: JSON.stringify({
        support: 'Real items vs pictures',
        extension: 'Create winter clothing catalogue'
      }),
      assessmentNotes: 'Observe winter vocabulary use and sentence construction',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Animals in Winter',
      titleFr: 'Les animaux en hiver',
      date: novDate(19),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will describe how animals prepare for winter using French: hiberner, migrer, s\'adapter, ours, écureuil, oiseau.',
      mindsOn: 'Animal movement game: Act out winter behaviors.',
      action: 'Create animal winter preparation books in French. Learn animal facts.',
      consolidation: 'Present favorite winter animal in French.',
      materials: JSON.stringify(['Animal pictures', 'book materials', 'fact cards', 'vocabulary: hiberner, migrer, s\'adapter, ours, écureuil']),
      grouping: 'Whole class game, individual books, presentation pairs',
      accommodations: JSON.stringify(['Picture supports', 'simplified vocabulary options']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided book creation',
        extension: 'Research additional animals'
      }),
      assessmentNotes: 'Track animal vocabulary and concept understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Winter Activities',
      titleFr: 'Les activités d\'hiver',
      date: novDate(21),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will describe winter activities using French action words: patiner, glisser, jouer, construire, bonhomme de neige.',
      mindsOn: 'Winter activity charades in French.',
      action: 'Create winter activity collages with French captions. Practice "J\'aime..."',
      consolidation: 'Gallery walk sharing favorite winter activities.',
      materials: JSON.stringify(['Magazines', 'glue', 'paper', 'vocabulary: patiner, glisser, jouer, construire, bonhomme de neige']),
      grouping: 'Whole class game, individual collages, partner sharing',
      accommodations: JSON.stringify(['Sentence starters', 'visual vocabulary aids']),
      differentiationStrategies: JSON.stringify({
        support: 'Pre-cut images available',
        extension: 'Write winter activity stories'
      }),
      assessmentNotes: 'Assess activity vocabulary and preference expressions',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    // Week 4: November 24-28
    lessons.push({
      title: 'Celebrations Around the World',
      titleFr: 'Les célébrations autour du monde',
      date: novDate(24),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will explore different celebrations and learn French vocabulary: fête, célébrer, tradition, famille, lumière, joie.',
      mindsOn: 'Celebration matching game: Match celebrations to French descriptions.',
      action: 'Create celebration cards showing different traditions with French labels.',
      consolidation: 'Share a family celebration tradition in French.',
      materials: JSON.stringify(['Celebration pictures', 'card materials', 'vocabulary: fête, célébrer, tradition, famille, lumière, joie']),
      grouping: 'Whole class game, small groups, individual sharing',
      accommodations: JSON.stringify(['Visual supports', 'family communication for traditions']),
      differentiationStrategies: JSON.stringify({
        support: 'Celebration examples provided',
        extension: 'Compare celebrations across cultures'
      }),
      assessmentNotes: 'Observe celebration vocabulary use and cultural awareness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Light in the Darkness',
      titleFr: 'La lumière dans l\'obscurité',
      date: novDate(26),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will describe different sources of light and their importance in French: lumière, bougie, étoile, briller, éclairer.',
      mindsOn: 'Light sources hunt: Find and name light sources in French.',
      action: 'Create light crafts (paper lanterns) with French light poems.',
      consolidation: 'Light ceremony sharing why light is important.',
      materials: JSON.stringify(['Paper', 'LED tea lights', 'craft materials', 'vocabulary: lumière, bougie, étoile, briller, éclairer']),
      grouping: 'Exploration pairs, individual crafts, circle sharing',
      accommodations: JSON.stringify(['Pre-made templates', 'vocabulary supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple poems provided',
        extension: 'Create original light poems'
      }),
      assessmentNotes: 'Track light vocabulary and symbolic understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Giving and Sharing',
      titleFr: 'Donner et partager',
      date: novDate(28),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will express ideas about giving and sharing using French: cadeau, donner, partager, générosité, gentil, ami.',
      mindsOn: 'Gift-giving circle: Pass and describe imaginary gifts in French.',
      action: 'Create "coupons de gentillesse" (kindness coupons) with French actions.',
      consolidation: 'Exchange kindness coupons with classmates.',
      materials: JSON.stringify(['Coupon templates', 'markers', 'decorative materials', 'vocabulary: cadeau, donner, partager, générosité']),
      grouping: 'Circle activity, individual creation, partner exchange',
      accommodations: JSON.stringify(['Pre-written options', 'peer helpers']),
      differentiationStrategies: JSON.stringify({
        support: 'Kindness action examples',
        extension: 'Create kindness booklet'
      }),
      assessmentNotes: 'Assess giving vocabulary and generous action expressions',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    // === MATH LESSONS ===
    // Week 1: November 3-7
    lessons.push({
      title: 'Discovering Patterns Around Us',
      titleFr: 'Découvrir les régularités autour de nous',
      date: novDate(3),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will identify and describe patterns in their surroundings. Natural French connection: Pattern vocabulary (régularité, répéter, continuer).',
      mindsOn: 'Pattern hunt around classroom - find repeating patterns.',
      action: 'Create pattern collections from found objects. Sort and describe patterns.',
      consolidation: 'Share favorite pattern and explain the rule.',
      materials: JSON.stringify(['Collection materials', 'pattern cards', 'sorting trays']),
      grouping: 'Whole class hunt, partner collecting, individual sharing',
      accommodations: JSON.stringify(['Concrete materials', 'peer support']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple AB patterns first',
        extension: 'Complex ABCD patterns'
      }),
      assessmentNotes: 'Observe pattern recognition and description abilities',
      assessmentType: 'diagnostic',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'AB and ABC Patterns',
      titleFr: 'Les régularités AB et ABC',
      date: novDate(4),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will create, extend, and describe AB and ABC patterns. Natural French connection: Use French color and shape words in patterns.',
      mindsOn: 'Body pattern game - create AB patterns with movements.',
      action: 'Build patterns with manipulatives. Create pattern strips.',
      consolidation: 'Pattern museum - display and describe patterns.',
      materials: JSON.stringify(['Pattern blocks', 'colored cubes', 'pattern strips']),
      grouping: 'Whole class game, individual building, gallery walk',
      accommodations: JSON.stringify(['Large manipulatives', 'pattern starters provided']),
      differentiationStrategies: JSON.stringify({
        support: 'Start with AB patterns',
        extension: 'Create ABCD patterns'
      }),
      assessmentNotes: 'Track ability to create and extend different pattern types',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Growing Patterns',
      titleFr: 'Les régularités croissantes',
      date: novDate(6),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will recognize and create growing patterns. Natural French connection: Counting in French as patterns grow.',
      mindsOn: 'Staircase building - physical growing pattern.',
      action: 'Create growing patterns with blocks. Draw growing patterns.',
      consolidation: 'Predict next steps in growing patterns.',
      materials: JSON.stringify(['Building blocks', 'grid paper', 'growth pattern cards']),
      grouping: 'Whole class building, partner work, individual drawing',
      accommodations: JSON.stringify(['Concrete materials', 'number line support']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple +1 growth',
        extension: 'Complex +2, +3 growth'
      }),
      assessmentNotes: 'Assess understanding of growth in patterns',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    // Week 2: November 10-14 (2D Shapes)
    lessons.push({
      title: '2D Shapes Review',
      titleFr: 'Révision des formes 2D',
      date: novDate(10),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will identify and describe properties of 2D shapes. Natural French connection: Shape vocabulary (cercle, carré, triangle, rectangle).',
      mindsOn: 'Shape detective game - find shapes in classroom.',
      action: 'Create shape portraits using cut-out shapes. Label with properties.',
      consolidation: 'Shape riddles - describe shapes for others to guess.',
      materials: JSON.stringify(['Shape cutouts', 'glue', 'paper', 'shape attribute cards']),
      grouping: 'Whole class game, individual art, partner riddles',
      accommodations: JSON.stringify(['Pre-cut shapes', 'attribute checklists']),
      differentiationStrategies: JSON.stringify({
        support: 'Basic shapes focus',
        extension: 'Complex shape combinations'
      }),
      assessmentNotes: 'Observe shape identification and property description',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Composing with Shapes',
      titleFr: 'Composer avec des formes',
      date: novDate(12),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will compose pictures using 2D shapes. Natural French connection: Describe compositions in French.',
      mindsOn: 'Tangram puzzle introduction - make simple figures.',
      action: 'Create shape pictures (houses, animals). Count and record shapes used.',
      consolidation: 'Gallery walk - describe shape compositions.',
      materials: JSON.stringify(['Tangrams', 'pattern blocks', 'recording sheets']),
      grouping: 'Whole class demo, individual creation, partner sharing',
      accommodations: JSON.stringify(['Larger manipulatives', 'picture guides']),
      differentiationStrategies: JSON.stringify({
        support: 'Templates available',
        extension: 'Create complex designs'
      }),
      assessmentNotes: 'Assess spatial reasoning and shape composition skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Shape Patterns',
      titleFr: 'Les régularités de formes',
      date: novDate(13),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will create and extend patterns using shapes. Natural French connection: Name shapes in French within patterns.',
      mindsOn: 'Human shape patterns - students form shapes with bodies.',
      action: 'Create shape pattern necklaces. Build shape pattern trains.',
      consolidation: 'Pattern swap - extend a partner\'s pattern.',
      materials: JSON.stringify(['Shape beads', 'pattern cards', 'construction paper shapes']),
      grouping: 'Whole class activity, individual creation, partner work',
      accommodations: JSON.stringify(['Pattern starters', 'visual pattern rules']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple shape patterns',
        extension: 'Multi-attribute patterns'
      }),
      assessmentNotes: 'Track pattern creation with shapes',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    // Week 3: November 17-21 (3D Shapes)
    lessons.push({
      title: '3D Shapes in Our World',
      titleFr: 'Les formes 3D dans notre monde',
      date: novDate(17),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will identify and name 3D shapes around them. Natural French connection: 3D shape vocabulary (cube, sphère, cylindre).',
      mindsOn: '3D shape hunt with mystery bag - feel and guess.',
      action: 'Sort real objects by 3D shape. Create shape charts.',
      consolidation: 'Share findings - which shape is most common?',
      materials: JSON.stringify(['3D objects', 'sorting bins', 'chart materials']),
      grouping: 'Whole class game, small group sorting, class discussion',
      accommodations: JSON.stringify(['Real objects for manipulation', 'picture supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Basic 3D shapes',
        extension: 'Complex 3D shapes'
      }),
      assessmentNotes: 'Observe 3D shape recognition and vocabulary use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Building with 3D Shapes',
      titleFr: 'Construire avec des formes 3D',
      date: novDate(18),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will build and describe structures using 3D shapes. Natural French connection: Use position words in French (sur, sous, à côté).',
      mindsOn: 'Block tower challenge - how high can you build?',
      action: 'Build specific structures from building cards. Create own structures.',
      consolidation: 'Structure show and tell - describe your building.',
      materials: JSON.stringify(['Building blocks', 'structure cards', 'recording sheets']),
      grouping: 'Individual challenge, partner building, whole class sharing',
      accommodations: JSON.stringify(['Larger blocks available', 'step-by-step cards']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple structures',
        extension: 'Complex architecture'
      }),
      assessmentNotes: 'Assess spatial reasoning and 3D shape use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Faces of 3D Shapes',
      titleFr: 'Les faces des formes 3D',
      date: novDate(20),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will identify and count faces on 3D shapes. Natural French connection: Count faces in French.',
      mindsOn: 'Shape prints - dip 3D shapes in paint to see faces.',
      action: 'Count and record faces on different 3D shapes. Sort by number of faces.',
      consolidation: 'Face pattern art using shape prints.',
      materials: JSON.stringify(['Paint', '3D shapes', 'paper', 'recording charts']),
      grouping: 'Whole class demo, partner investigation, individual art',
      accommodations: JSON.stringify(['Pre-made prints available', 'counting aids']),
      differentiationStrategies: JSON.stringify({
        support: 'Focus on basic shapes',
        extension: 'Explore complex polyhedra'
      }),
      assessmentNotes: 'Track understanding of faces on 3D shapes',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    // Week 4: November 24-28
    lessons.push({
      title: 'Shape Transformations',
      titleFr: 'Les transformations de formes',
      date: novDate(24),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will explore shape transformations through flips and turns. Natural French connection: Movement vocabulary (tourner, retourner).',
      mindsOn: 'Shape dance - move shapes with your body.',
      action: 'Create transformation patterns with shape tiles. Record movements.',
      consolidation: 'Transformation challenge - copy partner\'s moves.',
      materials: JSON.stringify(['Shape tiles', 'mirrors', 'movement cards']),
      grouping: 'Whole class movement, individual exploration, partner work',
      accommodations: JSON.stringify(['Physical demonstrations', 'guided practice']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple transformations',
        extension: 'Complex transformation sequences'
      }),
      assessmentNotes: 'Observe understanding of shape movements',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Symmetry in Shapes',
      titleFr: 'La symétrie dans les formes',
      date: novDate(25),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will identify and create symmetrical shapes and patterns. Natural French connection: Symmetry vocabulary (symétrie, moitié, miroir).',
      mindsOn: 'Mirror game - copy partner\'s movements for symmetry.',
      action: 'Create symmetrical pictures with paint folding. Find symmetry in shapes.',
      consolidation: 'Symmetry hunt - find symmetrical objects.',
      materials: JSON.stringify(['Paint', 'paper', 'mirrors', 'shape cutouts']),
      grouping: 'Partner game, individual art, group hunt',
      accommodations: JSON.stringify(['Mirrors for checking', 'pre-folded papers']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided symmetry creation',
        extension: 'Multiple lines of symmetry'
      }),
      assessmentNotes: 'Assess symmetry understanding and creation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Pattern and Shape Celebration',
      titleFr: 'Célébration des régularités et formes',
      date: novDate(27),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will demonstrate their understanding of patterns and shapes through games and activities. Natural French connection: Celebrate in French with shape vocabulary.',
      mindsOn: 'Pattern and shape bingo in French.',
      action: 'Math carnival stations - pattern making, shape building, shape art.',
      consolidation: 'Share favorite pattern or shape learning.',
      materials: JSON.stringify(['Bingo cards', 'station materials', 'celebration certificates']),
      grouping: 'Whole class game, rotating stations, circle sharing',
      accommodations: JSON.stringify(['Partner support at stations', 'visual aids']),
      differentiationStrategies: JSON.stringify({
        support: 'Choice of difficulty at stations',
        extension: 'Lead a station activity'
      }),
      assessmentNotes: 'Summative observation of pattern and shape understanding',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    // === SCIENCE LESSONS ===
    // Week 1: November 3-7 (Fall Changes)
    lessons.push({
      title: 'Trees Preparing for Winter',
      titleFr: 'Les arbres se préparent pour l\'hiver',
      date: novDate(4),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will observe and document tree changes as winter approaches. Natural French connection: Tree vocabulary (arbre, feuille, branche, écorce).',
      mindsOn: 'Tree observation walk - what changes do we see?',
      action: 'Create tree journals documenting changes. Compare evergreen vs deciduous.',
      consolidation: 'Share observations using scientific vocabulary.',
      materials: JSON.stringify(['Observation journals', 'pencils', 'tree identification cards']),
      grouping: 'Whole class walk, individual journaling, partner sharing',
      accommodations: JSON.stringify(['Scribing support', 'picture cards for vocabulary']),
      differentiationStrategies: JSON.stringify({
        support: 'Drawing or writing options',
        extension: 'Detailed scientific drawings'
      }),
      assessmentNotes: 'Assess observation skills and vocabulary use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: fallChangesUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Animal Winter Preparations',
      titleFr: 'Les préparations hivernales des animaux',
      date: novDate(6),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will explore different ways animals prepare for winter. Natural French connection: Animal behavior vocabulary (hiberner, migrer, stocker).',
      mindsOn: 'Animal movement game - act out winter preparations.',
      action: 'Sort animals by winter strategy. Create winter preparation books.',
      consolidation: 'Present favorite animal\'s winter strategy.',
      materials: JSON.stringify(['Animal cards', 'sorting mats', 'book-making materials']),
      grouping: 'Whole class game, small group sorting, individual books',
      accommodations: JSON.stringify(['Picture supports', 'partner assistance']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple animal examples',
        extension: 'Research additional animals'
      }),
      assessmentNotes: 'Track understanding of animal adaptations',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: fallChangesUnit.id,
      userId: emily.id
    });

    // Week 2: November 10-14
    lessons.push({
      title: 'Weather Patterns in Fall',
      titleFr: 'Les modèles météorologiques en automne',
      date: novDate(13),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will observe and record weather patterns in late fall. Natural French connection: Weather vocabulary (température, nuage, pluie, vent).',
      mindsOn: 'Weather station tour - explore weather tools.',
      action: 'Create class weather chart. Make weather measurement tools.',
      consolidation: 'Analyze weather data from the week.',
      materials: JSON.stringify(['Thermometer', 'rain gauge materials', 'weather chart']),
      grouping: 'Whole class tour, small groups for tools, class analysis',
      accommodations: JSON.stringify(['Visual weather symbols', 'guided recording']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple measurements',
        extension: 'Complex weather analysis'
      }),
      assessmentNotes: 'Assess data collection and pattern recognition',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: fallChangesUnit.id,
      userId: emily.id
    });

    // Week 3: November 17-21 (Energy Unit Begins)
    lessons.push({
      title: 'What is Energy?',
      titleFr: 'Qu\'est-ce que l\'énergie?',
      date: novDate(18),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will explore what energy is and identify energy in their daily lives. Natural French connection: Energy vocabulary (énergie, mouvement, chaleur).',
      mindsOn: 'Energy scavenger hunt - find things that use energy.',
      action: 'Create energy collages showing different types of energy.',
      consolidation: 'Energy circle - share one way you used energy today.',
      materials: JSON.stringify(['Magazines', 'glue', 'paper', 'energy picture cards']),
      grouping: 'Whole class hunt, individual collages, circle sharing',
      accommodations: JSON.stringify(['Pre-cut pictures available', 'word walls']),
      differentiationStrategies: JSON.stringify({
        support: 'Concrete energy examples',
        extension: 'Abstract energy concepts'
      }),
      assessmentNotes: 'Assess initial understanding of energy concept',
      assessmentType: 'diagnostic',
      isSubFriendly: true,
      unitPlanId: energyUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Light Energy',
      titleFr: 'L\'énergie lumineuse',
      date: novDate(20),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will investigate light energy and its sources. Natural French connection: Light vocabulary (lumière, soleil, lampe, ombre).',
      mindsOn: 'Shadow puppet show - explore light and shadows.',
      action: 'Light source investigation. Create shadow tracings throughout the day.',
      consolidation: 'Share discoveries about how shadows change.',
      materials: JSON.stringify(['Flashlights', 'shadow screens', 'tracing paper']),
      grouping: 'Whole class show, partner investigations, individual tracing',
      accommodations: JSON.stringify(['Hands-on materials', 'partner support']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided exploration',
        extension: 'Light experiments'
      }),
      assessmentNotes: 'Observe understanding of light and shadow relationships',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: energyUnit.id,
      userId: emily.id
    });

    // Week 4: November 24-28
    lessons.push({
      title: 'Sound Energy',
      titleFr: 'L\'énergie sonore',
      date: novDate(25),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will investigate how sound is created and travels. Natural French connection: Sound vocabulary (son, bruit, vibration, écouter).',
      mindsOn: 'Sound walk - identify and categorize sounds.',
      action: 'Make simple musical instruments. Explore vibrations.',
      consolidation: 'Sound orchestra - create a rhythm pattern together.',
      materials: JSON.stringify(['Craft materials for instruments', 'tuning forks']),
      grouping: 'Whole class walk, individual instrument making, group orchestra',
      accommodations: JSON.stringify(['Visual vibration demonstrations', 'choice in instruments']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple instruments',
        extension: 'Complex sound experiments'
      }),
      assessmentNotes: 'Assess understanding of sound as vibration',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: energyUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Heat Energy',
      titleFr: 'L\'énergie thermique',
      date: novDate(27),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will explore sources of heat and how heat moves. Natural French connection: Temperature vocabulary (chaud, froid, tiède, température).',
      mindsOn: 'Temperature sorting game - order items from cold to hot.',
      action: 'Heat source investigation. Test materials for keeping things warm.',
      consolidation: 'Design the best winter mitten - what keeps heat in?',
      materials: JSON.stringify(['Thermometers', 'fabric samples', 'ice cubes', 'warm water']),
      grouping: 'Whole class game, partner testing, individual design',
      accommodations: JSON.stringify(['Safety considerations', 'adult supervision for heat sources']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided investigation',
        extension: 'Heat transfer experiments'
      }),
      assessmentNotes: 'Observe understanding of heat and insulation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: energyUnit.id,
      userId: emily.id
    });

    // === ARTS LESSONS ===
    // Week 1: November 3-7
    lessons.push({
      title: 'Warm and Cool Colors',
      titleFr: 'Les couleurs chaudes et froides',
      date: novDate(5),
      subject: 'Arts',
      duration: 60,
      learningGoals: 'Students will identify and use warm and cool colors to express feelings. Natural French connection: Color vocabulary (chaud, froid, rouge, bleu).',
      mindsOn: 'Color sorting game - warm vs cool colors.',
      action: 'Create two paintings: one warm (fire/sun), one cool (water/ice).',
      consolidation: 'Gallery walk - how do the colors make you feel?',
      materials: JSON.stringify(['Paint', 'brushes', 'paper', 'color wheels']),
      grouping: 'Whole class sorting, individual painting, partner sharing',
      accommodations: JSON.stringify(['Large brushes', 'color cards for reference']),
      differentiationStrategies: JSON.stringify({
        support: 'Templates available',
        extension: 'Color mixing exploration'
      }),
      assessmentNotes: 'Observe color choice and emotional expression',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Mood in Art',
      titleFr: 'L\'humeur dans l\'art',
      date: novDate(7),
      subject: 'Arts',
      duration: 60,
      learningGoals: 'Students will create art that expresses different moods and emotions. Natural French connection: Emotion vocabulary (heureux, triste, calme, excité).',
      mindsOn: 'Emotion charades with music - act out feelings.',
      action: 'Create mood wheels using colors, lines, and shapes.',
      consolidation: 'Mood museum - guess the emotion in each artwork.',
      materials: JSON.stringify(['Paper plates', 'markers', 'crayons', 'mood cards']),
      grouping: 'Whole class game, individual creation, group guessing',
      accommodations: JSON.stringify(['Emotion picture cards', 'partner support']),
      differentiationStrategies: JSON.stringify({
        support: 'Basic emotions',
        extension: 'Complex emotional expressions'
      }),
      assessmentNotes: 'Assess ability to express emotion through art',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id
    });

    // Week 2: November 10-14
    lessons.push({
      title: 'Remembrance Day Poppies',
      titleFr: 'Les coquelicots du jour du Souvenir',
      date: novDate(10),
      subject: 'Arts',
      duration: 60,
      learningGoals: 'Students will create poppy art to honor Remembrance Day. Natural French connection: Remembrance vocabulary (coquelicot, souvenir, paix).',
      mindsOn: 'Look at poppy photographs - observe shapes and colors.',
      action: 'Create mixed-media poppies using paint, tissue paper, and pastels.',
      consolidation: 'Display poppies with messages of peace.',
      materials: JSON.stringify(['Red tissue paper', 'black paint', 'green paper', 'glue']),
      grouping: 'Whole class observation, individual creation, group display',
      accommodations: JSON.stringify(['Pre-cut shapes available', 'adapted tools']),
      differentiationStrategies: JSON.stringify({
        support: 'Templates provided',
        extension: 'Create poppy field scenes'
      }),
      assessmentNotes: 'Observe technique and symbolic understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Texture in Art',
      titleFr: 'La texture dans l\'art',
      date: novDate(14),
      subject: 'Arts',
      duration: 60,
      learningGoals: 'Students will explore and create different textures in their artwork. Natural French connection: Texture vocabulary (lisse, rugueux, doux, dur).',
      mindsOn: 'Texture hunt - find and feel different textures.',
      action: 'Create texture collages using rubbings and found materials.',
      consolidation: 'Texture guessing game - identify textures by touch.',
      materials: JSON.stringify(['Paper', 'crayons', 'textured materials', 'glue']),
      grouping: 'Partner hunt, individual collage, group game',
      accommodations: JSON.stringify(['Large crayons', 'pre-collected materials']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple textures',
        extension: 'Texture combinations'
      }),
      assessmentNotes: 'Track texture vocabulary and technique use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id
    });

    // Week 3: November 17-21
    lessons.push({
      title: 'Autumn Color Study',
      titleFr: 'Étude des couleurs d\'automne',
      date: novDate(19),
      subject: 'Arts',
      duration: 60,
      learningGoals: 'Students will observe and recreate autumn colors in their artwork. Natural French connection: Autumn color vocabulary (orange, brun, jaune, rouge).',
      mindsOn: 'Leaf color matching - match paints to real leaves.',
      action: 'Create autumn landscapes using warm colors.',
      consolidation: 'Autumn art exhibition - describe color choices.',
      materials: JSON.stringify(['Leaves', 'paint', 'sponges', 'paper']),
      grouping: 'Whole class matching, individual painting, gallery walk',
      accommodations: JSON.stringify(['Color mixing support', 'templates available']),
      differentiationStrategies: JSON.stringify({
        support: 'Sponge painting technique',
        extension: 'Advanced color mixing'
      }),
      assessmentNotes: 'Assess color observation and application skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Movement in Art',
      titleFr: 'Le mouvement dans l\'art',
      date: novDate(21),
      subject: 'Arts',
      duration: 60,
      learningGoals: 'Students will create art that suggests movement and energy. Natural French connection: Movement vocabulary (bouger, danser, sauter, courir).',
      mindsOn: 'Dance with ribbons - observe movement patterns.',
      action: 'Create movement paintings using flowing lines and colors.',
      consolidation: 'Movement gallery - act out the movements in artworks.',
      materials: JSON.stringify(['Large paper', 'paint', 'ribbons', 'music']),
      grouping: 'Whole class movement, individual painting, partner acting',
      accommodations: JSON.stringify(['Large paper', 'adapted brushes']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided movements',
        extension: 'Abstract movement art'
      }),
      assessmentNotes: 'Observe ability to represent movement visually',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: colorsUnit.id,
      userId: emily.id
    });

    // Week 4: November 24-28 (Winter Celebrations Begin)
    lessons.push({
      title: 'Celebration Symbols',
      titleFr: 'Les symboles de célébration',
      date: novDate(26),
      subject: 'Arts',
      duration: 60,
      learningGoals: 'Students will identify and create symbols from various celebrations. Natural French connection: Celebration vocabulary (fête, symbole, lumière, étoile).',
      mindsOn: 'Symbol matching - match symbols to celebrations.',
      action: 'Design personal celebration symbols using various materials.',
      consolidation: 'Symbol parade - share and explain symbols.',
      materials: JSON.stringify(['Construction paper', 'foil', 'glitter', 'glue']),
      grouping: 'Whole class game, individual design, parade sharing',
      accommodations: JSON.stringify(['Symbol templates', 'visual examples']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple symbols',
        extension: 'Complex cultural symbols'
      }),
      assessmentNotes: 'Assess cultural awareness and symbol creation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: celebrationsUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Light and Shadow Art',
      titleFr: 'L\'art de lumière et d\'ombre',
      date: novDate(28),
      subject: 'Arts',
      duration: 60,
      learningGoals: 'Students will explore light and shadow in artistic creation. Natural French connection: Light vocabulary (lumière, ombre, briller, éclairer).',
      mindsOn: 'Shadow play with flashlights - create shadow shapes.',
      action: 'Create luminaries and shadow boxes for celebrations.',
      consolidation: 'Light festival - display illuminated artworks.',
      materials: JSON.stringify(['Paper bags', 'tissue paper', 'LED lights', 'boxes']),
      grouping: 'Partner play, individual creation, group display',
      accommodations: JSON.stringify(['Pre-cut designs', 'safety scissors']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple luminary designs',
        extension: 'Complex shadow box scenes'
      }),
      assessmentNotes: 'Observe understanding of light and shadow in art',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: celebrationsUnit.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`📝 Creating ${lessons.length} November lessons...`);
    
    let created = 0;
    for (const lesson of lessons) {
      try {
        await prisma.eTFOLessonPlan.create({
          data: lesson
        });
        created++;
        console.log(`✅ Created: ${lesson.titleFr} (${lesson.subject}) - ${lesson.date.toDateString()}`);
      } catch (error: any) {
        console.error(`❌ Failed to create ${lesson.titleFr}: ${error.message}`);
      }
    }

    console.log('\n✅ November lesson seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Date range: November 3-28, 2025');
    console.log('🎯 Subjects: French, Math, Science, Arts');
    console.log('\n📚 November Units:');
    console.log('  - French: Fall Celebrations');
    console.log('  - Math: Patterns and Shapes');
    console.log('  - Science: Fall Changes → Energy in Our Lives');
    console.log('  - Arts: Colors & Feelings → Winter Celebrations');

  } catch (error) {
    console.error('❌ Error seeding November lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAllNovemberLessons()
  .then(() => {
    console.log('✅ All November lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });