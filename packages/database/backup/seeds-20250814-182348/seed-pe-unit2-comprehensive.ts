#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEUnit2Comprehensive() {
  console.log('🏃‍♂️ Seeding Unit 2: Bouger partout - 15 Comprehensive Lessons...\n');

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

    const unit2 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: peLongRangePlan.id,
        titleFr: 'Bouger partout'
      }
    });

    if (!unit2) throw new Error('Unit 2: Bouger partout not found');

    // Clear existing lessons for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unit2.id }
    });

    const lessons: any[] = [];

    // Helper functions for PE schedule dates (Tues/Thurs/Fri)
    const getPEDates = () => {
      const dates: Date[] = [];
      const start = new Date('2025-10-17'); // Oct 17 is Friday - continue from Unit 1
      const end = new Date('2025-11-28');   // Nov 28 is Friday
      
      let current = new Date(start);
      current.setDate(current.getDate() + 4); // Start Oct 21 (Tuesday)
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5) { // Tue, Thu, Fri
          dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
      return dates.slice(0, 15); // Take exactly 15 lessons
    };

    const peDates = getPEDates();

    // === UNIT 2: BOUGER PARTOUT (15 LESSONS) ===

    // Lesson 1 - October 21 (Tuesday)
    lessons.push({
      title: 'Exploring Locomotor Skills',
      titleFr: 'Explorer les habiletés locomotrices',
      date: peDates[0],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will refine basic locomotor skills and explore variations in speed, direction, and level.',
      mindsOn: 'Travel show: How many different ways can you travel from here to there? Show me your favorite way to move!',
      action: 'Locomotor exploration stations: walking variations, running patterns, jumping techniques, skipping and galloping.',
      consolidation: 'Movement menu creation: Choose 3 favorite ways to travel and teach them to a partner.',
      materials: JSON.stringify(['Locomotor skill cards', 'directional markers', 'music with varying tempos', 'pathway markers', 'poly spots']),
      grouping: 'Individual skill practice, partner teaching, small group demonstrations',
      accommodations: JSON.stringify(['Modified movement ranges', 'supported locomotion', 'adaptive equipment as needed']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple movement patterns, guided practice, peer buddies',
        extension: 'Complex movement combinations, create new variations, leadership roles',
        multiModal: 'Visual skill cards, rhythmic music, kinesthetic practice'
      }),
      assessmentNotes: 'Observe locomotor skill refinement, creativity in movement, teaching ability',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 2 - October 23 (Thursday)
    lessons.push({
      title: 'Pathways and Directions',
      titleFr: 'Chemins et directions',
      date: peDates[1],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice moving in straight, curved, and zigzag pathways while changing directions safely.',
      mindsOn: 'Pathway detective: Look at these different lines - how would you travel along each one?',
      action: 'Pathway adventure stations: straight line walking, curved path following, zigzag navigation, direction changes.',
      consolidation: 'Pathway art gallery: Create pathway designs on floor and demonstrate how to follow them.',
      materials: JSON.stringify(['Rope/tape for pathways', 'cones for direction markers', 'pathway design cards', 'colored chalk', 'music for tempo']),
      grouping: 'Individual pathway practice, partner pathway creation, group gallery walks',
      accommodations: JSON.stringify(['Wider pathways', 'slower tempo options', 'visual pathway guides']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple pathways, guided navigation, visual cues',
        extension: 'Complex pathway combinations, create challenging courses, help others navigate',
        multiModal: 'Visual pathway designs, spatial navigation, creative expression'
      }),
      assessmentNotes: 'Assess pathway following accuracy, direction change control, spatial awareness development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 3 - October 24 (Friday)
    lessons.push({
      title: 'Levels and Space Awareness',
      titleFr: 'Niveaux et conscience de l\'espace',
      date: peDates[2],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore high, medium, and low levels while moving and understand how to use space effectively.',
      mindsOn: 'Level elevator: Travel from basement (low) to penthouse (high) using your body in different ways!',
      action: 'Level exploration stations: high level movements, medium level travel, low level crawling, space utilization games.',
      consolidation: 'Level master demonstration: Show smooth transitions between all three levels while moving.',
      materials: JSON.stringify(['Level markers (high/medium/low)', 'tunnels and bridges', 'scarves for visualization', 'level transition music']),
      grouping: 'Individual level exploration, partner level matching, group space sharing',
      accommodations: JSON.stringify(['Modified level expectations', 'supported transitions', 'alternative level interpretations']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear level demonstrations, physical assistance, simple transitions',
        extension: 'Smooth level combinations, creative interpretations, teach level concepts',
        multiModal: 'Visual level markers, kinesthetic exploration, musical cues'
      }),
      assessmentNotes: 'Observe level awareness, smooth transitions, space utilization skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 4 - October 28 (Tuesday)
    lessons.push({
      title: 'Speed and Tempo Variations',
      titleFr: 'Variations de vitesse et tempo',
      date: peDates[3],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice controlling movement speed and responding to tempo changes in music.',
      mindsOn: 'Speed control challenge: Can you move like a snail, then like a cheetah, then like a turtle?',
      action: 'Tempo stations: slow motion movements, medium pace activities, quick movements, freeze dance with tempo changes.',
      consolidation: 'Speed storytelling: Create a movement story that uses slow, medium, and fast speeds.',
      materials: JSON.stringify(['Music with varying tempos', 'speed control cards', 'tempo instruments', 'story props', 'freeze dance music']),
      grouping: 'Individual speed control, partner tempo matching, group tempo responses',
      accommodations: JSON.stringify(['Adapted speed ranges', 'visual tempo cues', 'rest periods between speeds']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple speed changes, clear tempo cues, guided practice',
        extension: 'Subtle tempo variations, lead tempo activities, complex speed combinations',
        multiModal: 'Musical tempos, visual speed indicators, kinesthetic control'
      }),
      assessmentNotes: 'Track speed control development, tempo responsiveness, movement quality at different speeds',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 5 - October 30 (Thursday) - Halloween Theme
    lessons.push({
      title: 'Halloween Movement Magic',
      titleFr: 'Magie de mouvement d\'Halloween',
      date: peDates[4],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice locomotor skills through Halloween-themed activities and creative character movements.',
      mindsOn: 'Halloween character parade: Choose a Halloween character - how does your character move through space?',
      action: 'Spooky movement stations: ghost floating, witch flying, monster stomping, spider crawling, pumpkin rolling.',
      consolidation: 'Halloween movement story: Create a group story using different character movements and pathways.',
      materials: JSON.stringify(['Halloween character cards', 'costume props', 'spooky music', 'orange balls (pumpkins)', 'movement scarves']),
      grouping: 'Individual character exploration, partner character interactions, group story creation',
      accommodations: JSON.stringify(['Character choice options', 'simplified movements', 'non-scary alternatives available']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple character movements, guided story participation, peer support',
        extension: 'Complex character combinations, story leadership, creative movement invention',
        multiModal: 'Visual character cards, themed music, dramatic movement, story creation'
      }),
      assessmentNotes: 'Observe creative expression, character movement interpretation, story participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 6 - October 31 (Friday) - Halloween
    lessons.push({
      title: 'Obstacle Navigation Skills',
      titleFr: 'Habiletés de navigation d\'obstacles',
      date: peDates[5],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will develop skills for safely navigating around, over, under, and through obstacles.',
      mindsOn: 'Obstacle course preview: Look at these challenges - how will you solve each movement puzzle?',
      action: 'Halloween obstacle adventure: navigate spooky obstacles using various locomotor skills, problem-solving movements.',
      consolidation: 'Obstacle mastery reflection: Share your favorite obstacle and teach others the best way to navigate it.',
      materials: JSON.stringify(['Cones', 'tunnels', 'low hurdles', 'balance beams', 'mats', 'Halloween decorations', 'obstacle course signs']),
      grouping: 'Individual obstacle practice, partner obstacle assistance, small group course completion',
      accommodations: JSON.stringify(['Modified obstacle heights', 'alternative routes', 'assistance available']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple obstacles, guided navigation, peer assistance',
        extension: 'Complex obstacle sequences, help design courses, teach navigation strategies',
        multiModal: 'Visual obstacle assessment, kinesthetic problem-solving, spatial navigation'
      }),
      assessmentNotes: 'Assess obstacle navigation skills, problem-solving abilities, safety awareness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 7 - November 4 (Tuesday)
    lessons.push({
      title: 'Dynamic Balance in Motion',
      titleFr: 'Équilibre dynamique en mouvement',
      date: peDates[6],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice maintaining balance while moving and learn recovery strategies when balance is challenged.',
      mindsOn: 'Tightrope walker training: How do circus performers stay balanced while moving? Let\'s practice their secrets!',
      action: 'Dynamic balance stations: walking narrow lines, balance beam activities, unstable surface movements, balance recovery practice.',
      consolidation: 'Balance coach certification: Teach someone three tips for staying balanced while moving.',
      materials: JSON.stringify(['Balance beams', 'balance pads', 'narrow lines/ropes', 'wobble cushions', 'balance props', 'circus music']),
      grouping: 'Individual balance practice, partner balance support, group balance challenges',
      accommodations: JSON.stringify(['Wider balance surfaces', 'handheld support available', 'modified balance expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Stable surfaces first, guided practice, physical support',
        extension: 'Challenging surfaces, eyes-closed balance, create balance courses',
        multiModal: 'Kinesthetic balance awareness, visual balance cues, proprioceptive challenges'
      }),
      assessmentNotes: 'Track dynamic balance improvement, recovery skills, confidence in balance activities',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 8 - November 6 (Thursday)
    lessons.push({
      title: 'Force and Effort in Movement',
      titleFr: 'Force et effort dans le mouvement',
      date: peDates[7],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will explore how much force and effort to use for different movements and situations.',
      mindsOn: 'Force control experiment: Show me gentle movements, then strong movements. When do we need each type?',
      action: 'Force exploration stations: light movements, strong movements, gradual force changes, effort matching activities.',
      consolidation: 'Force and effort demonstration: Show the perfect amount of force for different movement tasks.',
      materials: JSON.stringify(['Various weighted objects', 'resistance bands', 'force demonstration props', 'effort level cards', 'gentle/strong music']),
      grouping: 'Individual force exploration, partner effort matching, group force demonstrations',
      accommodations: JSON.stringify(['Modified force expectations', 'assisted movements', 'alternative effort expressions']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple force concepts, guided exploration, concrete examples',
        extension: 'Subtle force variations, explain force concepts, create force challenges',
        multiModal: 'Kinesthetic force awareness, visual effort scales, tactile experiences'
      }),
      assessmentNotes: 'Observe force control development, understanding of effort concepts, movement quality',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 9 - November 7 (Friday)
    lessons.push({
      title: 'Flow and Continuity',
      titleFr: 'Fluidité et continuité',
      date: peDates[8],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice linking movements together smoothly and understand flow in movement sequences.',
      mindsOn: 'Movement river: How does water flow smoothly in a river? Can you make your movements flow like water?',
      action: 'Flow stations: smooth movement transitions, continuous movement patterns, flow vs. stop-start comparisons.',
      consolidation: 'Flowing movement sequence: Create and perform a smooth sequence of 4 connected movements.',
      materials: JSON.stringify(['Flowing music', 'scarves for visualization', 'sequence cards', 'smooth transition props', 'water sounds']),
      grouping: 'Individual flow practice, partner sequence sharing, group flowing movements',
      accommodations: JSON.stringify(['Simplified sequences', 'supported transitions', 'flexible flow interpretations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple 2-movement flows, guided transitions, visual flow models',
        extension: 'Complex flowing sequences, smooth quality focus, teach flow concepts',
        multiModal: 'Visual flow representations, musical flow, kinesthetic smoothness'
      }),
      assessmentNotes: 'Assess movement flow quality, sequence linking ability, understanding of continuity',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 10 - November 11 (Tuesday) - Remembrance Day theme
    lessons.push({
      title: 'Respectful Movement and Precision',
      titleFr: 'Mouvement respectueux et précision',
      date: peDates[9],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice precise, controlled movements and understand how movement can show respect and honor.',
      mindsOn: 'Honor guard practice: How do soldiers move with respect and precision? Practice moving with honor and control.',
      action: 'Precision stations: controlled marching, respectful walking, precise positioning, silent movement practice.',
      consolidation: 'Respectful movement ceremony: Demonstrate precise, controlled movements to honor special occasions.',
      materials: JSON.stringify(['Marching music', 'precision markers', 'respectful movement cards', 'ceremony props', 'quiet reflection music']),
      grouping: 'Individual precision practice, partner synchronized movements, group ceremony participation',
      accommodations: JSON.stringify(['Modified precision expectations', 'assisted positioning', 'alternative respect expressions']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple precise movements, guided practice, clear positioning cues',
        extension: 'Advanced precision challenges, lead respectful activities, teach precision concepts',
        multiModal: 'Visual precision markers, auditory timing cues, kinesthetic control'
      }),
      assessmentNotes: 'Observe precision improvement, respect understanding, controlled movement quality',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 11 - November 13 (Thursday)
    lessons.push({
      title: 'Spatial Relationships',
      titleFr: 'Relations spatiales',
      date: peDates[10],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand and practice moving in relation to objects, boundaries, and other people.',
      mindsOn: 'Space detective challenge: How close, how far, beside, behind - explore all the ways to be in space with others!',
      action: 'Spatial relationship stations: near/far movements, beside/behind positioning, over/under navigation, spatial problem-solving.',
      consolidation: 'Spatial relationship demonstration: Show different ways to move in relation to partners and objects.',
      materials: JSON.stringify(['Spatial relationship cards', 'positioning props', 'boundary markers', 'relationship obstacles', 'spatial vocabulary cards']),
      grouping: 'Individual spatial exploration, partner relationship practice, group spatial challenges',
      accommodations: JSON.stringify(['Clear spatial boundaries', 'simplified spatial concepts', 'visual spatial guides']),
      differentiationStrategies: JSON.stringify({
        support: 'Concrete spatial examples, guided positioning, peer spatial support',
        extension: 'Complex spatial relationships, create spatial challenges, explain spatial concepts',
        multiModal: 'Visual spatial markers, kinesthetic positioning, verbal spatial vocabulary'
      }),
      assessmentNotes: 'Track spatial awareness development, relationship understanding, positioning accuracy',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 12 - November 14 (Friday)
    lessons.push({
      title: 'Environmental Movement Adaptation',
      titleFr: 'Adaptation du mouvement environnemental',
      date: peDates[11],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn to adapt their movements for different surfaces, spaces, and environmental conditions.',
      mindsOn: 'Environment explorer: How do you move differently on grass, concrete, sand, or snow? Let\'s explore!',
      action: 'Environment stations: different surface simulations, space size adaptations, weather movement challenges.',
      consolidation: 'Environmental movement guide: Create tips for moving safely in different environments.',
      materials: JSON.stringify(['Surface texture mats', 'environment simulation props', 'weather condition cards', 'adaptation challenge cards', 'safety equipment']),
      grouping: 'Individual adaptation practice, partner environment exploration, group safety discussions',
      accommodations: JSON.stringify(['Modified environmental challenges', 'supported adaptations', 'safety-first alternatives']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple environmental changes, guided adaptations, clear safety rules',
        extension: 'Complex environment challenges, create adaptation strategies, teach safety concepts',
        multiModal: 'Tactile surface experiences, visual environment cues, kinesthetic adaptations'
      }),
      assessmentNotes: 'Assess environmental adaptation skills, safety awareness, movement modification abilities',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 13 - November 18 (Tuesday)
    lessons.push({
      title: 'Creative Movement Expression',
      titleFr: 'Expression créative par le mouvement',
      date: peDates[12],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will use locomotor skills to express ideas, emotions, and stories through creative movement.',
      mindsOn: 'Movement storytelling: Can your body tell a story without words? Show me happy, sad, excited movements!',
      action: 'Creative expression stations: emotion movements, story telling through locomotion, weather movements, animal interpretations.',
      consolidation: 'Movement theater: Perform creative movement stories and guess each other\'s movement messages.',
      materials: JSON.stringify(['Emotion cards', 'story prompt cards', 'expressive music', 'creative props', 'performance space markers']),
      grouping: 'Individual creative exploration, partner story sharing, group movement theater',
      accommodations: JSON.stringify(['Choice in expression methods', 'supported creative participation', 'alternative expression options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple expression prompts, guided creative movement, peer encouragement',
        extension: 'Complex creative sequences, lead creative activities, innovative expressions',
        multiModal: 'Visual expression prompts, musical inspiration, kinesthetic creativity, social sharing'
      }),
      assessmentNotes: 'Observe creative expression development, movement interpretation, confidence in performance',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 14 - November 20 (Thursday)
    lessons.push({
      title: 'Thanksgiving Movement Gratitude',
      titleFr: 'Gratitude par le mouvement d\'Action de grâce',
      date: peDates[13],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will express gratitude through movement and practice seasonal activities with thankfulness.',
      mindsOn: 'Grateful movement warm-up: Move your body to show something you\'re thankful for - family, friends, ability to move!',
      action: 'Thanksgiving stations: harvest movements, thankful locomotion, gratitude partner activities, seasonal movement celebration.',
      consolidation: 'Gratitude movement circle: Share thankful movements and appreciate our ability to move and play together.',
      materials: JSON.stringify(['Thanksgiving music', 'gratitude prompt cards', 'harvest props', 'celebration materials', 'thankfulness journal']),
      grouping: 'Individual gratitude expression, partner thankfulness sharing, group celebration activities',
      accommodations: JSON.stringify(['Various gratitude expression options', 'supported participation', 'cultural celebration inclusion']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple gratitude expressions, guided participation, peer support',
        extension: 'Complex gratitude sequences, lead thanksgiving activities, help others express gratitude',
        multiModal: 'Visual gratitude cues, musical celebration, kinesthetic expression, emotional sharing'
      }),
      assessmentNotes: 'Assess gratitude expression, seasonal movement participation, social emotional development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Lesson 15 - November 21 (Friday)
    lessons.push({
      title: 'Movement Mastery Showcase',
      titleFr: 'Présentation de maîtrise du mouvement',
      date: peDates[14],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will demonstrate all locomotor skills learned in this unit and celebrate movement progress.',
      mindsOn: 'Movement journey reflection: Think about all the ways you\'ve learned to move - which are your favorites?',
      action: 'Mastery showcase stations: demonstrate best locomotor skills, movement combinations, creative expressions, skill teaching.',
      consolidation: 'Unit celebration and goal setting: Celebrate locomotor achievements and set goals for continued movement learning.',
      materials: JSON.stringify(['Showcase stations', 'celebration materials', 'skill demonstration props', 'progress portfolios', 'goal-setting sheets']),
      grouping: 'Individual skill demonstrations, partner skill sharing, group celebration activities',
      accommodations: JSON.stringify(['Choice in demonstration methods', 'celebration of all progress', 'inclusive showcase options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple skill demonstrations, supported showcase participation, celebration of effort',
        extension: 'Advanced skill combinations, help others showcase, lead celebration activities',
        multiModal: 'Visual skill demonstrations, kinesthetic mastery, social celebration, goal reflection'
      }),
      assessmentNotes: 'Summative assessment of locomotor skills, movement creativity, unit learning outcomes',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: unit2.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🏃‍♂️ Creating ${lessons.length} lessons for Unit 2: Bouger partout...`);
    
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

    console.log('\n✅ Unit 2: Bouger partout seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: October 21 - November 21, 2025');
    console.log('🎯 Focus: Locomotor skills, spatial awareness, movement creativity');
    console.log('⏰ Duration: 45 minutes each (Tues/Thurs/Fri schedule)');
    console.log('🏆 Comprehensive coverage of movement through space and locomotor skill development');

  } catch (error) {
    console.error('❌ Error seeding Unit 2 lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPEUnit2Comprehensive()
  .then(() => {
    console.log('✅ Unit 2 comprehensive PE lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unit 2 seeding failed:', error);
    process.exit(1);
  });