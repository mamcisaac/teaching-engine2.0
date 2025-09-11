import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFrenchHours() {
  try {
    console.log('🔧 Fixing French Unit Hours to reach 292.5 total...\n');
    
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac not found in database');
    }
    
    // Get French LRP
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { 
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });
    
    if (!frenchLRP) {
      throw new Error('French Long Range Plan not found');
    }
    
    // Get all French units
    const frenchUnits = await prisma.unitPlan.findMany({
      where: { 
        userId: emily.id,
        longRangePlanId: frenchLRP.id
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`📚 Found ${frenchUnits.length} French units to adjust\n`);
    
    // New distribution to reach 292 hours (closest to 292.5 with integers)
    // Strategy: Add hours to some units to reach exactly 292
    const hourDistribution = [
      19, // Unit 1: Bienvenue à l'école!
      19, // Unit 2: Ma famille et moi
      19, // Unit 3: Les couleurs d'automne
      19, // Unit 4: Les fêtes d'automne
      19, // Unit 5: L'automne finit (increased from 18)
      19, // Unit 6: L'hiver commence (increased from 18)
      19, // Unit 7: Les fêtes d'hiver (increased from 18)
      18, // Unit 8: Vacances et famille
      18, // Unit 9: Nouvelle année
      18, // Unit 10: L'hiver magique
      18, // Unit 11: L'amitié
      18, // Unit 12: Les animaux d'hiver
      18, // Unit 13: Le printemps arrive (increased from 17)
      18, // Unit 14: Ma communauté (increased from 17)
      18, // Unit 15: Le printemps grandit (increased from 17)
      17  // Unit 16: Célébrons l'année
    ];
    
    // Verify distribution
    const totalHours = hourDistribution.reduce((sum, h) => sum + h, 0);
    console.log(`📊 Target distribution total: ${totalHours} hours\n`);
    
    // Update units with new hours
    console.log('📝 Updating unit hours...\n');
    
    for (let i = 0; i < frenchUnits.length; i++) {
      const unit = frenchUnits[i];
      const newHours = hourDistribution[i];
      
      console.log(`  ${i + 1}. ${unit.title}`);
      console.log(`     Current: ${unit.estimatedHours} → New: ${newHours} hours`);
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          estimatedHours: newHours
        }
      });
      
      console.log('     ✅ Updated\n');
    }
    
    // Final verification
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { 
        userId: emily.id,
        longRangePlanId: frenchLRP.id
      },
      select: {
        title: true,
        estimatedHours: true
      },
      orderBy: { startDate: 'asc' }
    });
    
    const finalTotal = updatedUnits.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 FINAL VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Total Units: ${updatedUnits.length}`);
    console.log(`  Total Hours: ${finalTotal}`);
    console.log(`  Required: 292.5 hours`);
    console.log(`  Status: ${finalTotal >= 292 && finalTotal <= 293 ? '✅ ACCEPTABLE (within 0.5 hours)' : '⚠️ NEEDS ADJUSTMENT'}`);
    console.log('');
    
    console.log('📋 Final Hour Distribution:');
    updatedUnits.forEach((unit, index) => {
      console.log(`  ${index + 1}. ${unit.title}: ${unit.estimatedHours} hours`);
    });
    
    console.log('\n✨ Hour Adjustment Complete!');
    console.log(`   Total: ${finalTotal} hours (target: 292.5)`);
    
    // Calculate lessons per unit
    console.log('\n📚 Lessons per Unit (at 45 min/lesson):');
    updatedUnits.forEach((unit, index) => {
      const lessons = Math.round((unit.estimatedHours || 0) * 60 / 45);
      console.log(`  ${index + 1}. ${unit.title}: ${lessons} lessons`);
    });
    
    const totalLessons = Math.round(finalTotal * 60 / 45);
    console.log(`\n  Total Lessons: ${totalLessons} (target: 390)`);
    
  } catch (error) {
    console.error('❌ Error fixing French hours:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixFrenchHours();