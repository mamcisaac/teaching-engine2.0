import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function generateMissingLessons() {
  console.log('Generating missing French and Math lessons...\n');
  
  // Get Emily's ID
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  // Get French units
  const frenchUnits = await prisma.unitPlan.findMany({
    where: {
      userId: emily.id,
      longRangePlan: {
        subject: 'Français (Immersion)'
      }
    },
    include: {
      longRangePlan: true,
      _count: {
        select: { lessonPlans: true }
      }
    },
    orderBy: { startDate: 'asc' }
  });
  
  // Generate 23 French review/practice lessons
  const frenchLessons = [
    // September unit additions
    {
      title: "French Morning Routine Practice",
      titleFr: "Pratique de la routine du matin",
      mindsOn: "Circle time: Practice morning greetings and calendar vocabulary in French",
      action: "Interactive activities: Students practice daily routines using French vocabulary cards and role-play",
      consolidation: "Reflection: Students share one new French word they used today",
      learningGoals: "Students will use French vocabulary for daily classroom routines",
      materials: ["Routine cards", "Calendar", "French vocabulary posters"],
      accommodations: ["Visual supports", "Peer partners", "Simplified vocabulary"],
      unitIndex: 0
    },
    {
      title: "French Number Review 1-10",
      titleFr: "Révision des nombres 1-10",
      mindsOn: "Number song: Sing French number song with movements",
      action: "Number games: Play number bingo and counting activities in French",
      consolidation: "Exit ticket: Students count objects and say numbers in French",
      learningGoals: "Students will count to 10 in French with confidence",
      materials: ["Number cards", "Counting objects", "Bingo cards"],
      accommodations: ["Number line support", "Manipulatives", "Partner support"],
      unitIndex: 0
    },
    {
      title: "French Color Recognition",
      titleFr: "Reconnaissance des couleurs",
      mindsOn: "Color hunt: Find objects of different colors in the classroom",
      action: "Art activity: Create a French color book with labels",
      consolidation: "Gallery walk: Share color books using French vocabulary",
      learningGoals: "Students will identify and name colors in French",
      materials: ["Color cards", "Art supplies", "French color posters"],
      accommodations: ["Color-coded supports", "Peer assistance", "Visual cues"],
      unitIndex: 1
    },
    // October unit additions
    {
      title: "Family Vocabulary Practice",
      titleFr: "Pratique du vocabulaire familial",
      mindsOn: "Family photos: Share family photos and practice vocabulary",
      action: "Create family trees with French labels for family members",
      consolidation: "Partner share: Describe families using French vocabulary",
      learningGoals: "Students will use French vocabulary to describe their families",
      materials: ["Family photos", "Tree templates", "Vocabulary cards"],
      accommodations: ["Picture supports", "Sentence starters", "Small groups"],
      unitIndex: 1
    },
    {
      title: "French Action Words",
      titleFr: "Verbes d'action",
      mindsOn: "Simon Says: Play Jacques Dit with action verbs",
      action: "Movement stations: Practice action verbs through activities",
      consolidation: "Charades: Act out and guess action words in French",
      learningGoals: "Students will use common French action verbs",
      materials: ["Action cards", "Movement props", "Verb posters"],
      accommodations: ["Visual demonstrations", "Modified movements", "Partner support"],
      unitIndex: 1
    },
    // November unit additions
    {
      title: "French Story Comprehension",
      titleFr: "Compréhension d'histoires",
      mindsOn: "Picture walk: Preview story using images",
      action: "Interactive read-aloud with comprehension checks",
      consolidation: "Story retell using simple French sentences",
      learningGoals: "Students will understand simple French stories",
      materials: ["French picture books", "Story props", "Comprehension cards"],
      accommodations: ["Visual supports", "Simplified text", "Small group reading"],
      unitIndex: 2
    },
    {
      title: "French Question Words",
      titleFr: "Mots interrogatifs",
      mindsOn: "Mystery box: Use question words to guess contents",
      action: "Question game: Practice asking and answering simple questions",
      consolidation: "Create class question book",
      learningGoals: "Students will use basic French question words",
      materials: ["Mystery box", "Question cards", "Class book materials"],
      accommodations: ["Question frames", "Visual cues", "Partner practice"],
      unitIndex: 2
    },
    // December unit additions
    {
      title: "Holiday Vocabulary Review",
      titleFr: "Révision du vocabulaire des fêtes",
      mindsOn: "Holiday traditions: Share family holiday traditions",
      action: "Create holiday cards with French greetings",
      consolidation: "Card exchange with French holiday wishes",
      learningGoals: "Students will use French holiday vocabulary",
      materials: ["Card materials", "Holiday vocabulary", "Decorating supplies"],
      accommodations: ["Word banks", "Templates", "Peer support"],
      unitIndex: 3
    },
    {
      title: "Winter Clothing in French",
      titleFr: "Vêtements d'hiver",
      mindsOn: "Dress-up relay: Name winter clothing items",
      action: "Paper doll activity: Dress for winter with French labels",
      consolidation: "Fashion show: Describe winter outfits in French",
      learningGoals: "Students will name winter clothing in French",
      materials: ["Clothing items", "Paper dolls", "Labels"],
      accommodations: ["Picture cards", "Simplified vocabulary", "Demonstrations"],
      unitIndex: 3
    },
    // January unit additions
    {
      title: "French Writing Practice - Letters",
      titleFr: "Pratique d'écriture - Lettres",
      mindsOn: "Air writing: Practice letter formation in the air",
      action: "Writing centers: Practice French letters and simple words",
      consolidation: "Share writing: Show one word written in French",
      learningGoals: "Students will write French letters and simple words",
      materials: ["Writing materials", "Letter cards", "Whiteboards"],
      accommodations: ["Tracing sheets", "Larger lines", "Hand-over-hand support"],
      unitIndex: 4
    },
    {
      title: "French Sentence Building",
      titleFr: "Construction de phrases",
      mindsOn: "Sentence scramble: Arrange words to make sentences",
      action: "Build sentences using word cards and pictures",
      consolidation: "Read sentences to a partner",
      learningGoals: "Students will create simple French sentences",
      materials: ["Word cards", "Picture cards", "Sentence strips"],
      accommodations: ["Sentence frames", "Color coding", "Partner support"],
      unitIndex: 4
    },
    {
      title: "French Journal Writing",
      titleFr: "Écriture de journal",
      mindsOn: "Daily news: Share one thing in French",
      action: "Journal time: Draw and write using French words",
      consolidation: "Author's chair: Share journal entries",
      learningGoals: "Students will express ideas through French writing",
      materials: ["Journals", "Word walls", "Drawing supplies"],
      accommodations: ["Picture prompts", "Word banks", "Scribing support"],
      unitIndex: 4
    },
    // February unit additions
    {
      title: "French Conversation Practice",
      titleFr: "Pratique de conversation",
      mindsOn: "Speed greetings: Quick partner conversations",
      action: "Conversation stations: Practice different dialogues",
      consolidation: "Performance: Present a short French conversation",
      learningGoals: "Students will engage in simple French conversations",
      materials: ["Conversation cards", "Props", "Recording devices"],
      accommodations: ["Visual scripts", "Partner choice", "Simplified dialogues"],
      unitIndex: 5
    },
    {
      title: "French Pronunciation Games",
      titleFr: "Jeux de prononciation",
      mindsOn: "Echo game: Repeat French sounds and words",
      action: "Pronunciation stations: Practice specific French sounds",
      consolidation: "Tongue twister challenge",
      learningGoals: "Students will improve French pronunciation",
      materials: ["Sound cards", "Mirrors", "Recording tools"],
      accommodations: ["Visual cues", "Individual practice", "Peer modeling"],
      unitIndex: 5
    },
    {
      title: "French Show and Tell",
      titleFr: "Montre et raconte",
      mindsOn: "Mystery object: Describe an object for others to guess",
      action: "Prepare and practice show and tell in French",
      consolidation: "Present show and tell to the class",
      learningGoals: "Students will describe objects in French",
      materials: ["Personal objects", "Vocabulary cards", "Presentation space"],
      accommodations: ["Sentence starters", "Visual supports", "Small groups"],
      unitIndex: 5
    },
    // Spring unit additions
    {
      title: "Spring Vocabulary Review",
      titleFr: "Révision du vocabulaire du printemps",
      mindsOn: "Spring walk: Observe and name spring changes",
      action: "Create spring vocabulary books",
      consolidation: "Share favorite spring words in French",
      learningGoals: "Students will use French vocabulary for spring",
      materials: ["Observation sheets", "Book materials", "Spring pictures"],
      accommodations: ["Picture supports", "Word lists", "Partner work"],
      unitIndex: 6
    },
    {
      title: "French Poetry Introduction",
      titleFr: "Introduction à la poésie",
      mindsOn: "Rhythm and rhyme: Clap French rhyming patterns",
      action: "Create simple French poems with patterns",
      consolidation: "Poetry reading: Share poems with expression",
      learningGoals: "Students will create simple French poems",
      materials: ["Poetry examples", "Rhyming cards", "Writing materials"],
      accommodations: ["Pattern templates", "Word banks", "Partner writing"],
      unitIndex: 6
    },
    {
      title: "French Reading Fluency",
      titleFr: "Fluidité en lecture",
      mindsOn: "Choral reading: Read together with expression",
      action: "Partner reading: Practice reading French texts",
      consolidation: "Reading celebration: Read favorite parts aloud",
      learningGoals: "Students will read simple French texts with fluency",
      materials: ["Simple French books", "Reading pointers", "Fluency cards"],
      accommodations: ["Echo reading", "Shorter texts", "Visual supports"],
      unitIndex: 6
    },
    // Year-end unit additions
    {
      title: "French Year Review Games",
      titleFr: "Jeux de révision de l'année",
      mindsOn: "Memory lane: Remember favorite French words learned",
      action: "Review stations: Games reviewing year's vocabulary",
      consolidation: "Celebration: What we've learned in French",
      learningGoals: "Students will review and celebrate French learning",
      materials: ["Review games", "Year's vocabulary", "Celebration materials"],
      accommodations: ["Picture supports", "Partner games", "Choice of activities"],
      unitIndex: 7
    },
    {
      title: "French Portfolio Sharing",
      titleFr: "Partage de portfolio",
      mindsOn: "Portfolio prep: Select best French work",
      action: "Create portfolio presentations",
      consolidation: "Portfolio celebration with families",
      learningGoals: "Students will showcase French learning progress",
      materials: ["Portfolios", "Presentation materials", "Reflection sheets"],
      accommodations: ["Visual supports", "Parent helpers", "Flexible formats"],
      unitIndex: 7
    },
    {
      title: "French Summer Words",
      titleFr: "Mots d'été",
      mindsOn: "Summer plans: Share summer plans in French",
      action: "Create summer French practice books",
      consolidation: "Summer French challenge preparation",
      learningGoals: "Students will use French vocabulary for summer",
      materials: ["Summer vocabulary", "Book materials", "Challenge cards"],
      accommodations: ["Picture dictionaries", "Parent resources", "Simplified goals"],
      unitIndex: 7
    },
    {
      title: "French Celebration Day",
      titleFr: "Journée de célébration française",
      mindsOn: "French music and movement",
      action: "French centers: Games, crafts, and activities",
      consolidation: "Celebration assembly: Share French learning",
      learningGoals: "Students will celebrate French learning achievements",
      materials: ["Music", "Celebration supplies", "Game materials"],
      accommodations: ["Choice of activities", "Peer support", "Family involvement"],
      unitIndex: 7
    },
    {
      title: "French Assessment Review",
      titleFr: "Révision d'évaluation",
      mindsOn: "Self-assessment: What I know in French",
      action: "Assessment activities: Show French learning",
      consolidation: "Goal setting: French goals for next year",
      learningGoals: "Students will demonstrate French learning progress",
      materials: ["Assessment tools", "Reflection sheets", "Goal cards"],
      accommodations: ["Multiple formats", "Extra time", "Choice in demonstration"],
      unitIndex: 7
    }
  ];
  
  // Create French lessons
  console.log('Creating 23 French review/practice lessons...');
  for (const lesson of frenchLessons) {
    const unit = frenchUnits[lesson.unitIndex];
    if (unit) {
      await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          title: lesson.title,
          titleFr: lesson.titleFr,
          unitPlanId: unit.id,
          date: unit.startDate,
          duration: 60,
          mindsOn: lesson.mindsOn,
          mindsOnFr: lesson.mindsOn,
          action: lesson.action,
          actionFr: lesson.action,
          consolidation: lesson.consolidation,
          consolidationFr: lesson.consolidation,
          learningGoals: lesson.learningGoals,
          learningGoalsFr: lesson.learningGoals,
          materials: lesson.materials,
          accommodations: lesson.accommodations,
          grouping: "whole class",
          assessmentType: "formative",
          assessmentNotes: "Observe French vocabulary use and participation",
          isSubFriendly: true,
          subNotes: "All materials labeled and organized. Focus on oral French practice.",
          grade: 1,
          subject: "Français (Immersion)",
          language: "fr"
        }
      });
      console.log(`  ✓ ${lesson.title}`);
    }
  }
  
  // Get Math units  
  const mathUnits = await prisma.unitPlan.findMany({
    where: {
      userId: emily.id,
      longRangePlan: {
        subject: 'Mathématiques'
      }
    },
    include: {
      longRangePlan: true,
      _count: {
        select: { lessonPlans: true }
      }
    },
    orderBy: { startDate: 'asc' }
  });
  
  // Generate 15 Math practice lessons
  const mathLessons = [
    // Numbers unit additions
    {
      title: "Number Formation Practice",
      titleFr: "Pratique de formation des nombres",
      mindsOn: "Number warm-up: Air write numbers 1-10",
      action: "Number stations: Practice writing numbers in sand, with playdough, on whiteboards",
      consolidation: "Number gallery: Display and check number formations",
      learningGoals: "Students will correctly form numbers 1-20",
      materials: ["Sand trays", "Playdough", "Whiteboards", "Number cards"],
      accommodations: ["Tracing cards", "Larger writing spaces", "Hand-over-hand support"],
      unitIndex: 0
    },
    {
      title: "Counting Collections",
      titleFr: "Collections à compter",
      mindsOn: "Estimation jar: Estimate and count items",
      action: "Count and organize collections of objects by tens and ones",
      consolidation: "Share counting strategies with a partner",
      learningGoals: "Students will count collections up to 20 using efficient strategies",
      materials: ["Collections of objects", "Ten frames", "Recording sheets"],
      accommodations: ["Smaller collections", "Ten frames support", "Partner counting"],
      unitIndex: 0
    },
    // Patterns unit additions
    {
      title: "Pattern Detectives",
      titleFr: "Détectives de régularités",
      mindsOn: "Pattern hunt: Find patterns in the classroom",
      action: "Create and extend various patterns with materials",
      consolidation: "Pattern museum: Display and explain patterns",
      learningGoals: "Students will identify, extend, and create patterns",
      materials: ["Pattern blocks", "Colored cubes", "Pattern cards"],
      accommodations: ["Simpler patterns", "Color coding", "Peer support"],
      unitIndex: 1
    },
    {
      title: "Growing Patterns",
      titleFr: "Régularités croissantes",
      mindsOn: "Body patterns: Create patterns with movements",
      action: "Build growing patterns with manipulatives",
      consolidation: "Predict the next step in growing patterns",
      learningGoals: "Students will recognize and create growing patterns",
      materials: ["Manipulatives", "Pattern cards", "Recording materials"],
      accommodations: ["Concrete materials", "Visual supports", "Simpler patterns"],
      unitIndex: 1
    },
    // Addition unit additions
    {
      title: "Addition Stories",
      titleFr: "Histoires d'addition",
      mindsOn: "Story problems: Act out addition scenarios",
      action: "Create and solve addition story problems",
      consolidation: "Share stories and solutions",
      learningGoals: "Students will solve addition problems through stories",
      materials: ["Story props", "Manipulatives", "Recording sheets"],
      accommodations: ["Concrete objects", "Picture supports", "Simpler numbers"],
      unitIndex: 2
    },
    {
      title: "Addition Strategies Practice",
      titleFr: "Pratique de stratégies d'addition",
      mindsOn: "Mental math: Quick addition facts",
      action: "Practice different addition strategies at centers",
      consolidation: "Explain favorite addition strategy",
      learningGoals: "Students will use various strategies to add",
      materials: ["Number lines", "Ten frames", "Counters"],
      accommodations: ["Manipulatives available", "Smaller numbers", "Strategy cards"],
      unitIndex: 2
    },
    // Subtraction unit additions
    {
      title: "Subtraction Stories",
      titleFr: "Histoires de soustraction",
      mindsOn: "Take away game: Physical subtraction activities",
      action: "Create and solve subtraction story problems",
      consolidation: "Act out subtraction stories for the class",
      learningGoals: "Students will solve subtraction problems through stories",
      materials: ["Story props", "Manipulatives", "Recording materials"],
      accommodations: ["Concrete objects", "Visual supports", "Simpler problems"],
      unitIndex: 3
    },
    // Measurement unit additions
    {
      title: "Measurement Comparisons",
      titleFr: "Comparaisons de mesures",
      mindsOn: "Size line-up: Order objects by length",
      action: "Measure and compare objects using non-standard units",
      consolidation: "Measurement discoveries sharing",
      learningGoals: "Students will compare and order objects by measurement",
      materials: ["Objects to measure", "Non-standard units", "Recording sheets"],
      accommodations: ["Fewer objects", "Partner support", "Visual comparisons"],
      unitIndex: 4
    },
    {
      title: "Measurement Tools Exploration",
      titleFr: "Exploration d'outils de mesure",
      mindsOn: "Tool introduction: Explore measurement tools",
      action: "Use different tools to measure classroom objects",
      consolidation: "Which tool for which job discussion",
      learningGoals: "Students will select appropriate measurement tools",
      materials: ["Rulers", "Balance scales", "Measuring cups"],
      accommodations: ["Guided practice", "Simplified tools", "Partner work"],
      unitIndex: 4
    },
    // Geometry unit additions
    {
      title: "3D Shape Builders",
      titleFr: "Constructeurs de formes 3D",
      mindsOn: "Shape hunt: Find 3D shapes in the classroom",
      action: "Build structures using 3D shapes",
      consolidation: "Describe structures using shape vocabulary",
      learningGoals: "Students will identify and use 3D shapes",
      materials: ["3D shape blocks", "Building materials", "Shape cards"],
      accommodations: ["Shape references", "Partner building", "Simpler structures"],
      unitIndex: 5
    },
    {
      title: "Shape Transformations",
      titleFr: "Transformations de formes",
      mindsOn: "Shape movements: Slide, flip, turn shapes",
      action: "Create designs using shape transformations",
      consolidation: "Explain transformations used in designs",
      learningGoals: "Students will transform shapes through slides, flips, and turns",
      materials: ["Pattern blocks", "Paper shapes", "Transformation cards"],
      accommodations: ["Guided practice", "Simpler transformations", "Visual supports"],
      unitIndex: 5
    },
    // Problem solving unit additions
    {
      title: "Math Problem Detectives",
      titleFr: "Détectives de problèmes mathématiques",
      mindsOn: "Mystery problem: Solve a class puzzle",
      action: "Work through multi-step problems systematically",
      consolidation: "Share problem-solving strategies",
      learningGoals: "Students will use systematic approaches to solve problems",
      materials: ["Problem cards", "Manipulatives", "Strategy posters"],
      accommodations: ["Simpler problems", "Step-by-step guides", "Partner solving"],
      unitIndex: 6
    },
    {
      title: "Real-World Math Problems",
      titleFr: "Problèmes mathématiques du monde réel",
      mindsOn: "Math in our lives: Discuss everyday math",
      action: "Solve problems based on classroom situations",
      consolidation: "Create a class problem for tomorrow",
      learningGoals: "Students will apply math to real-world situations",
      materials: ["Scenario cards", "Manipulatives", "Recording materials"],
      accommodations: ["Concrete materials", "Simpler scenarios", "Group work"],
      unitIndex: 6
    },
    // Review unit additions
    {
      title: "Math Games Day",
      titleFr: "Journée de jeux mathématiques",
      mindsOn: "Game introduction: Learn new math games",
      action: "Rotate through math game stations",
      consolidation: "Vote for favorite math game",
      learningGoals: "Students will apply math skills through games",
      materials: ["Math games", "Dice", "Cards", "Game boards"],
      accommodations: ["Modified rules", "Partner support", "Choice of games"],
      unitIndex: 7
    },
    {
      title: "Math Celebration Review",
      titleFr: "Révision de célébration mathématique",
      mindsOn: "Math memories: Share favorite math learning",
      action: "Complete math skill review stations",
      consolidation: "Math certificates and celebration",
      learningGoals: "Students will demonstrate year's math learning",
      materials: ["Review materials", "Certificates", "Celebration supplies"],
      accommodations: ["Choice of activities", "Peer support", "Modified expectations"],
      unitIndex: 7
    }
  ];
  
  // Create Math lessons
  console.log('\nCreating 15 Math practice/review lessons...');
  for (const lesson of mathLessons) {
    const unit = mathUnits[lesson.unitIndex];
    if (unit) {
      await prisma.eTFOLessonPlan.create({
        data: {
          userId: emily.id,
          title: lesson.title,
          titleFr: lesson.titleFr,
          unitPlanId: unit.id,
          date: unit.startDate,
          duration: 60,
          mindsOn: lesson.mindsOn,
          mindsOnFr: lesson.mindsOn,
          action: lesson.action,
          actionFr: lesson.action,
          consolidation: lesson.consolidation,
          consolidationFr: lesson.consolidation,
          learningGoals: lesson.learningGoals,
          learningGoalsFr: lesson.learningGoals,
          materials: lesson.materials,
          accommodations: lesson.accommodations,
          grouping: "flexible groups",
          assessmentType: "formative",
          assessmentNotes: "Observe problem-solving strategies and mathematical thinking",
          isSubFriendly: true,
          subNotes: "Materials organized by station. Allow students to use manipulatives as needed.",
          grade: 1,
          subject: "Mathématiques",
          language: "fr"
        }
      });
      console.log(`  ✓ ${lesson.title}`);
    }
  }
  
  console.log('\n✅ Successfully generated 38 missing lessons');
  
  // Final count
  const finalCount = await prisma.eTFOLessonPlan.count({
    where: { userId: emily.id }
  });
  
  console.log(`\nTotal lessons now: ${finalCount}`);
  
  return finalCount;
}

generateMissingLessons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());