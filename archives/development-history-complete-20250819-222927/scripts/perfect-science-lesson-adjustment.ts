#!/usr/bin/env npx tsx

/**
 * PHASE 3A: Perfect Lesson Count Adjustment
 * 
 * Current total: 188 lessons
 * Required total: 195 lessons  
 * Adjustment needed: +7 lessons
 * 
 * Strategy: Add 1 lesson to each of 7 units to reach exactly 195 lessons
 * while maintaining optimal unit lengths (15-21 lessons per unit)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function adjustLessonCounts() {
  console.log('🔢 PHASE 3A: Adjusting lesson counts to reach exactly 195 lessons...')
  
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
    
    console.log(`📋 Found ${scienceUnits.length} Science units`)
    
    // Units to adjust (+1 lesson each) - spread across the year
    const unitsToAdjust = [
      0, // September unit: 15 → 16 lessons
      2, // November unit: 19 → 20 lessons  
      4, // January unit: 20 → 21 lessons
      6, // March unit: 20 → 21 lessons
      7, // April unit: 20 → 21 lessons
      8, // May unit: 20 → 21 lessons
      9  // June unit: 19 → 20 lessons
    ]
    
    let totalAdjustments = 0
    
    for (const unitIndex of unitsToAdjust) {
      const unit = scienceUnits[unitIndex]
      if (!unit) continue
      
      // Get current lesson count from keyVocabulary
      const currentKeyVocab = unit.keyVocabulary as any
      const currentLessons = currentKeyVocab?.totalLessons || 0
      const newLessons = currentLessons + 1
      const newEstimatedHours = newLessons  // 1 lesson = 45 minutes = 0.75 hours, but using lesson count for simplicity
      
      // Update the unit
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          estimatedHours: newEstimatedHours,
          keyVocabulary: {
            ...currentKeyVocab,
            totalLessons: newLessons
          }
        }
      })
      
      totalAdjustments++
      console.log(`  ✅ Adjusted "${unit.title}": ${currentLessons} → ${newLessons} lessons`)
    }
    
    // Verify final count
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
    
    let finalTotalLessons = 0
    console.log('\n📊 Final lesson distribution:')
    for (const unit of updatedUnits) {
      const keyVocab = unit.keyVocabulary as any
      const lessons = keyVocab?.totalLessons || 0
      finalTotalLessons += lessons
      const month = keyVocab?.month || 'unknown'
      console.log(`  ${month}: ${lessons} lessons - "${unit.title}"`)
    }
    
    console.log('')
    console.log('🎯 PERFECT LESSON COUNT ACHIEVED:')
    console.log(`  • Total lessons: ${finalTotalLessons}`)
    console.log(`  • Target lessons: 195`)
    console.log(`  • Status: ${finalTotalLessons === 195 ? '✅ PERFECT' : '❌ NEEDS ADJUSTMENT'}`)
    console.log(`  • Adjustments made: ${totalAdjustments} units`)
    
    if (finalTotalLessons === 195) {
      console.log('✅ PHASE 3A COMPLETE: Exact 195 lesson count achieved!')
    } else {
      console.log(`❌ PHASE 3A INCOMPLETE: Need ${195 - finalTotalLessons} more lessons`)
    }
    
  } catch (error) {
    console.error('💥 Lesson adjustment failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute lesson count adjustment
adjustLessonCounts()
  .then(() => {
    console.log('🎉 Lesson count adjustment complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Lesson adjustment failed:', error)
    process.exit(1)
  })