#!/usr/bin/env tsx

/**
 * UPDATE MATHEMATICS UNIT PLANS TO PERFECT TACTICAL DOCUMENTS
 * Update existing units instead of deleting (to avoid foreign key issues)
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateMathUnitPlans() {
  console.log('🔄 UPDATING MATHEMATICS UNIT PLANS TO PERFECT TACTICAL DOCUMENTS\n');
  console.log('==============================================================\n');
  
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
  
  // Create expectation map
  const expectationMap = new Map<string, any>();
  expectations.forEach(exp => {
    expectationMap.set(exp.code, exp);
  });
  
  console.log(`Found ${expectations.length} mathematics expectations to distribute\n`);
  
  // Define perfect tactical unit specifications
  const perfectUnits = [
    {
      title: 'Building Our Math Community',
      titleFr: 'Construire notre communauté mathématique',
      hours: 18,
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
• Beginning portfolio entries`
    },
    
    {
      title: 'Numbers All Around Us',
      titleFr: 'Les nombres autour de nous',
      hours: 22,
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
• Number environment portfolio`
    },
    
    {
      title: 'Representing Numbers',
      titleFr: 'Représenter les nombres',
      hours: 20,
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
• "Show me this number" demonstrations`
    },
    
    {
      title: 'Celebrations with Numbers',
      titleFr: 'Célébrations avec les nombres',
      hours: 14,
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
• Pattern explanation videos`
    },
    
    {
      title: 'Comparing and Ordering',
      titleFr: 'Comparer et ordonner',
      hours: 20,
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
• Mathematical language assessment`
    },
    
    {
      title: 'Number Relationships',
      titleFr: 'Relations entre les nombres',
      hours: 20,
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
• More/less problem solving`
    },
    
    {
      title: 'Exploring Measurement',
      titleFr: 'Explorer la mesure',
      hours: 15,
      expectations: ['1.FE1'], // Measurement as comparison
      bigIdeas: `Measurement is about comparing things to understand their attributes.

Key Understandings:
• We measure by comparing, not just counting
• Different tools help us measure different things
• Measurement language helps us describe our world`,
      
      description: `March focus: Understanding measurement as comparison using non-standard units.

Learning Journey:
• Comparing lengths, heights, and sizes directly
• Using non-standard units to measure
• Exploring measurement tools and vocabulary
• Solving measurement problems`,
      
      assessmentPlan: `Assessment Focus: Measurement Understanding

Formative:
• Measurement comparison observations
• Tool use documentation
• Problem-solving strategies
• Vocabulary development notes

Summative:
• Measurement comparison tasks
• Problem-solving demonstrations
• Measurement vocabulary check`
    },
    
    {
      title: 'Introduction to Operations',
      titleFr: 'Introduction aux opérations',
      hours: 22,
      expectations: ['1.N8'], // Addition and subtraction to 20
      bigIdeas: `Addition means putting together, subtraction means taking away, and they are related operations.

Key Understandings:
• Addition and subtraction are opposite operations
• We can use concrete materials to show operations
• Story problems help us understand when to add or subtract`,
      
      description: `April focus: Building understanding of addition and subtraction through concrete experiences.

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
• Addition/subtraction understanding check`
    },
    
    {
      title: 'Mental Math and Shapes',
      titleFr: 'Calcul mental et formes',
      hours: 22,
      expectations: ['1.N9', '1.FE2'], // Mental math strategies, sorting shapes
      bigIdeas: `We can solve problems using thinking strategies, and shapes have attributes we can identify.

Key Understandings:
• Mental math uses strategies, not just memorization
• Different strategies work for different problems
• Shapes can be sorted by their characteristics`,
      
      description: `May focus: Developing mental math strategies and exploring shape attributes.

Learning Journey:
• Exploring counting on and counting back
• Using doubles and near doubles strategies
• Investigating shape attributes and sorting
• Sharing mathematical thinking strategies`,
      
      assessmentPlan: `Assessment Focus: Strategy Development & Shape Recognition

Formative:
• Strategy use observations
• Shape sorting reasoning
• Mathematical discussions
• Problem-solving approaches

Summative:
• Mental math strategy demonstration
• Shape sorting assessment
• Strategy explanation portfolio`
    },
    
    {
      title: 'Patterns and Equality',
      titleFr: 'Motifs et égalité',
      hours: 12,
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
• Celebrating mathematical discoveries`,
      
      assessmentPlan: `Assessment Focus: Pattern Flexibility & Equality Understanding

Formative:
• Pattern conversion observations
• Balance exploration documentation
• Equality reasoning discussions
• Creative pattern projects

Summative:
• Pattern representation portfolio
• Equality demonstration tasks
• End-of-year mathematical celebration`
    }
  ];
  
  // Update existing units
  console.log(`Updating ${mathLRP.unitPlans.length} existing unit plans...\n`);
  
  for (let i = 0; i < mathLRP.unitPlans.length && i < perfectUnits.length; i++) {
    const unit = mathLRP.unitPlans[i];
    const spec = perfectUnits[i];
    
    console.log(`Updating Unit ${i + 1}: ${spec.title}`);
    
    // Update unit details
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: {
        title: spec.title,
        titleFr: spec.titleFr,
        estimatedHours: spec.hours,
        bigIdeas: spec.bigIdeas,
        description: spec.description,
        assessmentPlan: spec.assessmentPlan,
        differentiationStrategies: JSON.stringify(['Concrete/pictorial/abstract progression', 'Multiple entry points', 'Extension opportunities'])
      }
    });
    
    // Clear existing expectations for this unit
    await prisma.unitPlanExpectation.deleteMany({
      where: { unitPlanId: unit.id }
    });
    
    // Link new expectations
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
    
    console.log(`  ✓ ${spec.hours}h | Expectations: ${spec.expectations.join(', ')}`);
  }
  
  const totalHours = perfectUnits.reduce((sum, u) => sum + u.hours, 0);
  const totalExpectations = new Set(perfectUnits.flatMap(u => u.expectations)).size;
  
  console.log(`\n🎯 MATHEMATICS UNITS PERFECTLY UPDATED!\n`);
  console.log(`Total hours: ${totalHours}/185`);
  console.log(`Total expectations covered: ${totalExpectations}/14`);
  console.log(`Units updated: ${perfectUnits.length}`);
  
  console.log('\n✨ Each unit now provides:');
  console.log('  ✓ Clear mathematical focus and big ideas');
  console.log('  ✓ Logical expectation distribution (no duplicates)');
  console.log('  ✓ Assessment strategies appropriate for Grade 1');
  console.log('  ✓ Learning journey descriptions');
  console.log('  ✓ Tactical guidance for lesson planners');
  console.log('  ✓ Bridge between strategic LRP and operational lessons');
  
  console.log('\n🏗️ PERFECT TACTICAL DOCUMENTS ACHIEVED!');
  console.log('Mathematics unit plans are now true tactical bridges.');
  
  await prisma.$disconnect();
}

updateMathUnitPlans().catch(console.error);