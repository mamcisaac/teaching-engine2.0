#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEUnit1Comprehensive() {
  console.log('🏃‍♂️ Seeding Unit 1: Mon corps en mouvement - 18 Comprehensive Lessons...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Find PE long-range plan and unit
    const peLongRangePlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Éducation physique'
      }
    });

    if (!peLongRangePlan) throw new Error('PE Long Range Plan not found');

    const unit1 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: peLongRangePlan.id,
        titleFr: 'Mon corps en mouvement'
      }
    });

    if (!unit1) throw new Error('Unit 1: Mon corps en mouvement not found');

    // Clear existing lessons for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unit1.id }
    });

    const lessons: any[] = [];

    // Helper functions for PE schedule dates (Tues/Thurs/Fri)
    const getPEDates = () => {
      const dates: Date[] = [];
      const start = new Date('2025-09-04'); // Sept 4 is Thursday
      const end = new Date('2025-10-17');   // Oct 17 is Friday
      
      let current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5) { // Tue, Thu, Fri
          dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
      return dates.slice(0, 18); // Take exactly 18 lessons
    };

    const peDates = getPEDates();

    // === UNIT 1: MON CORPS EN MOUVEMENT (18 LESSONS) ===

    // Lesson 1 - September 5 (Thursday)
    lessons.push({
      title: 'Gym Safety and Body Awareness',
      titleFr: 'Sécurité au gymnase et conscience corporelle',
      date: peDates[0],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn gym safety rules, identify major body parts, and understand the importance of listening in PE.',
      mindsOn: 'Body parts Simon Says: Touch your head, shoulders, knees! What body parts help us move safely?',
      action: 'Gym tour with safety stations, body parts movement game, listening signal practice, boundary exploration.',
      consolidation: 'Safety pledge creation and body parts reflection: How do we keep our amazing bodies safe?',
      materials: JSON.stringify(['Whistle', 'boundary markers', 'body parts poster', 'safety cones', 'first aid kit (show)', 'movement mats']),
      grouping: 'Whole class instruction, individual body awareness, partner safety checking',
      accommodations: JSON.stringify(['Visual safety signs with pictures', 'clear boundaries marked', 'simplified safety rules', 'peer buddy system']),
      differentiationStrategies: JSON.stringify({
        support: 'Extra demonstration, visual cues, peer buddies, simplified movements',
        extension: 'Safety leadership roles, help demonstrate rules, teach body parts in French',
        multiModal: 'Visual, auditory, kinesthetic safety learning with movement'
      }),
      assessmentNotes: 'Observe safety rule understanding, body parts identification, listening skills, boundary awareness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 2 - September 9 (Tuesday)
    lessons.push({
      title: 'My Amazing Body Systems',
      titleFr: 'Mes systèmes corporels extraordinaires',
      date: peDates[1],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore how their heart, lungs, and muscles work together during physical activity.',
      mindsOn: 'Heart detective: Place hand on chest - what do you feel? Let\'s make our hearts work!',
      action: 'Heart rate stations: resting heart check, movement activities, breathing exercises, muscle feeling games.',
      consolidation: 'Body systems show and tell: Demonstrate how heart beats faster after exercise.',
      materials: JSON.stringify(['Stethoscope (toy)', 'heart rate chart', 'breathing exercises cards', 'soft music', 'movement scarves']),
      grouping: 'Partner heart rate checking, individual body exploration, small group breathing circles',
      accommodations: JSON.stringify(['Modified intensity levels', 'sitting options for heart rate', 'visual breathing guides']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple body system concepts, concrete examples, peer support',
        extension: 'Explain body system connections, lead breathing exercises',
        multiModal: 'Auditory (heartbeat), visual (charts), kinesthetic (movement)'
      }),
      assessmentNotes: 'Track understanding of body systems, ability to feel heart rate changes, engagement with breathing',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 3 - September 11 (Thursday)  
    lessons.push({
      title: 'Basic Locomotor Skills',
      titleFr: 'Habiletés locomotrices de base',
      date: peDates[2],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice fundamental locomotor skills: walking, running, jumping, and hopping with proper form.',
      mindsOn: 'Animal movement parade: Show me how different animals move - walk like a bear, hop like a rabbit!',
      action: 'Locomotor stations: proper walking form, safe running technique, two-foot jumping, one-foot hopping patterns.',
      consolidation: 'Movement skill showcase: Demonstrate best walking, running, jumping, and hopping techniques.',
      materials: JSON.stringify(['Poly spots', 'small obstacles', 'animal movement cards', 'upbeat music', 'balance lines']),
      grouping: 'Station rotations in small groups, individual skill practice, movement demonstrations',
      accommodations: JSON.stringify(['Modified movements for different abilities', 'shorter distances', 'rest breaks as needed']),
      differentiationStrategies: JSON.stringify({
        support: 'Simplified movements, physical assistance, visual demonstrations',
        extension: 'Complex movement combinations, leadership in demonstrations',
        multiModal: 'Visual animal cards, music, tactile equipment, kinesthetic practice'
      }),
      assessmentNotes: 'Assess basic locomotor skill development, form improvement, effort and engagement',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 4 - September 12 (Friday)
    lessons.push({
      title: 'Balance and Coordination Fun',
      titleFr: 'Plaisir d\'équilibre et coordination',
      date: peDates[3],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will develop static and dynamic balance while exploring coordination challenges.',
      mindsOn: 'Statue game: Make a balance statue! Can you balance on one foot like a flamingo?',
      action: 'Balance challenge stations: balance beam walking, one-foot stands, coordination with bean bags, balance poses.',
      consolidation: 'Balance gallery walk: Show different creative balance positions and celebrate everyone\'s success.',
      materials: JSON.stringify(['Balance beams/lines', 'bean bags', 'yoga mats', 'hula hoops', 'balance disc', 'soft obstacles']),
      grouping: 'Partner balance challenges, small group rotations, individual balance exploration',
      accommodations: JSON.stringify(['Lower balance equipment', 'wall support available', 'wider balance surfaces']),
      differentiationStrategies: JSON.stringify({
        support: 'Wider surfaces, helper support, simpler balance positions',
        extension: 'Dynamic balance challenges, eyes closed balance, creative combinations',
        multiModal: 'Visual cues, tactile feedback, proprioceptive awareness'
      }),
      assessmentNotes: 'Observe balance improvement, coordination development, problem-solving in balance challenges',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 5 - September 16 (Tuesday)
    lessons.push({
      title: 'Non-Locomotor Movement Exploration',
      titleFr: 'Exploration des mouvements non-locomoteurs',
      date: peDates[4],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore twisting, bending, stretching, and curling while staying in personal space.',
      mindsOn: 'Shape-changing warm-up: Make your body into different shapes - big, small, twisted, straight!',
      action: 'Non-locomotor stations: stretching sequences, twisting movements, bending challenges, curling positions.',
      consolidation: 'Personal space dance: Create a movement sequence using bend, twist, stretch, curl in your own space.',
      materials: JSON.stringify(['Yoga mats', 'stretching cards', 'soft music', 'scarves', 'personal space markers']),
      grouping: 'Individual space exploration, partner mirroring, small group movement creation',
      accommodations: JSON.stringify(['Modified ranges of motion', 'chair-supported movements', 'gentle stretching options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple movement patterns, visual demonstrations, physical assistance',
        extension: 'Complex movement sequences, creative combinations, leadership roles',
        multiModal: 'Visual movement cards, soothing music, kinesthetic exploration'
      }),
      assessmentNotes: 'Track flexibility improvement, understanding of personal space, movement creativity',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 6 - September 18 (Thursday)
    lessons.push({
      title: 'Heart Rate and Exercise Response',
      titleFr: 'Fréquence cardiaque et réponse à l\'exercice',
      date: peDates[5],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand how their body responds to exercise and learn to monitor these changes.',
      mindsOn: 'Body change detectives: What happens to your body when you exercise? Let\'s investigate!',
      action: 'Exercise response stations: resting vs. active heart rate, breathing changes, body temperature awareness, energy levels.',
      consolidation: 'Body response journal: Draw or write about how exercise makes your body feel different.',
      materials: JSON.stringify(['Heart rate charts', 'exercise intensity cards', 'thermometer strips', 'water bottles', 'reflection journals']),
      grouping: 'Individual body monitoring, partner comparisons, group discussions',
      accommodations: JSON.stringify(['Modified exercise intensities', 'frequent rest periods', 'visual body change charts']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple body change concepts, concrete examples, peer observations',
        extension: 'Explain body responses, help others monitor changes',
        multiModal: 'Kinesthetic awareness, visual charts, verbal reflections'
      }),
      assessmentNotes: 'Assess understanding of exercise effects, ability to identify body changes, health awareness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 7 - September 19 (Friday)
    lessons.push({
      title: 'Posture and Body Alignment',
      titleFr: 'Posture et alignement corporel',
      date: peDates[6],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn about good posture and how proper body alignment helps with movement and health.',
      mindsOn: 'Posture detectives: What makes a tall, strong tower? How can our bodies be strong towers?',
      action: 'Posture stations: standing tall practice, sitting posture, walking with books, spine awareness activities.',
      consolidation: 'Posture superheroes: Create superhero poses demonstrating excellent posture and body alignment.',
      materials: JSON.stringify(['Light books/bean bags for head', 'mirrors', 'posture posters', 'yoga blocks', 'alignment strips']),
      grouping: 'Individual posture practice, partner posture checking, group superhero poses',
      accommodations: JSON.stringify(['Supportive seating options', 'modified alignment expectations', 'posture reminders']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple posture cues, physical prompts, peer models',
        extension: 'Help others with posture, create posture reminder cards',
        multiModal: 'Visual mirrors, tactile feedback, kinesthetic awareness'
      }),
      assessmentNotes: 'Observe posture awareness, body alignment improvement, understanding of posture importance',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 8 - September 23 (Tuesday)
    lessons.push({
      title: 'Warm-Up and Cool-Down Basics',
      titleFr: 'Bases de l\'échauffement et retour au calme',
      date: peDates[7],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn the importance of warming up before activity and cooling down afterward.',
      mindsOn: 'Car engine analogy: How do we start a cold car in winter? How do we prepare our bodies for movement?',
      action: 'Warm-up/cool-down practice: gentle movements to music, stretching sequences, breathing exercises, relaxation.',
      consolidation: 'Create our class warm-up routine: Choose favorite movements for our daily PE warm-up.',
      materials: JSON.stringify(['Calm music', 'stretching mats', 'movement sequence cards', 'breathing exercise guide', 'relaxation props']),
      grouping: 'Whole class warm-up, individual stretching practice, group routine creation',
      accommodations: JSON.stringify(['Modified intensity levels', 'seated options', 'gentle movement alternatives']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple movement patterns, guided practice, visual cues',
        extension: 'Lead warm-up activities, create new stretches, explain benefits',
        multiModal: 'Soothing music, visual sequences, kinesthetic practice'
      }),
      assessmentNotes: 'Assess understanding of warm-up importance, participation in routines, movement quality',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 9 - September 25 (Thursday)
    lessons.push({
      title: 'Spatial Awareness and Personal Space',
      titleFr: 'Conscience spatiale et espace personnel',
      date: peDates[8],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will develop understanding of personal space, general space, and safe movement in shared areas.',
      mindsOn: 'Bubble game: Imagine you\'re inside a soap bubble - how do you move without popping it?',
      action: 'Space awareness stations: personal space practice, general space navigation, bubble boundaries, collision avoidance.',
      consolidation: 'Space masters demonstration: Show how to move safely in general space while respecting others\' bubbles.',
      materials: JSON.stringify(['Hula hoops (personal space)', 'scarves', 'soft boundaries', 'space awareness cones', 'bubble solution (demo)']),
      grouping: 'Individual space exploration, partner space respect, group navigation challenges',
      accommodations: JSON.stringify(['Clearly marked personal spaces', 'reduced group sizes', 'visual space boundaries']),
      differentiationStrategies: JSON.stringify({
        support: 'Concrete space boundaries, guided movement, peer support',
        extension: 'Help others understand space concepts, lead navigation games',
        multiModal: 'Visual boundaries, kinesthetic movement, spatial concepts'
      }),
      assessmentNotes: 'Observe spatial awareness development, respect for others\' space, collision avoidance skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 10 - September 26 (Friday)
    lessons.push({
      title: 'Coordination and Motor Planning',
      titleFr: 'Coordination et planification motrice',
      date: peDates[9],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice coordinating different body parts and planning movement sequences.',
      mindsOn: 'Robot programming: If you were a robot, how would you program yourself to walk across the room?',
      action: 'Coordination stations: opposite arm/leg walking, clapping patterns, simple sequences, cross-lateral movements.',
      consolidation: 'Movement sequence showcase: Perform a 3-step movement sequence with coordination and control.',
      materials: JSON.stringify(['Rhythm instruments', 'sequence cards', 'balance beams', 'coordination props', 'planning sheets']),
      grouping: 'Individual coordination practice, partner sequence work, small group demonstrations',
      accommodations: JSON.stringify(['Simplified sequences', 'visual sequence reminders', 'peer assistance']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple 2-step sequences, guided practice, visual aids',
        extension: 'Complex multi-step sequences, teach others, create new patterns',
        multiModal: 'Visual sequence cards, rhythmic music, kinesthetic practice'
      }),
      assessmentNotes: 'Track coordination improvement, motor planning skills, sequence memory and execution',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 11 - September 30 (Tuesday)
    lessons.push({
      title: 'Flexibility and Stretching Fun',
      titleFr: 'Plaisir de la flexibilité et des étirements',
      date: peDates[10],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn basic stretching exercises and understand how flexibility helps prevent injury.',
      mindsOn: 'Animal stretches: How does a cat stretch when it wakes up? What other animals are great stretchers?',
      action: 'Stretching safari: animal-inspired stretches, gentle yoga poses, flexibility challenges, stretching with props.',
      consolidation: 'Create a bedtime stretching routine: Choose 3 favorite stretches to help relax before sleep.',
      materials: JSON.stringify(['Yoga mats', 'animal stretch cards', 'gentle music', 'stretching straps', 'flexibility props']),
      grouping: 'Individual stretching practice, partner stretching activities, group yoga sequences',
      accommodations: JSON.stringify(['Modified range of motion', 'supported stretching', 'gentle alternatives']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple stretches, physical assistance, comfortable ranges',
        extension: 'Advanced stretches, help others, explain benefits',
        multiModal: 'Visual animal cards, calming music, kinesthetic awareness'
      }),
      assessmentNotes: 'Assess flexibility improvement, understanding of stretching benefits, safe stretching practices',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 12 - October 2 (Thursday)
    lessons.push({
      title: 'Strength and Muscle Awareness',
      titleFr: 'Force et conscience musculaire',
      date: peDates[11],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore how muscles work and practice age-appropriate strengthening activities.',
      mindsOn: 'Strong like superheroes: Show me your strongest pose! What makes superheroes so strong?',
      action: 'Superhero strength stations: bear crawls, wall push-ups, gentle resistance, muscle feeling games.',
      consolidation: 'Muscle appreciation circle: Thank different muscle groups and demonstrate how they help us move.',
      materials: JSON.stringify(['Resistance bands (light)', 'wall space', 'superhero music', 'muscle diagram', 'strength cards']),
      grouping: 'Individual strength activities, partner resistance work, group muscle demonstrations',
      accommodations: JSON.stringify(['Modified exercises', 'assisted movements', 'gentle resistance options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple exercises, assistance as needed, shorter durations',
        extension: 'Additional repetitions, help demonstrate, explain muscle groups',
        multiModal: 'Visual muscle diagrams, kinesthetic exercises, superhero themes'
      }),
      assessmentNotes: 'Observe muscle awareness, understanding of strength benefits, safe exercise practices',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 13 - October 3 (Friday)
    lessons.push({
      title: 'Endurance and Energy Systems',
      titleFr: 'Endurance et systèmes énergétiques',
      date: peDates[12],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will experience different activity intensities and understand how their body uses energy.',
      mindsOn: 'Battery power check: How much energy do you have right now? How do we recharge our body batteries?',
      action: 'Energy stations: slow walking, moderate jogging, quick movements, rest and recovery, energy monitoring.',
      consolidation: 'Energy journal reflection: Draw how your body felt during different energy activities.',
      materials: JSON.stringify(['Activity intensity cards', 'timer', 'energy level charts', 'water bottles', 'reflection journals']),
      grouping: 'Individual energy awareness, partner activity comparisons, group endurance challenges',
      accommodations: JSON.stringify(['Modified intensity levels', 'frequent rest breaks', 'hydration reminders']),
      differentiationStrategies: JSON.stringify({
        support: 'Lower intensity activities, more rest time, simple energy concepts',
        extension: 'Higher intensity challenges, help monitor others, explain energy systems',
        multiModal: 'Visual energy charts, kinesthetic activities, self-reflection'
      }),
      assessmentNotes: 'Track endurance development, understanding of energy concepts, self-monitoring skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 14 - October 7 (Tuesday)
    lessons.push({
      title: 'Body Composition and Healthy Bodies',
      titleFr: 'Composition corporelle et corps en santé',
      date: peDates[13],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will appreciate body diversity and understand that healthy bodies come in different shapes and sizes.',
      mindsOn: 'Body diversity celebration: Look around - we all have amazing, different bodies that can do incredible things!',
      action: 'Healthy body stations: body appreciation activities, strength in diversity games, inclusive movement challenges.',
      consolidation: 'Healthy body pledge: Create promises about respecting and caring for our own and others\' amazing bodies.',
      materials: JSON.stringify(['Body diversity books', 'appreciation mirrors', 'inclusive activity cards', 'celebration props', 'pledge materials']),
      grouping: 'Individual body appreciation, partner diversity discussions, group inclusion activities',
      accommodations: JSON.stringify(['Inclusive activities for all abilities', 'body-positive language', 'celebration of differences']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple appreciation activities, positive reinforcement, peer support',
        extension: 'Lead appreciation activities, help others feel included, create inclusive games',
        multiModal: 'Visual diversity representations, kinesthetic inclusion, social emotional learning'
      }),
      assessmentNotes: 'Observe body positivity, inclusion of others, understanding of healthy diversity',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 15 - October 9 (Thursday)
    lessons.push({
      title: 'Movement Patterns and Efficiency',
      titleFr: 'Patrons de mouvement et efficacité',
      date: peDates[14],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore efficient movement patterns and understand how good technique makes movement easier.',
      mindsOn: 'Movement efficiency race: Which way of moving gets you there with less effort - sloppy or smooth?',
      action: 'Efficiency stations: compare efficient vs. inefficient movements, technique practice, energy conservation games.',
      consolidation: 'Movement coach demonstration: Teach someone the most efficient way to perform a favorite movement.',
      materials: JSON.stringify(['Movement comparison cards', 'technique mirrors', 'efficiency props', 'energy meters', 'coaching badges']),
      grouping: 'Individual technique practice, partner coaching, group movement comparisons',
      accommodations: JSON.stringify(['Modified technique expectations', 'visual technique guides', 'peer assistance']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple technique focuses, guided practice, visual demonstrations',
        extension: 'Refine advanced techniques, coach others, analyze movement efficiency',
        multiModal: 'Visual technique guides, kinesthetic practice, peer teaching'
      }),
      assessmentNotes: 'Assess technique improvement, understanding of movement efficiency, teaching skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 16 - October 10 (Friday)
    lessons.push({
      title: 'Body Systems Integration',
      titleFr: 'Intégration des systèmes corporels',
      date: peDates[15],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand how their body systems work together during physical activity.',
      mindsOn: 'Body teamwork: How do your heart, lungs, muscles, and brain work together like a perfect team?',
      action: 'Body systems relay: activities showing heart-lung connection, muscle-brain coordination, system integration games.',
      consolidation: 'Body systems appreciation: Thank each system and show how they help us move and play.',
      materials: JSON.stringify(['Body systems diagrams', 'integration activity cards', 'stethoscope', 'system props', 'appreciation certificates']),
      grouping: 'Individual system awareness, partner system monitoring, group integration activities',
      accommodations: JSON.stringify(['Simplified system concepts', 'visual system supports', 'concrete examples']),
      differentiationStrategies: JSON.stringify({
        support: 'Basic system understanding, concrete examples, peer explanations',
        extension: 'Explain system interactions, help others understand, lead system activities',
        multiModal: 'Visual diagrams, kinesthetic awareness, verbal explanations'
      }),
      assessmentNotes: 'Track understanding of body systems integration, appreciation for body complexity',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 17 - October 14 (Tuesday)
    lessons.push({
      title: 'Active Living Choices',
      titleFr: 'Choix de vie active',
      date: peDates[16],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will identify ways to be active throughout the day and understand personal responsibility for staying active.',
      mindsOn: 'Active choices detective: Find all the ways to be active from wake-up to bedtime!',
      action: 'Active living stations: daily activity ideas, active transportation, family activities, indoor/outdoor options.',
      consolidation: 'My active day plan: Create a personal plan showing when and how to be active every day.',
      materials: JSON.stringify(['Daily schedule templates', 'activity idea cards', 'active transportation props', 'family activity suggestions', 'planning sheets']),
      grouping: 'Individual activity planning, partner idea sharing, group activity brainstorming',
      accommodations: JSON.stringify(['Modified activity options', 'family support suggestions', 'accessible activity ideas']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple activity choices, guided planning, family involvement',
        extension: 'Complex activity planning, help others plan, research new activities',
        multiModal: 'Visual planning aids, kinesthetic activity sampling, family discussions'
      }),
      assessmentNotes: 'Assess understanding of active living, personal responsibility awareness, planning skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Lesson 18 - October 16 (Thursday)
    lessons.push({
      title: 'My Amazing Body Celebration',
      titleFr: 'Célébration de mon corps extraordinaire',
      date: peDates[17],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will demonstrate and celebrate all the body awareness and movement skills learned in this unit.',
      mindsOn: 'Body appreciation warm-up: Thank your body parts for all the amazing things they\'ve learned to do!',
      action: 'Amazing body showcase stations: demonstrate favorite movements, body system knowledge, healthy choices presentation.',
      consolidation: 'Unit reflection and celebration: Share what you\'ve learned about your amazing body and set goals for continued learning.',
      materials: JSON.stringify(['Celebration decorations', 'showcase stations', 'reflection journals', 'certificate materials', 'camera for documentation']),
      grouping: 'Individual showcases, partner appreciation sharing, whole class celebration',
      accommodations: JSON.stringify(['Choice in demonstration methods', 'celebration of all efforts', 'inclusive showcase options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple demonstrations, supported sharing, celebration of effort',
        extension: 'Advanced demonstrations, help others celebrate, lead reflection discussions',
        multiModal: 'Visual showcases, kinesthetic demonstrations, verbal reflections, social celebration'
      }),
      assessmentNotes: 'Summative assessment of unit learning, movement skill demonstration, body awareness understanding',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: unit1.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🏃‍♂️ Creating ${lessons.length} lessons for Unit 1: Mon corps en mouvement...`);
    
    let created = 0;
    for (const lesson of lessons) {
      try {
        await prisma.eTFOLessonPlan.create({
          data: lesson
        });
        created++;
        console.log(`✅ Created: ${lesson.titleFr} - ${lesson.date.toDateString()}`);
      } catch (error: any) {
        console.error(`❌ Failed to create ${lesson.titleFr}: ${error.message}`);
      }
    }

    console.log('\n✅ Unit 1: Mon corps en mouvement seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: September 5 - October 16, 2025');
    console.log('🎯 Focus: Body awareness, fundamental movements, health-related fitness');
    console.log('⏰ Duration: 45 minutes each (Tues/Thurs/Fri schedule)');
    console.log('🏆 Comprehensive coverage of PE curriculum expectations for body awareness and fitness');

  } catch (error) {
    console.error('❌ Error seeding Unit 1 lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPEUnit1Comprehensive()
  .then(() => {
    console.log('✅ Unit 1 comprehensive PE lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unit 1 seeding failed:', error);
    process.exit(1);
  });