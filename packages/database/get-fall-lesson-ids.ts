import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getFallLessonIds() {
  console.log('🍂 GETTING FALL CHANGES LESSON IDs FOR MANUAL UPDATES');
  console.log('====================================================\n');

  const unitPlanId = "cmebyc9ng0003vjrmqcj401lj";
  
  const lessons = await prisma.lessonPlan.findMany({
    where: { unitPlanId },
    orderBy: { date: 'asc' },
    select: {
      id: true,
      title: true,
      date: true
    }
  });

  console.log(`Found ${lessons.length} lessons:\n`);
  
  lessons.forEach((lesson, index) => {
    console.log(`${index + 1}. ${lesson.title}`);
    console.log(`   ID: ${lesson.id}`);
    console.log(`   Date: ${lesson.date?.toDateString() || 'No date'}\n`);
  });

  // Generate update commands for each lesson
  console.log('📝 PRISMA UPDATE COMMANDS:');
  console.log('========================\n');
  
  lessons.forEach((lesson, index) => {
    console.log(`// Lesson ${index + 1}: ${lesson.title}`);
    console.log(`await prisma.lessonPlan.update({`);
    console.log(`  where: { id: "${lesson.id}" },`);
    console.log(`  data: {`);
    console.log(`    // Enhanced content will go here`);
    console.log(`  }`);
    console.log(`});\n`);
  });
}

// Run the function
getFallLessonIds()
  .catch((error) => {
    console.error('❌ Error getting lesson IDs:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });