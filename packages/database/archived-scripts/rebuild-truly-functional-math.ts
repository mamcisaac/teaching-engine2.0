#!/usr/bin/env tsx

/**
 * REBUILD MATHEMATICS UNITS WITH PROPER TACTICAL DETAIL
 * Using lessons learned about what tactical documents should actually contain
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function rebuildFunctionalMath() {
  console.log('🔨 REBUILDING MATHEMATICS UNITS WITH PROPER TACTICAL DETAIL\n');
  console.log('Based on what actually serves lesson planners\n');
  console.log('===============================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      userId: emily.id
    },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  if (!mathLRP) return;
  
  // Get all math expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    where: {
      subject: 'Mathématiques',
      grade: 1
    },
    orderBy: { code: 'asc' }
  });
  
  const expectationMap = new Map<string, any>();
  expectations.forEach(exp => {
    expectationMap.set(exp.code, exp);
  });
  
  console.log('🎯 PRINCIPLES FOR TRULY FUNCTIONAL TACTICAL UNITS:\n');
  console.log('• Comprehensive big ideas that guide lesson planning');
  console.log('• Implementation guidance that bridges strategy to operations');
  console.log('• Specific assessment examples that help teachers know what to look for');
  console.log('• Materials suggestions that inform purchasing and preparation');
  console.log('• Learning progressions that show how understanding develops');
  console.log('• Differentiation guidance for diverse learners');
  console.log('• Enough detail to be genuinely useful\n');
  
  // Define truly functional tactical units
  const functionalUnits = [
    {
      title: 'Building Our Math Community',
      titleFr: 'Construire notre communauté mathématique',
      hours: 18,
      expectations: ['1.N3'],
      
      bigIdeas: `Mathematical thinking can be shared, discussed, and built upon collaboratively. Counting involves understanding one-to-one correspondence between number names and quantities. Every student brings mathematical knowledge and can contribute to our learning community. Mathematical materials are tools for exploration and demonstration of understanding. Trust and risk-taking are essential for mathematical growth.`,
      
      description: `September focus on establishing a classroom culture where mathematical thinking is valued and shared, while building foundational counting understanding.

Learning Progression:
Students begin by exploring mathematical materials freely, then engage in guided counting experiences, and progress toward sharing their mathematical thinking with others. The unit emphasizes belonging and community building while introducing core mathematical routines and vocabulary.`,
      
      assessmentPlan: `Observe students during material exploration: Are they engaging purposefully? Do they show curiosity about quantities and numbers?

Document counting development: Can students count objects using one-to-one correspondence? Do they understand that the last number said represents the total quantity?

Listen during mathematical discussions: Are students willing to share ideas? Do they show respect for others' thinking? Are they beginning to use mathematical vocabulary?

Portfolio evidence: Photos of students engaged with materials, video clips of counting explanations, initial self-portraits showing "I am a mathematician."`,
      
      keyActivities: `Core Mathematical Experiences:

Mathematical Material Exploration:
Students explore counting materials (buttons, shells, blocks) to build familiarity and discover mathematical properties. Teacher observes and notes natural counting behaviors and curiosities.

Number Talks and Sharing:
Daily brief conversations about quantities in the classroom. Students practice explaining their thinking using "I notice..." and "I wonder..." stems.

Counting Circle Experiences:
Group counting activities using movement, songs, and concrete objects. Focus on counting accuracy, one-to-one correspondence, and understanding that numbers have order.`,
      
      resources: `Materials for Implementation:

Counting Collections:
Various small objects in containers (buttons, shells, blocks, bears) - at least 10 different types with 50+ pieces each. Natural materials work well for engagement.

Visual Supports:
Number cards 0-10 with both numeral and dot representations. French number vocabulary cards with images. Counting mats or circles for organization.

Mathematical Tools:
Tens frames (large floor versions and individual student versions). Number lines showing 0-10. Fingers charts showing numbers 1-5.

Documentation Materials:
Digital camera for portfolio work. Chart paper for recording group discoveries. Individual math journals (primarily for drawing at this level).`,
      
      differentiation: `Supporting Diverse Learners:

Students Still Developing Counting:
Focus on smaller quantities (1-5). Use concrete objects they can manipulate. Pair with counting partners. Emphasize oral counting before written numerals.

Students Confident with Counting:
Extend to larger quantities (to 20). Introduce counting by 2s or 5s. Have them support other students as "counting coaches." Challenge with estimation activities.

Language Support:
Use visual supports and gestures with French vocabulary. Allow counting in home language initially while building French numbers. Create multilingual counting books.`,
      
      connections: `Cross-Curricular Integration:

French Language Arts: Number vocabulary development, oral communication skills, listening to mathematical stories.

Sciences: Counting natural objects during outdoor exploration, organizing scientific observations.

Arts: Creating number artwork, pattern making with mathematical materials.

Social Studies: Understanding classroom community roles, learning about each other through mathematical sharing.`
    },
    
    {
      title: 'Numbers All Around Us',
      titleFr: 'Les nombres autour de nous',
      hours: 22,
      expectations: ['1.N1', '1.N2'],
      
      bigIdeas: `Number sequences follow predictable patterns that help us count efficiently. Some quantities can be recognized instantly without counting each item (subitizing). Numbers exist everywhere in our environment and serve important purposes in daily life. Forward and backward counting skills support understanding of number relationships.`,
      
      description: `October exploration of number sequence patterns and instant quantity recognition in authentic contexts.

Learning Progression:
Students begin with oral counting practice, then explore visual patterns they can recognize instantly, and culminate in environmental number hunts. The unit builds fluency with number sequence while developing awareness of numbers in daily life.`,
      
      assessmentPlan: `Number sequence assessment: Can students count forward from 1 to 30? Can they count backward from 10? Do they continue sequences when starting from numbers other than 1?

Subitizing observations: Show dot patterns briefly. Can students identify quantities 1-6 without counting? Do they recognize common arrangements (dice patterns, finger patterns)?

Environmental number awareness: During number hunts, do students identify numbers in meaningful contexts? Can they explain what the numbers mean (addresses, prices, classroom labels)?`,
      
      keyActivities: `Core Learning Experiences:

Number Sequence Building:
Daily practice with forward and backward counting using number lines, hundreds chart, and movement activities. Students learn to "jump in" at any number and continue the sequence.

Subitizing Development:
Quick flash activities with dot patterns, domino faces, and finger arrangements. Students learn to "see" quantities without counting individual items.

Environmental Number Exploration:
Number hunts throughout school and community (through photos/virtual tours). Discussion of how numbers are used in different contexts (addresses, room numbers, prices).`,
      
      resources: `Implementation Materials:

Number Line Resources:
Floor number line 0-30 for whole group activities. Individual desk number lines 0-20. Hundreds chart (focus on first three rows).

Subitizing Materials:
Dot pattern cards 1-10 in various arrangements. Dice collection (regular and ten-frame dice). Domino set. Five and ten frame templates.

Environmental Number Tools:
Digital camera for number hunt documentation. Chart paper for recording discoveries. Number identification worksheets for practice.`,
      
      differentiation: `Adaptive Approaches:

Developing Number Sense:
Focus on 1-20 for counting sequences. Use physical movement and music for sequence learning. Provide more time with concrete counting before subitizing.

Advanced Number Sense:
Extend sequences to 50 or 100. Introduce skip counting by 2s and 5s. Challenge with backward counting from larger numbers.

Processing Differences:
Allow more time for subitizing recognition. Use larger visual displays. Provide verbal counting support when needed.`,
      
      connections: `Integrated Learning:

French: Environmental print reading, number vocabulary in context, describing locations using numbers.

Sciences: Data collection using number sequences, organizing observations with numbers.

Arts: Creating number pattern artwork, making number books.

Physical Education: Counting games with movement, using numbers for team organization.`
    },
    
    {
      title: 'Representing Numbers',
      titleFr: 'Représenter les nombres',
      hours: 20,
      expectations: ['1.N4'],
      
      bigIdeas: `The same number can be represented in multiple ways: concrete objects, pictures, and written symbols. Different representations help us understand different aspects of quantity and number relationships. Moving flexibly between representations demonstrates deep number understanding. Ten frames provide a visual structure for organizing and understanding quantities.`,
      
      description: `November focus on building flexibility with multiple number representations and deepening conceptual understanding.

Learning Progression:
Students begin with concrete representations using manipulatives, progress to pictorial representations through drawing and images, and connect both to symbolic representations (numerals and words). The unit emphasizes the connection between all three forms.`,
      
      assessmentPlan: `Three-way representation tasks: Given a number, can students show it with objects, draw it, and write the symbol? Can they move flexibly between all three forms?

Ten frame proficiency: Can students quickly show numbers using ten frames? Do they recognize ten frame patterns without counting individual dots?

Number building observations: When building numbers with materials, do students organize efficiently? Do they use grouping strategies (like making groups of 5 or 10)?

Portfolio documentation: Collection of student work showing the same numbers in multiple forms, evidence of growing symbol recognition.`,
      
      keyActivities: `Representational Learning:

Concrete Number Building:
Students use various manipulatives (cubes, bears, buttons) to build and represent numbers 1-20. Focus on accuracy and organization of materials.

Pictorial Representation Creation:
Drawing numbers using dots, tallies, pictures, and ten frames. Students create personal number books showing numbers in multiple visual forms.

Symbolic Connection Work:
Matching games connecting concrete quantities, pictures, numerals, and number words. Practice forming numerals with proper directionality.`,
      
      resources: `Materials for Multi-Modal Learning:

Concrete Manipulatives:
Unifix cubes, counting bears, two-color counters, natural materials. Variety supports engagement and different organizational approaches.

Pictorial Tools:
Ten frame templates (individual and large), dot markers, drawing materials. Number formation guides with directional arrows.

Symbolic Resources:
Number cards 0-20 with multiple fonts. French number word cards. Sandpaper numerals for tactile learners. Individual whiteboards for practice.`,
      
      differentiation: `Representation Support:

Concrete-Focused Learners:
Spend more time with manipulative work before moving to pictures. Use real objects that connect to student interests. Allow extended exploration time.

Visual Learners:
Provide lots of pictorial examples and templates. Use color coding to support organization. Create visual reference charts.

Abstract-Ready Students:
Introduce larger numbers (to 50). Challenge to find unique ways to represent the same number. Support teaching of other students.`,
      
      connections: `Representation Across Subjects:

Arts: Number representation artwork, creating illustrated number books, using numbers in visual designs.

Sciences: Representing data from experiments, showing quantities of collected items.

French: Number word recognition and writing, using numbers in descriptive writing.

Social Studies: Representing quantities in family and community contexts.`
    },
    
    {
      title: 'Celebrations with Numbers',
      titleFr: 'Célébrations avec les nombres',
      hours: 14,
      expectations: ['1.RR1'],
      
      bigIdeas: `Patterns are sequences that repeat in predictable ways. Holiday traditions and celebrations often contain mathematical patterns. Recognizing patterns helps us predict what comes next and understand structure in our world. Creating patterns develops logical thinking and mathematical reasoning.`,
      
      description: `December exploration of repeating patterns through holiday celebrations and cultural traditions.

Learning Progression:
Students begin by identifying simple AB patterns in decorations and traditions, then create their own celebration patterns, and conclude by extending and analyzing more complex patterns. The unit connects mathematics to cultural celebrations.`,
      
      assessmentPlan: `Pattern recognition assessment: Can students identify AB and ABC patterns in holiday contexts? Can they predict what comes next in a pattern sequence?

Pattern creation tasks: Can students create their own patterns using holiday materials? Do they understand that patterns repeat in the same sequence?

Pattern extension challenges: When shown a pattern, can students continue it accurately? Can they explain the pattern rule using their own words?`,
      
      keyActivities: `Pattern Exploration Experiences:

Holiday Pattern Hunt:
Students identify patterns in decorations, wrapping paper, cultural designs, and celebration traditions. Document discoveries through photos and drawings.

Pattern Creation Centers:
Using holiday materials (gift wrap, ribbon, ornaments), students create AB, ABC, and ABAB patterns. Share and explain their pattern rules.

Cultural Pattern Investigation:
Explore patterns in different cultural celebrations. Compare and contrast pattern traditions across families and communities.`,
      
      resources: `Pattern Materials:

Holiday Supplies:
Wrapping paper samples, ribbons, ornaments, craft materials. Variety of cultural celebration items when available.

Pattern Tools:
Pattern blocks, colored tiles, stickers. Pattern strips for recording. Pattern cards showing examples.

Documentation:
Chart paper for class pattern collection. Individual pattern journals. Digital camera for pattern hunt documentation.`,
      
      differentiation: `Pattern Learning Support:

Pattern Beginners:
Start with simple AB patterns using two very different items. Use movement and music to reinforce pattern concepts. Provide lots of modeling.

Pattern Advanced:
Introduce ABC and ABCD patterns. Challenge to create growing patterns. Have them teach pattern concepts to others.

Cultural Connections:
Honor diverse celebration traditions. Allow students to share patterns from their own cultural backgrounds. Create inclusive pattern displays.`,
      
      connections: `Pattern Integration:

Social Studies: Cultural celebration patterns, family traditions, community holiday observances.

Arts: Creating pattern artwork, decorating with mathematical patterns, holiday craft patterns.

Music: Rhythmic patterns in holiday songs, pattern instruments.

French: Pattern vocabulary, describing celebrations using pattern language.`
    },
    
    {
      title: 'Comparing and Ordering',
      titleFr: 'Comparer et ordonner',
      hours: 20,
      expectations: ['1.N5'],
      
      bigIdeas: `Quantities can be compared to determine which is greater, less, or equal. Comparison can happen without counting every item by using visual estimation and benchmark numbers. Mathematical language precisely describes relationships between quantities. Ordering numbers and quantities reveals patterns and relationships.`,
      
      description: `January development of comparison skills and understanding of quantity relationships.

Learning Progression:
Students begin with direct comparison of collections, progress to using mathematical language (plus que, moins que, égal à), and develop strategies for ordering quantities. The unit builds reasoning skills and mathematical vocabulary.`,
      
      assessmentPlan: `Comparison accuracy: Can students correctly identify which of two collections has more, less, or equal amounts? Do they use efficient comparison strategies?

Mathematical language use: Do students use "plus que," "moins que," and "égal à" correctly in context? Can they explain their comparison reasoning?

Ordering tasks: Can students put collections of different quantities in order from least to most? Do they explain their ordering process?`,
      
      keyActivities: `Comparison Learning:

Collection Comparison Games:
Students compare quantities of classroom objects, natural materials, and counting collections. Use both direct (side-by-side) and indirect comparison methods.

Mathematical Language Development:
Practice using comparison vocabulary in meaningful contexts. Create comparison books and charts. Play games requiring comparison language.

Ordering Challenges:
Given multiple collections, students arrange them from smallest to largest or vice versa. Discuss strategies for efficient ordering.`,
      
      resources: `Comparison Tools:

Collections for Comparison:
Various sized groups of similar objects (buttons, shells, blocks). Transparent containers to show quantities clearly. Natural materials from outdoor collection.

Visual Supports:
Comparison mats with "more," "less," "equal" sections. Balance scales for physical comparison. Number lines for reference.

Recording Materials:
Comparison recording sheets. Chart paper for class discoveries. Individual journals for comparison work.`,
      
      differentiation: `Comparison Support:

Developing Comparison Skills:
Use smaller quantities (to 10). Provide hands-on comparison tools. Allow extended exploration time with concrete materials.

Advanced Comparison:
Work with larger quantities (to 50). Introduce estimation before comparison. Challenge with three or more collections.

Language Development:
Provide visual supports for comparison vocabulary. Allow home language alongside French. Use gestures and actions to support understanding.`,
      
      connections: `Comparative Thinking:

Sciences: Comparing quantities of collected specimens, ordering by size or other attributes.

Social Studies: Comparing quantities in family and community contexts, understanding fairness.

Physical Education: Comparing scores, organizing teams by numbers.

French: Descriptive writing using comparison language, comparative literature discussions.`
    },
    
    {
      title: 'Number Relationships',
      titleFr: 'Relations entre les nombres',
      hours: 20,
      expectations: ['1.N6', '1.N7'],
      
      bigIdeas: `Numbers can be organized into equal groups with or without remainders. Understanding "one more" and "one less" helps us navigate number sequences efficiently. Numbers can be composed (put together) and decomposed (taken apart) in multiple ways. Number neighbors have special relationships that support mental math development.`,
      
      description: `February exploration of how numbers connect to and relate with each other.

Learning Progression:
Students begin with concrete grouping activities, develop understanding of number neighbors, and explore different ways to make the same number. The unit builds flexible thinking about number relationships.`,
      
      assessmentPlan: `Equal grouping understanding: Can students create equal groups from a collection? Do they understand what "remainder" means in grouping contexts?

Number neighbor knowledge: Given a number, can students quickly identify one more and one less? Do they use this knowledge to help with counting?

Number composition flexibility: Can students show different ways to make the same number (e.g., 7 as 5+2, 4+3, 6+1)? Do they understand that these are all equivalent?`,
      
      keyActivities: `Relationship Exploration:

Equal Groups Investigation:
Students explore sharing collections equally among groups, discovering concepts of remainders and fair sharing. Connect to real-world sharing scenarios.

Number Neighbor Games:
Activities focusing on "one more" and "one less" relationships. Use number lines, hundreds charts, and concrete materials to visualize relationships.

Number Composition Exploration:
Using two-color counters and other materials, students discover different ways to make the same total. Record discoveries and look for patterns.`,
      
      resources: `Relationship Materials:

Grouping Materials:
Two-color counters, small containers for grouping, sharing mats. Various small objects that can be organized into equal groups.

Number Line Tools:
Floor number line, individual number lines, hundreds chart. Number neighbor reference cards.

Composition Tools:
Ten frames, part-part-whole mats, Cuisenaire rods. Recording sheets for number combinations.`,
      
      differentiation: `Relationship Support:

Concrete Learners:
Use hands-on materials for all relationship exploration. Focus on smaller numbers initially. Provide step-by-step guidance for grouping activities.

Abstract Thinkers:
Challenge with larger numbers and more complex groupings. Introduce formal recording of number relationships. Support discovery of patterns.

Processing Support:
Allow extended time for exploration. Use visual representations consistently. Break complex tasks into smaller steps.`,
      
      connections: `Relational Mathematics:

Social Studies: Fair sharing in community contexts, understanding equality and fairness concepts.

Arts: Creating equal groups in artistic arrangements, exploring symmetry as number relationships.

Sciences: Organizing data into groups, understanding relationships in natural patterns.

French: Using relationship vocabulary in descriptive contexts, explaining mathematical reasoning orally.`
    },
    
    {
      title: 'Exploring Measurement',
      titleFr: 'Explorer la mesure',
      hours: 15,
      expectations: ['1.FE1'],
      
      bigIdeas: `Measurement involves comparing objects to understand their attributes (length, height, weight). Direct comparison helps us understand relative size without using standard units. Non-standard units can be used to measure when standard units aren't available. Measurement vocabulary helps us describe and compare our world precisely.`,
      
      description: `March introduction to measurement as a comparison process using non-standard units.

Learning Progression:
Students begin with direct comparison activities, progress to using non-standard measuring tools, and develop measurement vocabulary. The unit emphasizes understanding measurement concepts before introducing standard units.`,
      
      assessmentPlan: `Direct comparison skills: Can students compare objects directly to determine which is longer, shorter, taller, heavier? Do they understand that measurement is about comparison?

Non-standard unit use: Can students use paper clips, blocks, or other units to measure length? Do they understand that measurement units must be consistent?

Measurement vocabulary: Do students use "longer," "shorter," "heavier," "lighter" correctly? Can they explain their measurement findings?`,
      
      keyActivities: `Measurement Exploration:

Direct Comparison Activities:
Students compare classroom objects directly by placing them side by side or using balance scales. Focus on accurate comparison and measurement vocabulary.

Non-Standard Unit Measuring:
Using paper clips, blocks, or other consistent units, students measure various objects around the classroom. Record findings and compare results.

Measurement Problem Solving:
Real-world measurement challenges such as "How many books tall is our door?" or "Which container holds more blocks?"`,
      
      resources: `Measurement Tools:

Comparison Materials:
Various objects for direct comparison (ribbons, blocks, books). Balance scales for weight comparison.

Non-Standard Units:
Paper clips, unifix cubes, large buttons, craft sticks. Objects should be identical in size for consistent measuring.

Recording Tools:
Measurement recording sheets, chart paper for class discoveries. Individual measurement journals.`,
      
      differentiation: `Measurement Support:

Developing Measurers:
Focus on direct comparison before introducing units. Use larger, easier-to-handle materials. Provide lots of modeling and guided practice.

Measurement-Ready:
Challenge with multiple units for the same object. Introduce estimation before measuring. Have them create measurement challenges for others.

Fine Motor Support:
Provide adaptive tools for students with dexterity challenges. Use larger measurement units. Allow collaborative measuring.`,
      
      connections: `Measurement Applications:

Sciences: Measuring specimens and natural objects, comparing growth over time.

Arts: Measuring materials for projects, creating measurement-based artwork.

Physical Education: Measuring distances in games, comparing heights and lengths.

Social Studies: Measurement in daily life contexts, understanding how families use measurement.`
    },
    
    {
      title: 'Introduction to Operations',
      titleFr: 'Introduction aux opérations',
      hours: 22,
      expectations: ['1.N8'],
      
      bigIdeas: `Addition means combining or putting together quantities to find a total. Subtraction means separating or taking away part of a quantity. Operations can be represented with concrete materials, pictures, and symbols. Story problems help us understand when to use each operation. Addition and subtraction are related operations (inverse relationship).`,
      
      description: `April introduction to addition and subtraction through concrete modeling and story contexts.

Learning Progression:
Students begin with physical modeling of combining and separating, progress to story problem contexts, and connect to symbolic representation. The unit emphasizes conceptual understanding before procedural fluency.`,
      
      assessmentPlan: `Operation modeling: Can students show addition and subtraction using concrete materials? Do they understand the difference between combining and separating?

Story problem understanding: Can students identify whether a story problem requires addition or subtraction? Can they model the problem and explain their thinking?

Symbolic connections: Can students connect addition and subtraction symbols (+, -, =) to their concrete and story work? Do they understand what each symbol means?`,
      
      keyActivities: `Operations Learning:

Concrete Modeling Experiences:
Students use manipulatives to model "putting together" (addition) and "taking away" (subtraction) scenarios. Focus on understanding the operations conceptually.

Story Problem Exploration:
Acting out and solving addition and subtraction stories using concrete materials. Students create their own story problems for others to solve.

Symbolic Introduction:
Connecting the concrete and story work to mathematical symbols. Introduction to addition and subtraction notation in meaningful contexts.`,
      
      resources: `Operations Materials:

Manipulatives for Operations:
Two-color counters, unifix cubes, small toys for story problems. Materials should be easy to combine and separate.

Story Problem Props:
Small objects for acting out problems, story problem picture cards. Real-world items that connect to student experiences.

Symbolic Tools:
Large operation symbols for floor work, individual operation cards. Part-part-whole mats for organizing thinking.`,
      
      differentiation: `Operations Support:

Concrete-Dependent:
Keep all work with physical materials. Use smaller numbers (sums to 5). Provide extra modeling and guided practice.

Ready for Abstraction:
Work with larger numbers (sums to 20). Introduce mental math strategies. Challenge to create story problems for others.

Language Development:
Use visual supports for operation vocabulary. Allow demonstration when verbal explanation is challenging. Connect to home language concepts.`,
      
      connections: `Operational Thinking:

Sciences: Addition and subtraction in data collection, combining and separating quantities in experiments.

Social Studies: Fair sharing problems, understanding addition and subtraction in community contexts.

Arts: Using operations in artistic arrangements, creating visual representations of math stories.

French: Operation vocabulary development, creating mathematical stories in French.`
    },
    
    {
      title: 'Mental Math and Shapes',
      titleFr: 'Calcul mental et formes',
      hours: 22,
      expectations: ['1.N9', '1.FE2'],
      
      bigIdeas: `Mental math strategies help us solve problems efficiently without paper or calculators. Different strategies work better for different problems and different people. Shapes have attributes (sides, corners, curves) that help us identify and sort them. Two-dimensional and three-dimensional shapes exist throughout our environment.`,
      
      description: `May development of mental math strategies alongside geometric shape understanding.

Learning Progression:
Students explore various mental math strategies (counting on, doubles, making 10), while simultaneously investigating shape attributes and sorting. The unit builds efficiency and geometric awareness.`,
      
      assessmentPlan: `Mental math strategy use: Can students use counting on, doubles, or other strategies to solve problems? Can they explain which strategy they prefer and why?

Shape identification and sorting: Can students identify basic 2D and 3D shapes? Can they sort shapes by attributes and explain their sorting rules?

Strategy flexibility: Do students try different strategies when one doesn't work? Do they choose efficient strategies for different problems?`,
      
      keyActivities: `Strategy and Shape Development:

Mental Math Strategy Exploration:
Students learn and practice counting on, doubles facts, making 10, and other Grade 1-appropriate strategies. Focus on understanding and choice.

Shape Attribute Investigation:
Hands-on exploration of 2D and 3D shapes, focusing on sides, corners, curves, faces, edges, and vertices. Sort shapes by various attributes.

Real-World Applications:
Finding shapes in the environment, using mental math in daily scenarios. Connect both concepts to practical situations.`,
      
      resources: `Strategy and Shape Materials:

Mental Math Tools:
Number lines, ten frames, double dominoes. Manipulatives that support strategy development.

Shape Collections:
2D shape sets, 3D shape manipulatives, shape sorting mats. Real-world objects representing various shapes.

Recording Materials:
Strategy recording sheets, shape attribute charts. Individual journals for strategy preferences and shape discoveries.`,
      
      differentiation: `Dual-Focus Support:

Strategy Development:
Some students focus on concrete counting while others explore abstract strategies. Provide choices in strategy use.

Shape Learning:
Use tactile shape exploration for kinesthetic learners. Provide shape reference charts for visual support. Allow extended exploration time.

Integrated Learning:
Help students see connections between shapes and numbers (triangles have 3 sides, squares have 4 equal sides).`,
      
      connections: `Strategic and Spatial Thinking:

Arts: Using shapes in artistic creation, applying mental math to art projects.

Sciences: Identifying shapes in nature, using mental math for quick data calculations.

Physical Education: Shape recognition in movement activities, mental math in score keeping.

Architecture: Exploring shapes in buildings, using mental math to understand spatial relationships.`
    },
    
    {
      title: 'Patterns and Equality',
      titleFr: 'Motifs et égalité',
      hours: 12,
      expectations: ['1.RR2', '1.RR3'],
      
      bigIdeas: `The same pattern can be represented in multiple ways (colors, shapes, sounds, movements). Converting patterns between different representations maintains the pattern rule. Equality means "the same amount" and can be shown through balance and fair arrangements. Understanding equality prepares us for understanding equations.`,
      
      description: `June exploration of pattern representations and introduction to equality concepts.

Learning Progression:
Students work with converting patterns between different forms (visual to auditory, concrete to abstract), while exploring equality through balance activities. The unit culminates the year with celebration of mathematical growth.`,
      
      assessmentPlan: `Pattern conversion skills: Can students change a color pattern to a shape pattern while keeping the same rule? Can they represent movement patterns with objects?

Equality understanding: Do students understand that equality means "same amount"? Can they create equal arrangements and explain balance?

Year-end growth documentation: Portfolio review showing mathematical growth from September. Celebration of individual mathematical achievements.`,
      
      keyActivities: `Pattern and Balance Exploration:

Pattern Representation Conversion:
Students change patterns from one form to another (clapping patterns become color patterns, shape patterns become movement patterns).

Equality and Balance Investigation:
Using balance scales and equal-sharing activities, students explore what "equal" means in various contexts.

Mathematical Growth Celebration:
Portfolio review, mathematical achievement recognition, summer mathematical goal setting.`,
      
      resources: `End-of-Year Materials:

Pattern Conversion Tools:
Various materials for representing patterns (colors, shapes, instruments, movement props). Pattern recording sheets.

Balance Materials:
Balance scales, equal sharing mats, collections for balancing activities.

Celebration Supplies:
Portfolio materials, certificates for mathematical growth, mathematical games for celebration.`,
      
      differentiation: `Culminating Support:

Pattern Mastery:
Some students work with simple AB conversions while others tackle complex pattern changes. Celebrate all levels of achievement.

Equality Concepts:
Use concrete balance scales for tactile learners. Provide visual representations of equality. Allow collaborative exploration.

Growth Recognition:
Celebrate individual growth rather than comparing students. Help each child see their mathematical progress.`,
      
      connections: `Culminating Integration:

All Subjects: Patterns and equality appear across the curriculum. Mathematics connects to every area of learning.

Family Connections: Sharing mathematical learning with families. Planning summer mathematical explorations.

Future Learning: Preparing for Grade 2 mathematics while celebrating Grade 1 achievements.`
    }
  ];
  
  console.log(`🔨 Rebuilding ${functionalUnits.length} units with comprehensive tactical detail...\n`);
  
  // Update each existing unit with functional content
  for (let i = 0; i < mathLRP.unitPlans.length && i < functionalUnits.length; i++) {
    const unit = mathLRP.unitPlans[i];
    const spec = functionalUnits[i];
    
    console.log(`Rebuilding Unit ${i + 1}: ${spec.title}`);
    console.log(`  Big Ideas: ${spec.bigIdeas.length} chars`);
    console.log(`  Description: ${spec.description.length} chars`);
    console.log(`  Assessment: ${spec.assessmentPlan.length} chars`);
    console.log(`  Implementation Guidance: Included`);
    
    // Update with comprehensive tactical content
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: {
        title: spec.title,
        titleFr: spec.titleFr,
        estimatedHours: spec.hours,
        bigIdeas: spec.bigIdeas,
        description: spec.description,
        assessmentPlan: spec.assessmentPlan,
        priorKnowledge: spec.keyActivities,
        culminatingTask: spec.resources,
        differentiationStrategies: JSON.stringify([spec.differentiation]),
        crossCurricularConnections: spec.connections
      }
    });
    
    // Update expectations
    await prisma.unitPlanExpectation.deleteMany({
      where: { unitPlanId: unit.id }
    });
    
    for (const expCode of spec.expectations) {
      const expectation = expectationMap.get(expCode);
      if (expectation) {
        await prisma.unitPlanExpectation.create({
          data: {
            unitPlanId: unit.id,
            expectationId: expectation.id
          }
        });
      }
    }
    
    console.log(`  ✅ Rebuilt with ${spec.expectations.length} expectation(s)\n`);
  }
  
  console.log('🎯 TRULY FUNCTIONAL MATHEMATICS UNITS REBUILT!\n');
  console.log('Key improvements from minimal versions:');
  console.log('  ✓ Comprehensive big ideas that guide lesson planning');
  console.log('  ✓ Detailed learning progressions showing development');
  console.log('  ✓ Specific assessment examples teachers can use');
  console.log('  ✓ Materials lists that inform preparation');
  console.log('  ✓ Implementation activities that bridge to operations');
  console.log('  ✓ Differentiation guidance for diverse learners');
  console.log('  ✓ Cross-curricular connections');
  console.log('  ✓ Enough detail to be genuinely useful\n');
  
  console.log('Ready for functional assessment validation!');
  
  await prisma.$disconnect();
}

rebuildFunctionalMath().catch(console.error);