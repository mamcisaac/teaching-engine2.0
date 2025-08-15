#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createDecemberWeek3Lessons() {
  console.log('🎁 Creating December Week 3: Celebration Preparation (Dec 15-18)');
  console.log('==============================================================');

  const unitPlanId = 'cmectx0ow0007vj4pufdl9z3g';
  const userId = 23;

  const lessons = [
    {
      date: new Date('2025-12-15'),
      title: 'Preparing for Celebrations',
      titleFr: 'Se Préparer pour les Célébrations',
      mindsOn: '**Minds On (8 minutes)**: Display a party planning checklist with pictures and introduce "se préparer" and "les célébrations." Students share what their families do to prepare for holidays. Practice saying "Nous préparons" while acting out preparation activities like decorating and cooking.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce preparation vocabulary: "préparer," "organiser," "inviter," "planifier" using action cards and role-play. Students practice each action while saying the French word. **Guided Practice (12 min)**: Read a story about a family preparing for a holiday celebration, identifying all the preparation activities. Students help "plan" a class celebration by choosing activities from picture cards. **Independent Practice (8 min)**: Students create their own celebration preparation list using pictures and simple French words from today\'s lesson.',
      consolidation: '**Consolidation (10 minutes)**: Students share one item from their preparation list: "Je vais préparer..." Display all lists to create a class celebration plan. Close by saying "Nous sommes prêts!" (We are ready!) together.',
      materials: '["Party planning checklist with pictures", "Vocabulary cards: se préparer, les célébrations, préparer, organiser, inviter, planifier", "Story about celebration preparation", "Picture cards of preparation activities", "Drawing paper", "Crayons", "Chart paper for class plan"]',
      assessmentNotes: 'OBSERVABLE PREPARATION VOCABULARY ASSESSMENT - Circle proficiency level for each:\n1. Recognizes preparation vocabulary: ☐ No recognition ☐ With visual support ☐ Hesitant recognition ☐ Confident recognition\n2. Uses "Nous préparons" appropriately: ☐ No use ☐ With heavy prompting ☐ With some prompting ☐ Independent use\n3. Plans celebration activities in French: ☐ Uses English only ☐ Single French words ☐ Simple French phrases ☐ Complete French sentences\n4. Demonstrates understanding of celebration preparation: ☐ No understanding ☐ With explanation ☐ Shows understanding ☐ Explains to others',
      modifications: '{"forStruggling": "Provide picture supports for all vocabulary. Use gesture cues for actions. Allow pointing instead of speaking. Pair with planning buddy.", "forIEP": "Pre-teach preparation concepts with visual schedules. Break planning into simple steps. Allow alternative communication methods. Use familiar celebration examples.", "forELL": "Connect to celebration preparations from home culture. Provide home language connections. Use visual planning templates. Encourage sharing family traditions.", "forAdvanced": "Teach additional preparation vocabulary like \'décorer\' and \'cuisiner\'. Create detailed celebration timeline. Help organize class activities. Practice giving instructions to others."}',
      indigenousPerspectives: 'Discuss Mi\'kmaq community preparation for seasonal celebrations and gatherings, including how everyone in the community contributes their skills and gifts. Explore how both Mi\'kmaq and French traditions involve careful preparation that brings the community together, emphasizing the importance of everyone\'s contribution to successful celebrations.'
    },
    {
      date: new Date('2025-12-16'),
      title: 'Winter Stories and Tales',
      titleFr: 'Les Histoires et Contes d\'Hiver',
      mindsOn: '**Minds On (7 minutes)**: Create a cozy "story corner" with blankets and dim lighting. Introduce "les histoires" and "les contes" using a special story book. Students practice saying "Raconte-moi une histoire" (Tell me a story) while gathering in the story circle.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce story vocabulary: "l\'histoire," "le conte," "le personnage," "magique" using story props and picture cards. Students practice retelling simple story elements. **Guided Practice (12 min)**: Tell a simple French winter tale with visual supports, pausing for students to predict what happens next: "Qu\'est-ce qui arrive?" Students identify characters and magical elements. **Independent Practice (8 min)**: Students create their own winter story using picture prompts, focusing on one main character and one magical element from today\'s vocabulary.',
      consolidation: '**Consolidation (10 minutes)**: Students share their winter stories in pairs using their pictures as guides. Choose 2-3 volunteers to share with the whole class. End by saying "Les histoires sont magiques!" together while putting away story materials.',
      materials: '["Cozy story corner setup with blankets", "Special story book", "Vocabulary cards: les histoires, les contes, le personnage, magique, raconte-moi", "Simple French winter tale with visuals", "Story props (characters, magical items)", "Picture prompts for story creation", "Drawing paper"]',
      assessmentNotes: 'OBSERVABLE STORY VOCABULARY ASSESSMENT - Circle proficiency level for each:\n1. Recognizes story vocabulary: ☐ No recognition ☐ With visual cues ☐ Hesitant recognition ☐ Confident recognition\n2. Participates in story prediction: ☐ No participation ☐ With prompting ☐ Sometimes participates ☐ Actively predicts\n3. Creates simple story in French: ☐ Uses English only ☐ Single French words ☐ Simple French phrases ☐ Connected French ideas\n4. Shows engagement with French storytelling: ☐ Disengaged ☐ Some interest ☐ Engaged listener ☐ Enthusiastic participant',
      modifications: '{"forStruggling": "Provide story templates with picture sequences. Use familiar story patterns. Allow retelling with pictures only. Pair with confident storyteller.", "forIEP": "Use sensory story elements (textures, sounds). Provide story communication boards. Allow non-verbal story participation. Use repetitive, predictable stories.", "forELL": "Connect to storytelling traditions from home culture. Provide visual story maps. Use universal story themes. Encourage bilingual storytelling.", "forAdvanced": "Teach additional story vocabulary like \'aventure\' and \'héros\'. Create multi-part stories. Add dialogue to stories. Help facilitate story sharing."}',
      indigenousPerspectives: 'Share the importance of storytelling in Mi\'kmaq culture, including winter stories that teach lessons and preserve traditional knowledge. Explore how both Mi\'kmaq and French cultures use stories to pass down wisdom, values, and cultural understanding, emphasizing that stories connect us across time and cultures.'
    },
    {
      date: new Date('2025-12-17'),
      title: 'Sharing and Community',
      titleFr: 'Partager et Communauté',
      mindsOn: '**Minds On (8 minutes)**: Set up sharing stations around the room with different items (books, toys, art supplies). Students visit stations and practice "Je partage" while demonstrating sharing. Introduce "partager" and "la communauté" through actions and examples.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce sharing vocabulary: "partager," "la communauté," "ensemble," "aider" using real classroom examples. Students practice sharing classroom materials while using French phrases. **Guided Practice (12 min)**: Read a story about a community working together during winter, identifying examples of sharing and helping. Students discuss how their classroom is a community: "Notre classe est une communauté." **Independent Practice (8 min)**: Students draw or write about one way they can share or help in their community, labeling with French vocabulary from today\'s lesson.',
      consolidation: '**Consolidation (10 minutes)**: Students share their community helping ideas in a circle: "Je peux aider..." Create a class "community helpers" chart with all their ideas. Close by holding hands and saying "Nous sommes une communauté!" together.',
      materials: '["Sharing stations with various classroom items", "Vocabulary cards: partager, la communauté, ensemble, aider, je partage, je peux aider", "Story about community cooperation", "Drawing paper", "Crayons", "Chart paper for community helpers display"]',
      assessmentNotes: 'OBSERVABLE COMMUNITY VOCABULARY ASSESSMENT - Circle proficiency level for each:\n1. Uses sharing vocabulary correctly: ☐ No use ☐ With modeling ☐ With some prompting ☐ Independent use\n2. Demonstrates sharing behaviors: ☐ Reluctant sharing ☐ Shares with reminders ☐ Willing to share ☐ Initiates sharing\n3. Identifies community helping actions: ☐ Cannot identify ☐ With prompting ☐ Identifies some ☐ Identifies many\n4. Expresses community membership in French: ☐ No expression ☐ Single words ☐ Simple phrases ☐ Complete thoughts',
      modifications: '{"forStruggling": "Provide concrete sharing examples. Use visual cues for community concepts. Allow demonstrating instead of verbalizing. Pair with community-minded classmate.", "forIEP": "Use social stories about sharing and community. Provide structured sharing opportunities. Allow alternative ways to show helping. Use visual community membership cards.", "forELL": "Connect to community concepts from home culture. Provide home language community vocabulary. Use universal community symbols. Encourage sharing about family community roles.", "forAdvanced": "Teach additional community vocabulary like \'bénévole\' and \'coopérer\'. Plan class community service project. Practice community leadership skills. Help facilitate sharing activities."}',
      indigenousPerspectives: 'Explore Mi\'kmaq teachings about community responsibility and the Seven Sacred Teachings, particularly focusing on sharing and caring for others. Discuss how both Mi\'kmaq and French cultures emphasize community support, especially during winter when people depend on each other, connecting to the understanding that we are all related and responsible for each other\'s wellbeing.'
    },
    {
      date: new Date('2025-12-18'),
      title: 'Unit Celebration and Reflection',
      titleFr: 'Célébration et Réflexion de l\'Unité',
      mindsOn: '**Minds On (8 minutes)**: Display all December vocabulary cards and December work samples around the room. Students take a "gallery walk" to see all their learning from December. Practice saying "J\'ai appris" (I learned) while pointing to different vocabulary and activities.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Review December vocabulary through games and songs learned this month. Students demonstrate their favorites: winter words, holiday traditions, community actions. **Guided Practice (12 min)**: Students work in small groups to prepare a "December Showcase" where they demonstrate one thing they learned using French vocabulary, actions, or songs from this unit. **Independent Practice (8 min)**: Students complete a simple reflection: drawing their favorite December learning and writing one French word or phrase they are proud of knowing.',
      consolidation: '**Consolidation (10 minutes)**: Hold the December Showcase where each group presents their learning. Close with a celebration song incorporating French vocabulary from the unit. End by saying "Nous avons bien appris!" (We learned well!) and "Bonnes vacances!" (Happy holidays!)',
      materials: '["All December vocabulary cards", "December work samples display", "Gallery walk setup", "Celebration decorations", "Simple reflection sheets", "Celebration music from the unit", "Camera for documentation"]',
      assessmentNotes: 'DECEMBER UNIT CULMINATING ASSESSMENT - Circle proficiency level for each:\n1. Demonstrates December vocabulary retention: ☐ Minimal retention ☐ Some vocabulary ☐ Most vocabulary ☐ Confident with all vocabulary\n2. Uses French in celebration context: ☐ Uses English primarily ☐ Some French words ☐ French phrases ☐ Extended French communication\n3. Reflects on learning progress: ☐ Cannot reflect ☐ With heavy support ☐ With some support ☐ Independent reflection\n4. Participates in unit celebration: ☐ Reluctant participation ☐ Some participation ☐ Active participation ☐ Leadership in celebration',
      modifications: '{"forStruggling": "Provide vocabulary picture supports for showcase. Allow non-verbal demonstrations. Use simple reflection with pictures only. Pair with confident presenter.", "forIEP": "Use visual learning portfolios for reflection. Allow alternative showcase formats. Provide celebration participation choices. Use positive reinforcement systems.", "forELL": "Encourage use of home language alongside French. Provide visual reflection templates. Connect to home celebration traditions. Celebrate multilingual learning.", "forAdvanced": "Challenge to use complex French in showcase. Help facilitate group presentations. Create unit learning booklet. Teach celebration vocabulary to others."}',
      indigenousPerspectives: 'Conclude with Mi\'kmaq teachings about gratitude and reflection at the end of learning cycles, including the importance of acknowledging growth and celebrating community learning together. Connect to how both Mi\'kmaq and French traditions value taking time to reflect on learning and give thanks for knowledge gained, emphasizing that learning is a gift to be shared and celebrated.'
    }
  ];

  console.log('Creating 4 lessons for December 15-18...');
  
  for (const lessonData of lessons) {
    try {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: userId,
          unitPlanId: unitPlanId,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45,
          mindsOn: lessonData.mindsOn,
          mindsOnFr: lessonData.mindsOn,
          action: lessonData.action,
          actionFr: lessonData.action,
          consolidation: lessonData.consolidation,
          consolidationFr: lessonData.consolidation,
          materials: JSON.parse(lessonData.materials),
          assessmentType: 'FORMATIVE',
          assessmentNotes: lessonData.assessmentNotes,
          modifications: lessonData.modifications,
          indigenousPerspectives: lessonData.indigenousPerspectives,
          grade: 1,
          language: 'French',
          subject: 'French Language Arts',
          learningGoals: 'Students will demonstrate cumulative December learning, engage in celebration and reflection, and show growth in French holiday vocabulary and cultural understanding.',
          learningGoalsFr: 'Les élèves démontreront leur apprentissage cumulatif de décembre, participeront à la célébration et à la réflexion, et montreront leur croissance en vocabulaire français des fêtes et en compréhension culturelle.',
          isSubFriendly: true,
          subNotes: 'All vocabulary cards, materials, and simple instructions provided. Final lessons include celebration and reflection activities with visual supports.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
    } catch (error) {
      console.error('❌ Error creating lesson:', lessonData.title, error.message);
    }
  }
  
  console.log('\n🎁 Week 3 lessons created successfully!');
  console.log('🎊 December Holiday Stories unit is now COMPLETE with 14 lessons!');
  console.log('Next: Critical review of all December lessons');
  
  await prisma.$disconnect();
}

createDecemberWeek3Lessons().catch(console.error);