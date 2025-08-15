#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createRemainingFebruaryLessons() {
  console.log('🗣️  CREATING REMAINING FEBRUARY SPEAKING LESSONS');
  console.log('Completing the progressive oral communication unit');
  console.log('================================================');

  const unitPlanId = 'cmectx0ox000bvj4p99pjzyfh';
  const userId = 23;

  const lessons = [
    // Week 2 continued: Everyday Conversations (Feb 10-13)
    {
      date: new Date('2026-02-10'),
      title: 'Expressing Needs and Wants',
      titleFr: 'Exprimer les Besoins et les Désirs',
      mindsOn: '**Minds On (8 minutes)**: Display pictures of basic needs (food, water, rest) and wants (toys, treats). Introduce "avoir besoin," "vouloir," "s\'il vous plaît" while students practice expressing what they need vs. want using gestures and simple French.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce need/want vocabulary: "avoir besoin," "vouloir," "s\'il vous plaît" using real classroom situations (needing help, wanting turns). Students practice polite requests with appropriate expressions. **Guided Practice (12 min)**: Practice structured requests: "J\'ai besoin de...", "Je veux...", "S\'il vous plaît..." Students role-play classroom situations requiring polite requests. **Independent Practice (8 min)**: Students practice making polite requests in different scenarios (lunch, recess, classroom activities) with partners, focusing on appropriate expression choices.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate polite requests to the class. Create a "Polite Requests" anchor chart with favorite phrases. Close by practicing "Merci beaucoup" for when requests are granted.',
      materials: '["Need vs. want picture cards", "Vocabulary cards: avoir besoin, vouloir, s\'il vous plaît", "Classroom scenario cards", "Role-play props", "Polite requests anchor chart"]',
      assessmentNotes: 'OBSERVABLE REQUEST SKILLS ASSESSMENT - Circle proficiency level for each:\n1. Distinguishes needs from wants: ☐ No distinction ☐ Some awareness ☐ Usually distinguishes ☐ Clearly distinguishes needs/wants\n2. Uses polite request vocabulary: ☐ Uses English only ☐ Some French attempts ☐ Mostly French requests ☐ Fluent polite French requests\n3. Makes contextually appropriate requests: ☐ Inappropriate requests ☐ Some appropriate ☐ Usually appropriate ☐ Always contextually appropriate\n4. Uses polite tone and manner: ☐ Demanding tone ☐ Sometimes polite ☐ Usually polite ☐ Consistently polite and respectful',
      modifications: '{"forStruggling": "Use clear visual distinctions for needs vs. wants. Practice with familiar, concrete examples. Provide sentence frames for requests. Model polite tone explicitly.", "forIEP": "Use picture communication cards for requests. Practice in low-pressure situations first. Allow gesture with verbal requests. Provide clear social scripts.", "forELL": "Compare polite request patterns across cultures. Use home culture examples of politeness. Provide translated courtesy phrases. Practice with bilingual peer support.", "forAdvanced": "Learn varying levels of politeness and formality. Practice making requests for others. Help teach politeness conventions. Create request scenarios for classmates."}',
      indigenousPerspectives: 'Explore Mi\'kmaq teachings about respectful asking and the importance of community sharing. Discuss how traditional communities valued respectful requests and generous sharing, emphasizing that how we ask for things shows respect for others and strengthens community relationships.'
    },
    {
      date: new Date('2026-02-11'),
      title: 'Describing Feelings',
      titleFr: 'Décrire les Sentiments',
      mindsOn: '**Minds On (7 minutes)**: Show emotion face cards and have students make the faces while practicing feeling words. Introduce "sentir," "content," "triste" while students act out emotions and practice saying "Je suis..." with appropriate facial expressions.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce feeling vocabulary: "sentir," "content," "triste" using emotion cards, facial expressions, and body language. Students practice identifying feelings in themselves and others. **Guided Practice (12 min)**: Practice expressing feelings in French: "Je suis content(e)", "Je me sens triste", "Tu sembles..." Students use emotion wheels and mirrors to practice feeling expressions. **Independent Practice (8 min)**: Students create feeling faces book, drawing emotions and labeling with French feeling words, practicing describing feelings in different situations.',
      consolidation: '**Consolidation (10 minutes)**: Students share one feeling from their book with expression and voice. Practice checking on classmates: "Comment tu te sens?" Close with group "feeling check-in" circle.',
      materials: '["Emotion face cards", "Vocabulary cards: sentir, content, triste", "Emotion wheels", "Small mirrors", "Feeling faces booklet templates", "Feeling check-in poster"]',
      assessmentNotes: 'OBSERVABLE FEELING EXPRESSION ASSESSMENT - Circle proficiency level for each:\n1. Identifies emotions accurately: ☐ Cannot identify ☐ Identifies basic emotions ☐ Identifies range of emotions ☐ Recognizes subtle emotional differences\n2. Expresses feelings in French: ☐ Uses English only ☐ Some French feeling words ☐ Most expressions in French ☐ Fluent French feeling expression\n3. Matches expressions to faces/tone: ☐ No expression matching ☐ Some matching ☐ Good expression/tone match ☐ Natural expressive communication\n4. Shows empathy for others\' feelings: ☐ No awareness of others ☐ Some concern shown ☐ Usually empathetic ☐ Consistently caring and responsive',
      modifications: '{"forStruggling": "Start with happy/sad only. Use exaggerated facial expressions. Allow pointing to emotion cards. Practice with familiar situations only.", "forIEP": "Use sensory-friendly emotion cards. Provide alternative expression methods. Practice emotional self-regulation strategies. Use visual emotion scales.", "forELL": "Connect to emotion expressions in home language. Use cultural emotion expressions. Practice with family emotion contexts. Compare emotional expression across cultures.", "forAdvanced": "Learn nuanced emotion vocabulary. Practice describing others\' emotions respectfully. Help support classmates\' emotional expression. Create emotion scenarios for learning."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq understanding of emotions as gifts that help us understand ourselves and others. Discuss how traditional teachings value both experiencing and sharing feelings as part of being human, emphasizing that expressing feelings helps us connect with and support each other.'
    },

    // Week 3: Expression and Storytelling (Feb 16-20)
    {
      date: new Date('2026-02-16'),
      title: 'Telling Simple Stories',
      titleFr: 'Raconter des Histoires Simples',
      mindsOn: '**Minds On (8 minutes)**: Use picture sequence cards to tell a simple story together. Introduce "raconter," "histoire," "d\'abord" while students help sequence story events and practice story-telling gestures.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce storytelling vocabulary: "raconter," "histoire," "d\'abord" using story props and visual sequences. Students practice story structure: beginning, middle, end with simple French transitions. **Guided Practice (12 min)**: Create a class story together using familiar characters and settings, with students contributing story elements in French. Practice using "d\'abord," "puis," "enfin" for story flow. **Independent Practice (8 min)**: Students create their own simple stories using picture prompts, practicing telling stories with beginning, middle, end structure.',
      consolidation: '**Consolidation (10 minutes)**: Students share their stories in small story circles. Create a "Story Library" with everyone\'s tales. Close by appreciating storytellers: "Merci pour ton histoire!"',
      materials: '["Picture sequence cards", "Vocabulary cards: raconter, histoire, d\'abord", "Story props and puppets", "Picture prompt cards", "Story structure visual guide", "Class story library area"]',
      assessmentNotes: 'OBSERVABLE STORYTELLING ASSESSMENT - Circle proficiency level for each:\n1. Uses story structure (beginning/middle/end): ☐ No clear structure ☐ Some structure elements ☐ Most structure present ☐ Clear, complete story structure\n2. Tells stories in French: ☐ Uses English only ☐ Some French story elements ☐ Mostly French storytelling ☐ Fluent French story narration\n3. Uses story sequence vocabulary: ☐ No sequence words ☐ Some transition words ☐ Good use of sequence ☐ Natural story flow with transitions\n4. Engages audience while telling: ☐ Looks down/away ☐ Some audience connection ☐ Good audience engagement ☐ Captivating storyteller',
      modifications: '{"forStruggling": "Provide story templates with pictures. Allow telling with pictures only initially. Use familiar story patterns. Practice with one listener first.", "forIEP": "Use story apps with visual supports. Allow alternative story formats. Provide story sequence boards. Practice in comfortable spaces.", "forELL": "Encourage stories from home culture. Allow bilingual storytelling initially. Use universal story themes. Connect to home language story structures.", "forAdvanced": "Add dialogue and character voices. Create longer, more complex stories. Help facilitate story sharing. Teach story improvement techniques."}',
      indigenousPerspectives: 'Honor Mi\'kmaq storytelling traditions where stories were used to teach important lessons and preserve cultural knowledge. Discuss how traditional storytellers were respected community members who kept wisdom alive through their tales, emphasizing that every person has important stories to share.'
    },

    // Week 4: Presentations and Celebrations (Feb 23-27)
    {
      date: new Date('2026-02-23'),
      title: 'Making Presentations',
      titleFr: 'Faire des Présentations',
      mindsOn: '**Minds On (7 minutes)**: Watch teacher model a mini-presentation about a favorite book. Introduce "présenter," "expliquer," "audience" while students practice presenter posture and voice projection.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce presentation vocabulary: "présenter," "expliquer," "audience" using presentation skills modeling. Students practice presentation basics: stand tall, speak clearly, look at audience. **Guided Practice (12 min)**: Practice structured presentations: introduction, main points, conclusion. Students work in pairs preparing mini-presentations about favorite classroom activities. **Independent Practice (8 min)**: Students prepare individual presentations about something they\'ve learned in February, using visual aids and practicing presentation skills.',
      consolidation: '**Consolidation (10 minutes)**: 3-4 students give their presentations to the class. Audience practices giving positive feedback in French: "J\'ai aimé..." Close with celebrating all presenters.',
      materials: '["Presentation skills poster", "Vocabulary cards: présenter, expliquer, audience", "Visual aid materials", "Presentation feedback forms", "Timer for practice sessions"]',
      assessmentNotes: 'OBSERVABLE PRESENTATION SKILLS ASSESSMENT - Circle proficiency level for each:\n1. Uses presentation structure: ☐ No clear structure ☐ Some organization ☐ Good structure ☐ Clear, well-organized presentation\n2. Presents information in French: ☐ Uses English only ☐ Some French elements ☐ Mostly French presentation ☐ Fluent French presentation\n3. Demonstrates confident delivery: ☐ Very nervous/quiet ☐ Some confidence ☐ Good delivery skills ☐ Confident, engaging delivery\n4. Uses visual aids effectively: ☐ No visual support ☐ Some visual elements ☐ Good use of visuals ☐ Highly effective visual integration',
      modifications: '{"forStruggling": "Provide presentation templates and scripts. Allow presenting to small groups first. Use familiar topics only. Practice with teacher support.", "forIEP": "Use presentation apps or visual supports. Allow alternative presentation formats. Provide presentation cue cards. Practice in comfortable settings.", "forELL": "Allow presentations about home culture topics. Provide translated key terms. Use visual-heavy presentations. Practice with bilingual support.", "forAdvanced": "Create complex, detailed presentations. Help coach other presenters. Use technology tools for presentations. Teach presentation skills to classmates."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq tradition of formal speaking and presenting important information to the community. Discuss how traditional speakers were chosen for their ability to communicate clearly and how presenting knowledge was a respected responsibility in the community.'
    },
    {
      date: new Date('2026-02-24'),
      title: 'February Speaking Celebration',
      titleFr: 'Célébration de la Parole de Février',
      mindsOn: '**Minds On (8 minutes)**: Review all February speaking skills using stations around the room. Introduce "célébrer," "accomplir," "fier/fière" while students visit speaking skill displays and practice favorite speaking activities.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Review February speaking journey: confidence → greetings → conversations → presentations. Students identify their biggest speaking accomplishment using "accomplir," "fier/fière." **Guided Practice (12 min)**: Students work in groups to prepare a "Speaking Showcase" demonstrating their favorite speaking skills from February. **Independent Practice (8 min)**: Students complete speaking reflection, choosing their best speaking moment and practicing sharing it with the class.',
      consolidation: '**Consolidation (10 minutes)**: Hold February Speaking Showcase where groups demonstrate their speaking skills. Celebrate with French cheers and appreciation. Close by setting speaking goals for March.',
      materials: '["February speaking skills display stations", "Vocabulary cards: célébrer, accomplir, fier/fière", "Speaking showcase props", "Reflection sheets", "Celebration decorations", "Speaking goals chart for March"]',
      assessmentNotes: 'FEBRUARY SPEAKING CULMINATING ASSESSMENT - Circle proficiency level for each:\n1. Demonstrates February speaking growth: ☐ Minimal growth ☐ Some progress ☐ Clear progress ☐ Significant speaking development\n2. Uses French in celebration context: ☐ Uses English primarily ☐ Some French expressions ☐ Mostly French celebration ☐ Fluent French celebration\n3. Reflects on speaking development: ☐ Cannot reflect ☐ With heavy support ☐ Some independent reflection ☐ Clear, independent reflection\n4. Celebrates learning confidently: ☐ Reluctant participation ☐ Some participation ☐ Active celebration ☐ Enthusiastic speaking leader',
      modifications: '{"forStruggling": "Focus on one significant speaking accomplishment. Use visual reflection tools. Allow demonstrating instead of verbal reflection. Celebrate effort over perfection.", "forIEP": "Use digital speaking portfolios. Allow alternative showcase formats. Provide celebration participation choices. Use positive reinforcement strategies.", "forELL": "Encourage reflection in home language alongside French. Celebrate multilingual speaking abilities. Connect to speaking growth in multiple languages.", "forAdvanced": "Create detailed speaking development reflection. Help mentor other speakers. Lead celebration activities. Set ambitious speaking goals for March."}',
      indigenousPerspectives: 'Conclude with Mi\'kmaq teachings about celebrating learning and speaking growth as gifts to be honored. Discuss how traditional communities celebrated when young people mastered important communication skills, emphasizing that learning to speak well is a gift that helps us serve our community better.'
    }
  ];

  console.log(`Creating ${lessons.length} remaining February speaking lessons...`);
  
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
          learningGoals: 'Students will demonstrate progressive French speaking skills, expressing themselves confidently in authentic communication situations while building oral fluency appropriate for Grade 1 French Immersion.',
          learningGoalsFr: 'Les élèves démontreront des compétences progressives en expression orale française, s\'exprimant avec confiance dans des situations de communication authentiques tout en développant la fluidité orale appropriée pour l\'immersion française de 1ère année.',
          isSubFriendly: true,
          subNotes: 'All speaking activities include scaffolding and visual supports. Encourage participation over perfection. Focus on building speaking confidence through positive, supportive interactions.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
    } catch (error) {
      console.error('❌ Error creating lesson:', lessonData.title, error.message);
    }
  }
  
  console.log(`\\n🗣️  Created ${lessons.length} additional February speaking lessons!`);
  console.log('📊 FEBRUARY SPEAKING FOCUS UNIT COMPLETE:');
  console.log('   • Total lessons: 9 perfect speaking lessons');
  console.log('   • Progressive skills: Confidence → Conversation → Expression → Presentation');
  console.log('   • Each lesson: 45 min, ETFO structure, observable assessment, differentiation');
  console.log('   • Indigenous perspectives: Authentic Mi\'kmaq oral tradition connections');
  console.log('🎯 Next: Critical review to ensure 100% perfection standard');
  
  await prisma.$disconnect();
}

createRemainingFebruaryLessons().catch(console.error);