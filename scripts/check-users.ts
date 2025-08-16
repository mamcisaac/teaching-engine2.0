import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            etfoLessonPlans: true,
            unitPlans: true,
            longRangePlans: true
          }
        }
      }
    });

    console.log('All users in database:');
    users.forEach(user => {
      console.log(`\nID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Lesson Plans: ${user._count.etfoLessonPlans}`);
      console.log(`Unit Plans: ${user._count.unitPlans}`);
      console.log(`Long Range Plans: ${user._count.longRangePlans}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();