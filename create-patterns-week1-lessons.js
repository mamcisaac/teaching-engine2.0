#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createWeek1PatternsLessons() {
  console.log('🔄 CREATING WEEK 1 PATTERNS LESSONS: INTRODUCTION TO PATTERNS');
  console.log('Grade 1 Mathematics - Patterns and Sorting Unit');
  console.log('=============================================================');

  const unitPlanId = 'cmectx0p1000jvj4p5bgejhew'; // Patterns and Sorting unit
  const userId = 23;

  const lessons = [
    // Lesson 1: What is a Pattern?
    {
      date: new Date('2025-09-30'),
      title: 'Discovering Patterns Around Us',
      titleFr: 'Découvrir les régularités autour de nous',
      mindsOn: '**Minds On (8 minutes)**: Display natural items (leaves, shells, pinecones) and classroom items (blocks, crayons). Students look for "things that repeat." Introduce "régularité," "répéter," "motif" while students identify patterns in their clothing and classroom.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce pattern vocabulary: "régularité," "répéter," "motif" using body movements (clap-stomp-clap-stomp). Students copy and create their own movement patterns. **Guided Practice (12 min)**: Explore patterns using color cubes, creating simple AB patterns (red-blue-red-blue). Students work in pairs to copy and extend patterns. Use pattern strips to show patterns can be made with shapes, colors, or objects. **Independent Practice (8 min)**: Students hunt for patterns in the classroom, recording findings through drawings. Create their first pattern using two different materials.',
      consolidation: '**Consolidation (10 minutes)**: Students share discovered patterns using "Je vois une régularité..." Create class pattern museum display. Close with pattern song using actions and French vocabulary.',
      materials: '["Natural items (leaves, shells)", "Color cubes", "Vocabulary cards: régularité, répéter, motif", "Pattern strips", "Drawing materials", "Two-color counters", "Pattern recording sheets"]',
      assessmentNotes: 'OBSERVABLE PATTERN RECOGNITION - Circle proficiency level for each:\n1. Identifies patterns in environment: ☐ Cannot identify ☐ Identifies with help ☐ Identifies some ☐ Identifies many independently\n2. Copies simple patterns: ☐ Cannot copy ☐ Copies with errors ☐ Copies accurately ☐ Copies and explains\n3. Uses pattern vocabulary: ☐ No vocabulary use ☐ English only ☐ Some French terms ☐ Consistent French use\n4. Creates AB pattern: ☐ Cannot create ☐ Creates with help ☐ Creates simple pattern ☐ Creates complex patterns',
      modifications: '{"forStruggling": "Start with body patterns only. Use only two distinct items. Provide pattern starters. Work one-on-one with teacher.", "forIEP": "Use larger manipulatives. Allow movement patterns only. Provide visual pattern cards. Reduce number of patterns to identify.", "forELL": "Label patterns in home language too. Use culturally familiar patterns. Connect to patterns in home culture. Allow gesture communication.", "forAdvanced": "Create ABC patterns. Find patterns in numbers. Create pattern puzzles for others. Explore patterns in nature deeply."}',
      indigenousPerspectives: 'Explore Mi\'kmaq traditional patterns in beadwork, quillwork, and basketry, where repeating patterns tell stories and carry cultural meaning. Discuss how Indigenous artisans use mathematical patterns to create beautiful, functional items that preserve knowledge and traditions through geometric designs.',
      learningGoals: 'Students will identify, describe, and create simple repeating patterns using concrete materials, developing foundational understanding of regularity and repetition.',
      learningGoalsFr: 'Les élèves identifieront, décriront et créeront des régularités répétitives simples avec du matériel concret, développant une compréhension fondamentale de la régularité et de la répétition.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 2: AB Patterns
    {
      date: new Date('2025-10-01'),
      title: 'AB Pattern Masters',
      titleFr: 'Maîtres des régularités AB',
      mindsOn: '**Minds On (7 minutes)**: Play "Pattern Echo" where teacher creates sound pattern (clap-snap-clap-snap) and students repeat. Introduce "alterner," "deux éléments," "AB" while students create partner patterns.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Focus on vocabulary: "alterner," "deux éléments," "AB" while creating various AB patterns with different materials. Show that AB patterns always alternate between two elements. **Guided Practice (12 min)**: Work with pattern trains using two colors of linking cubes. Students build, extend, and describe AB patterns. Practice "reading" patterns aloud in French: "rouge-bleu-rouge-bleu." Transfer patterns between different materials (cubes to drawings to movements). **Independent Practice (8 min)**: Students create AB pattern bracelets using two colors of beads, design AB patterns with stamps, and build standing AB patterns with blocks.',
      consolidation: '**Consolidation (10 minutes)**: Pattern fashion show where students wear/display their AB patterns. Identify the "core" that repeats. Close by creating a human AB pattern line.',
      materials: '["Sound makers", "Linking cubes (2 colors)", "Vocabulary cards: alterner, deux éléments, AB", "Beads and string", "Stamps and ink", "Pattern blocks", "Pattern trains template"]',
      assessmentNotes: 'OBSERVABLE AB PATTERN MASTERY - Circle proficiency level for each:\n1. Creates accurate AB patterns: ☐ Cannot create ☐ Creates with errors ☐ Creates accurately ☐ Creates fluently\n2. Extends AB patterns correctly: ☐ Cannot extend ☐ Extends with help ☐ Extends accurately ☐ Extends and explains rule\n3. Identifies pattern core: ☐ No understanding ☐ Beginning understanding ☐ Identifies core ☐ Explains core concept\n4. Transfers patterns between materials: ☐ Cannot transfer ☐ Transfers with help ☐ Transfers accurately ☐ Transfers creatively',
      modifications: '{"forStruggling": "Use high contrast materials. Mark starting point clearly. Provide AB template cards. Focus on one material type.", "forIEP": "Use textured materials for tactile learning. Allow larger motor movements. Provide pattern frames. Work with peer support.", "forELL": "Use familiar cultural items for patterns. Label A and B in home language. Provide visual dictionary. Practice pattern language in context.", "forAdvanced": "Create AB patterns with attributes (big-small). Make AB patterns that look like ABC. Create story problems with AB patterns. Design AB pattern games."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq two-row wampum belts that use alternating purple and white beads to represent agreements and relationships. Discuss how AB patterns in Indigenous art often symbolize balance, partnership, and the relationship between two entities or concepts.',
      learningGoals: 'Students will master AB patterns by creating, extending, and identifying the repeating core using various materials and representations.',
      learningGoalsFr: 'Les élèves maîtriseront les régularités AB en créant, prolongeant et identifiant le motif de base avec divers matériaux et représentations.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 3: Patterns with Shapes
    {
      date: new Date('2025-10-02'),
      title: 'Shape Patterns',
      titleFr: 'Régularités de formes',
      mindsOn: '**Minds On (8 minutes)**: Display pattern blocks in a repeating sequence. Students close eyes while teacher changes one element. They identify what changed. Introduce "forme," "cercle," "carré" while exploring shape attributes.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce vocabulary: "forme," "cercle," "carré" while creating patterns using geometric shapes. Students learn shapes can make patterns independent of color. **Guided Practice (12 min)**: Create shape patterns using pattern blocks: triangle-square-triangle-square. Students work on pattern block puzzles that incorporate repeating patterns. Build 3D patterns using geometric solids. Practice describing patterns by shape names in French. **Independent Practice (8 min)**: Students design shape pattern artwork, create shape pattern necklaces with foam shapes, and build shape pattern towers.',
      consolidation: '**Consolidation (10 minutes)**: Gallery walk to view all shape patterns. Students identify which attribute is patterning (shape, not color). Close with shape pattern dance using body shapes.',
      materials: '["Pattern blocks", "Geometric shapes", "Vocabulary cards: forme, cercle, carré", "3D geometric solids", "Foam shapes", "String for necklaces", "Pattern artwork templates"]',
      assessmentNotes: 'OBSERVABLE SHAPE PATTERN SKILLS - Circle proficiency level for each:\n1. Creates patterns using shapes: ☐ Cannot create ☐ Creates with help ☐ Creates independently ☐ Creates complex patterns\n2. Names shapes in French: ☐ No French use ☐ Some French ☐ Mostly French ☐ Fluent French shape names\n3. Identifies patterning attribute: ☐ Cannot identify ☐ Confuses attributes ☐ Usually identifies ☐ Always identifies correctly\n4. Extends shape patterns: ☐ Cannot extend ☐ Extends with errors ☐ Extends accurately ☐ Extends and creates variations',
      modifications: '{"forStruggling": "Use only 2 distinct shapes. Provide shape templates. Use larger shapes. Focus on shape only, same color.", "forIEP": "Use tactile shape cards. Allow tracing shapes. Provide shape sorting trays. Use adaptive grip tools.", "forELL": "Label shapes in multiple languages. Use cultural geometric patterns. Connect to architecture from home country. Provide visual shape dictionary.", "forAdvanced": "Create patterns with 3+ shapes. Combine shape and size patterns. Create tessellating patterns. Design shape pattern puzzles."}',
      indigenousPerspectives: 'Explore geometric patterns in Mi\'kmaq traditional art, particularly the eight-pointed star that appears in quillwork and beadwork. Discuss how Indigenous peoples identified and used geometric patterns in nature for navigation, construction, and artistic expression.',
      learningGoals: 'Students will create and extend patterns using geometric shapes, focusing on shape attributes rather than color as the patterning element.',
      learningGoalsFr: 'Les élèves créeront et prolongeront des régularités utilisant des formes géométriques, se concentrant sur les attributs de forme comme élément de régularité.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 4: Patterns with Actions and Sounds
    {
      date: new Date('2025-10-03'),
      title: 'Movement and Sound Patterns',
      titleFr: 'Régularités de mouvements et de sons',
      mindsOn: '**Minds On (7 minutes)**: Teacher performs pattern of actions (jump-clap-jump-clap). Students join in and continue pattern. Introduce "mouvement," "son," "rythme" through rhythmic activities.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Explore vocabulary: "mouvement," "son," "rythme" while creating patterns with body movements and classroom instruments. Students discover patterns don\'t need objects—they can be actions or sounds. **Guided Practice (12 min)**: Create movement patterns in small groups (hop-twist-hop-twist). Use instruments to create sound patterns (drum-shake-drum-shake). Combine movement and sound patterns. Record patterns using symbols or drawings. Practice pattern performances for others. **Independent Practice (8 min)**: Students create their own movement pattern routine, design a sound pattern using found objects, and teach their pattern to a partner.',
      consolidation: '**Consolidation (10 minutes)**: Pattern performance showcase where groups demonstrate their patterns. Audience identifies the repeating core. Close with whole-class rhythm pattern celebration.',
      materials: '["Simple instruments", "Vocabulary cards: mouvement, son, rythme", "Recording sheets", "Symbol cards", "Found sound objects", "Movement space markers", "Pattern performance rubric"]',
      assessmentNotes: 'OBSERVABLE ACTION PATTERN ASSESSMENT - Circle proficiency level for each:\n1. Creates movement patterns: ☐ Cannot create ☐ Creates with help ☐ Creates simple patterns ☐ Creates complex sequences\n2. Maintains pattern rhythm: ☐ No rhythm ☐ Inconsistent rhythm ☐ Mostly consistent ☐ Perfect rhythm throughout\n3. Records patterns symbolically: ☐ Cannot record ☐ Records with help ☐ Records clearly ☐ Records creatively\n4. Teaches pattern to others: ☐ Cannot teach ☐ Teaches with difficulty ☐ Teaches clearly ☐ Excellent pattern instructor',
      modifications: '{"forStruggling": "Use simple two-part movements. Provide visual movement cards. Allow seated movements only. Partner with strong student.", "forIEP": "Adapt movements for physical needs. Use visual schedules for patterns. Allow alternative instruments. Provide movement supports.", "forELL": "Use movements from cultural dances. Connect to music from home. Allow non-verbal pattern sharing. Use universal movement symbols.", "forAdvanced": "Create three-part movement patterns. Combine multiple pattern types. Choreograph pattern dances. Create pattern compositions."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq traditional drumming and dance patterns that tell stories and mark ceremonies. Discuss how rhythm patterns in Indigenous music and dance carry cultural teachings, with specific patterns for different occasions and meanings.',
      learningGoals: 'Students will create, perform, and record patterns using movements and sounds, understanding that patterns exist beyond visual materials.',
      learningGoalsFr: 'Les élèves créeront, présenteront et enregistreront des régularités utilisant mouvements et sons, comprenant que les régularités existent au-delà du matériel visuel.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    }
  ];

  console.log(`Creating ${lessons.length} Week 1 Patterns lessons...`);
  
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
          subNotes: 'Focus on hands-on pattern exploration. Use concrete materials throughout. Encourage pattern talk in French. Celebrate pattern discoveries.'
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
  
  console.log(`\n✅ Created ${lessons.length} Week 1 Patterns lessons!`);
  console.log('📊 WEEK 1 COMPLETE: Pattern foundations established');
  console.log('🎯 All lessons include:');
  console.log('   • Pattern recognition and creation');
  console.log('   • Multiple representations (objects, shapes, movements)');
  console.log('   • French mathematical vocabulary');
  console.log('   • Observable assessment criteria');
  console.log('   • Authentic Indigenous connections');
  console.log('📚 Ready for Week 2: Repeating Patterns');
  
  await prisma.$disconnect();
}

createWeek1PatternsLessons().catch(console.error);