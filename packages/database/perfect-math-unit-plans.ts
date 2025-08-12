#!/usr/bin/env tsx

/**
 * CREATE PERFECT MATHEMATICS UNIT PLANS
 * True tactical documents that bridge strategy and operations
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function perfectMathUnitPlans() {
  console.log('🎯 CREATING PERFECT MATHEMATICS UNIT PLANS\n');
  console.log('Tactical bridges between strategic LRP and operational lessons\n');
  console.log('===========================================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) return;
  
  const mathLRP = await prisma.longRangePlan.findFirst({
    where: { 
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      userId: emily.id
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
  
  // Create expectation map for easy lookup
  const expectationMap = new Map<string, any>();
  expectations.forEach(exp => {
    expectationMap.set(exp.code, exp);
  });
  
  console.log(`Found ${expectations.length} mathematics expectations to distribute\n`);
  
  // Delete existing units and recreate perfectly
  await prisma.unitPlan.deleteMany({
    where: { longRangePlanId: mathLRP.id }
  });
  
  // Define perfect tactical unit plans
  const perfectUnits = [
    {
      title: 'Building Our Math Community',
      titleFr: 'Construire notre communauté mathématique',
      hours: 18,
      start: new Date('2025-09-03'),
      end: new Date('2025-09-30'),
      expectations: ['1.N3'], // Understanding counting
      bigIdeas: `Mathematics is part of our daily lives. We are all mathematicians.
      
Key Understandings:
• Counting connects to quantity and has meaning
• Mathematical routines help us explore numbers
• Sharing mathematical thinking builds community`,
      
      description: `September focus: Establishing mathematical community and foundational counting concepts.
      
Learning Journey:
• Introduction to math materials and exploration
• Counting in meaningful contexts (classroom objects, students)
• Beginning number talks and sharing mathematical thinking
• Building comfort with mathematical vocabulary in French`,
      
      assessmentPlan: `Assessment Focus: Foundational Skills & Comfort
      
Formative:
• Observe counting behaviors during exploration
• Document comfort level with math materials
• Note participation in number talks
• Photo evidence of mathematical thinking

Summative:
• Counting interview (1-10)
• Math community reflection
• Beginning portfolio entries`,
      
      keyActivities: `Core Learning Experiences:
      
Mathematical Routines:
• Morning number of the day
• Counting circles with movement
• Math material exploration centers
• Number stories and songs

Community Building:
• Math autobiography sharing
• Establishing math talk norms
• Creating classroom counting collections
• Introduction to math journals`,
      
      resources: `Materials & Resources:
      
Essential:
• Counting collections (buttons, shells, etc.)
• Number cards 0-10
• Math journals/paper
• French counting songs and books
• Manipulatives for free exploration

Optional:
• Digital counting resources
• Community math walk materials
• Family math letter templates`,
      
      differentiation: `Supporting All Learners:
      
Beginning Counters:
• Focus on 1-5 with concrete objects
• Use movement and songs
• Pair with counting buddies

Confident Counters:
• Extend to counting by 2s, 5s
• Explore different counting patterns
• Lead counting activities`,
      
      integration: `Cross-Curricular Connections:
      • French: Counting vocabulary, number songs
      • Sciences: Counting natural objects
      • Arts: Number art and patterns
      • Social Studies: Classroom community roles`
    },
    
    {
      title: 'Numbers All Around Us',
      titleFr: 'Les nombres autour de nous',
      hours: 22,
      start: new Date('2025-10-01'),
      end: new Date('2025-10-31'),
      expectations: ['1.N1', '1.N2'], // Number sequence, subitizing
      bigIdeas: `Numbers have order and can be recognized in different arrangements.
      
Key Understandings:
• Number sequence has patterns and rules
• We can "see" numbers without counting (subitizing)
• Numbers exist everywhere in our environment`,
      
      description: `October focus: Developing number sequence understanding and instant recognition.
      
Learning Journey:
• Exploring number sequence forward and backward (0-100)
• Developing instant recognition of dot patterns
• Number hunts in school and community
• Creating and reading number arrangements`,
      
      assessmentPlan: `Assessment Focus: Number Recognition & Sequence
      
Formative:
• Number sequence observations (oral counting)
• Subitizing quick flash assessments
• Number hunt documentation
• Peer teaching observations

Summative:
• Number sequence assessment (0-30)
• Subitizing check (1-10 arrangements)
• Number environment portfolio`,
      
      keyActivities: `Core Learning Experiences:
      
Number Sequence:
• Counting along number lines
• Skip counting explorations
• Number sequence games and songs
• Counting up and down activities

Subitizing Development:
• Dot pattern quick looks
• Dice and domino recognition
• Finger pattern games
• Ten frame introductions`,
      
      resources: `Materials & Resources:
      
Essential:
• Number lines (0-100)
• Dot pattern cards
• Dice, dominoes, ten frames
• Environmental number photos
• French number vocabulary cards

Optional:
• Digital number games
• Number sequence books
• Counting manipulatives`,
      
      differentiation: `Supporting All Learners:
      
Developing Sequence:
• Focus on smaller ranges (0-20)
• Use physical movement
• Provide visual supports

Advanced Sequence:
• Explore counting by 2s, 5s, 10s
• Count backwards from larger numbers
• Investigate number patterns`,
      
      integration: `Cross-Curricular Connections:
      • French: Number vocabulary building
      • Art: Number arrangement artwork
      • Music: Counting songs and rhythms
      • PE: Movement counting games`
    },
    
    {
      title: 'Representing Numbers',
      titleFr: 'Représenter les nombres',
      hours: 20,
      start: new Date('2025-11-03'),
      end: new Date('2025-11-28'),
      expectations: ['1.N4'], // Represent numbers to 20
      bigIdeas: `Numbers can be shown in many different ways - concrete, pictures, and symbols.
      
Key Understandings:
• The same number can be represented multiple ways
• Different representations help us understand quantity
• Moving from concrete to abstract builds number sense`,
      
      description: `November focus: Multiple representations of numbers using concrete, pictorial, and symbolic forms.
      
Learning Journey:
• Building numbers with manipulatives
• Drawing numbers in different ways
• Connecting concrete to symbols
• Creating number books and displays`,
      
      assessmentPlan: `Assessment Focus: Number Representation Flexibility
      
Formative:
• Three-way representation tasks
• Building number observations
• Number book creation process
• Peer explanation documentation

Summative:
• Multi-representation portfolio
• Number building assessment (1-20)
• "Show me this number" demonstrations`,
      
      keyActivities: `Core Learning Experiences:
      
Concrete Representations:
• Building numbers with various materials
• Number creation stations
• Manipulative number challenges
• Tactile number experiences

Pictorial Representations:
• Number drawings and artwork
• Ten frame representations
• Tally mark explorations
• Number story illustrations

Symbolic Connections:
• Matching concrete to symbols
• Number formation practice
• Number word connections
• Multi-representation games`,
      
      resources: `Materials & Resources:
      
Essential:
• Various counting manipulatives
• Ten frames and counters
• Drawing materials
• Number cards and symbols
• Number formation guides

Optional:
• Play dough for building
• Nature materials for representing
• Technology representation tools`,
      
      differentiation: `Supporting All Learners:
      
Concrete Focused:
• Stay with manipulatives longer
• Use larger, easier-to-handle materials
• Focus on smaller numbers (1-10)

Abstract Ready:
• Explore larger numbers (to 100)
• Create their own representation methods
• Help others make connections`,
      
      integration: `Cross-Curricular Connections:
      • Art: Number representation artwork
      • French: Number word vocabulary
      • Science: Representing data collections
      • Social Studies: Numbers in our community`
    },
    
    {
      title: 'Celebrations with Numbers',
      titleFr: 'Célébrations avec les nombres',
      hours: 14,
      start: new Date('2025-12-01'),
      end: new Date('2025-12-19'),
      expectations: ['1.RR1'], // Repeating patterns
      bigIdeas: `Patterns are everywhere in our celebrations and help us predict what comes next.
      
Key Understandings:
• Patterns repeat in predictable ways
• Holiday traditions often follow patterns
• We can create and extend patterns`,
      
      description: `December focus: Exploring repeating patterns through holiday celebrations and traditions.
      
Learning Journey:
• Identifying patterns in holiday decorations
• Creating celebration patterns with various materials
• Exploring cultural pattern traditions
• Pattern games and activities`,
      
      assessmentPlan: `Assessment Focus: Pattern Recognition & Creation
      
Formative:
• Pattern hunts documentation
• Pattern creation observations
• Holiday pattern portfolios
• Pattern extension tasks

Summative:
• Create and extend pattern assessment
• Holiday pattern project
• Pattern explanation videos`,
      
      keyActivities: `Core Learning Experiences:
      
Pattern Recognition:
• Holiday decoration pattern hunts
• Music and movement patterns
• Cultural pattern explorations
• Gift wrapping pattern investigations

Pattern Creation:
• Holiday craft patterns
• Cooking pattern activities
• Movement pattern games
• Art pattern projects`,
      
      resources: `Materials & Resources:
      
Essential:
• Pattern blocks and materials
• Holiday craft supplies
• Cultural pattern examples
• Music for pattern activities

Optional:
• Digital pattern games
• Community pattern photos
• Family pattern sharing`,
      
      differentiation: `Supporting All Learners:
      
Beginning Patterns:
• Simple AB patterns
• Use concrete materials
• Focus on 2-element patterns

Advanced Patterns:
• Complex ABAB or ABC patterns
• Create original patterns
• Identify patterns in nature`,
      
      integration: `Cross-Curricular Connections:
      • Social Studies: Cultural celebration patterns
      • Art: Pattern artwork and crafts
      • Music: Rhythmic patterns
      • French: Pattern vocabulary`
    },
    
    {
      title: 'Comparing and Ordering',
      titleFr: 'Comparer et ordonner',
      hours: 20,
      start: new Date('2026-01-06'),
      end: new Date('2026-01-30'),
      expectations: ['1.N5'], // Compare sets to 20
      bigIdeas: `We can compare groups of objects to determine which has more, less, or the same amount.
      
Key Understandings:
• Comparing helps us understand quantity relationships
• We can compare without counting everything
• Comparison language is important for mathematical thinking`,
      
      description: `January focus: Developing comparison skills and understanding relative quantity.
      
Learning Journey:
• Comparing collections and sets
• Using comparison vocabulary (plus que, moins que, égal à)
• Ordering numbers and quantities
• Problem solving with comparison`,
      
      assessmentPlan: `Assessment Focus: Comparison Strategies & Language
      
Formative:
• Comparison task observations
• Mathematical language use
• Problem-solving documentation
• Peer discussion participation

Summative:
• Comparison problem-solving tasks
• Collection comparison portfolio
• Mathematical language assessment`,
      
      keyActivities: `Core Learning Experiences:
      
Direct Comparison:
• Side-by-side collection comparisons
• More/less/equal investigations
• Number line comparison activities
• Real-world comparison problems

Indirect Comparison:
• Using benchmarks (5, 10)
• Estimation before comparison
• Visual comparison strategies
• Comparison reasoning games`,
      
      resources: `Materials & Resources:
      
Essential:
• Various counting collections
• Comparison mats and tools
• Number lines for reference
• French comparison vocabulary cards

Optional:
• Balance scales for comparison
• Digital comparison activities
• Comparison story books`,
      
      differentiation: `Supporting All Learners:
      
Developing Comparison:
• Use smaller numbers (to 10)
• Provide visual supports
• Use concrete materials

Advanced Comparison:
• Compare larger sets (to 50)
• Use estimation strategies
• Create comparison problems`,
      
      integration: `Cross-Curricular Connections:
      • Science: Comparing natural collections
      • Physical Education: Team comparisons
      • French: Comparison vocabulary
      • Social Studies: Community comparisons`
    },
    
    {
      title: 'Number Relationships',
      titleFr: 'Relations entre les nombres',
      hours: 20,
      start: new Date('2026-02-02'),
      end: new Date('2026-02-27'),
      expectations: ['1.N6', '1.N7'], // Equal groups, more/less relationships
      bigIdeas: `Numbers can be grouped in different ways and have relationships with other numbers.
      
Key Understandings:
• Numbers can be broken apart and put together
• Understanding "one more" and "one less" builds number sense
• Equal groups help us understand number structure`,
      
      description: `February focus: Exploring how numbers relate to each other and can be grouped.
      
Learning Journey:
• Creating equal groups with and without remainders
• Investigating one more/one less relationships
• Building understanding of number neighbors
• Exploring flexible thinking about numbers`,
      
      assessmentPlan: `Assessment Focus: Number Relationships & Flexibility
      
Formative:
• Equal grouping observations
• More/less reasoning documentation
• Number relationship discussions
• Flexible thinking examples

Summative:
• Number relationship portfolio
• Equal groups demonstration
• More/less problem solving`,
      
      keyActivities: `Core Learning Experiences:
      
Equal Groups:
• Sharing equally activities
• Group-making investigations
• Fair sharing problems
• Remainder explorations

Number Relationships:
• One more/one less games
• Number neighbor investigations
• Number line jumping
• Relationship reasoning tasks`,
      
      resources: `Materials & Resources:
      
Essential:
• Grouping manipulatives
• Number lines and tracks
• Sharing scenario materials
• Recording sheets and journals

Optional:
• Digital grouping activities
• Story books about sharing
• Game materials for relationships`,
      
      differentiation: `Supporting All Learners:
      
Concrete Focused:
• Use physical materials for all tasks
• Focus on smaller numbers (to 10)
• Provide step-by-step guidance

Abstract Ready:
• Work with larger numbers (to 50)
• Explore multiple grouping strategies
• Create their own problems`,
      
      integration: `Cross-Curricular Connections:
      • Social Studies: Fair sharing in community
      • Art: Equal groups in artistic patterns
      • Physical Education: Team grouping
      • French: Relationship vocabulary`
    },
    
    {
      title: 'Introduction to Operations',
      titleFr: 'Introduction aux opérations',
      hours: 22,
      start: new Date('2026-03-02'),
      end: new Date('2026-04-30'),
      expectations: ['1.N8'], // Addition and subtraction to 20
      bigIdeas: `Addition means putting together, subtraction means taking away, and they are related operations.
      
Key Understandings:
• Addition and subtraction are opposite operations
• We can use concrete materials to show operations
• Story problems help us understand when to add or subtract`,
      
      description: `March-April focus: Building understanding of addition and subtraction through concrete experiences.
      
Learning Journey:
• Exploring putting together and taking apart
• Acting out addition and subtraction stories
• Using manipulatives to model operations
• Connecting operations to real-world situations`,
      
      assessmentPlan: `Assessment Focus: Operation Understanding & Problem Solving
      
Formative:
• Operation modeling observations
• Story problem reasoning
• Strategy explanation documentation
• Peer collaboration evidence

Summative:
• Operation demonstration tasks
• Story problem solving portfolio
• Addition/subtraction understanding check`,
      
      keyActivities: `Core Learning Experiences:
      
Concrete Operations:
• Put together/take apart activities
• Story problem acting
• Manipulative modeling
• Real-world operation tasks

Operation Connections:
• Addition/subtraction relationships
• Fact family introductions
• Inverse operation explorations
• Operation choice reasoning`,
      
      resources: `Materials & Resources:
      
Essential:
• Various manipulatives for operations
• Story problem picture cards
• Recording materials
• Addition/subtraction mats

Optional:
• Digital operation games
• Operation story books
• Real-world problem materials`,
      
      differentiation: `Supporting All Learners:
      
Concrete Needed:
• Use manipulatives for all operations
• Focus on smaller numbers (to 10)
• Provide operation templates

Ready for Abstract:
• Work with numbers to 20
• Explore multiple strategies
• Create their own problems`,
      
      integration: `Cross-Curricular Connections:
      • Science: Data collection operations
      • Physical Education: Score keeping
      • Art: Addition in art projects
      • Social Studies: Community problem solving`
    },
    
    {
      title: 'Mental Math Strategies',
      titleFr: 'Stratégies de calcul mental',
      hours: 15,
      start: new Date('2026-05-01'),
      end: new Date('2026-05-29'),
      expectations: ['1.N9'], // Mental math strategies
      bigIdeas: `There are many strategies for solving problems in our heads, and we can choose which ones work best.
      
Key Understandings:
• Mental math uses thinking strategies, not just memorization
• Different strategies work for different problems
• Sharing strategies helps everyone learn`,
      
      description: `May focus: Developing and sharing mental math strategies for efficient problem solving.
      
Learning Journey:
• Exploring counting on and counting back
• Using doubles and near doubles
• Investigating making 10 strategies
• Sharing and comparing different approaches`,
      
      assessmentPlan: `Assessment Focus: Strategy Development & Explanation
      
Formative:
• Strategy use observations
• Mathematical reasoning discussions
• Strategy sharing documentation
• Problem-solving approach notes

Summative:
• Mental math strategy demonstration
• Strategy explanation portfolio
• Problem-solving flexibility check`,
      
      keyActivities: `Core Learning Experiences:
      
Strategy Development:
• Counting strategies exploration
• Doubles pattern investigations
• Making 10 activities
• Strategy choice reasoning

Strategy Sharing:
• Math talk discussions
• Strategy demonstration
• Peer strategy teaching
• Strategy comparison activities`,
      
      resources: `Materials & Resources:
      
Essential:
• Ten frames for making 10
• Doubles cards and materials
• Number lines for counting strategies
• Strategy recording sheets

Optional:
• Digital strategy games
• Strategy poster materials
• Mental math story books`,
      
      differentiation: `Supporting All Learners:
      
Strategy Beginners:
• Focus on counting strategies
• Use concrete supports
• Practice one strategy at a time

Strategy Advanced:
• Explore multiple strategies per problem
• Compare strategy efficiency
• Create strategy guides for others`,
      
      integration: `Cross-Curricular Connections:
      • Physical Education: Quick calculation games
      • Science: Measurement estimations
      • Art: Pattern strategy connections
      • French: Strategy explanation vocabulary`
    },
    
    {
      title: 'Patterns in Many Forms',
      titleFr: 'Les motifs sous plusieurs formes',
      hours: 12,
      start: new Date('2026-06-02'),
      end: new Date('2026-06-20'),
      expectations: ['1.RR2', '1.RR3'], // Pattern representations, equality
      bigIdeas: `Patterns can be shown in different ways, and balance helps us understand equality.
      
Key Understandings:
• The same pattern can be represented many ways
• Equality means balanced or the same
• We can convert patterns from one form to another`,
      
      description: `June focus: Exploring pattern representations and beginning understanding of equality.
      
Learning Journey:
• Converting patterns between different representations
• Exploring balance and equality concepts
• Creating pattern artwork and displays
• Celebrating pattern discoveries`,
      
      assessmentPlan: `Assessment Focus: Pattern Flexibility & Equality Understanding
      
Formative:
• Pattern conversion observations
• Balance exploration documentation
• Equality reasoning discussions
• Creative pattern projects

Summative:
• Pattern representation portfolio
• Equality demonstration tasks
• End-of-year pattern celebration`,
      
      keyActivities: `Core Learning Experiences:
      
Pattern Representations:
• Movement to visual patterns
• Sound to color patterns
• Shape to number patterns
• Nature pattern translations

Equality Explorations:
• Balance scale investigations
• Equal sets creations
• Seesaw equality models
• Fair sharing equality`,
      
      resources: `Materials & Resources:
      
Essential:
• Pattern materials (blocks, colors, shapes)
• Balance scales and materials
• Art supplies for pattern creation
• Recording materials

Optional:
• Digital pattern creators
• Natural materials for patterns
• Balance game materials`,
      
      differentiation: `Supporting All Learners:
      
Pattern Support:
• Simple AB pattern conversions
• Use familiar materials
• Provide pattern templates

Pattern Extensions:
• Complex pattern conversions
• Create original representation methods
• Teach conversion strategies to others`,
      
      integration: `Cross-Curricular Connections:
      • Art: Pattern artwork creation
      • Music: Pattern to rhythm conversions
      • Science: Patterns in nature
      • Physical Education: Movement patterns`
    },
    
    {
      title: 'Measurement and Shapes',
      titleFr: 'Mesures et formes',
      hours: 12,
      start: new Date('2026-06-23'),
      end: new Date('2026-06-25'),
      expectations: ['1.FE1', '1.FE2'], // Measurement concepts, sorting shapes
      bigIdeas: `We can measure by comparing, and shapes can be sorted by their characteristics.
      
Key Understandings:
• Measurement is about comparison, not just numbers
• Shapes have attributes we can identify and sort by
• Mathematical tools help us explore our world`,
      
      description: `End of June focus: Exploring measurement as comparison and shape attributes.
      
Learning Journey:
• Comparing lengths, heights, and sizes
• Sorting 2D and 3D shapes by attributes
• Using non-standard units for measurement
• Celebrating our mathematical growth`,
      
      assessmentPlan: `Assessment Focus: Measurement Understanding & Shape Recognition
      
Formative:
• Measurement comparison observations
• Shape sorting reasoning
• Attribute identification discussions
• Year-end portfolio review

Summative:
• Measurement comparison tasks
• Shape sorting assessment
• Mathematical growth celebration`,
      
      keyActivities: `Core Learning Experiences:
      
Measurement Comparisons:
• Direct comparison activities
• Non-standard unit explorations
• Measurement hunts
• Comparison language practice

Shape Investigations:
• 2D and 3D shape sorting
• Attribute identification games
• Shape construction projects
• Shape in environment hunts`,
      
      resources: `Materials & Resources:
      
Essential:
• Various measurement tools
• 2D and 3D shape collections
• Non-standard measurement units
• Sorting mats and containers

Optional:
• Digital measurement tools
• Shape art materials
• Measurement story books`,
      
      differentiation: `Supporting All Learners:
      
Measurement Beginners:
• Focus on direct comparison
• Use familiar objects
• Simple sorting criteria

Measurement Advanced:
• Use multiple measurement tools
• Complex shape sorting
• Create measurement challenges`,
      
      integration: `Cross-Curricular Connections:
      • Science: Measurement in experiments
      • Art: Shape artwork creation
      • Physical Education: Measurement games
      • French: Measurement vocabulary`
    }
  ];
  
  console.log(`Creating ${perfectUnits.length} perfect tactical unit plans...\n`);
  
  // Create each unit with proper expectation links
  for (const unitSpec of perfectUnits) {
    console.log(`Creating: ${unitSpec.title}`);
    
    const unit = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: mathLRP.id,
        title: unitSpec.title,
        titleFr: unitSpec.titleFr,
        estimatedHours: unitSpec.hours,
        startDate: unitSpec.start,
        endDate: unitSpec.end,
        bigIdeas: unitSpec.bigIdeas,
        description: unitSpec.description,
        assessmentPlan: unitSpec.assessmentPlan,
        priorKnowledge: unitSpec.keyActivities,
        culminatingTask: unitSpec.resources,
        differentiationStrategies: JSON.stringify([unitSpec.differentiation]),
        crossCurricularConnections: unitSpec.integration
      }
    });
    
    // Link expectations to this unit
    for (const expCode of unitSpec.expectations) {
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
    
    console.log(`  ✓ ${unitSpec.hours}h | Expectations: ${unitSpec.expectations.join(', ')}`);
  }
  
  const totalHours = perfectUnits.reduce((sum, u) => sum + u.hours, 0);
  const totalExpectations = new Set(perfectUnits.flatMap(u => u.expectations)).size;
  
  console.log(`\n🎯 PERFECT MATHEMATICS UNITS CREATED!\n`);
  console.log(`Total hours: ${totalHours}/185`);
  console.log(`Total expectations covered: ${totalExpectations}/14`);
  console.log(`Units created: ${perfectUnits.length}`);
  
  console.log('\n✨ Each unit now provides:');
  console.log('  ✓ Clear mathematical focus');
  console.log('  ✓ 2-3 big ideas for the unit');
  console.log('  ✓ Specific curriculum expectations');
  console.log('  ✓ Assessment strategies (not daily plans)');
  console.log('  ✓ Key learning experiences (not lessons)');
  console.log('  ✓ Resource categories');
  console.log('  ✓ Differentiation considerations');
  console.log('  ✓ Integration opportunities');
  console.log('\n🏗️ Ready to guide lesson planning!');
  
  await prisma.$disconnect();
}

perfectMathUnitPlans().catch(console.error);