import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeUnit9Expectations() {
  try {
    // Get Unit 9 details
    const unit9 = await prisma.unitPlan.findFirst({
      where: {
        id: 'cmeh9o5sg0001vjv00jatq9zn'
      }
    });

    console.log('=== UNIT 9: DATA COLLECTION AND ORGANIZATION ===');
    console.log(`Title: ${unit9?.title}`);
    console.log(`Big Ideas: ${unit9?.bigIdeas}`);
    console.log(`Essential Questions: ${JSON.stringify(unit9?.essentialQuestions, null, 2)}`);
    console.log(`Description: ${unit9?.description}\n`);

    // Get expectations that could fit data/organization theme
    console.log('=== EXPECTATIONS SUITABLE FOR DATA UNIT ===\n');
    
    console.log('1. Primary candidates for data collection/organization:');
    console.log('- 1.FE2: Sorting and classifying objects (perfect for data organization)');
    console.log('- 1.N3: Understanding counting (for data collection)');
    console.log('- 1.N5: Comparing sets up to 20 (for data comparison)');
    
    console.log('\n2. Secondary candidates that could be applied in data context:');
    console.log('- 1.N1: Counting sequence (for numbering data)');
    console.log('- 1.RR1: Repeating patterns (patterns in data)');
    console.log('- 1.RR2: Converting representations (different ways to show data)');

    // Get these expectation IDs
    const dataExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        code: {
          in: ['1.FE2', '1.N3', '1.N5']
        }
      }
    });

    console.log('\n=== RECOMMENDED EXPECTATIONS FOR UNIT 9 ===');
    dataExpectations.forEach(exp => {
      console.log(`\n${exp.code}: ${exp.description}`);
      console.log(`ID: ${exp.id}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeUnit9Expectations();