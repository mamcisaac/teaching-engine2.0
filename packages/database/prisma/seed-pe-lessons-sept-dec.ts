#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPhysicalEducationLessons() {
  console.log('🏃‍♂️ Seeding Physical Education Lessons September-December 2025...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Find PE long-range plan and create unit plan
    const peLongRangePlan = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Éducation physique'
      }
    });

    if (!peLongRangePlan) throw new Error('PE Long Range Plan not found');

    // Create PE unit plan for Sept-Dec
    let peUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        longRangePlanId: peLongRangePlan.id,
        title: 'Active Living - Fall Semester'
      }
    });

    if (!peUnit) {
      peUnit = await prisma.unitPlan.create({
        data: {
          title: 'Active Living - Fall Semester',
          longRangePlanId: peLongRangePlan.id,
          description: 'Fundamental movement skills, active participation, and healthy living for Grade 1 students during fall semester.',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-12-20'),
          userId: emily.id
        }
      });
    }

    const lessons: any[] = [];

    // Helper functions for dates
    const septDate = (day: number) => {
      const date = new Date(2025, 8, day);
      if (date.getDay() === 0) return new Date(2025, 8, day + 1);
      if (date.getDay() === 6) return new Date(2025, 8, day + 2);
      return date;
    };

    const octDate = (day: number) => {
      const date = new Date(2025, 9, day);
      if (date.getDay() === 0) return new Date(2025, 9, day + 1);
      if (date.getDay() === 6) return new Date(2025, 9, day + 2);
      return date;
    };

    const novDate = (day: number) => {
      const date = new Date(2025, 10, day);
      if (date.getDay() === 0) return new Date(2025, 10, day + 1);
      if (date.getDay() === 6) return new Date(2025, 10, day + 2);
      return date;
    };

    const decDate = (day: number) => {
      const date = new Date(2025, 11, day);
      if (date.getDay() === 0) return new Date(2025, 11, day + 1);
      if (date.getDay() === 6) return new Date(2025, 11, day + 2);
      return date;
    };

    // === SEPTEMBER PE LESSONS ===
    
    lessons.push({
      title: 'Gym Safety and Listening',
      titleFr: 'Sécurité au gymnase et écoute',
      date: septDate(10),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will learn gym safety rules and demonstrate active listening skills during physical activities.',
      mindsOn: 'Gym tour and safety discussion: What keeps us safe during PE?',
      action: 'Practice stop/go signals, boundaries, and equipment handling. Simple movement games.',
      consolidation: 'Review safety rules and practice quiet sitting signal.',
      materials: JSON.stringify(['Whistle', 'boundary markers', 'various PE equipment for demonstration']),
      grouping: 'Whole class instruction, individual practice, partner activities',
      accommodations: JSON.stringify(['Visual safety signs', 'clear boundaries', 'simplified instructions']),
      differentiationStrategies: JSON.stringify({
        support: 'Extra demonstration, visual cues, peer buddies',
        extension: 'Leadership roles in safety demonstrations',
        multiModal: 'Visual, auditory, and kinesthetic safety learning'
      }),
      assessmentNotes: 'Observe safety rule following and listening skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Basic Movement Skills',
      titleFr: 'Habiletés de mouvement de base',
      date: septDate(17),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will practice fundamental movement skills: walking, running, jumping, and hopping.',
      mindsOn: 'Movement warm-up: Show me different ways to move your body!',
      action: 'Movement stations: walking lines, running safely, jumping over objects, hopping patterns.',
      consolidation: 'Favorite movement show-and-tell with proper technique.',
      materials: JSON.stringify(['Poly spots', 'small obstacles', 'boundary markers', 'upbeat music']),
      grouping: 'Station rotations in small groups, individual skill practice',
      accommodations: JSON.stringify(['Modified movements', 'shorter distances', 'rest breaks']),
      differentiationStrategies: JSON.stringify({
        support: 'Simplified movements, physical assistance',
        extension: 'Complex movement combinations, leadership',
        multiModal: 'Visual demonstrations, music, tactile equipment'
      }),
      assessmentNotes: 'Track basic movement skill development and effort',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Balance and Coordination',
      titleFr: 'Équilibre et coordination',
      date: septDate(24),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will develop balance and coordination through fun activities and challenges.',
      mindsOn: 'Balance challenge: Can you stand on one foot like a flamingo?',
      action: 'Balance beam walking, one-foot stands, coordination activities with bean bags.',
      consolidation: 'Balance gallery walk showing different balance positions.',
      materials: JSON.stringify(['Balance beams/lines', 'bean bags', 'mats', 'hula hoops']),
      grouping: 'Partner activities, small group rotations, individual challenges',
      accommodations: JSON.stringify(['Lower balance equipment', 'wall support available']),
      differentiationStrategies: JSON.stringify({
        support: 'Wider balance surfaces, helper support',
        extension: 'Dynamic balance challenges, eyes closed',
        multiModal: 'Visual cues, tactile feedback, rhythm'
      }),
      assessmentNotes: 'Observe balance improvement and coordination development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    // === OCTOBER PE LESSONS ===

    lessons.push({
      title: 'Throwing and Catching',
      titleFr: 'Lancer et attraper',
      date: octDate(8),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will practice underhand throwing and two-hand catching with various objects.',
      mindsOn: 'Catching practice with scarves: Watch it float down and catch!',
      action: 'Throwing station work: bean bags, soft balls, underhand technique practice.',
      consolidation: 'Partner throwing and catching showcase with encouragement.',
      materials: JSON.stringify(['Bean bags', 'soft balls', 'scarves', 'targets/buckets']),
      grouping: 'Partner work, small throwing circles, individual practice',
      accommodations: JSON.stringify(['Larger/softer objects', 'shorter distances', 'stationary targets']),
      differentiationStrategies: JSON.stringify({
        support: 'Large, slow objects, close distances',
        extension: 'Moving targets, different throwing styles',
        multiModal: 'Visual tracking, auditory cues, tactile feedback'
      }),
      assessmentNotes: 'Track throwing technique and catching success',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Teamwork Games',
      titleFr: 'Jeux d\'équipe',
      date: octDate(15),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will cooperate in simple team activities and learn to follow game rules.',
      mindsOn: 'Circle time: What does it mean to be a good teammate?',
      action: 'Cooperative games: parachute play, group ball rolling, simple relay races.',
      consolidation: 'Teamwork celebration and sharing what made our teams successful.',
      materials: JSON.stringify(['Parachute', 'large soft balls', 'relay batons', 'teamwork posters']),
      grouping: 'Small teams, whole class parachute, rotating group activities',
      accommodations: JSON.stringify(['Flexible team roles', 'modified participation options']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear role assignments, peer support',
        extension: 'Team leadership opportunities',
        multiModal: 'Visual team signals, verbal encouragement, physical cooperation'
      }),
      assessmentNotes: 'Observe cooperation, rule following, and positive interactions',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Halloween Movement Fun',
      titleFr: 'Mouvement amusant d\'Halloween',
      date: octDate(29),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will practice movement skills through Halloween-themed activities and creative movement.',
      mindsOn: 'Halloween movement warm-up: Move like your favorite Halloween character!',
      action: 'Halloween stations: spider crawls, ghost floating, pumpkin rolling, witch flying.',
      consolidation: 'Halloween movement parade showing creative character movements.',
      materials: JSON.stringify(['Orange balls (pumpkins)', 'white scarves (ghosts)', 'Halloween music', 'character cards']),
      grouping: 'Creative individual movement, station rotations, parade sharing',
      accommodations: JSON.stringify(['Character choice options', 'simplified movements']),
      differentiationStrategies: JSON.stringify({
        support: 'Model movements, simpler characters',
        extension: 'Create original Halloween movements',
        multiModal: 'Music, visual character cards, dramatic play'
      }),
      assessmentNotes: 'Observe creativity, movement quality, and engagement',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    // === NOVEMBER PE LESSONS ===

    lessons.push({
      title: 'Indoor Active Games',
      titleFr: 'Jeux actifs intérieurs',
      date: novDate(5),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will participate in indoor games that develop cardiovascular fitness and enjoyment of movement.',
      mindsOn: 'Energy check: Show me your energy level with body movements!',
      action: 'Indoor game stations: follow the leader, mirror movements, fitness circuits.',
      consolidation: 'Energy celebration and discussion of how exercise makes us feel.',
      materials: JSON.stringify(['Music player', 'movement cards', 'mats', 'various equipment for circuits']),
      grouping: 'Follow-the-leader lines, partner mirroring, circuit rotations',
      accommodations: JSON.stringify(['Modified exercises', 'rest station option']),
      differentiationStrategies: JSON.stringify({
        support: 'Lower intensity options, frequent breaks',
        extension: 'Leadership roles, create own movements',
        multiModal: 'Upbeat music, visual movement cards, social interaction'
      }),
      assessmentNotes: 'Monitor participation, effort, and enjoyment of activity',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Playground Games',
      titleFr: 'Jeux de cour de récréation',
      date: novDate(12),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will learn traditional playground games and practice taking turns and following rules.',
      mindsOn: 'Game memory sharing: What games do you like to play at recess?',
      action: 'Traditional game stations: Duck Duck Goose, Red Light Green Light, Simon Says.',
      consolidation: 'Vote on class favorite game and plan recess play.',
      materials: JSON.stringify(['Boundary markers', 'simple props for games', 'game instruction cards']),
      grouping: 'Large group circles, individual game participation, class discussions',
      accommodations: JSON.stringify(['Simplified rules', 'multiple chances', 'buddy system']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear rule explanations, practice rounds',
        extension: 'Game leadership, rule variations',
        multiModal: 'Verbal instructions, physical demonstrations, visual cues'
      }),
      assessmentNotes: 'Observe rule following, fair play, and social skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Thanksgiving Movement',
      titleFr: 'Mouvement de l\'Action de grâce',
      date: novDate(19),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will express gratitude through movement and participate in harvest-themed physical activities.',
      mindsOn: 'Gratitude movement: Move to show something you\'re thankful for!',
      action: 'Thanksgiving stations: turkey trot running, pumpkin rolling races, corn husking actions.',
      consolidation: 'Gratitude circle sharing our favorite movements and what we\'re thankful for.',
      materials: JSON.stringify(['Orange balls', 'harvest music', 'Thanksgiving movement cards', 'gratitude props']),
      grouping: 'Individual creative movement, station rotations, gratitude sharing circle',
      accommodations: JSON.stringify(['Gratitude expression options', 'movement modifications']),
      differentiationStrategies: JSON.stringify({
        support: 'Movement suggestions, peer models',
        extension: 'Create thanksgiving movement sequences',
        multiModal: 'Music, visual cards, emotional expression'
      }),
      assessmentNotes: 'Observe creative expression and positive participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    // === DECEMBER PE LESSONS ===

    lessons.push({
      title: 'Winter Sports Intro',
      titleFr: 'Introduction aux sports d\'hiver',
      date: decDate(3),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will explore winter sports movements and develop gross motor skills through seasonal activities.',
      mindsOn: 'Winter sports show and tell: What winter activities do you know?',
      action: 'Winter movement stations: skiing motions, skating glides, hockey movements, snowball toss.',
      consolidation: 'Winter sports movement exhibition for other classes.',
      materials: JSON.stringify(['Foam "skis"', 'hockey sticks', 'soft balls (snowballs)', 'winter sports pictures']),
      grouping: 'Station rotations, partner practice, demonstration sharing',
      accommodations: JSON.stringify(['Modified equipment', 'seated options for movements']),
      differentiationStrategies: JSON.stringify({
        support: 'Simplified movements, equipment assistance',
        extension: 'Combine movements, teach others',
        multiModal: 'Visual sport images, kinesthetic practice, social sharing'
      }),
      assessmentNotes: 'Track gross motor development and winter sports interest',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Holiday Dance and Movement',
      titleFr: 'Danse et mouvement des fêtes',
      date: decDate(10),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will express creativity through holiday-themed dance and rhythmic movement.',
      mindsOn: 'Holiday music movement: How does this music make you want to move?',
      action: 'Holiday dance stations: simple line dances, creative movement, ribbon dancing.',
      consolidation: 'Holiday dance celebration performance for families.',
      materials: JSON.stringify(['Holiday music', 'dance ribbons', 'scarves', 'simple instruments']),
      grouping: 'Whole class dances, individual creative movement, performance groups',
      accommodations: JSON.stringify(['Movement choice options', 'seated dance participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple repeated movements, visual demonstrations',
        extension: 'Create original dance moves, lead others',
        multiModal: 'Music, colorful props, performance opportunity'
      }),
      assessmentNotes: 'Observe rhythm, creativity, and joyful participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    lessons.push({
      title: 'Winter Break Activity Prep',
      titleFr: 'Préparation d\'activités des vacances d\'hiver',
      date: decDate(17),
      subject: 'Éducation physique',
      duration: 40,
      learningGoals: 'Students will learn safe winter break activities and practice movements they can do at home.',
      mindsOn: 'Winter break discussion: What active things will you do during vacation?',
      action: 'Home activity stations: indoor exercises, stretching, family games, winter safety.',
      consolidation: 'Winter break activity plan sharing and safety reminder discussion.',
      materials: JSON.stringify(['Activity cards', 'stretching mats', 'family game instructions', 'safety discussion materials']),
      grouping: 'Station rotations, family activity planning, safety discussion circles',
      accommodations: JSON.stringify(['Activity modifications', 'family communication support']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple activity options, family involvement',
        extension: 'Plan family fitness activities, safety leadership',
        multiModal: 'Visual activity cards, physical practice, family planning'
      }),
      assessmentNotes: 'Assess understanding of safe winter activities and home fitness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: peUnit.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🏃‍♂️ Creating ${lessons.length} Physical Education lessons...`);
    
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

    console.log('\n✅ Physical Education lesson seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: September-December 2025');
    console.log('🎯 Focus: Fundamental movement skills, safety, cooperation, fun');
    console.log('⏰ Duration: 40 minutes each (appropriate for Grade 1)');

  } catch (error) {
    console.error('❌ Error seeding PE lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPhysicalEducationLessons()
  .then(() => {
    console.log('✅ All Physical Education lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 PE seeding failed:', error);
    process.exit(1);
  });