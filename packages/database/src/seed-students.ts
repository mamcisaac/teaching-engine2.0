import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function seedStudents() {
  try {
    console.log('🌱 Seeding students...');

    // Find the first user (teacher) to associate students with
    const teacher = await prisma.user.findFirst();

    if (!teacher) {
      console.log('❌ No users found. Please create a teacher account first.');
      return;
    }

    console.log(`📚 Adding students for teacher: ${teacher.name}`);

    // Create some sample students
    const students = [
      {
        firstName: 'Alex',
        lastName: 'Martin',
        grade: 3,
        userId: teacher.id,
        parentContacts: {
          create: [
            { name: 'Sarah Martin', email: 'sarah.martin@example.com' },
            { name: 'David Martin', email: 'david.martin@example.com' },
          ],
        },
      },
      {
        firstName: 'Emma',
        lastName: 'Johnson',
        grade: 3,
        userId: teacher.id,
        parentContacts: {
          create: [{ name: 'Lisa Johnson', email: 'lisa.johnson@example.com' }],
        },
      },
      {
        firstName: 'Lucas',
        lastName: 'Brown',
        grade: 4,
        userId: teacher.id,
        parentContacts: {
          create: [
            { name: 'Michael Brown', email: 'michael.brown@example.com' },
            { name: 'Jennifer Brown', email: 'jennifer.brown@example.com' },
          ],
        },
      },
      {
        firstName: 'Sophie',
        lastName: 'Wilson',
        grade: 2,
        userId: teacher.id,
        parentContacts: {
          create: [{ name: 'Marie Wilson', email: 'marie.wilson@example.com' }],
        },
      },
    ];

    for (const student of students) {
      const created = await prisma.student.create({
        data: student,
        include: {
          parentContacts: true,
        },
      });

      console.log(
        `✅ Created student: ${created.firstName} ${created.lastName} (Grade ${created.grade})`,
      );

      // Add some sample artifacts
      await prisma.studentArtifact.create({
        data: {
          studentId: created.id,
          title: `${created.firstName}'s Reading Portfolio`,
          description: 'Collection of reading assignments and comprehension exercises',
          outcomeIds: JSON.stringify(['reading-comprehension', 'oral-language']),
        },
      });

      await prisma.studentArtifact.create({
        data: {
          studentId: created.id,
          title: `Math Problem Solving`,
          description: 'Problem solving exercises and number sense activities',
          outcomeIds: JSON.stringify(['numeracy', 'problem-solving']),
        },
      });

      // Add a sample reflection
      await prisma.studentReflection.create({
        data: {
          studentId: created.id,
          content: `${created.firstName} showed great enthusiasm during today's group reading activity. They contributed thoughtful questions and demonstrated good listening skills.`,
        },
      });
    }

    console.log('✨ Student seeding completed successfully!');
    console.log(`📊 Total students created: ${students.length}`);
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedStudents().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedStudents };
