import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyExpectationsOrder() {
  try {
    console.log('🔍 VERIFYING ACTUAL CURRICULUM EXPECTATIONS ORDER\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98v0009vjr16o3e7awo' },
      include: {
        expectations: {
          include: {
            expectation: true
          },
          orderBy: {
            expectation: {
              code: 'asc'
            }
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('CHECKING WHAT ACTUALLY GOT SAVED:\n');
    
    // Check raw data
    for (const unit of units) {
      console.log(`${unit.title}:`);
      
      // Get the raw expectation links
      const rawLinks = await prisma.unitPlanExpectation.findMany({
        where: { unitPlanId: unit.id },
        include: { expectation: true },
        orderBy: { id: 'asc' } // Order by creation order
      });
      
      console.log('  By creation order:');
      rawLinks.forEach((link, i) => {
        console.log(`    ${i+1}. ${link.expectation.code}`);
      });
      
      // Show what we intended
      const intended = {
        'Premiers Pas Artistiques': ['AV3', 'AV1', 'AV2', 'AV4'],
        "L'Aventure des Lignes": ['AV2', 'AV3', 'AV1', 'AV4'],
        'La Magie des Couleurs': ['AV2', 'AV1', 'AV3', 'AV4'],
        'Fêtes et Traditions Artistiques': ['AV4', 'AV2', 'AV1', 'AV3'],
        'Textures et Matériaux': ['AV3', 'AV1', 'AV2', 'AV4'],
        'Motifs et Impression': ['AV2', 'AV3', 'AV1', 'AV4'],
        'Exploration 3D': ['AV3', 'AV1', 'AV2', 'AV4'],
        'Art Environnemental': ['AV1', 'AV4', 'AV2', 'AV3'],
        'Techniques Avancées': ['AV2', 'AV3', 'AV1', 'AV4'],
        'Notre Parcours Artistique Français': ['AV4', 'AV2', 'AV1', 'AV3']
      };
      
      const expected = intended[unit.title];
      if (expected) {
        console.log(`  INTENDED: PRIMARY [${expected[0]}, ${expected[1]}] SUPPORTING [${expected[2]}, ${expected[3]}]`);
        
        const actual = rawLinks.map(l => l.expectation.code);
        const matches = JSON.stringify(actual) === JSON.stringify(expected);
        console.log(`  ${matches ? '✅ CORRECT' : '❌ MISMATCH'}\n`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyExpectationsOrder();