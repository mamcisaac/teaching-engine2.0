#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEUnit7Comprehensive() {
  console.log('🏃‍♂️ Seeding Unit 7: Célébrons nos mouvements - 12 Comprehensive Lessons...\n');

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

    const unit7 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: peLongRangePlan.id,
        titleFr: 'Célébrons nos mouvements'
      }
    });

    if (!unit7) throw new Error('Unit 7: Célébrons nos mouvements not found');

    // Clear existing lessons for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unit7.id }
    });

    const lessons: any[] = [];

    // Helper functions for PE schedule dates (Tues/Thurs/Fri) - May 19 to June 25
    const getPEDates = () => {
      const dates: Date[] = [];
      const start = new Date('2026-05-19'); // May 19 is Tuesday
      const end = new Date('2026-06-25');   // June 25 is Thursday
      
      let current = new Date('2026-05-19'); // May 19 Tuesday
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5) { // Tue, Thu, Fri
          dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
      return dates.slice(0, 12); // Take exactly 12 lessons
    };

    const peDates = getPEDates();

    // === UNIT 7: CÉLÉBRONS NOS MOUVEMENTS (12 LESSONS) ===

    // Lesson 1 - May 19 (Tuesday)
    lessons.push({
      title: 'Year-End Skill Showcase Planning',
      titleFr: 'Planification de la présentation de fin d\'année',
      date: peDates[0],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will reflect on their PE learning journey and plan how to showcase their favorite skills and growth.',
      mindsOn: 'Learning journey reflection: Think about all the skills you\'ve learned this year - which ones are you most proud of?',
      action: 'Showcase planning stations: skill inventory, favorite activity selection, growth reflection, showcase preparation.',
      consolidation: 'Personal showcase plan: Create a plan showing which skills and activities you want to demonstrate.',
      materials: JSON.stringify(['Skill inventory sheets', 'year review materials', 'showcase planning guides', 'reflection journals', 'demonstration props']),
      grouping: 'Individual reflection and planning, partner sharing, small group showcase discussions',
      accommodations: JSON.stringify(['Various showcase methods', 'flexible demonstration options', 'supported reflection activities']),
      differentiationStrategies: JSON.stringify({
        support: 'Guided skill reflection, simple showcase planning, peer support in demonstration choices',
        extension: 'Complex showcase planning, help others plan demonstrations, create innovative showcases',
        multiModal: 'Visual skill inventories, kinesthetic skill practice, reflective planning, social sharing'
      }),
      assessmentNotes: 'Observe reflection quality, showcase planning, awareness of personal growth',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 2 - May 21 (Thursday)
    lessons.push({
      title: 'Fundamental Movement Skills Review',
      titleFr: 'Révision des habiletés motrices fondamentales',
      date: peDates[1],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will demonstrate and refine fundamental movement skills learned throughout the year.',
      mindsOn: 'Movement skill celebration: Show me how much your fundamental movement skills have improved since September!',
      action: 'Fundamental skills stations: locomotor skill demonstrations, non-locomotor skill showcases, balance celebrations, coordination exhibitions.',
      consolidation: 'Skill improvement recognition: Celebrate the improvement you\'ve made in fundamental movement skills.',
      materials: JSON.stringify(['Fundamental skill stations', 'skill demonstration props', 'improvement tracking sheets', 'celebration materials', 'skill portfolio materials']),
      grouping: 'Individual skill demonstrations, partner skill comparisons, group skill celebrations',
      accommodations: JSON.stringify(['Choice in skill demonstrations', 'adaptive skill expectations', 'celebration of all progress']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple skill demonstrations, guided skill practice, celebration of effort and improvement',
        extension: 'Advanced skill combinations, help others demonstrate skills, teach fundamental skills',
        multiModal: 'Kinesthetic skill demonstrations, visual skill tracking, social skill celebration'
      }),
      assessmentNotes: 'Assess fundamental skill development, skill improvement awareness, confidence in demonstrations',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 3 - May 22 (Friday)
    lessons.push({
      title: 'Object Skills Mastery Exhibition',
      titleFr: 'Exposition de maîtrise des habiletés d\'objets',
      date: peDates[2],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will showcase their manipulative skills and demonstrate their growth in object control and coordination.',
      mindsOn: 'Object skills journey: Remember when you first tried to catch a ball? Show me your amazing object skills now!',
      action: 'Object mastery stations: throwing/catching exhibitions, kicking demonstrations, object control showcases, hand-eye coordination displays.',
      consolidation: 'Object skills appreciation: Appreciate your growth and help others celebrate their object skill achievements.',
      materials: JSON.stringify(['Various manipulative objects', 'object skill stations', 'skill demonstration areas', 'achievement tracking', 'appreciation materials']),
      grouping: 'Individual object skill showcases, partner skill appreciation, group object skill celebrations',
      accommodations: JSON.stringify(['Adaptive object options', 'various demonstration methods', 'inclusive skill celebrations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple object demonstrations, guided skill exhibitions, peer encouragement',
        extension: 'Complex object skill combinations, help others showcase skills, create object challenges',
        multiModal: 'Kinesthetic object manipulation, visual skill demonstrations, social skill appreciation'
      }),
      assessmentNotes: 'Track object skill mastery, coordination development, confidence in manipulative skills',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 4 - May 26 (Tuesday)
    lessons.push({
      title: 'Cooperation and Teamwork Celebration',
      titleFr: 'Célébration de la coopération et du travail d\'équipe',
      date: peDates[3],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will demonstrate their cooperation skills and celebrate their growth in working together effectively.',
      mindsOn: 'Teamwork transformation: How have you grown as a teammate and partner this year? Show me your cooperation skills!',
      action: 'Cooperation celebration stations: partnership demonstrations, teamwork showcases, cooperation challenges, leadership exhibitions.',
      consolidation: 'Teamwork appreciation ceremony: Appreciate classmates for their cooperation and teamwork growth.',
      materials: JSON.stringify(['Cooperation demonstration props', 'teamwork challenge materials', 'partnership activity supplies', 'appreciation ceremony materials', 'leadership recognition items']),
      grouping: 'Partner cooperation demonstrations, small team showcases, whole class appreciation ceremony',
      accommodations: JSON.stringify(['Various cooperation expression methods', 'flexible teamwork roles', 'inclusive appreciation activities']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple cooperation demonstrations, guided teamwork participation, peer cooperation support',
        extension: 'Lead cooperation activities, facilitate teamwork demonstrations, mentor cooperation skills',
        multiModal: 'Kinesthetic cooperation activities, social teamwork demonstrations, emotional appreciation expressions'
      }),
      assessmentNotes: 'Observe cooperation skill development, teamwork quality, leadership in collaboration',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 5 - May 28 (Thursday)
    lessons.push({
      title: 'Creative Movement and Expression Showcase',
      titleFr: 'Présentation de mouvement créatif et d\'expression',
      date: peDates[4],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will express creativity through movement and celebrate their artistic growth in physical education.',
      mindsOn: 'Creative expression celebration: How have you grown in expressing yourself through movement? Show your creative spirit!',
      action: 'Creative expression stations: individual creative sequences, partner creative collaborations, group creative performances, artistic movement celebrations.',
      consolidation: 'Creativity appreciation gallery: Appreciate and celebrate the creative expressions shared by classmates.',
      materials: JSON.stringify(['Creative movement props', 'expression materials', 'performance spaces', 'artistic supplies', 'creativity celebration decorations']),
      grouping: 'Individual creative expressions, partner creative collaborations, group artistic performances',
      accommodations: JSON.stringify(['Various creative expression options', 'supported artistic participation', 'inclusive creativity celebrations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple creative expressions, guided artistic movement, peer creative encouragement',
        extension: 'Complex creative performances, help others express creativity, lead artistic activities',
        multiModal: 'Kinesthetic creative movement, visual artistic expression, emotional creative sharing, musical creative inspiration'
      }),
      assessmentNotes: 'Assess creative expression development, artistic confidence, willingness to share creativity',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 6 - May 29 (Friday)
    lessons.push({
      title: 'Favorite Games Tournament',
      titleFr: 'Tournoi des jeux préférés',
      date: peDates[5],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will participate in their favorite games from the year and demonstrate sportsmanship and game skills.',
      mindsOn: 'Favorite games celebration: What games did you enjoy most this year? Let\'s play and celebrate our favorites!',
      action: 'Favorite games stations: student-selected game rotations, sportsmanship demonstrations, game leadership opportunities, fun competitions.',
      consolidation: 'Games appreciation discussion: Share what made your favorite games special and fun throughout the year.',
      materials: JSON.stringify(['Favorite games equipment', 'game station materials', 'sportsmanship recognition items', 'tournament celebration supplies', 'game appreciation guides']),
      grouping: 'Small group game rotations, mixed game teams, whole class game discussions',
      accommodations: JSON.stringify(['Inclusive game modifications', 'various participation levels', 'flexible game roles']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple game participation, guided sportsmanship, peer game support',
        extension: 'Game leadership roles, help others enjoy games, demonstrate excellent sportsmanship',
        multiModal: 'Kinesthetic game participation, social game interactions, reflective game appreciation'
      }),
      assessmentNotes: 'Track sportsmanship development, game skill application, enjoyment and engagement',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 7 - June 2 (Tuesday)
    lessons.push({
      title: 'Health and Fitness Celebration',
      titleFr: 'Célébration de la santé et de la condition physique',
      date: peDates[6],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will celebrate their understanding of health and fitness concepts and demonstrate healthy living commitments.',
      mindsOn: 'Health journey celebration: How have you grown in understanding health and fitness? What healthy habits have you developed?',
      action: 'Health celebration stations: fitness demonstrations, healthy habit sharing, wellness knowledge displays, future health planning.',
      consolidation: 'Healthy living pledge renewal: Renew and expand your commitments to healthy, active living.',
      materials: JSON.stringify(['Health celebration props', 'fitness demonstration materials', 'wellness display supplies', 'healthy habit tracking', 'pledge renewal materials']),
      grouping: 'Individual health demonstrations, partner wellness sharing, group health celebrations',
      accommodations: JSON.stringify(['Various health expression methods', 'flexible fitness demonstrations', 'inclusive wellness celebrations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple health demonstrations, guided wellness sharing, peer health encouragement',
        extension: 'Lead health activities, help others plan wellness, create health education materials',
        multiModal: 'Kinesthetic fitness demonstrations, visual health displays, reflective wellness planning, social health celebrations'
      }),
      assessmentNotes: 'Assess health understanding, fitness awareness, commitment to healthy living',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 8 - June 4 (Thursday)
    lessons.push({
      title: 'Summer Activity Planning Festival',
      titleFr: 'Festival de planification d\'activités estivales',
      date: peDates[7],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will plan summer physical activities and learn about community resources for staying active.',
      mindsOn: 'Summer activity excitement: What active adventures do you want to have this summer? Let\'s plan for an active summer!',
      action: 'Summer planning stations: activity idea brainstorming, family activity planning, community resource exploration, summer goal setting.',
      consolidation: 'Summer activity commitment: Make commitments about staying active and trying new activities during summer break.',
      materials: JSON.stringify(['Summer activity guides', 'community resource lists', 'family activity planners', 'goal setting materials', 'commitment celebration supplies']),
      grouping: 'Individual summer planning, partner activity sharing, family activity discussions',
      accommodations: JSON.stringify(['Various summer activity options', 'family-inclusive planning', 'accessible community resources']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple summer activity ideas, guided planning, family summer support',
        extension: 'Complex summer activity planning, help others plan activities, research community resources',
        multiModal: 'Visual activity planning, kinesthetic activity sampling, social summer discussions, practical family planning'
      }),
      assessmentNotes: 'Track summer planning engagement, community resource awareness, commitment to active summer',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 9 - June 5 (Friday)
    lessons.push({
      title: 'PE Skills Olympics',
      titleFr: 'Olympiques des habiletés d\'éducation physique',
      date: peDates[8],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will participate in Olympic-style celebrations of their PE skills while demonstrating sportsmanship and personal best efforts.',
      mindsOn: 'Olympics preparation: Today we celebrate like Olympic athletes - focusing on personal bests and celebrating everyone\'s achievements!',
      action: 'Skills Olympics stations: personal best challenges, skill demonstrations, Olympic ceremonies, achievement celebrations.',
      consolidation: 'Olympic medal ceremony: Celebrate everyone\'s personal achievements and Olympic spirit.',
      materials: JSON.stringify(['Olympic-style stations', 'personal best tracking', 'celebration medals/ribbons', 'Olympic ceremony props', 'achievement recognition materials']),
      grouping: 'Individual skill exhibitions, small group Olympic events, whole class celebration ceremonies',
      accommodations: JSON.stringify(['Personal best focus', 'various achievement levels', 'inclusive Olympic participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Focus on personal improvement, guided Olympic participation, peer encouragement',
        extension: 'Help others achieve personal bests, demonstrate Olympic values, lead celebration activities',
        multiModal: 'Kinesthetic Olympic activities, visual achievement tracking, social Olympic celebrations, emotional achievement recognition'
      }),
      assessmentNotes: 'Observe personal best efforts, sportsmanship demonstration, celebration participation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 10 - June 9 (Tuesday)
    lessons.push({
      title: 'Movement Memory Lane',
      titleFr: 'Allée des souvenirs de mouvement',
      date: peDates[9],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will revisit favorite activities from throughout the year and create lasting memories of their PE journey.',
      mindsOn: 'Memory lane journey: Let\'s travel back through the year and revisit our favorite movement memories and activities!',
      action: 'Memory stations: September skills revisit, favorite unit activities, memory sharing, nostalgia celebrations.',
      consolidation: 'Memory book creation: Create or contribute to a class memory book of favorite PE moments.',
      materials: JSON.stringify(['Year review materials', 'favorite activity props', 'memory creation supplies', 'photo/video materials', 'memory book materials']),
      grouping: 'Individual memory sharing, partner nostalgia discussions, group memory creation',
      accommodations: JSON.stringify(['Various memory expression methods', 'supported memory sharing', 'inclusive nostalgia participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple memory sharing, guided nostalgia participation, peer memory support',
        extension: 'Lead memory activities, help others share memories, create detailed memory contributions',
        multiModal: 'Visual memory displays, kinesthetic memory recreation, verbal memory sharing, emotional nostalgia connection'
      }),
      assessmentNotes: 'Observe memory engagement, reflection quality, appreciation for PE journey',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 11 - June 11 (Thursday)
    lessons.push({
      title: 'Thank You and Appreciation Day',
      titleFr: 'Jour de remerciement et d\'appréciation',
      date: peDates[10],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will express gratitude for their PE learning experiences and appreciate classmates, teachers, and their own growth.',
      mindsOn: 'Gratitude reflection: Who and what are you thankful for in your PE journey this year? How can we show appreciation?',
      action: 'Appreciation stations: classmate appreciation activities, teacher thank-you expressions, self-appreciation celebrations, gratitude movements.',
      consolidation: 'Gratitude circle ceremony: Share appreciation and gratitude in a special closing circle.',
      materials: JSON.stringify(['Appreciation activity materials', 'thank-you creation supplies', 'gratitude expression props', 'ceremony materials', 'appreciation certificates']),
      grouping: 'Individual appreciation expressions, partner gratitude sharing, whole class appreciation ceremony',
      accommodations: JSON.stringify(['Various appreciation methods', 'supported gratitude expression', 'inclusive appreciation activities']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple appreciation expressions, guided gratitude activities, peer appreciation support',
        extension: 'Lead appreciation activities, help others express gratitude, create meaningful appreciation ceremonies',
        multiModal: 'Verbal gratitude expression, kinesthetic appreciation movements, visual thank-you creations, emotional gratitude ceremonies'
      }),
      assessmentNotes: 'Observe gratitude expression, appreciation of others, self-appreciation development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Lesson 12 - June 12 (Friday) - Final Lesson
    lessons.push({
      title: 'Celebration of Growth and New Beginnings',
      titleFr: 'Célébration de la croissance et des nouveaux débuts',
      date: peDates[11],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will celebrate their complete PE journey, recognize their tremendous growth, and prepare for continued active living.',
      mindsOn: 'Growth celebration: Look how far you\'ve come in PE this year! You are amazing movers, learners, and friends!',
      action: 'Final celebration stations: growth showcases, future goal setting, celebration performances, farewell activities.',
      consolidation: 'Graduation ceremony: Celebrate completing Grade 1 PE with a special graduation ceremony and commitments to lifelong activity.',
      materials: JSON.stringify(['Final celebration decorations', 'growth showcase materials', 'graduation ceremony props', 'future goal materials', 'celebration keepsakes']),
      grouping: 'Individual growth showcases, partner future discussions, whole class graduation celebration',
      accommodations: JSON.stringify(['Celebration of all growth levels', 'various participation methods', 'inclusive graduation activities']),
      differentiationStrategies: JSON.stringify({
        support: 'Celebrate all forms of growth, supported graduation participation, peer celebration encouragement',
        extension: 'Help others celebrate growth, lead graduation activities, inspire continued physical activity',
        multiModal: 'Kinesthetic growth demonstrations, visual growth displays, verbal growth sharing, emotional celebration ceremonies, social graduation activities'
      }),
      assessmentNotes: 'Final summative assessment of year-long PE growth, celebration participation, commitment to continued active living',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: unit7.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🏃‍♂️ Creating ${lessons.length} lessons for Unit 7: Célébrons nos mouvements...`);
    
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

    console.log('\n✅ Unit 7: Célébrons nos mouvements seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: May 19 - June 12, 2026');
    console.log('🎯 Focus: Skill integration, celebration, reflection, future planning');
    console.log('⏰ Duration: 45 minutes each (Tues/Thurs/Fri schedule)');
    console.log('🏆 Comprehensive celebration and integration of entire year\'s PE learning journey');
    console.log('🎓 Perfect conclusion to Grade 1 Physical Education with graduation ceremony!');

  } catch (error) {
    console.error('❌ Error seeding Unit 7 lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPEUnit7Comprehensive()
  .then(() => {
    console.log('✅ Unit 7 comprehensive PE lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unit 7 seeding failed:', error);
    process.exit(1);
  });