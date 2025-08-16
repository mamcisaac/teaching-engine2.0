import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAllMathUnits() {
  try {
    console.log('🔢 Creating all Mathematics unit lessons...\n');
    
    // Find Emily
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.error('Emily not found!');
      return;
    }
    
    // Math units to create
    const mathUnits = [
      { title: 'Numbers All Around Us', lessonCount: 20 },
      { title: 'Making Sense of Numbers', lessonCount: 24 },
      { title: 'Patterns and Shapes', lessonCount: 24 },
      { title: 'Adding and Subtracting', lessonCount: 24 },
      { title: 'Mental Math Strategies', lessonCount: 24 },
      { title: 'Measurement Exploration', lessonCount: 24 },
      { title: 'Problem Solving Adventures', lessonCount: 24 },
      { title: 'Math Celebration', lessonCount: 24 }
    ];
    
    let totalCreated = 0;
    
    for (const unitInfo of mathUnits) {
      const unit = await prisma.unitPlan.findFirst({
        where: {
          userId: emily.id,
          title: unitInfo.title
        }
      });
      
      if (!unit) {
        console.log(`❌ Unit "${unitInfo.title}" not found`);
        continue;
      }
      
      console.log(`\n📐 Creating lessons for "${unitInfo.title}"...`);
      
      // Clear existing lessons
      await prisma.eTFOLessonPlanExpectation.deleteMany({
        where: {
          lessonPlan: {
            unitPlanId: unit.id
          }
        }
      });
      
      await prisma.eTFOLessonPlan.deleteMany({
        where: { unitPlanId: unit.id }
      });
      
      // Create lessons
      const lessons = [];
      const startDate = new Date(unit.startDate);
      
      for (let i = 0; i < unitInfo.lessonCount; i++) {
        const lessonDate = new Date(startDate);
        lessonDate.setDate(startDate.getDate() + Math.floor(i * 7 / 6));
        
        const lessonData = createMathLesson(unitInfo.title, i + 1, lessonDate, unit.id, emily.id);
        lessons.push(lessonData);
      }
      
      // Create all lessons in database
      for (const lesson of lessons) {
        await prisma.eTFOLessonPlan.create({ data: lesson });
      }
      
      totalCreated += lessons.length;
      console.log(`✅ Created ${lessons.length} lessons for "${unitInfo.title}"`);
    }
    
    console.log(`\n🎉 All Math units completed! Total lessons created: ${totalCreated}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function createMathLesson(unitTitle: string, lessonNum: number, date: Date, unitId: string, userId: number) {
  const content = getMathContent(unitTitle, lessonNum);
  
  return {
    title: content.title,
    date: date,
    duration: 45, // ETFO compliant
    subject: 'Mathématiques',
    unitPlanId: unitId,
    userId: userId,
    
    // ETFO Three-part structure
    mindsOn: `(8 minutes)
☐ Number talk warm-up
☐ Review previous math concepts
☐ Introduce today's problem: ${content.problem}
☐ Think-pair-share predictions
☐ Share learning goals clearly`,
    
    action: `(27 minutes)
Part 1 - Guided Math (10 minutes):
☐ Model the concept: ${content.concept}
☐ Use manipulatives and visuals
☐ Check understanding with thumbs up/down
☐ Introduce math vocabulary

Part 2 - Math Stations (12 minutes):
☐ Station 1: ${content.station1}
☐ Station 2: ${content.station2}
☐ Station 3: ${content.station3}
☐ Rotate every 4 minutes

Part 3 - Problem Solving (5 minutes):
☐ Apply learning to new problem
☐ Share strategies with partner
☐ Document thinking in math journal`,
    
    consolidation: `(10 minutes)
☐ Math congress circle
☐ Share different strategies
☐ Connect to real-world applications
☐ Self-assess understanding (fist-to-five)
☐ Preview tomorrow's challenge`,
    
    learningGoals: content.learningGoal,
    
    materials: [
      'Math manipulatives (counters, blocks, etc.)',
      'Whiteboards and markers',
      content.materials,
      'Math journals',
      'Number lines and charts',
      'Assessment checklist',
      'Station activity cards'
    ],
    
    assessmentNotes: `Formative Assessment:
☐ Number talk participation
☐ Strategy observation during stations
☐ Problem-solving approaches noted
☐ Math journal entries reviewed

Understanding Levels:
☐ Can demonstrate concept concretely (beginning)
☐ Can explain concept pictorially (developing)
☐ Can apply concept abstractly (proficient)
☐ Can extend concept creatively (extending)`,
    
    assessmentType: 'Formative - Observation and math journals',
    
    differentiationStrategies: {
      forStruggling: "Concrete manipulatives, smaller numbers, peer support, visual number lines, step-by-step guides, extra practice time",
      forIEP: "Modified number ranges, calculator support when appropriate, extended time, alternative representations, one-on-one guidance",
      forELL: "Visual math vocabulary cards, gesture support, native language resources, peer translation, concrete examples, picture problems",
      forAdvanced: "Extension problems, larger numbers, multi-step challenges, create own problems, teach others, explore patterns"
    },
    
    indigenousPerspectives: content.indigenousPerspective,
    
    accommodations: {
      visual: "Color-coded materials, large print numbers",
      auditory: "Verbal number stories, math songs",
      kinesthetic: "Movement-based counting, hands-on manipulation"
    },
    
    modifications: {
      content: "Adjusted number ranges as needed",
      process: "Alternative problem-solving methods accepted",
      product: "Various ways to show understanding"
    }
  };
}

