import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function createEmilyUser() {
  // Check if user 23 exists
  const existingUser = await prisma.user.findUnique({
    where: { id: 23 },
  });
  
  if (existingUser) {
    console.log('User 23 (Emily) already exists:', existingUser.email);
    return;
  }
  
  // Check what users exist
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      id: 'asc'
    }
  });
  
  console.log('Existing users:');
  users.forEach(user => {
    console.log(`  User ${user.id}: ${user.email} (${user.name})`);
  });
  
  // Create Emily user
  console.log('\nCreating user 23 (Emily)...');
  
  const emily = await prisma.user.create({
    data: {
      id: 23,
      email: 'emily@teaching-engine.com',
      name: 'Emily',
      password: 'hashed_password_here', // This would be properly hashed in production
      role: 'TEACHER',
      gradeLevel: '1',
      province: 'PEI',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }
  });
  
  console.log('Created user:', emily);
  
  // Now update lessons to belong to Emily
  console.log('\nUpdating all ETFOLessonPlan records to belong to user 23 (Emily)...');
  
  const result = await prisma.eTFOLessonPlan.updateMany({
    where: {
      userId: 1,
    },
    data: {
      userId: 23,
    }
  });
  
  console.log(`Updated ${result.count} lessons to user 23`);
  
  // Verify the update
  const lessonCounts = await prisma.eTFOLessonPlan.groupBy({
    by: ['userId'],
    _count: {
      id: true,
    }
  });
  
  console.log('\nNew lesson counts by user:');
  lessonCounts.forEach(count => {
    console.log(`  User ${count.userId}: ${count._count.id} lessons`);
  });
}

createEmilyUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());