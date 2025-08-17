import { prisma } from './src/index';

async function checkFallChangesLessons() {
  const unitPlanId = "cmebyc9ng0003vjrmqcj401lj"; // Fall Changes unit
  
  // Get existing lessons for this unit
  const lessons = await prisma.lessonPlan.findMany({
    where: {
      unitPlanId: unitPlanId
    },
    orderBy: {
      date: 'asc'
    },
    select: {
      id: true,
      title: true,
      date: true,
      learningObjectives: true,
      materials: true,
      actions: true,
      assessmentNotes: true,
      createdAt: true
    }
  });

  console.log(`📊 FALL CHANGES LESSONS STATUS`);
  console.log(`================================`);
  console.log(`Unit Plan ID: ${unitPlanId}`);
  console.log(`Total Lessons Found: ${lessons.length}`);
  console.log(`Expected Lessons: 24`);
  console.log(`Missing Lessons: ${24 - lessons.length}`);
  console.log();

  if (lessons.length > 0) {
    console.log(`📝 EXISTING LESSONS:`);
    console.log(`==================`);
    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title} (${lesson.date?.toDateString() || 'No date'})`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Learning Objectives: ${lesson.learningObjectives || 'None'}`);
      console.log(`   Materials: ${typeof lesson.materials === 'object' ? JSON.stringify(lesson.materials) : lesson.materials || 'None'}`);
      console.log(`   Actions: ${lesson.actions || 'None'}`);
      console.log(`   Assessment Notes: ${lesson.assessmentNotes || 'None'}`);
      console.log();
    });
  } else {
    console.log(`❌ NO LESSONS FOUND - Need to create 24 lessons!`);
  }

  return lessons;
}

// Run the function
checkFallChangesLessons()
  .catch((error) => {
    console.error('❌ Error checking Fall Changes lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });