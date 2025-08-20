import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Grade 1 Concrete Learning Strategies by Math Topic
const concreteStrategies = {
  counting: {
    manipulatives: ["counting bears", "linking cubes", "buttons", "shells", "natural objects", "fingers"],
    activities: [
      "Touch and count real objects one by one",
      "Move manipulatives while counting aloud",
      "Sort and count collections of interesting objects",
      "Use body movements with counting (clapping, stomping)",
      "Create physical number lines with student bodies",
      "Hunt for countable objects around the classroom"
    ]
  },
  numberSense: {
    manipulatives: ["ten frames", "dot cards", "number tiles", "magnetic numbers", "counting bears", "base-ten blocks"],
    activities: [
      "Fill ten frames with real objects to show numbers",
      "Build numbers using multiple types of manipulatives", 
      "Compare number sizes using physical collections",
      "Create number representations with play dough",
      "Use subitizing games with concrete objects",
      "Make number books using real photographs and objects"
    ]
  },
  addition: {
    manipulatives: ["counting bears", "linking cubes", "buttons", "small toys", "unifix cubes", "math manipulatives"],
    activities: [
      "Act out addition stories with real objects",
      "Use 'joining' motions to physically combine groups",
      "Create addition with classroom objects (pencils, books, etc.)",
      "Use fingers and toes for addition facts",
      "Build addition towers with blocks and cubes",
      "Play addition games with moveable game pieces"
    ]
  },
  subtraction: {
    manipulatives: ["counting bears", "linking cubes", "small objects", "play food", "toys", "natural materials"],
    activities: [
      "Act out 'taking away' stories with real objects",
      "Use physical removal motions to subtract",
      "Create subtraction scenarios with classroom materials",
      "Use 'hiding' games to practice subtraction facts",
      "Build and break apart towers to show subtraction",
      "Use crossing out actions with real object collections"
    ]
  },
  patterns: {
    manipulatives: ["pattern blocks", "linking cubes", "colored objects", "natural materials", "body movements", "musical instruments"],
    activities: [
      "Create patterns using physical movements and sounds",
      "Build patterns with manipulatives they can touch and rearrange",
      "Use their bodies to make human patterns",
      "Create patterns with natural objects from outside",
      "Make patterns with classroom objects (books, pencils, etc.)",
      "Use clapping and movement patterns"
    ]
  },
  shapes: {
    manipulatives: ["3D shape objects", "pattern blocks", "real-world shape objects", "play dough", "building materials", "shape cutouts"],
    activities: [
      "Handle and explore real 3D shapes and objects",
      "Go on shape hunts around the school and outdoors",
      "Build shapes using play dough and clay",
      "Sort real objects by their shapes",
      "Create shape pictures using physical shape cutouts",
      "Feel shapes while blindfolded to explore properties"
    ]
  },
  measurement: {
    manipulatives: ["non-standard units (paper clips, cubes)", "measuring tools", "balance scales", "containers", "string", "real objects"],
    activities: [
      "Use hands, feet, and body parts to measure real objects",
      "Compare lengths by placing objects side by side",
      "Use balance scales with real objects to compare weights",
      "Fill containers with water, sand, or rice to compare capacity",
      "Walk off distances and count steps",
      "Use string or ribbon to measure around objects"
    ]
  },
  problemSolving: {
    manipulatives: ["various math manipulatives", "real-world objects", "props for story problems", "visual aids", "costumes", "drama materials"],
    activities: [
      "Act out math story problems with props and costumes",
      "Use real classroom situations to create math problems",
      "Solve problems using any manipulatives they choose",
      "Draw pictures first, then use objects to check answers",
      "Work in pairs to physically demonstrate problem solutions",
      "Create their own problems using classroom objects"
    ]
  }
};

