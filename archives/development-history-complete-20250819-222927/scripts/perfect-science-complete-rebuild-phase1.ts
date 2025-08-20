#!/usr/bin/env npx tsx

/**
 * PHASE 1: Complete Demolition of Flawed Science Units
 * 
 * Despite achieving 100% script validation, manual review revealed fundamental pedagogical flaws:
 * - December coverage gap (14 missing school days)
 * - Cognitive inappropriateness (energy concepts too early for November)
 * - Unit lengths too long (most 4+ weeks, Grade 1 needs 2-3 weeks max)
 * - Calendar timing chaos (2 units starting in January)
 * 
 * This script completely removes all existing Science units and lessons for Emily McIsaac
 * to enable complete reconstruction with proper Grade 1 pedagogical principles.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function demolishFlawedScienceUnits() {
  console.log('🔥 PHASE 1: Complete demolition of flawed Science units...')
  
  try {
    // Find Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    })
    
    if (!emily) {
      throw new Error('Emily McIsaac account not found')
    }
    
    console.log(`📧 Found Emily McIsaac: ${emily.email}`)
    
    // Find all Science units for Emily (through LongRangePlan relationship)
    const scienceUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      },
      include: {
        lessonPlans: true,
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        }
      }
    })
    
    console.log(`🔬 Found ${scienceUnits.length} Science units`)
    
    let totalLessonsToDelete = 0
    for (const unit of scienceUnits) {
      console.log(`📋 Unit: "${unit.title}" - ${unit.lessonPlans.length} lessons`)
      totalLessonsToDelete += unit.lessonPlans.length
    }
    
    console.log(`📊 Total lessons to delete: ${totalLessonsToDelete}`)
    
    // Delete all lessons first (due to foreign key constraints)
    console.log('🗑️ Deleting all Science lessons...')
    for (const unit of scienceUnits) {
      await prisma.eTFOLessonPlan.deleteMany({
        where: {
          unitPlanId: unit.id
        }
      })
      console.log(`  ✅ Deleted ${unit.lessonPlans.length} lessons from "${unit.title}"`)
    }
    
    // Delete all Science units
    console.log('🗑️ Deleting all Science units...')
    const deletedUnits = await prisma.unitPlan.deleteMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    })
    
    console.log(`✅ Deleted ${deletedUnits.count} Science units`)
    
    // Verify complete demolition
    const remainingUnits = await prisma.unitPlan.count({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
    })
    
    const remainingLessons = await prisma.eTFOLessonPlan.count({
      where: {
        userId: emily.id,
        subject: 'Sciences de la nature'
      }
    })
    
    console.log('🔍 Demolition verification:')
    console.log(`  Science units remaining: ${remainingUnits}`)
    console.log(`  Science lessons remaining: ${remainingLessons}`)
    
    if (remainingUnits === 0 && remainingLessons === 0) {
      console.log('💥 DEMOLITION COMPLETE: Clean slate ready for reconstruction')
      console.log('')
      console.log('📋 Summary:')
      console.log(`  • Deleted: ${deletedUnits.count} flawed Science units`)
      console.log(`  • Deleted: ${totalLessonsToDelete} flawed Science lessons`)
      console.log('  • Status: Ready for PHASE 2 (Perfect reconstruction)')
    } else {
      console.log('❌ DEMOLITION INCOMPLETE - some data remains')
    }
    
  } catch (error) {
    console.error('💥 Demolition failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute demolition
demolishFlawedScienceUnits()
  .then(() => {
    console.log('🎯 PHASE 1 COMPLETE: Ready for perfect reconstruction')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 PHASE 1 FAILED:', error)
    process.exit(1)
  })