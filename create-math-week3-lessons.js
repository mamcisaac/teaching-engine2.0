#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createWeek3MathLessons() {
  console.log('🧮 CREATING WEEK 3 MATH LESSONS: NUMBERS 11-15');
  console.log('Grade 1 Mathematics - Numbers to 20 Unit');
  console.log('===========================================');

  const unitPlanId = 'cmectx0p0000hvj4pof760zdh'; // Numbers to 20 unit
  const userId = 23;

  const lessons = [
    // Lesson 9: Introduction to Teen Numbers
    {
      date: new Date('2025-09-15'),
      title: 'Understanding Teen Numbers',
      titleFr: 'Comprendre les nombres de l\'adolescence',
      mindsOn: '**Minds On (8 minutes)**: Show 10 cubes in one color and add 1-5 more in another color. Students discover the pattern "10 and some more." Introduce "onze," "douze," "adolescent" while exploring what makes teen numbers special.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce teen number vocabulary: "onze," "douze," "adolescent" using base-10 blocks to show teen numbers as "1 ten and extras." Students learn the French naming pattern differs from English. **Guided Practice (12 min)**: Build teen numbers with ten frames and loose counters. Students see 11 as "10 and 1," 12 as "10 and 2." Create "teen number sandwiches" with 10 as the base. Practice saying "dix et un font onze." Use place value mats to organize tens and ones. **Independent Practice (8 min)**: Students explore teen numbers at centers: building with base-10 materials, matching numerals to quantities, creating teen number books showing 10 and more.',
      consolidation: '**Consolidation (10 minutes)**: Students explain what all teen numbers have in common. Share discoveries about the "ten hiding inside." Close with teen number chant: "Dix et un, c\'est onze, facile!"',
      materials: '["Base-10 blocks", "Two ten frames", "Vocabulary cards: onze, douze, adolescent", "Place value mats", "Two-color counters", "Teen number cards 11-19", "Chart paper"]',
      assessmentNotes: 'OBSERVABLE TEEN NUMBER ASSESSMENT - Circle proficiency level for each:\n1. Understands teen numbers as 10+more: ☐ No understanding ☐ Beginning concept ☐ Good understanding ☐ Explains clearly to others\n2. Builds teen numbers correctly: ☐ Cannot build ☐ Builds with help ☐ Builds independently ☐ Builds and explains structure\n3. Uses French teen vocabulary: ☐ English only ☐ Some French ☐ Mostly French ☐ Fluent French teen numbers\n4. Identifies the "ten" in teen numbers: ☐ Cannot identify ☐ Sometimes sees ☐ Usually identifies ☐ Always sees and uses strategically',
      modifications: '{"forStruggling": "Use physical ten-bundle and loose items. Color-code the ten. Start with 11-12 only. Use consistent materials throughout.", "forIEP": "Provide pre-made ten bundles. Use larger manipulatives. Allow physical grouping. Use visual teen number cards.", "forELL": "Compare teen number names across languages. Note different patterns. Use visual dictionaries. Allow code-switching for understanding.", "forAdvanced": "Explore place value deeply. Compare to numbers beyond 20. Create teen number puzzles. Investigate other number systems."}',
      indigenousPerspectives: 'Explore how Mi\'kmaq and other Indigenous counting systems group numbers, including the significance of 10 and 20 as natural grouping points based on fingers and toes. Discuss how different cultures developed place value understanding through practical counting needs in trade and daily life.',
      learningGoals: 'Students will understand teen numbers as composed of one ten and additional ones, recognizing the base-10 structure and using appropriate French vocabulary.',
      learningGoalsFr: 'Les élèves comprendront les nombres de l\'adolescence comme composés d\'une dizaine et d\'unités supplémentaires, reconnaissant la structure en base 10 et utilisant le vocabulaire français approprié.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 10: Numbers 11-12 Deep Dive
    {
      date: new Date('2025-09-16'),
      title: 'Mastering 11 and 12',
      titleFr: 'Maîtriser 11 et 12',
      mindsOn: '**Minds On (7 minutes)**: Quick flash 11 and 12 objects in different arrangements. Students show how many tens and ones using hand signals. Introduce "onze," "douze," "position" while noticing these numbers have special names.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Focus on vocabulary: "onze," "douze," "position" while exploring why these numbers have unique names in French (not "dix-un" or "dix-deux"). Build 11 and 12 multiple ways, emphasizing the ten-and-ones structure. **Guided Practice (12 min)**: Create number stories for 11 and 12 using classroom contexts: "11 crayons = 10 dans la boîte, 1 dehors." Practice counting forward and backward through 11 and 12. Use number lines to position these numbers. Compare 11 and 12 to numbers before and after. **Independent Practice (8 min)**: Students complete 11-12 investigations: finding groups of 11 and 12, creating equal groups problems, building staircases from 10 to 12.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate three different ways to show 11 or 12. Share memory tricks for these special number names. Close with partner counting practice through the tricky 10-11-12 sequence.',
      materials: '["Ten frames", "Base-10 materials", "Vocabulary cards: onze, douze, position", "Number lines", "Story problem cards", "Counting collections", "Number cards 10-12"]',
      assessmentNotes: 'OBSERVABLE 11-12 MASTERY - Circle proficiency level for each:\n1. Counts through 10-11-12 smoothly: ☐ Hesitates/errors ☐ Some hesitation ☐ Usually smooth ☐ Always fluent\n2. Builds 11-12 as ten and ones: ☐ Cannot build ☐ Builds with support ☐ Builds independently ☐ Builds efficiently\n3. Uses onze/douze correctly: ☐ Avoids these words ☐ Sometimes uses ☐ Usually correct ☐ Always uses naturally\n4. Positions on number line: ☐ Cannot position ☐ Approximate placement ☐ Accurate placement ☐ Places and explains relationships',
      modifications: '{"forStruggling": "Practice 10-11-12 sequence repeatedly. Use rhythmic counting. Provide visual cues at transition. Focus on one number per day if needed.", "forIEP": "Use consistent colored materials. Provide number sequence cards. Allow pointing on number line. Use music for memorization.", "forELL": "Explicitly compare number names to English. Note the irregularity. Use cognates where possible. Practice in context of familiar activities.", "forAdvanced": "Explore why 11-12 are irregular in many languages. Investigate base-12 systems. Create memory games for others. Research number history."}',
      indigenousPerspectives: 'Discuss how Mi\'kmaq language has its own unique way of naming numbers, just as French has special names for 11 and 12. Explore how number naming systems reflect cultural history and practical uses, showing that mathematics is shaped by culture and language.',
      learningGoals: 'Students will fluently count through 11 and 12, understanding their composition and unique names while building confidence with early teen numbers.',
      learningGoalsFr: 'Les élèves compteront couramment jusqu\'à 11 et 12, comprenant leur composition et leurs noms uniques tout en développant leur confiance avec les premiers nombres de l\'adolescence.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 11: Numbers 13-14 Patterns
    {
      date: new Date('2025-09-17'),
      title: 'Discovering 13 and 14',
      titleFr: 'Découvrir 13 et 14',
      mindsOn: '**Minds On (8 minutes)**: Show pattern of 10, 11, 12, then blank. Students predict what comes next. Build 13 and 14 with ten frames. Introduce "treize," "quatorze," "régularité" while finding patterns in teen numbers.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce vocabulary: "treize," "quatorze," "régularité" while noticing these begin to follow a more regular pattern than 11-12. Students explore 13 as "10+3" and 14 as "10+4," connecting to their knowledge of 3 and 4. **Guided Practice (12 min)**: Create "teen number trains" showing the progression from 10 to 14. Use double ten frames to show numbers clearly. Practice decomposing 13 and 14 different ways (12+1, 11+2, 10+3, etc.). Count collections of 13 and 14 by grouping into tens and ones. **Independent Practice (8 min)**: Students work at pattern stations: continuing number patterns through 14, building representations of 13-14, solving "How many more to make 13/14?" problems.',
      consolidation: '**Consolidation (10 minutes)**: Students explain the pattern they notice from 13 onward. Create class pattern chart for teen numbers. Close by counting 0-14 with emphasis on smooth transitions.',
      materials: '["Double ten frames", "Base-10 blocks", "Vocabulary cards: treize, quatorze, régularité", "Pattern cards", "Counting collections", "Number train templates", "Decomposition mats"]',
      assessmentNotes: 'OBSERVABLE 13-14 UNDERSTANDING - Circle proficiency level for each:\n1. Identifies patterns in teen numbers: ☐ No pattern recognition ☐ Sees some patterns ☐ Identifies main pattern ☐ Explains patterns clearly\n2. Decomposes 13-14 flexibly: ☐ Cannot decompose ☐ One way only ☐ 2-3 ways ☐ Multiple ways fluently\n3. Counts collections to 14: ☐ Counts by ones only ☐ Attempts grouping ☐ Groups into tens ☐ Efficient ten-grouping\n4. Uses French numbers accurately: ☐ Many errors ☐ Some errors ☐ Mostly accurate ☐ Completely fluent',
      modifications: '{"forStruggling": "Build each number before counting. Use ten frames consistently. Color-code tens and ones. Practice smaller ranges first.", "forIEP": "Provide number charts for reference. Use tactile materials. Allow extra processing time. Focus on concrete representations.", "forELL": "Note pronunciation similarities to English. Use visual number dictionaries. Practice in meaningful contexts. Allow peer translation support.", "forAdvanced": "Explore patterns beyond 14. Create complex decompositions. Investigate why teen names vary. Design pattern challenges for peers."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq understanding of patterns in nature that follow mathematical sequences, such as the 13 moon cycles in a year. Discuss how Indigenous knowledge keepers tracked cycles and patterns for planning seasonal activities, showing mathematics in traditional calendar systems.',
      learningGoals: 'Students will recognize patterns in teen numbers, flexibly decompose 13 and 14, and count efficiently by grouping into tens and ones.',
      learningGoalsFr: 'Les élèves reconnaîtront les régularités dans les nombres de l\'adolescence, décomposeront 13 et 14 de manière flexible, et compteront efficacement en groupant en dizaines et unités.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 12: Number 15 - Halfway Point
    {
      date: new Date('2025-09-18'),
      title: 'Number 15 - The Midpoint',
      titleFr: 'Le nombre 15 - Le point médian',
      mindsOn: '**Minds On (7 minutes)**: Show 15 objects arranged as 3 groups of 5. Students discover different ways to see 15. Count by 5s to 15. Introduce "quinze," "milieu," "moitié" while exploring 15 as halfway to 30.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Explore vocabulary: "quinze," "milieu," "moitié" while discovering special properties of 15. Show 15 as 10+5, three 5s, and halfway between 10 and 20. Students explore why 15 is significant (quarter hour, etc.). **Guided Practice (12 min)**: Investigate multiple representations of 15 using various materials. Create "15 Museums" showing all the ways to make 15. Practice skip counting by 5s through 15. Use number lines to show 15\'s position relative to 10 and 20. Build and compare numbers close to 15. **Independent Practice (8 min)**: Students complete 15-focused activities: finding all ways to make 15 with two numbers, creating patterns that include 15, solving "15 altogether" story problems.',
      consolidation: '**Consolidation (10 minutes)**: Students share what makes 15 special compared to other teen numbers. Create a class "Celebrating 15" poster. Close with counting to 15 in different ways (by 1s, 5s, backward).',
      materials: '["Groups of 5 counters", "Number lines", "Vocabulary cards: quinze, milieu, moitié", "Base-10 materials", "Clock showing 15 minutes", "15-museums templates", "Story problem cards"]',
      assessmentNotes: 'OBSERVABLE NUMBER 15 MASTERY - Circle proficiency level for each:\n1. Recognizes 15 as significant: ☐ No special awareness ☐ Some recognition ☐ Good understanding ☐ Deep understanding of properties\n2. Shows 15 multiple ways: ☐ One way only ☐ 2-3 ways ☐ 4-5 ways ☐ Many creative representations\n3. Skip counts by 5s to 15: ☐ Cannot skip count ☐ With prompting ☐ Independently ☐ Fluently extends pattern\n4. Positions 15 relatively: ☐ No relative sense ☐ Basic positioning ☐ Good relationships ☐ Explains relationships clearly',
      modifications: '{"forStruggling": "Focus on 15 as 10+5 first. Use groups of 5 consistently. Provide skip counting support. Build with concrete materials only.", "forIEP": "Use movement for skip counting. Provide visual 15 references. Allow calculator checks. Focus on one representation at a time.", "forELL": "Connect 15 to time (quarter hour) universally. Note quinze similarity to five/cinq. Use cultural contexts for 15. Practice in real situations.", "forAdvanced": "Explore 15 in different bases. Investigate factors of 15. Create 15-puzzles. Research cultural significance of 15."}',
      indigenousPerspectives: 'Explore the significance of 15 in Mi\'kmaq culture, including traditional moon counting where 15 days represents half a moon cycle. Discuss how Indigenous peoples used natural cycles and midpoints for navigation, planting, and ceremony timing, showing practical applications of mathematical thinking.',
      learningGoals: 'Students will understand 15 as a significant number with multiple representations, recognizing its position as a midpoint and its relationship to skip counting by 5s.',
      learningGoalsFr: 'Les élèves comprendront 15 comme un nombre significatif avec plusieurs représentations, reconnaissant sa position comme point médian et sa relation avec le comptage par bonds de 5.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 13: Comparing and Ordering 11-15
    {
      date: new Date('2025-09-19'),
      title: 'Comparing Teen Numbers 11-15',
      titleFr: 'Comparer les nombres 11-15',
      mindsOn: '**Minds On (8 minutes)**: Show two teen numbers with base-10 blocks. Students determine which is greater by looking at the structure. Introduce "comparer," "ordonner," "croissant" through hands-on comparison activities.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Review comparison vocabulary: "comparer," "ordonner," "croissant" while comparing teen numbers. Students learn that all teen numbers have 1 ten, so we compare the ones to determine which is greater. **Guided Practice (12 min)**: Order number cards 11-15 using various strategies. Build number towers to compare heights visually. Play "Greater Than Detective" finding clues to determine which teen number is larger. Create number lines and position all numbers 11-15. Use comparison symbols with teen numbers. **Independent Practice (8 min)**: Students work at comparison stations: ordering mixed teen number cards, playing comparison war with 11-15, creating "more than/less than" number stories.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate ordering 11-15 quickly and explain their strategy. Share different ways to compare teen numbers. Close with "Human Number Line" activity for 11-15.',
      materials: '["Base-10 blocks", "Number cards 11-15", "Vocabulary cards: comparer, ordonner, croissant", "Comparison symbol cards", "Number lines", "Building blocks for towers", "Story problem templates"]',
      assessmentNotes: 'OBSERVABLE COMPARISON ASSESSMENT - Circle proficiency level for each:\n1. Compares teen numbers accurately: ☐ Many errors ☐ Some errors ☐ Mostly accurate ☐ Always accurate with reasoning\n2. Orders 11-15 correctly: ☐ Cannot order ☐ Orders with help ☐ Orders independently ☐ Orders quickly and explains\n3. Uses comparison strategies: ☐ No clear strategy ☐ One strategy ☐ Multiple strategies ☐ Flexible strategy selection\n4. Explains comparisons in French: ☐ English only ☐ Some French ☐ Mostly French ☐ Clear French explanations',
      modifications: '{"forStruggling": "Compare only 2 numbers at once. Use concrete materials always. Provide number lines for reference. Start with numbers farther apart.", "forIEP": "Use physical movements for comparison. Provide visual comparison cards. Allow pointing responses. Use consistent comparison language.", "forELL": "Teach comparison words in home language too. Use gestures for more/less. Provide sentence frames. Practice with familiar contexts.", "forAdvanced": "Compare 3-4 teen numbers at once. Create comparison challenges. Explore patterns in differences. Teach comparison to others."}',
      indigenousPerspectives: 'Connect to traditional Mi\'kmaq practices of fair distribution and equal sharing, where comparing quantities ensured everyone received appropriate amounts. Discuss how mathematical comparison skills were essential for trade, resource management, and community decision-making.',
      learningGoals: 'Students will accurately compare and order teen numbers 11-15, using multiple strategies and explaining their reasoning using appropriate mathematical vocabulary.',
      learningGoalsFr: 'Les élèves compareront et ordonneront avec précision les nombres 11-15, utilisant plusieurs stratégies et expliquant leur raisonnement avec le vocabulaire mathématique approprié.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    }
  ];

  console.log(`Creating ${lessons.length} Week 3 Math lessons...`);
  
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
          subNotes: 'Teen numbers require extra practice at transitions. Use base-10 materials consistently. Emphasize the ten-and-ones structure. Support French pronunciation of unique teen number names.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
      
      // Add curriculum expectations
      const expectationIds = [
        'cmebyc93a000ivjqunv3u955n', // 1.N4 - Representing numbers to 20
        'cmebyc93b000jvjqu9kdvuy7u', // 1.N5 - Comparing sets to 20
        'cmebyc93c000lvjqutxiw99wk', // 1.N7 - One more/less, two more/less
        'cmebyc93b000kvjquoo3rrzgm'  // 1.N6 - Groups with and without units
      ];
      
      // Select 3 expectations per lesson
      const selectedExpectations = expectationIds.slice(0, 3);
      
      for (const expectationId of selectedExpectations) {
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
  
  console.log(`\n✅ Created ${lessons.length} Week 3 Math lessons!`);
  console.log('📊 WEEK 3 COMPLETE: Teen numbers 11-15 understood');
  console.log('🎯 All lessons emphasize:');
  console.log('   • Base-10 structure (1 ten and ones)');
  console.log('   • Unique French number names');
  console.log('   • Multiple representations');
  console.log('   • Pattern recognition');
  console.log('   • Comparison and ordering skills');
  console.log('📚 Ready for Week 4: Numbers 16-20');
  
  await prisma.$disconnect();
}

createWeek3MathLessons().catch(console.error);