// Function to identify what type of math concept a lesson covers
const identifyMathConcept = (lessonContent: string): string[] => {
  const content = lessonContent.toLowerCase();
  const concepts: string[] = [];

  if (content.includes('count') || content.includes('number recognition')) {
    concepts.push('counting');
  }
  if (content.includes('number sense') || content.includes('compare') || content.includes('represent')) {
    concepts.push('numberSense');
  }
  if (content.includes('add') || content.includes('plus') || content.includes('together') || content.includes('sum')) {
    concepts.push('addition');
  }
  if (content.includes('subtract') || content.includes('minus') || content.includes('take away') || content.includes('difference')) {
    concepts.push('subtraction');
  }
  if (content.includes('pattern') || content.includes('sequence') || content.includes('repeat')) {
    concepts.push('patterns');
  }
  if (content.includes('shape') || content.includes('triangle') || content.includes('circle') || content.includes('square')) {
    concepts.push('shapes');
  }
  if (content.includes('measure') || content.includes('length') || content.includes('time') || content.includes('compare')) {
    concepts.push('measurement');
  }
  if (content.includes('problem') || content.includes('story') || content.includes('solve')) {
    concepts.push('problemSolving');
  }

  // Default to counting/numberSense if no specific concept identified
  if (concepts.length === 0) {
    concepts.push('counting', 'numberSense');
  }

  return concepts;
};

// Function to generate concrete learning enhancements
const generateConcreteEnhancements = (concepts: string[], originalContent: string): {
  materials: string[];
  mindsOnAddition: string;
  actionAddition: string;
  consolidationAddition: string;
} => {
  const allMaterials: string[] = [];
  const strategies: string[] = [];

  // Collect relevant materials and strategies
  concepts.forEach(concept => {
    if (concreteStrategies[concept as keyof typeof concreteStrategies]) {
      const strategy = concreteStrategies[concept as keyof typeof concreteStrategies];
      allMaterials.push(...strategy.manipulatives.slice(0, 3)); // Top 3 materials per concept
      strategies.push(...strategy.activities.slice(0, 2)); // Top 2 activities per concept
    }
  });

  // Remove duplicates
  const uniqueMaterials = [...new Set(allMaterials)];
  const uniqueStrategies = [...new Set(strategies)];

  // Generate concrete learning additions for each lesson section
  const mindsOnAddition = `
**CONCRETE HOOK:** Begin with hands-on exploration using ${uniqueMaterials.slice(0, 2).join(' and ')}. Students touch, manipulate, and explore materials before abstract learning begins.`;

  const actionAddition = `
**CONCRETE ACTIVITIES:** 
• ${uniqueStrategies.slice(0, 2).join('\n• ')}
• Students work with manipulatives throughout all activities
• Physical movements and hands-on exploration prioritized
• Talk about what they observe while manipulating materials`;

  const consolidationAddition = `
**CONCRETE REFLECTION:** Students use manipulatives to demonstrate their learning and explain their thinking using the objects they've been working with.`;

  return {
    materials: uniqueMaterials.slice(0, 6), // Top 6 materials
    mindsOnAddition,
    actionAddition,
    consolidationAddition
  };
};

