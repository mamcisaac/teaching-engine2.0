const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUnit2MakingSenseOfNumbers() {
  console.log('🔧 Fixing Unit 2: Making Sense of Numbers - Making all 24 lessons ETFO-compliant...\n');

  // Get all lessons in this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      subject: 'Mathématiques',
      unitPlan: {
        title: 'Making Sense of Numbers'
      }
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${lessons.length} lessons in Making Sense of Numbers unit`);

  const differentiation = {
    forStruggling: "Visual number representations, concrete manipulatives for number bonds, simplified number ranges (0-5), peer support for number stories",
    forIEP: "Modified expectations per IEP, adaptive number tools (large print cards, tactile numbers), extended time for number activities, alternative recording methods",
    forELL: "Bilingual number vocabulary, visual number relationship charts, peer translation for number stories, number songs in both languages",
    forAdvanced: "Extension to larger numbers (beyond 10), complex number relationships, creating own number stories, peer tutoring for number concepts"
  };

  // Lesson-specific content mapping
  const lessonMappings = [
    {
      keywords: ["Number Stories"],
      mindsOn: "(8 minutes) Story warm-up with simple number scenarios. Share stories involving small quantities. Discuss how numbers help us tell stories about our experiences.",
      action: "(27 minutes) Create and share number stories using manipulatives and pictures. Students work with partners to act out stories involving quantities 0-10, focusing on how numbers make stories meaningful.",
      consolidation: "(10 minutes) Share favorite number stories with the class. Math journal reflection on how numbers help us describe our world. Connect to family stories.",
      indigenousPerspectives: "Learn about traditional Indigenous storytelling that incorporates numbers and counting. Explore how Indigenous cultures use numbers in legends and teaching stories to pass down mathematical knowledge.",
      assessmentNotes: "☐ Student creates meaningful number stories\n☐ Uses numbers accurately in story context\n☐ Explains the role of numbers in their story\n☐ Shows creativity in story development\n☐ Connects numbers to real experiences"
    },
    {
      keywords: ["Number Bonds"],
      mindsOn: "(8 minutes) Warm-up with 'part-part-whole' using hands and fingers. Explore how 5 can be made from different combinations. Show various ways to represent the same number.",
      action: "(27 minutes) Investigate number bonds using manipulatives, ten frames, and visual models. Students discover different ways to compose and decompose numbers, focusing on bonds for 5 and 10.",
      consolidation: "(10 minutes) Share discoveries about number relationships. Math journal reflection on favorite number bond. Connect to how we group things in daily life.",
      indigenousPerspectives: "Explore how Indigenous cultures traditionally grouped and organized quantities for trade, ceremony, and daily life. Learn about sacred numbers and their significance in Indigenous mathematics.",
      assessmentNotes: "☐ Student identifies number bonds accurately\n☐ Shows multiple ways to make same number\n☐ Uses concrete materials effectively\n☐ Explains part-whole relationships clearly\n☐ Applies bonds to solve problems"
    },
    {
      keywords: ["Counting Collections"],
      mindsOn: "(8 minutes) Explore interesting collections of objects. Discuss counting strategies and organization methods. Share experiences with collecting and organizing.",
      action: "(27 minutes) Count various collections using different strategies (grouping by 2s, 5s, 10s). Students practice organizing objects to make counting easier and more accurate.",
      consolidation: "(10 minutes) Share counting strategies that worked best. Math journal reflection on most efficient counting method. Connect to organizing collections at home.",
      indigenousPerspectives: "Learn about traditional Indigenous practices of collecting and counting natural materials for various purposes - gathering foods, medicine, and materials for crafts. Explore sustainable counting practices.",
      assessmentNotes: "☐ Student counts collections accurately\n☐ Uses efficient counting strategies\n☐ Organizes objects to support counting\n☐ Explains chosen counting method\n☐ Shows improvement in counting fluency"
    },
    {
      keywords: ["Part-Whole Relationships"],
      mindsOn: "(8 minutes) Warm-up with 'whole and parts' using classroom objects. Explore how groups can be split into smaller parts. Discuss how parts make up wholes.",
      action: "(27 minutes) Investigate part-whole relationships using manipulatives and visual models. Students explore how numbers can be broken apart and put back together in different ways.",
      consolidation: "(10 minutes) Share discoveries about parts and wholes. Math journal reflection on part-whole relationships in daily life. Connect to family groupings and sharing.",
      indigenousPerspectives: "Explore Indigenous concepts of wholeness and interconnectedness, including how communities work together as parts of a whole. Learn about traditional sharing practices.",
      assessmentNotes: "☐ Student understands part-whole relationships\n☐ Can identify parts that make a whole\n☐ Shows multiple ways to partition numbers\n☐ Explains thinking about parts and wholes\n☐ Applies concept to real situations"
    },
    {
      keywords: ["Ten Frames"],
      mindsOn: "(8 minutes) Introduce ten frames with visual patterns. Show how ten frames help us see numbers clearly. Practice quick recognition of numbers in ten frames.",
      action: "(27 minutes) Work with ten frames to represent numbers 0-10. Students practice filling ten frames, recognizing patterns, and using frames to compare numbers.",
      consolidation: "(10 minutes) Share favorite ten frame patterns. Math journal reflection on how ten frames help with number understanding. Connect to organizing things in groups of ten.",
      indigenousPerspectives: "Learn about traditional Indigenous ways of organizing and visualizing quantities, including patterns in beadwork and traditional designs that show mathematical relationships.",
      assessmentNotes: "☐ Student uses ten frames accurately\n☐ Recognizes number patterns in frames\n☐ Can build numbers using ten frames\n☐ Explains how ten frames help understanding\n☐ Compares numbers using frames effectively"
    },
    {
      keywords: ["Subitizing"],
      mindsOn: "(8 minutes) Quick flash activities with small dot patterns. Practice seeing small quantities instantly without counting. Discuss how we can 'just know' small numbers.",
      action: "(27 minutes) Explore subitizing with dot patterns, dominoes, and dice. Students practice recognizing small quantities quickly and developing number sense through visual patterns.",
      consolidation: "(10 minutes) Share strategies for quick number recognition. Math journal reflection on patterns that are easy to see. Connect to everyday quick counting needs.",
      indigenousPerspectives: "Learn about Indigenous skills in quickly assessing quantities in nature - like recognizing animal tracks, counting birds in flight, or estimating natural resources at a glance.",
      assessmentNotes: "☐ Student recognizes small quantities instantly\n☐ Can subitize patterns up to 5\n☐ Explains visual patterns they see\n☐ Shows increasing speed in recognition\n☐ Applies subitizing to support counting"
    },
    {
      keywords: ["Number Lines"],
      mindsOn: "(8 minutes) Walk along a floor number line. Explore how numbers are ordered and spaced. Discuss how number lines help us see number relationships.",
      action: "(27 minutes) Work with number lines to understand number order, counting, and relationships. Students practice finding numbers, counting forward and backward, and comparing positions.",
      consolidation: "(10 minutes) Share discoveries about number lines. Math journal reflection on how number lines help with counting. Connect to timelines and measurement tools.",
      indigenousPerspectives: "Explore how Indigenous peoples have traditionally used linear arrangements to track time, seasons, and quantities. Learn about traditional calendar systems and seasonal counting.",
      assessmentNotes: "☐ Student locates numbers on number line\n☐ Understands number order and sequence\n☐ Can count forward and backward\n☐ Explains number line relationships\n☐ Uses number line to compare numbers"
    },
    {
      keywords: ["Number Fluency"],
      mindsOn: "(8 minutes) Quick number warm-up games and activities. Practice rapid number recognition and basic number facts. Build confidence with number work.",
      action: "(27 minutes) Engage in fluency-building activities with numbers 0-10. Students practice quick recall, number patterns, and develop automaticity with basic number relationships.",
      consolidation: "(10 minutes) Reflect on fluency growth and practice strategies. Math journal about favorite number activities. Connect to the importance of practice in learning.",
      indigenousPerspectives: "Learn about traditional Indigenous practices that built mathematical fluency through daily activities, games, and cultural practices involving numbers and patterns.",
      assessmentNotes: "☐ Student shows improving number fluency\n☐ Recalls basic number facts quickly\n☐ Demonstrates confidence with numbers\n☐ Uses efficient strategies for number work\n☐ Shows growth in mathematical thinking"
    },
    {
      keywords: ["More and Less"],
      mindsOn: "(8 minutes) Comparison warm-up with objects around the room. Explore concepts of more, less, and same. Use comparison language in context.",
      action: "(27 minutes) Investigate more and less relationships using manipulatives and visual models. Students practice comparing quantities and using mathematical language accurately.",
      consolidation: "(10 minutes) Share comparison discoveries and strategies. Math journal reflection on when we use 'more' and 'less' in daily life. Connect to fair sharing and equality.",
      indigenousPerspectives: "Explore Indigenous values of balance and sharing, learning how traditional cultures approached concepts of 'enough,' abundance, and equitable distribution.",
      assessmentNotes: "☐ Student accurately compares quantities\n☐ Uses comparison language correctly\n☐ Can determine more/less relationships\n☐ Explains comparison reasoning\n☐ Applies concepts to real situations"
    },
    {
      keywords: ["Comparing Sets"],
      mindsOn: "(8 minutes) Set comparison warm-up with classroom materials. Explore different ways to compare groups of objects. Discuss strategies for fair comparison.",
      action: "(27 minutes) Compare sets using one-to-one correspondence, counting, and visual strategies. Students work with various sets to determine which has more, less, or equal amounts.",
      consolidation: "(10 minutes) Share effective comparison strategies. Math journal reflection on best ways to compare groups. Connect to fair play and equal sharing.",
      indigenousPerspectives: "Learn about traditional Indigenous practices of fair distribution and sharing within communities, including how groups and resources were traditionally compared and allocated.",
      assessmentNotes: "☐ Student compares sets accurately\n☐ Uses one-to-one correspondence effectively\n☐ Can determine set relationships\n☐ Explains comparison methods clearly\n☐ Shows understanding of equality"
    },
    {
      keywords: ["Ordering Numbers"],
      mindsOn: "(8 minutes) Number ordering warm-up with cards or manipulatives. Practice putting numbers in sequence. Discuss what 'order' means with numbers.",
      action: "(27 minutes) Work with ordering numbers from least to greatest and greatest to least. Students practice sequencing and understanding number relationships through position.",
      consolidation: "(10 minutes) Share ordering strategies and discoveries. Math journal reflection on number patterns in sequences. Connect to organizing and sequencing in daily life.",
      indigenousPerspectives: "Explore how Indigenous cultures have traditionally organized and sequenced events, seasons, and quantities. Learn about ceremonial counting and sacred number sequences.",
      assessmentNotes: "☐ Student orders numbers correctly\n☐ Understands least to greatest concept\n☐ Can identify missing numbers in sequence\n☐ Explains ordering reasoning\n☐ Applies sequencing to solve problems"
    },
    {
      keywords: ["Number Relationships"],
      mindsOn: "(8 minutes) Relationship warm-up exploring how numbers connect to each other. Discuss neighbor numbers and number families. Show various number connections.",
      action: "(27 minutes) Investigate relationships between numbers using manipulatives and visual models. Students explore patterns, connections, and how numbers relate to each other.",
      consolidation: "(10 minutes) Share interesting number relationships discovered. Math journal reflection on number connections. Connect to relationships in family and community.",
      indigenousPerspectives: "Learn about Indigenous understanding of interconnectedness and how all things relate to each other, including mathematical relationships in nature and traditional knowledge systems.",
      assessmentNotes: "☐ Student identifies number relationships\n☐ Understands connections between numbers\n☐ Can explain number patterns\n☐ Shows insight into mathematical thinking\n☐ Makes connections across concepts"
    },
    {
      keywords: ["Estimation"],
      mindsOn: "(8 minutes) Estimation warm-up with visible quantities. Practice making reasonable guesses about amounts. Discuss what makes a good estimate.",
      action: "(27 minutes) Develop estimation skills with various collections and scenarios. Students practice making and checking estimates, learning to judge reasonable quantities.",
      consolidation: "(10 minutes) Share estimation strategies and experiences. Math journal reflection on when estimation is useful. Connect to everyday estimation needs.",
      indigenousPerspectives: "Learn about traditional Indigenous skills in estimating natural quantities - judging distances, estimating resources, and making practical decisions based on mathematical reasoning.",
      assessmentNotes: "☐ Student makes reasonable estimates\n☐ Can check estimates against actual counts\n☐ Understands concept of 'close enough'\n☐ Explains estimation strategies\n☐ Applies estimation to real situations"
    },
    {
      keywords: ["Place Value Basics"],
      mindsOn: "(8 minutes) Explore grouping objects by tens and ones. Introduction to place value concepts with concrete materials. Discuss how we organize larger numbers.",
      action: "(27 minutes) Work with place value using base-ten blocks and grouping activities. Students begin to understand how our number system is organized by tens.",
      consolidation: "(10 minutes) Share discoveries about place value organization. Math journal reflection on grouping by tens. Connect to organizing collections efficiently.",
      indigenousPerspectives: "Explore different number systems used by Indigenous cultures, including base systems other than ten, and how different cultures have organized and represented numbers.",
      assessmentNotes: "☐ Student understands grouping by tens concept\n☐ Can represent numbers with tens and ones\n☐ Shows beginning place value understanding\n☐ Explains grouping reasoning\n☐ Applies concept to organize quantities"
    },
    {
      keywords: ["Number Games", "Counting Games"],
      mindsOn: "(8 minutes) Warm-up with favorite number games. Review game rules and mathematical thinking involved. Discuss how games help us learn numbers.",
      action: "(27 minutes) Play various number games that reinforce counting, number recognition, and number relationships. Students engage in mathematical thinking through play.",
      consolidation: "(10 minutes) Reflect on mathematical learning through games. Math journal about favorite number games and what they teach. Connect to family game experiences.",
      indigenousPerspectives: "Learn about traditional Indigenous games that involve mathematical thinking, including counting games, pattern games, and strategic thinking games passed down through generations.",
      assessmentNotes: "☐ Student engages positively in number games\n☐ Demonstrates number skills through play\n☐ Shows strategic mathematical thinking\n☐ Explains game strategies clearly\n☐ Applies learning from games to other contexts"
    },
    {
      keywords: ["Number Talks", "Math Talk"],
      mindsOn: "(8 minutes) Begin with a number talk routine - showing a quantity and discussing different ways to see it. Encourage multiple perspectives and mathematical discourse.",
      action: "(27 minutes) Engage in structured math conversations about numbers, strategies, and thinking. Students share reasoning, listen to others, and build on mathematical ideas together.",
      consolidation: "(10 minutes) Reflect on mathematical conversations and new ideas learned. Math journal about interesting ideas heard from classmates. Connect to importance of sharing ideas.",
      indigenousPerspectives: "Learn about traditional Indigenous practices of sharing knowledge through oral traditions, including how mathematical concepts were taught and preserved through community discussions.",
      assessmentNotes: "☐ Student participates in math discussions\n☐ Shares mathematical thinking clearly\n☐ Listens respectfully to others' ideas\n☐ Builds on classmates' contributions\n☐ Shows growth in mathematical communication"
    },
    {
      keywords: ["Assessment", "Problem Solving"],
      mindsOn: "(8 minutes) Warm-up with problem-solving strategies review. Discuss different ways to approach mathematical challenges. Build confidence for problem solving.",
      action: "(27 minutes) Apply number sense concepts to solve various problems. Students demonstrate understanding through different approaches and solutions to mathematical challenges.",
      consolidation: "(10 minutes) Celebrate mathematical growth and learning. Reflect on number sense journey and favorite discoveries. Connect learning to continued mathematical exploration.",
      indigenousPerspectives: "Reflect on Indigenous problem-solving approaches that integrate mathematical thinking with practical wisdom, community values, and holistic understanding of challenges and solutions.",
      assessmentNotes: "☐ Student applies number concepts to solve problems\n☐ Shows growth in mathematical understanding\n☐ Demonstrates number sense development\n☐ Explains problem-solving approaches\n☐ Shows confidence in mathematical thinking"
    }
  ];

  let updatedCount = 0;

  for (const lesson of lessons) {
    // Find the appropriate lesson update based on keywords in the title
    let lessonUpdate = lessonMappings.find(mapping => 
      mapping.keywords.some(keyword => lesson.title.includes(keyword))
    );

    // If no specific match found, use a general number sense approach
    if (!lessonUpdate) {
      lessonUpdate = {
        mindsOn: "(8 minutes) Number sense warm-up activity related to lesson focus. Engage students with concrete materials and discussion about number concepts.",
        action: "(27 minutes) Hands-on investigation of number sense concepts using manipulatives, games, and problem-solving activities. Students explore and develop mathematical understanding through active learning.",
        consolidation: "(10 minutes) Share discoveries and mathematical thinking. Math journal reflection on learning. Connect to real-world applications of number sense.",
        indigenousPerspectives: "Explore Indigenous mathematical knowledge and how traditional cultures have developed and shared number sense through daily practices, storytelling, and community activities.",
        assessmentNotes: "☐ Student demonstrates number sense understanding\n☐ Uses mathematical concepts appropriately\n☐ Shows growth in mathematical thinking\n☐ Explains reasoning clearly\n☐ Applies learning to new situations"
      };
    }

    try {
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: {
          duration: 45,
          mindsOn: lessonUpdate.mindsOn,
          action: lessonUpdate.action,
          consolidation: lessonUpdate.consolidation,
          differentiationStrategies: differentiation,
          indigenousPerspectives: lessonUpdate.indigenousPerspectives,
          assessmentNotes: lessonUpdate.assessmentNotes
        }
      });

      updatedCount++;
      console.log(`✅ Updated lesson ${updatedCount}: ${lesson.title}`);
    } catch (error) {
      console.error(`❌ Error updating lesson ${lesson.title}:`, error.message);
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} lessons in Making Sense of Numbers unit!`);
  console.log('All lessons now have:');
  console.log('- 45-minute duration (ETFO compliant)');
  console.log('- Explicit timing in mindsOn (8 min), action (27 min), consolidation (10 min)');
  console.log('- Comprehensive differentiation strategies for all learner types');
  console.log('- Meaningful Indigenous perspectives connecting math to traditional knowledge');
  console.log('- Observable assessment criteria with checkboxes');

  await prisma.$disconnect();
}

// Run the function
fixUnit2MakingSenseOfNumbers().catch(console.error);