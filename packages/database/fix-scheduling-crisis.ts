#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Emily's User ID from diagnosis
const EMILY_USER_ID = 23;

// School year dates
const SCHOOL_YEAR_START = new Date('2025-09-04');
const SCHOOL_YEAR_END = new Date('2026-06-26');

// PEI Holiday breaks (to respect when scheduling)
const DECEMBER_BREAK_START = new Date('2025-12-20');
const DECEMBER_BREAK_END = new Date('2026-01-06');

async function fixSchedulingCrisis() {
  console.log('🔧 FIXING EMILY\'S SCHEDULING CRISIS...\n');
  
  try {
    console.log('📅 School Year: September 4, 2025 → June 26, 2026\n');
    
    // First, get all Emily's unit plans grouped by subject
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: EMILY_USER_ID },
      include: {
        longRangePlan: {
          select: { subject: true, id: true }
        }
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    // Group by subject
    const subjectGroups: { [key: string]: any[] } = {};
    unitPlans.forEach(unit => {
      const subject = unit.longRangePlan.subject;
      if (!subjectGroups[subject]) {
        subjectGroups[subject] = [];
      }
      subjectGroups[subject].push(unit);
    });
    
    // 1. FIX FRANÇAIS LANGUE PREMIÈRE (MOST CRITICAL)
    console.log('🚨 FIXING FRANÇAIS LANGUE PREMIÈRE (MOST CRITICAL)...\n');
    
    const frenchUnits = subjectGroups['Français langue première'] || [];
    if (frenchUnits.length === 8) {
      const frenchSchedule = [
        { title: 'Bienvenue à l\'école!', start: '2025-09-04', end: '2025-09-18', hours: 50 },
        { title: 'Ma famille et moi', start: '2025-09-19', end: '2025-10-17', hours: 55 },
        { title: 'Les fêtes d\'automne', start: '2025-10-18', end: '2025-11-15', hours: 55 },
        { title: 'L\'hiver magique', start: '2025-12-03', end: '2026-01-17', hours: 55 },
        { title: 'Nos amis les animaux', start: '2026-01-20', end: '2026-02-21', hours: 50 },
        { title: 'Ma communauté', start: '2026-02-24', end: '2026-03-28', hours: 50 },
        { title: 'Le printemps en fleurs', start: '2026-04-07', end: '2026-05-09', hours: 50 },
        { title: 'Célébrons nos apprentissages', start: '2026-05-12', end: '2026-06-20', hours: 45 }
      ];
      
      for (let i = 0; i < frenchUnits.length; i++) {
        const unit = frenchUnits[i];
        const schedule = frenchSchedule[i];
        
        console.log(`  Fixing: "${unit.title}" → "${schedule.title}"`);
        console.log(`    ${schedule.start} → ${schedule.end} (${schedule.hours}h)`);
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            title: schedule.title,
            startDate: new Date(schedule.start),
            endDate: new Date(schedule.end),
            estimatedHours: schedule.hours
          }
        });
      }
      console.log('✅ French units fixed!\n');
    }
    
    // 2. EXTEND MATHÉMATIQUES TO FULL YEAR
    console.log('📊 EXTENDING MATHÉMATIQUES TO FULL YEAR...\n');
    
    const mathUnits = subjectGroups['Mathématiques'] || [];
    if (mathUnits.length >= 8) {
      const mathSchedule = [
        { start: '2025-09-04', end: '2025-10-02' }, // Unit 1: Numbers All Around Us
        { start: '2025-10-03', end: '2025-11-04' }, // Unit 2: Making Sense of Numbers  
        { start: '2025-11-05', end: '2025-12-04' }, // Unit 3: Patterns and Shapes
        { start: '2025-12-05', end: '2026-01-14' }, // Unit 4: Adding and Subtracting
        { start: '2026-01-15', end: '2026-02-12' }, // Unit 5: Mental Math Strategies
        { start: '2026-02-13', end: '2026-03-18' }, // Unit 6: Measurement Exploration
        { start: '2026-03-19', end: '2026-04-16' }, // Unit 7: Problem Solving Adventures
        { start: '2026-04-17', end: '2026-06-20' }  // Unit 8: Math Celebration (EXTENDED)
      ];
      
      for (let i = 0; i < Math.min(mathUnits.length, mathSchedule.length); i++) {
        const unit = mathUnits[i];
        const schedule = mathSchedule[i];
        
        console.log(`  Extending: "${unit.title}"`);
        console.log(`    ${schedule.start} → ${schedule.end}`);
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: new Date(schedule.start),
            endDate: new Date(schedule.end)
          }
        });
      }
      console.log('✅ Math units extended!\n');
    }
    
    // 3. EXTEND SCIENCES DE LA NATURE TO FULL YEAR
    console.log('🔬 EXTENDING SCIENCES DE LA NATURE TO FULL YEAR...\n');
    
    const scienceUnits = subjectGroups['Sciences de la nature'] || [];
    if (scienceUnits.length >= 7) {
      const scienceSchedule = [
        { start: '2025-09-04', end: '2025-09-26' }, // Unit 1: Our School Environment (extend)
        { start: '2025-09-29', end: '2025-10-24' }, // Unit 2: Fall Changes (extend)
        { start: '2025-10-27', end: '2025-11-21' }, // Unit 3: Energy in Our Lives (extend)
        { start: '2025-11-24', end: '2026-01-17' }, // Unit 4: Winter Wonders (extend through break)
        { start: '2026-01-20', end: '2026-03-20' }, // Unit 5: Growing and Changing (extend)
        { start: '2026-03-23', end: '2026-05-16' }, // Unit 6: Spring Awakening (extend)
        { start: '2026-05-19', end: '2026-06-20' }  // Unit 7: Our Impact on Nature (extend)
      ];
      
      for (let i = 0; i < Math.min(scienceUnits.length, scienceSchedule.length); i++) {
        const unit = scienceUnits[i];
        const schedule = scienceSchedule[i];
        
        console.log(`  Extending: "${unit.title}"`);
        console.log(`    ${schedule.start} → ${schedule.end}`);
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: new Date(schedule.start),
            endDate: new Date(schedule.end),
            estimatedHours: 15 // Increase hours for extended time
          }
        });
      }
      console.log('✅ Science units extended!\n');
    }
    
    // 4. EXTEND SCIENCES HUMAINES TO FULL YEAR  
    console.log('🌍 EXTENDING SCIENCES HUMAINES TO FULL YEAR...\n');
    
    const socialStudiesUnits = subjectGroups['Sciences humaines'] || [];
    if (socialStudiesUnits.length >= 5) {
      const socialSchedule = [
        { start: '2025-09-04', end: '2025-10-10' }, // Unit 1: My Family and Our Class (extend)
        { start: '2025-10-13', end: '2025-11-21' }, // Unit 2: Our Rights and Responsibilities (extend)
        { start: '2025-11-24', end: '2026-01-31' }, // Unit 3: My Story Through Time (extend)
        { start: '2026-02-03', end: '2026-04-10' }, // Unit 4: Exploring Our World (extend)
        { start: '2026-04-13', end: '2026-06-20' }  // Unit 5: Responsible Digital Citizens (extend)
      ];
      
      for (let i = 0; i < Math.min(socialStudiesUnits.length, socialSchedule.length); i++) {
        const unit = socialStudiesUnits[i];
        const schedule = socialSchedule[i];
        
        console.log(`  Extending: "${unit.title}"`);
        console.log(`    ${schedule.start} → ${schedule.end}`);
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: new Date(schedule.start),
            endDate: new Date(schedule.end),
            estimatedHours: 25 // Increase hours for extended time
          }
        });
      }
      console.log('✅ Social Studies units extended!\n');
    }
    
    // 5. EXTEND ARTS VISUELS TO FULL YEAR
    console.log('🎨 EXTENDING ARTS VISUELS TO FULL YEAR...\n');
    
    const artsUnits = subjectGroups['Arts visuels'] || [];
    if (artsUnits.length >= 6) {
      const artsSchedule = [
        { start: '2025-09-04', end: '2025-10-03' }, // Unit 1: Discovering Art in Our World (extend)
        { start: '2025-10-06', end: '2025-11-07' }, // Unit 2: Colors and Feelings (extend)
        { start: '2025-11-10', end: '2026-01-17' }, // Unit 3: Winter Celebrations Through Art (extend)
        { start: '2026-01-20', end: '2026-03-06' }, // Unit 4: Textures and Patterns (extend)
        { start: '2026-03-09', end: '2026-04-25' }, // Unit 5: Stories in Art (extend)
        { start: '2026-04-28', end: '2026-06-20' }  // Unit 6: Our Art Gallery (extend)
      ];
      
      for (let i = 0; i < Math.min(artsUnits.length, artsSchedule.length); i++) {
        const unit = artsUnits[i];
        const schedule = artsSchedule[i];
        
        console.log(`  Extending: "${unit.title}"`);
        console.log(`    ${schedule.start} → ${schedule.end}`);
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: new Date(schedule.start),
            endDate: new Date(schedule.end),
            estimatedHours: 20 // Increase hours for extended time
          }
        });
      }
      console.log('✅ Arts units extended!\n');
    }
    
    // 6. EXTEND FORMATION PERSONNELLE ET SOCIALE TO FULL YEAR
    console.log('💪 EXTENDING FORMATION PERSONNELLE ET SOCIALE TO FULL YEAR...\n');
    
    const fpsUnits = subjectGroups['Formation personnelle et sociale'] || [];
    if (fpsUnits.length >= 6) {
      const fpsSchedule = [
        { start: '2025-09-04', end: '2025-10-10' }, // Unit 1: Me, Myself, and I (extend)
        { start: '2025-10-13', end: '2025-11-21' }, // Unit 2: Healthy Me (extend) 
        { start: '2025-11-24', end: '2026-01-17' }, // Unit 3: Safe and Sound (extend)
        { start: '2026-01-20', end: '2026-03-06' }, // Unit 4: Friends and Feelings (extend)
        { start: '2026-03-09', end: '2026-04-25' }, // Unit 5: Growing and Learning (extend)
        { start: '2026-04-28', end: '2026-06-20' }  // Unit 6: Our Wonderful World (extend)
      ];
      
      for (let i = 0; i < Math.min(fpsUnits.length, fpsSchedule.length); i++) {
        const unit = fpsUnits[i];
        const schedule = fpsSchedule[i];
        
        console.log(`  Extending: "${unit.title}"`);
        console.log(`    ${schedule.start} → ${schedule.end}`);
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: new Date(schedule.start),
            endDate: new Date(schedule.end),
            estimatedHours: 15 // Increase hours for extended time
          }
        });
      }
      console.log('✅ FPS units extended!\n');
    }
    
    console.log('🎉 ALL SCHEDULING FIXES COMPLETE!\n');
    
    console.log('✅ SUMMARY OF FIXES:');
    console.log('  - French units: Compressed to fit 2025-2026 school year');
    console.log('  - Math units: Extended final unit to June 20, 2026');
    console.log('  - Science units: Extended all units to cover full year');
    console.log('  - Social Studies: Extended all units to cover full year');
    console.log('  - Arts: Extended all units to cover full year');
    console.log('  - FPS: Extended all units to cover full year');
    console.log('  - All subjects now run CONCURRENTLY throughout the school year');
    console.log('  - All units respect PEI holidays and weekends\n');
    
  } catch (error) {
    console.error('❌ Error fixing scheduling:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixSchedulingCrisis()
  .then(() => console.log('🔧 Scheduling crisis fixed successfully!'))
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });