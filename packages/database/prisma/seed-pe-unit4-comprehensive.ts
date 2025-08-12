#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEUnit4Comprehensive() {
  console.log('🏃‍♂️ Seeding Unit 4: Jouer ensemble - 18 Comprehensive Lessons...\n');

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

    const unit4 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: peLongRangePlan.id,
        titleFr: 'Jouer ensemble'
      }
    });

    if (!unit4) throw new Error('Unit 4: Jouer ensemble not found');

    // Clear existing lessons for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unit4.id }
    });

    const lessons: any[] = [];

    // Helper functions for PE schedule dates (Tues/Thurs/Fri) - Feb 2 to Mar 20
    const getPEDates = () => {
      const dates: Date[] = [];
      const start = new Date('2026-02-02'); // Feb 2 is Monday, so start Feb 3 (Tuesday)
      const end = new Date('2026-03-20');   // Mar 20 is Friday
      
      let current = new Date('2026-02-03'); // Feb 3 Tuesday
      
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

    // === UNIT 4: JOUER ENSEMBLE (18 LESSONS) ===

    // Lesson 1 - February 3 (Tuesday)
    lessons.push({
      title: 'Building Partnerships',
      titleFr: 'Construire des partenariats',
      date: peDates[0],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn to work effectively with partners and understand the basics of cooperation in physical activities.',
      mindsOn: 'Partnership preparation: What makes a good partner in PE? How can we help each other succeed?',
      action: 'Partnership stations: partner introductions, cooperation challenges, trust activities, communication practice.',
      consolidation: 'Partnership agreement: Create promises about how to be a supportive, encouraging partner.',
      materials: JSON.stringify(['Partnership activity cards', 'trust-building props', 'communication guides', 'cooperation challenges', 'partnership certificates']),
      grouping: 'Rotating partner pairs, partnership skill building, whole class partnership discussions',
      accommodations: JSON.stringify(['Careful partner matching', 'communication supports', 'modified cooperation expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple partnership tasks, guided cooperation, clear communication prompts',
        extension: 'Complex partnership challenges, peer mentoring, partnership leadership',
        multiModal: 'Visual cooperation cues, kinesthetic trust activities, social skill development'
      }),
      assessmentNotes: 'Observe cooperation development, communication skills, partnership quality',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 2 - February 5 (Thursday)
    lessons.push({
      title: 'Mirror and Match Activities',
      titleFr: 'Activités de miroir et imitation',
      date: peDates[1],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice following and leading through mirroring movements and matching activities.',
      mindsOn: 'Mirror magic: Can you be someone\'s perfect mirror? Take turns being the leader and the mirror!',
      action: 'Mirror stations: partner mirroring, follow-the-leader movements, synchronized activities, copying challenges.',
      consolidation: 'Mirror performance: Create and perform synchronized mirror sequences with your partner.',
      materials: JSON.stringify(['Mirrors for reference', 'movement cards', 'synchronization music', 'mirroring props', 'performance space']),
      grouping: 'Partner mirroring activities, leader-follower rotations, synchronized performances',
      accommodations: JSON.stringify(['Simple movements first', 'visual cues for synchronization', 'flexible mirroring expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple movements, guided mirroring, peer assistance',
        extension: 'Complex synchronized sequences, creative mirroring, help others synchronize',
        multiModal: 'Visual mirroring cues, kinesthetic synchronization, rhythmic coordination'
      }),
      assessmentNotes: 'Track following/leading skills, synchronization ability, partner cooperation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 3 - February 6 (Friday)
    lessons.push({
      title: 'Cooperative Movement Challenges',
      titleFr: 'Défis de mouvement coopératif',
      date: peDates[2],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will solve movement problems together and learn that cooperation makes tasks easier and more fun.',
      mindsOn: 'Team problem solving: Some challenges are easier when we work together. Let\'s discover the power of teamwork!',
      action: 'Cooperation stations: partner carrying, group lifting, cooperative obstacle courses, teamwork challenges.',
      consolidation: 'Cooperation appreciation: Share how working together helped you succeed in today\'s challenges.',
      materials: JSON.stringify(['Cooperative challenge props', 'lightweight objects for carrying', 'teamwork obstacles', 'problem-solving cards', 'celebration materials']),
      grouping: 'Partner cooperation, small group challenges, team problem solving',
      accommodations: JSON.stringify(['Modified physical demands', 'alternative cooperation methods', 'supported teamwork']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple cooperation tasks, guided teamwork, clear role assignments',
        extension: 'Complex cooperation challenges, team leadership, help facilitate others',
        multiModal: 'Kinesthetic cooperation, problem-solving discussions, social teamwork'
      }),
      assessmentNotes: 'Assess cooperation skills, problem-solving abilities, teamwork development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 4 - February 10 (Tuesday)
    lessons.push({
      title: 'Communication Through Movement',
      titleFr: 'Communication par le mouvement',
      date: peDates[3],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice communicating ideas and feelings through movement without using words.',
      mindsOn: 'Silent communication: Can you tell your partner something using only your body movements? No words allowed!',
      action: 'Communication stations: charades movements, emotion expression, story telling through movement, silent cooperation.',
      consolidation: 'Movement communication showcase: Perform your best movement communication for the class to guess.',
      materials: JSON.stringify(['Communication cards', 'emotion props', 'story cards', 'charades materials', 'expression guides']),
      grouping: 'Partner communication practice, small group guessing games, individual expression sharing',
      accommodations: JSON.stringify(['Simple communication prompts', 'visual communication supports', 'flexible expression methods']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear communication prompts, guided expression, peer interpretation help',
        extension: 'Complex communication challenges, creative expressions, help others communicate',
        multiModal: 'Visual communication cues, kinesthetic expression, social interpretation'
      }),
      assessmentNotes: 'Observe communication creativity, expression clarity, interpretation skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 5 - February 12 (Thursday)
    lessons.push({
      title: 'Group Rhythm and Dance',
      titleFr: 'Rythme et danse de groupe',
      date: peDates[4],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will move together to rhythm and learn simple group dances that require cooperation.',
      mindsOn: 'Group rhythm: Listen to the beat - can we all move together like one big dancing family?',
      action: 'Rhythm stations: group clapping, simple line dances, circle dances, rhythmic cooperation activities.',
      consolidation: 'Group dance celebration: Perform our favorite group dance and celebrate moving together.',
      materials: JSON.stringify(['Dance music', 'rhythm instruments', 'dance instruction cards', 'cultural dance examples', 'celebration props']),
      grouping: 'Whole class dances, small group rhythm activities, circle dance formations',
      accommodations: JSON.stringify(['Simple dance steps', 'flexible participation levels', 'alternative rhythm participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple repetitive movements, visual dance cues, peer support',
        extension: 'Complex dance patterns, dance leadership, teach others steps',
        multiModal: 'Musical rhythm, visual dance demonstrations, kinesthetic group movement'
      }),
      assessmentNotes: 'Track rhythm awareness, group participation, dance cooperation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 6 - February 13 (Friday)
    lessons.push({
      title: 'Valentine\'s Day Friendship Activities',
      titleFr: 'Activités d\'amitié de la Saint-Valentin',
      date: peDates[5],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will celebrate friendship through cooperative physical activities and kind movement gestures.',
      mindsOn: 'Friendship celebration: How can we show kindness and friendship through our movements and activities?',
      action: 'Friendship stations: partner appreciation activities, kindness movements, friendship cooperation games, heart-healthy activities.',
      consolidation: 'Friendship appreciation circle: Share kind words and appreciation for classmates\' cooperation.',
      materials: JSON.stringify(['Valentine theme props', 'friendship activity cards', 'heart decorations', 'appreciation materials', 'kindness prompts']),
      grouping: 'Partner appreciation activities, small group friendship games, whole class appreciation circle',
      accommodations: JSON.stringify(['Inclusive friendship activities', 'various appreciation methods', 'culturally sensitive celebrations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple appreciation activities, guided kindness expressions, peer friendship support',
        extension: 'Lead friendship activities, help others feel included, create kindness movements',
        multiModal: 'Visual friendship symbols, kinesthetic appreciation, emotional expression'
      }),
      assessmentNotes: 'Observe kindness expression, friendship skills, inclusive participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 7 - February 17 (Tuesday)
    lessons.push({
      title: 'Team Building Activities',
      titleFr: 'Activités de formation d\'équipe',
      date: peDates[6],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will participate in activities that build trust, cooperation, and team spirit.',
      mindsOn: 'Team spirit building: What makes a group of people feel like a strong, supportive team?',
      action: 'Team building stations: trust activities, group challenges, team cooperation games, spirit building exercises.',
      consolidation: 'Team cheer creation: Create and perform a class team cheer that celebrates our cooperation.',
      materials: JSON.stringify(['Team building props', 'trust activity materials', 'group challenge equipment', 'team spirit decorations', 'cheer materials']),
      grouping: 'Small team activities, rotating team membership, whole class team building',
      accommodations: JSON.stringify(['Flexible team roles', 'modified trust activities', 'inclusive team participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple team activities, guided participation, clear team roles',
        extension: 'Team leadership opportunities, complex team challenges, help facilitate team building',
        multiModal: 'Kinesthetic team activities, social cooperation, emotional team connection'
      }),
      assessmentNotes: 'Assess team participation, cooperation development, leadership emergence',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 8 - February 19 (Thursday)
    lessons.push({
      title: 'Creative Group Movement',
      titleFr: 'Mouvement créatif de groupe',
      date: peDates[7],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will create original movement sequences as a group and learn to blend individual ideas.',
      mindsOn: 'Creative collaboration: How can we combine everyone\'s movement ideas into something amazing together?',
      action: 'Creative stations: group movement creation, collaborative sequences, movement idea sharing, group improvisation.',
      consolidation: 'Group creativity showcase: Perform creative movement sequences created by the whole group.',
      materials: JSON.stringify(['Creative movement props', 'inspiration music', 'movement creation cards', 'collaboration materials', 'showcase space']),
      grouping: 'Small group creation, idea sharing rotations, whole class creative performances',
      accommodations: JSON.stringify(['Various contribution methods', 'flexible creative participation', 'supported idea sharing']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple movement contributions, guided creative participation, peer encouragement',
        extension: 'Complex creative leadership, facilitate group creativity, innovative movement ideas',
        multiModal: 'Kinesthetic creativity, musical inspiration, social collaboration, artistic expression'
      }),
      assessmentNotes: 'Observe creative contribution, collaboration skills, artistic expression',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 9 - February 20 (Friday)
    lessons.push({
      title: 'Parachute Play Cooperation',
      titleFr: 'Coopération avec le parachute',
      date: peDates[8],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will cooperate to create parachute movements and understand how everyone\'s effort contributes to success.',
      mindsOn: 'Parachute teamwork: The parachute only works when we all work together. Let\'s make magic happen!',
      action: 'Parachute stations: ripple waves, mushroom making, popcorn bouncing, merry-go-round, cooperative parachute games.',
      consolidation: 'Parachute reflection: Discuss how everyone\'s cooperation made our parachute activities successful.',
      materials: JSON.stringify(['Large parachute', 'lightweight balls for popcorn', 'parachute game cards', 'cooperation music', 'reflection materials']),
      grouping: 'Whole class parachute activities, small group parachute rotations, cooperative discussions',
      accommodations: JSON.stringify(['Various grip options', 'flexible participation levels', 'seated participation available']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple parachute movements, guided participation, peer support',
        extension: 'Lead parachute activities, help others participate, create new parachute games',
        multiModal: 'Visual parachute effects, kinesthetic cooperation, rhythmic movement'
      }),
      assessmentNotes: 'Assess cooperation quality, participation enthusiasm, understanding of group effort',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 10 - February 24 (Tuesday)
    lessons.push({
      title: 'Inclusive Game Modifications',
      titleFr: 'Modifications de jeux inclusifs',
      date: peDates[9],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn to modify games to include everyone and understand the importance of inclusive play.',
      mindsOn: 'Inclusive thinking: How can we change games so everyone can participate and have fun together?',
      action: 'Modification stations: adapt games for different abilities, create inclusive rules, practice inclusive leadership.',
      consolidation: 'Inclusive game showcase: Present modified games that include everyone in our class.',
      materials: JSON.stringify(['Various game equipment', 'modification cards', 'inclusive rule guides', 'adaptation props', 'showcase materials']),
      grouping: 'Small group game modification, inclusive game testing, whole class inclusive discussions',
      accommodations: JSON.stringify(['Multiple modification examples', 'supported rule creation', 'celebration of inclusion efforts']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple game modifications, guided inclusive thinking, clear inclusion examples',
        extension: 'Complex inclusive adaptations, teach inclusion concepts, lead inclusive activities',
        multiModal: 'Kinesthetic game testing, social inclusion practice, problem-solving discussions'
      }),
      assessmentNotes: 'Observe inclusive thinking, modification creativity, leadership in inclusion',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 11 - February 26 (Thursday)
    lessons.push({
      title: 'Conflict Resolution Through Play',
      titleFr: 'Résolution de conflits par le jeu',
      date: peDates[10],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn strategies for resolving disagreements during games and maintaining positive play.',
      mindsOn: 'Problem solving: When things don\'t go as planned in games, how can we solve problems together?',
      action: 'Resolution stations: practice problem-solving scenarios, conflict resolution role play, positive communication games.',
      consolidation: 'Peace-making strategies: Share and practice strategies for keeping games fun and friendly.',
      materials: JSON.stringify(['Conflict scenario cards', 'problem-solving guides', 'peace-making props', 'communication tools', 'resolution certificates']),
      grouping: 'Partner problem-solving, small group scenario practice, whole class strategy sharing',
      accommodations: JSON.stringify(['Simple conflict scenarios', 'guided resolution strategies', 'peer mediation support']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear resolution steps, guided practice, peer support in problem-solving',
        extension: 'Complex conflict resolution, peer mediation roles, teach resolution strategies',
        multiModal: 'Role-play scenarios, verbal communication practice, social skill development'
      }),
      assessmentNotes: 'Track conflict resolution skills, communication development, positive play maintenance',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 12 - February 27 (Friday)
    lessons.push({
      title: 'Cultural Movement Sharing',
      titleFr: 'Partage de mouvements culturels',
      date: peDates[11],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will share and learn movements from different cultures and appreciate diversity through physical activity.',
      mindsOn: 'Cultural celebration: What special movements, dances, or games come from your family\'s culture?',
      action: 'Cultural stations: share family movements, learn multicultural games, practice cultural dances, celebrate diversity.',
      consolidation: 'Cultural appreciation ceremony: Perform and appreciate the diverse movements shared by our class.',
      materials: JSON.stringify(['Cultural music', 'multicultural game props', 'cultural movement cards', 'celebration decorations', 'appreciation materials']),
      grouping: 'Individual cultural sharing, small group cultural learning, whole class appreciation ceremony',
      accommodations: JSON.stringify(['Various sharing methods', 'cultural sensitivity supports', 'inclusive cultural participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple cultural sharing, guided participation, peer cultural support',
        extension: 'Lead cultural activities, research cultural movements, facilitate cultural appreciation',
        multiModal: 'Musical cultural expression, kinesthetic cultural movement, social cultural learning'
      }),
      assessmentNotes: 'Observe cultural sharing, appreciation of diversity, respectful cultural participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 13 - March 3 (Tuesday)
    lessons.push({
      title: 'Leadership Development',
      titleFr: 'Développement du leadership',
      date: peDates[12],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice leadership skills and learn different ways to lead and support others in physical activities.',
      mindsOn: 'Leadership exploration: What are different ways to be a leader? How can leaders help everyone succeed?',
      action: 'Leadership stations: practice leading warm-ups, teaching skills, organizing activities, supporting participation.',
      consolidation: 'Leadership appreciation: Recognize different types of leadership shown in class today.',
      materials: JSON.stringify(['Leadership role cards', 'activity organization materials', 'teaching props', 'leadership badges', 'recognition certificates']),
      grouping: 'Individual leadership practice, small group leadership rotations, peer leadership support',
      accommodations: JSON.stringify(['Various leadership styles', 'supported leadership opportunities', 'flexible leadership expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple leadership tasks, guided leadership practice, peer leadership support',
        extension: 'Complex leadership challenges, mentor other leaders, innovative leadership approaches',
        multiModal: 'Kinesthetic leadership activities, verbal leadership communication, social leadership development'
      }),
      assessmentNotes: 'Assess leadership emergence, supportive leadership skills, confidence in leadership roles',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 14 - March 5 (Thursday)
    lessons.push({
      title: 'Cooperative Sports Introduction',
      titleFr: 'Introduction aux sports coopératifs',
      date: peDates[13],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn modified sports that emphasize cooperation over competition.',
      mindsOn: 'Cooperative sports: What if sports were about everyone succeeding together instead of winning and losing?',
      action: 'Cooperative sports stations: cooperative soccer, everyone-wins relay races, team juggling, cooperative basketball.',
      consolidation: 'Cooperative sports appreciation: Discuss how cooperative sports felt different from competitive sports.',
      materials: JSON.stringify(['Modified sports equipment', 'cooperative rules cards', 'team success trackers', 'celebration materials', 'reflection guides']),
      grouping: 'Small team cooperative sports, rotating team activities, whole class cooperative discussions',
      accommodations: JSON.stringify(['Modified rules for inclusion', 'flexible participation levels', 'alternative success measures']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple cooperative sports, guided participation, clear cooperative goals',
        extension: 'Complex cooperative challenges, help others succeed, create new cooperative rules',
        multiModal: 'Kinesthetic sports participation, social cooperation, strategic thinking'
      }),
      assessmentNotes: 'Track cooperative sports understanding, participation quality, teamwork development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 15 - March 6 (Friday)
    lessons.push({
      title: 'Celebration Planning Together',
      titleFr: 'Planifier ensemble une célébration',
      date: peDates[14],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will work together to plan a class celebration that includes everyone\'s ideas and interests.',
      mindsOn: 'Celebration planning: How can we plan a celebration that includes everyone\'s favorite activities?',
      action: 'Planning stations: brainstorm celebration ideas, organize activity rotations, assign celebration roles, practice celebration activities.',
      consolidation: 'Celebration preview: Practice parts of our planned celebration and make final preparations.',
      materials: JSON.stringify(['Planning materials', 'celebration props', 'organization charts', 'practice equipment', 'preparation guides']),
      grouping: 'Small group planning, individual role assignments, whole class celebration preparation',
      accommodations: JSON.stringify(['Various planning contributions', 'flexible celebration roles', 'inclusive celebration design']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple planning contributions, guided role assignments, peer planning support',
        extension: 'Lead planning activities, organize complex celebrations, facilitate group planning',
        multiModal: 'Visual planning aids, kinesthetic celebration practice, social planning cooperation'
      }),
      assessmentNotes: 'Observe planning participation, organization skills, inclusive thinking',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 16 - March 10 (Tuesday)
    lessons.push({
      title: 'Peer Teaching and Mentoring',
      titleFr: 'Enseignement par les pairs et mentorat',
      date: peDates[15],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice teaching skills to classmates and learn how to be supportive mentors.',
      mindsOn: 'Teaching preparation: How can you help someone learn a new skill? What makes a good teacher?',
      action: 'Teaching stations: practice teaching movements, mentor skill development, give encouraging feedback, support learning.',
      consolidation: 'Teacher appreciation: Thank peer teachers and share what made their teaching helpful.',
      materials: JSON.stringify(['Teaching skill cards', 'mentoring guides', 'feedback forms', 'teaching props', 'appreciation materials']),
      grouping: 'Peer teaching pairs, mentoring rotations, teaching skill practice',
      accommodations: JSON.stringify(['Simple teaching tasks', 'guided teaching practice', 'supported mentoring relationships']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear teaching steps, guided mentoring, peer teaching support',
        extension: 'Complex teaching challenges, advanced mentoring skills, train other peer teachers',
        multiModal: 'Visual teaching demonstrations, verbal teaching communication, kinesthetic skill sharing'
      }),
      assessmentNotes: 'Assess teaching skills, mentoring quality, supportive feedback ability',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 17 - March 12 (Thursday)
    lessons.push({
      title: 'Community Building Activities',
      titleFr: 'Activités de construction communautaire',
      date: peDates[16],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will participate in activities that build a sense of community and belonging in PE class.',
      mindsOn: 'Community connection: How can we make our PE class feel like a supportive community where everyone belongs?',
      action: 'Community stations: class bonding activities, community service planning, inclusive group games, belonging activities.',
      consolidation: 'Community commitment: Make commitments about how to maintain our supportive PE community.',
      materials: JSON.stringify(['Community building props', 'bonding activity materials', 'commitment cards', 'belonging activities', 'community symbols']),
      grouping: 'Whole class community activities, small group bonding, individual community commitments',
      accommodations: JSON.stringify(['Various community contributions', 'flexible belonging expressions', 'inclusive community building']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple community activities, guided community participation, peer community support',
        extension: 'Lead community building, facilitate belonging activities, strengthen community connections',
        multiModal: 'Kinesthetic community activities, social belonging experiences, emotional community connection'
      }),
      assessmentNotes: 'Observe community participation, belonging sense, commitment to inclusive community',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Lesson 18 - March 13 (Friday)
    lessons.push({
      title: 'Cooperation Celebration Showcase',
      titleFr: 'Présentation célébrant la coopération',
      date: peDates[17],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will demonstrate all cooperation skills learned and celebrate their growth in working together.',
      mindsOn: 'Cooperation journey reflection: Think about how you\'ve grown in working with others - what are you most proud of?',
      action: 'Celebration showcase stations: demonstrate cooperation skills, partnership performances, teamwork presentations, community appreciation.',
      consolidation: 'Unit celebration and future goals: Celebrate cooperation achievements and set goals for continued teamwork growth.',
      materials: JSON.stringify(['Showcase stations', 'celebration decorations', 'cooperation portfolios', 'achievement certificates', 'goal-setting materials', 'community celebration props']),
      grouping: 'Partner demonstrations, small group performances, whole class celebration',
      accommodations: JSON.stringify(['Choice in demonstration methods', 'celebration of all cooperation growth', 'inclusive showcase participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple cooperation demonstrations, supported celebration participation, recognition of effort and growth',
        extension: 'Advanced cooperation showcases, help others celebrate, lead community celebration activities',
        multiModal: 'Kinesthetic cooperation demonstrations, social celebration activities, emotional reflection and goal-setting'
      }),
      assessmentNotes: 'Summative assessment of cooperation skills, partnership quality, teamwork development, community building',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: unit4.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🏃‍♂️ Creating ${lessons.length} lessons for Unit 4: Jouer ensemble...`);
    
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

    console.log('\n✅ Unit 4: Jouer ensemble seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: February 3 - March 13, 2026');
    console.log('🎯 Focus: Cooperation, teamwork, partnership, community building');
    console.log('⏰ Duration: 45 minutes each (Tues/Thurs/Fri schedule)');
    console.log('🏆 Comprehensive coverage of social skills and cooperative learning through physical education');

  } catch (error) {
    console.error('❌ Error seeding Unit 4 lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPEUnit4Comprehensive()
  .then(() => {
    console.log('✅ Unit 4 comprehensive PE lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unit 4 seeding failed:', error);
    process.exit(1);
  });