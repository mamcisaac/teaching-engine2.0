import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleVerify() {
  try {
    console.log('🔍 SIMPLE VERIFICATION OF EXPECTATIONS\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98v0009vjr16o3e7awo' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    const intended = {
      'Premiers Pas Artistiques': 'PRIMARY: AV3, AV1 | SUPPORTING: AV2, AV4',
      "L'Aventure des Lignes": 'PRIMARY: AV2, AV3 | SUPPORTING: AV1, AV4',
      'La Magie des Couleurs': 'PRIMARY: AV2, AV1 | SUPPORTING: AV3, AV4',
      'Fêtes et Traditions Artistiques': 'PRIMARY: AV4, AV2 | SUPPORTING: AV1, AV3',
      'Textures et Matériaux': 'PRIMARY: AV3, AV1 | SUPPORTING: AV2, AV4',
      'Motifs et Impression': 'PRIMARY: AV2, AV3 | SUPPORTING: AV1, AV4',
      'Exploration 3D': 'PRIMARY: AV3, AV1 | SUPPORTING: AV2, AV4',
      'Art Environnemental': 'PRIMARY: AV1, AV4 | SUPPORTING: AV2, AV3',
      'Techniques Avancées': 'PRIMARY: AV2, AV3 | SUPPORTING: AV1, AV4',
      'Notre Parcours Artistique Français': 'PRIMARY: AV4, AV2 | SUPPORTING: AV1, AV3'
    };
    
    console.log('CURRICULUM PROGRESSION CHECK:\n');
    
    let allCorrect = true;
    
    for (const unit of units) {
      const codes = unit.expectations.map(e => e.expectation.code).sort();
      const actualPrimary = codes.slice(0, 2);
      const actualSupporting = codes.slice(2);
      
      console.log(`${unit.title}:`);
      console.log(`  INTENDED: ${intended[unit.title]}`);
      console.log(`  ACTUAL: PRIMARY: ${actualPrimary.join(', ')} | SUPPORTING: ${actualSupporting.join(', ')}`);
      
      // Check if all expectations are present
      const hasAll4 = codes.length === 4 && ['AV1', 'AV2', 'AV3', 'AV4'].every(code => codes.includes(code));
      console.log(`  ALL 4 PRESENT: ${hasAll4 ? '✅' : '❌'}`);
      
      if (!hasAll4) allCorrect = false;
      
      console.log();
    }
    
    // Check flexibility
    console.log('FLEXIBILITY CHECK:');
    for (const unit of units) {
      const hasRealFlexibility = unit.fieldTripsAndGuestSpeakers?.includes(unit.title.toUpperCase()) || 
                                unit.fieldTripsAndGuestSpeakers?.includes('REAL FLEXIBILITY');
      console.log(`${unit.title}: ${hasRealFlexibility ? '✅ Has unit-specific flexibility' : '❌ Generic flexibility'}`);
    }
    
    if (allCorrect) {
      console.log('\n✅ ALL UNITS HAVE COMPLETE EXPECTATIONS');
    } else {
      console.log('\n❌ SOME UNITS MISSING EXPECTATIONS');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleVerify();