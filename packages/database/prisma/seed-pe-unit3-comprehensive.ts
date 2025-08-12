#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEUnit3Comprehensive() {
  console.log('🏃‍♂️ Seeding Unit 3: Jouer avec les objets - 18 Comprehensive Lessons...\n');

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

    const unit3 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: peLongRangePlan.id,
        titleFr: 'Jouer avec les objets'
      }
    });

    if (!unit3) throw new Error('Unit 3: Jouer avec les objets not found');

    // Clear existing lessons for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unit3.id }
    });

    const lessons: any[] = [];

    // Helper functions for PE schedule dates (Tues/Thurs/Fri) - Dec 1 to Jan 31
    const getPEDates = () => {
      const dates: Date[] = [];
      const start = new Date('2025-12-01'); // Dec 1 is Monday, so start Dec 2 (Tuesday)
      const end = new Date('2026-01-31');   // Jan 31 is Saturday
      
      let current = new Date('2025-12-02'); // Dec 2 Tuesday
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5) { // Tue, Thu, Fri
          // Skip winter break dates (Dec 23 - Jan 3)
          if (!(current >= new Date('2025-12-23') && current <= new Date('2026-01-03'))) {
            dates.push(new Date(current));
          }
        }
        current.setDate(current.getDate() + 1);
      }
      return dates.slice(0, 18); // Take exactly 18 lessons
    };

    const peDates = getPEDates();

    // === UNIT 3: JOUER AVEC LES OBJETS (18 LESSONS) ===

    // Lesson 1 - December 2 (Tuesday)
    lessons.push({
      title: 'Introduction to Object Manipulation',
      titleFr: 'Introduction à la manipulation d\'objets',
      date: peDates[0],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore basic object manipulation skills and understand safety with equipment.',
      mindsOn: 'Object exploration: Look at all these different objects - how many ways can you move them safely?',
      action: 'Object stations: bean bag handling, scarf movements, ball exploration, object safety practice, basic manipulation games.',
      consolidation: 'Object safety contract: Create class rules for safe and respectful equipment use.',
      materials: JSON.stringify(['Bean bags', 'scarves', 'various sized balls', 'hoops', 'safety equipment', 'manipulation props']),
      grouping: 'Individual object exploration, partner safety practice, whole class safety discussion',
      accommodations: JSON.stringify(['Adapted objects for different abilities', 'larger/softer objects', 'modified manipulation expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Large, soft objects, guided manipulation, safety reminders',
        extension: 'Multiple object challenges, demonstrate safe practices, help others',
        multiModal: 'Tactile object exploration, visual safety cues, kinesthetic manipulation'
      }),
      assessmentNotes: 'Observe object handling skills, safety awareness, equipment respect',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 2 - December 4 (Thursday)
    lessons.push({
      title: 'Throwing Fundamentals',
      titleFr: 'Fondamentaux du lancer',
      date: peDates[1],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn proper underhand throwing technique with various objects.',
      mindsOn: 'Throwing preparation: Show me how you would gently toss a fragile egg vs. a heavy rock - what\'s different?',
      action: 'Throwing technique stations: underhand form practice, target throwing, distance throwing, object-specific throwing.',
      consolidation: 'Throwing coach training: Teach a partner the key points of underhand throwing.',
      materials: JSON.stringify(['Bean bags', 'soft balls', 'scarves', 'targets/buckets', 'throwing technique posters', 'different weighted objects']),
      grouping: 'Individual technique practice, partner coaching, small group target games',
      accommodations: JSON.stringify(['Closer targets', 'larger objects', 'modified throwing distances', 'assisted throwing']),
      differentiationStrategies: JSON.stringify({
        support: 'Large, light objects, close targets, guided technique',
        extension: 'Smaller objects, distant targets, technique refinement, peer coaching',
        multiModal: 'Visual technique demonstrations, kinesthetic practice, verbal coaching cues'
      }),
      assessmentNotes: 'Track throwing technique development, accuracy improvement, coaching ability',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 3 - December 5 (Friday)
    lessons.push({
      title: 'Catching Skills Development',
      titleFr: 'Développement des habiletés d\'attraper',
      date: peDates[2],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice two-handed catching with objects of various sizes and speeds.',
      mindsOn: 'Catching readiness: Show me your catching position - hands ready, eyes watching, body prepared!',
      action: 'Catching progression stations: self-toss and catch, partner gentle tosses, rolling ball catches, scarf catching.',
      consolidation: 'Catching success celebration: Share your best catch and help someone improve their catching.',
      materials: JSON.stringify(['Various sized balls', 'scarves', 'bean bags', 'catching mitts', 'soft playground balls', 'catching targets']),
      grouping: 'Individual catching practice, partner tossing activities, small group catching games',
      accommodations: JSON.stringify(['Larger, slower objects', 'shorter distances', 'catching assists available']),
      differentiationStrategies: JSON.stringify({
        support: 'Large, slow objects, close distances, guided hand positioning',
        extension: 'Smaller, faster objects, moving catches, one-handed catching',
        multiModal: 'Visual tracking practice, kinesthetic catching, auditory timing cues'
      }),
      assessmentNotes: 'Assess catching success rate, technique improvement, eye-hand coordination',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 4 - December 9 (Tuesday)
    lessons.push({
      title: 'Rolling and Bowling Skills',
      titleFr: 'Habiletés de rouler et jouer aux quilles',
      date: peDates[3],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn to roll balls accurately toward targets using proper bowling technique.',
      mindsOn: 'Rolling investigation: How do you make a ball roll straight toward a target? Let\'s experiment!',
      action: 'Rolling mastery stations: bowling technique, target rolling, distance rolling, rolling games and challenges.',
      consolidation: 'Bowling tournament: Demonstrate rolling skills in a fun, supportive class tournament.',
      materials: JSON.stringify(['Various balls for rolling', 'bowling pins/targets', 'rolling lanes/boundaries', 'scorecards', 'bowling technique cards']),
      grouping: 'Individual technique practice, partner rolling games, small group bowling tournaments',
      accommodations: JSON.stringify(['Larger targets', 'shorter distances', 'ramp assistance if needed', 'modified scoring']),
      differentiationStrategies: JSON.stringify({
        support: 'Large targets, close distances, guided technique, simplified scoring',
        extension: 'Smaller targets, longer distances, advanced techniques, help others',
        multiModal: 'Visual targeting, kinesthetic rolling motion, mathematical scoring'
      }),
      assessmentNotes: 'Observe rolling technique, accuracy development, game participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 5 - December 11 (Thursday)
    lessons.push({
      title: 'Kicking Fundamentals',
      titleFr: 'Fondamentaux du coup de pied',
      date: peDates[4],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn proper kicking technique for accuracy and control with stationary balls.',
      mindsOn: 'Kicking exploration: What part of your foot works best for kicking? How do you aim a kick?',
      action: 'Kicking technique stations: stationary ball kicking, target kicking, kicking form practice, ball control activities.',
      consolidation: 'Kicking skills showcase: Demonstrate your best kicking technique and accuracy.',
      materials: JSON.stringify(['Various soccer balls', 'kicking targets', 'cones for ball placement', 'kicking technique posters', 'goal targets']),
      grouping: 'Individual kicking practice, partner kicking activities, small group target challenges',
      accommodations: JSON.stringify(['Larger balls', 'closer targets', 'modified kicking expectations', 'supported kicking']),
      differentiationStrategies: JSON.stringify({
        support: 'Large, soft balls, close targets, guided foot positioning',
        extension: 'Smaller balls, distant targets, moving ball kicks, technique refinement',
        multiModal: 'Visual kicking demonstrations, kinesthetic foot placement, spatial targeting'
      }),
      assessmentNotes: 'Track kicking technique development, accuracy improvement, ball control skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 6 - December 12 (Friday)
    lessons.push({
      title: 'Hand-Eye Coordination Challenges',
      titleFr: 'Défis de coordination œil-main',
      date: peDates[5],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice coordinating visual tracking with hand movements through various activities.',
      mindsOn: 'Coordination detective: Watch the object with your eyes, prepare your hands - let\'s practice perfect timing!',
      action: 'Coordination stations: balloon tapping, bubble catching, tracking moving objects, hand-eye timing games.',
      consolidation: 'Coordination mastery demonstration: Show your best hand-eye coordination skill and teach it to others.',
      materials: JSON.stringify(['Balloons', 'bubbles', 'scarves', 'lightweight balls', 'coordination challenges', 'tracking objects']),
      grouping: 'Individual coordination practice, partner coordination games, group coordination challenges',
      accommodations: JSON.stringify(['Slower moving objects', 'larger targets', 'supported tracking', 'modified coordination expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Large, slow objects, guided tracking, simplified coordination tasks',
        extension: 'Small, fast objects, complex coordination patterns, help others develop skills',
        multiModal: 'Visual tracking exercises, kinesthetic coordination, rhythm and timing'
      }),
      assessmentNotes: 'Assess hand-eye coordination development, tracking skills, timing improvement',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 7 - December 16 (Tuesday)
    lessons.push({
      title: 'Holiday Object Games',
      titleFr: 'Jeux d\'objets des fêtes',
      date: peDates[6],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will apply object manipulation skills in fun holiday-themed activities and games.',
      mindsOn: 'Holiday magic: Use your object skills to play holiday games - gentle snowball tosses, present passing!',
      action: 'Holiday stations: soft snowball throws, present relay passing, holiday bowling, festive object games.',
      consolidation: 'Holiday games festival: Choose your favorite holiday object game to share with the class.',
      materials: JSON.stringify(['White soft balls (snowballs)', 'wrapped boxes (presents)', 'holiday music', 'festive props', 'holiday-themed targets']),
      grouping: 'Individual holiday skill practice, partner holiday games, group festive activities',
      accommodations: JSON.stringify(['Modified holiday activities', 'inclusive holiday representations', 'adapted object sizes']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple holiday games, guided participation, peer support',
        extension: 'Complex holiday challenges, lead holiday activities, create new games',
        multiModal: 'Visual holiday themes, musical accompaniment, kinesthetic holiday fun'
      }),
      assessmentNotes: 'Observe skill application in games, holiday participation, social interaction',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 8 - December 18 (Thursday)
    lessons.push({
      title: 'Winter Sports Object Skills',
      titleFr: 'Habiletés d\'objets des sports d\'hiver',
      date: peDates[7],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore object manipulation skills related to winter sports activities.',
      mindsOn: 'Winter sports preparation: How do winter athletes use objects - hockey sticks, snowballs, curling stones?',
      action: 'Winter sports stations: hockey stick handling, snowball throwing, curling motion practice, winter object games.',
      consolidation: 'Winter Olympics preparation: Demonstrate your best winter sport object skills for the class Olympics.',
      materials: JSON.stringify(['Foam hockey sticks', 'soft pucks', 'curling stones (modified)', 'winter sports pictures', 'Olympic props']),
      grouping: 'Individual winter skills practice, partner winter sports activities, group Olympic preparation',
      accommodations: JSON.stringify(['Modified winter equipment', 'adapted winter activities', 'inclusive winter sports']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple winter movements, guided equipment use, peer assistance',
        extension: 'Advanced winter skills, teach winter sports, create winter challenges',
        multiModal: 'Visual winter sports images, kinesthetic winter movements, cultural winter connections'
      }),
      assessmentNotes: 'Track winter sports interest, object skill application, Olympic spirit participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 9 - December 19 (Friday)
    lessons.push({
      title: 'Winter Break Activity Preparation',
      titleFr: 'Préparation d\'activités des vacances d\'hiver',
      date: peDates[8],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn object activities they can safely practice at home during winter break.',
      mindsOn: 'Home activity planning: What object games can you play safely at home with family during winter break?',
      action: 'Home activity stations: indoor object games, family activity ideas, safe winter outdoor activities, skill maintenance.',
      consolidation: 'Winter break activity plan: Create a personal plan for staying active with objects during vacation.',
      materials: JSON.stringify(['Home activity cards', 'family game instructions', 'safe activity guidelines', 'winter activity suggestions', 'planning sheets']),
      grouping: 'Individual activity planning, partner idea sharing, family activity brainstorming',
      accommodations: JSON.stringify(['Family-inclusive activities', 'indoor/outdoor options', 'equipment-free alternatives']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple home activities, family involvement, clear safety guidelines',
        extension: 'Complex family challenges, help plan for others, winter activity leadership',
        multiModal: 'Visual activity cards, kinesthetic practice, family communication planning'
      }),
      assessmentNotes: 'Assess understanding of home activities, safety awareness, family engagement planning',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 10 - January 6 (Tuesday) - Back from Winter Break
    lessons.push({
      title: 'Welcome Back Object Skills Review',
      titleFr: 'Retour - révision des habiletés d\'objets',
      date: peDates[9],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will review and refresh object manipulation skills after winter break.',
      mindsOn: 'Winter break sharing: What object activities did you do during vacation? Let\'s get back into PE shape!',
      action: 'Skills review stations: throwing review, catching practice, rolling refresher, winter break activity sharing.',
      consolidation: 'Skills assessment and goal setting: Identify which object skills to focus on improving this term.',
      materials: JSON.stringify(['Review skill cards', 'various manipulation objects', 'skill assessment charts', 'goal-setting materials', 'welcome back props']),
      grouping: 'Individual skill review, partner skill sharing, group welcome-back activities',
      accommodations: JSON.stringify(['Gentle re-introduction to activities', 'modified expectations', 'gradual skill building']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple skill review, guided practice, encouraging feedback',
        extension: 'Advanced skill challenges, help others review, set ambitious goals',
        multiModal: 'Visual skill reminders, kinesthetic practice, social sharing'
      }),
      assessmentNotes: 'Assess skill retention after break, engagement level, goal-setting ability',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 11 - January 8 (Thursday)
    lessons.push({
      title: 'Advanced Throwing Techniques',
      titleFr: 'Techniques avancées de lancer',
      date: peDates[10],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore overhand throwing and learn when to use different throwing techniques.',
      mindsOn: 'Throwing choices: When would you throw underhand vs. overhand? Let\'s learn the differences!',
      action: 'Advanced throwing stations: overhand technique introduction, throw selection practice, accuracy challenges, distance throwing.',
      consolidation: 'Throwing technique decision-making: Demonstrate choosing the right throw for different situations.',
      materials: JSON.stringify(['Various throwing objects', 'technique comparison charts', 'targets at different heights', 'throwing form guides', 'decision cards']),
      grouping: 'Individual technique practice, partner technique comparison, group decision-making activities',
      accommodations: JSON.stringify(['Modified technique expectations', 'supported overhand introduction', 'choice in throwing methods']),
      differentiationStrategies: JSON.stringify({
        support: 'Focus on underhand mastery, gentle overhand introduction, guided decisions',
        extension: 'Refine overhand technique, teach technique differences, complex throwing decisions',
        multiModal: 'Visual technique comparisons, kinesthetic practice, decision-making discussions'
      }),
      assessmentNotes: 'Track technique development, decision-making skills, throwing versatility',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 12 - January 9 (Friday)
    lessons.push({
      title: 'Catching in Different Situations',
      titleFr: 'Attraper dans différentes situations',
      date: peDates[11],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice catching objects thrown at different heights, speeds, and directions.',
      mindsOn: 'Catching challenges: Can you catch high balls, low balls, balls to the side? Let\'s practice all kinds!',
      action: 'Catching variety stations: high catches, low catches, side catches, moving catches, reaction catching.',
      consolidation: 'Catching adaptability showcase: Demonstrate how you adjust your catching for different throws.',
      materials: JSON.stringify(['Various balls', 'height markers', 'catching zones', 'reaction balls', 'catching challenge cards', 'adaptability props']),
      grouping: 'Individual catching practice, partner varied throwing, group catching challenges',
      accommodations: JSON.stringify(['Predictable catches first', 'supported catching positions', 'modified catching expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple, predictable catches, guided positioning, encouragement',
        extension: 'Complex catching challenges, unpredictable catches, help others adapt',
        multiModal: 'Visual catch positioning, kinesthetic adaptation, spatial awareness'
      }),
      assessmentNotes: 'Assess catching adaptability, reaction skills, positional awareness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 13 - January 13 (Tuesday)
    lessons.push({
      title: 'Object Control and Dribbling',
      titleFr: 'Contrôle d\'objet et dribble',
      date: peDates[12],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn basic dribbling skills with hands and feet for object control.',
      mindsOn: 'Object control challenge: How can you keep a ball close to you while moving? Let\'s learn control skills!',
      action: 'Control and dribbling stations: hand dribbling, foot dribbling, object control games, stop-and-go control.',
      consolidation: 'Control mastery demonstration: Show your best object control skills and help others improve.',
      materials: JSON.stringify(['Various balls for dribbling', 'dribbling markers', 'control challenge props', 'hand/foot dribbling guides', 'control game equipment']),
      grouping: 'Individual control practice, partner control activities, group control games',
      accommodations: JSON.stringify(['Larger, slower balls', 'modified control expectations', 'assisted dribbling']),
      differentiationStrategies: JSON.stringify({
        support: 'Large balls, stationary control first, guided technique',
        extension: 'Small balls, moving control, advanced dribbling patterns',
        multiModal: 'Visual control demonstrations, kinesthetic practice, rhythmic control'
      }),
      assessmentNotes: 'Track object control development, dribbling skills, control consistency',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 14 - January 15 (Thursday)
    lessons.push({
      title: 'Striking and Hitting Skills',
      titleFr: 'Habiletés de frappe',
      date: peDates[13],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn basic striking skills using hands, paddles, and other implements.',
      mindsOn: 'Striking exploration: How can you hit objects safely and accurately using different tools?',
      action: 'Striking stations: hand striking, paddle hitting, balloon volleyball, striking accuracy challenges.',
      consolidation: 'Striking skills exhibition: Demonstrate your favorite striking skill and teach proper safety.',
      materials: JSON.stringify(['Foam paddles', 'balloons', 'beach balls', 'striking targets', 'safety equipment', 'striking technique guides']),
      grouping: 'Individual striking practice, partner striking activities, group striking games',
      accommodations: JSON.stringify(['Larger implements', 'slower objects', 'modified striking distances', 'safety supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Large paddles, balloons, close distances, guided technique',
        extension: 'Smaller implements, balls, longer distances, striking combinations',
        multiModal: 'Visual striking demonstrations, kinesthetic practice, safety awareness'
      }),
      assessmentNotes: 'Observe striking technique development, safety awareness, accuracy improvement',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 15 - January 16 (Friday)
    lessons.push({
      title: 'Juggling and Advanced Coordination',
      titleFr: 'Jonglage et coordination avancée',
      date: peDates[14],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore basic juggling skills and advanced hand-eye coordination challenges.',
      mindsOn: 'Juggling magic: Can you keep objects in the air? Let\'s start with simple juggling skills!',
      action: 'Juggling progression stations: scarf juggling, bean bag juggling, ball juggling attempts, coordination challenges.',
      consolidation: 'Juggling show: Perform your best juggling skills and appreciate everyone\'s coordination efforts.',
      materials: JSON.stringify(['Juggling scarves', 'bean bags', 'soft juggling balls', 'juggling progression cards', 'coordination props', 'circus music']),
      grouping: 'Individual juggling practice, partner juggling assistance, group juggling performances',
      accommodations: JSON.stringify(['Start with scarves', 'one-object focus', 'supported juggling attempts', 'celebration of all efforts']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple one-object tosses, scarf juggling, guided practice',
        extension: 'Two-object juggling, advanced patterns, teach juggling basics',
        multiModal: 'Visual juggling patterns, kinesthetic coordination, rhythmic juggling'
      }),
      assessmentNotes: 'Assess coordination development, juggling attempts, persistence and effort',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 16 - January 20 (Tuesday)
    lessons.push({
      title: 'Partner Object Activities',
      titleFr: 'Activités d\'objets en partenaires',
      date: peDates[15],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice object manipulation skills while cooperating and communicating with partners.',
      mindsOn: 'Partner cooperation: How can you and a partner work together to be successful with objects?',
      action: 'Partner stations: cooperative throwing/catching, partner passing, object sharing activities, teamwork challenges.',
      consolidation: 'Partnership appreciation: Thank your partner and share what made your teamwork successful.',
      materials: JSON.stringify(['Partner activity objects', 'cooperation challenge cards', 'teamwork props', 'communication guides', 'partnership certificates']),
      grouping: 'Partner activities throughout, partner rotation opportunities, partnership skill building',
      accommodations: JSON.stringify(['Compatible partner pairings', 'modified cooperation expectations', 'communication supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple partner tasks, guided cooperation, clear communication prompts',
        extension: 'Complex partner challenges, leadership in partnerships, help facilitate cooperation',
        multiModal: 'Visual cooperation cues, kinesthetic partner activities, social skill development'
      }),
      assessmentNotes: 'Observe cooperation skills, communication development, partnership success',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 17 - January 22 (Thursday)
    lessons.push({
      title: 'Creative Object Games',
      titleFr: 'Jeux créatifs avec objets',
      date: peDates[16],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will create and modify games using various objects and demonstrate game leadership.',
      mindsOn: 'Game inventors: Can you create a new game using these objects? What rules would make it fun and safe?',
      action: 'Creative game stations: invent object games, modify existing games, test new game ideas, teach created games.',
      consolidation: 'Game showcase: Present your creative game to the class and lead others in playing it.',
      materials: JSON.stringify(['Various game objects', 'game creation cards', 'rule-making materials', 'creative props', 'game documentation sheets']),
      grouping: 'Small group game creation, individual game leadership, whole class game sharing',
      accommodations: JSON.stringify(['Simple game modifications', 'supported game creation', 'flexible participation rules']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple game ideas, guided creation, peer support in leadership',
        extension: 'Complex game invention, advanced rules, mentor others in game creation',
        multiModal: 'Visual game planning, kinesthetic game testing, social game leadership'
      }),
      assessmentNotes: 'Assess creativity, game leadership, rule understanding, social skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Lesson 18 - January 23 (Friday)
    lessons.push({
      title: 'Object Skills Mastery Celebration',
      titleFr: 'Célébration de maîtrise des habiletés d\'objets',
      date: peDates[17],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will demonstrate all object manipulation skills learned and celebrate their progress.',
      mindsOn: 'Skills journey reflection: Think about all the object skills you\'ve learned - which ones are you most proud of?',
      action: 'Mastery showcase stations: demonstrate throwing, catching, kicking, striking, control skills, creative applications.',
      consolidation: 'Unit celebration and goal setting: Celebrate object skill achievements and set goals for continued learning.',
      materials: JSON.stringify(['All unit objects', 'showcase stations', 'celebration materials', 'skill portfolios', 'achievement certificates', 'goal-setting sheets']),
      grouping: 'Individual skill demonstrations, partner skill sharing, whole class celebration',
      accommodations: JSON.stringify(['Choice in demonstration methods', 'celebration of all progress levels', 'inclusive showcase options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple skill demonstrations, supported showcase participation, celebration of effort and growth',
        extension: 'Advanced skill combinations, help others celebrate, lead reflection discussions',
        multiModal: 'Visual skill demonstrations, kinesthetic mastery display, social celebration, reflective goal setting'
      }),
      assessmentNotes: 'Summative assessment of object manipulation skills, creativity, cooperation, unit learning outcomes',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: unit3.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🏃‍♂️ Creating ${lessons.length} lessons for Unit 3: Jouer avec les objets...`);
    
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

    console.log('\n✅ Unit 3: Jouer avec les objets seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: December 2, 2025 - January 23, 2026 (excluding winter break)');
    console.log('🎯 Focus: Object manipulation, hand-eye coordination, throwing, catching, kicking');
    console.log('⏰ Duration: 45 minutes each (Tues/Thurs/Fri schedule)');
    console.log('🏆 Comprehensive coverage of manipulative skills and object control development');

  } catch (error) {
    console.error('❌ Error seeding Unit 3 lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPEUnit3Comprehensive()
  .then(() => {
    console.log('✅ Unit 3 comprehensive PE lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unit 3 seeding failed:', error);
    process.exit(1);
  });