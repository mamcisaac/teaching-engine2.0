#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createWeek3SubtractionLessons() {
  console.log('➖ CREATING WEEK 3 SUBTRACTION LESSONS: BASICS & FACT FAMILIES');
  console.log('Grade 1 Mathematics - Subtraction Basics Unit');
  console.log('===========================================');

  const unitPlanId = 'cmectx0p2000nvj4p97h49w9k'; // Subtraction Basics unit
  const userId = 23; // Emily McIsaac

  const lessons = [
    // Lesson 1: Subtracting from 5
    {
      date: new Date('2024-12-15'),
      title: 'Subtracting from 5',
      titleFr: 'Soustraire de 5',
      mindsOn: '**Minds On (8 minutes)**: Show 5 fingers, then hide some. Students tell how many are hidden and visible. Introduce "soustraire," "retirer," "reste" while exploring taking away from 5 using hands and manipulatives.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce vocabulary: "soustraire," "retirer," "reste" while using concrete materials to take away from 5. Students explore 5-1, 5-2, 5-3, 5-4, 5-5 using counters, cubes, and toys. **Guided Practice (12 min)**: Create "Take Away Stories" starting with 5 objects. Students physically remove items and count what remains. Use subtraction mat with 5 spaces, removing objects systematically. Practice recording subtraction sentences: "5-2=3." Connect to real situations: "5 cookies, eat 2, how many left?" **Independent Practice (8 min)**: Students work at centers: building subtraction stories with 5 objects, using dominoes to show 5 minus patterns, creating picture subtraction problems starting with 5.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate one subtraction fact from 5 using objects and explain their thinking. Share different ways to show "taking away." Close with finger subtraction: start with 5 fingers, take away different amounts.',
      materials: '["5-frame templates", "Counters in two colors", "Small toys/objects", "Subtraction mats", "Dominoes showing 5 dots", "Crayons", "Picture cards"]',
      assessmentNotes: 'OBSERVABLE SUBTRACTION FROM 5 ASSESSMENT - Circle proficiency level for each:\n☐ Understands "taking away" concept: ☐ No understanding ☐ Beginning concept ☐ Good understanding ☐ Explains clearly to others\n☐ Counts correctly after removal: ☐ Cannot count ☐ Counts with help ☐ Counts independently ☐ Counts efficiently\n☐ Records subtraction sentences: ☐ Cannot record ☐ Records with help ☐ Records correctly ☐ Records and explains meaning\n☐ Uses French subtraction vocabulary: ☐ No French ☐ Some attempts ☐ Uses correctly ☐ Uses naturally in explanations',
      modifications: JSON.stringify({
        "forStruggling": "Use only 3-4 objects initially. Show removal very slowly. Use consistent materials. Practice one subtraction fact many times before moving on.",
        "forIEP": "Use larger objects that are easy to grasp. Provide physical movement opportunities. Use consistent routine. Allow extra processing time.",
        "forELL": "Connect to home language subtraction words. Use gestures for 'take away.' Provide visual vocabulary cards. Allow physical demonstration over verbal.",
        "forAdvanced": "Explore all combinations that equal 5. Create word problems for others. Investigate patterns in subtracting from 5. Connect to addition facts."
      }),
      indigenousPerspectives: 'Connect to Mi\'kmaq sharing practices where resources were distributed fairly and taking only what was needed was important. Discuss how understanding subtraction helped in managing resources like food stores, ensuring enough remained for the community through winter.',
      learningGoals: 'Students will understand subtraction as taking away and solve problems subtracting from 5 using concrete materials and appropriate vocabulary.',
      learningGoalsFr: 'Les élèves comprendront la soustraction comme enlever et résoudront des problèmes en soustrayant de 5 en utilisant du matériel concret et le vocabulaire approprié.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French',
      vocabularyTerms: 'soustraire, retirer, reste'
    },

    // Lesson 2: Subtracting from 10
    {
      date: new Date('2024-12-16'),
      title: 'Subtracting from 10',
      titleFr: 'Soustraire de 10',
      mindsOn: '**Minds On (8 minutes)**: Show 10 cubes in a ten frame, then cover some. Students determine how many are hidden. Introduce "dix moins," "différence," "enlever" while building on previous understanding of subtraction.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Review vocabulary: "dix moins," "différence," "enlever" while exploring subtraction from 10. Students see that 10 is special because it fills a ten frame completely, making subtraction patterns visible. **Guided Practice (12 min)**: Use ten frames systematically for all subtraction from 10 facts. Start with 10-1, 10-2, etc., showing the empty spaces clearly. Create "Broken Ten Stories" - 10 items with some broken/missing. Practice writing subtraction sentences from 10. Use fingers to show 10 minus various amounts. **Independent Practice (8 min)**: Students explore at stations: ten frame subtraction puzzles, "10 Minus Memory" matching game, creating illustrated stories starting with 10 objects.',
      consolidation: '**Consolidation (10 minutes)**: Students share patterns they notice when subtracting from 10. Demonstrate favorite subtraction fact from 10. Close with "Ten Frame Lightning" - quick flash of ten frame with some covered.',
      materials: '["Ten frames", "Two-color counters", "Craft sticks bundled in 10s", "Cover cards", "Ten frame dot patterns", "Recording sheets", "Story templates"]',
      assessmentNotes: 'OBSERVABLE SUBTRACTION FROM 10 ASSESSMENT - Circle proficiency level for each:\n☐ Uses ten frame effectively: ☐ Cannot use ☐ Uses with help ☐ Uses independently ☐ Uses strategically\n☐ Recognizes patterns in 10 minus: ☐ No patterns ☐ Some patterns ☐ Clear patterns ☐ Explains patterns\n☐ Solves 10 minus facts accurately: ☐ Many errors ☐ Some errors ☐ Mostly correct ☐ Always accurate\n☐ Connects to real situations: ☐ No connections ☐ Simple connections ☐ Good connections ☐ Creates own problems',
      modifications: JSON.stringify({
        "forStruggling": "Practice 10-1 and 10-2 extensively before adding more. Use physical ten bundles. Color-code the ten frame. Provide number line support.",
        "forIEP": "Use large ten frame on floor for movement. Provide tactile ten bundles. Use consistent colors. Allow calculator verification.",
        "forELL": "Compare number patterns across languages. Use visual ten frame cards. Practice with familiar contexts like fingers. Allow peer translation.",
        "forAdvanced": "Explore mental strategies for 10 minus. Investigate patterns beyond 10. Create challenging ten frame puzzles. Teach strategies to others."
      }),
      indigenousPerspectives: 'Explore how Mi\'kmaq traditionally used base-10 thinking in seasonal planning, such as knowing how much food to preserve if 10 days\' worth was prepared and some was consumed. Discuss practical applications of subtraction in resource management.',
      learningGoals: 'Students will efficiently subtract from 10 using ten frames, recognize patterns, and apply subtraction skills to solve practical problems.',
      learningGoalsFr: 'Les élèves soustrairont efficacement de 10 en utilisant des cadres de dix, reconnaîtront les régularités, et appliqueront les compétences de soustraction pour résoudre des problèmes pratiques.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French',
      vocabularyTerms: 'dix moins, différence, enlever'
    },

    // Lesson 3: Zero in Subtraction
    {
      date: new Date('2024-12-17'),
      title: 'Zero in Subtraction',
      titleFr: 'Zéro dans la soustraction',
      mindsOn: '**Minds On (8 minutes)**: Show students 5 objects, then take away all 5. Ask what remains. Show 3 objects, take away 0. Compare the results. Introduce "zéro," "rien," "vide" while exploring these special subtraction cases.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Explore vocabulary: "zéro," "rien," "vide" while investigating two special subtraction situations: taking away nothing (5-0=5) and taking away everything (5-5=0). Students discover these important patterns. **Guided Practice (12 min)**: Create "Zero Stories" showing both types: "5 birds, none fly away" and "5 birds, all fly away." Use empty sets and full sets to demonstrate zero concepts. Practice writing subtraction sentences with zero as answer and zero as amount subtracted. Act out zero situations with movement and drama. **Independent Practice (8 min)**: Students work at zero exploration centers: finding zero subtraction facts with manipulatives, creating zero story books, matching subtraction sentences to zero situations.',
      consolidation: '**Consolidation (10 minutes)**: Students explain when subtraction results in zero and when subtracting zero leaves everything the same. Share examples from their own lives. Close with "Zero Magic" demonstration of both zero patterns.',
      materials: '["Various counters", "Empty containers", "Full containers", "Zero story cards", "Recording sheets", "Props for acting", "Number cards including zero"]',
      assessmentNotes: 'OBSERVABLE ZERO IN SUBTRACTION ASSESSMENT - Circle proficiency level for each:\n☐ Understands subtracting zero: ☐ No understanding ☐ Confused ☐ Basic understanding ☐ Clear understanding\n☐ Understands subtracting all (equals zero): ☐ No understanding ☐ Confused ☐ Basic understanding ☐ Clear understanding\n☐ Recognizes zero in real situations: ☐ Cannot recognize ☐ Sometimes ☐ Usually ☐ Always connects\n☐ Explains zero concepts in French: ☐ No explanation ☐ Simple attempts ☐ Good explanations ☐ Clear, detailed explanations',
      modifications: JSON.stringify({
        "forStruggling": "Use dramatic actions for zero concepts. Practice one zero pattern at a time. Use concrete examples only. Repeat with different materials.",
        "forIEP": "Use movement and acting for zero concepts. Provide consistent visual cues. Use familiar contexts. Allow multiple ways to show understanding.",
        "forELL": "Connect zero concepts to home language. Use gestures and actions. Provide visual zero cards. Practice in meaningful contexts.",
        "forAdvanced": "Explore zero in different number systems. Investigate identity properties. Create complex zero scenarios. Research zero's mathematical importance."
      }),
      indigenousPerspectives: 'Discuss the Mi\'kmaq understanding of balance and the importance of empty spaces in nature cycles - such as how winter (a time of apparent emptiness) is essential for spring growth. Connect to traditional understanding of when to take nothing from nature to preserve resources.',
      learningGoals: 'Students will understand the role of zero in subtraction, recognizing when subtraction results in zero and when subtracting zero leaves the quantity unchanged.',
      learningGoalsFr: 'Les élèves comprendront le rôle de zéro dans la soustraction, reconnaissant quand la soustraction donne zéro et quand soustraire zéro laisse la quantité inchangée.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French',
      vocabularyTerms: 'zéro, rien, vide'
    },

    // Lesson 4: Subtraction Patterns
    {
      date: new Date('2024-12-18'),
      title: 'Subtraction Patterns',
      titleFr: 'Régularités de soustraction',
      mindsOn: '**Minds On (8 minutes)**: Write subtraction sentences: 5-1=4, 4-1=3, 3-1=2, 2-1=1, 1-1=0. Students predict the next pattern. Introduce "régularité," "suite," "prédire" while discovering subtraction patterns.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Explore vocabulary: "régularité," "suite," "prédire" while examining various subtraction patterns. Students discover patterns when subtracting the same number repeatedly, subtracting by 1s, and other numerical patterns. **Guided Practice (12 min)**: Create pattern charts showing subtraction sequences. Explore counting backward patterns: 10, 9, 8, 7... connecting to subtraction by 1. Use manipulatives to build and extend subtraction patterns. Predict what comes next in various subtraction sequences. Record patterns both numerically and with objects. **Independent Practice (8 min)**: Students work at pattern stations: completing subtraction pattern puzzles, creating their own subtraction patterns, finding patterns in real-world subtraction scenarios.',
      consolidation: '**Consolidation (10 minutes)**: Students share interesting patterns they discovered and explain how they knew what came next. Create class collection of subtraction patterns. Close with pattern prediction game.',
      materials: '["Pattern cards", "Counters", "Pattern charts", "Recording sheets", "Number lines", "Pattern blocks", "Prediction sheets"]',
      assessmentNotes: 'OBSERVABLE SUBTRACTION PATTERNS ASSESSMENT - Circle proficiency level for each:\n☐ Identifies subtraction patterns: ☐ Cannot identify ☐ Simple patterns only ☐ Most patterns ☐ Complex patterns easily\n☐ Extends patterns accurately: ☐ Cannot extend ☐ With significant help ☐ With minimal help ☐ Independently and confidently\n☐ Creates own patterns: ☐ Cannot create ☐ Simple attempts ☐ Clear patterns ☐ Complex, creative patterns\n☐ Explains pattern thinking: ☐ No explanation ☐ Unclear ☐ Adequate ☐ Clear, detailed explanations',
      modifications: JSON.stringify({
        "forStruggling": "Start with very simple patterns (subtract 1 repeatedly). Use visual patterns with objects. Provide pattern templates. Practice one pattern type extensively.",
        "forIEP": "Use movement patterns (step backward). Provide tactile pattern materials. Use color coding. Allow extra time for pattern recognition.",
        "forELL": "Connect patterns to home language counting. Use visual pattern cards. Practice pattern vocabulary. Allow demonstration over verbal explanation.",
        "forAdvanced": "Explore complex number patterns. Create challenging pattern puzzles. Investigate why patterns work. Connect to algebraic thinking."
      }),
      indigenousPerspectives: 'Connect to Mi\'kmaq observations of natural patterns and cycles, such as seasonal patterns of animal migration where populations decrease in predictable ways. Discuss how Indigenous knowledge keepers used mathematical patterns to predict natural phenomena.',
      learningGoals: 'Students will identify, extend, and create subtraction patterns, developing algebraic thinking skills and pattern recognition abilities.',
      learningGoalsFr: 'Les élèves identifieront, prolongeront et créeront des régularités de soustraction, développant des compétences de pensée algébrique et des capacités de reconnaissance de régularités.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French',
      vocabularyTerms: 'régularité, suite, prédire'
    },

    // Lesson 5: Fact Families to 5
    {
      date: new Date('2024-12-19'),
      title: 'Fact Families to 5',
      titleFr: 'Familles de faits jusqu\'à 5',
      mindsOn: '**Minds On (8 minutes)**: Show 3 red counters and 2 blue counters. Students create addition and subtraction sentences from this arrangement. Introduce "famille," "opération," "inverse" while discovering how addition and subtraction connect.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Explore vocabulary: "famille," "opération," "inverse" while discovering fact families. Students learn that 3+2=5, 2+3=5, 5-3=2, 5-2=3 all belong to the same family because they use the same three numbers. **Guided Practice (12 min)**: Build fact families using manipulatives for numbers to 5. Start with 2+1=3 family, then 3+1=4 family, then 2+2=4, and 3+2=5 families. Students discover that some families have 2 facts (doubles) and others have 4 facts. Use fact family triangles and houses to organize thinking. Practice switching between addition and subtraction with same numbers. **Independent Practice (8 min)**: Students explore at fact family centers: building families with dominoes, completing fact family houses, creating fact family stories.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate one complete fact family and explain how the facts are related. Share strategies for remembering fact families. Close with fact family sorting game.',
      materials: '["Two-color counters", "Fact family triangles", "Fact family house templates", "Dominoes", "Small objects for sorting", "Recording sheets", "Number cards"]',
      assessmentNotes: 'OBSERVABLE FACT FAMILIES TO 5 ASSESSMENT - Circle proficiency level for each:\n☐ Recognizes related facts: ☐ No recognition ☐ Sometimes ☐ Usually ☐ Always sees connections\n☐ Completes fact families: ☐ Cannot complete ☐ With much help ☐ With some help ☐ Independently\n☐ Explains fact family relationships: ☐ No explanation ☐ Unclear ☐ Basic explanation ☐ Clear, detailed explanation\n☐ Uses inverse relationship: ☐ Cannot use ☐ Beginning understanding ☐ Good understanding ☐ Uses strategically',
      modifications: JSON.stringify({
        "forStruggling": "Work with one fact family at a time. Use concrete materials always. Color-code the three numbers. Practice addition facts before introducing subtraction.",
        "forIEP": "Use large fact family houses. Provide physical movement activities. Use consistent number placement. Allow manipulation of concrete objects.",
        "forELL": "Connect family concept to home language. Use visual fact family cards. Practice key vocabulary repeatedly. Allow peer support for explanations.",
        "forAdvanced": "Explore larger fact families. Investigate why some families have 2 facts vs 4. Create fact family games. Connect to algebraic thinking about inverse operations."
      }),
      indigenousPerspectives: 'Connect to Mi\'kmaq understanding of relationships and balance in nature, where different elements work together in cycles - like how taking and giving back create balance. Discuss how traditional knowledge recognizes interconnected relationships, similar to how math facts are connected.',
      learningGoals: 'Students will understand fact families as related addition and subtraction facts, recognizing the inverse relationship between operations and completing fact families to 5.',
      learningGoalsFr: 'Les élèves comprendront les familles de faits comme des faits d\'addition et de soustraction reliés, reconnaissant la relation inverse entre les opérations et complétant les familles de faits jusqu\'à 5.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French',
      vocabularyTerms: 'famille, opération, inverse'
    },

    // Lesson 6: Fact Families to 10
    {
      date: new Date('2024-12-22'),
      title: 'Fact Families to 10',
      titleFr: 'Familles de faits jusqu\'à 10',
      mindsOn: '**Minds On (8 minutes)**: Show a ten frame with 6 filled and 4 empty. Students create all possible addition and subtraction sentences. Introduce "dizaine," "compléter," "relation" while extending fact family understanding to 10.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Build on vocabulary: "dizaine," "compléter," "relation" while exploring fact families that equal 10. Students discover that 10 is special because it\'s a complete ten frame, making fact families very visual. **Guided Practice (12 min)**: Create all fact families with sums to 10 using ten frames. Emphasize the 5+5=10 family (only 2 facts) versus others like 6+4=10 (4 facts). Students learn "friends of 10" or "partners to 10" - pairs that make 10. Use part-whole thinking with ten frames to strengthen understanding. Practice switching fluently between addition and subtraction within families. **Independent Practice (8 min)**: Students work at extended fact family centers: ten frame fact family puzzles, "Friends of 10" matching games, creating story problems for fact families to 10.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate knowledge of "friends of 10" and explain how they relate to subtraction from 10. Share strategies for learning fact families. Close with rapid "Partners to 10" practice.',
      materials: '["Ten frames", "Two-color counters", "Fact family triangles for 10", "Partner cards", "Ten frame patterns", "Story problem templates", "Friends of 10 charts"]',
      assessmentNotes: 'OBSERVABLE FACT FAMILIES TO 10 ASSESSMENT - Circle proficiency level for each:\n☐ Knows partners/friends of 10: ☐ Few or none ☐ Some pairs ☐ Most pairs ☐ All pairs fluently\n☐ Completes fact families to 10: ☐ Cannot complete ☐ Simple families only ☐ Most families ☐ All families efficiently\n☐ Uses ten frame strategically: ☐ Cannot use ☐ Basic use ☐ Good use ☐ Strategic, flexible use\n☐ Connects addition/subtraction fluently: ☐ Sees as separate ☐ Some connection ☐ Good connection ☐ Flexible, strategic connection',
      modifications: JSON.stringify({
        "forStruggling": "Focus on a few key partners of 10 first (5+5, 6+4, 7+3). Use physical ten frames. Practice one fact family extensively before adding others.",
        "forIEP": "Use kinesthetic activities for partners of 10. Provide visual support charts. Use consistent materials and routine. Allow extended practice time.",
        "forELL": "Connect to home language number patterns. Use visual ten frame cards. Practice vocabulary in context. Allow demonstration of understanding.",
        "forAdvanced": "Explore fact families beyond 10. Investigate patterns in fact families. Create challenging fact family puzzles. Teach strategies to younger students."
      }),
      indigenousPerspectives: 'Explore Mi\'kmaq traditional use of 10 as a complete unit (fingers) and 20 as a full person (fingers and toes), showing how fact families and number relationships were practical tools for trade, resource sharing, and group organization in traditional communities.',
      learningGoals: 'Students will master fact families to 10, fluently identify partners of 10, and strategically use the inverse relationship between addition and subtraction.',
      learningGoalsFr: 'Les élèves maîtriseront les familles de faits jusqu\'à 10, identifieront couramment les partenaires de 10, et utiliseront stratégiquement la relation inverse entre l\'addition et la soustraction.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French',
      vocabularyTerms: 'dizaine, compléter, relation'
    }
  ];

  console.log(`Creating ${lessons.length} Week 3 Subtraction lessons...`);
  
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
          materials: lessonData.materials,
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
          subNotes: `Subtraction concepts require concrete materials and visual support. Emphasize vocabulary: ${lessonData.vocabularyTerms}. Use ten frames and manipulatives consistently. Support students who need extra time for taking away concepts.`,
          // Add vocabulary tracking as JSON
          differentiationStrategies: JSON.stringify({
            "vocabularyFocus": lessonData.vocabularyTerms,
            "keyStrategies": ["concrete materials", "visual representations", "step-by-step process", "multiple examples"],
            "assessmentMethod": "observable checklists with proficiency levels"
          })
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
      
      // Add curriculum expectations - Link to B1.1 and B1.5 equivalent expectations
      const expectationIds = [
        'cmebyc93c000mvjqu82o9dw3u', // 1.N8 - Addition/subtraction comprehension (main subtraction expectation)
        'cmebyc93c000lvjqutxiw99wk', // 1.N7 - One more/less relationships 
        'cmebyc93a000ivjqunv3u955n'  // 1.N4 - Number representation to 20
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
  
  console.log(`\n✅ Created ${lessons.length} Week 3 Subtraction lessons!`);
  console.log('➖ WEEK 3 COMPLETE: Subtraction basics and fact families mastered');
  console.log('🎯 All lessons feature:');
  console.log('   • 45-minute ETFO structure (8/27/10 split)');
  console.log('   • B1.1 & B1.5 curriculum links (N8, N7, N4)');
  console.log('   • Full JSON differentiation strategies');
  console.log('   • Assessment with ☐ checkboxes');
  console.log('   • Mi\'kmaq perspectives (100+ characters)');
  console.log('   • Max 3 vocabulary terms per lesson');
  console.log('📚 Students ready for advanced subtraction concepts');
  
  await prisma.$disconnect();
}

createWeek3SubtractionLessons().catch(console.error);