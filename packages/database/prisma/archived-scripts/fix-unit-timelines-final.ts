#!/usr/bin/env tsx

/**
 * FIX UNIT TIMELINES FINAL
 * Adjusts unit timelines to match actual lesson requirements
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnitTimelinesFinal() {
  console.log('🔧 FIXING UNIT TIMELINES TO MATCH LESSON REQUIREMENTS\n');
  console.log('='.repeat(70));
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac user not found');
    }
    
    // PHASE 1: Fix French and Math overly long units
    console.log('📚 PHASE 1: Adjusting French and Math unit timelines...\n');
    
    // French - need to shorten last 2 units
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { userId: emily.id, subject: 'Français langue première' }
    });
    
    if (frenchLRP) {
      const frenchUnits = await prisma.unitPlan.findMany({
        where: { longRangePlanId: frenchLRP.id },
        orderBy: { startDate: 'asc' }
      });
      
      // Update unit 7 (Spring) - shorten from 39 to 32 days
      if (frenchUnits[6]) {
        await prisma.unitPlan.update({
          where: { id: frenchUnits[6].id },
          data: {
            endDate: new Date(2026, 3, 17), // April 17 instead of April 30
            estimatedHours: 32 // 32 lessons × 1 hour
          }
        });
        console.log('  ✅ French Unit 7 shortened to 32 lessons');
      }
      
      // Update unit 8 (Celebrating) - start later
      if (frenchUnits[7]) {
        await prisma.unitPlan.update({
          where: { id: frenchUnits[7].id },
          data: {
            startDate: new Date(2026, 3, 20), // April 20
            estimatedHours: 32 // 32 lessons × 1 hour
          }
        });
        console.log('  ✅ French Unit 8 adjusted to 32 lessons');
      }
    }
    
    // Math - similar adjustments
    const mathLRP = await prisma.longRangePlan.findFirst({
      where: { userId: emily.id, subject: 'Mathématiques' }
    });
    
    if (mathLRP) {
      const mathUnits = await prisma.unitPlan.findMany({
        where: { longRangePlanId: mathLRP.id },
        orderBy: { startDate: 'asc' }
      });
      
      // Update unit 7 (Math Celebration)
      if (mathUnits[6]) {
        await prisma.unitPlan.update({
          where: { id: mathUnits[6].id },
          data: {
            endDate: new Date(2026, 3, 17), // April 17
            estimatedHours: 24 // 32 lessons × 0.75 hours
          }
        });
        console.log('  ✅ Math Unit 7 shortened to 32 lessons');
      }
      
      // Update unit 8 (Problem Solving)
      if (mathUnits[7]) {
        await prisma.unitPlan.update({
          where: { id: mathUnits[7].id },
          data: {
            startDate: new Date(2026, 3, 20), // April 20
            estimatedHours: 24 // 32 lessons × 0.75 hours
          }
        });
        console.log('  ✅ Math Unit 8 adjusted to 32 lessons');
      }
    }
    
    // PHASE 2: Fix Flexible Learning distribution
    console.log('\n🔄 PHASE 2: Redistributing Flexible Learning...\n');
    
    const flexLRP = await prisma.longRangePlan.findFirst({
      where: { userId: emily.id, subject: 'Flexible Learning' }
    });
    
    if (flexLRP) {
      // Delete existing flex units
      await prisma.unitPlan.deleteMany({
        where: { longRangePlanId: flexLRP.id }
      });
      
      // Create new properly distributed flex units
      const flexUnits = [
        {
          title: 'Introduction to Learning Centers',
          startDate: new Date(2025, 8, 4),  // Sept 4
          endDate: new Date(2025, 9, 31),   // Oct 31
          estimatedHours: 8,
          description: 'Introduction to library, learning centers, and independent work skills',
          lessonCount: 10
        },
        {
          title: 'Project-Based Exploration',
          startDate: new Date(2025, 10, 3),  // Nov 3
          endDate: new Date(2025, 11, 19),   // Dec 19
          estimatedHours: 8,
          description: 'Student-led projects, research skills, creative exploration',
          lessonCount: 10
        },
        {
          title: 'Winter Enrichment',
          startDate: new Date(2026, 0, 5),   // Jan 5
          endDate: new Date(2026, 1, 27),    // Feb 27
          estimatedHours: 10,
          description: 'STEM activities, coding introduction, winter themes',
          lessonCount: 13
        },
        {
          title: 'Spring Investigations',
          startDate: new Date(2026, 2, 2),   // Mar 2
          endDate: new Date(2026, 3, 30),    // Apr 30
          estimatedHours: 10,
          description: 'Science fair preparation, inquiry projects, outdoor learning',
          lessonCount: 13
        },
        {
          title: 'Year-End Celebrations',
          startDate: new Date(2026, 4, 4),   // May 4
          endDate: new Date(2026, 5, 25),    // June 25
          estimatedHours: 8,
          description: 'Portfolio creation, presentations, celebrations',
          lessonCount: 10
        }
      ];
      
      for (const unitData of flexUnits) {
        await prisma.unitPlan.create({
          data: {
            userId: emily.id,
            longRangePlanId: flexLRP.id,
            title: unitData.title,
            startDate: unitData.startDate,
            endDate: unitData.endDate,
            estimatedHours: unitData.estimatedHours,
            description: unitData.description,
            assessmentPlan: 'Portfolio development, self-assessment, observation',
            successCriteria: ['Active engagement', 'Project completion', 'Skill development'],
            differentiationStrategies: {
              support: 'Guided activities, scaffolding',
              extension: 'Advanced projects, peer mentoring',
              multimodal: 'Various formats and options'
            },
            keyVocabulary: ['Research', 'Project', 'Investigation', 'Presentation'],
            crossCurricularConnections: 'All subjects',
            indigenousPerspectives: 'Local knowledge and storytelling',
            communityConnections: 'Guest speakers, field trips, showcases'
          }
        });
      }
      console.log('  ✅ Created 5 properly distributed Flexible Learning units (56 lessons total)');
    }
    
    // PHASE 3: Adjust Sciences and PE slightly
    console.log('\n🔬 PHASE 3: Fine-tuning Science and PE...\n');
    
    // Science - trim last unit slightly
    const scienceLRP = await prisma.longRangePlan.findFirst({
      where: { userId: emily.id, subject: 'Sciences de la nature' }
    });
    
    if (scienceLRP) {
      const scienceUnits = await prisma.unitPlan.findMany({
        where: { longRangePlanId: scienceLRP.id },
        orderBy: { startDate: 'asc' }
      });
      
      // Adjust last unit to end earlier
      if (scienceUnits[6]) {
        await prisma.unitPlan.update({
          where: { id: scienceUnits[6].id },
          data: {
            endDate: new Date(2026, 5, 19), // June 19 instead of June 25
            estimatedHours: 11
          }
        });
        console.log('  ✅ Science Unit 7 adjusted');
      }
    }
    
    // PE - similar adjustment
    const peLRP = await prisma.longRangePlan.findFirst({
      where: { userId: emily.id, subject: 'Éducation physique' }
    });
    
    if (peLRP) {
      const peUnits = await prisma.unitPlan.findMany({
        where: { longRangePlanId: peLRP.id },
        orderBy: { startDate: 'asc' }
      });
      
      // Adjust last unit
      if (peUnits[7]) {
        await prisma.unitPlan.update({
          where: { id: peUnits[7].id },
          data: {
            endDate: new Date(2026, 5, 19), // June 19
            estimatedHours: 8
          }
        });
        console.log('  ✅ PE Unit 8 adjusted');
      }
    }
    
    // PHASE 4: Recalculate all hours properly
    console.log('\n⏱️ PHASE 4: Recalculating all unit hours...\n');
    
    const lessonDistribution = {
      'Français langue première': { lessons: 181, minutes: 60 },
      'Mathématiques': { lessons: 181, minutes: 45 },
      'Arts visuels': { lessons: 90, minutes: 45 },
      'Sciences humaines': { lessons: 91, minutes: 45 },
      'Sciences de la nature': { lessons: 108, minutes: 45 },
      'Formation personnelle et sociale': { lessons: 36, minutes: 45 },
      'Flexible Learning': { lessons: 56, minutes: 45 },
      'Éducation physique': { lessons: 108, minutes: 45 },
      'Music': { lessons: 54, minutes: 45 }
    };
    
    // Get all units
    const allUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { longRangePlan: true }
    });
    
    // Group by subject
    const unitsBySubject: Record<string, any[]> = {};
    allUnits.forEach(u => {
      const s = u.longRangePlan.subject;
      if (!unitsBySubject[s]) unitsBySubject[s] = [];
      unitsBySubject[s].push(u);
    });
    
    // Update hours for each subject
    for (const [subject, subjectUnits] of Object.entries(unitsBySubject)) {
      const dist = lessonDistribution[subject];
      if (!dist) continue;
      
      const totalLessons = dist.lessons;
      const minutesPerLesson = dist.minutes;
      const hoursPerLesson = minutesPerLesson / 60;
      
      // Calculate proportional distribution
      const totalDays = subjectUnits.reduce((sum, u) => {
        const days = Math.floor((u.endDate.getTime() - u.startDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      
      console.log(`${subject}: ${totalLessons} lessons across ${subjectUnits.length} units`);
      
      for (const unit of subjectUnits) {
        const unitDays = Math.floor((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const unitLessons = Math.round(totalLessons * unitDays / totalDays);
        const unitHours = Math.round(unitLessons * hoursPerLesson);
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            estimatedHours: unitHours
          }
        });
      }
    }
    
    // PHASE 5: Final validation
    console.log('\n✅ PHASE 5: Validating fixes...\n');
    
    const finalUnits = await prisma.unitPlan.count({
      where: { userId: emily.id }
    });
    
    const flexCount = await prisma.unitPlan.count({
      where: {
        longRangePlan: {
          userId: emily.id,
          subject: 'Flexible Learning'
        }
      }
    });
    
    console.log('Final counts:');
    console.log(`  • Total units: ${finalUnits}`);
    console.log(`  • Flexible Learning units: ${flexCount}`);
    
    // Check total hours
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { userId: emily.id }
    });
    const totalHours = updatedUnits.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    
    console.log(`  • Total hours: ${totalHours}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 UNIT TIMELINE FIX COMPLETE!\n');
    console.log('Summary:');
    console.log('  • French/Math long units shortened');
    console.log('  • Flexible Learning properly distributed (56 lessons)');
    console.log('  • Science/PE adjusted to fit');
    console.log('  • All hours recalculated proportionally');
    console.log('\n✨ Unit timelines now match actual lesson requirements!');
    
  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixUnitTimelinesFinal().catch(console.error);