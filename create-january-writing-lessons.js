#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createJanuaryWritingLessons() {
  console.log('✍️ CREATING JANUARY WRITING PRACTICE LESSONS');
  console.log('Progressive writing skills for Grade 1 French Immersion');
  console.log('====================================================');

  const unitPlanId = 'cmectx0ow0009vj4p5fj84kve';
  const userId = 23;

  const lessons = [
    // Week 1: Letter Formation Focus (Jan 6-10)
    {
      date: new Date('2026-01-06'),
      title: 'New Year Writing Goals',
      titleFr: 'Objectifs d\'Écriture Nouvelle Année',
      mindsOn: '**Minds On (8 minutes)**: Display a large calendar showing January and introduce "janvier" and "nouveau." Students share one thing they want to learn to write better this year. Practice saying "Je veux écrire" while air-writing letters in the air.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce writing goal vocabulary: "écrire," "lettres," "améliorer" using writing samples and gestures. Students practice letter formation in sand trays while saying letter names in French. **Guided Practice (12 min)**: Create a class writing goal chart together, with students suggesting what they want to write: letters, words, or stories. Practice writing simple French letters together. **Independent Practice (8 min)**: Students create their personal writing goal poster with drawings and one French word they want to master this month.',
      consolidation: '**Consolidation (10 minutes)**: Students share their writing goals in pairs: "Je veux écrire..." Display all goal posters to create a classroom writing motivation wall. Close by tracing letters together while saying "Nous écrivons bien!"',
      materials: '["Large January calendar", "Vocabulary cards: janvier, nouveau, écrire, lettres, améliorer", "Sand trays for letter practice", "Chart paper for class goals", "Drawing paper and crayons", "Sample writing work"]',
      assessmentNotes: 'OBSERVABLE WRITING GOALS ASSESSMENT - Circle proficiency level for each:\n1. Recognizes writing vocabulary: ☐ No recognition ☐ With visual support ☐ Hesitant recognition ☐ Confident recognition\n2. Forms letters correctly in sand: ☐ Random marks ☐ Approximate shapes ☐ Recognizable letters ☐ Correct formation\n3. Sets personal writing goals: ☐ Cannot identify ☐ With prompting ☐ Identifies one goal ☐ Identifies multiple goals\n4. Uses "Je veux écrire" appropriately: ☐ No attempt ☐ With heavy prompting ☐ With some prompting ☐ Independent use',
      modifications: '{"forStruggling": "Provide letter formation guides with arrows. Use larger writing surfaces. Allow tracing over dotted letters. Pair with writing buddy for encouragement.", "forIEP": "Use adapted writing tools (thick pencils, grips). Provide tactile letter cards. Allow alternative goal-setting methods. Use visual goal tracking charts.", "forELL": "Connect writing goals to home language experiences. Provide visual vocabulary supports. Use cognates when possible. Encourage bilingual goal setting.", "forAdvanced": "Encourage goals for writing longer texts like stories. Teach additional writing vocabulary like \'histoire\' and \'phrase\'. Help peers with letter formation. Create detailed writing improvement plans."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq oral tradition and the importance of preserving stories and knowledge through writing. Discuss how written language helps preserve cultural knowledge and stories for future generations, honoring both traditional oral storytelling and the modern skill of writing to share important teachings.'
    },
    {
      date: new Date('2026-01-07'),
      title: 'Capital and Lowercase Letters',
      titleFr: 'Lettres Majuscules et Minuscules',
      mindsOn: '**Minds On (7 minutes)**: Show pairs of capital and lowercase letters on cards and introduce "majuscule" and "minuscule." Students play "Letter Match" - finding the big and little versions of the same letter while practicing French letter names.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce letter vocabulary: "majuscule," "minuscule," "grande lettre" using letter cards and sorting activities. Students practice identifying and naming letters in French. **Guided Practice (12 min)**: Use interactive letter sorting where students categorize letters as "majuscule" or "minuscule." Practice writing their names with correct capital letter at the beginning. **Independent Practice (8 min)**: Students create their own letter matching book, drawing and labeling pairs of letters they know well.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate letter pairs to classmates, saying "Voici A majuscule et a minuscule." Play a quick "Letter Simon Says" game using French commands. Close by writing the date together with proper capitalization.',
      materials: '["Capital and lowercase letter cards", "Vocabulary cards: majuscule, minuscule, grande lettre", "Letter sorting mats", "Individual letter books (blank)", "Pencils and crayons", "Date writing practice sheets"]',
      assessmentNotes: 'OBSERVABLE LETTER KNOWLEDGE ASSESSMENT - Circle proficiency level for each:\n1. Identifies capital letters: ☐ Few letters ☐ Some letters ☐ Most letters ☐ All letters confidently\n2. Identifies lowercase letters: ☐ Few letters ☐ Some letters ☐ Most letters ☐ All letters confidently\n3. Uses French letter vocabulary: ☐ Uses English only ☐ Some French terms ☐ Most French terms ☐ All French terms correctly\n4. Writes name with proper capitalization: ☐ All lowercase ☐ Inconsistent ☐ Usually correct ☐ Always correct',
      modifications: '{"forStruggling": "Start with most familiar letters (name letters). Use color coding for capitals vs. lowercase. Provide letter tracing sheets. Focus on 3-5 letter pairs only.", "forIEP": "Use textured letter cards for tactile learning. Provide letter stamps or magnetic letters. Allow longer time for matching activities. Use visual schedules for tasks.", "forELL": "Compare to home language letter systems if applicable. Use picture cues alongside letters. Provide home language letter names. Connect to familiar words in both languages.", "forAdvanced": "Challenge to identify letters in different fonts. Teach about when to use capital letters (names, sentences). Create letter teaching materials for classmates. Practice writing in cursive formation."}',
      indigenousPerspectives: 'Discuss how Mi\'kmaq traditional pictographs and symbols conveyed meaning before alphabetic writing, and how both systems - traditional symbols and modern letters - are valuable ways to preserve and share knowledge. Explore how different writing systems all serve the important purpose of communication across time and distance.'
    },
    {
      date: new Date('2026-01-08'),
      title: 'Winter Letter Practice',
      titleFr: 'Pratique des Lettres d\'Hiver',
      mindsOn: '**Minds On (8 minutes)**: Write winter words on the board (neige, froid, glace) and have students identify letters they recognize. Introduce "lettres d\'hiver" while students trace letters in "snow" (salt or flour) in trays.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Practice writing letters found in winter vocabulary: "hiver," "neige," "froid" using multi-sensory approaches. Students practice letter formation while saying the letter names in French. **Guided Practice (12 min)**: Write winter words together on large paper, focusing on correct letter formation. Students take turns writing individual letters while classmates cheer them on. **Independent Practice (8 min)**: Students practice writing winter letters in their writing books, creating patterns and words with the letters they\'re learning.',
      consolidation: '**Consolidation (10 minutes)**: Students share their best letter formations with the class. Create a "Winter Letter Wall" displaying everyone\'s work. Close by writing "HIVER" together while talking about each letter.',
      materials: '["Salt or flour trays for sensory writing", "Vocabulary cards: lettres d\'hiver, hiver, neige, froid", "Large chart paper", "Individual writing books", "Markers and pencils", "Winter letter formation guides"]',
      assessmentNotes: 'OBSERVABLE WINTER LETTER PRACTICE ASSESSMENT - Circle proficiency level for each:\n1. Forms winter vocabulary letters correctly: ☐ Difficult formation ☐ Some correct strokes ☐ Mostly correct ☐ Proper formation\n2. Uses sensory writing effectively: ☐ Random movements ☐ Some letter shapes ☐ Clear letter attempts ☐ Confident letter formation\n3. Participates in group writing: ☐ Reluctant participation ☐ Some participation ☐ Active participation ☐ Leadership in activity\n4. Connects letters to winter words: ☐ No connection ☐ With prompting ☐ Makes some connections ☐ Clear understanding',
      modifications: '{"forStruggling": "Focus on 2-3 key letters only. Use thicker writing tools. Provide hand-over-hand support if needed. Allow extra time for formation.", "forIEP": "Adapt materials for sensory preferences. Use weighted writing tools if helpful. Provide alternative surfaces (magnetic boards, apps). Allow standing or movement during writing.", "forELL": "Connect to winter words in home language. Use pictures alongside winter vocabulary. Practice familiar letters first. Encourage sharing winter experiences from home culture.", "forAdvanced": "Challenge to write simple winter sentences. Teach about letter families and patterns. Help peers with letter formation. Create winter word books with illustrations."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq knowledge of winter survival and how important it was to mark and record winter observations for community safety. Discuss how writing helps us remember important information about seasons and weather, just as Mi\'kmaq knowledge keepers passed down essential winter knowledge through generations.'
    },

    // Week 2: Word Building (Jan 13-17)
    {
      date: new Date('2026-01-13'),
      title: 'Building Simple French Words',
      titleFr: 'Construire des Mots Français Simples',
      mindsOn: '**Minds On (7 minutes)**: Display letter cards and challenge students to make simple words they know like "moi," "oui," "non." Introduce "mots" and "simple" while celebrating each word they create successfully.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce word-building vocabulary: "mots," "simple," "assembler" using letter manipulatives and word cards. Students practice building familiar words with guidance. **Guided Practice (12 min)**: Work together to build French words from their previous vocabulary (ami, papa, maman) using large letter cards. Students take turns adding letters while saying each sound. **Independent Practice (8 min)**: Students use individual letter sets to build 3-5 simple French words they know, copying them into their writing books with pictures.',
      consolidation: '**Consolidation (10 minutes)**: Students share their favorite word they built: "Mon mot préféré est..." Create a class word bank with all the successfully built words. Close by building "BRAVO" together to celebrate everyone\'s word-building success.',
      materials: '["Individual letter card sets", "Vocabulary cards: mots, simple, assembler", "Large demonstration letters", "Word building mats", "Writing books", "Picture cards for word support"]',
      assessmentNotes: 'OBSERVABLE WORD BUILDING ASSESSMENT - Circle proficiency level for each:\n1. Builds simple French words independently: ☐ Needs full support ☐ Builds with guidance ☐ Builds some independently ☐ Builds confidently\n2. Recognizes word components (letters/sounds): ☐ Limited recognition ☐ Some letter-sound connections ☐ Good connections ☐ Strong phonemic awareness\n3. Uses word-building vocabulary: ☐ No French terms ☐ Some attempts ☐ Uses terms with prompting ☐ Uses terms independently\n4. Transfers words to writing: ☐ Cannot transfer ☐ Copies with errors ☐ Copies accurately ☐ Writes from memory',
      modifications: '{"forStruggling": "Start with 2-letter words only. Use picture supports for all words. Provide word templates to fill in. Focus on most familiar vocabulary first.", "forIEP": "Use larger letter manipulatives. Provide word-building apps or magnetic letters. Allow alternative recording methods. Use color-coding for different word parts.", "forELL": "Connect to cognates and similar words in home language. Use picture dictionaries. Build words from home culture first. Encourage bilingual word building.", "forAdvanced": "Challenge to build longer words and simple phrases. Teach about word families and patterns. Create word-building challenges for classmates. Build French words they haven\'t seen before."}',
      indigenousPerspectives: 'Connect to how Mi\'kmaq language builds meaning through word construction and how every language has its own beautiful way of putting sounds and meanings together. Discuss the importance of preserving all languages and celebrating the unique ways different languages create words and express ideas.'
    },

    // Week 3: Sentence Writing (Jan 20-24)
    {
      date: new Date('2026-01-20'),
      title: 'My First French Sentences',
      titleFr: 'Mes Premières Phrases en Français',
      mindsOn: '**Minds On (8 minutes)**: Show examples of simple sentences starting with "Je suis" and "J\'aime" written on sentence strips. Introduce "phrases" and "commencer" while students practice saying complete thoughts about themselves.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce sentence vocabulary: "phrases," "commencer," "finir" using sentence frames and modeling. Students practice building oral sentences before writing. **Guided Practice (12 min)**: Create shared sentences together using "Je suis..." and "J\'aime..." with picture supports. Students help choose words and discuss where sentences begin and end. **Independent Practice (8 min)**: Students write 2-3 simple sentences about themselves using provided sentence starters and word banks, adding illustrations.',
      consolidation: '**Consolidation (10 minutes)**: Students read their sentences to a partner. Choose volunteers to share one sentence with the class. Close by reading everyone\'s sentences together as a "Class Book of First Sentences."',
      materials: '["Sentence strips with examples", "Vocabulary cards: phrases, commencer, finir", "Sentence starter cards (Je suis, J\'aime)", "Word bank cards", "Writing paper with lines", "Illustration materials"]',
      assessmentNotes: 'OBSERVABLE SENTENCE WRITING ASSESSMENT - Circle proficiency level for each:\n1. Constructs complete French sentences: ☐ Word lists only ☐ Sentence fragments ☐ Simple complete sentences ☐ Multiple complete sentences\n2. Uses sentence starters appropriately: ☐ Cannot use starters ☐ Uses with heavy support ☐ Uses with some support ☐ Uses independently\n3. Adds appropriate ending punctuation: ☐ No punctuation ☐ Inconsistent ☐ Usually correct ☐ Always correct\n4. Shares writing confidently: ☐ Reluctant to share ☐ Shares with encouragement ☐ Willing to share ☐ Confident presenter',
      modifications: '{"forStruggling": "Provide sentence templates with blanks to fill. Use picture sentence cards. Allow dictation to adult. Focus on one sentence starter only.", "forIEP": "Use sentence-building apps or manipulatives. Provide alternative communication methods. Allow longer processing time. Use visual sentence structure supports.", "forELL": "Connect sentence patterns to home language structures. Provide picture supports for vocabulary. Encourage bilingual sentence creation. Use familiar topics for sentence content.", "forAdvanced": "Challenge to write longer, more complex sentences. Teach about adding details with adjectives. Help classmates with sentence construction. Create sentence books for class library."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq oral tradition where complete thoughts and stories were shared through spoken sentences, and how writing sentences helps preserve important ideas and stories. Discuss how both spoken and written sentences carry meaning and help us share our thoughts with others across time and distance.'
    },

    // Week 4: Creative Writing (Jan 27-31)
    {
      date: new Date('2026-01-27'),
      title: 'Winter Story Creation',
      titleFr: 'Création d\'Histoires d\'Hiver',
      mindsOn: '**Minds On (7 minutes)**: Show a picture book about winter and discuss story elements: characters, setting, events. Introduce "histoires," "personnages," "créer" while students brainstorm winter story ideas together.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce story creation vocabulary: "histoires," "personnages," "créer" using story maps and picture prompts. Students practice identifying story parts in familiar tales. **Guided Practice (12 min)**: Create a class winter story together, with students contributing ideas for characters and events. Write the story on chart paper while discussing story structure. **Independent Practice (8 min)**: Students create their own simple winter story using drawings and words, focusing on one main character and one winter event.',
      consolidation: '**Consolidation (10 minutes)**: Students share their winter stories in small groups. Display stories around the room for a "Winter Story Gallery." Close by celebrating everyone as "authors" - "Nous sommes des auteurs!"',
      materials: '["Winter picture books for inspiration", "Vocabulary cards: histoires, personnages, créer", "Story map templates", "Chart paper for class story", "Story creation booklets", "Drawing and writing materials"]',
      assessmentNotes: 'OBSERVABLE STORY CREATION ASSESSMENT - Circle proficiency level for each:\n1. Identifies story elements: ☐ Cannot identify ☐ Identifies with prompting ☐ Identifies some elements ☐ Clearly identifies all elements\n2. Creates original story content: ☐ Copies existing stories ☐ Some original ideas ☐ Mostly original content ☐ Highly creative and original\n3. Uses story vocabulary in French: ☐ Uses English only ☐ Some French attempts ☐ Uses French with support ☐ Uses French independently\n4. Combines writing and illustration effectively: ☐ Unclear connection ☐ Some connection ☐ Good integration ☐ Excellent storytelling through both',
      modifications: '{"forStruggling": "Provide story templates with picture prompts. Allow story telling through pictures only. Use familiar story patterns. Pair with storytelling buddy.", "forIEP": "Use story creation apps with voice recording. Provide alternative communication methods for story sharing. Allow longer time for creation. Use visual story supports.", "forELL": "Encourage bilingual storytelling. Connect to stories from home culture. Use universal story themes. Provide picture vocabulary supports.", "forAdvanced": "Challenge to include dialogue in stories. Teach about story structure (beginning, middle, end). Create longer, more detailed stories. Help peers develop their stories."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq storytelling traditions where winter stories were told during long winter nights to teach lessons and preserve cultural knowledge. Discuss how both traditional oral stories and modern written stories serve the important purpose of sharing wisdom, entertainment, and cultural values across generations.'
    },
    {
      date: new Date('2026-01-28'),
      title: 'January Writing Celebration',
      titleFr: 'Célébration d\'Écriture de Janvier',
      mindsOn: '**Minds On (8 minutes)**: Display all January writing work around the room for a gallery walk. Students visit each station and celebrate their growth from letters to stories. Practice saying "J\'ai appris" and "Je suis fier/fière" while reviewing their progress.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Review January writing journey: letters → words → sentences → stories. Students identify their biggest writing accomplishment using "réussir," "fier/fière," "progrès." **Guided Practice (12 min)**: Students work in pairs to prepare a "Writing Showcase" presentation, choosing their best work and practicing how to share it in French. **Independent Practice (8 min)**: Students complete a writing reflection, drawing their favorite writing activity and writing one sentence about their January learning.',
      consolidation: '**Consolidation (10 minutes)**: Hold the January Writing Showcase where students present their work. Celebrate with applause and positive French phrases. Close by saying "Nous écrivons mieux maintenant!" (We write better now!)',
      materials: '["Gallery walk setup with January work", "Vocabulary cards: réussir, fier/fière, progrès", "Presentation materials", "Reflection sheets", "Celebration props", "Camera for documentation"]',
      assessmentNotes: 'JANUARY WRITING CULMINATING ASSESSMENT - Circle proficiency level for each:\n1. Demonstrates January writing growth: ☐ Minimal growth ☐ Some progress ☐ Clear progress ☐ Significant growth\n2. Uses French to describe learning: ☐ Uses English only ☐ Some French words ☐ French phrases ☐ Extended French communication\n3. Reflects on writing development: ☐ Cannot reflect ☐ With heavy support ☐ With some support ☐ Independent reflection\n4. Celebrates learning confidently: ☐ Reluctant participation ☐ Some participation ☐ Active participation ☐ Enthusiastic leadership',
      modifications: '{"forStruggling": "Focus on one significant accomplishment only. Use visual reflection tools. Allow non-verbal demonstration of learning. Celebrate effort over perfection.", "forIEP": "Use digital portfolios for reflection. Allow alternative showcase formats. Provide celebration participation choices. Use positive reinforcement throughout.", "forELL": "Encourage reflection in home language alongside French. Connect to writing progress in multiple languages. Celebrate multilingual writing abilities.", "forAdvanced": "Challenge to mentor other writers. Create detailed reflection on writing strategies learned. Help facilitate showcase presentations. Set goals for February writing."}',
      indigenousPerspectives: 'Conclude with Mi\'kmaq teachings about celebrating learning milestones and acknowledging growth in traditional skills. Connect to how both Mi\'kmaq and French cultures value learning progress and community celebration of individual achievements, emphasizing that learning is a journey worthy of recognition and gratitude.'
    }
  ];

  console.log(`Creating ${lessons.length} January writing lessons...`);
  
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
          learningGoals: 'Students will develop progressive French writing skills from letter formation through story creation, demonstrating growth in French language expression and confidence in written communication.',
          learningGoalsFr: 'Les élèves développeront des compétences progressives en écriture française, de la formation de lettres à la création d\'histoires, démontrant une croissance dans l\'expression en français et la confiance en communication écrite.',
          isSubFriendly: true,
          subNotes: 'All vocabulary cards, writing templates, and visual supports provided. Progressive lessons build writing confidence through hands-on activities.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
    } catch (error) {
      console.error('❌ Error creating lesson:', lessonData.title, error.message);
    }
  }
  
  console.log(`\\n✍️ ${lessons.length} January writing lessons created successfully!`);
  console.log('📝 Progressive writing skills: Letters → Words → Sentences → Stories');
  console.log('🎯 Next: Critical review to ensure 95%+ perfection standard');
  
  await prisma.$disconnect();
}

createJanuaryWritingLessons().catch(console.error);