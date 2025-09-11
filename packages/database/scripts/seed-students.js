const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedStudents() {
  try {
    // Get Emily's user ID (emmcisaac@gmail.com)
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.error('Emily user not found. Please ensure emmcisaac@gmail.com exists.');
      process.exit(1);
    }

    console.log(`Found Emily with ID: ${emily.id}`);

    // Grade 1 French Immersion students
    const students = [
      { firstName: 'Sophie', lastName: 'Martin', grade: 1, userId: emily.id },
      { firstName: 'Lucas', lastName: 'Dubois', grade: 1, userId: emily.id },
      { firstName: 'Emma', lastName: 'Tremblay', grade: 1, userId: emily.id },
      { firstName: 'Noah', lastName: 'Gagnon', grade: 1, userId: emily.id },
      { firstName: 'Olivia', lastName: 'Roy', grade: 1, userId: emily.id },
      { firstName: 'William', lastName: 'Côté', grade: 1, userId: emily.id },
      { firstName: 'Charlotte', lastName: 'Bouchard', grade: 1, userId: emily.id },
      { firstName: 'Thomas', lastName: 'Gauthier', grade: 1, userId: emily.id },
      { firstName: 'Alice', lastName: 'Morin', grade: 1, userId: emily.id },
      { firstName: 'Félix', lastName: 'Lavoie', grade: 1, userId: emily.id },
      { firstName: 'Léa', lastName: 'Fortin', grade: 1, userId: emily.id },
      { firstName: 'Samuel', lastName: 'Bergeron', grade: 1, userId: emily.id },
      { firstName: 'Zoé', lastName: 'Leblanc', grade: 1, userId: emily.id },
      { firstName: 'Gabriel', lastName: 'Paquette', grade: 1, userId: emily.id },
      { firstName: 'Rosalie', lastName: 'Girard', grade: 1, userId: emily.id },
      { firstName: 'Raphaël', lastName: 'Simard', grade: 1, userId: emily.id },
      { firstName: 'Mia', lastName: 'Poirier', grade: 1, userId: emily.id },
      { firstName: 'Nathan', lastName: 'Caron', grade: 1, userId: emily.id },
      { firstName: 'Florence', lastName: 'Beaulieu', grade: 1, userId: emily.id },
      { firstName: 'Édouard', lastName: 'Cloutier', grade: 1, userId: emily.id }
    ];

    // Clear existing students for Emily
    await prisma.student.deleteMany({
      where: { userId: emily.id }
    });

    // Create new students
    for (const student of students) {
      const created = await prisma.student.create({
        data: student
      });
      console.log(`Created student: ${created.firstName} ${created.lastName}`);
    }

    console.log(`\n✅ Successfully created ${students.length} students for Emily's Grade 1 class`);

  } catch (error) {
    console.error('Error seeding students:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedStudents();