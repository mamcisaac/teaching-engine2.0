const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('test123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test Teacher',
      password: hashedPassword,
      grade: '1',
      program: 'French Immersion',
      role: 'teacher',
    },
  });

  console.log('Created user:', user.id, user.email);

  // Create a substitute plan
  const substitutePlan = await prisma.substitutePlan.create({
    data: {
      userId: user.id,
      title: 'Monday Substitute Plan',
      dateFor: new Date('2025-09-09'),
      grade: 1,
      subject: 'French Language Arts',
      schedule: JSON.stringify([
        { time: '9:00', activity: 'Morning Circle', notes: 'Review calendar and weather' },
        { time: '9:30', activity: 'French Reading', notes: 'Continue with chapter book' },
        { time: '10:30', activity: 'Recess', notes: 'Supervised outdoor play' },
        { time: '11:00', activity: 'Math Centers', notes: 'Rotation through 4 stations' },
      ]),
      classroomRoutines: JSON.stringify([
        { category: 'morning', title: 'Attendance', description: 'Take attendance using the clipboard by the door' },
        { category: 'behavior', title: 'Quiet Signal', description: 'Raise hand for quiet, students copy' },
      ]),
      emergencyInfo: JSON.stringify({
        evacuationProcedure: 'Exit through main door, meet at playground',
        lockdownProcedure: 'Lock door, turn off lights, gather in reading corner',
      }),
      lessonPlans: JSON.stringify([]),
      behaviorPlan: JSON.stringify({}),
      studentNotes: JSON.stringify({}),
      materialsList: JSON.stringify({}),
      generalNotes: 'Class is generally well-behaved. Sarah needs extra support with reading.',
      isActive: true,
    },
  });

  console.log('Created substitute plan:', substitutePlan.id);

  // Create some class routines
  await prisma.classRoutine.createMany({
    data: [
      {
        userId: user.id,
        title: 'Morning Arrival',
        description: 'Students unpack, put agenda on desk, start morning work',
        category: 'morning',
        timeOfDay: '8:45 AM',
        priority: 5,
        isActive: true,
      },
      {
        userId: user.id,
        title: 'Dismissal',
        description: 'Pack up 10 minutes early, line up by bus/walker groups',
        category: 'dismissal',
        timeOfDay: '3:15 PM',
        priority: 5,
        isActive: true,
      },
    ],
  });

  // Create a student with notes
  await prisma.student.create({
    data: {
      userId: user.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      grade: '1',
      notes: 'Needs reading support, sits at front',
      specialNeeds: 'Dyslexia - use larger fonts',
      accommodations: JSON.stringify({ extraTime: true, preferentialSeating: true }),
      isActive: true,
    },
  });

  // Create a recent daybook entry
  await prisma.daybookEntry.create({
    data: {
      userId: user.id,
      date: new Date('2025-09-06'),
      whatWorked: 'Math centers went really well, students were engaged',
      whatDidntWork: 'Transition to French took too long',
      nextSteps: 'Practice transition routine next week',
      reflections: 'Good energy in the classroom today',
    },
  });

  console.log('Test data seeded successfully!');
  console.log('Substitute Plan ID:', substitutePlan.id);
  console.log('User ID:', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });