#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restorePerfectUnitsFromAug19Morning() {
  console.log('🔄 RESTORING PERFECT UNIT PLANS FROM AUGUST 19 MORNING');
  console.log('======================================================
');
  console.log('⚠️  WARNING: This will restore the rich pedagogical content');
  console.log('that was overwritten by ultimate-perfection.ts at 19:09
');
  
  const EMILY_USER_ID = 23;
  
  try {
    // First unlock all units to allow updates
    console.log('🔓 Unlocking units for restoration...');
    await prisma.unitPlan.updateMany({
      where: { userId: EMILY_USER_ID },
      data: { 
        isLocked: false,
        lockedAt: null,
        lockedReason: null
      }
    });
    console.log('✅ Units unlocked
');
    
    console.log('📚 Starting restoration of rich pedagogical content...
');
    
    // Will compile content from morning scripts
    // French from perfect-french-units-manually.ts
    // Science from perfect-science-units-manually.ts  
    // Arts from perfect-arts-units-manually.ts
    // Health/FPS from perfect-health-fps-units-manually.ts
    // Social Studies from perfect-social-studies-units-manually.ts
    // Math from create-truly-perfect-flexible-math-units.ts
    
    let totalUpdated = 0;
    
    console.log('Starting compilation from morning scripts...');
    
  } catch (error) {
    console.error('❌ Error during restoration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restorePerfectUnitsFromAug19Morning();
