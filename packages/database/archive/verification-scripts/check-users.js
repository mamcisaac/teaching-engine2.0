const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('All users in database:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
    });

    // Count unit plans for each user
    for (const user of users) {
      const unitCount = await prisma.unitPlan.count({
        where: { userId: user.id }
      });
      console.log(`  User ${user.id} has ${unitCount} unit plans`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();