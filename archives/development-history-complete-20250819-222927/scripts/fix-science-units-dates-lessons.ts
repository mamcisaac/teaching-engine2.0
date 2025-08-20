#!/usr/bin/env npx tsx

/**
 * Fix Science Unit Plans - Phase 1: Correct Date Ranges and Lesson Counts
 * 
 * This script fixes the mathematical impossibilities in the current units
 * by aligning dates with actual school days and lesson counts.
 * 
 * Based on PEI 2025-2026 school calendar:
 * - 195 total school days
 * - Christmas break: Dec 22 - Jan 4
 * - March break: Mar 15-21 (but we'll work around it)
 * - Various statutory holidays
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixUnitsDateAndLessons() {
  console.log('🔧 FIXING SCIENCE UNITS: Date Ranges and Lesson Counts')
  console.log('======================================================')
  
  try {
    // Find Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    })
    
    if (!emily) {
      throw new Error('Emily McIsaac account not found')
    }
    
    // Find all Science units for Emily (ordered by start date)
    const scienceUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    
    console.log(`Found ${scienceUnits.length} Science units to fix\n`)
    
    // Define correct date ranges and lesson counts based on actual school calendar
    const correctUnitData = [
      {
        title: "Notre école sécuritaire - Exploration scientifique",
        startDate: new Date('2025-09-02'),
        endDate: new Date('2025-09-26'),
        lessons: 19,
        month: 'septembre',
        schoolDays: 19
      },
      {
        title: "Les changements d'automne - Découvertes saisonnières", 
        startDate: new Date('2025-09-29'),
        endDate: new Date('2025-10-28'),
        lessons: 21,
        month: 'octobre',
        schoolDays: 21 // Accounting for Thanksgiving
      },
      {
        title: "Matériaux et propriétés - Exploration tactile",
        startDate: new Date('2025-10-29'),
        endDate: new Date('2025-11-28'),
        lessons: 20,
        month: 'novembre',
        schoolDays: 20 // Accounting for Remembrance Day
      },
      {
        title: "Sécurité hivernale - Science pratique",
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-19'),
        lessons: 15,
        month: 'décembre',
        schoolDays: 15
      },
      {
        title: "Lumière et son - Découvertes sensorielles",
        startDate: new Date('2026-01-05'),
        endDate: new Date('2026-01-30'),
        lessons: 20,
        month: 'janvier',
        schoolDays: 20
      },
      {
        title: "Choses vivantes qui grandissent - Sciences de la vie",
        startDate: new Date('2026-02-02'),
        endDate: new Date('2026-02-27'),
        lessons: 19,
        month: 'février',
        schoolDays: 19 // Accounting for Islander Day
      },
      {
        title: "Motifs météorologiques - Phénomènes observables",
        startDate: new Date('2026-03-02'),
        endDate: new Date('2026-03-31'),
        lessons: 19,
        month: 'mars',
        schoolDays: 19 // Working around March break
      },
      {
        title: "Machines simples - Exploration mécanique",
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-30'),
        lessons: 20,
        month: 'avril',
        schoolDays: 20 // Accounting for Easter
      },
      {
        title: "Habitats d'animaux - Connexions environnementales",
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-29'),
        lessons: 21,
        month: 'mai',
        schoolDays: 21 // Accounting for Victoria Day
      },
      {
        title: "Célébration scientifique - Révision de l'année",
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-26'),
        lessons: 21,
        month: 'juin',
        schoolDays: 21 // Extended to end of June
      }
    ]
    
    // Verify total lessons
    const totalLessons = correctUnitData.reduce((sum, unit) => sum + unit.lessons, 0)
    console.log(`Total lessons across all units: ${totalLessons} (Target: 195)\n`)
    
    if (totalLessons !== 195) {
      console.log('⚠️ WARNING: Total lessons do not equal 195!')
      console.log(`Difference: ${195 - totalLessons} lessons\n`)
    }
    
    // Update each unit
    for (let i = 0; i < scienceUnits.length; i++) {
      const unit = scienceUnits[i]
      const correctData = correctUnitData[i]
      
      if (!correctData) {
        console.log(`❌ No correction data for unit ${i + 1}`)
        continue
      }
      
      // Get current data
      const currentKeyVocab = unit.keyVocabulary as any
      const currentLessons = currentKeyVocab?.totalLessons || unit.estimatedHours || 0
      
      console.log(`Unit ${i + 1}: ${unit.title}`)
      console.log(`  Current: ${unit.startDate.toISOString().split('T')[0]} → ${unit.endDate.toISOString().split('T')[0]} (${currentLessons} lessons)`)
      console.log(`  Fixed:   ${correctData.startDate.toISOString().split('T')[0]} → ${correctData.endDate.toISOString().split('T')[0]} (${correctData.lessons} lessons)`)
      
      // Update the unit
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          startDate: correctData.startDate,
          endDate: correctData.endDate,
          estimatedHours: correctData.lessons, // Using lessons as hours for consistency
          keyVocabulary: {
            ...currentKeyVocab,
            totalLessons: correctData.lessons,
            month: correctData.month,
            schoolDays: correctData.schoolDays
          }
        }
      })
      
      console.log(`  ✅ Updated\n`)
    }
    
    // Verify the fixes
    console.log('VERIFICATION:')
    console.log('=============')
    
    const updatedUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    
    let verifiedTotal = 0
    let previousEndDate: Date | null = null
    
    for (const unit of updatedUnits) {
      const keyVocab = unit.keyVocabulary as any
      const lessons = keyVocab?.totalLessons || 0
      verifiedTotal += lessons
      
      // Check for gaps
      if (previousEndDate) {
        const gapDays = Math.floor((unit.startDate.getTime() - previousEndDate.getTime()) / (1000 * 60 * 60 * 24)) - 1
        if (gapDays > 2 && gapDays !== 15 && gapDays !== 5) { // Allow for Christmas and March breaks
          console.log(`⚠️ Gap of ${gapDays} days before ${unit.title}`)
        }
      }
      
      previousEndDate = unit.endDate
    }
    
    console.log(`\nTotal lessons after fix: ${verifiedTotal}`)
    console.log(`Target: 195 lessons`)
    console.log(`Status: ${verifiedTotal === 195 ? '✅ PERFECT' : '❌ NEEDS ADJUSTMENT'}\n`)
    
    if (verifiedTotal === 195) {
      console.log('🎉 Phase 1 Complete: All units have correct dates and lesson counts!')
    } else {
      console.log(`❌ Need to adjust by ${195 - verifiedTotal} lessons`)
    }
    
  } catch (error) {
    console.error('💥 Error fixing units:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the fix
fixUnitsDateAndLessons()
  .then(() => {
    console.log('✅ Date and lesson count fixes complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  })