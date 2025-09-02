const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.substitutePlan.findMany({
    select: {
      id: true,
      title: true,
      userId: true,
      dateFor: true,
    },
  });
  
  console.log('Substitute Plans:', plans);
  
  if (plans.length === 0) {
    // Create one if none exist
    const user = await prisma.user.findFirst();
    if (user) {
      const plan = await prisma.substitutePlan.create({
        data: {
          userId: user.id,
          title: 'Test Substitute Plan',
          dateFor: new Date('2025-09-09'),
          grade: 1,
          subject: 'French',
          schedule: JSON.stringify([{ time: '9:00', activity: 'Morning Circle' }]),
          classroomRoutines: JSON.stringify([]),
          emergencyInfo: JSON.stringify({}),
          lessonPlans: JSON.stringify([]),
          behaviorPlan: JSON.stringify({}),
          studentNotes: JSON.stringify({}),
          materialsList: JSON.stringify({}),
          isActive: true,
        },
      });
      console.log('Created plan:', plan.id);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());