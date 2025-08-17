const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUnit3PatternsAndShapes() {
  console.log('🔧 Fixing Unit 3: Patterns and Shapes - Making all 24 lessons ETFO-compliant...\n');

  // Get all lessons in this unit
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      subject: 'Mathématiques',
      unitPlan: {
        title: 'Patterns and Shapes'
      }
    },
    orderBy: { date: 'asc' }
  });

  console.log(`Found ${lessons.length} lessons in Patterns and Shapes unit`);

  const differentiation = {
    forStruggling: "Concrete pattern materials, simplified pattern sequences (2-element), visual shape cards, peer support for pattern creation",
    forIEP: "Modified expectations per IEP, tactile pattern materials, large visual aids, extended time for pattern work, alternative recording methods",
    forELL: "Bilingual pattern vocabulary, visual pattern instructions, peer translation support, pattern songs in both languages",
    forAdvanced: "Complex pattern sequences, 3D pattern challenges, pattern creation with multiple attributes, peer tutoring for geometric concepts"
  };

  // Lesson-specific content mapping
  const lessonMappings = [
    {
      keywords: ["Pattern Recognition"],
      mindsOn: "(8 minutes) Pattern warm-up with simple sound patterns (clap-clap-stomp). Explore patterns around the classroom. Discuss what makes something a pattern.",
      action: "(27 minutes) Investigate patterns using manipulatives, colors, and movements. Students identify, describe, and create simple patterns focusing on recognition skills.",
      consolidation: "(10 minutes) Share interesting patterns discovered. Math journal reflection on patterns found in daily life. Connect to rhythms and routines.",
      indigenousPerspectives: "Explore patterns in traditional Indigenous art, beadwork, and textiles. Learn how patterns have cultural significance and mathematical meaning in Indigenous communities.",
      assessmentNotes: "☐ Student identifies simple patterns accurately\n☐ Can describe what makes a pattern\n☐ Shows understanding of pattern rules\n☐ Explains pattern thinking clearly\n☐ Finds patterns in various contexts"
    },
    {
      keywords: ["AB Patterns"],
      mindsOn: "(8 minutes) AB pattern warm-up with body movements (stand-sit-stand-sit). Practice identifying and continuing AB patterns with sounds and actions.",
      action: "(27 minutes) Create and extend AB patterns using various materials - blocks, colors, shapes, and movements. Students focus on two-element repeating patterns.",
      consolidation: "(10 minutes) Share favorite AB patterns created. Math journal reflection on AB patterns in daily life. Connect to alternating activities and routines.",
      indigenousPerspectives: "Learn about AB patterns in traditional Indigenous designs, including alternating elements in beadwork, basket weaving, and ceremonial decorations.",
      assessmentNotes: "☐ Student creates accurate AB patterns\n☐ Can extend given AB patterns\n☐ Identifies pattern core correctly\n☐ Explains AB pattern rule\n☐ Uses multiple materials for patterns"
    },
    {
      keywords: ["Creating Patterns"],
      mindsOn: "(8 minutes) Pattern creation warm-up with available materials. Explore different ways to make patterns. Discuss creativity in pattern making.",
      action: "(27 minutes) Design and create original patterns using various attributes (color, shape, size, position). Students explore pattern making as a creative mathematical activity.",
      consolidation: "(10 minutes) Share and admire created patterns. Math journal reflection on pattern creation process. Connect to artistic expression and design.",
      indigenousPerspectives: "Explore how Indigenous artists create meaningful patterns that tell stories, represent cultural values, and pass down traditional knowledge through geometric designs.",
      assessmentNotes: "☐ Student creates original patterns\n☐ Uses multiple attributes in patterns\n☐ Shows creativity in pattern design\n☐ Explains pattern creation choices\n☐ Demonstrates pattern understanding"
    },
    {
      keywords: ["Color Patterns"],
      mindsOn: "(8 minutes) Color pattern warm-up with classroom objects. Explore color sequences and arrangements. Discuss how colors can create mathematical patterns.",
      action: "(27 minutes) Work with color patterns using paints, papers, and manipulatives. Students create, extend, and analyze patterns focusing on color relationships.",
      consolidation: "(10 minutes) Share beautiful color patterns created. Math journal reflection on favorite color combinations. Connect to art and nature's color patterns.",
      indigenousPerspectives: "Learn about the significance of colors in Indigenous cultures and how traditional color patterns in art and clothing carry mathematical and cultural meaning.",
      assessmentNotes: "☐ Student creates accurate color patterns\n☐ Can identify color pattern rules\n☐ Extends color sequences correctly\n☐ Shows artistic sense with colors\n☐ Explains color pattern thinking"
    },
    {
      keywords: ["Growing Patterns"],
      mindsOn: "(8 minutes) Growing pattern introduction with physical materials that increase (1 block, 2 blocks, 3 blocks). Explore how patterns can grow or change.",
      action: "(27 minutes) Investigate growing patterns using manipulatives and drawings. Students explore patterns that increase in size, quantity, or complexity.",
      consolidation: "(10 minutes) Share discoveries about growing patterns. Math journal reflection on growth in patterns. Connect to growth in nature and personal development.",
      indigenousPerspectives: "Explore Indigenous understanding of growth cycles in nature, seasonal patterns, and how traditional knowledge recognizes mathematical growth in natural systems.",
      assessmentNotes: "☐ Student identifies growing pattern rules\n☐ Can extend growing patterns\n☐ Understands concept of pattern growth\n☐ Explains growing pattern thinking\n☐ Creates own growing patterns"
    },
    {
      keywords: ["Shape Patterns"],
      mindsOn: "(8 minutes) Shape pattern warm-up with pattern blocks or cut-out shapes. Explore patterns using different geometric shapes. Discuss shape relationships.",
      action: "(27 minutes) Create and analyze shape patterns using various geometric materials. Students focus on patterns made with different shapes and their attributes.",
      consolidation: "(10 minutes) Share interesting shape pattern discoveries. Math journal reflection on shape pattern favorites. Connect to architectural and design patterns.",
      indigenousPerspectives: "Learn about geometric patterns in traditional Indigenous architecture, clothing, and ceremonial objects, exploring the mathematical thinking in cultural designs.",
      assessmentNotes: "☐ Student creates shape patterns accurately\n☐ Uses various geometric shapes in patterns\n☐ Identifies shape pattern rules\n☐ Explains shape relationships in patterns\n☐ Shows understanding of geometric patterns"
    },
    {
      keywords: ["Shape Hunt"],
      mindsOn: "(8 minutes) Shape hunt warm-up around the classroom. Look for circles, squares, triangles, and rectangles. Discuss where we find shapes in our environment.",
      action: "(27 minutes) Conduct systematic shape hunts in school and surrounding areas. Students identify, record, and classify shapes found in real-world contexts.",
      consolidation: "(10 minutes) Share exciting shape discoveries. Math journal reflection on most interesting shapes found. Connect to architecture and everyday design.",
      indigenousPerspectives: "Explore how Indigenous peoples have traditionally observed and used geometric shapes in nature, shelter construction, and tool making, recognizing shapes as part of practical mathematics.",
      assessmentNotes: "☐ Student identifies shapes in environment\n☐ Can name basic geometric shapes\n☐ Shows observation skills in shape finding\n☐ Explains where shapes are useful\n☐ Makes connections between shapes and functions"
    },
    {
      keywords: ["2D Shapes"],
      mindsOn: "(8 minutes) 2D shape warm-up with shape sorting and identification. Explore flat shapes and their characteristics. Touch and feel different 2D shapes.",
      action: "(27 minutes) Investigate 2D shapes through hands-on exploration, drawing, and analysis. Students learn about circles, squares, triangles, rectangles, and their attributes.",
      consolidation: "(10 minutes) Share favorite 2D shapes and why. Math journal reflection on 2D shape characteristics. Connect to art and design applications.",
      indigenousPerspectives: "Learn about 2D shapes in traditional Indigenous art forms like paintings, drawings on hide, and flat decorative elements in cultural artifacts.",
      assessmentNotes: "☐ Student identifies 2D shapes correctly\n☐ Can describe shape attributes\n☐ Understands flat/2D concept\n☐ Explains shape characteristics clearly\n☐ Uses shape vocabulary appropriately"
    },
    {
      keywords: ["Building with Shapes"],
      mindsOn: "(8 minutes) Building warm-up with shape blocks or tangrams. Explore how shapes fit together. Discuss construction and shape relationships.",
      action: "(27 minutes) Build structures and designs using geometric shapes. Students explore how shapes combine, tessellate, and create larger constructions.",
      consolidation: "(10 minutes) Share amazing building creations. Math journal reflection on how shapes work together. Connect to construction and engineering.",
      indigenousPerspectives: "Explore traditional Indigenous building techniques and how geometric principles were used in shelter construction, understanding shapes as practical mathematical tools.",
      assessmentNotes: "☐ Student builds successfully with shapes\n☐ Shows understanding of shape relationships\n☐ Can combine shapes effectively\n☐ Explains building choices\n☐ Demonstrates spatial reasoning"
    },
    {
      keywords: ["3D Shapes"],
      mindsOn: "(8 minutes) 3D shape warm-up with solid objects around the room. Explore shapes that aren't flat. Feel and handle various 3D shapes.",
      action: "(27 minutes) Investigate 3D shapes through hands-on exploration with blocks, boxes, balls, and cones. Students learn about cubes, spheres, cylinders, and pyramids.",
      consolidation: "(10 minutes) Share interesting 3D shape discoveries. Math journal reflection on 3D vs 2D differences. Connect to real-world 3D objects.",
      indigenousPerspectives: "Learn about 3D shapes in traditional Indigenous objects like baskets, pottery, tools, and ceremonial items, understanding how geometric forms served practical and cultural purposes.",
      assessmentNotes: "☐ Student identifies 3D shapes correctly\n☐ Understands solid/3D concept\n☐ Can describe 3D shape attributes\n☐ Explains differences from 2D shapes\n☐ Makes real-world 3D connections"
    },
    {
      keywords: ["Shape Attributes"],
      mindsOn: "(8 minutes) Shape attribute warm-up by describing shapes without naming them. Explore what makes each shape special. Focus on corners, sides, and curves.",
      action: "(27 minutes) Investigate shape attributes through systematic exploration. Students examine sides, corners, curves, and other characteristics that define shapes.",
      consolidation: "(10 minutes) Share interesting attribute discoveries. Math journal reflection on most important shape characteristics. Connect to classification and description skills.",
      indigenousPerspectives: "Explore how Indigenous cultures have traditionally classified and described shapes in nature, tools, and art, developing sophisticated geometric vocabulary and understanding.",
      assessmentNotes: "☐ Student describes shape attributes accurately\n☐ Can identify sides, corners, curves\n☐ Uses geometric vocabulary correctly\n☐ Explains shape characteristics clearly\n☐ Makes attribute comparisons effectively"
    },
    {
      keywords: ["Shape Sorting"],
      mindsOn: "(8 minutes) Shape sorting warm-up with mixed collection of shapes. Explore different ways to group shapes. Discuss sorting criteria and reasoning.",
      action: "(27 minutes) Sort shapes using various attributes and criteria. Students practice classification skills and logical thinking through geometric organization.",
      consolidation: "(10 minutes) Share different sorting strategies used. Math journal reflection on best ways to organize shapes. Connect to organization and classification skills.",
      indigenousPerspectives: "Learn about traditional Indigenous classification systems and how geometric forms were organized and categorized for practical use in daily life and cultural practices.",
      assessmentNotes: "☐ Student sorts shapes using logical criteria\n☐ Can explain sorting reasoning\n☐ Uses multiple sorting strategies\n☐ Shows classification understanding\n☐ Demonstrates organizational thinking"
    },
    {
      keywords: ["Pattern Blocks"],
      mindsOn: "(8 minutes) Pattern block exploration and free building. Explore how pattern blocks fit together. Discuss the special properties of pattern blocks.",
      action: "(27 minutes) Work with pattern blocks to create designs, patterns, and structures. Students explore geometric relationships and spatial reasoning through guided play.",
      consolidation: "(10 minutes) Share amazing pattern block creations. Math journal reflection on favorite pattern block discoveries. Connect to tessellations and geometric design.",
      indigenousPerspectives: "Explore how traditional Indigenous designs use geometric shapes similar to pattern blocks, creating complex patterns that tell stories and represent cultural knowledge.",
      assessmentNotes: "☐ Student uses pattern blocks effectively\n☐ Creates purposeful designs\n☐ Shows spatial reasoning skills\n☐ Explains design choices\n☐ Demonstrates geometric understanding"
    },
    {
      keywords: ["Pattern Extension"],
      mindsOn: "(8 minutes) Pattern extension warm-up with partially completed patterns. Practice continuing patterns. Discuss what comes next and why.",
      action: "(27 minutes) Work with extending various types of patterns - color, shape, size, and movement patterns. Students develop pattern prediction and logical reasoning skills.",
      consolidation: "(10 minutes) Share successful pattern extensions. Math journal reflection on pattern extension strategies. Connect to prediction and logical thinking.",
      indigenousPerspectives: "Learn about how Indigenous cultures extend traditional patterns across generations, maintaining cultural continuity through mathematical pattern knowledge.",
      assessmentNotes: "☐ Student extends patterns correctly\n☐ Can predict pattern continuation\n☐ Explains pattern extension reasoning\n☐ Shows logical thinking skills\n☐ Applies extension strategies consistently"
    },
    {
      keywords: ["Symmetry"],
      mindsOn: "(8 minutes) Symmetry warm-up with body movements and folding activities. Explore what symmetry means. Use mirrors to investigate symmetrical objects.",
      action: "(27 minutes) Investigate symmetry through folding, cutting, drawing, and mirror work. Students explore symmetrical shapes, designs, and natural objects.",
      consolidation: "(10 minutes) Share beautiful symmetrical discoveries. Math journal reflection on symmetry in nature and art. Connect to balance and artistic design.",
      indigenousPerspectives: "Explore symmetry in traditional Indigenous art, architecture, and ceremonial objects, learning how balance and symmetry reflect cultural values and natural observations.",
      assessmentNotes: "☐ Student identifies symmetrical objects\n☐ Can create symmetrical designs\n☐ Understands concept of balance in symmetry\n☐ Explains symmetry clearly\n☐ Uses symmetry tools effectively (mirrors, folding)"
    },
    {
      keywords: ["Patterns in Nature"],
      mindsOn: "(8 minutes) Nature pattern warm-up with photos or observations of natural patterns. Explore patterns found outdoors. Discuss mathematics in nature.",
      action: "(27 minutes) Investigate patterns found in nature through observation, collection, and analysis. Students explore how mathematics appears in natural phenomena.",
      consolidation: "(10 minutes) Share amazing natural pattern discoveries. Math journal reflection on favorite nature patterns. Connect to environmental observation and science.",
      indigenousPerspectives: "Learn about Indigenous knowledge of patterns in nature, including seasonal patterns, animal behavior patterns, and celestial patterns used for navigation and timing.",
      assessmentNotes: "☐ Student identifies patterns in nature\n☐ Shows observation skills for natural phenomena\n☐ Can describe natural patterns clearly\n☐ Makes connections between math and nature\n☐ Demonstrates environmental awareness"
    },
    {
      keywords: ["Pattern Stories"],
      mindsOn: "(8 minutes) Pattern story warm-up with simple narratives involving patterns. Explore how patterns can tell stories. Use patterns to create mini-stories.",
      action: "(27 minutes) Create stories using patterns as characters, plots, or settings. Students combine creative storytelling with mathematical pattern understanding.",
      consolidation: "(10 minutes) Share creative pattern stories. Math journal reflection on favorite pattern story elements. Connect to creative writing and mathematical communication.",
      indigenousPerspectives: "Learn about Indigenous storytelling traditions that incorporate mathematical patterns, including how patterns in stories teach mathematical concepts and cultural values.",
      assessmentNotes: "☐ Student creates stories incorporating patterns\n☐ Shows creativity in combining math and narrative\n☐ Explains pattern story connections\n☐ Demonstrates mathematical communication\n☐ Uses patterns meaningfully in stories"
    },
    {
      keywords: ["Geometry Gallery", "Geometric Art"],
      mindsOn: "(8 minutes) Art gallery warm-up exploring geometric art examples. Discuss how mathematics and art connect. Appreciate geometric beauty in artistic creations.",
      action: "(27 minutes) Create geometric artwork using shapes, patterns, and mathematical principles. Students explore the artistic side of mathematics through creative expression.",
      consolidation: "(10 minutes) Gallery walk to admire geometric artwork created. Math journal reflection on mathematics as art. Connect to artistic expression and mathematical beauty.",
      indigenousPerspectives: "Explore traditional Indigenous geometric art forms, learning how mathematical principles were used to create beautiful and meaningful artistic expressions that carry cultural significance.",
      assessmentNotes: "☐ Student creates geometric art successfully\n☐ Shows appreciation for mathematical beauty\n☐ Combines mathematical concepts with creativity\n☐ Explains artistic choices using math vocabulary\n☐ Demonstrates understanding of math-art connections"
    }
  ];

  let updatedCount = 0;

  for (const lesson of lessons) {
    // Find the appropriate lesson update based on keywords in the title
    let lessonUpdate = lessonMappings.find(mapping => 
      mapping.keywords.some(keyword => lesson.title.includes(keyword))
    );

    // If no specific match found, use a general patterns and shapes approach
    if (!lessonUpdate) {
      lessonUpdate = {
        mindsOn: "(8 minutes) Patterns and shapes warm-up activity related to lesson focus. Engage students with concrete materials and exploration of geometric concepts.",
        action: "(27 minutes) Hands-on investigation of patterns and geometric concepts using manipulatives, art materials, and problem-solving activities. Students explore mathematical relationships through active learning.",
        consolidation: "(10 minutes) Share geometric discoveries and mathematical thinking. Math journal reflection on patterns and shapes learning. Connect to real-world applications.",
        indigenousPerspectives: "Explore Indigenous geometric knowledge and how traditional cultures have developed and shared understanding of patterns and shapes through art, architecture, and daily practices.",
        assessmentNotes: "☐ Student demonstrates geometric understanding\n☐ Uses mathematical concepts appropriately\n☐ Shows growth in spatial reasoning\n☐ Explains geometric thinking clearly\n☐ Applies learning to new situations"
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

  console.log(`\n🎉 Successfully updated ${updatedCount} lessons in Patterns and Shapes unit!`);
  console.log('All lessons now have:');
  console.log('- 45-minute duration (ETFO compliant)');
  console.log('- Explicit timing in mindsOn (8 min), action (27 min), consolidation (10 min)');
  console.log('- Comprehensive differentiation strategies for all learner types');
  console.log('- Meaningful Indigenous perspectives connecting geometry to traditional knowledge');
  console.log('- Observable assessment criteria with checkboxes');

  await prisma.$disconnect();
}

// Run the function
fixUnit3PatternsAndShapes().catch(console.error);