#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createSpringMarchLessons() {
  console.log('🌱 CREATING MARCH SPRING LANGUAGE ARTS LESSONS');
  console.log('Integrated reading, writing, speaking, listening with spring themes');
  console.log('================================================================');

  const unitPlanId = 'cmectx0oy000dvj4pqtbicrq2';
  const userId = 23;

  const lessons = [
    // Week 1: March Awakening - Reading Focus (Mar 2-6)
    {
      date: new Date('2026-03-02'),
      title: 'Spring Awakening Stories',
      titleFr: 'Histoires du Réveil Printanier',
      mindsOn: '**Minds On (8 minutes)**: Display spring awakening pictures (melting snow, budding trees, emerging flowers) and have students share what they notice. Introduce "printemps," "réveil," "changer" while students act out things waking up in spring.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce spring vocabulary: "printemps," "réveil," "changer" using interactive spring awakening book with predictable text. Students practice reading spring sight words and making predictions. **Guided Practice (12 min)**: Read a simple French spring story together, pausing for students to identify changes they see and hear. Practice reading with expression to match spring excitement. **Independent Practice (8 min)**: Students choose spring picture books at their level, focusing on reading for meaning and identifying spring changes described in text.',
      consolidation: '**Consolidation (10 minutes)**: Students share one spring change they read about using "Au printemps, je lis que..." Create a class "Spring Reading List" with favorite discoveries. Close by reading a short spring poem together with expression.',
      materials: '["Spring awakening pictures", "Vocabulary cards: printemps, réveil, changer", "Interactive spring awakening book", "Leveled spring picture books", "Spring poetry collection", "Class reading list chart"]',
      assessmentNotes: 'OBSERVABLE SPRING READING ASSESSMENT - Circle proficiency level for each:\n1. Identifies spring vocabulary in text: ☐ No recognition ☐ With picture support ☐ Some recognition ☐ Independent recognition\n2. Reads with appropriate expression: ☐ Monotone reading ☐ Some expression ☐ Good expression ☐ Expressive, engaging reading\n3. Makes connections to spring experiences: ☐ No connections ☐ Simple connections ☐ Clear connections ☐ Rich, detailed connections\n4. Uses reading vocabulary in discussion: ☐ Uses English only ☐ Some French attempts ☐ Mostly French ☐ Fluent French reading talk',
      modifications: '{"forStruggling": "Provide books with more pictures than text. Use familiar spring experiences for connections. Allow pointing to pictures while reading. Practice with high-frequency words first.", "forIEP": "Use digital books with audio support. Provide sensory spring experiences alongside reading. Allow alternative ways to show understanding. Use visual reading guides.", "forELL": "Connect to spring experiences from home climate/culture. Use bilingual spring books when possible. Provide visual vocabulary supports. Compare spring words across languages.", "forAdvanced": "Challenge to read longer spring texts independently. Encourage complex connections and predictions. Help lead group reading discussions. Create spring reading recommendations for classmates."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq understanding of spring as a time of renewal and awakening, including traditional knowledge about reading signs in nature that indicate seasonal changes. Discuss how both traditional knowledge and book reading help us understand the world around us, emphasizing different ways of gaining knowledge and wisdom.'
    },
    {
      date: new Date('2026-03-03'),
      title: 'Nature\'s Writing - Environmental Print',
      titleFr: 'L\'Écriture de la Nature - Textes Environnementaux',
      mindsOn: '**Minds On (7 minutes)**: Take students on a brief outdoor observation walk (or use detailed nature photos) to find "nature\'s writing" - patterns, textures, signs. Introduce "observer," "nature," "signes" while students practice "reading" what nature tells us.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce environmental observation vocabulary: "observer," "nature," "signes" using nature journals and magnifying glasses. Students practice being "nature readers" who notice details and signs. **Guided Practice (12 min)**: Practice reading environmental print around school and outdoors: signs, labels, natural patterns. Students identify French text in their environment and discuss what it tells us. **Independent Practice (8 min)**: Students create their own "Nature Reading Book" by drawing and labeling environmental observations, focusing on things that "tell stories" about spring changes.',
      consolidation: '**Consolidation (10 minutes)**: Students share one discovery from their nature reading with "J\'ai observé que..." Create a class "Environmental Readers" display with all observations. Close by discussing how nature and books both tell us stories.',
      materials: '["Magnifying glasses", "Vocabulary cards: observer, nature, signes", "Nature journals/clipboards", "Environmental print examples", "Drawing materials", "Class environmental readers display"]',
      assessmentNotes: 'OBSERVABLE ENVIRONMENTAL READING ASSESSMENT - Circle proficiency level for each:\n1. Identifies print in environment: ☐ Cannot identify ☐ Finds some print ☐ Finds variety of print ☐ Finds print in unexpected places\n2. Makes observations about nature: ☐ Minimal observations ☐ Basic observations ☐ Detailed observations ☐ Insightful, scientific observations\n3. Uses observation vocabulary: ☐ Uses English only ☐ Some French attempts ☐ Mostly French terms ☐ Fluent French observation language\n4. Connects nature to reading concepts: ☐ No connections made ☐ Simple connections ☐ Clear connections ☐ Sophisticated understanding of "reading" nature',
      modifications: '{"forStruggling": "Focus on obvious environmental print first. Use close-up photos of nature details. Allow oral descriptions instead of writing. Pair with keen observer.", "forIEP": "Provide adaptive tools for outdoor observation. Use systematic observation sheets. Allow alternative recording methods. Focus on sensory observations.", "forELL": "Use nature vocabulary in multiple languages. Connect to environmental knowledge from home country. Use visual observation guides. Practice scientific observation language.", "forAdvanced": "Challenge to find hidden or subtle environmental messages. Create detailed scientific observations. Help others notice environmental details. Research environmental print in different cultures."}',
      indigenousPerspectives: 'Explore Mi\'kmaq traditional ecological knowledge and how Indigenous peoples have always been skilled readers of environmental signs for survival, navigation, and understanding seasonal changes. Discuss how this ancient way of reading the environment is a sophisticated form of literacy that connects people deeply to the land.'
    },

    // Week 2: Spring Poetry and Expression (Mar 9-13)
    {
      date: new Date('2026-03-09'),
      title: 'Spring Poetry Voices',
      titleFr: 'Voix de Poésie Printanière',
      mindsOn: '**Minds On (8 minutes)**: Play soft spring nature sounds while reading a simple French spring poem with rhythm and expression. Introduce "poésie," "rythme," "voix" while students clap to the rhythm and practice reading with different voice tones.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce poetry vocabulary: "poésie," "rythme," "voix" using echo reading and choral reading of spring poems. Students practice finding rhythm and expression in French poetry. **Guided Practice (12 min)**: Explore different ways to read poetry: whisper voices, strong voices, happy voices, wondering voices. Students practice reading short spring poems with appropriate expression for meaning. **Independent Practice (8 min)**: Students choose a favorite spring poem to practice reading with expression, preparing to share their "poetry voice" with others.',
      consolidation: '**Consolidation (10 minutes)**: Students perform their poems with expression for small groups. Create a "Poetry Voices" celebration where everyone shares. Close by reading a class poem together with all voices combined.',
      materials: '["Spring nature sounds recording", "Vocabulary cards: poésie, rythme, voix", "Collection of simple French spring poems", "Poetry voice expression guides", "Recording device for poetry performances"]',
      assessmentNotes: 'OBSERVABLE POETRY EXPRESSION ASSESSMENT - Circle proficiency level for each:\n1. Reads poetry with appropriate rhythm: ☐ No rhythm awareness ☐ Some rhythm ☐ Good rhythm ☐ Natural, expressive rhythm\n2. Uses voice expression for meaning: ☐ Monotone delivery ☐ Some expression ☐ Good expression ☐ Highly expressive, engaging delivery\n3. Uses poetry vocabulary: ☐ Uses English only ☐ Some French terms ☐ Mostly French ☐ Fluent French poetry language\n4. Shows appreciation for poetry: ☐ Reluctant participation ☐ Some enjoyment ☐ Clear enjoyment ☐ Enthusiastic poetry lover',
      modifications: '{"forStruggling": "Start with very short, repetitive poems. Use poems with strong rhythm patterns. Allow humming rhythm instead of reading. Practice with familiar content first.", "forIEP": "Use poems with simple, predictable patterns. Provide rhythm supports (drums, clapping). Allow movement with poetry. Use visual poetry supports.", "forELL": "Use poems with universal themes and simple vocabulary. Connect to poetry traditions from home culture. Provide rhythm and rhyme pattern supports. Encourage sharing poetry from home language.", "forAdvanced": "Explore complex poetry forms and literary devices. Help coach other poetry readers. Create original spring poems. Research different cultural poetry traditions."}',
      indigenousPerspectives: 'Honor Mi\'kmaq oral poetry traditions and the use of rhythmic language to preserve important cultural teachings and stories. Discuss how poetry in all cultures uses the music of language to touch hearts and preserve wisdom, emphasizing that poetry connects us to the deeper meanings of our experiences.'
    }
    // ... Additional March lessons would continue here for complete month coverage
  ];

  console.log(`Creating ${lessons.length} March spring lessons...`);
  
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
          learningGoals: 'Students will integrate reading, writing, speaking, and listening skills through spring-themed language arts experiences, demonstrating growth in French literacy and communication while connecting to seasonal changes and natural phenomena.',
          learningGoalsFr: 'Les élèves intégreront les compétences de lecture, d\'écriture, d\'expression orale et d\'écoute à travers des expériences de français langue première à thème printanier, démontrant une croissance en littératie française et en communication tout en se connectant aux changements saisonniers et aux phénomènes naturels.',
          isSubFriendly: true,
          subNotes: 'All activities include visual and tactile supports. Emphasis on multi-sensory learning through nature connections. Integrate outdoor observation when possible. Encourage creative expression over accuracy.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
    } catch (error) {
      console.error('❌ Error creating lesson:', lessonData.title, error.message);
    }
  }
  
  console.log(`\\n🌱 Created ${lessons.length} March spring lessons!`);
  console.log('📚 Integrated language arts: Reading + Environmental literacy + Poetry');
  console.log('🎯 Building from February speaking skills to full language arts integration');
  console.log('⏭️  Next: Create remaining March + April lessons for complete unit');
  
  await prisma.$disconnect();
}

createSpringMarchLessons().catch(console.error);