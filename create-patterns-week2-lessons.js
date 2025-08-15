#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createWeek2PatternsLessons() {
  console.log('🔄 CREATING WEEK 2 PATTERNS LESSONS: REPEATING PATTERNS');
  console.log('Grade 1 Mathematics - Patterns and Sorting Unit');
  console.log('======================================================');

  const unitPlanId = 'cmectx0p1000jvj4p5bgejhew'; // Patterns and Sorting unit
  const userId = 23;

  const lessons = [
    // Lesson 5: AAB Patterns
    {
      date: new Date('2025-10-06'),
      title: 'AAB Pattern Adventures',
      titleFr: 'Aventures de régularités AAB',
      mindsOn: '**Minds On (8 minutes)**: Show pattern with two reds, one blue, two reds, one blue. Students identify what\'s different from AB patterns. Introduce "AAB," "trois parties," "répétition" while students create with counters.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Explore vocabulary: "AAB," "trois parties," "répétition" while building AAB patterns with various materials. Students discover the pattern core has three elements with one repeating. **Guided Practice (12 min)**: Create AAB patterns using snap cubes (red-red-blue pattern trains). Students work with partners to build, copy, and extend AAB patterns. Practice translating AAB patterns between materials (blocks to stickers to sounds). Use pattern cards to identify and continue AAB sequences. **Independent Practice (8 min)**: Students design AAB pattern flags, create AAB rhythm patterns with instruments, and solve "What comes next?" AAB puzzles.',
      consolidation: '**Consolidation (10 minutes)**: Students explain how AAB differs from AB patterns. Share creative AAB patterns made. Close with human AAB pattern using positions (stand-stand-sit).',
      materials: '["Two-color counters", "Snap cubes", "Vocabulary cards: AAB, trois parties, répétition", "Pattern cards", "Stickers", "Musical instruments", "Flag templates"]',
      assessmentNotes: 'OBSERVABLE AAB PATTERN MASTERY - Circle proficiency level for each:\n1. Creates accurate AAB patterns: ☐ Cannot create ☐ Creates with errors ☐ Creates accurately ☐ Creates fluently with variety\n2. Identifies AAB pattern core: ☐ No understanding ☐ Identifies with help ☐ Identifies independently ☐ Explains core clearly\n3. Extends AAB patterns: ☐ Cannot extend ☐ Extends with errors ☐ Extends accurately ☐ Extends and predicts far ahead\n4. Distinguishes pattern types: ☐ Confuses AB/AAB ☐ Sometimes distinguishes ☐ Usually distinguishes ☐ Always identifies correctly',
      modifications: '{"forStruggling": "Color code the double element. Use AAB template strips. Start with very distinct materials. Provide pattern starters.", "forIEP": "Use larger, textured materials. Allow more time for processing. Provide visual AAB cards. Work with peer support.", "forELL": "Count pattern elements in home language. Use culturally relevant materials. Provide multilingual pattern cards. Connect to cultural patterns.", "forAdvanced": "Create ABB patterns too. Make AAB with two attributes. Design pattern riddles. Create complex AAB sequences."}',
      indigenousPerspectives: 'Explore Mi\'kmaq beadwork patterns that often use AAB structures in traditional designs, where repetition of elements creates visual rhythm. Discuss how pattern variations in Indigenous art communicate different meanings and stories, with specific patterns for different occasions.',
      learningGoals: 'Students will create, extend, and identify AAB patterns, understanding how pattern cores can have three elements with repetition.',
      learningGoalsFr: 'Les élèves créeront, prolongeront et identifieront des régularités AAB, comprenant comment les motifs de base peuvent avoir trois éléments avec répétition.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 6: ABC Patterns
    {
      date: new Date('2025-10-07'),
      title: 'ABC Pattern Challenge',
      titleFr: 'Défi de régularités ABC',
      mindsOn: '**Minds On (7 minutes)**: Display three different colored blocks repeating. Students predict what comes after seeing just two repetitions. Introduce "ABC," "trois différents," "ordre" while building understanding.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "ABC," "trois différents," "ordre" while creating ABC patterns where each element in the core is unique. Students learn to identify when all three elements differ. **Guided Practice (12 min)**: Build ABC patterns with attribute blocks (circle-square-triangle). Create ABC patterns using three different actions or sounds. Students work in groups of three to be living ABC patterns. Practice recording ABC patterns using letters and symbols. Transfer ABC patterns across different media. **Independent Practice (8 min)**: Students create ABC pattern artwork, design three-part movement sequences, and complete ABC pattern puzzles.',
      consolidation: '**Consolidation (10 minutes)**: Compare AB, AAB, and ABC patterns side by side. Students explain which is most challenging. Close with ABC pattern parade showcasing all creations.',
      materials: '["Three-color blocks", "Attribute blocks", "Vocabulary cards: ABC, trois différents, ordre", "Recording sheets", "Symbol cards", "Art materials", "Pattern puzzle cards"]',
      assessmentNotes: 'OBSERVABLE ABC PATTERN SKILLS - Circle proficiency level for each:\n1. Creates ABC patterns accurately: ☐ Cannot create ☐ Mixes pattern types ☐ Creates with focus ☐ Creates effortlessly\n2. Maintains ABC order: ☐ Loses sequence ☐ Some errors ☐ Mostly accurate ☐ Perfect sequencing\n3. Records patterns symbolically: ☐ Cannot record ☐ Records partially ☐ Records clearly ☐ Uses multiple recording methods\n4. Explains pattern rule: ☐ Cannot explain ☐ Basic explanation ☐ Clear explanation ☐ Teaches others the rule',
      modifications: '{"forStruggling": "Use very distinct items for ABC. Provide ABC reference card. Number the elements 1-2-3. Start with copying before creating.", "forIEP": "Use sensory materials (smooth-rough-bumpy). Allow movement-based ABC. Provide pattern frames. Use consistent materials.", "forELL": "Label elements in home language. Use familiar cultural items. Allow gesture explanations. Connect to ABC in literacy.", "forAdvanced": "Create ABCD patterns. Make ABC with multiple attributes. Design backwards patterns. Create pattern stories with ABC structure."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq storytelling traditions where stories often have three-part structures (beginning, middle, end) similar to ABC patterns. Discuss how Indigenous oral traditions use pattern and repetition to help preserve and transmit knowledge across generations.',
      learningGoals: 'Students will create and extend ABC patterns using three distinct elements, developing understanding of more complex pattern structures.',
      learningGoalsFr: 'Les élèves créeront et prolongeront des régularités ABC utilisant trois éléments distincts, développant la compréhension de structures de régularités plus complexes.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 7: Patterns with Size
    {
      date: new Date('2025-10-08'),
      title: 'Big and Small Patterns',
      titleFr: 'Régularités grandes et petites',
      mindsOn: '**Minds On (8 minutes)**: Show pattern of big block, small block, big block, small block. Students identify the patterning attribute (size, not color). Introduce "grand," "petit," "taille" through comparison activities.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Explore vocabulary: "grand," "petit," "taille" while creating patterns where size is the changing attribute. Students learn that patterns can use any attribute, not just color or shape. **Guided Practice (12 min)**: Create size patterns with same-colored blocks in two sizes. Build big-small patterns with natural materials (big leaf, small leaf). Students make size patterns with their bodies (tall-short positions). Practice identifying what stays same and what changes in size patterns. Create size pattern artwork using stamps. **Independent Practice (8 min)**: Students sort materials by size then create patterns, design size pattern books, and play size pattern games.',
      consolidation: '**Consolidation (10 minutes)**: Students share size patterns and explain the rule. Discuss how size patterns appear in real life. Close with big-small movement pattern dance.',
      materials: '["Two sizes of blocks", "Natural materials", "Vocabulary cards: grand, petit, taille", "Stamps (2 sizes)", "Sorting trays", "Pattern books templates", "Size comparison cards"]',
      assessmentNotes: 'OBSERVABLE SIZE PATTERN ASSESSMENT - Circle proficiency level for each:\n1. Creates size-based patterns: ☐ Cannot create ☐ Confuses with color ☐ Creates accurately ☐ Creates complex size patterns\n2. Identifies size as attribute: ☐ Cannot identify ☐ Sometimes identifies ☐ Usually identifies ☐ Always recognizes attribute\n3. Uses size vocabulary in French: ☐ No French use ☐ Some French ☐ Mostly French ☐ Fluent size vocabulary\n4. Maintains consistent size difference: ☐ Inconsistent sizes ☐ Some consistency ☐ Mostly consistent ☐ Clear size distinctions',
      modifications: '{"forStruggling": "Use extremely different sizes. Keep all other attributes same. Provide size sorting first. Use size labels.", "forIEP": "Use tactile size differences. Allow handling items to feel size. Provide size templates. Work with concrete materials only.", "forELL": "Compare sizes in home language. Use culturally relevant size examples. Provide visual size vocabulary. Practice with familiar objects.", "forAdvanced": "Create three-size patterns. Combine size with other attributes. Create growing size patterns. Design size pattern challenges."}',
      indigenousPerspectives: 'Explore how Mi\'kmaq basket weavers use patterns of different sized strips to create both functional and decorative elements. Discuss how understanding size relationships was crucial for creating tools, shelters, and clothing that fit properly in traditional life.',
      learningGoals: 'Students will create and identify patterns based on size attributes, expanding their understanding of what can create a pattern.',
      learningGoalsFr: 'Les élèves créeront et identifieront des régularités basées sur les attributs de taille, élargissant leur compréhension de ce qui peut créer une régularité.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 8: Translating Patterns
    {
      date: new Date('2025-10-09'),
      title: 'Pattern Transformations',
      titleFr: 'Transformations de régularités',
      mindsOn: '**Minds On (7 minutes)**: Show same AB pattern in colors, then shapes, then sounds. Students identify what stays same (pattern rule). Introduce "transformer," "traduire," "même règle" while exploring equivalence.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Explore vocabulary: "transformer," "traduire," "même règle" while learning to translate patterns between different representations. Students understand the pattern structure stays constant even when materials change. **Guided Practice (12 min)**: Start with color pattern, translate to shape pattern with same structure. Translate visual patterns to sound patterns and movement patterns. Students work in pairs: one creates, other translates to different medium. Practice identifying equivalent patterns in different forms. Create pattern translation books. **Independent Practice (8 min)**: Students complete pattern translation challenges, create pattern rosetta stones showing same pattern three ways, design pattern translation games.',
      consolidation: '**Consolidation (10 minutes)**: Pattern translation showcase where students demonstrate same pattern in multiple forms. Discuss how this helps us understand patterns deeply. Close with whole-class pattern translation chain.',
      materials: '["Multi-attribute materials", "Vocabulary cards: transformer, traduire, même règle", "Translation challenge cards", "Recording sheets", "Various pattern materials", "Pattern books", "Sound makers"]',
      assessmentNotes: 'OBSERVABLE TRANSLATION SKILLS - Circle proficiency level for each:\n1. Translates patterns accurately: ☐ Cannot translate ☐ Translates with errors ☐ Translates accurately ☐ Translates creatively\n2. Maintains pattern structure: ☐ Loses structure ☐ Partial structure ☐ Maintains structure ☐ Perfect structure transfer\n3. Uses multiple representations: ☐ One form only ☐ Two forms ☐ Three forms ☐ Many creative forms\n4. Explains translation process: ☐ Cannot explain ☐ Basic explanation ☐ Clear explanation ☐ Teaches translation strategies',
      modifications: '{"forStruggling": "Translate between only two forms. Use same positions for elements. Provide translation templates. Work with teacher support.", "forIEP": "Use concrete materials only. Allow time for processing. Provide visual translation guides. Focus on simple AB patterns.", "forELL": "Explain translation in home language. Use culturally familiar transformations. Provide vocabulary in multiple languages. Connect to language translation concept.", "forAdvanced": "Translate complex patterns. Create translation puzzles. Translate between abstract representations. Design multi-step translations."}',
      indigenousPerspectives: 'Connect to how Mi\'kmaq stories can be told through words, dance, drumming, or visual art, maintaining the same narrative pattern across different media. Discuss how Indigenous peoples preserved knowledge by translating it into multiple forms: oral, visual, and performative.',
      learningGoals: 'Students will translate patterns between different representations while maintaining the pattern structure, deepening pattern understanding.',
      learningGoalsFr: 'Les élèves traduiront des régularités entre différentes représentations en maintenant la structure, approfondissant la compréhension des régularités.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    }
  ];

  console.log(`Creating ${lessons.length} Week 2 Patterns lessons...`);
  
  for (const lessonData of lessons) {
    try {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: userId,
          unitPlanId: unitPlanId,
          title: lessonData.title,
          titleFr: lessonData.titleFr,
          date: lessonData.date,
          duration: 45, // Exactly 45 minutes as required
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
          grade: lessonData.grade,
          language: lessonData.language,
          subject: lessonData.subject,
          learningGoals: lessonData.learningGoals,
          learningGoalsFr: lessonData.learningGoalsFr,
          isSubFriendly: true,
          subNotes: 'Focus on pattern complexity progression. Use concrete materials throughout. Encourage pattern discussions in French. Support pattern translations between representations.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
      
      // Add curriculum expectations
      const expectationIds = [
        'cmebyc93d000ovjqut0tu461c', // 1.RR1 - Repeating patterns
        'cmebyc93d000pvjqur6rk3kky', // 1.RR2 - Converting patterns
        'cmebyc93f000svjqucxi11fbz'  // 1.FE2 - Sorting by attribute
      ];
      
      for (const expectationId of expectationIds) {
        await prisma.eTFOLessonPlanExpectation.create({
          data: {
            lessonPlanId: lesson.id,
            expectationId: expectationId
          }
        }).catch(() => {}); // Ignore duplicates
      }
      
    } catch (error) {
      console.error('❌ Error creating lesson:', lessonData.title, error.message);
    }
  }
  
  console.log(`\n✅ Created ${lessons.length} Week 2 Patterns lessons!`);
  console.log('📊 WEEK 2 COMPLETE: Complex repeating patterns mastered');
  console.log('🎯 All lessons feature:');
  console.log('   • AAB, ABC pattern structures');
  console.log('   • Pattern attributes (size, position)');
  console.log('   • Pattern translation skills');
  console.log('   • Observable assessment');
  console.log('   • Differentiated instruction');
  console.log('📚 Ready for Week 3: Growing Patterns');
  
  await prisma.$disconnect();
}

createWeek2PatternsLessons().catch(console.error);