function getMathContent(unitTitle: string, lessonNum: number) {
  switch(unitTitle) {
    case 'Numbers All Around Us':
      return getNumbersContent(lessonNum);
    case 'Making Sense of Numbers':
      return getMakingSenseContent(lessonNum);
    case 'Patterns and Shapes':
      return getPatternsShapesContent(lessonNum);
    case 'Adding and Subtracting':
      return getAddSubContent(lessonNum);
    case 'Mental Math Strategies':
      return getMentalMathContent(lessonNum);
    case 'Measurement Exploration':
      return getMeasurementContent(lessonNum);
    case 'Problem Solving Adventures':
      return getProblemSolvingContent(lessonNum);
    case 'Math Celebration':
      return getMathCelebrationContent(lessonNum);
    default:
      return getDefaultMathContent(lessonNum);
  }
}

function getNumbersContent(lessonNum: number) {
  const topics = [
    { title: 'Counting to 10', problem: 'How many ways can we count to 10?', 
      concept: 'number sequence and counting', station1: 'Counting bears', 
      station2: 'Number puzzles', station3: 'Number books',
      materials: 'Counting bears, number cards 1-10',
      learningGoal: 'Students will count to 10 forwards and backwards',
      indigenousPerspective: 'Mi\'kmaq traditionally counted using natural objects like shells, stones, and sticks. Numbers were sacred, especially 4 (seasons), 7 (sacred directions), and 13 (moon cycles). Learn counting through collecting and organizing natural materials as ancestors did.' },
    
    { title: 'Number Recognition 1-20', problem: 'Can you find numbers everywhere?',
      concept: 'identifying numerals in environment', station1: 'Number hunt',
      station2: 'Number matching', station3: 'Number formation',
      materials: 'Number cards, sandpaper numbers, playdough',
      learningGoal: 'Students will recognize and identify numbers 1-20',
      indigenousPerspective: 'Mi\'kmaq people used pictographic symbols before European numerals. They recorded quantities using notches on sticks, knots in cords, and marks on birchbark. Understanding different number systems helps us appreciate mathematical diversity across cultures.' },
    
    { title: 'Comparing Numbers', problem: 'Which group has more?',
      concept: 'more than, less than, equal to', station1: 'Compare collections',
      station2: 'Number balance', station3: 'Greater than game',
      materials: 'Balance scales, collection objects, comparison cards',
      learningGoal: 'Students will compare quantities using mathematical language',
      indigenousPerspective: 'Mi\'kmaq fishers and hunters needed to compare quantities for fair sharing within the community. Elders taught that equal distribution ensured everyone\'s wellbeing. Mathematical comparison was essential for maintaining harmony and balance in traditional life.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  const topic = topics[topicIndex];
  
  return {
    title: `Lesson ${lessonNum}: ${topic.title}`,
    problem: topic.problem,
    concept: topic.concept,
    station1: topic.station1,
    station2: topic.station2,
    station3: topic.station3,
    materials: topic.materials,
    learningGoal: topic.learningGoal,
    indigenousPerspective: topic.indigenousPerspective
  };
}

function getMakingSenseContent(lessonNum: number) {
  const topics = [
    { title: 'Place Value Basics', problem: 'What do the digits mean?',
      concept: 'tens and ones understanding', station1: 'Base-10 blocks',
      station2: 'Place value mats', station3: 'Number building',
      materials: 'Base-10 blocks, place value charts',
      learningGoal: 'Students will understand tens and ones in two-digit numbers',
      indigenousPerspective: 'Mi\'kmaq wampum belts used patterns where position mattered - beads in different positions told different parts of the story. Like place value, the position of each bead was as important as the bead itself in conveying meaning.' },
    
    { title: 'Skip Counting by 2s', problem: 'How can we count faster?',
      concept: 'counting by 2s pattern', station1: 'Partner counting',
      station2: 'Skip count hopscotch', station3: 'Even number patterns',
      materials: 'Number lines, hundreds chart, counting objects',
      learningGoal: 'Students will skip count by 2s to 20',
      indigenousPerspective: 'Mi\'kmaq beadwork often uses patterns of 2 - representing balance and partnerships in nature. Traditional drummers count beats in patterns of 2 and 4. Skip counting by 2s connects to these cultural rhythms and artistic traditions.' },
    
    { title: 'Number Bonds to 10', problem: 'How many ways to make 10?',
      concept: 'composing and decomposing 10', station1: 'Ten frames',
      station2: 'Number bond cards', station3: 'Make 10 game',
      materials: 'Ten frames, two-color counters, number cards',
      learningGoal: 'Students will find all number combinations that make 10',
      indigenousPerspective: 'The number 10 is significant in Mi\'kmaq culture - humans have 10 fingers for counting and creating. Traditional games often involved making groups of 10. This natural base-10 system connects mathematics to our physical bodies and cultural practices.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  return topics[topicIndex];
}

function getPatternsShapesContent(lessonNum: number) {
  const topics = [
    { title: 'Shape Hunt', problem: 'What shapes do you see around us?',
      concept: 'identifying 2D shapes', station1: 'Shape sorting',
      station2: 'Shape art creation', station3: 'Shape building',
      materials: 'Pattern blocks, shape cards, attribute blocks',
      learningGoal: 'Students will identify and describe 2D shapes',
      indigenousPerspective: 'Mi\'kmaq petroglyphs use geometric shapes to tell stories - circles for the sun and moon, triangles for mountains, spirals for life\'s journey. Each shape carries meaning. Traditional quillwork uses geometric patterns that teach mathematical concepts through art.' },
    
    { title: 'Growing Patterns', problem: 'What comes next in the pattern?',
      concept: 'extending and creating patterns', station1: 'Pattern blocks',
      station2: 'Movement patterns', station3: 'Sound patterns',
      materials: 'Pattern blocks, colored cubes, rhythm instruments',
      learningGoal: 'Students will identify, extend, and create patterns',
      indigenousPerspective: 'Mi\'kmaq basket weaving uses mathematical patterns passed down through generations. The patterns tell stories and have meanings - some patterns represent water waves, others represent mountains. Mathematics and storytelling are woven together in these traditional crafts.' },
    
    { title: '3D Shapes', problem: 'How are 3D shapes different from flat shapes?',
      concept: 'exploring 3D shape properties', station1: 'Shape building',
      station2: 'Shape prints', station3: 'Real object sorting',
      materials: '3D shape models, clay, real objects',
      learningGoal: 'Students will identify and describe 3D shapes',
      indigenousPerspective: 'Traditional Mi\'kmaq wigwams are cone-shaped for mathematical and practical reasons - the shape sheds rain, holds heat, and uses materials efficiently. Understanding 3D shapes helps us appreciate the mathematical wisdom in traditional architecture.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  return topics[topicIndex];
}

function getAddSubContent(lessonNum: number) {
  const topics = [
    { title: 'Addition Stories', problem: 'How can we show adding in a story?',
      concept: 'addition as combining', station1: 'Story problems',
      station2: 'Adding with manipulatives', station3: 'Number line jumps',
      materials: 'Story cards, counters, number lines',
      learningGoal: 'Students will solve addition problems within 20',
      indigenousPerspective: 'Mi\'kmaq stories often involve gathering and combining - collecting berries, combining materials for crafts, joining families for celebrations. Addition represents the power of coming together, a fundamental value in Mi\'kmaq culture where community strength comes from unity.' },
    
    { title: 'Subtraction as Taking Away', problem: 'What happens when we take some away?',
      concept: 'subtraction concepts', station1: 'Take away games',
      station2: 'Subtraction stories', station3: 'Counting backwards',
      materials: 'Counters, subtraction mats, story props',
      learningGoal: 'Students will solve subtraction problems within 20',
      indigenousPerspective: 'Traditional Mi\'kmaq practices of sharing meant dividing resources fairly - if you had 12 fish and gave 5 to elders, mathematical thinking helped ensure everyone was fed. Subtraction was part of the sacred responsibility of sharing within the community.' },
    
    { title: 'Fact Families', problem: 'How are addition and subtraction related?',
      concept: 'inverse operations', station1: 'Fact family houses',
      station2: 'Triangle cards', station3: 'Related facts game',
      materials: 'Fact family cards, triangle cards, counters',
      learningGoal: 'Students will understand the relationship between addition and subtraction',
      indigenousPerspective: 'Mi\'kmaq philosophy teaches that everything in nature has balance - day and night, summer and winter, giving and receiving. Addition and subtraction are mathematical expressions of this balance, showing how opposites work together to maintain harmony.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  return topics[topicIndex];
}

function getMentalMathContent(lessonNum: number) {
  const topics = [
    { title: 'Doubles Facts', problem: 'What happens when we double?',
      concept: 'doubles to 10+10', station1: 'Double dice games',
      station2: 'Mirror math', station3: 'Doubles in nature',
      materials: 'Dice, mirrors, nature cards',
      learningGoal: 'Students will quickly recall doubles facts',
      indigenousPerspective: 'Mi\'kmaq beadwork often uses doubling patterns for symmetry - what appears on one side mirrors the other. This mathematical doubling creates balance and beauty. Nature shows us doubles in butterfly wings, hands, and eyes, teaching that mathematics is embedded in creation.' },
    
    { title: 'Counting On Strategy', problem: 'How can we add without counting all?',
      concept: 'efficient addition strategy', station1: 'Counting on games',
      station2: 'Number line practice', station3: 'Mental math cards',
      materials: 'Number lines, dice, strategy cards',
      learningGoal: 'Students will use counting on strategy for addition',
      indigenousPerspective: 'Mi\'kmaq traders developed mental math strategies for trading - quickly calculating values without written numbers. These mental strategies were passed down through practice and games, showing that mathematical thinking doesn\'t always require writing.' },
    
    { title: 'Near Doubles', problem: 'How can doubles help with other facts?',
      concept: 'using doubles to solve near doubles', station1: 'Doubles plus one',
      station2: 'Near doubles cards', station3: 'Strategy sharing',
      materials: 'Doubles cards, counters, strategy posters',
      learningGoal: 'Students will use doubles to solve near doubles',
      indigenousPerspective: 'Traditional Mi\'kmaq games taught mathematical strategies through play. Children learned to see patterns and relationships between numbers naturally. Near doubles strategy mirrors how elders taught - building new knowledge on what\'s already known.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  return topics[topicIndex];
}

function getMeasurementContent(lessonNum: number) {
  const topics = [
    { title: 'Measuring Length', problem: 'How long is it?',
      concept: 'non-standard measurement', station1: 'Measuring with cubes',
      station2: 'Comparison station', station3: 'Measurement hunt',
      materials: 'Unifix cubes, paperclips, measuring cards',
      learningGoal: 'Students will measure length using non-standard units',
      indigenousPerspective: 'Mi\'kmaq people measured using body parts - hand spans, arm lengths, and paces. These personal units of measurement connected mathematics to the human body. Different sized people had different measurements, teaching that perspective matters in mathematics.' },
    
    { title: 'Exploring Mass', problem: 'Which is heavier?',
      concept: 'comparing mass', station1: 'Balance scales',
      station2: 'Hefting station', station3: 'Order by weight',
      materials: 'Balance scales, various objects, sorting mats',
      learningGoal: 'Students will compare and order objects by mass',
      indigenousPerspective: 'Mi\'kmaq canoe builders understood mass distribution intuitively - where to place loads for balance and stability. This practical mathematics ensured safe water travel. Understanding mass wasn\'t abstract but connected to survival and daily life.' },
    
    { title: 'Time and Seasons', problem: 'How do we measure time?',
      concept: 'understanding time cycles', station1: 'Daily schedule',
      station2: 'Season wheel', station3: 'Clock exploration',
      materials: 'Clocks, schedule cards, season pictures',
      learningGoal: 'Students will understand time concepts and cycles',
      indigenousPerspective: 'Mi\'kmaq people marked time by natural cycles - moon phases, seasonal changes, and daily sun movement. Thirteen moons made a year, each with its own name and meaning. Time was circular, not linear, teaching us different ways to understand mathematical concepts.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  return topics[topicIndex];
}

function getProblemSolvingContent(lessonNum: number) {
  const topics = [
    { title: 'Working Backwards', problem: 'Can you solve it backwards?',
      concept: 'reverse thinking strategy', station1: 'Mystery number',
      station2: 'Backwards stories', station3: 'Undo operations',
      materials: 'Problem cards, number lines, manipulatives',
      learningGoal: 'Students will solve problems by working backwards',
      indigenousPerspective: 'Mi\'kmaq trackers could work backwards from animal signs to understand what happened. This reverse thinking - seeing the end and figuring out the beginning - is a powerful problem-solving strategy used in hunting, navigation, and storytelling traditions.' },
    
    { title: 'Guess and Check', problem: 'What\'s a good first guess?',
      concept: 'systematic guessing strategy', station1: 'Number mysteries',
      station2: 'Estimation jars', station3: 'Strategy games',
      materials: 'Estimation materials, mystery boxes, game boards',
      learningGoal: 'Students will use guess and check strategy systematically',
      indigenousPerspective: 'Mi\'kmaq fishers estimated fish populations and adjusted their methods based on observations. This guess-check-revise approach ensured sustainable harvesting. Mathematical estimation connected to environmental stewardship and community responsibility.' },
    
    { title: 'Look for Patterns', problem: 'What pattern helps solve this?',
      concept: 'pattern recognition in problems', station1: 'Pattern puzzles',
      station2: 'Number patterns', station3: 'Strategy sharing',
      materials: 'Pattern cards, hundreds chart, puzzle materials',
      learningGoal: 'Students will identify patterns to solve problems',
      indigenousPerspective: 'Mi\'kmaq people observed patterns in nature to predict weather, animal behavior, and seasonal changes. Pattern recognition was survival mathematics. These observation skills show that mathematics is about seeing relationships and making predictions.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  return topics[topicIndex];
}

function getMathCelebrationContent(lessonNum: number) {
  const topics = [
    { title: 'Math Games Day', problem: 'Which math game is your favorite?',
      concept: 'applying skills through games', station1: 'Board games',
      station2: 'Card games', station3: 'Active math games',
      materials: 'Various math games, cards, dice',
      learningGoal: 'Students will apply math skills in game contexts',
      indigenousPerspective: 'Traditional Mi\'kmaq games like Waltes taught probability, counting, and strategy. Games were how mathematical concepts were passed down through generations. Learning through play is an ancient and effective way to understand mathematics.' },
    
    { title: 'Math in Our World', problem: 'Where do we use math every day?',
      concept: 'real-world connections', station1: 'Store center',
      station2: 'Building center', station3: 'Art math center',
      materials: 'Play money, blocks, art supplies',
      learningGoal: 'Students will identify math in everyday situations',
      indigenousPerspective: 'Mi\'kmaq life was full of mathematics - calculating tides for fishing, measuring materials for wigwams, counting days between ceremonies. Math wasn\'t separate from life but woven through every activity. This holistic view helps us see mathematics everywhere.' },
    
    { title: 'Math Showcase', problem: 'How have you grown as a mathematician?',
      concept: 'reflecting on learning', station1: 'Portfolio review',
      station2: 'Teaching station', station3: 'Creation station',
      materials: 'Portfolios, presentation materials, creation supplies',
      learningGoal: 'Students will demonstrate and celebrate their math learning',
      indigenousPerspective: 'Mi\'kmaq celebrations honor growth and learning with ceremonies marking important transitions. Celebrating mathematical growth acknowledges that learning is a journey worth honoring. Every student\'s mathematical journey is unique and valuable to the community.' }
  ];
  
  const topicIndex = (lessonNum - 1) % topics.length;
  return topics[topicIndex];
}

function getDefaultMathContent(lessonNum: number) {
  return {
    title: `Math Lesson ${lessonNum}`,
    problem: 'What mathematical challenge will we explore?',
    concept: 'mathematical thinking',
    station1: 'Hands-on exploration',
    station2: 'Problem solving',
    station3: 'Math games',
    materials: 'Various math manipulatives',
    learningGoal: 'Students will develop mathematical thinking skills',
    indigenousPerspective: 'Mathematics is universal yet culturally expressed. Mi\'kmaq mathematical knowledge includes counting systems, geometric patterns, measurement methods, and problem-solving strategies developed over thousands of years. Honoring diverse mathematical traditions enriches our understanding.'
  };
}

createAllMathUnits();