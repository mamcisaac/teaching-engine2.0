import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function freshVerification() {
  try {
    console.log('🔍 FRESH VERIFICATION - No Cache\n');

    // Use completely fresh Prisma instance
    const freshPrisma = new PrismaClient();
    
    const lrpId = 'cmebyc98v0009vjr16o3e7awo';
    
    // Fresh query with explicit select to avoid any caching
    const units = await freshPrisma.unitPlan.findMany({
      where: { longRangePlanId: lrpId },
      select: {
        id: true,
        title: true,
        estimatedHours: true,
        startDate: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('Current database state:');
    let totalLessons = 0;
    let totalHours = 0;
    
    for (const unit of units) {
      const lessons = Math.round((unit.estimatedHours! * 60) / 45);
      totalLessons += lessons;
      totalHours += unit.estimatedHours!;
      console.log(`  ${unit.title}: ${unit.estimatedHours} hours (${lessons} lessons)`);
    }
    
    console.log(`\nTotal: ${totalLessons} lessons, ${totalHours} hours`);
    console.log(`Target: 195 lessons, 146.25 hours`);
    console.log(`Gap: ${195 - totalLessons} lessons, ${(146.25 - totalHours).toFixed(2)} hours`);

    // Check if specific units have the expected values
    const octUnit = units.find(u => u.title === "L'Aventure des Lignes");
    const decUnit = units.find(u => u.title === "Fêtes et Traditions Artistiques");
    const marUnit = units.find(u => u.title === "Exploration 3D");
    const mayUnit = units.find(u => u.title === "Techniques Avancées");

    console.log('\n🎯 SPECIFIC UNIT CHECK:');
    console.log(`Oct (L'Aventure des Lignes): ${octUnit?.estimatedHours} hours (should be 15.75)`);
    console.log(`Dec (Fêtes et Traditions): ${decUnit?.estimatedHours} hours (should be 10.5)`);
    console.log(`Mar (Exploration 3D): ${marUnit?.estimatedHours} hours (should be 15.75)`);
    console.log(`May (Techniques Avancées): ${mayUnit?.estimatedHours} hours (should be 15.75)`);

    await freshPrisma.$disconnect();

  } catch (error) {
    console.error('Error in fresh verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

freshVerification();