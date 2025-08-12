#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEUnit5Comprehensive() {
  console.log('🏃‍♂️ Seeding Unit 5: Jeux et défis - 15 Comprehensive Lessons...\n');

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

    const unit5 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: peLongRangePlan.id,
        titleFr: 'Jeux et défis'
      }
    });

    if (!unit5) throw new Error('Unit 5: Jeux et défis not found');

    // Clear existing lessons for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unit5.id }
    });

    const lessons: any[] = [];

    // Helper functions for PE schedule dates (Tues/Thurs/Fri) - Mar 16 to Apr 25
    const getPEDates = () => {
      const dates: Date[] = [];
      const start = new Date('2026-03-16'); // Mar 16 is Monday, so start Mar 17 (Tuesday)
      const end = new Date('2026-04-25');   // Apr 25 is Saturday
      
      let current = new Date('2026-03-17'); // Mar 17 Tuesday
      
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

    // === UNIT 5: JEUX ET DÉFIS (15 LESSONS) ===

    // Lesson 1 - March 17 (Tuesday)
    lessons.push({
      title: 'Introduction to Games and Rules',
      titleFr: 'Introduction aux jeux et règles',
      date: peDates[0],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand the importance of rules in games and practice following and explaining simple game rules.',
      mindsOn: 'Rules investigation: Why do games have rules? What happens when everyone follows the rules vs. when they don\'t?',
      action: 'Rules stations: practice simple games with clear rules, rule-following challenges, rule explanation practice.',
      consolidation: 'Rule-maker challenge: Create one simple rule for a class game and explain why it\'s important.',
      materials: JSON.stringify(['Simple game equipment', 'rule cards', 'game organization materials', 'rule-making supplies', 'explanation props']),
      grouping: 'Small group rule practice, partner rule explanations, whole class rule discussions',
      accommodations: JSON.stringify(['Visual rule reminders', 'simplified rule structures', 'flexible rule applications']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple, clear rules, visual rule supports, guided rule practice',
        extension: 'Complex rule understanding, help others learn rules, create new game rules',
        multiModal: 'Visual rule displays, verbal rule explanations, kinesthetic rule practice'
      }),
      assessmentNotes: 'Observe rule understanding, rule-following consistency, ability to explain rules',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 2 - March 19 (Thursday)
    lessons.push({
      title: 'Reaction Time Games',
      titleFr: 'Jeux de temps de réaction',
      date: peDates[1],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice quick reactions to visual and auditory signals through fun reaction games.',
      mindsOn: 'Reaction testing: How quickly can your body respond when your brain sees or hears a signal?',
      action: 'Reaction stations: red light/green light, freeze dance, Simon says, quick movement responses.',
      consolidation: 'Reaction improvement discussion: Share strategies that help you react quickly and safely.',
      materials: JSON.stringify(['Signal props', 'freeze dance music', 'reaction time games', 'signal devices', 'timing materials']),
      grouping: 'Individual reaction practice, partner reaction challenges, group reaction games',
      accommodations: JSON.stringify(['Multiple signal types', 'adapted reaction expectations', 'flexible response methods']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear, slow signals, guided reaction practice, extra processing time',
        extension: 'Complex signal patterns, help others with reactions, create reaction challenges',
        multiModal: 'Visual signals, auditory cues, kinesthetic responses, timing awareness'
      }),
      assessmentNotes: 'Track reaction time improvement, signal recognition, safety in quick movements',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 3 - March 20 (Friday)
    lessons.push({
      title: 'Strategy in Simple Games',
      titleFr: 'Stratégie dans les jeux simples',
      date: peDates[2],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn basic game strategies and understand how thinking ahead can improve game performance.',
      mindsOn: 'Strategy thinking: What does it mean to have a plan in a game? How can thinking ahead help you?',
      action: 'Strategy stations: tic-tac-toe with movement, simple chase games with strategy, hiding and seeking strategies.',
      consolidation: 'Strategy sharing: Explain a strategy you used today and how it helped you in the game.',
      materials: JSON.stringify(['Strategy game materials', 'planning cards', 'thinking prompts', 'strategy guides', 'game analysis sheets']),
      grouping: 'Partner strategy games, small group strategy discussions, individual strategy practice',
      accommodations: JSON.stringify(['Simple strategy concepts', 'guided strategy thinking', 'visual strategy supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Basic strategy concepts, concrete strategy examples, guided strategy practice',
        extension: 'Complex strategy development, teach strategies to others, create new strategic games',
        multiModal: 'Visual strategy planning, kinesthetic strategy testing, verbal strategy explanations'
      }),
      assessmentNotes: 'Assess strategic thinking development, planning abilities, strategy application',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 4 - March 24 (Tuesday)
    lessons.push({
      title: 'Tag Games and Safe Chasing',
      titleFr: 'Jeux de poursuite et poursuites sécuritaires',
      date: peDates[3],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice safe chasing and fleeing skills while learning various tag game variations.',
      mindsOn: 'Safe chasing: How can we play chase games that are fun for everyone and keep everyone safe?',
      action: 'Tag game stations: freeze tag, tunnel tag, shadow tag, safe zone tag, cooperative tag games.',
      consolidation: 'Tag game safety discussion: Review what makes tag games safe and fun for everyone.',
      materials: JSON.stringify(['Tag game boundaries', 'safe zone markers', 'tag game equipment', 'safety reminder cards', 'game variation cards']),
      grouping: 'Whole group tag games, rotating tag roles, small group tag variations',
      accommodations: JSON.stringify(['Modified tagging methods', 'safe zone options', 'alternative participation methods']),
      differentiationStrategies: JSON.stringify({
        support: 'Simplified tag games, clear boundaries, peer support in games',
        extension: 'Complex tag variations, game leadership, help ensure everyone\'s safety',
        multiModal: 'Visual boundary markers, kinesthetic chasing/fleeing, social game participation'
      }),
      assessmentNotes: 'Observe safe chasing/fleeing skills, rule following in tag games, inclusive participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 5 - March 26 (Thursday)
    lessons.push({
      title: 'Decision-Making Under Pressure',
      titleFr: 'Prise de décision sous pression',
      date: peDates[4],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice making quick, safe decisions during fast-paced games and activities.',
      mindsOn: 'Quick decisions: When games move fast, how can you make good choices quickly and safely?',
      action: 'Decision-making stations: choice-based obstacle courses, quick decision games, pressure situation practice.',
      consolidation: 'Decision-making reflection: Share examples of good quick decisions you made during activities.',
      materials: JSON.stringify(['Decision-making obstacles', 'choice cards', 'pressure scenario props', 'quick decision games', 'reflection materials']),
      grouping: 'Individual decision practice, partner decision challenges, group decision discussions',
      accommodations: JSON.stringify(['Extended thinking time', 'simplified decision options', 'supported decision-making']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple decisions, guided decision practice, clear choice options',
        extension: 'Complex decision scenarios, help others make decisions, create decision challenges',
        multiModal: 'Visual decision prompts, kinesthetic decision testing, reflective decision analysis'
      }),
      assessmentNotes: 'Track decision-making speed, decision quality under pressure, safety awareness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 6 - March 27 (Friday)
    lessons.push({
      title: 'Obstacle Course Challenges',
      titleFr: 'Défis de parcours d\'obstacles',
      date: peDates[5],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will navigate complex obstacle courses that require problem-solving and skill application.',
      mindsOn: 'Obstacle challenge preparation: Look at this obstacle course - what skills will you need to complete it successfully?',
      action: 'Obstacle course stations: skill-based obstacles, problem-solving challenges, timed courses, teamwork obstacles.',
      consolidation: 'Obstacle mastery reflection: Identify which obstacles were challenging and how you overcame them.',
      materials: JSON.stringify(['Obstacle course equipment', 'challenge cards', 'timing materials', 'problem-solving props', 'skill application stations']),
      grouping: 'Individual obstacle navigation, partner obstacle assistance, team obstacle challenges',
      accommodations: JSON.stringify(['Modified obstacle difficulties', 'alternative routes', 'assistance available']),
      differentiationStrategies: JSON.stringify({
        support: 'Simplified obstacles, guided navigation, peer assistance',
        extension: 'Complex obstacle combinations, time challenges, help others navigate',
        multiModal: 'Visual obstacle assessment, kinesthetic problem-solving, spatial navigation'
      }),
      assessmentNotes: 'Assess problem-solving skills, skill application, persistence through challenges',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 7 - March 31 (Tuesday)
    lessons.push({
      title: 'Traditional Playground Games',
      titleFr: 'Jeux traditionnels de cour d\'école',
      date: peDates[6],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn and practice traditional playground games and understand their cultural significance.',
      mindsOn: 'Traditional games exploration: What games did your parents and grandparents play? Let\'s learn some classics!',
      action: 'Traditional game stations: hopscotch, marbles, four square, jump rope, traditional cultural games.',
      consolidation: 'Traditional games appreciation: Share which traditional games you enjoyed and would like to play at recess.',
      materials: JSON.stringify(['Hopscotch materials', 'jump ropes', 'four square balls', 'traditional game props', 'cultural game equipment']),
      grouping: 'Small group traditional games, partner traditional activities, cultural game sharing',
      accommodations: JSON.stringify(['Modified traditional games', 'alternative participation methods', 'cultural game adaptations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple traditional games, guided participation, peer game support',
        extension: 'Complex traditional games, teach games to others, research traditional games',
        multiModal: 'Kinesthetic traditional play, cultural game learning, social traditional connections'
      }),
      assessmentNotes: 'Observe traditional game learning, cultural appreciation, skill transfer to recess play',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 8 - April 2 (Thursday)
    lessons.push({
      title: 'Spring Outdoor Activities',
      titleFr: 'Activités extérieures de printemps',
      date: peDates[7],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will participate in seasonal outdoor activities and appreciate the benefits of fresh air and nature.',
      mindsOn: 'Spring awakening: How does being active outside in spring make you feel? What\'s different about outdoor activities?',
      action: 'Outdoor stations: nature scavenger hunt with movement, outdoor games, fresh air fitness, spring sports sampling.',
      consolidation: 'Spring activity planning: Plan outdoor activities you can do during spring break and weekends.',
      materials: JSON.stringify(['Outdoor game equipment', 'scavenger hunt lists', 'nature identification guides', 'spring sports props', 'activity planning sheets']),
      grouping: 'Individual outdoor exploration, partner outdoor activities, group outdoor games',
      accommodations: JSON.stringify(['Weather adaptations', 'allergy considerations', 'flexible outdoor participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple outdoor activities, guided nature exploration, peer outdoor support',
        extension: 'Complex outdoor challenges, lead outdoor activities, create spring activity plans',
        multiModal: 'Visual nature appreciation, kinesthetic outdoor movement, sensory outdoor experiences'
      }),
      assessmentNotes: 'Track outdoor activity engagement, nature appreciation, seasonal activity planning',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 9 - April 3 (Friday)
    lessons.push({
      title: 'Competitive vs. Cooperative Games',
      titleFr: 'Jeux compétitifs vs coopératifs',
      date: peDates[8],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will experience both competitive and cooperative games and understand the differences and benefits of each.',
      mindsOn: 'Game comparison: What\'s the difference between trying to win and trying to help everyone succeed?',
      action: 'Game comparison stations: play competitive versions, then cooperative versions of the same games, discuss differences.',
      consolidation: 'Game preference discussion: Share which type of game you prefer and why both types can be fun.',
      materials: JSON.stringify(['Competitive game materials', 'cooperative game adaptations', 'comparison charts', 'discussion prompts', 'reflection guides']),
      grouping: 'Small group game comparisons, partner game discussions, whole class preference sharing',
      accommodations: JSON.stringify(['Modified competition levels', 'choice in game participation', 'inclusive game options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple game comparisons, guided game discussion, clear game differences',
        extension: 'Complex game analysis, help others understand differences, create game variations',
        multiModal: 'Kinesthetic game experiences, verbal game discussions, reflective game comparison'
      }),
      assessmentNotes: 'Assess understanding of game types, preference expression, respectful game participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 10 - April 7 (Tuesday)
    lessons.push({
      title: 'Problem-Solving Through Games',
      titleFr: 'Résolution de problèmes par les jeux',
      date: peDates[9],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will use games to develop problem-solving skills and learn to adapt when things don\'t go as planned.',
      mindsOn: 'Game problem solving: When games don\'t work the way we expect, how can we solve problems and keep playing?',
      action: 'Problem-solving stations: games with intentional problems to solve, adaptation challenges, creative solutions practice.',
      consolidation: 'Problem-solver recognition: Celebrate creative solutions and problem-solving efforts seen during games.',
      materials: JSON.stringify(['Problem-solving games', 'adaptation challenge cards', 'creative solution props', 'problem scenarios', 'solution celebration materials']),
      grouping: 'Small group problem-solving, partner solution development, individual creative thinking',
      accommodations: JSON.stringify(['Simplified problems', 'guided problem-solving', 'multiple solution options']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear problem identification, guided solution process, peer problem-solving support',
        extension: 'Complex problem scenarios, help others solve problems, create new problem-solving games',
        multiModal: 'Visual problem presentation, kinesthetic solution testing, verbal problem-solving discussions'
      }),
      assessmentNotes: 'Observe problem-solving creativity, adaptation skills, persistence through challenges',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 11 - April 9 (Thursday)
    lessons.push({
      title: 'Fair Play and Sportsmanship',
      titleFr: 'Jeu équitable et esprit sportif',
      date: peDates[10],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand and practice fair play principles and demonstrate good sportsmanship in all activities.',
      mindsOn: 'Sportsmanship exploration: What does it look like and sound like when people play fairly and show good sportsmanship?',
      action: 'Sportsmanship stations: fair play practice, good winner/loser behavior, encouragement activities, respect demonstrations.',
      consolidation: 'Sportsmanship pledge: Create and sign a class pledge about how we will show good sportsmanship.',
      materials: JSON.stringify(['Sportsmanship scenario cards', 'fair play props', 'encouragement materials', 'pledge-making supplies', 'recognition certificates']),
      grouping: 'Partner sportsmanship practice, small group fair play activities, whole class pledge creation',
      accommodations: JSON.stringify(['Concrete sportsmanship examples', 'supported fair play practice', 'flexible sportsmanship expressions']),
      differentiationStrategies: JSON.stringify({
        support: 'Clear sportsmanship examples, guided practice, peer sportsmanship support',
        extension: 'Model excellent sportsmanship, help others show fair play, create sportsmanship activities',
        multiModal: 'Visual sportsmanship demonstrations, verbal encouragement practice, emotional sportsmanship development'
      }),
      assessmentNotes: 'Track sportsmanship development, fair play understanding, respectful game participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 12 - April 10 (Friday)
    lessons.push({
      title: 'Game Modifications and Adaptations',
      titleFr: 'Modifications et adaptations de jeux',
      date: peDates[11],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn to modify games to make them more inclusive, fun, or challenging as needed.',
      mindsOn: 'Game improvement: How can we change games to make them work better for our class and include everyone?',
      action: 'Modification stations: practice modifying rules, adapting equipment, changing game objectives, testing improvements.',
      consolidation: 'Game designer showcase: Present your modified game and explain how your changes made it better.',
      materials: JSON.stringify(['Various game equipment', 'modification cards', 'adaptation tools', 'rule-making materials', 'game testing supplies']),
      grouping: 'Small group game modification, partner modification testing, individual creative modifications',
      accommodations: JSON.stringify(['Simple modification options', 'guided modification process', 'supported game design']),
      differentiationStrategies: JSON.stringify({
        support: 'Basic game changes, guided modification thinking, peer modification support',
        extension: 'Complex game adaptations, help others modify games, create entirely new games',
        multiModal: 'Kinesthetic game testing, creative modification thinking, social game sharing'
      }),
      assessmentNotes: 'Assess modification creativity, inclusive thinking, game design understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 13 - April 14 (Tuesday)
    lessons.push({
      title: 'Multi-Skill Challenge Games',
      titleFr: 'Jeux de défi multi-habiletés',
      date: peDates[12],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will participate in games that combine multiple physical skills and require strategic thinking.',
      mindsOn: 'Multi-skill preparation: These games will challenge many different skills - how can you use all you\'ve learned?',
      action: 'Multi-skill stations: games combining throwing/catching/running, strategy plus skill games, complex challenge courses.',
      consolidation: 'Skill combination reflection: Identify which skills you combined successfully and which need more practice.',
      materials: JSON.stringify(['Multi-skill game equipment', 'combination challenge cards', 'skill integration props', 'strategy materials', 'reflection guides']),
      grouping: 'Individual multi-skill practice, partner skill combination, team multi-skill challenges',
      accommodations: JSON.stringify(['Modified skill expectations', 'simplified skill combinations', 'adaptive multi-skill options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple skill combinations, guided practice, peer multi-skill support',
        extension: 'Complex skill integrations, help others combine skills, create new multi-skill challenges',
        multiModal: 'Kinesthetic skill integration, strategic thinking, reflective skill analysis'
      }),
      assessmentNotes: 'Observe skill combination ability, strategic application, multi-skill development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 14 - April 16 (Thursday)
    lessons.push({
      title: 'Leadership in Games',
      titleFr: 'Leadership dans les jeux',
      date: peDates[13],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will practice different leadership roles in games and learn how leaders can help games be successful for everyone.',
      mindsOn: 'Game leadership: What are different ways to be a leader in games? How can leaders help everyone have fun?',
      action: 'Leadership stations: practice being referee, team captain, game organizer, encourager, rule explainer.',
      consolidation: 'Leadership appreciation: Thank game leaders and share what made their leadership helpful.',
      materials: JSON.stringify(['Leadership role cards', 'referee equipment', 'organization materials', 'encouragement props', 'leadership badges']),
      grouping: 'Rotating leadership roles, small group leadership practice, peer leadership support',
      accommodations: JSON.stringify(['Various leadership styles', 'supported leadership opportunities', 'flexible leadership expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple leadership roles, guided leadership practice, peer leadership support',
        extension: 'Complex leadership challenges, mentor other leaders, create leadership opportunities',
        multiModal: 'Kinesthetic leadership activities, verbal leadership communication, social leadership development'
      }),
      assessmentNotes: 'Track leadership development, supportive leadership skills, confidence in leadership roles',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Lesson 15 - April 17 (Friday)
    lessons.push({
      title: 'Games and Challenges Celebration',
      titleFr: 'Célébration des jeux et défis',
      date: peDates[14],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will demonstrate game skills and strategies learned while celebrating their growth in games and challenges.',
      mindsOn: 'Games journey reflection: Think about all the games and challenges you\'ve mastered - which are you most proud of?',
      action: 'Games celebration stations: favorite game demonstrations, challenge showcases, leadership exhibitions, strategy sharing.',
      consolidation: 'Unit celebration and summer planning: Celebrate game achievements and plan active games for summer.',
      materials: JSON.stringify(['All unit games equipment', 'celebration stations', 'game portfolios', 'achievement certificates', 'summer planning materials']),
      grouping: 'Individual game demonstrations, small group game leadership, whole class celebration',
      accommodations: JSON.stringify(['Choice in demonstration methods', 'celebration of all progress', 'inclusive showcase options']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple game demonstrations, supported celebration participation, recognition of effort and growth',
        extension: 'Advanced game showcases, help others celebrate, lead summer game planning',
        multiModal: 'Kinesthetic game demonstrations, strategic game sharing, social celebration, summer activity planning'
      }),
      assessmentNotes: 'Summative assessment of game skills, strategy development, leadership growth, sportsmanship',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: unit5.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🏃‍♂️ Creating ${lessons.length} lessons for Unit 5: Jeux et défis...`);
    
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

    console.log('\n✅ Unit 5: Jeux et défis seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: March 17 - April 17, 2026');
    console.log('🎯 Focus: Games, challenges, strategy, reaction skills, sportsmanship');
    console.log('⏰ Duration: 45 minutes each (Tues/Thurs/Fri schedule)');
    console.log('🏆 Comprehensive coverage of game skills, strategic thinking, and fair play development');

  } catch (error) {
    console.error('❌ Error seeding Unit 5 lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPEUnit5Comprehensive()
  .then(() => {
    console.log('✅ Unit 5 comprehensive PE lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unit 5 seeding failed:', error);
    process.exit(1);
  });