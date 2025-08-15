#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFrenchNovemberLessons() {
  console.log('🇫🇷 Seeding November French Lessons - Les fêtes d\'automne...\n');

  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) throw new Error('Emily not found');

    // Get the Fall Celebrations unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        title: 'Fall Celebrations',
        startDate: { lte: new Date('2025-11-30') },
        endDate: { gte: new Date('2025-11-01') }
      }
    });

    if (!unitPlan) {
      throw new Error('Fall Celebrations unit plan not found for November');
    }

    // Get curriculum expectations for French
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Français langue première',
        grade: 1
      }
    });

    const lessons: any[] = [];

    // Helper to get November weekday dates
    const novDate = (day: number) => {
      const date = new Date(2025, 10, day); // Month is 0-indexed
      // Skip weekends
      if (date.getDay() === 0) return new Date(2025, 10, day + 1); // Sunday -> Monday
      if (date.getDay() === 6) return new Date(2025, 10, day + 2); // Saturday -> Monday
      return date;
    };

    // Week 1: November 3-7 - Gratitude and Thanksgiving Review
    lessons.push({
      title: 'Sharing Our Gratitude',
      titleFr: 'Partager notre gratitude',
      date: novDate(3), // Monday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will express what they are thankful for using French vocabulary and simple sentences.',

      mindsOn: 'Circle time: "Pour quoi êtes-vous reconnaissants?" Share gratitude in French.',
      action: 'Create gratitude cards with French messages. Practice "Je suis reconnaissant(e) pour..."',
      consolidation: 'Gratitude gallery walk - present cards to classmates.',
      materials: 'Card stock, markers, gratitude word wall',
      grouping: 'Whole class discussion, individual creation, partner sharing',
      differentiationStrategies: 'Sentence starters, visual supports, peer helpers',
      accommodations: 'Picture cards for vocabulary, scribing support',
      assessmentNotes: 'Observe French vocabulary use in expressions of gratitude',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    lessons.push({
      title: 'Autumn Harvest Vocabulary',
      titleFr: 'Le vocabulaire de la récolte d\'automne',
      date: novDate(5), // Wednesday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will identify and use autumn harvest vocabulary in French contexts.',

      mindsOn: 'Harvest basket mystery: Guess items by French descriptions.',
      action: 'Harvest sorting game with French labels. Create autumn vocabulary booklets.',
      consolidation: 'Harvest bingo with French vocabulary.',
      materials: 'Harvest items/pictures, vocabulary cards, booklet materials',
      grouping: 'Whole class, small groups, pairs',
      differentiationStrategies: 'Visual supports, hands-on materials, varied complexity',
      accommodations: 'Real objects for tactile learners, peer support',
      assessmentNotes: 'Track vocabulary acquisition through games and activities',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    lessons.push({
      title: 'Weather in November',
      titleFr: 'La météo en novembre',
      date: novDate(7), // Friday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will describe daily weather using French weather vocabulary and expressions.',

      mindsOn: 'Weather reporter role-play: "Quel temps fait-il aujourd\'hui?"',
      action: 'Create weather wheels in French. Practice weather conversations.',
      consolidation: 'Present weather forecast to class in French.',
      materials: 'Weather wheels, weather cards, forecast templates',
      grouping: 'Whole class, partners, individual work',
      differentiationStrategies: 'Visual weather symbols, sentence frames, choice in presentation',
      accommodations: 'Weather picture cards, simplified vocabulary options',
      assessmentNotes: 'Assess weather vocabulary use and sentence formation',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    // Week 2: November 10-14 - Remembrance Day Week
    lessons.push({
      title: 'Remembrance Day Introduction',
      titleFr: 'Introduction au jour du Souvenir',
      date: novDate(10), // Monday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will understand Remembrance Day significance and learn related French vocabulary.',

      mindsOn: 'Show poppy: "Qu\'est-ce que c\'est?" Introduce Remembrance Day.',
      action: 'Create paper poppies with French peace messages. Learn "Nous nous souvenons".',
      consolidation: 'Share poppies and peace messages in French.',
      materials: 'Red paper, poppy templates, peace vocabulary cards',
      grouping: 'Whole class discussion, individual creation, sharing circle',
      differentiationStrategies: 'Pre-cut templates, vocabulary supports, choice in message',
      accommodations: 'Scribing support, visual vocabulary aids',
      assessmentNotes: 'Observe understanding of Remembrance Day vocabulary',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    // Note: November 11 is Remembrance Day - no regular lessons
    lessons.push({
      title: 'Peace and Kindness',
      titleFr: 'La paix et la gentillesse',
      date: novDate(12), // Wednesday (Nov 11 is holiday)
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will express ideas about peace and kindness using French vocabulary.',

      mindsOn: 'Peace circle: "Comment pouvons-nous montrer la gentillesse?"',
      action: 'Create kindness chains with French actions. Practice kind phrases.',
      consolidation: 'Kindness pledge in French as a class.',
      materials: 'Paper strips, kindness vocabulary, pledge poster',
      grouping: 'Circle time, small groups, whole class',
      differentiationStrategies: 'Picture supports, peer helpers, varied participation',
      accommodations: 'Visual cues, sentence starters, partner support',
      assessmentNotes: 'Track use of kindness vocabulary and phrases',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    lessons.push({
      title: 'Community Helpers',
      titleFr: 'Les aidants de la communauté',
      date: novDate(14), // Friday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will identify community helpers and describe their roles in French.',

      mindsOn: 'Community helper charades with French vocabulary.',
      action: 'Create community helper cards with French descriptions. Role-play scenarios.',
      consolidation: 'Thank you cards to community helpers in French.',
      materials: 'Helper pictures, role-play props, card materials',
      grouping: 'Whole class game, partners, individual work',
      differentiationStrategies: 'Visual supports, simplified roles, choice in activity',
      accommodations: 'Picture vocabulary cards, peer support for role-play',
      assessmentNotes: 'Assess vocabulary retention and usage in context',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    // Week 3: November 17-21 - Preparing for Winter
    lessons.push({
      title: 'Winter is Coming',
      titleFr: 'L\'hiver arrive',
      date: novDate(17), // Monday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will discuss winter preparations using French winter vocabulary.',

      mindsOn: 'Winter clothing relay: Name items in French.',
      action: 'Design winter wardrobes with French labels. Practice "J\'ai besoin de..."',
      consolidation: 'Fashion show describing winter clothes in French.',
      materials: 'Winter clothing items/pictures, labels, fashion show space',
      grouping: 'Teams for relay, individual design, whole class show',
      differentiationStrategies: 'Real items vs pictures, varied vocabulary levels',
      accommodations: 'Visual vocabulary supports, peer helpers',
      assessmentNotes: 'Observe winter vocabulary use and sentence construction',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    lessons.push({
      title: 'Animals in Winter',
      titleFr: 'Les animaux en hiver',
      date: novDate(19), // Wednesday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will describe how animals prepare for winter using French vocabulary.',

      mindsOn: 'Animal movement game: Act out winter behaviors.',
      action: 'Create animal winter preparation books in French. Learn animal facts.',
      consolidation: 'Present favorite winter animal in French.',
      materials: 'Animal pictures, book materials, fact cards',
      grouping: 'Whole class game, individual books, presentation pairs',
      differentiationStrategies: 'Varied book complexity, choice of animals',
      accommodations: 'Picture supports, simplified vocabulary options',
      assessmentNotes: 'Track animal vocabulary and concept understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    lessons.push({
      title: 'Winter Activities',
      titleFr: 'Les activités d\'hiver',
      date: novDate(21), // Friday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will describe winter activities they enjoy using French action words.',

      mindsOn: 'Winter activity charades in French.',
      action: 'Create winter activity collages with French captions. Practice "J\'aime..."',
      consolidation: 'Gallery walk sharing favorite winter activities.',
      materials: 'Magazines, glue, paper, activity vocabulary cards',
      grouping: 'Whole class game, individual collages, partner sharing',
      differentiationStrategies: 'Pre-cut images available, varied caption complexity',
      accommodations: 'Sentence starters, visual vocabulary aids',
      assessmentNotes: 'Assess activity vocabulary and preference expressions',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    // Week 4: November 24-28 - Holiday Preparations Begin
    lessons.push({
      title: 'Celebrations Around the World',
      titleFr: 'Les célébrations autour du monde',
      date: novDate(24), // Monday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will explore different celebrations and learn related French vocabulary.',

      mindsOn: 'Celebration matching game: Match celebrations to French descriptions.',
      action: 'Create celebration cards showing different traditions with French labels.',
      consolidation: 'Share a family celebration tradition in French.',
      materials: 'Celebration pictures, card materials, tradition examples',
      grouping: 'Whole class game, small groups, individual sharing',
      differentiationStrategies: 'Various celebration examples, choice in presentation',
      accommodations: 'Visual supports, family communication for traditions',
      assessmentNotes: 'Observe celebration vocabulary use and cultural awareness',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    lessons.push({
      title: 'Light in the Darkness',
      titleFr: 'La lumière dans l\'obscurité',
      date: novDate(26), // Wednesday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will describe different sources of light and their importance in French.',

      mindsOn: 'Light sources hunt: Find and name light sources in French.',
      action: 'Create light crafts (paper lanterns) with French light poems.',
      consolidation: 'Light ceremony sharing why light is important.',
      materials: 'Paper, LED tea lights, craft materials, poem templates',
      grouping: 'Exploration pairs, individual crafts, circle sharing',
      differentiationStrategies: 'Poem complexity varies, craft difficulty options',
      accommodations: 'Pre-made templates, vocabulary supports',
      assessmentNotes: 'Track light vocabulary and symbolic understanding',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    lessons.push({
      title: 'Giving and Sharing',
      titleFr: 'Donner et partager',
      date: novDate(28), // Friday
      subject: 'Français langue première',
      duration: 60,

      learningGoals: 'Students will express ideas about giving and sharing using French vocabulary.',

      mindsOn: 'Gift-giving circle: Pass and describe imaginary gifts in French.',
      action: 'Create "coupons de gentillesse" (kindness coupons) with French actions.',
      consolidation: 'Exchange kindness coupons with classmates.',
      materials: 'Coupon templates, markers, decorative materials',
      grouping: 'Circle activity, individual creation, partner exchange',
      differentiationStrategies: 'Various kindness actions, visual supports',
      accommodations: 'Pre-written options, peer helpers',
      assessmentNotes: 'Assess giving vocabulary and generous action expressions',
      assessmentType: 'formative',
      isSubFriendly: true,
      unitPlanId: unitPlan.id,
      userId: emily.id

    });

    // Insert all lessons
    console.log(`📝 Creating ${lessons.length} French lessons for November...`);
    
    for (const lesson of lessons) {
      await prisma.eTFOLessonPlan.create({
        data: lesson
      });
      console.log(`✅ Created: ${lesson.titleFr} - ${lesson.date.toDateString()}`);
    }

    // Link some expectations
    if (expectations.length > 0) {
      console.log('\n🔗 Linking curriculum expectations...');
      const createdLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: emily.id,
          unitPlanId: unitPlan.id
        }
      });

      // Link oral communication expectations to speaking lessons
      const oralExpectations = expectations.filter(e => 
        e.description.toLowerCase().includes('oral') || 
        e.description.toLowerCase().includes('parler')
      );

      if (oralExpectations.length > 0 && createdLessons.length > 0) {
        for (let i = 0; i < Math.min(3, createdLessons.length); i++) {
          await prisma.lessonExpectation.create({
            data: {
              lessonId: createdLessons[i].id,
              expectationId: oralExpectations[0].id
            }
          });
        }
      }
    }

    console.log('\n✅ November French lessons created successfully!');
    console.log(`📊 Total: ${lessons.length} lessons`);
    console.log('📅 Date range: November 3-28, 2025');
    console.log('🎯 Theme: Fall Celebrations - Les fêtes d\'automne');

  } catch (error) {
    console.error('❌ Error seeding November French lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedFrenchNovemberLessons()
  .then(() => {
    console.log('✅ November French lesson seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });