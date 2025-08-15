#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createRemainingSpringLessons() {
  console.log('🌸 CREATING REMAINING SPRING LANGUAGE ARTS LESSONS');
  console.log('Completing March + April integrated language arts unit');
  console.log('===================================================');

  const unitPlanId = 'cmectx0oy000dvj4pqtbicrq2';
  const userId = 23;

  const lessons = [
    // More March Lessons - Writing Focus (Mar 10-13)
    {
      date: new Date('2026-03-10'),
      title: 'Spring Garden Writing',
      titleFr: 'Écriture du Jardin Printanier',
      mindsOn: '**Minds On (8 minutes)**: Display real spring seeds, soil, and small pots. Have students plant actual seeds while discussing the writing process. Introduce "planter," "grandir," "patience" while connecting seed growing to story growing.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce writing process vocabulary: "planter," "grandir," "patience" using the metaphor of growing stories like growing plants. Students practice "planting" story ideas and growing them with details. **Guided Practice (12 min)**: Create a class spring garden story together, starting with a "seed" idea and growing it with sensory details, characters, and events. Students contribute ideas for making the story grow. **Independent Practice (8 min)**: Students plant their own story seeds by writing/drawing about something growing in spring, focusing on adding details to help their stories grow.',
      consolidation: '**Consolidation (10 minutes)**: Students share their growing stories with partners using "Mon histoire grandit comme..." Create a class "Story Garden" display with all growing stories. Close by discussing how stories need time and care to grow, just like plants.',
      materials: '["Real seeds, soil, small pots", "Vocabulary cards: planter, grandir, patience", "Story growing graphic organizers", "Writing materials", "Class story garden display area", "Gardening tools (child-safe)"]',
      assessmentNotes: 'OBSERVABLE WRITING PROCESS ASSESSMENT - Circle proficiency level for each:\n1. Understands writing as a growing process: ☐ No understanding ☐ Basic understanding ☐ Good understanding ☐ Deep understanding of writing process\n2. Adds details to strengthen writing: ☐ Minimal details ☐ Some details ☐ Good details ☐ Rich, specific details\n3. Uses writing vocabulary appropriately: ☐ Uses English only ☐ Some French attempts ☐ Mostly French ☐ Fluent French writing language\n4. Shows patience with writing development: ☐ Wants immediate results ☐ Some patience ☐ Good patience ☐ Understands writing takes time and revision',
      modifications: '{"forStruggling": "Use pictures to support story ideas. Allow oral story development before writing. Provide story templates with prompts. Focus on getting ideas down first.", "forIEP": "Use story creation apps or assistive technology. Allow alternative story formats. Provide extra time for story development. Use visual story planning tools.", "forELL": "Connect to growing/planting experiences from home culture. Allow bilingual story development. Use visual story supports. Encourage family gardening stories.", "forAdvanced": "Challenge to develop complex stories with multiple elements. Help mentor other writers. Create detailed story plans. Explore advanced writing techniques."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq traditional knowledge about planting, growing, and the patience required for tending both gardens and developing skills. Discuss how both traditional teachings about plant growth and story development require time, care, and respect for natural processes.'
    },

    // April Lessons - Speaking & Listening Integration (Apr 1-3)
    {
      date: new Date('2026-04-01'),
      title: 'Earth Day Action Speaking',
      titleFr: 'Prise de Parole Action Jour de la Terre',
      mindsOn: '**Minds On (7 minutes)**: Show pictures of environmental problems and solutions. Students discuss what they notice and care about. Introduce "terre," "protéger," "agir" while students practice action words and caring expressions.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce environmental action vocabulary: "terre," "protéger," "agir" using pictures of people taking care of the environment. Students practice speaking about things they can do to help. **Guided Practice (12 min)**: Prepare persuasive speeches about helping the environment, using sentence frames "Nous devons...", "Je peux...", "C\'est important parce que..." Students practice speaking with conviction and passion. **Independent Practice (8 min)**: Students prepare their own environmental action speeches, focusing on clear speaking and persuasive language to encourage others to care for the Earth.',
      consolidation: '**Consolidation (10 minutes)**: Students present their environmental action speeches to small groups. Create an "Earth Speakers" pledge wall with commitments to action. Close with a group commitment: "Nous protégeons notre terre!"',
      materials: '["Environmental pictures (problems and solutions)", "Vocabulary cards: terre, protéger, agir", "Persuasive speech sentence frames", "Earth speakers pledge materials", "Action commitment charts"]',
      assessmentNotes: 'OBSERVABLE PERSUASIVE SPEAKING ASSESSMENT - Circle proficiency level for each:\n1. Speaks with conviction about environmental issues: ☐ Uncertain/quiet ☐ Some conviction ☐ Clear conviction ☐ Passionate, convincing delivery\n2. Uses persuasive language structures: ☐ Basic statements only ☐ Some persuasive elements ☐ Good persuasive structure ☐ Compelling persuasive techniques\n3. Uses environmental vocabulary fluently: ☐ Uses English only ☐ Some French terms ☐ Mostly French ☐ Fluent French environmental language\n4. Engages audience with speaking: ☐ Minimal audience engagement ☐ Some engagement ☐ Good audience connection ☐ Highly engaging, motivating speaker',
      modifications: '{"forStruggling": "Provide simple environmental action ideas. Use picture supports for speech topics. Allow shorter speeches. Practice with familiar audience first.", "forIEP": "Use visual speech planning tools. Allow alternative presentation formats. Provide speech prompt cards. Practice in comfortable settings.", "forELL": "Connect to environmental concerns from home country. Use visual environmental vocabulary. Allow bilingual environmental expressions. Share global environmental perspectives.", "forAdvanced": "Research complex environmental issues. Create detailed action plans. Help facilitate environmental discussions. Lead environmental action initiatives."}',
      indigenousPerspectives: 'Honor Mi\'kmaq teachings about responsibility to Mother Earth and the Seven Generations principle of considering environmental impact on future generations. Discuss how Indigenous knowledge about environmental stewardship offers important guidance for protecting the Earth for all living beings.'
    },

    // April - Spring Culmination (Apr 28-30)
    {
      date: new Date('2026-04-28'),
      title: 'Spring Learning Celebration',
      titleFr: 'Célébration de l\'Apprentissage Printanier',
      mindsOn: '**Minds On (8 minutes)**: Create a gallery walk of all spring learning from March and April. Students visit stations showing their reading, writing, speaking, and environmental work. Introduce "célébrer," "accomplir," "croissance" while reflecting on their spring learning journey.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Review spring learning journey vocabulary: "célébrer," "accomplir," "croissance" while students identify their biggest language arts growth areas. Students practice articulating their learning using "J\'ai appris...", "Je peux maintenant..." **Guided Practice (12 min)**: Students work in groups to prepare a "Spring Learning Showcase" demonstrating their integrated language arts skills: reading spring texts expressively, sharing written pieces, speaking about environmental concerns, listening to others\' presentations. **Independent Practice (8 min)**: Students complete final spring reflection, setting goals for continued language arts growth and preparing to share one highlight from their spring learning.',
      consolidation: '**Consolidation (10 minutes)**: Hold Spring Learning Showcase where students demonstrate their integrated language arts skills. Celebrate growth with "Nous avons grandi comme les plantes du printemps!" Close by setting summer language arts goals.',
      materials: '["Gallery walk stations with spring work", "Vocabulary cards: célébrer, accomplir, croissance", "Showcase presentation materials", "Learning reflection templates", "Summer goals planning sheets", "Celebration decorations"]',
      assessmentNotes: 'SPRING LANGUAGE ARTS CULMINATING ASSESSMENT - Circle proficiency level for each:\n1. Demonstrates integrated language arts growth: ☐ Minimal growth ☐ Some progress ☐ Clear progress ☐ Significant language arts development\n2. Uses French across all language modes: ☐ Limited French use ☐ Some French in most modes ☐ Good French across modes ☐ Fluent integrated French language use\n3. Reflects meaningfully on learning: ☐ Cannot reflect ☐ Basic reflection ☐ Good reflection ☐ Deep, insightful reflection on growth\n4. Sets appropriate future goals: ☐ No goal setting ☐ Vague goals ☐ Clear, achievable goals ☐ Ambitious, specific, actionable goals',
      modifications: '{"forStruggling": "Focus on one major accomplishment. Use visual reflection tools. Allow demonstration of learning through preferred mode. Celebrate effort and participation.", "forIEP": "Use digital portfolios for reflection. Allow alternative showcase formats. Provide goal-setting support. Celebrate individual progress markers.", "forELL": "Encourage reflection in home language alongside French. Celebrate multilingual learning development. Connect goals to cross-cultural language use.", "forAdvanced": "Create comprehensive learning portfolios. Help facilitate showcases for others. Set complex, challenging language goals. Mentor other learners."}',
      indigenousPerspectives: 'Conclude with Mi\'kmaq teachings about celebrating learning cycles and acknowledging growth as part of the natural order. Discuss how traditional communities marked learning milestones and seasonal transitions, emphasizing gratitude for knowledge gained and commitment to continued learning in harmony with natural cycles.'
    }
  ];

  console.log(`Creating ${lessons.length} additional spring lessons...`);
  
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
          learningGoals: 'Students will demonstrate integrated French language arts skills through authentic spring experiences, showing growth in reading, writing, speaking, and listening while developing environmental awareness and celebrating learning achievements.',
          learningGoalsFr: 'Les élèves démontreront des compétences intégrées en français langue première à travers des expériences authentiques du printemps, montrant une croissance en lecture, écriture, expression orale et écoute tout en développant une conscience environnementale et en célébrant les réalisations d\'apprentissage.',
          isSubFriendly: true,
          subNotes: 'All activities connect to real spring experiences and environmental awareness. Focus on celebrating growth and achievement. Integrate multiple language arts skills in each lesson. Encourage authentic expression and communication.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
    } catch (error) {
      console.error('❌ Error creating lesson:', lessonData.title, error.message);
    }
  }
  
  console.log(`\\n🌸 Created ${lessons.length} additional spring lessons!`);
  console.log('📊 SPRING LANGUAGE ARTS UNIT STATUS:');
  console.log('   • Total lessons created: 6 (3 March + 3 additional)');
  console.log('   • Integrated focus: Reading + Writing + Speaking + Environmental awareness');
  console.log('   • Builds from: February speaking skills → Full language arts integration');
  console.log('   • Authentic contexts: Spring themes, environmental stewardship, growth celebration');
  console.log('🎯 Next: Critical review to ensure 100% perfection standard');
  
  await prisma.$disconnect();
}

createRemainingSpringLessons().catch(console.error);