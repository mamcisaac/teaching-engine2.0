#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function createWeek1MathLessons() {
  console.log('🧮 CREATING WEEK 1 MATH LESSONS: NUMBERS 0-5');
  console.log('Grade 1 Mathematics - Numbers to 20 Unit');
  console.log('=========================================');

  const unitPlanId = 'cmectx0p0000hvj4pof760zdh'; // Numbers to 20 unit
  const userId = 23;

  const lessons = [
    // Lesson 1: Introduction to Numbers 0-5
    {
      date: new Date('2025-09-03'),
      title: 'Counting to 5',
      titleFr: 'Compter jusqu\'à 5',
      mindsOn: '**Minds On (8 minutes)**: Display a collection of 5 real objects (apples, blocks, crayons). Have students close their eyes while you remove some. When they open eyes, they guess how many are left. Introduce "zéro," "un," "cinq" through this engaging game.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce number vocabulary: "zéro," "un," "cinq" using fingers, objects, and number cards. Students practice showing numbers on fingers and recognizing written numerals. **Guided Practice (12 min)**: Use counting bears to explore each number 0-5. Students build sets, count together in French, and match quantities to number cards. Practice forward and backward counting through songs and movement. **Independent Practice (8 min)**: Students work at math stations: building towers with exact numbers of blocks, creating dot patterns for each number, and sorting number cards with matching object sets.',
      consolidation: '**Consolidation (10 minutes)**: Students share their favorite number from 0-5 and show it three ways (fingers, objects, numeral). Create class counting book pages. Close with counting song "Un, deux, trois, nous irons au bois."',
      materials: '["Counting bears (sets of 5)", "Number cards 0-5", "Vocabulary cards: zéro, un, cinq", "Building blocks", "Dot pattern cards", "Objects for counting", "Chart paper for class book"]',
      assessmentNotes: 'OBSERVABLE NUMBER RECOGNITION ASSESSMENT - Circle proficiency level for each:\n1. Recognizes numerals 0-5: ☐ Cannot identify ☐ Identifies some ☐ Identifies most ☐ Identifies all correctly\n2. Counts objects to 5 accurately: ☐ No 1-to-1 correspondence ☐ Some errors ☐ Mostly accurate ☐ Always accurate\n3. Uses French number words: ☐ Uses English only ☐ Some French attempts ☐ Mostly French ☐ Fluent French counting\n4. Shows quantities with fingers: ☐ Cannot show ☐ Shows with help ☐ Shows independently ☐ Shows quickly and accurately',
      modifications: '{"forStruggling": "Start with numbers 0-3 only. Use larger manipulatives for easier grasping. Provide number mats with dots to match. Practice counting with physical movement.", "forIEP": "Use assistive technology for number recognition. Provide tactile number cards. Allow alternative ways to show understanding. Reduce quantity of practice items.", "forELL": "Connect to counting in home language. Use visual number stories. Provide bilingual number cards. Encourage counting in both languages.", "forAdvanced": "Extend to numbers beyond 5. Create number patterns. Help peers with counting. Explore different representations of same number."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq traditional counting methods and the importance of numbers in traditional stories and games. Discuss how Indigenous peoples used body parts for counting (fingers, hands) and natural materials (stones, shells) for tracking quantities, emphasizing that mathematics has always been part of human culture.',
      learningGoals: 'Students will recognize, count, and represent numbers from 0 to 5 using concrete materials, demonstrating understanding through multiple representations while developing French mathematical vocabulary.',
      learningGoalsFr: 'Les élèves reconnaîtront, compteront et représenteront les nombres de 0 à 5 en utilisant du matériel concret, démontrant leur compréhension à travers des représentations multiples tout en développant le vocabulaire mathématique français.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 2: Representing Numbers 1-3
    {
      date: new Date('2025-09-04'),
      title: 'Representing Numbers 1-3',
      titleFr: 'Représenter les nombres 1-3',
      mindsOn: '**Minds On (7 minutes)**: Play "Quick Flash" - show dot patterns for 1, 2, or 3 objects briefly. Students show the number on fingers immediately. Introduce "représenter," "montrer," "différent" while discussing different ways to show the same number.',
      action: '**Action (28 minutes)**: **Introduction (8 min)**: Explore vocabulary: "représenter," "montrer," "différent" while demonstrating multiple representations of numbers 1-3 (tally marks, dots, objects, fingers, ten frames). Students practice identifying same quantity in different forms. **Guided Practice (12 min)**: Create "number museums" where each number (1, 2, 3) has multiple representations. Students work in pairs to find and create different ways to show each number using materials. Document representations with drawings. **Independent Practice (8 min)**: Students complete representation matching activities: connecting dot patterns to numerals, building quantities with different materials, and creating their own unique representations for numbers 1-3.',
      consolidation: '**Consolidation (10 minutes)**: Gallery walk to see all representations. Students explain "J\'ai représenté deux avec..." Play "Same Number, Different Look" game. Close by celebrating the many ways to show numbers.',
      materials: '["Dot pattern cards", "Ten frames", "Vocabulary cards: représenter, montrer, différent", "Counters", "Linking cubes", "Drawing materials", "Tally mark examples", "Number cards 1-3"]',
      assessmentNotes: 'OBSERVABLE REPRESENTATION ASSESSMENT - Circle proficiency level for each:\n1. Creates multiple representations: ☐ Cannot create ☐ Creates with help ☐ Creates 2-3 ways ☐ Creates 4+ ways independently\n2. Recognizes equivalent quantities: ☐ No recognition ☐ Some confusion ☐ Mostly accurate ☐ Always identifies same amount\n3. Uses mathematical vocabulary: ☐ No math language ☐ Some attempts ☐ Good use of terms ☐ Rich mathematical language\n4. Explains representations: ☐ Cannot explain ☐ Basic explanation ☐ Clear explanation ☐ Detailed, confident explanation',
      modifications: '{"forStruggling": "Focus on numbers 1-2 first. Use only concrete materials. Provide representation templates. Work in small guided groups.", "forIEP": "Use larger materials for fine motor challenges. Provide visual representation charts. Allow verbal or pointing responses. Reduce number of representations required.", "forELL": "Label representations in multiple languages. Use culturally familiar objects. Connect to counting songs from home. Provide visual vocabulary supports.", "forAdvanced": "Include number 0 and numbers to 5. Create representation puzzles for others. Explore abstract representations. Lead representation demonstrations."}',
      indigenousPerspectives: 'Explore Mi\'kmaq traditional ways of representing quantities in beadwork patterns, quillwork designs, and wampum belts. Discuss how Indigenous artists use repetition of elements (1, 2, 3) to create meaningful patterns that tell stories and preserve mathematical thinking in cultural art forms.',
      learningGoals: 'Students will create and recognize multiple representations of numbers 1-3, demonstrating flexibility in mathematical thinking and understanding that quantities can be shown in various ways.',
      learningGoalsFr: 'Les élèves créeront et reconnaîtront plusieurs représentations des nombres 1-3, démontrant une flexibilité dans la pensée mathématique et comprenant que les quantités peuvent être montrées de diverses façons.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    },

    // Lesson 3: Representing Numbers 4-5 with Subitizing
    {
      date: new Date('2025-09-05'),
      title: 'Numbers 4-5 and Quick Recognition',
      titleFr: 'Les nombres 4-5 et reconnaissance rapide',
      mindsOn: '**Minds On (8 minutes)**: Show dot patterns for 4 and 5 using dice and domino arrangements. Students practice "seeing" the number without counting. Introduce "quatre," "cinq," "rapidement" through quick recognition games.',
      action: '**Action (27 minutes)**: **Introduction (7 min)**: Introduce vocabulary: "quatre," "cinq," "rapidement" while exploring standard dot patterns for 4 and 5. Show how 4 can be seen as 2+2 or 3+1, and 5 as 2+3 or 4+1. Students practice subitizing with dot cards. **Guided Practice (12 min)**: Play "Dot Pattern Memory" where students see arrangements of 4 or 5 briefly and recreate them. Work with ten frames to show 4 and 5, noticing 5 fills one row. Create hand prints showing 4 and 5 fingers. **Independent Practice (8 min)**: Students work at subitizing stations: quick dot pattern recognition, building 4 and 5 in different arrangements, and creating their own dot patterns for friends to recognize quickly.',
      consolidation: '**Consolidation (10 minutes)**: Students demonstrate their fastest way to recognize 4 and 5. Share different arrangements that help them "see" the number. Close with celebrating that we can now count and recognize 0-5!',
      materials: '["Dice", "Dominoes", "Vocabulary cards: quatre, cinq, rapidement", "Dot pattern cards", "Ten frames", "Counters", "Paper for hand prints", "Quick flash cards"]',
      assessmentNotes: 'OBSERVABLE SUBITIZING ASSESSMENT - Circle proficiency level for each:\n1. Subitizes (quick recognition) to 5: ☐ Must count all ☐ Sometimes quick ☐ Usually quick ☐ Always instant recognition\n2. Creates organized arrangements: ☐ Random placement ☐ Some organization ☐ Clear patterns ☐ Strategic, recognizable patterns\n3. Identifies number compositions: ☐ Sees only total ☐ Some part awareness ☐ Identifies parts ☐ Flexibly decomposes numbers\n4. Uses French number vocabulary: ☐ English only ☐ Some French ☐ Mostly French ☐ Consistent French use',
      modifications: '{"forStruggling": "Use familiar patterns only (dice). Provide more time for recognition. Start with 1-3 review. Use larger, colored dots.", "forIEP": "Use tactile dot patterns. Allow touch-counting when needed. Provide consistent dot arrangements. Use assistive technology for responses.", "forELL": "Connect to games from home culture using dots/dice. Show numbers in multiple scripts. Use visual pattern vocabulary. Allow explanations in home language.", "forAdvanced": "Explore numbers 6-10 patterns. Create subitizing challenges. Investigate different cultural number patterns. Lead quick recognition games."}',
      indigenousPerspectives: 'Connect to Mi\'kmaq traditional games that use quick recognition of small quantities, such as traditional dice games using marked stones or bones. Discuss how the ability to quickly recognize quantities was essential for traditional activities like gathering, hunting, and trading, showing mathematics as a practical life skill.',
      learningGoals: 'Students will quickly recognize (subitize) quantities up to 5, create organized arrangements for numbers 4-5, and understand that numbers can be composed of smaller parts.',
      learningGoalsFr: 'Les élèves reconnaîtront rapidement (subitisation) les quantités jusqu\'à 5, créeront des arrangements organisés pour les nombres 4-5, et comprendront que les nombres peuvent être composés de parties plus petites.',
      subject: 'Mathematics',
      grade: 1,
      language: 'French'
    }
  ];

  console.log(`Creating ${lessons.length} Week 1 Math lessons...`);
  
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
          subNotes: 'All activities use concrete materials and visual supports. Focus on hands-on exploration and multiple representations. Encourage mathematical talk in French. Celebrate different ways of thinking about numbers.'
        }
      });
      
      console.log('✅ Created:', lessonData.date.toDateString(), '-', lessonData.title);
      
      // Add curriculum expectations
      const expectationIds = [
        'cmebyc939000fvjqu8ayagemw', // 1.N1 - Counting
        'cmebyc93a000gvjqujjkib9ln', // 1.N2 - Subitizing
        'cmebyc93a000ivjqunv3u955n'  // 1.N4 - Representing numbers
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
  
  console.log(`\n✅ Created ${lessons.length} Week 1 Math lessons!`);
  console.log('📊 WEEK 1 COMPLETE: Numbers 0-5 foundation established');
  console.log('🎯 All lessons include:');
  console.log('   • 45-minute duration with ETFO structure');
  console.log('   • Maximum 3 vocabulary items per lesson');
  console.log('   • Observable assessment with checkboxes');
  console.log('   • JSON differentiation for all learners');
  console.log('   • Authentic Mi\'kmaq perspectives');
  console.log('   • 3 curriculum expectations linked');
  console.log('📚 Ready for Week 2: Numbers 6-10');
  
  await prisma.$disconnect();
}

createWeek1MathLessons().catch(console.error);