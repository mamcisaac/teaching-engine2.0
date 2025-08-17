const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUnits4To8Comprehensive() {
  console.log('🔧 Fixing Units 4-8: Adding and Subtracting, Mental Math Strategies, Measurement Exploration, Problem Solving Adventures, Math Celebration...\n');

  const units = [
    'Adding and Subtracting',
    'Mental Math Strategies', 
    'Measurement Exploration',
    'Problem Solving Adventures',
    'Math Celebration'
  ];

  const differentiationsByUnit = {
    'Adding and Subtracting': {
      forStruggling: "Concrete manipulatives for addition/subtraction, visual number lines, simplified number ranges (0-5), peer support for operations",
      forIEP: "Modified expectations per IEP, adaptive counting tools, extended time for calculations, alternative recording methods for operations",
      forELL: "Bilingual operation vocabulary, visual operation symbols, peer translation for word problems, number songs for operations",
      forAdvanced: "Larger number operations, multi-step problems, creating own word problems, peer tutoring for operation strategies"
    },
    'Mental Math Strategies': {
      forStruggling: "Concrete strategy tools, simplified number combinations, visual thinking maps, peer support for mental calculations",
      forIEP: "Modified expectations per IEP, adaptive mental math tools, extended time for thinking, alternative strategy demonstrations",
      forELL: "Bilingual strategy vocabulary, visual strategy charts, peer translation for mental math language, thinking aloud in home language",
      forAdvanced: "Complex mental math challenges, multiple strategy comparisons, creating strategy explanations, peer tutoring for efficiency"
    },
    'Measurement Exploration': {
      forStruggling: "Concrete measurement tools, simplified measurement tasks, visual measurement guides, peer support for measuring",
      forIEP: "Modified expectations per IEP, adaptive measurement tools, extended time for measuring, alternative recording for measurements",
      forELL: "Bilingual measurement vocabulary, visual measurement instructions, peer translation for measurement language, familiar measurement objects",
      forAdvanced: "Complex measurement challenges, multiple unit comparisons, measurement estimation games, peer tutoring for measurement concepts"
    },
    'Problem Solving Adventures': {
      forStruggling: "Visual problem-solving aids, simplified problem contexts, concrete problem models, peer support for problem solving",
      forIEP: "Modified expectations per IEP, adaptive problem tools, extended time for problems, alternative problem representations",
      forELL: "Bilingual problem vocabulary, visual problem contexts, peer translation for problem language, culturally relevant problems",
      forAdvanced: "Complex multi-step problems, open-ended challenges, creating own problems, peer tutoring for problem strategies"
    },
    'Math Celebration': {
      forStruggling: "Celebration of personal growth, visual portfolio organization, simplified reflection prompts, peer support for sharing",
      forIEP: "Modified expectations per IEP, adaptive celebration formats, extended time for reflection, alternative sharing methods",
      forELL: "Bilingual celebration vocabulary, visual reflection supports, peer translation for sharing, culturally inclusive celebrations",
      forAdvanced: "Leadership roles in celebration, complex reflection questions, mentoring others, advanced portfolio presentations"
    }
  };

  const lessonMappingsByUnit = {
    'Adding and Subtracting': [
      {
        keywords: ["Addition Stories"],
        mindsOn: "(8 minutes) Addition story warm-up with simple scenarios. Act out stories involving combining groups. Discuss how addition helps us understand 'putting together.'",
        action: "(27 minutes) Create and solve addition stories using manipulatives and drawings. Students explore joining situations and develop understanding of addition concepts.",
        consolidation: "(10 minutes) Share favorite addition stories created. Math journal reflection on when we use addition. Connect to combining and joining in daily life.",
        indigenousPerspectives: "Learn about traditional Indigenous practices of gathering and combining resources, exploring how communities have historically used addition concepts in daily life and celebrations.",
        assessmentNotes: "☐ Student creates meaningful addition stories\n☐ Uses addition concepts correctly in context\n☐ Explains addition thinking clearly\n☐ Shows understanding of combining/joining\n☐ Connects addition to real experiences"
      },
      {
        keywords: ["Subtraction Stories"],
        mindsOn: "(8 minutes) Subtraction story warm-up with take-away scenarios. Act out stories involving removing objects. Discuss how subtraction helps us understand 'taking away.'",
        action: "(27 minutes) Create and solve subtraction stories using manipulatives and drawings. Students explore take-away and comparison situations in subtraction.",
        consolidation: "(10 minutes) Share creative subtraction stories. Math journal reflection on when we use subtraction. Connect to removing and comparing in daily life.",
        indigenousPerspectives: "Explore traditional Indigenous concepts of sharing and taking only what is needed, learning how subtraction relates to sustainable practices and community sharing.",
        assessmentNotes: "☐ Student creates meaningful subtraction stories\n☐ Uses subtraction concepts correctly\n☐ Explains subtraction thinking clearly\n☐ Shows understanding of take-away/comparison\n☐ Connects subtraction to real experiences"
      },
      {
        keywords: ["Combining Groups", "Using Manipulatives"],
        mindsOn: "(8 minutes) Manipulative exploration warm-up with various counting materials. Practice combining groups and observing results. Discuss how manipulatives help thinking.",
        action: "(27 minutes) Use manipulatives to explore addition and subtraction concepts. Students work with concrete materials to build understanding of operations.",
        consolidation: "(10 minutes) Share discoveries with manipulatives. Math journal reflection on how manipulatives help learning. Connect to hands-on learning benefits.",
        indigenousPerspectives: "Learn about traditional Indigenous tools and objects used for counting and calculation, exploring how hands-on materials have always supported mathematical learning.",
        assessmentNotes: "☐ Student uses manipulatives effectively\n☐ Shows understanding through concrete work\n☐ Explains manipulative strategies\n☐ Demonstrates operation concepts\n☐ Connects concrete work to abstract thinking"
      },
      {
        keywords: ["Taking Away", "Number Line"],
        mindsOn: "(8 minutes) Number line warm-up with movement and position. Practice moving forward (addition) and backward (subtraction) on floor number lines.",
        action: "(27 minutes) Use number lines to model addition and subtraction operations. Students develop understanding of operations through linear representations.",
        consolidation: "(10 minutes) Share number line strategy discoveries. Math journal reflection on how number lines help with operations. Connect to movement and position in space.",
        indigenousPerspectives: "Explore how Indigenous peoples have traditionally used linear thinking for tracking journeys, seasonal changes, and resource management, connecting to number line concepts.",
        assessmentNotes: "☐ Student uses number lines accurately for operations\n☐ Shows understanding of forward/backward movement\n☐ Explains number line strategies\n☐ Demonstrates operation concepts on lines\n☐ Connects position to mathematical operations"
      }
    ],
    'Mental Math Strategies': [
      {
        keywords: ["Counting Strategies", "Counting On", "Counting Back"],
        mindsOn: "(8 minutes) Counting strategy warm-up with various starting points. Practice counting on and counting back from different numbers. Discuss efficient counting.",
        action: "(27 minutes) Develop counting strategies for mental calculation. Students practice counting on for addition and counting back for subtraction.",
        consolidation: "(10 minutes) Share effective counting strategies. Math journal reflection on favorite counting methods. Connect to mental math efficiency.",
        indigenousPerspectives: "Learn about traditional Indigenous counting methods and how mental calculation skills were developed and shared within communities for practical applications.",
        assessmentNotes: "☐ Student uses efficient counting strategies\n☐ Can count on and count back accurately\n☐ Explains counting reasoning\n☐ Shows mental math development\n☐ Applies strategies flexibly"
      },
      {
        keywords: ["Quick Recall", "Quick Images"],
        mindsOn: "(8 minutes) Quick image warm-up with dot patterns and number combinations. Practice seeing and remembering number relationships quickly.",
        action: "(27 minutes) Develop quick recall of number facts through visual patterns and practice. Students build automaticity with basic number combinations.",
        consolidation: "(10 minutes) Celebrate quick recall growth and progress. Math journal reflection on improving speed and accuracy. Connect to mathematical fluency benefits.",
        indigenousPerspectives: "Explore how Indigenous cultures developed quick mental calculation skills for trade, resource management, and daily decision-making, valuing mathematical fluency.",
        assessmentNotes: "☐ Student shows improving quick recall\n☐ Recognizes number patterns rapidly\n☐ Demonstrates growing automaticity\n☐ Shows confidence in mental calculations\n☐ Applies quick recall in problem solving"
      },
      {
        keywords: ["Number Combinations", "Double Facts", "Doubles Facts"],
        mindsOn: "(8 minutes) Number combination warm-up focusing on doubles and near-doubles. Explore special number relationships and patterns.",
        action: "(27 minutes) Investigate number combinations and doubles facts as mental math strategies. Students develop understanding of useful number relationships.",
        consolidation: "(10 minutes) Share favorite number combination discoveries. Math journal reflection on useful number patterns. Connect to mental math strategy building.",
        indigenousPerspectives: "Learn about pattern recognition in Indigenous mathematical thinking, including how special number relationships were recognized and used in traditional calculations.",
        assessmentNotes: "☐ Student identifies useful number combinations\n☐ Uses doubles facts effectively\n☐ Explains number relationship thinking\n☐ Shows strategic mental math development\n☐ Applies combinations to solve problems"
      },
      {
        keywords: ["Estimation Games"],
        mindsOn: "(8 minutes) Estimation warm-up with various quantities and scenarios. Practice making reasonable guesses and checking results.",
        action: "(27 minutes) Play estimation games that develop number sense and mental math skills. Students practice making and refining estimates.",
        consolidation: "(10 minutes) Reflect on estimation strategies and improvements. Math journal about estimation experiences. Connect to real-world estimation needs.",
        indigenousPerspectives: "Explore traditional Indigenous estimation skills used in hunting, gathering, and resource management, understanding estimation as practical mathematical wisdom.",
        assessmentNotes: "☐ Student makes reasonable estimates\n☐ Shows developing number sense\n☐ Explains estimation reasoning\n☐ Improves estimates with practice\n☐ Applies estimation to practical situations"
      }
    ],
    'Measurement Exploration': [
      {
        keywords: ["Length Comparison", "Height Measurement"],
        mindsOn: "(8 minutes) Length comparison warm-up with classroom objects. Compare heights, lengths, and distances. Discuss measurement vocabulary.",
        action: "(27 minutes) Explore length and height measurement using various tools and methods. Students compare and measure objects in their environment.",
        consolidation: "(10 minutes) Share interesting measurement discoveries. Math journal reflection on measurement experiences. Connect to practical measurement needs.",
        indigenousPerspectives: "Learn about traditional Indigenous measurement methods using body parts and natural objects, understanding measurement as practical knowledge for construction and travel.",
        assessmentNotes: "☐ Student compares lengths accurately\n☐ Uses measurement vocabulary correctly\n☐ Shows understanding of measurement concepts\n☐ Explains measurement reasoning\n☐ Applies measurement to practical situations"
      },
      {
        keywords: ["Non-Standard Units"],
        mindsOn: "(8 minutes) Non-standard unit warm-up using paperclips, cubes, or hands to measure objects. Explore creative measurement tools.",
        action: "(27 minutes) Measure various objects using non-standard units. Students explore measurement concepts before formal units.",
        consolidation: "(10 minutes) Share creative measurement experiences. Math journal reflection on measurement discoveries. Connect to measurement tool flexibility.",
        indigenousPerspectives: "Explore how Indigenous peoples traditionally used natural and available objects for measurement, developing sophisticated measurement systems from environmental resources.",
        assessmentNotes: "☐ Student uses non-standard units effectively\n☐ Understands measurement unit concepts\n☐ Shows measurement reasoning\n☐ Compares measurements accurately\n☐ Explains measurement choices"
      },
      {
        keywords: ["Weight", "Capacity"],
        mindsOn: "(8 minutes) Weight and capacity warm-up with hands-on exploration. Compare heavy/light objects and full/empty containers.",
        action: "(27 minutes) Investigate weight and capacity through hands-on exploration and comparison. Students develop understanding of mass and volume concepts.",
        consolidation: "(10 minutes) Share weight and capacity discoveries. Math journal reflection on measurement attributes. Connect to cooking and daily measurement needs.",
        indigenousPerspectives: "Learn about traditional Indigenous methods for measuring weight and capacity for food preparation, trade, and resource management, using natural measurement systems.",
        assessmentNotes: "☐ Student compares weights accurately\n☐ Understands capacity concepts\n☐ Uses measurement vocabulary\n☐ Shows measurement reasoning\n☐ Applies concepts to real situations"
      },
      {
        keywords: ["Time"],
        mindsOn: "(8 minutes) Time concept warm-up with daily routines and sequences. Discuss morning, afternoon, evening, and time order.",
        action: "(27 minutes) Explore time concepts through daily schedules, sequencing, and basic clock reading. Students develop temporal understanding.",
        consolidation: "(10 minutes) Share time discoveries and daily time awareness. Math journal reflection on time in daily life. Connect to scheduling and routines.",
        indigenousPerspectives: "Explore traditional Indigenous time concepts based on natural cycles, seasons, and celestial observations, understanding time through environmental connections.",
        assessmentNotes: "☐ Student understands basic time concepts\n☐ Can sequence daily events\n☐ Shows time awareness\n☐ Explains time reasoning\n☐ Connects time to daily routines"
      }
    ],
    'Problem Solving Adventures': [
      {
        keywords: ["Story Problems", "Understanding Problems"],
        mindsOn: "(8 minutes) Problem-solving warm-up with simple story scenarios. Practice listening to problems and identifying key information.",
        action: "(27 minutes) Work with story problems using various strategies and representations. Students develop problem-solving skills and mathematical reasoning.",
        consolidation: "(10 minutes) Share problem-solving strategies and successes. Math journal reflection on problem-solving approaches. Connect to real-world problem solving.",
        indigenousPerspectives: "Learn about traditional Indigenous problem-solving approaches that integrate practical wisdom, community knowledge, and mathematical thinking to address challenges.",
        assessmentNotes: "☐ Student understands problem contexts\n☐ Identifies key problem information\n☐ Uses appropriate problem-solving strategies\n☐ Explains problem-solving reasoning\n☐ Applies strategies to new problems"
      },
      {
        keywords: ["Logic Puzzles", "Number Mysteries"],
        mindsOn: "(8 minutes) Logic puzzle warm-up with simple brain teasers and number games. Engage mathematical thinking and reasoning skills.",
        action: "(27 minutes) Solve logic puzzles and number mysteries using systematic thinking. Students develop logical reasoning and mathematical investigation skills.",
        consolidation: "(10 minutes) Share puzzle-solving strategies and discoveries. Math journal reflection on logical thinking. Connect to analytical problem solving.",
        indigenousPerspectives: "Explore traditional Indigenous puzzle-solving and strategic thinking found in games, riddles, and community decision-making processes.",
        assessmentNotes: "☐ Student engages with logic puzzles\n☐ Shows systematic thinking\n☐ Uses logical reasoning\n☐ Explains puzzle-solving strategies\n☐ Perseveres with challenging problems"
      },
      {
        keywords: ["Problem Strategies", "Draw a Picture", "Act It Out", "Make a Table"],
        mindsOn: "(8 minutes) Problem strategy warm-up introducing different approaches to problem solving. Model and practice various problem-solving methods.",
        action: "(27 minutes) Apply specific problem-solving strategies to various mathematical challenges. Students learn and practice systematic problem-solving approaches.",
        consolidation: "(10 minutes) Reflect on strategy effectiveness and preferences. Math journal about favorite problem-solving strategies. Connect to strategy selection skills.",
        indigenousPerspectives: "Learn about traditional Indigenous approaches to solving practical problems, including how communities developed systematic methods for addressing challenges.",
        assessmentNotes: "☐ Student uses appropriate problem-solving strategies\n☐ Can draw pictures to solve problems\n☐ Acts out problem scenarios effectively\n☐ Shows strategy selection skills\n☐ Explains strategy reasoning"
      },
      {
        keywords: ["Real-Life Challenges", "Pattern Problems"],
        mindsOn: "(8 minutes) Real-world problem warm-up with situations from daily life. Connect mathematics to authentic contexts and practical applications.",
        action: "(27 minutes) Solve real-life mathematical challenges using various strategies and approaches. Students see mathematics as useful and relevant.",
        consolidation: "(10 minutes) Share real-world problem solutions and connections. Math journal reflection on mathematics in daily life. Connect to practical applications.",
        indigenousPerspectives: "Explore how Indigenous communities have traditionally solved practical mathematical challenges related to navigation, resource management, and community planning.",
        assessmentNotes: "☐ Student connects math to real situations\n☐ Solves practical problems effectively\n☐ Shows mathematical application skills\n☐ Explains real-world connections\n☐ Demonstrates mathematical relevance understanding"
      }
    ],
    'Math Celebration': [
      {
        keywords: ["Portfolio Review", "Math Growth"],
        mindsOn: "(8 minutes) Portfolio reflection warm-up looking at mathematical growth and learning journey. Celebrate progress and development.",
        action: "(27 minutes) Review and organize mathematical work, reflecting on growth and favorite learning experiences. Students celebrate their mathematical journey.",
        consolidation: "(10 minutes) Share growth celebrations and proud moments. Math journal reflection on mathematical development. Connect to continued learning.",
        indigenousPerspectives: "Learn about traditional Indigenous practices of honoring growth, celebrating learning, and recognizing the development of skills and knowledge within communities.",
        assessmentNotes: "☐ Student reflects on mathematical growth\n☐ Shows pride in mathematical development\n☐ Identifies learning progress\n☐ Explains mathematical journey\n☐ Sets goals for continued learning"
      },
      {
        keywords: ["Favorite Math Games", "Math Games Day"],
        mindsOn: "(8 minutes) Math games celebration warm-up with favorite mathematical games and activities. Enjoy the playful side of mathematics.",
        action: "(27 minutes) Play and celebrate favorite mathematical games, sharing strategies and enjoying mathematical thinking through play.",
        consolidation: "(10 minutes) Reflect on mathematical learning through games. Math journal about favorite math games and what they teach. Connect play to learning.",
        indigenousPerspectives: "Celebrate traditional Indigenous games that involve mathematical thinking, recognizing how play and games have always been part of mathematical learning.",
        assessmentNotes: "☐ Student engages positively in math games\n☐ Shows mathematical thinking through play\n☐ Explains game strategies\n☐ Demonstrates mathematical concepts through games\n☐ Connects play to mathematical learning"
      },
      {
        keywords: ["Math Art", "Art Creations"],
        mindsOn: "(8 minutes) Math art celebration warm-up exploring the beauty of mathematics in art and design. Appreciate mathematical creativity.",
        action: "(27 minutes) Create and celebrate mathematical art, exploring how mathematics and creativity connect through artistic expression.",
        consolidation: "(10 minutes) Gallery walk and art appreciation. Math journal reflection on mathematics as creative expression. Connect math to artistic beauty.",
        indigenousPerspectives: "Celebrate traditional Indigenous art forms that incorporate mathematical principles, recognizing the deep connections between mathematics, culture, and artistic expression.",
        assessmentNotes: "☐ Student creates mathematical art\n☐ Shows creativity with mathematical concepts\n☐ Appreciates mathematical beauty\n☐ Explains math-art connections\n☐ Demonstrates mathematical expression"
      },
      {
        keywords: ["Problem-Solving Showcase", "Favorite Strategies"],
        mindsOn: "(8 minutes) Problem-solving celebration warm-up showcasing favorite strategies and approaches. Honor mathematical thinking and reasoning.",
        action: "(27 minutes) Showcase and celebrate problem-solving growth, sharing strategies and mathematical thinking developed throughout the year.",
        consolidation: "(10 minutes) Celebrate mathematical thinking and problem-solving development. Math journal reflection on mathematical growth. Connect to future learning.",
        indigenousPerspectives: "Honor traditional Indigenous problem-solving wisdom and celebrate how mathematical thinking contributes to community well-being and practical decision-making.",
        assessmentNotes: "☐ Student showcases problem-solving growth\n☐ Explains mathematical strategies clearly\n☐ Shows confidence in mathematical thinking\n☐ Demonstrates mathematical reasoning\n☐ Celebrates mathematical development"
      }
    ]
  };

  let totalUpdated = 0;

  for (const unitTitle of units) {
    console.log(`\n🔧 Processing ${unitTitle}...`);
    
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: 23,
        subject: 'Mathématiques',
        unitPlan: {
          title: unitTitle
        }
      },
      orderBy: { date: 'asc' }
    });

    console.log(`Found ${lessons.length} lessons in ${unitTitle}`);

    const differentiation = differentiationsByUnit[unitTitle];
    const lessonMappings = lessonMappingsByUnit[unitTitle];

    let unitUpdated = 0;

    for (const lesson of lessons) {
      // Find the appropriate lesson update based on keywords in the title
      let lessonUpdate = lessonMappings.find(mapping => 
        mapping.keywords.some(keyword => lesson.title.includes(keyword))
      );

      // If no specific match found, use a general approach for this unit
      if (!lessonUpdate) {
        lessonUpdate = {
          mindsOn: `(8 minutes) ${unitTitle} warm-up activity related to lesson focus. Engage students with concrete materials and exploration of mathematical concepts.`,
          action: `(27 minutes) Hands-on investigation of ${unitTitle.toLowerCase()} concepts using manipulatives, games, and problem-solving activities. Students explore mathematical relationships through active learning.`,
          consolidation: `(10 minutes) Share mathematical discoveries and thinking. Math journal reflection on ${unitTitle.toLowerCase()} learning. Connect to real-world applications.`,
          indigenousPerspectives: `Explore Indigenous mathematical knowledge related to ${unitTitle.toLowerCase()} and how traditional cultures have developed and shared understanding through daily practices, storytelling, and community activities.`,
          assessmentNotes: `☐ Student demonstrates mathematical understanding\n☐ Uses concepts appropriately\n☐ Shows growth in mathematical thinking\n☐ Explains reasoning clearly\n☐ Applies learning to new situations`
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

        unitUpdated++;
        totalUpdated++;
        console.log(`✅ Updated lesson ${unitUpdated}: ${lesson.title}`);
      } catch (error) {
        console.error(`❌ Error updating lesson ${lesson.title}:`, error.message);
      }
    }

    console.log(`✅ Completed ${unitTitle}: ${unitUpdated} lessons updated`);
  }

  console.log(`\n🎉 Successfully updated ${totalUpdated} lessons across Units 4-8!`);
  console.log('All lessons now have:');
  console.log('- 45-minute duration (ETFO compliant)');
  console.log('- Explicit timing in mindsOn (8 min), action (27 min), consolidation (10 min)');
  console.log('- Comprehensive differentiation strategies for all learner types');
  console.log('- Meaningful Indigenous perspectives connecting math to traditional knowledge');
  console.log('- Observable assessment criteria with checkboxes');

  await prisma.$disconnect();
}

// Run the function
fixUnits4To8Comprehensive().catch(console.error);