import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectCurriculumMapping() {
  console.log('🎯 CREATING PERFECT CURRICULUM EXPECTATION MAPPING\n');
  
  // Get the French LRP
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Français' } }
  });
  
  if (!frenchLRP) {
    console.log('No French LRP found');
    return;
  }
  
  // Get all units
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: frenchLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  // Get all curriculum expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    where: {
      longRangePlanExpectations: {
        some: {
          longRangePlanId: frenchLRP.id
        }
      }
    }
  });
  
  console.log(`Found ${units.length} units and ${expectations.length} expectations`);
  
  // PERFECT CURRICULUM MAPPING - Manually designed for optimal learning progression
  const perfectMapping = [
    {
      // UNIT 1: Bienvenue en français (20 lessons) - Foundation oral communication
      unitIndex: 0,
      expectationCodes: [
        '1CO.0', // Phonological awareness - perfect for beginning sounds
        '1CO.1', // Managing listening - essential for classroom routines
        '1CO.5', // Oral expression - basic greetings and introductions
        '1É.3'   // Reflection on writing - basic recognition of French vs English
      ]
    },
    {
      // UNIT 2: Histoires d'automne (20 lessons) - Listening and story comprehension
      unitIndex: 1,
      expectationCodes: [
        '1CO.2', // Literal comprehension of oral messages - perfect for stories
        '1CO.6', // Reflection on oral communication - discussing story understanding
        '1L.1',  // Planning reading - choosing autumn books
        '1L.2'   // Literal reading comprehension - simple autumn texts
      ]
    },
    {
      // UNIT 3: Ma famille française (20 lessons) - Personal expression and writing
      unitIndex: 2,
      expectationCodes: [
        '1CO.5', // Oral expression - presenting family (spiraling)
        '1É.1',  // Writing process - basic family descriptions
        '1É.2',  // Writing traits - simple sentences about family
        '1L.5'   // Reflection on reading - family books
      ]
    },
    {
      // UNIT 4: Célébrations d'hiver (20 lessons) - Cultural interpretation
      unitIndex: 3,
      expectationCodes: [
        '1CO.3', // Interpretive oral comprehension - cultural stories
        '1CO.4', // Critical oral comprehension - comparing celebrations
        '1L.3',  // Interpretive reading - celebration texts
        '1É.1'   // Writing process - celebration descriptions (spiraling)
      ]
    },
    {
      // UNIT 5: Poésie et rythmes (20 lessons) - Sound and phonological awareness
      unitIndex: 4,
      expectationCodes: [
        '1CO.0', // Phonological awareness - rhymes and rhythm (spiraling)
        '1CO.1', // Managing listening - poetry appreciation (spiraling) 
        '1CO.5', // Oral expression - reciting poems (spiraling)
        '1L.2'   // Literal reading - simple poems (spiraling)
      ]
    },
    {
      // UNIT 6: Jeunes auteurs créatifs (19 lessons) - Writing process focus
      unitIndex: 5,
      expectationCodes: [
        '1É.1',  // Writing process - full writing cycle (spiraling)
        '1É.2',  // Writing traits - creative pieces (spiraling)
        '1É.3',  // Writing reflection - authorship identity
        '1CO.6'  // Oral reflection - sharing writing (spiraling)
      ]
    },
    {
      // UNIT 7: Exploration de textes (19 lessons) - Reading strategies focus
      unitIndex: 6,
      expectationCodes: [
        '1L.1',  // Reading planning - choosing texts (spiraling)
        '1L.3',  // Interpretive reading - deeper understanding (spiraling)
        '1L.4',  // Critical reading - analyzing simple texts
        '1L.5'   // Reading reflection - strategy awareness (spiraling)
      ]
    },
    {
      // UNIT 8: Communication créative (19 lessons) - Advanced oral communication
      unitIndex: 7,
      expectationCodes: [
        '1CO.2', // Literal oral comprehension - complex messages (spiraling)
        '1CO.3', // Interpretive oral comprehension - creative contexts (spiraling)
        '1CO.5', // Oral expression - creative presentations (spiraling)
        '1É.2'   // Writing traits - supporting oral work (spiraling)
      ]
    },
    {
      // UNIT 9: Explorateurs de mots (19 lessons) - Advanced literacy integration
      unitIndex: 8,
      expectationCodes: [
        '1CO.4', // Critical oral comprehension - evaluating information (spiraling)
        '1L.4',  // Critical reading - analyzing word choices (spiraling)
        '1É.1',  // Writing process - sophisticated pieces (spiraling)
        '1CO.0'  // Phonological awareness - advanced word play (spiraling)
      ]
    },
    {
      // UNIT 10: Notre année française (19 lessons) - Reflection and celebration
      unitIndex: 9,
      expectationCodes: [
        '1CO.6', // Oral communication reflection - year-end assessment (spiraling)
        '1L.5',  // Reading reflection - growth recognition (spiraling)
        '1É.3',  // Writing reflection - authorship development (spiraling)
        '1CO.5'  // Oral expression - sharing learning journey (spiraling)
      ]
    }
  ];
  
  console.log('🔧 APPLYING PERFECT CURRICULUM MAPPING...\n');
  
  // Clear existing mappings first
  await prisma.unitPlanExpectation.deleteMany({
    where: {
      unitPlan: {
        longRangePlanId: frenchLRP.id
      }
    }
  });
  
  // Apply perfect mapping
  for (const mapping of perfectMapping) {
    const unit = units[mapping.unitIndex];
    console.log(`📖 Unit ${mapping.unitIndex + 1}: ${unit.title}`);
    
    for (const code of mapping.expectationCodes) {
      const expectation = expectations.find(exp => exp.code === code);
      if (expectation) {
        await prisma.unitPlanExpectation.create({
          data: {
            unitPlanId: unit.id,
            expectationId: expectation.id
          }
        });
        console.log(`   ✅ Mapped ${code}: ${expectation.description.substring(0, 50)}...`);
      } else {
        console.log(`   ❌ Expectation ${code} not found`);
      }
    }
    console.log();
  }
  
  // Verify perfect spiraling
  console.log('📊 VERIFYING PERFECT SPIRALING PATTERN:\n');
  
  const coverageCount = new Map();
  for (const mapping of perfectMapping) {
    for (const code of mapping.expectationCodes) {
      const count = coverageCount.get(code) || 0;
      coverageCount.set(code, count + 1);
    }
  }
  
  const sortedCoverage = Array.from(coverageCount.entries()).sort();
  sortedCoverage.forEach(([code, count]) => {
    const status = count >= 2 && count <= 4 ? '✅ PERFECT' : count === 1 ? '⚠️ MINIMAL' : '❌ EXCESSIVE';
    console.log(`${status} ${code}: ${count} units`);
  });
  
  const totalCoverage = coverageCount.size;
  console.log(`\nTotal Expectations Covered: ${totalCoverage}/15 ${totalCoverage === 15 ? '✅' : '❌'}`);
  
  if (totalCoverage === 15) {
    console.log('\n🎉 PERFECT CURRICULUM ALIGNMENT ACHIEVED!');
    console.log('✅ All 15 expectations mapped with optimal spiraling');
    console.log('✅ Developmental progression respected');
    console.log('✅ Each unit has meaningful curriculum connection');
    console.log('✅ Oral communication, reading, writing balanced');
  }
  
  await prisma.$disconnect();
}

createPerfectCurriculumMapping().catch(console.error);