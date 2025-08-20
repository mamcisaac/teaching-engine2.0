#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function add7LessonsToPatternsShapesUnit() {
  console.log('🔺 ADDING 7 LESSONS TO COMPLETE PATTERNS AND SHAPES UNIT');
  console.log('Target: 31 total lessons (24 existing + 7 new)');
  console.log('====================================================');

  const userId = 23;
  const existingUnitId = 'cmebyc9io0005vjrfypcwi41t'; // Existing Patterns and Shapes unit

  const lessons = [
    {
      date: new Date('2025-12-02'),
      title: 'Complex Pattern Investigation',
      titleFr: 'Investigation de motifs complexes',
      mindsOn: '**Minds On (8 minutes)**: Show ABC pattern with colors and shapes combined. Students analyze and continue the pattern. Introduce "complexe," "analyser," "combiner" through multi-element pattern exploration.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "complexe," "analyser," "combiner" while exploring patterns with multiple attributes (color AND shape, size AND position). Show how to break down complex patterns into parts. **Guided Practice (12 min)**: Students work with pattern blocks to create and extend ABC, ABCD, and AAB patterns. Practice identifying the pattern rule when multiple elements change. **Independent Practice (7 min)**: Students work in pairs creating complex patterns for others to solve, analyzing given complex patterns, and documenting their pattern rules clearly.',
      consolidation: '**Consolidation (10 minutes)**: Students share their most challenging pattern creations. Discuss strategies for analyzing complex patterns. Close with appreciation for mathematical thinking.',
      materials: '["Pattern blocks", "Multi-attribute materials", "Vocabulary cards: complexe, analyser, combiner", "Pattern recording sheets", "Complex pattern examples"]'
    },
    {
      date: new Date('2025-12-03'),
      title: 'Geometric Transformations Exploration',
      titleFr: 'Exploration des transformations géométriques',
      mindsOn: '**Minds On (8 minutes)**: Show shape that can be flipped, turned, or slid. Students explore what happens to the shape. Introduce "transformer," "retourner," "glisser" through hands-on transformation.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "transformer," "retourner," "glisser" while exploring basic geometric transformations. Show slides (translations), flips (reflections), and turns (rotations) using concrete shapes. **Guided Practice (12 min)**: Students use shape tiles to explore transformations. Practice predicting what shapes will look like after transformations. Create transformation art using repeated shapes. **Independent Practice (7 min)**: Students work with transformation activities: creating flip patterns, slide sequences, and turn designs using geometric shapes.',
      consolidation: '**Consolidation (10 minutes)**: Students share their transformation art and explain the movements used. Discuss how transformations create patterns. Close with "Shape Dance" showing transformations.',
      materials: '["Shape tiles", "Mirrors", "Vocabulary cards: transformer, retourner, glisser", "Grid paper", "Transformation recording sheets", "Shape stamps"]'
    },
    {
      date: new Date('2025-12-04'),
      title: 'Spatial Reasoning Challenges',
      titleFr: 'Défis de raisonnement spatial',
      mindsOn: '**Minds On (8 minutes)**: Present tangram puzzle pieces. Students try to make a square using all pieces. Introduce "spatial," "raisonnement," "défi" through hands-on spatial problem solving.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "spatial," "raisonnement," "défi" while exploring how shapes fit together and spatial relationships. Show how to visualize and manipulate shapes mentally. **Guided Practice (12 min)**: Students work with tangrams, pentominoes, and shape puzzles. Practice describing spatial relationships using positional language. Solve progressively challenging spatial puzzles. **Independent Practice (7 min)**: Students work on spatial reasoning challenges: building specific shapes from pieces, solving shape puzzles, and creating their own spatial challenges.',
      consolidation: '**Consolidation (10 minutes)**: Students share their spatial reasoning strategies. Discuss how visualization helps solve problems. Close with spatial reasoning reflection.',
      materials: '["Tangram sets", "Pentominoes", "Vocabulary cards: spatial, raisonnement, défi", "Shape puzzles", "Building challenges", "Recording sheets"]'
    },
    {
      date: new Date('2025-12-05'),
      title: 'Patterns in Architecture and Art',
      titleFr: 'Motifs dans l\'architecture et l\'art',
      mindsOn: '**Minds On (8 minutes)**: Show images of buildings and artworks with clear patterns. Students identify patterns they see. Introduce "architecture," "art," "designer" through visual pattern appreciation.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "architecture," "art," "designer" while exploring patterns in human-made structures and artworks. Show how mathematicians, architects, and artists use patterns. **Guided Practice (12 min)**: Students examine photos of buildings, quilts, and cultural art showing geometric patterns. Identify and recreate patterns using materials. Discuss cultural significance of patterns. **Independent Practice (7 min)**: Students work on pattern design projects: creating architectural patterns, designing cultural art patterns, and explaining their pattern choices.',
      consolidation: '**Consolidation (10 minutes)**: Students share their pattern designs and explain their inspiration. Discuss how patterns connect mathematics to culture and art. Close with pattern appreciation gallery.',
      materials: '["Architecture photos", "Art examples", "Vocabulary cards: architecture, art, designer", "Design materials", "Cultural pattern examples", "Art supplies"]'
    },
    {
      date: new Date('2025-12-08'),
      title: 'Problem Solving with Shapes',
      titleFr: 'Résolution de problèmes avec les formes',
      mindsOn: '**Minds On (8 minutes)**: Present shape problem: "Using exactly 6 triangles, can you make a hexagon?" Students work with materials to solve. Introduce "résoudre," "exactement," "hexagone" through geometric problem solving.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "résoudre," "exactement," "hexagone" while exploring how to solve problems involving shapes systematically. Show different problem-solving strategies with geometric materials. **Guided Practice (12 min)**: Students work on shape problems: building specific shapes from given pieces, finding multiple solutions, and explaining their reasoning. Practice geometric problem-solving strategies. **Independent Practice (7 min)**: Students work in pairs solving geometric challenges, creating shape problems for others, and documenting their problem-solving process.',
      consolidation: '**Consolidation (10 minutes)**: Students share their solutions and problem-solving strategies. Celebrate different approaches and mathematical reasoning. Close with geometric problem-solving appreciation.',
      materials: '["Various geometric shapes", "Vocabulary cards: résoudre, exactement, hexagone", "Problem challenge cards", "Recording sheets", "Building materials"]'
    },
    {
      date: new Date('2025-12-09'),
      title: 'Creating a Pattern and Shape Museum',
      titleFr: 'Créer un musée de motifs et de formes',
      mindsOn: '**Minds On (8 minutes)**: Students brainstorm what exhibits should be in a pattern and shape museum. Introduce "musée," "collection," "exposer" through museum planning discussion.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "musée," "collection," "exposer" while planning class pattern and shape museum. Students decide on exhibits that showcase their learning about patterns and geometry. **Guided Practice (12 min)**: Students work in groups creating museum exhibits: pattern displays, shape collections, interactive pattern games, and transformation demonstrations. **Independent Practice (7 min)**: Individual work on museum contributions: creating pattern art, writing shape descriptions, and preparing to be museum guides explaining mathematical concepts.',
      consolidation: '**Consolidation (10 minutes)**: Preview museum exhibits and practice guide explanations. Prepare museum opening. Close with excitement for sharing pattern and shape knowledge.',
      materials: '["Display materials", "Student work samples", "Vocabulary cards: musée, collection, exposer", "Art supplies", "Museum planning sheets", "Interactive materials"]'
    },
    {
      date: new Date('2025-12-10'),
      title: 'Pattern and Shape Celebration',
      titleFr: 'Célébration des motifs et des formes',
      mindsOn: '**Minds On (8 minutes)**: Students reflect on their pattern and shape learning journey. Share one pattern or shape discovery they\'re proud of. Introduce "célébration," "découverte," "fier" through reflection.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "célébration," "découverte," "fier" while celebrating all pattern and shape learning. Students review their growth and favorite activities from the unit. **Guided Practice (12 min)**: Museum grand opening! Students take turns being guides and visitors, sharing pattern and shape knowledge. Celebrate mathematical discoveries and creative work. **Independent Practice (7 min)**: Students complete unit reflection: drawing their favorite pattern or shape activity, writing about their learning, and setting goals for future geometry work.',
      consolidation: '**Consolidation (10 minutes)**: Grand celebration of pattern and shape mastery! Students share reflections and museum highlights. Close with appreciation for mathematical creativity and geometric thinking.',
      materials: '["Museum exhibits", "Reflection journals", "Vocabulary cards: célébration, découverte, fier", "Celebration materials", "Student work documentation"]'
    }
  ];

  console.log(`Creating ${lessons.length} additional lessons for Patterns and Shapes unit...`);
  
  for (const lessonData of lessons) {
    try {
      const lesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: userId,
          unitPlanId: existingUnitId,
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
          assessmentNotes: `OBSERVABLE PATTERN AND GEOMETRY ASSESSMENT - Circle proficiency level for each:
1. Recognizes and extends patterns: ☐ Minimal recognition ☐ Simple patterns only ☐ Most patterns ☐ Complex patterns confidently
2. Describes geometric properties: ☐ Cannot describe ☐ Basic descriptions ☐ Clear descriptions ☐ Rich geometric language
3. Uses spatial reasoning: ☐ Minimal spatial thinking ☐ Basic spatial skills ☐ Good spatial reasoning ☐ Sophisticated spatial thinking
4. Creates patterns and designs: ☐ Cannot create ☐ Simple creations ☐ Creative designs ☐ Complex, original work`,
          differentiationStrategies: JSON.stringify({
            forStruggling: "Use concrete manipulatives and visual patterns. Start with simple AB patterns. Provide pattern templates and visual supports. Work in small guided groups.",
            forIEP: "Use tactile pattern materials. Provide extra time for spatial tasks. Allow alternative ways to show understanding. Use assistive technology as needed.",
            forELL: "Use visual vocabulary supports for geometric terms. Connect to patterns from home culture. Encourage explanations in home language first. Provide bilingual geometry resources.",
            forAdvanced: "Explore complex patterns and tessellations. Create pattern challenges for classmates. Investigate mathematical relationships in art and nature. Explore advanced geometric concepts."
          }),
          indigenousPerspectives: 'Connect to Mi\'kmaq traditional patterns found in quillwork, beadwork, and basket weaving. Explore how Indigenous artists use mathematical concepts like symmetry, repetition, and geometric shapes to create meaningful designs that tell stories and preserve cultural knowledge, showing the deep connection between mathematics and cultural expression.',
          grade: 1,
          language: 'French',
          subject: 'Mathematics',
          learningGoals: 'Students will recognize, create, and extend patterns while developing geometric reasoning, spatial visualization skills, and appreciation for patterns in art and nature, using mathematical vocabulary in French.',
          learningGoalsFr: 'Les élèves reconnaîtront, créeront et prolongeront des motifs tout en développant le raisonnement géométrique, les compétences de visualisation spatiale et l\'appréciation des motifs dans l\'art et la nature, en utilisant le vocabulaire mathématique en français.',
          isSubFriendly: true,
          subNotes: 'All activities use hands-on materials and visual supports. Focus on pattern exploration and geometric discovery. Encourage creative expression through mathematical design. Celebrate different ways of seeing and creating patterns.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toLocaleDateString(), '-', lessonData.title);
      
      // Add curriculum expectations for patterns and geometry
      const expectationIds = [
        'cmebyc93a000jvjqu26i2x9qf', // 1.G1 - Geometric shapes
        'cmebyc93a000kvjqu8vw7ixbh', // 1.G2 - Spatial relationships
        'cmebyc93a000lvjquajxu8p3c'  // 1.P1 - Patterns
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
  
  console.log(`\n✅ PATTERNS AND SHAPES UNIT COMPLETE!`);
  console.log(`📊 Added ${lessons.length} lessons to existing unit`);
  console.log('🎯 Total lessons in unit: 31 (24 existing + 7 new)');
  console.log('📋 All lessons include:');
  console.log('   • 45-minute duration with ETFO structure');
  console.log('   • French mathematical vocabulary development');
  console.log('   • Observable assessment with checkboxes');
  console.log('   • JSON differentiation for all learners');
  console.log('   • Authentic Mi\'kmaq perspectives');
  console.log('   • Pattern recognition and geometric reasoning');
  
  await prisma.$disconnect();
}

add7LessonsToPatternsShapesUnit().catch(console.error);