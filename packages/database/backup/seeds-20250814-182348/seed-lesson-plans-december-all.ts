#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAllDecemberLessons() {
  console.log('❄️ Seeding ALL December 2025 Lessons...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get all December unit plans
    const frenchUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Fall Celebrations',
        startDate: { lte: new Date('2025-12-31') },
        endDate: { gte: new Date('2025-12-01') }
      }
    });

    const mathUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Adding and Subtracting',
        startDate: { lte: new Date('2025-12-31') }
      }
    });

    const scienceUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Energy in Our Lives',
        endDate: { gte: new Date('2025-12-01') }
      }
    });

    const artsUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Winter Celebrations Through Art',
        startDate: { lte: new Date('2025-12-31') }
      }
    });

    if (!frenchUnit || !mathUnit || !scienceUnit || !artsUnit) {
      throw new Error('Missing required unit plans for December');
    }

    const lessons: any[] = [];

    // Helper to get December weekday dates (Dec 1-20, avoiding winter break)
    const decDate = (day: number) => {
      const date = new Date(2025, 11, day); // Month is 0-indexed
      // Skip weekends
      if (date.getDay() === 0) return new Date(2025, 11, day + 1);
      if (date.getDay() === 6) return new Date(2025, 11, day + 2);
      return date;
    };

    // === FRENCH LESSONS (Fall Celebrations → Winter Holidays) ===
    
    // Week 1: December 1-5 - Transition to Winter
    lessons.push({
      title: 'Winter is Here',
      titleFr: 'L\'hiver est arrivé',
      date: decDate(1),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will describe winter arrival using French winter vocabulary: hiver, neige, froid, blanc, glace.',
      mindsOn: 'Winter observation walk: "Qu\'est-ce qui a changé dehors?"',
      action: 'Create winter weather journals with French descriptions. Practice "Il fait froid."',
      consolidation: 'Share winter observations using French weather vocabulary.',
      materials: JSON.stringify(['Journals', 'winter pictures', 'weather cards', 'vocabulary: hiver, neige, froid, blanc, glace, gel']),
      grouping: 'Whole class walk, individual journals, partner sharing',
      accommodations: JSON.stringify(['Visual weather symbols', 'picture supports for vocabulary']),
      differentiationStrategies: JSON.stringify({
        support: 'Picture weather cards, sentence starters, peer helpers',
        extension: 'Complex weather descriptions, seasonal comparisons'
      }),
      assessmentNotes: 'Observe winter vocabulary use and weather descriptions',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'December Traditions',
      titleFr: 'Les traditions de décembre',
      date: decDate(3),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will explore December traditions and learn French vocabulary: tradition, famille, célébrer, fête, joie.',
      mindsOn: 'Tradition sharing circle: "Quelles traditions avez-vous en décembre?"',
      action: 'Create tradition books with French descriptions of family December activities.',
      consolidation: 'Present favorite family tradition in French.',
      materials: JSON.stringify(['Book materials', 'family photos', 'tradition pictures', 'vocabulary: tradition, célébrer, fête, joie']),
      grouping: 'Circle discussion, individual books, presentation sharing',
      accommodations: JSON.stringify(['Family communication support', 'visual tradition examples']),
      differentiationStrategies: JSON.stringify({
        support: 'Tradition examples provided, picture supports',
        extension: 'Compare traditions across cultures'
      }),
      assessmentNotes: 'Track cultural vocabulary and tradition descriptions',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Lights and Stars',
      titleFr: 'Les lumières et les étoiles',
      date: decDate(5),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will describe lights and stars in French: lumière, étoile, briller, scintiller, nuit.',
      mindsOn: 'Star observation activity: Count and describe stars in French.',
      action: 'Create star maps with French labels. Practice "L\'étoile brille."',
      consolidation: 'Star wishes shared in French.',
      materials: JSON.stringify(['Star charts', 'glow sticks', 'dark paper', 'vocabulary: étoile, briller, scintiller, nuit, lumière']),
      grouping: 'Whole class observation, individual charts, wish sharing',
      accommodations: JSON.stringify(['Large print materials', 'tactile star shapes']),
      differentiationStrategies: JSON.stringify({
        support: 'Pre-made star templates, guided vocabulary',
        extension: 'Constellation names in French'
      }),
      assessmentNotes: 'Assess light and sky vocabulary usage',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    // Week 2: December 8-12 - Holiday Preparations
    lessons.push({
      title: 'Holiday Music and Songs',
      titleFr: 'La musique et les chansons de fête',
      date: decDate(8),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will learn holiday songs in French and music vocabulary: musique, chanson, chanter, voix.',
      mindsOn: 'Listening to French holiday songs: "Qu\'est-ce que vous entendez?"',
      action: 'Learn simple French holiday song. Practice rhythm with French words.',
      consolidation: 'Mini concert - perform song for other classes.',
      materials: JSON.stringify(['Holiday music', 'rhythm instruments', 'song sheets', 'vocabulary: musique, chanson, chanter, voix']),
      grouping: 'Whole class singing, small group practice, performance',
      accommodations: JSON.stringify(['Visual song sheets', 'movement for non-singers']),
      differentiationStrategies: JSON.stringify({
        support: 'Repetition, visual cues, peer support',
        extension: 'Add harmony or additional verses'
      }),
      assessmentNotes: 'Observe French pronunciation and musical vocabulary',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Gift of Kindness',
      titleFr: 'Le cadeau de la gentillesse',
      date: decDate(10),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will express kindness in French: gentillesse, cadeau, donner, partager, généreux.',
      mindsOn: 'Kindness brainstorm: "Comment pouvons-nous être gentils?"',
      action: 'Create kindness advent calendar with French kind actions.',
      consolidation: 'Share daily kindness commitment in French.',
      materials: JSON.stringify(['Calendar template', 'kindness action cards', 'decorating supplies', 'vocabulary: gentillesse, cadeau, donner, partager']),
      grouping: 'Class brainstorm, individual calendars, daily sharing',
      accommodations: JSON.stringify(['Pre-written kindness actions', 'picture supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Action examples, visual guides',
        extension: 'Create original kindness ideas'
      }),
      assessmentNotes: 'Track kindness vocabulary and commitment expression',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Stories of Celebration',
      titleFr: 'Les histoires de célébration',
      date: decDate(12),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will tell celebration stories in French: histoire, raconter, célébration, souvenir.',
      mindsOn: 'Story circle: Listen to French celebration story.',
      action: 'Create personal celebration story books with French text and illustrations.',
      consolidation: 'Author\'s chair - share stories with class.',
      materials: JSON.stringify(['Story books', 'illustration materials', 'story examples', 'vocabulary: histoire, raconter, célébration, souvenir']),
      grouping: 'Circle listening, individual creation, author sharing',
      accommodations: JSON.stringify(['Story templates', 'dictation support']),
      differentiationStrategies: JSON.stringify({
        support: 'Sentence frames, picture storytelling',
        extension: 'Complex story structures, detailed illustrations'
      }),
      assessmentNotes: 'Assess storytelling and celebration vocabulary',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    // Week 3: December 15-19 - Winter Break Preparation
    lessons.push({
      title: 'Winter Break Plans',
      titleFr: 'Les projets des vacances d\'hiver',
      date: decDate(15),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will describe winter break plans in French: vacances, projet, famille, repos, amusement.',
      mindsOn: 'Winter break preview: "Qu\'allez-vous faire pendant les vacances?"',
      action: 'Create vacation plan posters with French descriptions.',
      consolidation: 'Gallery walk sharing vacation plans.',
      materials: JSON.stringify(['Poster boards', 'magazines', 'vacation vocabulary cards', 'vocabulary: vacances, projet, repos, amusement']),
      grouping: 'Individual planning, poster creation, gallery sharing',
      accommodations: JSON.stringify(['Family communication, picture planning']),
      differentiationStrategies: JSON.stringify({
        support: 'Vacation picture options, sentence starters',
        extension: 'Detailed itineraries, family interviews'
      }),
      assessmentNotes: 'Observe vacation vocabulary and future tense attempts',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Classroom Memories',
      titleFr: 'Nos souvenirs de classe',
      date: decDate(17),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will reflect on classroom memories in French: souvenir, apprendre, grandir, ami, ensemble.',
      mindsOn: 'Memory sharing: "Quel est votre souvenir préféré de notre classe?"',
      action: 'Create class memory book with French captions and reflections.',
      consolidation: 'Memory celebration - sign each other\'s memory pages.',
      materials: JSON.stringify(['Memory book pages', 'class photos', 'markers', 'vocabulary: souvenir, apprendre, grandir, ami, ensemble']),
      grouping: 'Memory sharing, individual pages, peer signing',
      accommodations: JSON.stringify(['Picture memory prompts', 'scribing support']),
      differentiationStrategies: JSON.stringify({
        support: 'Memory examples, guided reflection',
        extension: 'Detailed memory descriptions'
      }),
      assessmentNotes: 'Track reflection vocabulary and memory expression',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Winter Celebration',
      titleFr: 'Célébration d\'hiver',
      date: decDate(19),
      subject: 'Français langue première',
      duration: 60,
      learningGoals: 'Students will celebrate December learning in French: célébrer, réussir, fierté, accomplir.',
      mindsOn: 'December achievements review: "Qu\'avez-vous appris ce mois-ci?"',
      action: 'Winter celebration stations with French activities and games.',
      consolidation: 'Group celebration song and winter wishes exchange.',
      materials: JSON.stringify(['Station materials', 'celebration music', 'wish cards', 'vocabulary: célébrer, réussir, fierté, accomplir']),
      grouping: 'Achievement discussion, rotating stations, whole group celebration',
      accommodations: JSON.stringify(['Achievement picture cards', 'celebration choices']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided achievement identification',
        extension: 'Leadership roles at stations'
      }),
      assessmentNotes: 'Celebrate French learning growth and vocabulary mastery',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: frenchUnit.id,
      userId: emily.id
    });

    // === MATH LESSONS (Adding and Subtracting) ===
    
    // Week 1: December 1-5 - Addition Introduction
    lessons.push({
      title: 'Addition Stories Begin',
      titleFr: 'Les histoires d\'addition commencent',
      date: decDate(2),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will understand addition as "putting together" using concrete materials. Natural French connection: Count in French (un, deux, trois).',
      mindsOn: 'Story problem: "3 snowflakes fell, then 2 more. How many total?"',
      action: 'Use manipulatives to act out addition stories. Record with pictures and numbers.',
      consolidation: 'Share addition stories created by students.',
      materials: JSON.stringify(['Counting bears', 'story mats', 'recording sheets', 'winter manipulatives']),
      grouping: 'Whole class story, partner manipulation, individual recording',
      accommodations: JSON.stringify(['Concrete manipulatives', 'number line support']),
      differentiationStrategies: JSON.stringify({
        support: 'Start with sums to 5, concrete materials only',
        extension: 'Create multi-step addition stories'
      }),
      assessmentNotes: 'Observe understanding of addition concept with manipulatives',
      assessmentType: 'diagnostic',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Addition to 10',
      titleFr: 'Addition jusqu\'à 10',
      date: decDate(4),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will solve addition problems with sums to 10. Natural French connection: Use French numbers in addition (cinq plus trois égale huit).',
      mindsOn: 'Ten frame warm-up: Fill frames to show addition.',
      action: 'Practice addition with ten frames and manipulatives. Record number sentences.',
      consolidation: 'Addition race - solve problems using ten frames.',
      materials: JSON.stringify(['Ten frames', 'counters', 'addition cards', 'recording sheets']),
      grouping: 'Whole class warm-up, partner practice, individual recording',
      accommodations: JSON.stringify(['Large ten frames', 'color-coded manipulatives']),
      differentiationStrategies: JSON.stringify({
        support: 'Sums to 5 first, guided practice',
        extension: 'Mental math strategies, number bond exploration'
      }),
      assessmentNotes: 'Track addition accuracy and strategy use',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    // Week 2: December 8-12 - Subtraction Introduction
    lessons.push({
      title: 'Subtraction Stories',
      titleFr: 'Les histoires de soustraction',
      date: decDate(9),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will understand subtraction as "taking away" using concrete materials. Natural French connection: Subtraction vocabulary (moins, enlever, reste).',
      mindsOn: 'Story problem: "5 ornaments on tree, 2 fell off. How many left?"',
      action: 'Act out subtraction stories with manipulatives. Draw and record solutions.',
      consolidation: 'Create original subtraction stories for classmates.',
      materials: JSON.stringify(['Holiday manipulatives', 'story mats', 'recording sheets']),
      grouping: 'Whole class story, partner acting, individual recording',
      accommodations: JSON.stringify(['Concrete materials', 'picture story supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Start with taking away 1 or 2',
        extension: 'Complex subtraction scenarios'
      }),
      assessmentNotes: 'Observe subtraction concept understanding',
      assessmentType: 'diagnostic',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Subtraction to 10',
      titleFr: 'Soustraction jusqu\'à 10',
      date: decDate(11),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will solve subtraction problems with numbers to 10. Natural French connection: French subtraction language (dix moins trois égale sept).',
      mindsOn: 'Subtraction with ten frames: Cross out to subtract.',
      action: 'Practice subtraction using various manipulatives and recording methods.',
      consolidation: 'Subtraction hopscotch - solve problems by hopping.',
      materials: JSON.stringify(['Ten frames', 'counters', 'subtraction cards', 'hopscotch mats']),
      grouping: 'Whole class demo, partner practice, active group game',
      accommodations: JSON.stringify(['Visual ten frames', 'movement options']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided subtraction, concrete support',
        extension: 'Missing addend problems'
      }),
      assessmentNotes: 'Assess subtraction accuracy and strategy development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    // Week 3: December 15-19 - Addition and Subtraction Together
    lessons.push({
      title: 'Addition or Subtraction?',
      titleFr: 'Addition ou soustraction?',
      date: decDate(16),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will identify when to add or subtract in word problems. Natural French connection: Problem-solving vocabulary (problème, solution, réfléchir).',
      mindsOn: 'Problem sorting: Is this addition or subtraction?',
      action: 'Solve mixed addition/subtraction problems. Explain reasoning.',
      consolidation: 'Problem-solving relay with mixed operations.',
      materials: JSON.stringify(['Problem cards', 'manipulatives', 'sorting mats', 'reasoning charts']),
      grouping: 'Whole class sorting, partner problem solving, team relay',
      accommodations: JSON.stringify(['Picture problems', 'manipulative support']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear operation cue words',
        extension: 'Two-step problems'
      }),
      assessmentNotes: 'Observe problem-solving strategy selection',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Math Games Celebration',
      titleFr: 'Célébration des jeux de mathématiques',
      date: decDate(18),
      subject: 'Mathématiques',
      duration: 60,
      learningGoals: 'Students will demonstrate addition/subtraction skills through games. Natural French connection: Game vocabulary (jeu, gagner, essayer, réussir).',
      mindsOn: 'Math game preview: Choose your challenge level.',
      action: 'Math game stations: Addition/subtraction games at various levels.',
      consolidation: 'Share favorite game and math learning celebration.',
      materials: JSON.stringify(['Game stations', 'dice', 'cards', 'celebration certificates']),
      grouping: 'Choice discussion, rotating stations, whole group celebration',
      accommodations: JSON.stringify(['Game choice options', 'peer support']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple games, concrete materials',
        extension: 'Strategy games, mental math challenges'
      }),
      assessmentNotes: 'Summative observation of addition/subtraction mastery',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: mathUnit.id,
      userId: emily.id
    });

    // === SCIENCE LESSONS (Energy in Our Lives - continued) ===
    
    // Week 1: December 1-5 - Motion Energy
    lessons.push({
      title: 'Moving and Motion Energy',
      titleFr: 'L\'énergie du mouvement',
      date: decDate(3),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will explore motion as a form of energy. Natural French connection: Movement vocabulary (bouger, rouler, glisser, tomber).',
      mindsOn: 'Motion exploration: How many ways can objects move?',
      action: 'Test different objects rolling, sliding, bouncing. Record observations.',
      consolidation: 'Motion gallery: Display fastest, slowest, most interesting movements.',
      materials: JSON.stringify(['Balls', 'ramps', 'various objects', 'observation sheets']),
      grouping: 'Whole class exploration, partner testing, gallery sharing',
      accommodations: JSON.stringify(['Safe materials', 'guided observations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple predictions, concrete observations',
        extension: 'Measure distances, compare speeds'
      }),
      assessmentNotes: 'Observe understanding of motion as energy',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: scienceUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Energy All Around Us',
      titleFr: 'L\'énergie partout autour de nous',
      date: decDate(5),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will identify energy in their daily environment. Natural French connection: Daily life vocabulary (maison, école, cuisine, chambre).',
      mindsOn: 'Energy detective hunt: Find energy being used right now.',
      action: 'Create energy maps of classroom and home showing where energy is used.',
      consolidation: 'Energy sharing circle: Present one interesting energy discovery.',
      materials: JSON.stringify(['Clipboards', 'energy hunt sheets', 'map templates']),
      grouping: 'Detective hunt, individual mapping, circle presentations',
      accommodations: JSON.stringify(['Picture energy examples', 'guided hunts']),
      differentiationStrategies: JSON.stringify({
        support: 'Obvious energy sources first',
        extension: 'Hidden energy sources, energy chains'
      }),
      assessmentNotes: 'Track energy identification in various contexts',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: scienceUnit.id,
      userId: emily.id
    });

    // Week 2: December 8-12 - Energy Sources
    lessons.push({
      title: 'Where Does Energy Come From?',
      titleFr: 'D\'où vient l\'énergie?',
      date: decDate(10),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will explore different energy sources. Natural French connection: Source vocabulary (soleil, eau, vent, électricité).',
      mindsOn: 'Energy source matching: Connect devices to their energy sources.',
      action: 'Build simple energy demonstrations (solar, wind, water). Record results.',
      consolidation: 'Energy source fair: Present demonstrations to other students.',
      materials: JSON.stringify(['Solar toys', 'pinwheels', 'water wheels', 'demonstration materials']),
      grouping: 'Matching activity, small group building, fair presentations',
      accommodations: JSON.stringify(['Simple demonstrations', 'partner support']),
      differentiationStrategies: JSON.stringify({
        support: 'One energy source focus',
        extension: 'Compare efficiency of different sources'
      }),
      assessmentNotes: 'Assess understanding of energy sources and transformations',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: scienceUnit.id,
      userId: emily.id
    });

    // Week 3: December 15-19 - Energy Conservation
    lessons.push({
      title: 'Saving Energy at School',
      titleFr: 'Économiser l\'énergie à l\'école',
      date: decDate(17),
      subject: 'Sciences de la nature',
      duration: 60,
      learningGoals: 'Students will learn about energy conservation. Natural French connection: Conservation vocabulary (économiser, préserver, attention, éteindre).',
      mindsOn: 'Energy waste detective: Find energy being wasted at school.',
      action: 'Create energy-saving action plan for classroom. Make reminder signs.',
      consolidation: 'Present energy-saving plan to principal.',
      materials: JSON.stringify(['Investigation sheets', 'poster materials', 'reminder templates']),
      grouping: 'Detective pairs, collaborative planning, formal presentation',
      accommodations: JSON.stringify(['Guided investigations', 'template supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple energy-saving actions',
        extension: 'Calculate potential savings, school-wide impact'
      }),
      assessmentNotes: 'Observe understanding of conservation and environmental responsibility',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: scienceUnit.id,
      userId: emily.id
    });

    // === ARTS LESSONS (Winter Celebrations Through Art) ===
    
    // Week 1: December 1-5 - Winter Colors and Textures
    lessons.push({
      title: 'Winter Color Palette',
      titleFr: 'La palette de couleurs d\'hiver',
      date: decDate(2),
      subject: 'Arts visuels',
      duration: 60,
      learningGoals: 'Students will create winter color palettes using cool colors and white. Natural French connection: Winter color vocabulary (blanc, bleu, gris, argenté).',
      mindsOn: 'Winter color hunt: Find winter colors in photographs.',
      action: 'Mix winter colors using paint. Create winter landscape paintings.',
      consolidation: 'Winter art gallery: Display and describe color choices.',
      materials: JSON.stringify(['Paint', 'brushes', 'mixing palettes', 'winter photos']),
      grouping: 'Whole class hunt, individual painting, gallery walk',
      accommodations: JSON.stringify(['Large brushes', 'pre-mixed colors available']),
      differentiationStrategies: JSON.stringify({
        support: 'Color mixing guidance, templates',
        extension: 'Advanced mixing techniques, detailed landscapes'
      }),
      assessmentNotes: 'Observe color mixing skills and winter theme interpretation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: artsUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Frosty Textures',
      titleFr: 'Les textures givrées',
      date: decDate(4),
      subject: 'Arts visuels',
      duration: 60,
      learningGoals: 'Students will create winter textures using various art techniques. Natural French connection: Texture vocabulary (rugueux, lisse, brillant, scintillant).',
      mindsOn: 'Texture exploration: Feel different winter textures (fake snow, ice, etc.).',
      action: 'Create textured winter scenes using salt, cotton, foil, and other materials.',
      consolidation: 'Texture museum: Identify textures by touch.',
      materials: JSON.stringify(['Salt', 'cotton batting', 'foil', 'textured materials', 'glue']),
      grouping: 'Sensory exploration, individual creation, touch museum',
      accommodations: JSON.stringify(['Safe texture materials', 'guided exploration']),
      differentiationStrategies: JSON.stringify({
        support: 'Pre-cut materials, simple techniques',
        extension: 'Complex texture combinations, layering'
      }),
      assessmentNotes: 'Assess texture vocabulary and technique application',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: artsUnit.id,
      userId: emily.id
    });

    // Week 2: December 8-12 - Holiday Decorations
    lessons.push({
      title: 'Paper Snowflakes',
      titleFr: 'Flocons de neige en papier',
      date: decDate(9),
      subject: 'Arts visuels',
      duration: 60,
      learningGoals: 'Students will create symmetrical paper snowflakes. Natural French connection: Symmetry and winter vocabulary (symétrie, flocon, unique, couper).',
      mindsOn: 'Snowflake observation: Look at real snowflake photos.',
      action: 'Fold and cut paper to create symmetrical snowflakes.',
      consolidation: 'Snowflake blizzard: Display all snowflakes together.',
      materials: JSON.stringify(['Paper', 'scissors', 'snowflake photos', 'display materials']),
      grouping: 'Observation discussion, individual cutting, group display',
      accommodations: JSON.stringify(['Safety scissors', 'cutting guides']),
      differentiationStrategies: JSON.stringify({
        support: 'Pre-folded paper, simple cuts',
        extension: 'Complex patterns, multiple folding techniques'
      }),
      assessmentNotes: 'Observe symmetry understanding and cutting skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: artsUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Holiday Cards',
      titleFr: 'Cartes de fête',
      date: decDate(11),
      subject: 'Arts visuels',
      duration: 60,
      learningGoals: 'Students will design and create holiday greeting cards. Natural French connection: Greeting vocabulary (bonjour, salutations, souhaits, bonheur).',
      mindsOn: 'Card design brainstorm: What makes a card special?',
      action: 'Design and create personalized holiday cards using various art techniques.',
      consolidation: 'Card exchange with writing French holiday messages.',
      materials: JSON.stringify(['Card stock', 'art supplies', 'stamps', 'French greeting examples']),
      grouping: 'Brainstorm discussion, individual design, card exchange',
      accommodations: JSON.stringify(['Pre-folded cards', 'greeting templates']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple designs, guided messages',
        extension: 'Complex techniques, original messages'
      }),
      assessmentNotes: 'Track design skills and French greeting integration',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: artsUnit.id,
      userId: emily.id
    });

    // Week 3: December 15-19 - Winter Art Celebration
    lessons.push({
      title: 'Winter Art Exhibition',
      titleFr: 'Exposition d\'art d\'hiver',
      date: decDate(16),
      subject: 'Arts visuels',
      duration: 60,
      learningGoals: 'Students will prepare and present their winter artwork. Natural French connection: Art presentation vocabulary (exposition, présenter, artistique, créer).',
      mindsOn: 'Art gallery preparation: How do we display art professionally?',
      action: 'Set up classroom art gallery with student winter artwork. Write artist statements.',
      consolidation: 'Gallery opening: Present artwork to families and other classes.',
      materials: JSON.stringify(['Display materials', 'artist statement templates', 'gallery labels']),
      grouping: 'Gallery setup collaboration, individual statements, public presentation',
      accommodations: JSON.stringify(['Statement templates', 'presentation choices']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided art descriptions',
        extension: 'Detailed artist statements, gallery guide role'
      }),
      assessmentNotes: 'Summative assessment of winter art learning and presentation skills',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: artsUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Art Reflection and Goals',
      titleFr: 'Réflexion artistique et objectifs',
      date: decDate(18),
      subject: 'Arts visuels',
      duration: 60,
      learningGoals: 'Students will reflect on art learning and set goals. Natural French connection: Reflection vocabulary (réfléchir, apprendre, grandir, objectif).',
      mindsOn: 'Art growth reflection: Compare September and December artwork.',
      action: 'Create art portfolios with growth reflections and future goals.',
      consolidation: 'Art celebration: Share growth and goals with art partners.',
      materials: JSON.stringify(['Portfolio folders', 'artwork samples', 'reflection sheets']),
      grouping: 'Growth comparison, individual portfolios, partner sharing',
      accommodations: JSON.stringify(['Visual growth examples', 'guided reflections']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple growth identification',
        extension: 'Detailed goal setting, technique analysis'
      }),
      assessmentNotes: 'Observe artistic growth awareness and goal-setting skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: artsUnit.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`❄️ Creating ${lessons.length} December lessons...`);
    
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

    console.log('\n✅ December lesson seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Date range: December 1-19, 2025 (before winter break)');
    console.log('🎯 Subjects: French, Math, Science, Arts');
    console.log('\n❄️ December Units:');
    console.log('  - French: Fall Celebrations → Winter Holidays');
    console.log('  - Math: Adding and Subtracting (new unit)');
    console.log('  - Science: Energy in Our Lives (continued)');
    console.log('  - Arts: Winter Celebrations Through Art');

  } catch (error) {
    console.error('❌ Error seeding December lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAllDecemberLessons()
  .then(() => {
    console.log('✅ All December lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });