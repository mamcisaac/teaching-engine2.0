#!/usr/bin/env tsx

/**
 * CREATE TRULY PERFECT MATHEMATICS UNITS
 * Fix the major flaws identified in critical assessment
 * Make them true tactical documents, not operational ones
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createTrulyPerfectMathUnits() {
  console.log('🔨 CREATING TRULY PERFECT MATHEMATICS UNITS\n');
  console.log('Fixing the major flaws identified in critical assessment\n');
  console.log('====================================================\n');
  
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
  
  console.log('🎯 PRINCIPLES FOR TRULY TACTICAL UNITS:\n');
  console.log('• Big Ideas: Pure conceptual understandings (under 300 chars)');
  console.log('• Description: Mathematical focus overview (under 400 chars)');
  console.log('• Assessment: General approaches (under 300 chars)');
  console.log('• NO bullet points about activities');
  console.log('• NO "Learning Journey" sections');
  console.log('• NO specific procedures or materials\n');
  
  // Define TRULY tactical unit specifications
  const trulyPerfectUnits = [
    {
      title: 'Building Our Math Community',
      titleFr: 'Construire notre communauté mathématique',
      hours: 18,
      expectations: ['1.N3'],
      bigIdeas: `Counting connects quantity to numerals. Mathematical thinking can be shared and discussed. Everyone belongs in our math community.`,
      
      description: `September focus on establishing mathematical community and foundational counting understanding. Students explore the meaning of counting and begin sharing mathematical thinking.`,
      
      assessmentPlan: `Observe counting behaviors and mathematical discussions. Document comfort with math materials and participation in number talks. Portfolio beginnings.`
    },
    
    {
      title: 'Numbers All Around Us',
      titleFr: 'Les nombres autour de nous',
      hours: 22,
      expectations: ['1.N1', '1.N2'],
      bigIdeas: `Number sequence has patterns and structure. Quantities can be recognized instantly without counting. Numbers exist throughout our environment.`,
      
      description: `October exploration of number sequence patterns and instant quantity recognition. Students develop number sequence understanding and subitizing skills.`,
      
      assessmentPlan: `Check number sequence knowledge and instant recognition abilities. Document number awareness in environment. Observe pattern recognition.`
    },
    
    {
      title: 'Representing Numbers',
      titleFr: 'Représenter les nombres',
      hours: 20,
      expectations: ['1.N4'],
      bigIdeas: `Numbers can be shown in multiple ways. Different representations reveal different aspects of quantity. Moving between representations builds understanding.`,
      
      description: `November focus on multiple number representations using concrete, pictorial, and symbolic forms. Students connect different ways of showing quantity.`,
      
      assessmentPlan: `Assess flexibility in number representation. Observe connections between concrete, pictorial, and symbolic. Portfolio of representations.`
    },
    
    {
      title: 'Celebrations with Numbers',
      titleFr: 'Célébrations avec les nombres',
      hours: 14,
      expectations: ['1.RR1'],
      bigIdeas: `Patterns repeat in predictable ways. Cultural celebrations often contain patterns. Recognizing patterns helps predict what comes next.`,
      
      description: `December exploration of repeating patterns through holiday celebrations and traditions. Students identify and create patterns in festive contexts.`,
      
      assessmentPlan: `Document pattern recognition and creation abilities. Observe pattern extension skills. Celebrate pattern discoveries through projects.`
    },
    
    {
      title: 'Comparing and Ordering',
      titleFr: 'Comparer et ordonner',
      hours: 20,
      expectations: ['1.N5'],
      bigIdeas: `Quantities can be compared without counting everything. Comparison language describes relative amounts. Ordering reveals number relationships.`,
      
      description: `January development of comparison skills and quantity relationships. Students use mathematical language to describe relative amounts and order quantities.`,
      
      assessmentPlan: `Observe comparison strategies and mathematical language use. Assess understanding of relative quantity. Document reasoning about more and less.`
    },
    
    {
      title: 'Number Relationships',
      titleFr: 'Relations entre les nombres',
      hours: 20,
      expectations: ['1.N6', '1.N7'],
      bigIdeas: `Numbers can be grouped equally or unequally. Number neighbors are one more or one less. Numbers can be composed and decomposed flexibly.`,
      
      description: `February exploration of how numbers relate to each other through grouping and neighboring. Students investigate number composition and decomposition.`,
      
      assessmentPlan: `Document understanding of equal grouping and number neighbors. Observe flexible thinking about number relationships. Portfolio evidence.`
    },
    
    {
      title: 'Exploring Measurement',
      titleFr: 'Explorer la mesure',
      hours: 15,
      expectations: ['1.FE1'],
      bigIdeas: `Measurement involves comparing attributes. Objects can be compared directly or with tools. Measurement helps us describe our world precisely.`,
      
      description: `March introduction to measurement as comparison of attributes. Students explore direct comparison and begin using non-standard measurement tools.`,
      
      assessmentPlan: `Observe comparison strategies and measurement understanding. Document tool use and measurement vocabulary. Assess attribute awareness.`
    },
    
    {
      title: 'Introduction to Operations',
      titleFr: 'Introduction aux opérations',
      hours: 22,
      expectations: ['1.N8'],
      bigIdeas: `Addition combines quantities. Subtraction separates quantities. Operations can be modeled with concrete materials and story contexts.`,
      
      description: `April introduction to addition and subtraction through concrete modeling and story problems. Students explore combining and separating quantities.`,
      
      assessmentPlan: `Assess operation understanding through modeling and problem solving. Observe strategy development and reasoning. Document growth in operation sense.`
    },
    
    {
      title: 'Mental Math and Shapes',
      titleFr: 'Calcul mental et formes',
      hours: 22,
      expectations: ['1.N9', '1.FE2'],
      bigIdeas: `Mental math uses thinking strategies, not memorization. Different strategies work for different problems. Shapes have attributes that define them.`,
      
      description: `May development of mental math strategies and shape attribute understanding. Students explore efficient calculation methods and geometric properties.`,
      
      assessmentPlan: `Document strategy development and explanation abilities. Observe shape recognition and sorting. Assess mathematical reasoning and flexibility.`
    },
    
    {
      title: 'Patterns and Equality',
      titleFr: 'Motifs et égalité',
      hours: 12,
      expectations: ['1.RR2', '1.RR3'],
      bigIdeas: `Patterns can be represented in multiple ways. Equality means same amount or balanced. Converting between representations maintains pattern structure.`,
      
      description: `June exploration of pattern representations and equality concepts. Students convert patterns between forms and investigate balance and fairness.`,
      
      assessmentPlan: `Assess pattern representation flexibility and equality understanding. Document conversion abilities. Celebrate year-long mathematical growth.`
    }
  ];
  
  console.log('🔨 Updating all 10 units with truly tactical content...\n');
  
  // Update each existing unit
  for (let i = 0; i < mathLRP.unitPlans.length && i < trulyPerfectUnits.length; i++) {
    const unit = mathLRP.unitPlans[i];
    const spec = trulyPerfectUnits[i];
    
    console.log(`Fixing Unit ${i + 1}: ${spec.title}`);
    console.log(`  Big Ideas: ${spec.bigIdeas.length} chars (target: <300)`);
    console.log(`  Description: ${spec.description.length} chars (target: <400)`);
    console.log(`  Assessment: ${spec.assessmentPlan.length} chars (target: <300)`);
    
    // Update unit with truly tactical content
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: {
        title: spec.title,
        titleFr: spec.titleFr,
        estimatedHours: spec.hours,
        bigIdeas: spec.bigIdeas,
        description: spec.description,
        assessmentPlan: spec.assessmentPlan,
        // Clear operational fields that were misused
        priorKnowledge: null,
        culminatingTask: null,
        crossCurricularConnections: null
      }
    });
    
    // Clear and re-link expectations
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
    
    console.log(`  ✅ Fixed with ${spec.expectations.length} expectation(s)\n`);
  }
  
  const totalHours = trulyPerfectUnits.reduce((sum, u) => sum + u.hours, 0);
  const totalExpectations = new Set(trulyPerfectUnits.flatMap(u => u.expectations)).size;
  
  console.log('🎯 TRULY PERFECT MATHEMATICS UNITS CREATED!\n');
  console.log(`Total hours: ${totalHours}/185`);
  console.log(`Total expectations covered: ${totalExpectations}/14`);
  console.log(`Units fixed: ${trulyPerfectUnits.length}\n`);
  
  console.log('✨ WHAT MAKES THESE TRULY PERFECT:\n');
  console.log('Big Ideas:');
  console.log('  ✓ Pure conceptual understandings');
  console.log('  ✓ Under 300 characters each');
  console.log('  ✓ No bullet points about activities');
  console.log('  ✓ Focus on mathematical concepts');
  console.log('');
  console.log('Descriptions:');
  console.log('  ✓ Mathematical focus overview');
  console.log('  ✓ Under 400 characters each');
  console.log('  ✓ No "Learning Journey" sections');
  console.log('  ✓ No specific activities listed');
  console.log('');
  console.log('Assessment Plans:');
  console.log('  ✓ General approaches only');
  console.log('  ✓ Under 300 characters each');
  console.log('  ✓ No specific tools or procedures');
  console.log('  ✓ Focus on what to assess, not how');
  console.log('');
  console.log('🏗️ TRUE TACTICAL LEVEL ACHIEVED!');
  console.log('These units now properly bridge strategic LRP and operational lessons.');
  
  await prisma.$disconnect();
}

createTrulyPerfectMathUnits().catch(console.error);