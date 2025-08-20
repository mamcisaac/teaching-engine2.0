import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(__dirname, 'packages/database/prisma/dev.db')}`
    }
  }
});

async function findEmilyAutumnUnit() {
  try {
    console.log('🔍 Searching for Emily\'s autumn colors unit...\n');

    // Search for units with autumn/color related terms
    const autumnUnits = await prisma.unitPlan.findMany({
      where: {
        OR: [
          { title: { contains: 'couleur' } },
          { title: { contains: 'automne' } },
          { title: { contains: 'autumn' } },
          { title: { contains: 'color' } },
          { title: { contains: 'octobre' } },
          { title: { contains: 'october' } },
          { title: { contains: 'Couleur' } },
          { title: { contains: 'Automne' } },
          { title: { contains: 'Autumn' } },
          { title: { contains: 'Color' } },
          { title: { contains: 'Octobre' } },
          { title: { contains: 'October' } }
        ]
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${autumnUnits.length} potential autumn/color units:`);
    autumnUnits.forEach((unit, index) => {
      console.log(`${index + 1}. "${unit.title}" by ${unit.user.name} (ID: ${unit.id})`);
      console.log(`   Start: ${unit.startDate?.toISOString().split('T')[0]}`);
      console.log(`   End: ${unit.endDate?.toISOString().split('T')[0]}\n`);
    });

    // Also search for Emily specifically
    const emilyUnits = await prisma.unitPlan.findMany({
      where: {
        user: {
          name: { contains: 'Emily' }
        }
      },
      include: {
        user: true,
        longRangePlan: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    console.log(`\n📚 All Emily's units (${emilyUnits.length} total):`);
    emilyUnits.forEach((unit, index) => {
      console.log(`${index + 1}. "${unit.title}" (ID: ${unit.id})`);
      console.log(`   Start: ${unit.startDate?.toISOString().split('T')[0]}`);
      console.log(`   End: ${unit.endDate?.toISOString().split('T')[0]}`);
      console.log(`   Subject: ${unit.longRangePlan.subject}\n`);
    });

    // Look specifically for October/autumn timeframe units by Emily
    const octoberUnits = emilyUnits.filter(unit => {
      if (!unit.startDate) return false;
      const month = unit.startDate.getMonth(); // 0 = Jan, 9 = Oct
      return month === 8 || month === 9 || month === 10; // Sep, Oct, Nov
    });

    console.log(`\n🍂 Emily's fall/autumn units (Sep-Nov):`);
    octoberUnits.forEach((unit, index) => {
      console.log(`${index + 1}. "${unit.title}" (ID: ${unit.id})`);
      console.log(`   Start: ${unit.startDate?.toISOString().split('T')[0]} | Subject: ${unit.subject}`);
      console.log(`   Duration: ${unit.durationWeeks} weeks\n`);
    });

  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findEmilyAutumnUnit();