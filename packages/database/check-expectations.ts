import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExpectations() {
  try {
    console.log('🔍 CHECKING CURRICULUM EXPECTATIONS FOR SOCIAL STUDIES GRADE 1');
    
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Sciences humaines',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });
    
    console.log(`\nFound ${expectations.length} expectations:\n`);
    
    for (const exp of expectations) {
      console.log(`Code: ${exp.code}`);
      console.log(`  Description: ${exp.description}`);
      console.log(`  DescriptionFr: ${exp.descriptionFr || 'N/A'}`);
      console.log(`  ID: ${exp.id}`);
      console.log('');
    }
    
    // Also check if there are any other subjects with similar codes
    console.log('\n📚 CHECKING ALL SUBJECTS FOR REFERENCE:\n');
    
    const allSubjects = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 },
      select: { subject: true },
      distinct: ['subject']
    });
    
    for (const subj of allSubjects) {
      const count = await prisma.curriculumExpectation.count({
        where: {
          subject: subj.subject,
          grade: 1
        }
      });
      console.log(`  ${subj.subject}: ${count} expectations`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExpectations();