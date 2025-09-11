const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFrenchExpectations() {
  try {
    console.log('🔍 CHECKING FRENCH CURRICULUM EXPECTATIONS\n');

    // Check for French expectations with different subject names
    const subjects = [
      'Français langue première',
      'Français (Immersion)',
      'French',
      'Français'
    ];

    for (const subject of subjects) {
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          subject: subject,
          grade: 1
        }
      });
      
      if (expectations.length > 0) {
        console.log(`📚 Found ${expectations.length} expectations for "${subject}":`);
        expectations.forEach((exp, index) => {
          console.log(`${index + 1}. ${exp.code}: ${exp.description.substring(0, 80)}...`);
        });
        console.log('');
      }
    }

    // Check all Grade 1 expectations to see what subjects exist
    const allGrade1 = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 },
      select: { subject: true },
      distinct: ['subject']
    });

    console.log('📋 ALL GRADE 1 SUBJECTS IN DATABASE:');
    allGrade1.forEach(exp => {
      console.log(`- ${exp.subject}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFrenchExpectations();