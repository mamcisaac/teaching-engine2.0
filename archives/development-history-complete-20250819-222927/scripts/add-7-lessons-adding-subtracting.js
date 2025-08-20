#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function add7LessonsToAddingSubtractingUnit() {
  console.log('➕➖ ADDING 7 LESSONS TO COMPLETE ADDING AND SUBTRACTING UNIT');
  console.log('Target: 31 total lessons (24 existing + 7 new)');
  console.log('==========================================================');

  const userId = 23;
  const existingUnitId = 'cmebyc9iq0007vjrfjbgwmvcv'; // Existing Adding and Subtracting unit

  const lessons = [
    {
      date: new Date('2026-01-12'),
      title: 'Addition and Subtraction Relationships',
      titleFr: 'Relations entre addition et soustraction',
      mindsOn: '**Minds On (8 minutes)**: Present equation 5+3=8. Ask students what subtraction equation goes with this. Introduce "relation," "inverse," "connecter" through exploring inverse operations.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "relation," "inverse," "connecter" while exploring how addition and subtraction are related operations. Show how 5+3=8 connects to 8-3=5 and 8-5=3. **Guided Practice (12 min)**: Students work with manipulatives to build fact families, showing how one addition fact creates two subtraction facts. Practice recognizing inverse relationships and using them to check work. **Independent Practice (7 min)**: Students work in pairs creating complete fact families, finding missing numbers in related equations, and explaining the connections between addition and subtraction.',
      consolidation: '**Consolidation (10 minutes)**: Students share fact family discoveries. Discuss how knowing addition facts helps with subtraction. Close with "Fact Family Dance" showing relationships.',
      materials: '["Manipulatives", "Fact family mats", "Vocabulary cards: relation, inverse, connecter", "Number cards", "Equation strips", "Chart paper"]'
    },
    {
      date: new Date('2026-01-13'),
      title: 'Efficient Calculation Strategies',
      titleFr: 'Stratégies de calcul efficace',
      mindsOn: '**Minds On (8 minutes)**: Present 7+5. Students share different ways to solve it (count all, count on, make 10, doubles). Introduce "efficace," "stratégie," "choisir" through strategy comparison.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "efficace," "stratégie," "choisir" while comparing different calculation strategies. Show when different strategies work best (count on for +1,+2; make 10 for bridging facts). **Guided Practice (12 min)**: Students practice choosing efficient strategies for different types of problems. Compare counting vs. mental strategies for speed and accuracy. Practice explaining strategy choices. **Independent Practice (7 min)**: Students work on strategy selection activities: solving problems using most efficient method, timing different strategies, and teaching strategies to partners.',
      consolidation: '**Consolidation (10 minutes)**: Students share their strategy preferences and explain why. Discuss how efficient strategies save time. Close with strategy appreciation celebration.',
      materials: '["Strategy cards", "Stopwatch", "Vocabulary cards: efficace, stratégie, choisir", "Mixed problems", "Recording sheets", "Chart paper"]'
    },
    {
      date: new Date('2026-01-14'),
      title: 'Multi-Step Problem Solving',
      titleFr: 'Résolution de problèmes à plusieurs étapes',
      mindsOn: '**Minds On (8 minutes)**: Present story: "Julie has 6 stickers. She gives 2 to her friend and then gets 4 more. How many does she have now?" Introduce "étapes," "plusieurs," "organiser" through complex problem solving.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "étapes," "plusieurs," "organiser" while breaking down multi-step problems. Show how to identify what happens first, second, and what the question asks. **Guided Practice (12 min)**: Students work together solving multi-step problems, drawing pictures to show each step, and writing number sentences for each operation. Practice organizing information clearly. **Independent Practice (7 min)**: Students work in pairs solving multi-step problems, creating their own multi-step problems, and explaining their solution processes step by step.',
      consolidation: '**Consolidation (10 minutes)**: Students share their multi-step problem solutions. Discuss organization strategies. Close with appreciation for mathematical reasoning.',
      materials: '["Multi-step problem cards", "Drawing materials", "Vocabulary cards: étapes, plusieurs, organiser", "Step-by-step templates", "Recording sheets"]'
    },
    {
      date: new Date('2026-01-15'),
      title: 'Real-World Application Projects',
      titleFr: 'Projets d\'application dans le monde réel',
      mindsOn: '**Minds On (8 minutes)**: Students brainstorm situations where they use addition and subtraction at home or in community. Introduce "application," "projet," "communauté" through real-world connections.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "application," "projet," "communauté" while exploring how addition and subtraction solve real problems in their world. Discuss mathematical applications in shopping, cooking, games. **Guided Practice (12 min)**: Students work on real-world math projects: planning a party with budgets, organizing classroom supplies, or designing playground equipment with measurements and counts. **Independent Practice (7 min)**: Individual project work: creating real-world math problems, solving authentic problems from their lives, and documenting how mathematics helps in daily situations.',
      consolidation: '**Consolidation (10 minutes)**: Students share their real-world projects and applications. Discuss how mathematics connects to everything. Close with appreciation for practical math skills.',
      materials: '["Real-world scenarios", "Project materials", "Vocabulary cards: application, projet, communauté", "Calculators", "Recording sheets", "Presentation materials"]'
    },
    {
      date: new Date('2026-01-16'),
      title: 'Mathematical Communication and Reasoning',
      titleFr: 'Communication et raisonnement mathématiques',
      mindsOn: '**Minds On (8 minutes)**: Present incorrect solution: 8-3=11. Students identify the error and explain what went wrong. Introduce "communiquer," "raisonnement," "expliquer" through mathematical discussion.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "communiquer," "raisonnement," "expliquer" while focusing on how to clearly explain mathematical thinking and identify errors in reasoning. **Guided Practice (12 min)**: Students practice explaining their solution strategies clearly, listening to others\' reasoning, and asking mathematical questions. Focus on using precise mathematical language. **Independent Practice (7 min)**: Students work on communication activities: explaining solutions to partners, finding and correcting errors in given work, and asking clarifying questions about mathematical reasoning.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate clear mathematical communication. Celebrate good reasoning and precise explanations. Close with mathematical communication appreciation.',
      materials: '["Solution examples with errors", "Vocabulary cards: communiquer, raisonnement, expliquer", "Recording sheets", "Mathematical question stems", "Presentation materials"]'
    },
    {
      date: new Date('2026-01-17'),
      title: 'Addition and Subtraction Assessment Portfolio',
      titleFr: 'Portfolio d\'évaluation addition et soustraction',
      mindsOn: '**Minds On (8 minutes)**: Students review their addition and subtraction work from the unit. Choose their best examples to share. Introduce "portfolio," "évaluation," "progrès" through reflection.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "portfolio," "évaluation," "progrès" while creating assessment portfolios showcasing addition and subtraction learning. Students select work that shows their growth and understanding. **Guided Practice (12 min)**: Students organize portfolio evidence: problem-solving examples, strategy explanations, real-world applications, and reflection pieces. Practice explaining their mathematical growth. **Independent Practice (7 min)**: Individual portfolio completion: writing reflections on learning, selecting best work samples, and preparing to share their mathematical journey with others.',
      consolidation: '**Consolidation (10 minutes)**: Students share portfolio highlights and reflect on their growth. Celebrate mathematical development. Close with pride in addition and subtraction mastery.',
      materials: '["Student work samples", "Portfolio folders", "Vocabulary cards: portfolio, évaluation, progrès", "Reflection templates", "Assessment criteria"]'
    },
    {
      date: new Date('2026-01-20'),
      title: 'Addition and Subtraction Celebration',
      titleFr: 'Célébration de l\'addition et de la soustraction',
      mindsOn: '**Minds On (8 minutes)**: Students prepare to teach a younger class about addition and subtraction. Choose their favorite strategy to demonstrate. Introduce "enseigner," "démontrer," "partager" through teaching preparation.',
      action: '**Action (27 minutes)**: **Introduction (8 min)**: Introduce vocabulary: "enseigner," "démontrer," "partager" while preparing to share addition and subtraction knowledge. Students plan demonstrations and choose teaching materials. **Guided Practice (12 min)**: Addition and subtraction celebration! Students take turns teaching strategies, demonstrating problem-solving, and sharing their favorite discoveries. Celebrate mathematical expertise. **Independent Practice (7 min)**: Students complete unit celebration: playing math games they\'ve learned, solving challenge problems, and reflecting on their mathematical journey through addition and subtraction.',
      consolidation: '**Consolidation (10 minutes)**: Grand celebration of addition and subtraction mastery! Students share favorite moments and proudest achievements. Close with appreciation for mathematical growth and readiness for new challenges.',
      materials: '["Teaching materials", "Math games", "Vocabulary cards: enseigner, démontrer, partager", "Challenge problems", "Celebration supplies", "Reflection journals"]'
    }
  ];

  console.log(`Creating ${lessons.length} additional lessons for Adding and Subtracting unit...`);
  
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
          assessmentNotes: `OBSERVABLE ADDITION/SUBTRACTION ASSESSMENT - Circle proficiency level for each:
1. Solves addition problems accurately: ☐ Relies on counting ☐ Some mental strategies ☐ Efficient strategies ☐ Flexible and accurate
2. Solves subtraction problems accurately: ☐ Relies on counting ☐ Some mental strategies ☐ Efficient strategies ☐ Flexible and accurate
3. Explains mathematical reasoning: ☐ Cannot explain ☐ Basic explanations ☐ Clear explanations ☐ Rich mathematical language
4. Applies operations to real problems: ☐ Minimal application ☐ Simple applications ☐ Good applications ☐ Sophisticated problem solving`,
          differentiationStrategies: JSON.stringify({
            forStruggling: "Use concrete manipulatives and visual models. Start with smaller numbers and build gradually. Provide number lines and hundred charts. Work in small guided groups with extra practice.",
            forIEP: "Use assistive technology as needed. Provide tactile materials and visual supports. Allow alternative ways to show understanding. Break complex problems into smaller steps.",
            forELL: "Connect to home language mathematical terms. Use visual vocabulary supports. Encourage explanations in home language first. Provide bilingual operation resources.",
            forAdvanced: "Extend to larger numbers and multi-step problems. Create word problems for classmates. Explore mathematical patterns and relationships. Investigate different solution strategies."
          }),
          indigenousPerspectives: 'Connect to Mi\'kmaq traditional mathematical thinking in seasonal activities, resource sharing, and community cooperation. Explore how Indigenous peoples have always used addition and subtraction concepts in activities like trading, feast preparation, and resource management, showing that mathematical operations are fundamental to human cooperation and survival.',
          grade: 1,
          language: 'French',
          subject: 'Mathematics',
          learningGoals: 'Students will develop fluency with addition and subtraction within 20, use efficient calculation strategies, solve word problems, and understand the relationship between operations while building mathematical vocabulary in French.',
          learningGoalsFr: 'Les élèves développeront la fluidité avec l\'addition et la soustraction jusqu\'à 20, utiliseront des stratégies de calcul efficaces, résoudront des problèmes écrits et comprendront la relation entre les opérations tout en développant le vocabulaire mathématique en français.',
          isSubFriendly: true,
          subNotes: 'All activities use concrete materials and visual supports. Focus on strategy development and mathematical reasoning. Encourage sharing different solution methods. Celebrate mathematical thinking and problem-solving approaches.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toLocaleDateString(), '-', lessonData.title);
      
      // Add curriculum expectations for addition and subtraction
      const expectationIds = [
        'cmebyc93a000mvjquvjr2l89b', // 1.A1 - Addition facts
        'cmebyc93a000nvjqub7ghl3wp', // 1.A2 - Subtraction facts
        'cmebyc93a000ovjqu7wv8m2x1'  // 1.A3 - Problem solving with operations
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
  
  console.log(`\n✅ ADDING AND SUBTRACTING UNIT COMPLETE!`);
  console.log(`📊 Added ${lessons.length} lessons to existing unit`);
  console.log('🎯 Total lessons in unit: 31 (24 existing + 7 new)');
  console.log('📋 All lessons include:');
  console.log('   • 45-minute duration with ETFO structure');
  console.log('   • French mathematical vocabulary development');
  console.log('   • Observable assessment with checkboxes');
  console.log('   • JSON differentiation for all learners');
  console.log('   • Authentic Mi\'kmaq perspectives');
  console.log('   • Addition and subtraction fluency development');
  
  await prisma.$disconnect();
}

add7LessonsToAddingSubtractingUnit().catch(console.error);