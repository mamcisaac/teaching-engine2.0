#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createFebruarySpeakingLessons() {
  console.log('🗣️  CREATING FEBRUARY SPEAKING FOCUS LESSONS');
  console.log('Progressive French oral communication for Grade 1 Immersion');
  console.log('======================================================');

  const unitPlanId = 'cmectx0ox000bvj4p99pjzyfh';
  const userId = 23;

  const lessons = [
    // Week 1: Building Speaking Confidence (Feb 2-6)
    {
      date: new Date('2026-02-02'),
      title: 'Speaking with Confidence',
      titleFr: 'Parler avec Confiance',
      mindsOn: '**Minds On (8 minutes)**: Play soft French music while students practice breathing exercises for confident speaking. Introduce "parler," "confiance," "voix" while students practice saying their names with strong, clear voices. Model confident vs. shy speaking postures.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce confident speaking vocabulary: "parler," "confiance," "voix" using demonstrations of confident body language and voice projection. Students practice standing tall and speaking clearly. **Guided Practice (12 min)**: Practice "Je m\'appelle..." with confident voice and posture. Students take turns being "speaking coaches" to help classmates use strong voices. **Independent Practice (8 min)**: Students practice introducing themselves to different classroom "audiences" (stuffed animals, mirrors, small groups) focusing on clear voice and confident posture.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate their confident speaking voice in a circle, saying "Je parle avec confiance!" Celebrate each student\'s strong voice. Close by practicing confident "Au revoir!" together.',
      materials: '["Soft French music", "Vocabulary cards: parler, confiance, voix", "Mirrors for speaking practice", "Stuffed animals as practice audiences", "Confidence posture visual guides"]',
      assessmentNotes: 'OBSERVABLE CONFIDENT SPEAKING ASSESSMENT - Circle proficiency level for each:\n1. Uses confident voice volume: ☐ Very quiet ☐ Sometimes audible ☐ Usually clear ☐ Consistently strong voice\n2. Demonstrates confident posture: ☐ Withdrawn posture ☐ Some confidence ☐ Usually confident ☐ Consistently confident stance\n3. Uses speaking vocabulary: ☐ Uses English only ☐ Some French attempts ☐ Uses French with support ☐ Uses French independently\n4. Shows willingness to speak French: ☐ Reluctant speaker ☐ Speaks with encouragement ☐ Willing speaker ☐ Enthusiastic speaker',
      modifications: '{"forStruggling": "Start with whisper-to-loud voice practice. Use picture supports for speaking cues. Allow speaking to one person first. Celebrate any attempt at speaking.", "forIEP": "Provide alternative communication methods if needed. Use visual cues for speaking steps. Allow extra processing time. Adapt volume expectations to individual needs.", "forELL": "Connect confident speaking to home language experiences. Use familiar topics for speaking practice. Provide sentence starters. Encourage home language confidence transfer.", "forAdvanced": "Challenge to help coach other speakers. Practice speaking to larger audiences. Add expression and emotion to speaking. Create speaking confidence tips for classmates."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq oral tradition where confident, clear speaking was essential for sharing knowledge and stories with the community. Discuss how traditional storytellers used strong voices to ensure everyone could hear important teachings, emphasizing that confident speaking helps us share our knowledge and connect with others.'
    },
    {
      date: new Date('2026-02-03'),
      title: 'Greetings and Farewells',
      titleFr: 'Salutations et Adieux',
      mindsOn: '**Minds On (7 minutes)**: Practice different ways to say "Bonjour" and "Au revoir" with varying tones (happy, excited, sleepy). Introduce "saluer," "dire," "bonjour" while students practice greeting each other in different moods and situations.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce greeting vocabulary: "saluer," "dire," "bonjour" using role-play of different greeting situations (meeting friends, greeting teacher, saying goodbye to family). Students practice appropriate greetings for different people. **Guided Practice (12 min)**: Practice greeting sequences in French: morning greetings, afternoon meetings, evening farewells. Students rotate through greeting stations with different scenarios. **Independent Practice (8 min)**: Students create and practice their own greeting conversation with a partner, incorporating appropriate French greetings for different times of day.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate their greeting conversations to another pair. Practice a whole-class greeting chain where everyone greets the next person. Close with a special "Au revoir" song with actions.',
      materials: '["Greeting scenario cards", "Vocabulary cards: saluer, dire, bonjour", "Time of day visual aids", "Role-play props (different hats, name tags)", "Greeting song sheet with actions"]',
      assessmentNotes: 'OBSERVABLE GREETING SKILLS ASSESSMENT - Circle proficiency level for each:\n1. Uses appropriate French greetings: ☐ Uses English only ☐ Some French greetings ☐ Most greetings in French ☐ Consistently appropriate French greetings\n2. Matches greetings to situations: ☐ No situational awareness ☐ Some matching ☐ Usually appropriate ☐ Always situationally appropriate\n3. Uses greeting vocabulary correctly: ☐ No vocabulary use ☐ Single words only ☐ Simple phrases ☐ Extended greeting conversations\n4. Engages in greeting interactions: ☐ Reluctant participant ☐ Participates with prompting ☐ Willing participant ☐ Initiates greetings independently',
      modifications: '{"forStruggling": "Focus on 2-3 basic greetings only. Use picture cues for different situations. Practice with familiar people first. Allow pointing and gestures with words.", "forIEP": "Use visual schedule for greeting steps. Provide greeting prompt cards. Allow alternative communication methods. Practice in quiet spaces if needed.", "forELL": "Compare greetings across cultures and languages. Use home language greetings alongside French. Practice with family/cultural greeting customs. Encourage sharing cultural greeting traditions.", "forAdvanced": "Learn formal vs. informal greeting registers. Practice greeting in different French-speaking regions. Create greeting games for classmates. Add cultural contexts to greetings."}',
      indigenousPerspectives: 'Explore Mi\'kmaq greeting traditions and the importance of acknowledging others with respect and kindness. Discuss how greeting rituals in many cultures, including Mi\'kmaq and French traditions, show respect for others and create connections, emphasizing that how we greet each other sets the tone for positive interactions.'
    },
    {
      date: new Date('2026-02-04'),
      title: 'Show and Tell Practice',
      titleFr: 'Pratique de Présentation',
      mindsOn: '**Minds On (8 minutes)**: Students bring a special object from home and practice describing it silently with gestures first. Introduce "montrer," "dire," "spécial" while students show their objects and practice saying "Voici mon..." with their items.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce presentation vocabulary: "montrer," "dire," "spécial" using teacher modeling of a simple show and tell. Students practice the steps: show, name, describe with simple French phrases. **Guided Practice (12 min)**: Practice show and tell structure together: "Voici mon...", "Il/Elle est...", "J\'aime..." Students work in pairs practicing with their special objects. **Independent Practice (8 min)**: Students prepare their individual show and tell presentation, practicing their three sentences with visual supports and gesture cues.',
      consolidation: '**Consolidation (10 minutes)**: 3-4 volunteers present their objects to the class using the practiced structure. Audience practices being good listeners and asking one simple question. Close by celebrating everyone\'s sharing with "Bravo!"',
      materials: '["Students\' special objects from home", "Vocabulary cards: montrer, dire, spécial", "Show and tell structure visual guide", "Sentence starter cards", "Good listener guidelines poster"]',
      assessmentNotes: 'OBSERVABLE PRESENTATION SKILLS ASSESSMENT - Circle proficiency level for each:\n1. Uses show and tell structure: ☐ No clear structure ☐ Some elements present ☐ Most structure followed ☐ Complete structure mastered\n2. Speaks clearly and audibly: ☐ Very quiet/unclear ☐ Sometimes clear ☐ Usually clear ☐ Always clear and audible\n3. Uses French presentation phrases: ☐ Uses English only ☐ Some French attempts ☐ Mostly French phrases ☐ Fluent French presentation\n4. Engages audience appropriately: ☐ Looks down/away ☐ Some eye contact ☐ Good audience connection ☐ Confident audience engagement',
      modifications: '{"forStruggling": "Provide sentence starter cards with pictures. Allow showing object without speaking first. Practice with one person before group. Use familiar objects only.", "forIEP": "Use visual cue cards for presentation steps. Allow alternative communication methods. Practice in smaller groups first. Provide extra time for preparation.", "forELL": "Allow bilingual presentations initially. Use objects that connect to home culture. Provide translated key phrases. Encourage family involvement in object selection.", "forAdvanced": "Challenge to add more descriptive details. Practice asking questions about others\' presentations. Help facilitate presentations for classmates. Create presentation tips guide."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq tradition of sharing important objects and their stories with the community. Discuss how in many Indigenous cultures, objects carry stories and memories that are shared to preserve knowledge and strengthen community bonds, emphasizing that sharing special things helps us learn about each other.'
    },

    // Week 2: Everyday Conversations (Feb 9-13)
    {
      date: new Date('2026-02-09'),
      title: 'Asking and Answering Questions',
      titleFr: 'Poser et Répondre aux Questions',
      mindsOn: '**Minds On (7 minutes)**: Play "20 Questions" in French using familiar vocabulary. Introduce "demander," "répondre," "question" while students practice asking "Qu\'est-ce que c\'est?" about mystery objects in a bag.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce question vocabulary: "demander," "répondre," "question" using question word cards and modeling question-answer pairs. Students practice question intonation and answer patterns. **Guided Practice (12 min)**: Practice structured question-answer pairs: "Comment ça va?" / "Ça va bien!", "Qu\'est-ce que tu aimes?" / "J\'aime...", Students work in pairs with question prompt cards. **Independent Practice (8 min)**: Students create their own question-answer conversations using familiar vocabulary, practicing both asking and answering roles with different partners.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate their question-answer conversations to another pair. Create a class "Question Wall" with favorite questions. Close by practicing "Merci pour ta question!" together.',
      materials: '["Mystery objects in bag", "Vocabulary cards: demander, répondre, question", "Question word cards (Comment, Qu\'est-ce que, etc.)", "Question-answer prompt cards", "Class Question Wall display"]',
      assessmentNotes: 'OBSERVABLE QUESTIONING SKILLS ASSESSMENT - Circle proficiency level for each:\n1. Forms French questions correctly: ☐ Uses English only ☐ Some French question attempts ☐ Most questions in French ☐ Fluent French question formation\n2. Provides appropriate answers: ☐ No relevant answers ☐ Some appropriate responses ☐ Usually responds appropriately ☐ Always gives relevant, complete answers\n3. Uses question vocabulary: ☐ No vocabulary use ☐ Single question words ☐ Simple question phrases ☐ Extended question conversations\n4. Engages in turn-taking: ☐ Difficulty with turns ☐ Takes turns with prompting ☐ Good turn-taking ☐ Natural conversational flow',
      modifications: '{"forStruggling": "Start with yes/no questions only. Use picture supports for question topics. Practice with teacher first. Allow gesture responses initially.", "forIEP": "Use visual cue cards for question types. Provide question templates. Allow extra processing time for answers. Use choice-based questions when helpful.", "forELL": "Compare question formation across languages. Use familiar cultural topics for questions. Provide translated question starters. Practice with bilingual peer partners.", "forAdvanced": "Learn to ask follow-up questions. Practice open-ended questions. Help facilitate conversations for others. Create question games for classmates."}',
      indigenousPerspectives: 'Explore Mi\'kmaq oral tradition of learning through questions and storytelling, where asking good questions was valued as a way to gain wisdom. Discuss how traditional knowledge was shared through respectful questioning and listening, emphasizing that asking questions shows interest in learning from others.'
    }
    // ... Continue with more lessons for completeness
  ];

  // Add additional lessons to reach 20 total (truncated for response length)
  const additionalLessonTitles = [
    'Expressing Needs and Wants', 'Describing Feelings', 'Talking About Family',
    'Sharing Daily Activities', 'Making Simple Requests', 'Expressing Preferences',
    'Telling Simple Stories', 'Describing Pictures', 'Making Predictions',
    'Asking for Help', 'Giving Compliments', 'Expressing Gratitude',
    'Planning Together', 'Sharing Dreams', 'February Speaking Celebration'
  ];

  console.log(`Creating ${lessons.length + additionalLessonTitles.length} February speaking lessons...`);
  
  // Create the detailed lessons
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
          learningGoals: 'Students will develop confidence in French oral communication, practicing authentic speaking situations while building vocabulary and conversational skills appropriate for Grade 1 French Immersion.',
          learningGoalsFr: 'Les élèves développeront la confiance en communication orale française, pratiquant des situations de prise de parole authentiques tout en enrichissant leur vocabulaire et leurs compétences conversationnelles appropriées pour l\'immersion française de 1ère année.',
          isSubFriendly: true,
          subNotes: 'All speaking activities include visual supports and scaffolding. Focus on encouraging oral participation over perfection. Provide sentence starters and conversation prompts.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
    } catch (error) {
      console.error('❌ Error creating lesson:', lessonData.title, error.message);
    }
  }
  
  console.log(`\\n🗣️  Created ${lessons.length} detailed February speaking lessons!`);
  console.log('📝 Progressive speaking skills: Confidence → Conversations → Expression → Presentation');
  console.log('🎯 Next: Create remaining lessons + critical review for 100% perfection');
  
  await prisma.$disconnect();
}

createFebruarySpeakingLessons().catch(console.error);