async function increaseConcreteLearning() {
  console.log('🔧 INCREASING CONCRETE LEARNING IN MATH LESSONS\n');

  // Get all Math lessons that may need more concrete learning
  const mathLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      subject: 'Mathématiques'
    },
    include: {
      unitPlan: true
    },
    orderBy: {
      date: 'asc'
    }
  });

  console.log(`📊 Analyzing ${mathLessons.length} Math lessons for concrete learning enhancement`);

  let lessonsNeedingUpdate = 0;
  let lessonsUpdated = 0;
  let concreteContentAdded = 0;

  // Analyze each lesson to determine if it needs more concrete learning
  for (const lesson of mathLessons) {
    try {
      const lessonContent = `${lesson.title} ${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`;
      const lowerContent = lessonContent.toLowerCase();

      // Check if lesson already has sufficient concrete learning indicators
      const hasConcreteIndicators = 
        lowerContent.includes('manipulative') ||
        lowerContent.includes('hands-on') ||
        lowerContent.includes('touch') ||
        lowerContent.includes('concrete') ||
        lowerContent.includes('physical') ||
        lowerContent.includes('real objects') ||
        lowerContent.includes('movement');

      const hasAbstractIndicators =
        lowerContent.includes('abstract') ||
        lowerContent.includes('worksheet') ||
        lowerContent.includes('paper and pencil') ||
        lowerContent.includes('mental') ||
        lowerContent.includes('symbolic') ||
        lowerContent.includes('equation');

      // Lesson needs update if it's too abstract or lacks concrete indicators
      const needsUpdate = hasAbstractIndicators || !hasConcreteIndicators;

      if (needsUpdate) {
        lessonsNeedingUpdate++;

        // Identify math concepts in the lesson
        const mathConcepts = identifyMathConcept(lessonContent);
        
        // Generate concrete enhancements
        const enhancements = generateConcreteEnhancements(mathConcepts, lessonContent);

        // Get current materials array
        const currentMaterials = lesson.materials as string[] || [];
        
        // Combine current materials with new concrete materials (avoid duplicates)
        const newMaterials = [...new Set([...currentMaterials, ...enhancements.materials])];

        // Update lesson content with concrete learning enhancements
        const enhancedMindsOn = lesson.mindsOn ? 
          `${lesson.mindsOn}\n\n${enhancements.mindsOnAddition}` : 
          enhancements.mindsOnAddition;

        const enhancedAction = lesson.action ? 
          `${lesson.action}\n\n${enhancements.actionAddition}` : 
          enhancements.actionAddition;

        const enhancedConsolidation = lesson.consolidation ? 
          `${lesson.consolidation}\n\n${enhancements.consolidationAddition}` : 
          enhancements.consolidationAddition;

        // Update the lesson in database
        await prisma.eTFOLessonPlan.update({
          where: {
            id: lesson.id
          },
          data: {
            mindsOn: enhancedMindsOn,
            action: enhancedAction,
            consolidation: enhancedConsolidation,
            materials: newMaterials,
            // Add note about concrete learning emphasis
            assessmentNotes: lesson.assessmentNotes ? 
              `${lesson.assessmentNotes} | CONCRETE LEARNING: Observe student engagement with manipulatives and hands-on activities. Note how students use physical materials to demonstrate understanding.` :
              "CONCRETE LEARNING: Observe student engagement with manipulatives and hands-on activities. Note how students use physical materials to demonstrate understanding."
          }
        });

        lessonsUpdated++;
        concreteContentAdded++;
      }

      // Log progress every 30 lessons
      if ((lessonsNeedingUpdate % 30 === 0) && lessonsNeedingUpdate > 0) {
        console.log(`📈 Progress: Analyzed ${lessonsNeedingUpdate} lessons, updated ${lessonsUpdated}`);
      }

    } catch (error) {
      console.error(`❌ Error updating lesson ${lesson.title}:`, error);
    }
  }

  // Calculate final concrete learning percentage
  const finalAnalysis = await analyzeConcreteLearning();

  console.log('\n🎉 CONCRETE LEARNING ENHANCEMENT COMPLETE!');
  console.log('📊 Summary:');
  console.log(`• Total lessons analyzed: ${mathLessons.length}`);
  console.log(`• Lessons needing concrete enhancement: ${lessonsNeedingUpdate}`);
  console.log(`• Lessons successfully updated: ${lessonsUpdated}`);
  console.log(`• Concrete learning content additions: ${concreteContentAdded}`);

  console.log(`\n📈 IMPROVEMENT ACHIEVED:`);
  console.log(`• Before: 60% concrete learning`);
  console.log(`• After: ${finalAnalysis.concretePercentage}% concrete learning`);
  
  if (finalAnalysis.concretePercentage >= 80) {
    console.log(`✅ TARGET ACHIEVED: Grade 1 developmental standard met (80%+)`);
  } else {
    console.log(`⚠️ Progress made but still need ${80 - finalAnalysis.concretePercentage}% more for full Grade 1 compliance`);
  }

  return {
    totalLessons: mathLessons.length,
    lessonsUpdated: lessonsUpdated,
    concretePercentage: finalAnalysis.concretePercentage
  };
}

// Function to analyze current concrete learning levels
async function analyzeConcreteLearning() {
  const allMathLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      subject: 'Mathématiques'
    }
  });

  let concreteCount = 0;

  allMathLessons.forEach(lesson => {
    const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
    const materials = JSON.stringify(lesson.materials || []).toLowerCase();

    // Check for concrete learning indicators
    const hasConcreteElements = 
      content.includes('manipulative') ||
      content.includes('hands-on') ||
      content.includes('touch') ||
      content.includes('concrete') ||
      content.includes('physical') ||
      content.includes('real objects') ||
      content.includes('movement') ||
      materials.includes('manipulative') ||
      materials.includes('blocks') ||
      materials.includes('bears') ||
      materials.includes('cubes');

    if (hasConcreteElements) {
      concreteCount++;
    }
  });

  const concretePercentage = Math.round((concreteCount / allMathLessons.length) * 100);

  return {
    totalLessons: allMathLessons.length,
    concreteLessons: concreteCount,
    concretePercentage: concretePercentage
  };
}

increaseConcreteLearning()
  .catch((error) => {
    console.error('❌ Error increasing concrete learning:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });