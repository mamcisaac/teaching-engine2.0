import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurriculum() {
  const count = await prisma.curriculumExpectation.count({ where: { grade: 1 } });
  console.log('Grade 1 curriculum expectations:', count);
  
  const subjects = await prisma.curriculumExpectation.findMany({
    where: { grade: 1 },
    select: { subject: true },
    distinct: ['subject']
  });
  
  console.log('Subjects:', subjects.map(s => s.subject).join(', '));
  await prisma.$disconnect();
}

checkCurriculum();