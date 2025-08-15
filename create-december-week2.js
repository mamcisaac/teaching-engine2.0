#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createDecemberWeek2Lessons() {
  console.log('🎄 Creating December Week 2: Holiday Traditions (Dec 8-12)');
  console.log('===============================================');

  const unitPlanId = 'cmectx0ow0007vj4pufdl9z3g';
  const userId = 23;

  const lessons = [
    {
      date: new Date('2025-12-08'),
      title: 'Christmas Around the World',
      titleFr: 'Noël Autour du Monde',
      mindsOn: '**Minds On (7 minutes)**: Show a world map and ask students to share what they know about Christmas celebrations. Present vocabulary cards with "Noël" and "le monde" while pointing to different countries on the map. Students practice saying "Joyeux Noël" together.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce "les traditions" and "différent" using picture cards of Christmas celebrations from France, Canada, and other countries. **Guided Practice (12 min)**: Read a simple story about how children celebrate Christmas in France vs. Canada, emphasizing "les cadeaux," "le père Noël," and "la famille." Students identify similarities and differences using visual supports. **Independent Practice (8 min)**: Students draw their family\'s Christmas tradition and label it with one French word from today\'s lesson.',
      consolidation: '**Consolidation (10 minutes)**: Students share their drawings in pairs, saying one sentence about their tradition: "Ma famille... [tradition]." Close with singing "Joyeux Noël" while looking at the world map to remember Christmas is celebrated everywhere.',
      materials: '["World map", "Vocabulary cards: Noël, le monde, les traditions, différent, les cadeaux, le père Noël, la famille", "Simple picture book about Christmas traditions", "Drawing paper", "Crayons", "Chart paper for vocabulary display"]',
      assessmentNotes: 'OBSERVABLE HOLIDAY TRADITIONS ASSESSMENT - Circle proficiency level for each:\n1. Recognizes "Noël" vocabulary: ☐ No recognition ☐ With visual support ☐ Hesitant recognition ☐ Confident recognition\n2. Identifies family traditions: ☐ Cannot identify ☐ With prompting ☐ Identifies one ☐ Identifies multiple\n3. Uses simple French labels: ☐ No attempt ☐ Single words ☐ Simple phrases ☐ Full sentences\n4. Demonstrates respect for different traditions: ☐ Not shown ☐ With reminders ☐ Mostly shown ☐ Consistently shown',
      modifications: '{"forStruggling": "Provide picture cards with French words and English translations. Use gesture supports for vocabulary. Allow drawing instead of writing. Pair with buddy for sharing.", "forIEP": "Pre-teach vocabulary with visual supports. Reduce drawing expectations to simple symbols. Provide sentence starters. Allow extra processing time.", "forELL": "Provide home language connections for tradition vocabulary. Use cognates when possible. Encourage sharing traditions from home culture. Visual vocabulary cards with pictures.", "forAdvanced": "Challenge to use full sentences in French. Create a mini-book about different Christmas traditions. Teach additional vocabulary like \'célébrer\' and \'special\'. Lead small group discussions."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq winter celebrations and the importance of family gathering during the darkest time of year. Discuss how Mi\'kmaq communities have their own special ways of celebrating and sharing during winter, emphasizing respect for all cultural traditions and the universal values of family, sharing, and gratitude during winter celebrations.'
    },
    {
      date: new Date('2025-12-09'),
      title: 'Holiday Decorations',
      titleFr: 'Les Décorations de Fête',
      mindsOn: '**Minds On (8 minutes)**: Display various holiday decorations (real or pictures) around the classroom. Students walk around and touch/observe decorations. Introduce "les décorations" and "joli/jolie" by describing each item: "C\'est joli!" Students repeat and point.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce decoration vocabulary using real items: "l\'étoile," "les lumières," "la couronne." Students practice pronunciation while handling safe decorations. **Guided Practice (12 min)**: Play "Trouve la décoration" - call out a decoration name and students find it in the room. Then read a simple book about decorating for holidays, pausing to identify decorations. **Independent Practice (8 min)**: Students create their own paper star decoration while practicing saying "mon étoile" and choosing colors using French color words from previous lessons.',
      consolidation: '**Consolidation (10 minutes)**: Students hold up their stars and say "Voici mon étoile!" in a circle. Sing a simple song about decorations using the melody of "Twinkle, Twinkle": "Étoile, étoile dans le ciel, tu es très, très belle." Display all stars on a classroom "tree."',
      materials: '["Real holiday decorations (safe for handling)", "Vocabulary cards: les décorations, joli/jolie, l\'étoile, les lumières, la couronne", "Simple book about holiday decorating", "Construction paper stars", "Crayons/markers", "Glue sticks", "Classroom decoration display area"]',
      assessmentNotes: 'OBSERVABLE DECORATION VOCABULARY ASSESSMENT - Circle proficiency level for each:\n1. Identifies decoration vocabulary: ☐ No identification ☐ With visual cues ☐ Hesitant identification ☐ Confident identification\n2. Uses "joli/jolie" appropriately: ☐ No use ☐ With prompting ☐ Sometimes correct ☐ Consistently correct\n3. Follows craft instructions in French: ☐ Needs translation ☐ With gestures ☐ Understands most ☐ Follows independently\n4. Participates in French song/chant: ☐ Silent observer ☐ Some participation ☐ Active participation ☐ Leads others',
      modifications: '{"forStruggling": "Provide tactile decorations to handle. Use more visual cues and gestures. Simplify craft to coloring only. Pair with buddy for activities.", "forIEP": "Pre-teach vocabulary with real objects. Break craft into smaller steps with visual guides. Allow non-verbal participation in song. Provide sensory alternatives if needed.", "forELL": "Connect to holiday decorations from home culture. Provide home language labels alongside French. Use cognates where available. Encourage sharing about family decorating traditions.", "forAdvanced": "Teach additional decoration vocabulary like \'brillant\' and \'coloré\'. Create complex decoration patterns. Help teach vocabulary to classmates. Write simple sentences about decorations."}',
      indigenousPerspectives: 'Discuss how Mi\'kmaq people traditionally decorated with natural materials from the forest - birchbark, sweetgrass, and beautiful beadwork. Explore how both Mi\'kmaq and French traditions use natural materials to create beauty during winter, honoring the connection between people and the natural world through decorative arts.'
    },
    {
      date: new Date('2025-12-10'),
      title: 'Holiday Foods',
      titleFr: 'Les Aliments de Fête',
      mindsOn: '**Minds On (7 minutes)**: Set up a "restaurant" corner with play food or pictures of holiday foods. Students pretend to be customers ordering holiday foods. Introduce "les aliments" and "délicieux" by "tasting" different foods and saying "C\'est délicieux!"',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce holiday food vocabulary using pictures or play food: "les biscuits," "le gâteau," "le chocolat chaud." Students practice ordering: "Je voudrais..." in the restaurant setup. **Guided Practice (12 min)**: Read a story about a French Canadian family preparing holiday treats. Students identify foods they recognize and practice saying "J\'aime" or "Je n\'aime pas." **Independent Practice (8 min)**: Students draw their favorite holiday food and practice presenting it: "Mon aliment préféré est..." Using vocabulary from previous lessons and new food words.',
      consolidation: '**Consolidation (10 minutes)**: Students present their favorite holiday food drawings to the class. Create a class "menu" by posting all drawings together. End by pretending to "eat" together saying "Bon appétit!"',
      materials: '["Play food or food pictures", "Restaurant setup materials", "Vocabulary cards: les aliments, délicieux, les biscuits, le gâteau, le chocolat chaud", "Simple story about holiday cooking", "Drawing paper", "Crayons", "Chart paper for class menu"]',
      assessmentNotes: 'OBSERVABLE FOOD VOCABULARY ASSESSMENT - Circle proficiency level for each:\n1. Recognizes holiday food vocabulary: ☐ No recognition ☐ With pictures only ☐ With some prompting ☐ Independent recognition\n2. Uses "Je voudrais" appropriately: ☐ No attempt ☐ With heavy prompting ☐ With some prompting ☐ Independently\n3. Expresses food preferences in French: ☐ Uses English only ☐ Single French words ☐ Simple French phrases ☐ Complete French sentences\n4. Participates in dramatic play: ☐ Reluctant participation ☐ With encouragement ☐ Active participation ☐ Takes leadership role',
      modifications: '{"forStruggling": "Provide real food pictures instead of abstract drawings. Use gesture supports for vocabulary. Allow pointing instead of verbal responses. Pair with confident French speaker.", "forIEP": "Pre-teach food vocabulary with real examples if possible. Use picture communication cards. Allow alternative communication methods. Reduce presentation expectations to showing picture only.", "forELL": "Connect to holiday foods from home culture. Provide home language food names alongside French. Use cognates when possible. Encourage sharing family food traditions.", "forAdvanced": "Teach additional food vocabulary like \'épicé\' and \'sucré\'. Create a French holiday recipe book. Practice more complex sentences about food preparation. Help translate for classmates."}',
      indigenousPerspectives: 'Explore traditional Mi\'kmaq winter foods like bannock bread, dried berries, and fish, discussing how Indigenous communities prepared special foods for winter celebrations. Connect to the importance of sharing food in both Mi\'kmaq and French traditions, emphasizing how food brings people together and shows care for community members.'
    },
    {
      date: new Date('2025-12-11'),
      title: 'Gift Giving Traditions',
      titleFr: 'Les Traditions de Cadeaux',
      mindsOn: '**Minds On (8 minutes)**: Present a beautifully wrapped empty box and build excitement about "les cadeaux." Pass the box around for students to guess what\'s inside using French: "Je pense... c\'est..." Reveal that the gift is "une surprise!" Introduce "donner" and "recevoir" with gestures.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce gift-giving vocabulary: "les cadeaux," "donner," "recevoir," "merci beaucoup." Practice giving and receiving using classroom objects while saying appropriate phrases. **Guided Practice (12 min)**: Read a story about children giving and receiving gifts, focusing on the kindness of giving. Students identify who is giving and who is receiving in the pictures. **Independent Practice (8 min)**: Students create a "gift" (drawing or craft) for a classmate while practicing: "C\'est pour toi" and "Merci beaucoup."',
      consolidation: '**Consolidation (10 minutes)**: Students exchange their handmade gifts with a partner, practicing "C\'est pour toi" and "Merci beaucoup." Discuss how giving makes us feel happy using simple French: "Je suis content/contente." Close by singing "Merci, merci beaucoup."',
      materials: '["Wrapped empty gift box", "Vocabulary cards: les cadeaux, donner, recevoir, merci beaucoup, c\'est pour toi", "Story about gift-giving", "Art supplies for making simple gifts", "Small bags or tissue paper for gift wrapping"]',
      assessmentNotes: 'OBSERVABLE GIFT-GIVING ASSESSMENT - Circle proficiency level for each:\n1. Uses gift vocabulary correctly: ☐ No use ☐ With heavy support ☐ With some support ☐ Independent use\n2. Demonstrates giving and receiving gestures: ☐ No demonstration ☐ With modeling ☐ With reminders ☐ Natural demonstration\n3. Uses polite expressions "merci beaucoup": ☐ No use ☐ With prompting ☐ Sometimes ☐ Consistently\n4. Shows understanding of kindness in giving: ☐ Not demonstrated ☐ With discussion ☐ Shows some understanding ☐ Clear understanding demonstrated',
      modifications: '{"forStruggling": "Provide picture cards for vocabulary support. Use exaggerated gestures for giving/receiving. Allow simple \'merci\' instead of full phrase. Pair with supportive partner.", "forIEP": "Pre-teach concepts with role-play. Use visual schedules for gift exchange activity. Allow non-verbal expressions of gratitude. Provide sensory-friendly gift materials.", "forELL": "Connect to gift-giving traditions from home culture. Use home language to explain concepts initially. Provide visual supports for all vocabulary. Encourage sharing about family traditions.", "forAdvanced": "Teach additional expressions like \'de rien\' and \'avec plaisir\'. Create thank-you cards in French. Practice longer conversations about gifts. Help facilitate gift exchange for classmates."}',
      indigenousPerspectives: 'Discuss the Mi\'kmaq tradition of giving and sharing, including the concept of "giving circles" where community members share resources and support each other. Explore how both Mi\'kmaq and French cultures value generosity and how giving is more important than receiving, connecting to the traditional understanding that everything we have is a gift to be shared.'
    },
    {
      date: new Date('2025-12-12'),
      title: 'Holiday Music and Songs',
      titleFr: 'La Musique et les Chansons de Fête',
      mindsOn: '**Minds On (7 minutes)**: Play soft French holiday music as students enter. Display instruments (real or pictures) and introduce "la musique" and "les chansons." Students move gently to the music and practice saying "J\'aime la musique!" while exploring rhythm with simple instruments.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce music vocabulary: "chanter," "danser," "les instruments," using actions and real examples. Students practice each action while saying the French word. **Guided Practice (12 min)**: Learn a simple French holiday song with actions (like "Petit Papa Noël" simplified for Grade 1). Students follow along with gestures and simple French words. **Independent Practice (8 min)**: Students choose an instrument and practice keeping rhythm while singing. They take turns being the "chef d\'orchestre" (conductor) and leading the group.',
      consolidation: '**Consolidation (10 minutes)**: Perform the song learned today as a class "concert" with students taking turns with different instruments. End by saying "Bravo!" and clapping for each other\'s musical participation. Close with quiet humming of the song.',
      materials: '["French holiday music (age-appropriate)", "Simple instruments: bells, shakers, rhythm sticks", "Vocabulary cards: la musique, les chansons, chanter, danser, les instruments", "Props for conducting (wand or stick)", "Simple French holiday song sheet"]',
      assessmentNotes: 'OBSERVABLE MUSIC VOCABULARY ASSESSMENT - Circle proficiency level for each:\n1. Recognizes music vocabulary: ☐ No recognition ☐ With musical cues ☐ With some prompting ☐ Independent recognition\n2. Participates in singing French words: ☐ Silent observer ☐ Hums along ☐ Sings some words ☐ Sings confidently\n3. Keeps rhythm with instruments: ☐ Random playing ☐ Occasional rhythm ☐ Mostly on beat ☐ Consistently rhythmic\n4. Shows enthusiasm for French music: ☐ Reluctant participation ☐ Some engagement ☐ Active participation ☐ Enthusiastic leadership',
      modifications: '{"forStruggling": "Provide larger, easier-to-handle instruments. Use visual rhythm charts. Allow humming instead of singing words. Pair with confident singer.", "forIEP": "Choose sensory-appropriate instruments. Provide noise-reducing headphones if needed. Allow movement instead of singing. Use visual cues for participation.", "forELL": "Connect to music traditions from home culture. Provide lyrics with simple pictures. Use familiar melodies with French words. Encourage sharing family songs.", "forAdvanced": "Teach additional verses or more complex rhythms. Create simple choreography for songs. Help teach song to others. Explore different French musical styles."}',
      indigenousPerspectives: 'Share traditional Mi\'kmaq songs and drumming, discussing how music is used in Indigenous communities for celebration, storytelling, and bringing people together. Explore how both Mi\'kmaq and French cultures use music to pass down traditions and create community bonds, emphasizing the universal language of music that connects all cultures.'
    }
  ];

  console.log('Creating 5 lessons for December 8-12...');
  
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
          learningGoals: 'Students will expand holiday vocabulary, engage with French holiday traditions, and demonstrate understanding through speaking, listening, and creative expression.',
          learningGoalsFr: 'Les élèves enrichiront leur vocabulaire des fêtes, découvriront les traditions françaises des fêtes et démontreront leur compréhension par l\'expression orale, l\'écoute et la création artistique.',
          isSubFriendly: true,
          subNotes: 'All vocabulary cards, materials, and simple instructions provided. Lessons focus on oral interaction and visual supports.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
    } catch (error) {
      console.error('❌ Error creating lesson:', lessonData.title, error.message);
    }
  }
  
  console.log('\n🎄 Week 2 lessons created successfully!');
  console.log('Next: Create Week 3 lessons (Dec 15-18)');
  
  await prisma.$disconnect();
}

createDecemberWeek2Lessons().catch(console.error);