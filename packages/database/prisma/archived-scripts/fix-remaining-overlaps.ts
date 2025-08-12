#!/usr/bin/env tsx

/**
 * FIX REMAINING OVERLAPS
 * Direct update to ensure no unit timeline overlaps
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRemainingOverlaps() {
  console.log('🔧 FIXING REMAINING OVERLAPS\n');
  console.log('='.repeat(70));
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // Get all units grouped by subject
    const units = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { title: 'asc' }
      ]
    });
    
    // Group by subject
    const bySubject: Record<string, any[]> = {};
    units.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!bySubject[s]) bySubject[s] = [];
      bySubject[s].push(u);
    });
    
    // Define exact non-overlapping timelines for each subject
    const timelines: Record<string, Array<{start: Date, end: Date}>> = {
      'Français langue première': [
        { start: new Date(2025, 8, 4), end: new Date(2025, 8, 26) },
        { start: new Date(2025, 8, 29), end: new Date(2025, 9, 24) },
        { start: new Date(2025, 9, 27), end: new Date(2025, 10, 21) },
        { start: new Date(2025, 10, 24), end: new Date(2025, 11, 19) },
        { start: new Date(2026, 0, 5), end: new Date(2026, 0, 30) },
        { start: new Date(2026, 1, 2), end: new Date(2026, 1, 27) },
        { start: new Date(2026, 2, 2), end: new Date(2026, 3, 30) },
        { start: new Date(2026, 4, 3), end: new Date(2026, 5, 25) }
      ],
      'Mathématiques': [
        { start: new Date(2025, 8, 4), end: new Date(2025, 8, 26) },
        { start: new Date(2025, 8, 29), end: new Date(2025, 9, 24) },
        { start: new Date(2025, 9, 27), end: new Date(2025, 10, 21) },
        { start: new Date(2025, 10, 24), end: new Date(2025, 11, 19) },
        { start: new Date(2026, 0, 5), end: new Date(2026, 0, 30) },
        { start: new Date(2026, 1, 2), end: new Date(2026, 1, 27) },
        { start: new Date(2026, 2, 2), end: new Date(2026, 3, 30) },
        { start: new Date(2026, 4, 3), end: new Date(2026, 5, 25) }
      ],
      'Sciences de la nature': [
        { start: new Date(2025, 8, 4), end: new Date(2025, 9, 3) },
        { start: new Date(2025, 9, 6), end: new Date(2025, 10, 7) },
        { start: new Date(2025, 10, 10), end: new Date(2025, 11, 19) },
        { start: new Date(2026, 0, 5), end: new Date(2026, 1, 13) },
        { start: new Date(2026, 1, 17), end: new Date(2026, 2, 27) },
        { start: new Date(2026, 3, 1), end: new Date(2026, 4, 8) },
        { start: new Date(2026, 4, 11), end: new Date(2026, 5, 25) }
      ],
      'Sciences humaines': [
        { start: new Date(2025, 8, 4), end: new Date(2025, 9, 31) },
        { start: new Date(2025, 10, 4), end: new Date(2025, 11, 19) },
        { start: new Date(2026, 0, 6), end: new Date(2026, 1, 27) },
        { start: new Date(2026, 2, 3), end: new Date(2026, 3, 30) },
        { start: new Date(2026, 4, 5), end: new Date(2026, 5, 25) }
      ],
      'Arts visuels': [
        { start: new Date(2025, 8, 4), end: new Date(2025, 9, 15) },
        { start: new Date(2025, 9, 20), end: new Date(2025, 11, 3) },
        { start: new Date(2025, 11, 8), end: new Date(2026, 0, 28) },
        { start: new Date(2026, 1, 2), end: new Date(2026, 2, 18) },
        { start: new Date(2026, 2, 23), end: new Date(2026, 4, 6) },
        { start: new Date(2026, 4, 11), end: new Date(2026, 5, 24) }
      ],
      'Éducation physique': [
        { start: new Date(2025, 8, 5), end: new Date(2025, 9, 3) },
        { start: new Date(2025, 9, 7), end: new Date(2025, 10, 7) },
        { start: new Date(2025, 10, 11), end: new Date(2025, 11, 19) },
        { start: new Date(2026, 0, 6), end: new Date(2026, 1, 6) },
        { start: new Date(2026, 1, 10), end: new Date(2026, 2, 13) },
        { start: new Date(2026, 2, 24), end: new Date(2026, 3, 24) },
        { start: new Date(2026, 3, 28), end: new Date(2026, 4, 29) },
        { start: new Date(2026, 5, 2), end: new Date(2026, 5, 25) }
      ],
      'Music': [
        { start: new Date(2025, 8, 9), end: new Date(2025, 9, 16) },
        { start: new Date(2025, 9, 21), end: new Date(2025, 10, 27) },
        { start: new Date(2025, 11, 2), end: new Date(2026, 0, 22) },
        { start: new Date(2026, 0, 27), end: new Date(2026, 2, 5) },
        { start: new Date(2026, 2, 10), end: new Date(2026, 3, 16) },
        { start: new Date(2026, 3, 21), end: new Date(2026, 4, 28) },
        { start: new Date(2026, 5, 2), end: new Date(2026, 5, 25) }
      ],
      'Formation personnelle et sociale': [
        { start: new Date(2025, 8, 5), end: new Date(2025, 9, 10) },
        { start: new Date(2025, 9, 17), end: new Date(2025, 10, 21) },
        { start: new Date(2025, 10, 28), end: new Date(2026, 0, 23) },
        { start: new Date(2026, 0, 30), end: new Date(2026, 2, 13) },
        { start: new Date(2026, 2, 27), end: new Date(2026, 4, 8) },
        { start: new Date(2026, 4, 15), end: new Date(2026, 5, 19) }
      ],
      'Flexible Learning': [
        { start: new Date(2025, 8, 4), end: new Date(2025, 11, 19) },
        { start: new Date(2026, 0, 5), end: new Date(2026, 2, 27) },
        { start: new Date(2026, 3, 1), end: new Date(2026, 5, 25) }
      ]
    };
    
    // Update each subject's units
    for (const [subject, subjectUnits] of Object.entries(bySubject)) {
      const subjectTimelines = timelines[subject];
      
      if (subjectTimelines && subjectUnits.length > 0) {
        console.log(`\nFixing ${subject} (${subjectUnits.length} units):`);
        
        // Sort units by current start date for consistent ordering
        subjectUnits.sort((a, b) => 
          (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0)
        );
        
        // Apply timeline to each unit
        for (let i = 0; i < Math.min(subjectUnits.length, subjectTimelines.length); i++) {
          const unit = subjectUnits[i];
          const timeline = subjectTimelines[i];
          
          await prisma.unitPlan.update({
            where: { id: unit.id },
            data: {
              startDate: timeline.start,
              endDate: timeline.end
            }
          });
          
          console.log(`  ✅ ${unit.title}: ${timeline.start.toDateString()} - ${timeline.end.toDateString()}`);
        }
      }
    }
    
    // Verify no overlaps remain
    console.log('\n' + '='.repeat(70));
    console.log('VERIFYING FIXES...\n');
    
    const verifyUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });
    
    // Check for overlaps by subject
    const verifyBySubject: Record<string, any[]> = {};
    verifyUnits.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!verifyBySubject[s]) verifyBySubject[s] = [];
      verifyBySubject[s].push({
        title: u.title,
        start: u.startDate,
        end: u.endDate
      });
    });
    
    let hasAnyOverlaps = false;
    Object.entries(verifyBySubject).forEach(([subject, units]) => {
      for (let i = 1; i < units.length; i++) {
        const prev = units[i-1];
        const curr = units[i];
        if (curr.start < prev.end) {
          console.log(`❌ Overlap remaining in ${subject}`);
          hasAnyOverlaps = true;
        }
      }
    });
    
    if (!hasAnyOverlaps) {
      console.log('✅ All overlaps fixed successfully!');
    }
    
    console.log('\n🎉 OVERLAP FIX COMPLETE!');
    
  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixRemainingOverlaps().catch(console.error);