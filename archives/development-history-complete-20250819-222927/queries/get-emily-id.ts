import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getEmilyId() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'emily' }},
          { name: { contains: 'Emily' }}
        ]
      }
    });
    
    console.log('Users found:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });
    
    // Also get the user from an existing LRP
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        id: 'cmebyc98k0003vjr1svziz0in'
      }
    });
    
    console.log(`\nMath LRP userId: ${lrp?.userId}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getEmilyId();