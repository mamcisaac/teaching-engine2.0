import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getEmilyUserId() {
  const emily = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: 'emily' } },
        { name: { contains: 'Emily' } }
      ]
    }
  });
  
  if (emily) {
    console.log('Found Emily:');
    console.log(`  ID: ${emily.id}`);
    console.log(`  Name: ${emily.name}`);
    console.log(`  Email: ${emily.email}`);
  } else {
    console.log('Emily not found. Listing all users:');
    const users = await prisma.user.findMany();
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });
  }
  
  await prisma.$disconnect();
}

getEmilyUserId().catch(console.error);