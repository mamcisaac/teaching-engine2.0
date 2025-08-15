#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPEUnit6Comprehensive() {
  console.log('🏃‍♂️ Seeding Unit 6: Santé et bien-être - 12 Comprehensive Lessons...\n');

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

    const unit6 = await prisma.unitPlan.findFirst({
      where: {
        longRangePlanId: peLongRangePlan.id,
        titleFr: 'Santé et bien-être'
      }
    });

    if (!unit6) throw new Error('Unit 6: Santé et bien-être not found');

    // Clear existing lessons for this unit
    await prisma.eTFOLessonPlan.deleteMany({
      where: { unitPlanId: unit6.id }
    });

    const lessons: any[] = [];

    // Helper functions for PE schedule dates (Tues/Thurs/Fri) - Apr 21 to May 22
    const getPEDates = () => {
      const dates: Date[] = [];
      const start = new Date('2026-04-21'); // Apr 21 is Tuesday
      const end = new Date('2026-05-22');   // May 22 is Friday
      
      let current = new Date('2026-04-21'); // Apr 21 Tuesday
      
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

    // === UNIT 6: SANTÉ ET BIEN-ÊTRE (12 LESSONS) ===

    // Lesson 1 - April 21 (Tuesday)
    lessons.push({
      title: 'Understanding Physical Fitness',
      titleFr: 'Comprendre la condition physique',
      date: peDates[0],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand what physical fitness means and how regular activity helps their bodies stay healthy and strong.',
      mindsOn: 'Fitness exploration: What does it mean to be physically fit? How can you tell when your body is getting stronger?',
      action: 'Fitness stations: strength awareness activities, flexibility exploration, endurance understanding, fitness self-assessment.',
      consolidation: 'Fitness goal setting: Set one simple fitness goal and plan how to work toward it.',
      materials: JSON.stringify(['Fitness assessment materials', 'strength demonstration props', 'flexibility guides', 'endurance activities', 'goal-setting sheets']),
      grouping: 'Individual fitness exploration, partner fitness discussions, small group goal sharing',
      accommodations: JSON.stringify(['Modified fitness expectations', 'adaptive fitness activities', 'personalized fitness goals']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple fitness concepts, guided self-assessment, peer fitness support',
        extension: 'Complex fitness understanding, help others assess fitness, create fitness challenges',
        multiModal: 'Kinesthetic fitness awareness, visual fitness guides, reflective goal setting'
      }),
      assessmentNotes: 'Observe fitness understanding, self-assessment ability, goal-setting engagement',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 2 - April 23 (Thursday)
    lessons.push({
      title: 'Heart Health and Exercise',
      titleFr: 'Santé cardiaque et exercice',
      date: peDates[1],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn how exercise helps their heart stay healthy and practice activities that make their heart stronger.',
      mindsOn: 'Heart health investigation: How does your heart change when you exercise? Why is a strong heart important?',
      action: 'Heart health stations: heart rate monitoring, cardiovascular activities, heart-healthy exercises, heart appreciation activities.',
      consolidation: 'Heart health promise: Make a commitment to do heart-healthy activities regularly.',
      materials: JSON.stringify(['Heart rate monitors/charts', 'cardiovascular activity cards', 'heart health props', 'exercise tracking sheets', 'commitment cards']),
      grouping: 'Individual heart monitoring, partner heart rate activities, group cardiovascular exercises',
      accommodations: JSON.stringify(['Modified exercise intensity', 'heart rate alternatives', 'supported cardiovascular activities']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple heart concepts, gentle cardiovascular activities, guided heart monitoring',
        extension: 'Advanced heart health understanding, lead heart activities, help others monitor heart health',
        multiModal: 'Kinesthetic heart awareness, auditory heart monitoring, visual heart health education'
      }),
      assessmentNotes: 'Track heart health understanding, cardiovascular participation, commitment to heart health',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 3 - April 24 (Friday)
    lessons.push({
      title: 'Healthy Eating and Energy',
      titleFr: 'Alimentation saine et énergie',
      date: peDates[2],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand how healthy eating provides energy for physical activity and learn about fuel foods for their bodies.',
      mindsOn: 'Energy for activity: What foods give you energy to play and exercise? How does healthy eating help you feel strong?',
      action: 'Energy stations: energy food sorting, pre-activity eating discussion, post-activity nutrition, energy level awareness.',
      consolidation: 'Healthy eating plan: Create a simple plan for eating foods that give you energy for activities.',
      materials: JSON.stringify(['Food sorting cards', 'energy level charts', 'healthy eating guides', 'nutrition props', 'planning materials']),
      grouping: 'Individual energy awareness, partner food discussions, small group healthy eating planning',
      accommodations: JSON.stringify(['Cultural food considerations', 'dietary restriction awareness', 'family eating pattern respect']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple nutrition concepts, guided food choices, family-inclusive eating plans',
        extension: 'Complex nutrition understanding, help others plan healthy eating, research energy foods',
        multiModal: 'Visual food representations, kinesthetic energy awareness, practical eating planning'
      }),
      assessmentNotes: 'Assess nutrition understanding, energy awareness, healthy eating interest',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 4 - April 28 (Tuesday)
    lessons.push({
      title: 'Sleep and Recovery',
      titleFr: 'Sommeil et récupération',
      date: peDates[3],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand how sleep helps their bodies recover from activity and learn about the importance of rest.',
      mindsOn: 'Sleep and energy: How do you feel after a good night\'s sleep vs. when you\'re tired? Why do active bodies need sleep?',
      action: 'Recovery stations: relaxation techniques, sleep importance activities, recovery stretching, rest awareness exercises.',
      consolidation: 'Bedtime routine planning: Create a bedtime routine that helps your body recover for tomorrow\'s activities.',
      materials: JSON.stringify(['Relaxation props', 'sleep education materials', 'recovery stretching guides', 'bedtime routine cards', 'calming music']),
      grouping: 'Individual relaxation practice, partner sleep discussions, group recovery activities',
      accommodations: JSON.stringify(['Various relaxation methods', 'family sleep routine considerations', 'cultural rest practices']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple sleep concepts, guided relaxation, family-supported bedtime routines',
        extension: 'Complex sleep understanding, help others with relaxation, create recovery activities',
        multiModal: 'Kinesthetic relaxation, auditory calming techniques, practical routine planning'
      }),
      assessmentNotes: 'Track sleep understanding, relaxation participation, recovery awareness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 5 - April 30 (Thursday)
    lessons.push({
      title: 'Hydration and Physical Activity',
      titleFr: 'Hydratation et activité physique',
      date: peDates[4],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn about the importance of staying hydrated during physical activity and recognize signs of thirst.',
      mindsOn: 'Hydration investigation: Why do you get thirsty when you exercise? How does water help your body during activities?',
      action: 'Hydration stations: water break practice, hydration awareness activities, thirst recognition, healthy drink choices.',
      consolidation: 'Hydration habit formation: Plan how to remember to drink water before, during, and after activities.',
      materials: JSON.stringify(['Water bottles', 'hydration tracking sheets', 'healthy drink cards', 'thirst awareness props', 'habit formation guides']),
      grouping: 'Individual hydration practice, partner hydration reminders, group healthy drink discussions',
      accommodations: JSON.stringify(['Various hydration methods', 'frequent water breaks', 'hydration reminder supports']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple hydration concepts, guided water breaks, visual hydration reminders',
        extension: 'Advanced hydration understanding, help others stay hydrated, create hydration plans',
        multiModal: 'Kinesthetic hydration awareness, visual hydration tracking, practical hydration habits'
      }),
      assessmentNotes: 'Observe hydration understanding, water break participation, healthy hydration habits',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 6 - May 1 (Friday)
    lessons.push({
      title: 'Mental Health and Physical Activity',
      titleFr: 'Santé mentale et activité physique',
      date: peDates[5],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand how physical activity helps them feel happy, calm, and confident.',
      mindsOn: 'Feelings and movement: How do you feel before, during, and after physical activity? How does moving make you feel?',
      action: 'Mental wellness stations: mood before/after activity, calming activities, confidence-building exercises, happiness movement.',
      consolidation: 'Wellness reflection: Share how physical activity helps you feel good and plan activities that make you happy.',
      materials: JSON.stringify(['Mood tracking charts', 'calming activity props', 'confidence-building materials', 'happiness activities', 'reflection journals']),
      grouping: 'Individual mood awareness, partner wellness discussions, group happiness activities',
      accommodations: JSON.stringify(['Various mood expression methods', 'supported wellness discussions', 'inclusive happiness activities']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple mood concepts, guided wellness reflection, peer emotional support',
        extension: 'Complex wellness understanding, help others recognize mood benefits, create wellness activities',
        multiModal: 'Kinesthetic mood awareness, emotional wellness expression, reflective wellness planning'
      }),
      assessmentNotes: 'Track mental wellness understanding, mood awareness, connection between activity and feelings',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 7 - May 5 (Tuesday)
    lessons.push({
      title: 'Safety in Physical Activity',
      titleFr: 'Sécurité dans l\'activité physique',
      date: peDates[6],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn and practice safety rules for different physical activities and environments.',
      mindsOn: 'Safety first: What safety rules help us stay safe during different activities? Why are safety rules important?',
      action: 'Safety stations: equipment safety practice, environmental safety awareness, activity-specific safety rules, emergency procedures.',
      consolidation: 'Safety leadership: Become a safety leader by teaching someone else important safety rules.',
      materials: JSON.stringify(['Safety equipment', 'safety rule cards', 'environmental safety props', 'emergency procedure guides', 'safety leadership badges']),
      grouping: 'Individual safety practice, partner safety discussions, group safety leadership',
      accommodations: JSON.stringify(['Clear safety expectations', 'visual safety reminders', 'supported safety leadership']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple safety rules, guided safety practice, clear safety expectations',
        extension: 'Complex safety understanding, teach safety to others, create safety activities',
        multiModal: 'Visual safety demonstrations, kinesthetic safety practice, verbal safety teaching'
      }),
      assessmentNotes: 'Assess safety rule understanding, safety practice consistency, safety leadership development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 8 - May 7 (Thursday)
    lessons.push({
      title: 'Body Appreciation and Self-Care',
      titleFr: 'Appréciation du corps et soins personnels',
      date: peDates[7],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will appreciate their bodies\' abilities and learn self-care practices for physical wellness.',
      mindsOn: 'Body appreciation: What amazing things can your body do? How can you take care of your incredible body?',
      action: 'Self-care stations: body appreciation activities, self-care practice, positive self-talk, body capability celebrations.',
      consolidation: 'Self-care commitment: Make promises about how you will take care of your amazing body.',
      materials: JSON.stringify(['Body appreciation materials', 'self-care guides', 'positive affirmation cards', 'celebration props', 'commitment materials']),
      grouping: 'Individual body appreciation, partner self-care sharing, group body capability celebrations',
      accommodations: JSON.stringify(['Inclusive body appreciation', 'various self-care methods', 'body-positive approaches']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple body appreciation, guided self-care, peer body-positive support',
        extension: 'Help others appreciate their bodies, create self-care activities, lead body-positive discussions',
        multiModal: 'Kinesthetic body awareness, emotional body appreciation, practical self-care planning'
      }),
      assessmentNotes: 'Observe body appreciation development, self-care understanding, positive body image',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 9 - May 8 (Friday)
    lessons.push({
      title: 'Stress Management Through Movement',
      titleFr: 'Gestion du stress par le mouvement',
      date: peDates[8],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will learn how physical activity can help them manage stress and feel calmer.',
      mindsOn: 'Stress relief: When you feel worried or upset, how can moving your body help you feel better?',
      action: 'Stress management stations: calming movements, stress relief activities, breathing exercises, tension release movements.',
      consolidation: 'Stress management toolkit: Create a personal toolkit of movements that help you feel calm and happy.',
      materials: JSON.stringify(['Calming movement props', 'stress relief guides', 'breathing exercise cards', 'relaxation materials', 'toolkit creation supplies']),
      grouping: 'Individual stress management practice, partner calming activities, group relaxation exercises',
      accommodations: JSON.stringify(['Various stress management methods', 'supported relaxation practice', 'flexible calming activities']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple stress management, guided calming activities, peer relaxation support',
        extension: 'Advanced stress management techniques, help others manage stress, create calming activities',
        multiModal: 'Kinesthetic stress relief, auditory calming techniques, emotional stress management'
      }),
      assessmentNotes: 'Track stress management learning, calming activity participation, self-regulation development',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 10 - May 12 (Tuesday)
    lessons.push({
      title: 'Creating Healthy Habits',
      titleFr: 'Créer des habitudes saines',
      date: peDates[9],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand how to create and maintain healthy habits that support their physical and mental well-being.',
      mindsOn: 'Habit formation: What healthy habits do you already have? How can you create new healthy habits that stick?',
      action: 'Healthy habits stations: habit tracking practice, habit formation activities, healthy routine planning, habit support systems.',
      consolidation: 'Habit commitment ceremony: Choose one new healthy habit and make a commitment to practice it.',
      materials: JSON.stringify(['Habit tracking sheets', 'routine planning materials', 'habit formation guides', 'support system props', 'commitment ceremony supplies']),
      grouping: 'Individual habit planning, partner habit support, group commitment ceremony',
      accommodations: JSON.stringify(['Simple habit goals', 'family-supported habits', 'flexible habit expectations']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple habit concepts, guided habit planning, family habit support',
        extension: 'Complex habit formation, help others create habits, design habit support systems',
        multiModal: 'Visual habit tracking, kinesthetic habit practice, social habit support'
      }),
      assessmentNotes: 'Assess habit understanding, commitment to healthy habits, habit planning ability',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 11 - May 14 (Thursday)
    lessons.push({
      title: 'Community Health and Wellness',
      titleFr: 'Santé et bien-être communautaires',
      date: peDates[10],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will understand how being healthy helps their community and explore ways to promote wellness in their community.',
      mindsOn: 'Community wellness: How does your health affect your family, friends, and community? How can we help others be healthy?',
      action: 'Community wellness stations: family wellness planning, school wellness activities, community health projects, wellness sharing.',
      consolidation: 'Community wellness action plan: Choose one way to help promote wellness in your community.',
      materials: JSON.stringify(['Community wellness props', 'family wellness guides', 'school wellness materials', 'community project supplies', 'action planning sheets']),
      grouping: 'Individual community planning, small group wellness projects, whole class community discussions',
      accommodations: JSON.stringify(['Various community contributions', 'family-inclusive wellness', 'cultural wellness practices']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple community concepts, guided wellness planning, family community support',
        extension: 'Complex community wellness understanding, lead community projects, create wellness initiatives',
        multiModal: 'Social community wellness, kinesthetic wellness activities, practical community planning'
      }),
      assessmentNotes: 'Observe community wellness understanding, willingness to help others, wellness action planning',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Lesson 12 - May 15 (Friday)
    lessons.push({
      title: 'Wellness Celebration and Future Planning',
      titleFr: 'Célébration du bien-être et planification future',
      date: peDates[11],
      subject: 'Éducation physique',
      duration: 45,
      learningGoals: 'Students will celebrate their wellness learning and create plans for maintaining healthy habits throughout their lives.',
      mindsOn: 'Wellness journey reflection: How have you grown in understanding health and wellness? What wellness goals do you have?',
      action: 'Wellness celebration stations: wellness knowledge sharing, healthy habit demonstrations, future wellness planning, wellness appreciation.',
      consolidation: 'Lifelong wellness commitment: Make commitments about staying healthy and active throughout your life.',
      materials: JSON.stringify(['Wellness celebration props', 'knowledge sharing materials', 'future planning guides', 'commitment ceremony supplies', 'wellness portfolios']),
      grouping: 'Individual wellness sharing, partner wellness planning, whole class wellness celebration',
      accommodations: JSON.stringify(['Various sharing methods', 'flexible wellness commitments', 'inclusive celebration participation']),
      differentiationStrategies: JSON.stringify({
        support: 'Simple wellness sharing, guided future planning, supported wellness commitments',
        extension: 'Complex wellness presentations, help others plan for wellness, lead wellness celebrations',
        multiModal: 'Kinesthetic wellness demonstrations, verbal wellness sharing, reflective future planning, social wellness celebration'
      }),
      assessmentNotes: 'Summative assessment of wellness understanding, healthy habit development, commitment to lifelong wellness',
      assessmentType: 'summative',
      isSubFriendly: true,
      unitPlanId: unit6.id,
      userId: emily.id
    });

    // Insert all lessons
    console.log(`🏃‍♂️ Creating ${lessons.length} lessons for Unit 6: Santé et bien-être...`);
    
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

    console.log('\n✅ Unit 6: Santé et bien-être seeding complete!');
    console.log(`📊 Total created: ${created}/${lessons.length} lessons`);
    console.log('📅 Coverage: April 21 - May 15, 2026');
    console.log('🎯 Focus: Health awareness, wellness habits, fitness understanding, mental health');
    console.log('⏰ Duration: 45 minutes each (Tues/Thurs/Fri schedule)');
    console.log('🏆 Comprehensive coverage of health and wellness concepts for lifelong healthy living');

  } catch (error) {
    console.error('❌ Error seeding Unit 6 lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPEUnit6Comprehensive()
  .then(() => {
    console.log('✅ Unit 6 comprehensive PE lessons seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unit 6 seeding failed:', error);
    process.exit(1);
  });