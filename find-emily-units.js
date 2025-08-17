import { PrismaClient } from './packages/database/dist/index.js';

const prisma = new PrismaClient();

async function findEmilyUnits() {
  try {
    // Find Emily McIsaac's units
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: 23, // Emily McIsaac's ID
        title: {
          contains: 'Our School Environment'
        }
      },
      include: {
        lessonPlans: {
          select: {
            id: true,
            title: true,
            subject: true
          }
        }
      }
    });

    console.log('Found units:', JSON.stringify(unitPlans, null, 2));

    // If no specific unit found, show all Emily's units to help find it
    if (unitPlans.length === 0) {
      console.log('\nNo "Our School Environment" unit found. Showing all Emily\'s units:');
      const allUnits = await prisma.unitPlan.findMany({
        where: {
          userId: 23
        },
        include: {
          lessonPlans: {
            select: {
              id: true,
              title: true,
              subject: true
            }
          }
        }
      });
      console.log(JSON.stringify(allUnits, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findEmilyUnits();